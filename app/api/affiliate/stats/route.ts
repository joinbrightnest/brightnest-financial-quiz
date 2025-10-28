import { NextRequest, NextResponse } from "next/server";
import { CallOutcome } from "@prisma/client";
import { calculateLeadsByCode, calculateLeadsWithDateRange } from "@/lib/lead-calculation";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!JWT_SECRET) {
      console.error("FATAL: JWT_SECRET or NEXTAUTH_SECRET environment variable is required");
      return NextResponse.json(
        { error: "Authentication configuration error" },
        { status: 500 }
      );
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    if (!decoded || !decoded.affiliateId) {
      return NextResponse.json(
        { error: "Invalid token: missing affiliateId" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get("dateRange") || "30d";

    // Calculate date filter
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case "all":
        startDate = new Date(0); // All time
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days
    }

    // Get affiliate data (without includes to avoid issues)
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: decoded.affiliateId },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Get related data separately with error handling
    let clicks: any[] = [];
    let conversions: any[] = [];
    let payouts: any[] = [];
    
    // Calculate end date based on date range
    let endDate: Date | undefined;
    switch (dateRange) {
      case "24h":
        endDate = new Date(now.getTime());
        break;
      case "7d":
        endDate = new Date(now.getTime());
        break;
      case "30d":
        endDate = new Date(now.getTime());
        break;
      case "90d":
        endDate = new Date(now.getTime());
        break;
      case "1y":
        endDate = new Date(now.getTime());
        break;
      case "all":
        endDate = undefined; // No upper bound for all time
        break;
      default:
        endDate = new Date(now.getTime());
    }
    
    try {

      [clicks, conversions, payouts] = await Promise.all([
        prisma.affiliateClick.findMany({
          where: {
            affiliateId: affiliate.id,
            createdAt: endDate ? {
              gte: startDate,
              lte: endDate,
            } : {
              gte: startDate,
            },
          },
        }).catch(() => []),
        prisma.affiliateConversion.findMany({
          where: {
            affiliateId: affiliate.id,
            createdAt: endDate ? {
              gte: startDate,
              lte: endDate,
            } : {
              gte: startDate,
            },
          },
        }).catch(() => []),
        prisma.affiliatePayout.findMany({
          where: {
            affiliateId: affiliate.id,
            createdAt: endDate ? {
              gte: startDate,
              lte: endDate,
            } : {
              gte: startDate,
            },
          },
        }).catch(() => []),
      ]);
    } catch (error) {
      console.error("Error fetching related data:", error);
      // Continue with empty arrays if related data fails
    }

    // Combine the data
    const affiliateWithData = {
      ...affiliate,
      clicks,
      conversions,
      payouts,
    };

    // Calculate stats from conversions - single source of truth
    const totalClicks = affiliateWithData.clicks.length;
    
    // Use centralized lead calculation for consistency
    const leadsData = await calculateLeadsWithDateRange(
      startDate,
      endDate || now,
      undefined,
      affiliate.referralCode
    );
    const totalLeads = leadsData.totalLeads;
    
    const totalBookings = affiliateWithData.conversions.filter(c => c.conversionType === "booking").length;
    
    // Count sales from AffiliateConversion records (SAME as admin API line 118)
    // This matches the admin API's approach exactly
    const totalSales = affiliateWithData.conversions.filter(c => c.conversionType === "sale").length;
    const conversionRate = totalClicks > 0 ? (totalSales / totalClicks) * 100 : 0;

    // Calculate pending and paid commissions from filtered payouts
    const pendingCommission = affiliateWithData.payouts
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + Number(p.amountDue || 0), 0);
    
    const paidCommission = affiliateWithData.payouts
      .filter(p => p.status === "completed")
      .reduce((sum, p) => sum + Number(p.amountDue || 0), 0);

    // Generate daily stats based on actual data
    const dailyStats = await generateDailyStatsWithRealData(affiliate.referralCode, dateRange);
    
    // Calculate date-filtered commission from daily stats (for graph)
    const dateFilteredCommission = dailyStats.reduce((sum, day) => sum + day.commission, 0);
    
    // For the main dashboard card, use the stored total commission (all-time) - SAME as admin API
    // This ensures commission shows immediately when deals are closed
    const totalCommission = Number(affiliate.totalCommission || 0);

    const stats = {
      totalClicks,
      totalLeads,
      totalBookings,
      totalSales,
      totalCommission, // Use stored all-time commission (SAME as admin API)
      conversionRate,
      averageSaleValue: totalSales > 0 ? totalCommission / totalSales : 0,
      pendingCommission,
      paidCommission,
      dailyStats, // Graph uses date-filtered commission from here
    };

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error("Affiliate stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

async function generateDailyStatsWithRealData(affiliateCode: string, dateRange: string) {
  const now = new Date();
  let days: number;
  let startDate: Date;
  let endDate: Date | undefined;
  let useHourly: boolean = false;
  
  switch (dateRange) {
    case "24h":
      days = 1;
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      endDate = new Date(now);
      useHourly = true; // Use hourly breakdown for last 24 hours
      break;
    case "7d":
      days = 7;
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      endDate = new Date(now);
      break;
    case "30d":
      days = 30;
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      endDate = new Date(now);
      break;
    case "90d":
      days = 90;
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      endDate = new Date(now);
      break;
    case "1y":
      days = 365;
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      endDate = new Date(now);
      break;
    case "all":
      // Show last 90 days for "all time" to keep it manageable
      days = 90;
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      endDate = new Date(now);
      break;
    default:
      days = 30;
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      endDate = new Date(now);
  }
  
  const data = [];

  // Get affiliate info for commission rate
  const affiliate = await prisma.affiliate.findUnique({
    where: { referralCode: affiliateCode },
  });

  if (!affiliate) {
    return [];
  }

  // Fetch all data for the entire date range at once for better performance
  // Use the endDate which is calculated based on the date range
  const rangeEnd = endDate;
  
  // IMPORTANT: Fetch ALL appointments (no date filter) - SAME as admin API
  // The date filtering happens later in the function for each data point
  // This is the single source of truth for commission calculations
  const [allClicks, allConversions, allConvertedAppointments] = await Promise.all([
    prisma.affiliateClick.findMany({
      where: {
        affiliate: { referralCode: affiliateCode },
        createdAt: {
          gte: startDate,
          lte: rangeEnd,
        },
      },
    }),
    prisma.affiliateConversion.findMany({
      where: {
        affiliate: { referralCode: affiliateCode },
        createdAt: {
          gte: startDate,
          lte: rangeEnd,
        },
      },
    }),
    // Fetch ALL converted appointments (no date filter) - SAME as admin API approach
    prisma.appointment.findMany({
      where: {
        affiliateCode: affiliateCode,
        outcome: 'converted', // Only converted appointments generate commission
      },
    }).catch((error) => {
      console.error('Error fetching converted appointments:', error);
      return [];
    })
  ]);

  // Get bookings from conversions for the chart
  const bookingConversions = allConversions.filter(c => c.conversionType === "booking");

  // If using hourly breakdown (for single-day ranges)
  if (useHourly) {
    // For "Last 24 hours", we need to go back 24 hours from now, not use a specific day
    for (let i = 23; i >= 0; i--) {
      // Calculate the timestamp for each of the last 24 hours (going backwards from now)
      const hourTimestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourStart = new Date(hourTimestamp);
      hourStart.setMinutes(0, 0, 0);
      const hourEnd = new Date(hourTimestamp);
      hourEnd.setMinutes(59, 59, 999);
      
      const hourLabel = `${hourTimestamp.getHours().toString().padStart(2, '0')}:00`;
      
      // Filter data for this specific hour using proper time ranges
      const hourClicks = allClicks.filter(c => {
        const clickDate = new Date(c.createdAt);
        return clickDate >= hourStart && clickDate <= hourEnd;
      });
      
      const hourBookings = bookingConversions.filter(c => {
        const convDate = new Date(c.createdAt);
        return convDate >= hourStart && convDate <= hourEnd;
      });
      
      // Filter converted appointments for this specific hour (SAME as admin API)
      const hourAppointments = allConvertedAppointments.filter(apt => {
        const aptDate = new Date(apt.createdAt);
        return aptDate >= hourStart && aptDate <= hourEnd;
      });

      // Calculate commission from appointments (SAME formula as admin API)
      const hourCommission = hourAppointments.reduce((sum, apt) => {
        const saleValue = Number(apt.saleValue || 0);
        return sum + (saleValue * Number(affiliate.commissionRate));
      }, 0);

      // Calculate real leads for this specific hour
      const hourLeadData = await calculateLeadsWithDateRange(hourStart, hourEnd, undefined, affiliateCode);
      
      data.push({
        date: hourLabel,
        clicks: hourClicks.length,
        leads: hourLeadData.totalLeads,
        bookedCalls: hourBookings.length,
        commission: hourCommission,
      });
    }
  } else {
    // Use daily breakdown for multi-day ranges
    // Iterate through days from startDate backwards (7d goes back 7 days from now)
    for (let i = 0; i < days; i++) {
      const daysAgo = days - 1 - i; // Count backwards from most recent day
      const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      // Don't go beyond the current time
      if (dayEnd > now) {
        dayEnd.setTime(now.getTime());
      }
      
      const dateStr = date.toISOString().split('T')[0];
      
      // Filter data for this specific day using time ranges
      const dayClicks = allClicks.filter(c => {
        const clickDate = new Date(c.createdAt);
        return clickDate >= dayStart && clickDate <= dayEnd;
      });
      
      const dayBookings = bookingConversions.filter(c => {
        const bookingDate = new Date(c.createdAt);
        return bookingDate >= dayStart && bookingDate <= dayEnd;
      });
      
      // Filter converted appointments for this specific day (SAME as admin API)
      const dayAppointments = allConvertedAppointments.filter(apt => {
        const aptDate = new Date(apt.createdAt);
        return aptDate >= dayStart && aptDate <= dayEnd;
      });

      // Calculate commission from appointments (SAME formula as admin API)
      const dayCommission = dayAppointments.reduce((sum, apt) => {
        const saleValue = Number(apt.saleValue || 0);
        return sum + (saleValue * Number(affiliate.commissionRate));
      }, 0);

      // Calculate real leads for this specific day
      const dayLeadData = await calculateLeadsWithDateRange(dayStart, dayEnd, undefined, affiliateCode);
      
      data.push({
        date: dateStr,
        clicks: dayClicks.length,
        leads: dayLeadData.totalLeads,
        bookedCalls: dayBookings.length,
        commission: dayCommission,
      });
    }
  }

  return data;
}
