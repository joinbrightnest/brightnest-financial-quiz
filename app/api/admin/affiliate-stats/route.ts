import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, CallOutcome } from "@prisma/client";
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
    
    const [clicks, conversions, quizSessions] = await Promise.all([
      prisma.affiliateClick.findMany({
        where: { affiliateId: affiliate.id },
        orderBy: { createdAt: "desc" },
        take: 10
      }),
      prisma.affiliateConversion.findMany({
        where: { affiliateId: affiliate.id },
        orderBy: { createdAt: "desc" },
        take: 10
      }),
      prisma.quizSession.findMany({
        where: { affiliateCode: affiliateCode },
        orderBy: { createdAt: "desc" },
        take: 10
      })
    ]);

    // Generate daily stats from real data using centralized lead calculation
    const dailyStats = await generateDailyStatsFromRealData(clicks, conversions, dateRange, affiliateCode);
    
    // Calculate totals from dailyStats to ensure timeframe consistency
    const totalClicks = dailyStats.reduce((sum, day) => sum + day.clicks, 0);
    const totalLeads = dailyStats.reduce((sum, day) => sum + day.leads, 0);
    const totalBookings = dailyStats.reduce((sum, day) => sum + day.bookedCalls, 0);
    const totalCommission = dailyStats.reduce((sum, day) => sum + day.commission, 0);
    
    console.log("Admin API Commission Debug:", {
      affiliateCode,
      dateRange,
      dailyStatsLength: dailyStats.length,
      dailyStatsCommissions: dailyStats.map(d => ({ date: d.date, commission: d.commission })),
      totalCommission
    });
    const totalQuizStarts = totalLeads; // Using leads as quiz starts for consistency
    const totalSales = totalBookings; // Using bookings as sales for consistency
    const conversionRate = totalClicks > 0 ? (totalBookings / totalClicks) * 100 : 0;
    
    // Generate conversion funnel data
    const conversionFunnel = [
      {
        stage: "Clicks",
        count: totalClicks,
        percentage: 100
      },
      {
        stage: "Leads",
        count: totalLeads,
        percentage: totalClicks > 0 ? (totalLeads / totalClicks) * 100 : 0
      },
      {
        stage: "Booked Calls",
        count: totalBookings,
        percentage: totalClicks > 0 ? (totalBookings / totalClicks) * 100 : 0
      },
      {
        stage: "Sales",
        count: totalSales,
        percentage: totalClicks > 0 ? (totalSales / totalClicks) * 100 : 0
      }
    ];

    // Generate traffic sources from real UTM data
    const trafficSources = generateTrafficSourcesFromRealData(clicks);

    // Generate recent activity data from conversions and appointments
    const recentActivity = [];
    
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

    return NextResponse.json(affiliateData);

  } catch (error) {
    console.error("Error fetching affiliate data:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Failed to fetch affiliate data" },
      { status: 500 }
    );
  }
}

async function generateDailyStatsFromRealData(clicks: any[], conversions: any[], dateRange: string, affiliateCode: string) {
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
  
  // Fetch all appointments data once for the entire date range to optimize performance
  const allAppointments = await prisma.appointment.findMany({
    where: {
      affiliateCode: affiliateCode,
      updatedAt: {
        gte: new Date(Math.min(...[today, yesterday, startOfWeek, startOfMonth].map(d => d.getTime()))),
        lte: new Date(Math.max(...[today, yesterday, startOfWeek, startOfMonth].map(d => d.getTime()))),
      },
    },
  }).catch((error) => {
    console.error('Error fetching appointments:', error);
    return [];
  });

  // Filter for converted appointments
  const convertedAppointments = allAppointments.filter(apt => apt.outcome === 'converted');

  // Fetch all leads data once for the entire date range to optimize performance
  const allLeadsData = await calculateLeadsWithDateRange(
    new Date(Math.min(...[today, yesterday, startOfWeek, startOfMonth].map(d => d.getTime()))),
    new Date(Math.max(...[today, yesterday, startOfWeek, startOfMonth].map(d => d.getTime()))),
    undefined,
    affiliateCode
  );

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
        days = Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
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

    // Fetch all appointments for the entire date range at once for better performance
    const rangeEnd = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
    const allAppointments = await prisma.appointment.findMany({
      where: {
        affiliateCode: affiliateCode,
        updatedAt: {
          gte: startDate,
          lte: rangeEnd,
        },
      },
    }).catch((error) => {
      console.error('Error fetching appointments:', error);
      return [];
    });

    // Filter for converted appointments
    const convertedAppointments = allAppointments.filter(apt => apt.outcome === 'converted');

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
  
  // If affiliate has commission but no appointments found, distribute it across active days
  const totalCommissionFromAppointments = stats.reduce((sum, stat) => sum + stat.commission, 0);
  if (totalCommissionFromAppointments === 0 && Number(affiliate.totalCommission) > 0) {
    const activeDays = stats.filter(stat => stat.clicks > 0 || stat.bookedCalls > 0);
    if (activeDays.length > 0) {
      const commissionPerDay = Number(affiliate.totalCommission) / activeDays.length;
      stats.forEach(stat => {
        if (stat.clicks > 0 || stat.bookedCalls > 0) {
          stat.commission = commissionPerDay;
        }
      });
    }
  }
  
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
