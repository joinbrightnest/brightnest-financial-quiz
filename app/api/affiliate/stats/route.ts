import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, CallOutcome } from "@prisma/client";
import { calculateLeadsByCode, calculateLeadsWithDateRange } from "@/lib/lead-calculation";

const prisma = new PrismaClient();

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
    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token format" },
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
    
    try {
      [clicks, conversions, payouts] = await Promise.all([
        prisma.affiliateClick.findMany({
          where: {
            affiliateId: affiliate.id,
            createdAt: {
              gte: startDate,
            },
          },
        }).catch(() => []),
        prisma.affiliateConversion.findMany({
          where: {
            affiliateId: affiliate.id,
            createdAt: {
              gte: startDate,
            },
          },
        }).catch(() => []),
        prisma.affiliatePayout.findMany({
          where: {
            affiliateId: affiliate.id,
            createdAt: {
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

    // Fetch appointments separately to calculate totalSales
    // Sales should be counted based on when the closer closed the sale (updatedAt when outcome = converted)
    const allAppointments = await prisma.appointment.findMany({
      where: {
        affiliateCode: affiliate.referralCode,
        outcome: 'converted', // Only get already-converted appointments
        updatedAt: {
          gte: startDate,
        },
        saleValue: { not: null } // Only appointments with actual sales
      },
    }).catch(() => []);

    // Filter for converted appointments
    const convertedAppointments = allAppointments;

    // Calculate stats using centralized lead calculation
    const totalClicks = affiliateWithData.clicks.length;
    const leadData = await calculateLeadsByCode(affiliate.referralCode, dateRange);
    const totalLeads = leadData.totalLeads;
    const totalBookings = affiliateWithData.conversions.filter(c => c.conversionType === "booking").length;
    
    // Count sales from appointments (converted appointments), not from affiliate_conversions
    const totalSales = convertedAppointments.length;
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
    
    // Calculate date-filtered commission from daily stats
    const calculatedTotalCommission = dailyStats.reduce((sum, day) => sum + day.commission, 0);

    const stats = {
      totalClicks,
      totalLeads,
      totalBookings,
      totalSales,
      totalCommission: calculatedTotalCommission, // Use date-filtered commission
      conversionRate,
      averageSaleValue: totalSales > 0 ? calculatedTotalCommission / totalSales : 0,
      pendingCommission,
      paidCommission,
      dailyStats,
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
  
  const [allClicks, allConversions, allSaleConversions] = await Promise.all([
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
    prisma.affiliateConversion.findMany({
      where: {
        affiliate: { referralCode: affiliateCode },
        conversionType: "sale",
        createdAt: {
          gte: startDate,
          lte: rangeEnd,
        },
      },
    }).catch((error) => {
      console.error('Error fetching sale conversions:', error);
      return [];
    })
  ]);

  // Get bookings from conversions for the chart
  const bookingConversions = allConversions.filter(c => c.conversionType === "booking");

  // If using hourly breakdown (for single-day ranges)
  if (useHourly) {
    // Get the date string for the specific day we're looking at (today or yesterday)
    const targetDateStr = startDate.toISOString().split('T')[0];
    
    for (let hour = 0; hour < 24; hour++) {
      const hourStart = new Date(startDate);
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date(startDate);
      hourEnd.setHours(hour, 59, 59, 999);
      const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
      
      // Filter data for this specific hour AND date
      const hourClicks = allClicks.filter(c => {
        const clickDate = new Date(c.createdAt);
        const clickDateStr = clickDate.toISOString().split('T')[0];
        const clickHour = clickDate.getHours();
        return clickDateStr === targetDateStr && clickHour === hour;
      });
      const hourConversions = allConversions.filter(c => {
        const convDate = new Date(c.createdAt);
        const convDateStr = convDate.toISOString().split('T')[0];
        const convHour = convDate.getHours();
        return convDateStr === targetDateStr && convHour === hour;
      });
      const hourSales = allSaleConversions.filter(sale => {
        const saleDate = new Date(sale.createdAt);
        const saleDateStr = saleDate.toISOString().split('T')[0];
        const saleHour = saleDate.getHours();
        return saleDateStr === targetDateStr && saleHour === hour;
      });

      // Calculate commission from sale conversions (actual commission amounts)
      const hourCommission = hourSales.reduce((sum, sale) => {
        return sum + Number(sale.commissionAmount || 0);
      }, 0);

      // Calculate real leads for this specific hour
      const hourLeadData = await calculateLeadsWithDateRange(hourStart, hourEnd, undefined, affiliateCode);
      
      data.push({
        date: hourLabel,
        clicks: hourClicks.length,
        leads: hourLeadData.totalLeads,
        bookedCalls: hourConversions.length,
        commission: hourCommission,
      });
    }
  } else {
    // Use daily breakdown for multi-day ranges
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      const dateStr = date.toISOString().split('T')[0];
      
      // Filter data for this specific day
      const dayClicks = allClicks.filter(c => c.createdAt.toISOString().split('T')[0] === dateStr);
      const dayBookings = bookingConversions.filter(c => c.createdAt.toISOString().split('T')[0] === dateStr);
      const daySales = allSaleConversions.filter(sale => sale.createdAt.toISOString().split('T')[0] === dateStr);

      // Calculate commission from sale conversions (actual commission amounts)
      const dayCommission = daySales.reduce((sum, sale) => {
        return sum + Number(sale.commissionAmount || 0);
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
