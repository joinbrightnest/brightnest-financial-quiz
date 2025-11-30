import { NextRequest, NextResponse } from "next/server";
import { calculateLeadsByCode, calculateLeadsWithDateRange } from "@/lib/lead-calculation";
import { verifyAdminAuth } from "@/lib/admin-auth-server";
import { prisma } from "@/lib/prisma";
import { AffiliateClick, AffiliateConversion, Appointment, QuizSession, Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin authentication required" },
      { status: 401 }
    );
  }

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

    console.log("🚀 ADMIN AFFILIATE-STATS API CALLED - affiliateCode:", affiliateCode, "dateRange:", dateRange);

    // Calculate date filter for consistency with individual affiliate API
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

    // Set upper bound for date filtering (current time)
    const endDate = new Date();

    const [clicks, conversions, quizSessions] = await Promise.all([
      prisma.affiliateClick.findMany({
        where: {
          affiliateId: affiliate.id,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.affiliateConversion.findMany({
        where: {
          affiliateId: affiliate.id,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.quizSession.findMany({
        where: {
          affiliateCode: affiliateCode,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { createdAt: "desc" }
      })
    ]);

    // Calculate stats using the SAME logic as individual affiliate API for consistency
    const totalClicks = clicks.length;

    // Calculate Total Leads using centralized lead calculation (same as graph)
    const leadData = await calculateLeadsByCode(affiliateCode, dateRange);
    const totalLeads = leadData.totalLeads;
    const totalBookings = conversions.filter(c => c.conversionType === "booking").length;
    const totalSales = conversions.filter(c => c.conversionType === "sale").length;

    // Fetch ALL appointments for this affiliate once
    const allAffiliateAppointments = await prisma.appointment.findMany({
      where: {
        affiliateCode: affiliate.referralCode,
      },
    }).catch(() => []);

    // Filter for converted appointments in JavaScript
    const dateFilteredAppointments = allAffiliateAppointments.filter(apt =>
      apt.outcome === 'converted'
    );

    // Get all converted appointments (same as dateFiltered since we removed date filtering)
    const allConvertedAppointments = dateFilteredAppointments;

    // Generate daily stats from real data using centralized lead calculation
    // Pass the same appointment data and lead data to ensure consistency between card and graph
    const dailyStats = await generateDailyStatsFromRealData(clicks, conversions, dateRange, affiliateCode, dateFilteredAppointments, leadData);

    // Calculate commission from daily stats - this respects the selected date range
    const totalCommission = dailyStats.reduce((sum, day) => sum + day.commission, 0);

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

async function generateDailyStatsFromRealData(clicks: AffiliateClick[], conversions: AffiliateConversion[], dateRange: string, affiliateCode: string, cardAppointments?: Appointment[], preCalculatedLeadData?: { leads: Array<{ createdAt: string | Date }> }) {
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

      // Filter sale conversions for this specific hour (SOURCE OF TRUTH for commission)
      // CRITICAL: Use AffiliateConversion.createdAt (when conversion record was created = when deal CLOSED)
      // NOT Appointment.updatedAt (changes on ANY field update) or Appointment.createdAt (when call was booked)
      const hourSaleConversions = conversions.filter(c => {
        const closeDate = new Date(c.createdAt); // When the conversion was recorded
        return c.conversionType === 'sale' && closeDate >= hourStart && closeDate <= hourEnd;
      });

      // Calculate commission from sale conversion records
      const hourCommission = hourSaleConversions.reduce((sum, conv) => {
        const commissionAmount = Number(conv.commissionAmount || 0);
        return sum + commissionAmount;
      }, 0);

      // Filter leads data for this specific hour
      const hourLeads = allLeadsData.leads.filter((lead: Record<string, unknown>) => {
        const leadDate = new Date(lead.createdAt as string);
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

      // Filter sale conversions for this specific day (SOURCE OF TRUTH for commission)
      // CRITICAL: Use AffiliateConversion.createdAt (when conversion record was created = when deal CLOSED)
      // NOT Appointment.updatedAt (changes on ANY field update) or Appointment.createdAt (when call was booked)
      const daySaleConversions = conversions.filter(c => {
        const closeDate = new Date(c.createdAt); // When the conversion was recorded
        return c.conversionType === 'sale' && closeDate >= dayStart && closeDate <= dayEnd;
      });

      // Calculate commission from sale conversion records
      const dayCommission = daySaleConversions.reduce((sum, conv) => {
        const commissionAmount = Number(conv.commissionAmount || 0);
        return sum + commissionAmount;
      }, 0);

      // Filter leads data for this specific day
      const dayLeads = allLeadsData.leads.filter((lead: Record<string, unknown>) => {
        const leadDate = new Date(lead.createdAt as string);
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

function generateTrafficSourcesFromRealData(clicks: AffiliateClick[]) {
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

function generateConversionFunnelFromRealData(clicks: AffiliateClick[], conversions: AffiliateConversion[], quizSessions: QuizSession[], totalLeads: number) {
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
