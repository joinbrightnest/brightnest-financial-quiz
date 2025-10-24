import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { calculateLeadsByCode, calculateLeadsWithDateRange } from "@/lib/lead-calculation";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const affiliateCode = searchParams.get('affiliateCode');
  const dateRange = searchParams.get('dateRange') || 'month';

  if (!affiliateCode) {
    return NextResponse.json({ error: "Affiliate code is required" }, { status: 400 });
  }

  try {
    // First try to find by referral code
    let affiliate = await prisma.affiliate.findUnique({
      where: { referralCode: affiliateCode },
    });

    // If not found, try to find by custom tracking link
    if (!affiliate) {
      const affiliateResult = await prisma.$queryRaw`
        SELECT * FROM "affiliates" 
        WHERE "custom_tracking_link" = ${`/${affiliateCode}`}
        LIMIT 1
      `;
      
      affiliate = Array.isArray(affiliateResult) && affiliateResult.length > 0 
        ? affiliateResult[0] 
        : null;
    }

    if (!affiliate) {
      return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
    }
    
    // Calculate date filter for consistency with individual affiliate API
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "yesterday":
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
        break;
      case "week":
        const startOfWeek = new Date(now);
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startOfWeek.setDate(now.getDate() - daysToMonday);
        startDate = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate());
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "all":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [clicks, conversions, quizSessions] = await Promise.all([
      prisma.affiliateClick.findMany({
        where: { 
          affiliateId: affiliate.id,
          createdAt: { gte: startDate }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.affiliateConversion.findMany({
        where: { 
          affiliateId: affiliate.id,
          createdAt: { gte: startDate }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.quizSession.findMany({
        where: { 
          affiliateCode: affiliateCode,
          createdAt: { gte: startDate }
        },
        orderBy: { createdAt: "desc" }
      })
    ]);

    // Calculate stats using the SAME logic as individual affiliate API for consistency
    const totalClicks = clicks.length;
    
    // Calculate Total Leads from conversions (same method as other cards)
    // A lead is a quiz_completion conversion
    const totalLeads = conversions.filter(c => c.conversionType === "quiz_completion").length;
    const totalBookings = conversions.filter(c => c.conversionType === "booking").length;
    const totalSales = conversions.filter(c => c.conversionType === "sale").length;
    
    // Calculate date-filtered commission based on appointments (same as graph logic)
    const dateFilteredAppointments = await prisma.appointment.findMany({
      where: {
        affiliateCode: affiliate.referralCode,
        outcome: 'converted' as any,
        updatedAt: { gte: startDate },
      },
    }).catch(() => []);
    
    // Debug: Fetch ALL appointments for this affiliate (not just converted)
    const allAffiliateAppointments = await prisma.appointment.findMany({
      where: {
        affiliateCode: affiliate.referralCode,
      },
    }).catch(() => []);
    
    // Debug: Fetch ALL converted appointments to see dates
    // Try querying with string 'converted' directly instead of enum
    const allConvertedAppointments = await prisma.appointment.findMany({
      where: {
        affiliateCode: affiliate.referralCode,
        outcome: 'converted' as any,
      },
    }).catch(() => []);
    
    console.log('🔍 ALL appointments for affiliate (any outcome):', {
      affiliateCode: affiliate.referralCode,
      totalCount: allAffiliateAppointments.length,
      allAppointments: allAffiliateAppointments.map(apt => ({
        id: apt.id,
        outcome: apt.outcome,
        saleValue: apt.saleValue,
        affiliateCode: apt.affiliateCode,
        createdAt: new Date(apt.createdAt).toISOString().split('T')[0],
        updatedAt: new Date(apt.updatedAt).toISOString().split('T')[0]
      }))
    });
    
    console.log('🔍 ALL converted appointments for affiliate:', {
      affiliateCode: affiliate.referralCode,
      totalConverted: allConvertedAppointments.length,
      allAppointments: allConvertedAppointments.map(apt => ({
        id: apt.id,
        saleValue: apt.saleValue,
        createdAt: apt.createdAt,
        updatedAt: apt.updatedAt,
        createdAtDate: new Date(apt.createdAt).toISOString().split('T')[0],
        updatedAtDate: new Date(apt.updatedAt).toISOString().split('T')[0]
      }))
    });
    
    console.log('🔍 Date-filtered appointments for graph:', {
      dateRange,
      startDate: startDate.toISOString(),
      foundCount: dateFilteredAppointments.length,
      appointments: dateFilteredAppointments.map(apt => ({
        id: apt.id,
        saleValue: apt.saleValue,
        updatedAt: apt.updatedAt,
        updatedAtDate: new Date(apt.updatedAt).toISOString().split('T')[0]
      }))
    });
    
    const appointmentBasedCommission = dateFilteredAppointments.reduce((sum, apt) => {
      const saleValue = Number(apt.saleValue || 0);
      return sum + (saleValue * Number(affiliate.commissionRate));
    }, 0);
    
    // For the main dashboard card, use the stored total commission (all-time)
    // This ensures commission shows immediately when deals are closed
    const totalCommission = Number(affiliate.totalCommission || 0);
    
    // Keep the date-filtered commission for the graph
    const dateFilteredCommission = appointmentBasedCommission;
    
    // Generate daily stats from real data using centralized lead calculation
    // Pass the same appointment data to ensure consistency between card and graph
    const dailyStats = await generateDailyStatsFromRealData(clicks, conversions, dateRange, affiliateCode, dateFilteredAppointments);
    
    console.log("Admin API Commission Debug:", {
      affiliateCode,
      affiliateId: affiliate.id,
      affiliateReferralCode: affiliate.referralCode,
      dateRange,
      startDate: startDate.toISOString(),
      storedCommission: Number(affiliate.totalCommission || 0),
      dateFilteredCommission,
      appointmentBasedCommission,
      appointmentsFound: dateFilteredAppointments.length,
      appointments: dateFilteredAppointments.map(apt => ({
        id: apt.id,
        affiliateCode: apt.affiliateCode,
        saleValue: apt.saleValue,
        outcome: apt.outcome,
        updatedAt: apt.updatedAt?.toISOString(),
        calculatedCommission: Number(apt.saleValue || 0) * Number(affiliate.commissionRate)
      })),
      commissionRate: affiliate.commissionRate,
      dailyStatsLength: dailyStats.length,
      dailyStatsCommissions: dailyStats.map(d => ({ date: d.date, commission: d.commission })),
      totalCommission: totalCommission,
      usingStoredTotal: true
    });
    const totalQuizStarts = quizSessions.length; // Use actual quiz sessions count
    const conversionRate = totalClicks > 0 ? (totalBookings / totalClicks) * 100 : 0;
    
    // Generate conversion funnel data using the same logic as individual affiliate dashboard
    const conversionFunnel = generateConversionFunnelFromRealData(clicks, conversions, quizSessions, totalLeads);

    // Generate traffic sources from real UTM data
    const trafficSources = generateTrafficSourcesFromRealData(clicks);

    // Generate recent activity data from conversions and appointments
    const recentActivity: Array<{
      date: string;
      action: string;
      amount: number;
      commission: number;
    }> = [];
    
    // Add recent conversions
    conversions.slice(0, 5).forEach(conv => {
      recentActivity.push({
        date: conv.createdAt.toISOString(),
        action: `${conv.conversionType} conversion`,
        amount: conv.saleValue ? Number(conv.saleValue) : 0,
        commission: conv.saleValue ? Number(conv.saleValue) * Number(affiliate.commissionRate) : 0
      });
    });

    // Add recent clicks
    clicks.slice(0, 3).forEach(click => {
      recentActivity.push({
        date: click.createdAt.toISOString(),
        action: "Link clicked",
        amount: 0,
        commission: 0
      });
    });

    // Sort by date (most recent first) and limit to 10
    recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    recentActivity.splice(10);

    const affiliateData = {
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        tier: affiliate.tier,
        referralCode: affiliate.referralCode,
        customLink: affiliate.customLink || `https://joinbrightnest.com/${affiliate.referralCode}`,
        commissionRate: affiliate.commissionRate,
        totalClicks: affiliate.totalClicks,
        totalLeads: affiliate.totalLeads,
        totalBookings: affiliate.totalBookings,
        totalSales: affiliate.totalSales,
        totalCommission: affiliate.totalCommission,
        isApproved: affiliate.isApproved,
        createdAt: affiliate.createdAt,
        updatedAt: affiliate.updatedAt
      },
      stats: {
        totalClicks,
        totalQuizStarts,
        totalLeads,
        totalBookings,
        totalSales,
        totalCommission,
        conversionRate,
        averageSaleValue: totalSales > 0 ? Number(totalCommission) / totalSales : 0,
        pendingCommission: 0,
        paidCommission: 0,
        dailyStats,
        conversionFunnel,
        trafficSources,
        recentActivity
      },
      clicks: clicks.map((click) => ({
        id: click.id,
        createdAt: click.createdAt,
        ipAddress: click.ipAddress,
        userAgent: click.userAgent
      })),
      conversions: conversions.map((conv) => ({
        id: conv.id,
        conversionType: conv.conversionType,
        status: conv.status,
        createdAt: conv.createdAt,
        value: conv.saleValue
      }))
    };

    // Add debug info to response
    affiliateData.debug = {
      affiliateCode: affiliate.referralCode,
      allAppointmentsCount: allAffiliateAppointments.length,
      allAppointments: allAffiliateAppointments.map(apt => ({
        id: apt.id,
        outcome: apt.outcome,
        affiliateCode: apt.affiliateCode,
        saleValue: apt.saleValue ? Number(apt.saleValue) : null,
        createdAt: new Date(apt.createdAt).toISOString().split('T')[0],
        updatedAt: new Date(apt.updatedAt).toISOString().split('T')[0]
      })),
      allConvertedCount: allConvertedAppointments.length,
      dateFilteredCount: dateFilteredAppointments.length,
      allConvertedDates: allConvertedAppointments.map(apt => ({
        id: apt.id,
        createdAt: new Date(apt.createdAt).toISOString().split('T')[0],
        updatedAt: new Date(apt.updatedAt).toISOString().split('T')[0],
        saleValue: apt.saleValue
      })),
      dateFilteredDates: dateFilteredAppointments.map(apt => ({
        id: apt.id,
        updatedAt: new Date(apt.updatedAt).toISOString().split('T')[0],
        saleValue: apt.saleValue
      })),
      dateRange,
      startDate: startDate.toISOString().split('T')[0]
    };
    
    return NextResponse.json(affiliateData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error("Error fetching affiliate data:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: "Failed to fetch affiliate data", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

async function generateDailyStatsFromRealData(clicks: any[], conversions: any[], dateRange: string, affiliateCode: string, cardAppointments?: any[]) {
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
    console.log('📊 Graph appointments from card:', {
      totalPassed: cardAppointments.length,
      convertedCount: convertedAppointments.length,
      convertedAppointments: convertedAppointments.map(apt => ({
        id: apt.id,
        saleValue: apt.saleValue,
        outcome: apt.outcome,
        updatedAt: apt.updatedAt?.toISOString(),
        updatedAtDate: apt.updatedAt?.toISOString()?.split('T')[0]
      }))
    });
  } else {
    // Fallback: fetch appointments data for the correct date range
    allAppointments = await prisma.appointment.findMany({
      where: {
        affiliateCode: affiliateCode,
        updatedAt: {
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

  // Fetch all leads data once for the entire date range to optimize performance
  // Use the same date range as the total leads calculation for consistency
  const allLeadsData = await calculateLeadsByCode(affiliateCode, dateRange);

  if (dateRange === "today") {
    // For today, show hourly data for today
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    for (let hour = 0; hour < 24; hour++) {
      const hourStr = hour.toString().padStart(2, '0');
      
      const hourClicks = clicks.filter(c => {
        const clickDate = c.createdAt.toISOString().split('T')[0];
        const clickHour = c.createdAt.getHours().toString().padStart(2, '0');
        return clickDate === todayStr && clickHour === hourStr;
      });
      
      const hourConversions = conversions.filter(c => {
        const convDate = c.createdAt.toISOString().split('T')[0];
        const convHour = c.createdAt.getHours().toString().padStart(2, '0');
        return convDate === todayStr && convHour === hourStr;
      });
      
      // Filter appointments for this specific hour
      const hourAppointments = convertedAppointments.filter(apt => {
        const aptDate = apt.updatedAt.toISOString().split('T')[0];
        const aptHour = apt.updatedAt.getHours();
        return aptDate === todayStr && aptHour === hour;
      });

      // Calculate commission from appointments (actual sales)
      const hourCommission = hourAppointments.reduce((sum, apt) => {
        const saleValue = Number(apt.saleValue || 0);
        return sum + (saleValue * Number(affiliate.commissionRate));
      }, 0);
      
      // Filter leads data for this specific hour
      const hourLeads = allLeadsData.leads.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        const leadHour = leadDate.getHours();
        return leadDate.toISOString().split('T')[0] === todayStr && leadHour === hour;
      });
      
      stats.push({
        date: `${todayStr}T${hourStr}:00:00.000Z`,
        clicks: hourClicks.length,
        leads: hourLeads.length,
        bookedCalls: hourConversions.filter(c => c.conversionType === "booking").length,
        commission: hourCommission,
      });
    }
  } else if (dateRange === "yesterday") {
    // For yesterday, show hourly data for yesterday
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    for (let hour = 0; hour < 24; hour++) {
      const hourStr = hour.toString().padStart(2, '0');
      
      const hourClicks = clicks.filter(c => {
        const clickDate = c.createdAt.toISOString().split('T')[0];
        const clickHour = c.createdAt.getHours().toString().padStart(2, '0');
        return clickDate === yesterdayStr && clickHour === hourStr;
      });
      
      const hourConversions = conversions.filter(c => {
        const convDate = c.createdAt.toISOString().split('T')[0];
        const convHour = c.createdAt.getHours().toString().padStart(2, '0');
        return convDate === yesterdayStr && convHour === hourStr;
      });
      
      // Filter appointments for this specific hour
      const hourAppointments = convertedAppointments.filter(apt => {
        const aptDate = apt.updatedAt.toISOString().split('T')[0];
        const aptHour = apt.updatedAt.getHours();
        return aptDate === yesterdayStr && aptHour === hour;
      });

      // Calculate commission from appointments (actual sales)
      const hourCommission = hourAppointments.reduce((sum, apt) => {
        const saleValue = Number(apt.saleValue || 0);
        return sum + (saleValue * Number(affiliate.commissionRate));
      }, 0);
      
      // Filter leads data for this specific hour
      const hourLeads = allLeadsData.leads.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        const leadHour = leadDate.getHours();
        return leadDate.toISOString().split('T')[0] === yesterdayStr && leadHour === hour;
      });
      
      stats.push({
        date: `${yesterdayStr}T${hourStr}:00:00.000Z`,
        clicks: hourClicks.length,
        leads: hourLeads.length,
        bookedCalls: hourConversions.filter(c => c.conversionType === "booking").length,
        commission: hourCommission,
      });
    }
  } else {
    // For week, month, all time - show daily data
    const now = new Date();
    let days: number;
    let startDate: Date;
    
    switch (dateRange) {
      case "week":
        // Calculate days from start of week to today
        const startOfWeek = new Date(now);
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startOfWeek.setDate(now.getDate() - daysToMonday);
        startDate = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate());
        days = Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
        break;
      case "month":
        // Calculate days from start of month to today
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        // Set to start of day to avoid timezone issues
        startDate.setHours(0, 0, 0, 0);
        days = Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
        console.log("Month calculation:", { startDate, now, days });
        break;
      case "all":
        // Show last 90 days for "all time" to keep it manageable
        days = 90;
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        days = 30;
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Use the appointments already fetched above (passed from card calculation)

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayClicks = clicks.filter(c => c.createdAt.toISOString().split('T')[0] === dateStr);
      const dayConversions = conversions.filter(c => c.createdAt.toISOString().split('T')[0] === dateStr);
      
      // Filter appointments for this specific day
      const dayAppointments = convertedAppointments.filter(apt => {
        const aptDate = apt.updatedAt.toISOString().split('T')[0];
        return aptDate === dateStr;
      });

      // Calculate commission from appointments (actual sales)
      const dayCommission = dayAppointments.reduce((sum, apt) => {
        const saleValue = Number(apt.saleValue || 0);
        return sum + (saleValue * Number(affiliate.commissionRate));
      }, 0);
      
      if (dayAppointments.length > 0) {
        console.log(`📅 Day ${dateStr} has ${dayAppointments.length} appointments with commission $${dayCommission}`);
      }
      
      // Filter leads data for this specific day
      const dayLeads = allLeadsData.leads.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        return leadDate.toISOString().split('T')[0] === dateStr;
      });
      
      stats.push({
        date: dateStr,
        clicks: dayClicks.length,
        leads: dayLeads.length,
        bookedCalls: dayConversions.filter(c => c.conversionType === "booking").length,
        commission: dayCommission,
      });
    }
  }
  
  // Ensure graph commission matches card commission for consistency
  const totalCommissionFromAppointments = stats.reduce((sum, stat) => sum + stat.commission, 0);
  
  // The card now uses appointmentBasedCommission, so graph should match it
  // No need to adjust since both use the same calculation method
  
  return stats;
}

function generateTrafficSourcesFromRealData(clicks: any[]) {
  const sourceCounts: { [key: string]: number } = {};
  const totalClicks = clicks.length;

  clicks.forEach(click => {
    const source = click.utmSource || "Direct";
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  });

  return Object.entries(sourceCounts).map(([source, count]) => ({
    source,
    clicks: count,
    percentage: totalClicks > 0 ? (count / totalClicks) * 100 : 0,
  }));
}

function generateConversionFunnelFromRealData(clicks: any[], conversions: any[], quizSessions: any[], totalLeads: number) {
  const totalClicks = clicks.length;
  const quizStarts = quizSessions.length; // All quiz sessions represent quiz starts
  const quizCompletions = totalLeads; // Use the calculated total leads
  const bookings = conversions.filter(c => c.conversionType === "booking").length;
  
  return [
    { stage: "Clicks", count: totalClicks, percentage: 100 },
    { stage: "Quiz Starts", count: quizStarts, percentage: totalClicks > 0 ? (quizStarts / totalClicks) * 100 : 0 },
    { stage: "Quiz Completions", count: quizCompletions, percentage: totalClicks > 0 ? (quizCompletions / totalClicks) * 100 : 0 },
    { stage: "Booked Calls", count: bookings, percentage: totalClicks > 0 ? (bookings / totalClicks) * 100 : 0 },
  ];
}
