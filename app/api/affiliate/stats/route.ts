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

    // Set upper bound for date filtering (current time) - SAME as admin API line 76
    const endDate = new Date();
    
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
              lte: endDate,
            },
          },
        }).catch(() => []),
        prisma.affiliateConversion.findMany({
          where: {
            affiliateId: affiliate.id,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }).catch(() => []),
        prisma.affiliatePayout.findMany({
          where: {
            affiliateId: affiliate.id,
            createdAt: {
              gte: startDate,
              lte: endDate,
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

    // Calculate stats using the SAME logic as admin API for consistency
    const totalClicks = affiliateWithData.clicks.length;
    
    // Calculate Total Leads using centralized lead calculation (same as admin API line 115-116)
    const leadsData = await calculateLeadsByCode(affiliate.referralCode, dateRange);
    const totalLeads = leadsData.totalLeads;
    
    const totalBookings = affiliateWithData.conversions.filter(c => c.conversionType === "booking").length;
    
    // Count sales from AffiliateConversion records (SAME as admin API line 118)
    // This matches the admin API's approach exactly
    const totalSales = affiliateWithData.conversions.filter(c => c.conversionType === "sale").length;
    const conversionRate = totalClicks > 0 ? (totalSales / totalClicks) * 100 : 0;

    // Fetch ALL appointments for this affiliate (SAME as admin API line 121-125)
    const allAffiliateAppointments = await prisma.appointment.findMany({
      where: {
        affiliateCode: affiliate.referralCode,
      },
    }).catch(() => []);
    
    // Filter for converted appointments (SAME as admin API line 128-130)
    const dateFilteredAppointments = allAffiliateAppointments.filter(apt => 
      apt.outcome === 'converted'
    );

    // Calculate pending and paid commissions from filtered payouts
    const pendingCommission = affiliateWithData.payouts
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + Number(p.amountDue || 0), 0);
    
    const paidCommission = affiliateWithData.payouts
      .filter(p => p.status === "completed")
      .reduce((sum, p) => sum + Number(p.amountDue || 0), 0);

    // Generate daily stats from real data - SAME as admin API (line 149)
    // Pass the same appointment data and lead data to ensure consistency between card and graph
    const dailyStats = await generateDailyStatsFromRealData(
      affiliateWithData.clicks, 
      affiliateWithData.conversions, 
      dateRange, 
      affiliate.referralCode, 
      dateFilteredAppointments, 
      leadsData
    );
    
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

async function generateDailyStatsFromRealData(clicks: any[], conversions: any[], dateRange: string, affiliateCode: string, cardAppointments?: any[], preCalculatedLeadData?: any) {
  const stats = [];
  
  // Get affiliate info for commission rate
  const affiliate = await prisma.affiliate.findUnique({
    where: { referralCode: affiliateCode },
  });

  if (!affiliate) {
    return [];
  }
  
  // Calculate date ranges for optimization
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const startOfWeek = new Date(now);
  const dayOfWeek = now.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(now.getDate() - daysToMonday);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Use appointments passed from card calculation, or fetch if not provided
  let allAppointments, convertedAppointments;
  
  if (cardAppointments) {
    // Use the same appointments data as the card for consistency
    allAppointments = cardAppointments;
    convertedAppointments = cardAppointments.filter(apt => apt.outcome === 'converted');
  } else {
    // Fallback: fetch appointments data for the correct date range
    // Use createdAt instead of updatedAt to track when the appointment was originally created
    allAppointments = await prisma.appointment.findMany({
      where: {
        affiliateCode: affiliateCode,
        createdAt: {
          gte: dateRange === "today" ? today : 
               dateRange === "yesterday" ? yesterday :
               dateRange === "week" ? startOfWeek :
               dateRange === "month" ? startOfMonth :
               new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), // all time
          lte: now,
        },
      },
    }).catch((error) => {
      console.error('Error fetching appointments:', error);
      return [];
    });

    // Filter for converted appointments
    convertedAppointments = allAppointments.filter(apt => apt.outcome === 'converted');
  }

  // Use pre-calculated lead data if provided, otherwise fetch it
  const allLeadsData = preCalculatedLeadData || await calculateLeadsByCode(affiliateCode, dateRange);

  if (dateRange === "24h") {
    // For 24 hours, show hourly data for the last 24 hours
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const hourTimestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourStart = new Date(hourTimestamp);
      hourStart.setMinutes(0, 0, 0);
      const hourEnd = new Date(hourTimestamp);
      hourEnd.setMinutes(59, 59, 999);
      
      const hourLabel = `${hourTimestamp.getHours().toString().padStart(2, '0')}:00`;
      
      const hourClicks = clicks.filter(c => {
        const clickDate = new Date(c.createdAt);
        return clickDate >= hourStart && clickDate <= hourEnd;
      });
      
      const hourConversions = conversions.filter(c => {
        const convDate = new Date(c.createdAt);
        return convDate >= hourStart && convDate <= hourEnd;
      });
      
      // Filter appointments for this specific hour
      const hourAppointments = convertedAppointments.filter(apt => {
        const aptDate = new Date(apt.createdAt);
        return aptDate >= hourStart && aptDate <= hourEnd;
      });

      // Calculate commission from appointments (actual sales)
      const hourCommission = hourAppointments.reduce((sum, apt) => {
        const saleValue = Number(apt.saleValue || 0);
        return sum + (saleValue * Number(affiliate.commissionRate));
      }, 0);
      
      // Filter leads data for this specific hour
      const hourLeads = allLeadsData.leads.filter((lead: any) => {
        const leadDate = new Date(lead.createdAt);
        return leadDate >= hourStart && leadDate <= hourEnd;
      });
      
      stats.push({
        date: hourLabel,
        clicks: hourClicks.length,
        leads: hourLeads.length,
        bookedCalls: hourConversions.filter(c => c.conversionType === "booking").length,
        commission: hourCommission,
      });
    }
  } else {
    // For all other date ranges - show daily data
    const now = new Date();
    let days: number;
    
    switch (dateRange) {
      case "7d":
        days = 7;
        break;
      case "30d":
        days = 30;
        break;
      case "90d":
        days = 90;
        break;
      case "1y":
        days = 365;
        break;
      case "all":
        // Show last 90 days for "all time" to keep it manageable
        days = 90;
        break;
      default:
        days = 30;
    }

    console.log(`📅 Generating ${days} days of data for dateRange: ${dateRange}`);

    // Iterate through days from oldest to newest
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
      const dayClicks = clicks.filter(c => {
        const clickDate = new Date(c.createdAt);
        return clickDate >= dayStart && clickDate <= dayEnd;
      });
      
      const dayConversions = conversions.filter(c => {
        const convDate = new Date(c.createdAt);
        return convDate >= dayStart && convDate <= dayEnd;
      });
      
      // Filter appointments for this specific day
      const dayAppointments = convertedAppointments.filter(apt => {
        const aptDate = new Date(apt.createdAt);
        return aptDate >= dayStart && aptDate <= dayEnd;
      });

      // Calculate commission from appointments (actual sales)
      const dayCommission = dayAppointments.reduce((sum, apt) => {
        const saleValue = Number(apt.saleValue || 0);
        return sum + (saleValue * Number(affiliate.commissionRate));
      }, 0);
      
      // Filter leads data for this specific day
      const dayLeads = allLeadsData.leads.filter((lead: any) => {
        const leadDate = new Date(lead.createdAt);
        return leadDate >= dayStart && leadDate <= dayEnd;
      });
      
      const dayBookings = dayConversions.filter(c => c.conversionType === "booking");
      
      if (dayBookings.length > 0) {
        console.log(`📊 Day ${dateStr}: ${dayBookings.length} bookings`);
      }
      
      stats.push({
        date: dateStr,
        clicks: dayClicks.length,
        leads: dayLeads.length,
        bookedCalls: dayBookings.length,
        commission: dayCommission,
      });
    }
    
    console.log(`📈 Generated ${stats.length} data points, bookings in ${stats.filter(s => s.bookedCalls > 0).length} days`);
  }
  
  // Ensure graph commission matches card commission for consistency
  const totalCommissionFromAppointments = stats.reduce((sum, stat) => sum + stat.commission, 0);
  
  // The card now uses appointmentBasedCommission, so graph should match it
  // No need to adjust since both use the same calculation method
  
  return stats;
}
