import { NextRequest, NextResponse } from "next/server";
import { CallOutcome, AffiliateClick, AffiliateConversion, QuizSession, Appointment } from "@prisma/client";
import { calculateAffiliateLeads, calculateLeadsWithDateRange } from "@/lib/lead-calculation";
import { verifyAdminAuth } from "@/lib/admin-auth-server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin authentication required" },
      { status: 401 }
    );
  }

  try {
    const { id: affiliateId } = await params;
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get("dateRange") || "30d";

    console.log("🚀 ADMIN STATS API CALLED - affiliateId:", affiliateId, "dateRange:", dateRange);

    // Calculate date filter
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case "24h":
      case "1d": // Support both formats
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

    // Get affiliate data
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Set upper bound for date filtering (current time) - SAME as affiliate API
    const endDate = new Date();

    // Get related data with error handling
    let clicks: AffiliateClick[] = [];
    let conversions: AffiliateConversion[] = [];
    let quizSessions: QuizSession[] = [];
    let appointments: Appointment[] = [];

    try {
      [clicks, conversions, quizSessions, appointments] = await Promise.all([
        prisma.affiliateClick.findMany({
          where: {
            affiliateId: affiliate.id,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
        prisma.affiliateConversion.findMany({
          where: {
            affiliateId: affiliate.id,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
        prisma.quizSession.findMany({
          where: {
            affiliateCode: affiliate.referralCode,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
        prisma.appointment.findMany({
          where: {
            affiliateCode: affiliate.referralCode,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
      ]);

      // Debug logging
      console.log("📊 Admin Stats Debug:", {
        clicks: clicks.length,
        conversions: conversions.length,
        bookingConversions: conversions.filter(c => c.conversionType === "booking").length,
        quizSessions: quizSessions.length,
        appointments: appointments.length,
        appointmentDates: appointments.map(a => ({
          id: a.id,
          createdAt: a.createdAt,
          scheduledAt: a.scheduledAt,
          customerEmail: a.customerEmail
        })),
        bookingConversionDates: conversions
          .filter(c => c.conversionType === "booking")
          .map(c => ({
            id: c.id,
            createdAt: c.createdAt,
            type: c.conversionType
          }))
      });
    } catch (error) {
      console.error("Error fetching related data:", error);
      // Set empty arrays if there's an error
      clicks = [];
      conversions = [];
      quizSessions = [];
      appointments = [];
    }

    // Calculate stats from real data using centralized lead calculation
    const totalClicks = clicks.length;
    const leadData = await calculateAffiliateLeads(affiliateId, dateRange);
    const totalLeads = leadData.totalLeads;
    // Count bookings from conversions (matches affiliate dashboard logic)
    const totalBookings = conversions.filter(c => c.conversionType === "booking").length;

    // Use stored commission for main display (all-time total, consistent with database)
    // This ensures commission shows immediately when deals are closed
    const totalCommission = Number(affiliate.totalCommission || 0);

    // Calculate date-filtered commission for analysis (only converted appointments)
    const convertedAppointments = await prisma.appointment.findMany({
      where: {
        affiliateCode: affiliate.referralCode,
        outcome: 'converted',
        updatedAt: {
          gte: startDate,
        },
      },
    }).catch(() => []);

    const dateFilteredCommission = convertedAppointments.reduce((sum, apt) => {
      const saleValue = Number(apt.saleValue || 0);
      return sum + (saleValue * Number(affiliate.commissionRate));
    }, 0);

    console.log("Admin Individual API Commission Debug:", {
      affiliateId,
      affiliateCode: affiliate.referralCode,
      dateRange,
      startDate: startDate.toISOString(),
      storedCommission: Number(affiliate.totalCommission || 0),
      dateFilteredCommission,
      convertedAppointmentsFound: convertedAppointments.length,
      convertedAppointments: convertedAppointments.map(apt => ({
        id: apt.id,
        outcome: apt.outcome,
        saleValue: apt.saleValue,
        updatedAt: apt.updatedAt,
        commissionRate: affiliate.commissionRate
      })),
      totalCommission
    });

    const conversionRate = totalClicks > 0 ? (totalBookings / totalClicks) * 100 : 0;

    // Generate daily stats from real data using centralized lead calculation
    const dailyStats = await generateDailyStatsWithCentralizedLeads(affiliateId, clicks, conversions, dateRange);

    // Generate traffic sources from real data
    const trafficSources = generateTrafficSourcesFromRealData(clicks);

    // Generate conversion funnel from real data
    const conversionFunnel = generateConversionFunnelFromRealData(clicks, conversions, quizSessions, leadData);

    // Generate recent activity from real data
    const recentActivity = generateRecentActivityFromRealData(clicks, conversions);

    const stats = {
      totalClicks,
      totalLeads,
      totalBookings,
      totalCommission,
      conversionRate,
      dailyStats,
      trafficSources,
      conversionFunnel,
      recentActivity,
    };

    console.log("✅ ADMIN STATS API SUCCESS - returning stats:", {
      totalClicks,
      totalLeads,
      totalBookings,
      totalCommission,
      dailyStatsCount: dailyStats.length
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("❌ ADMIN STATS API ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch affiliate stats" },
      { status: 500 }
    );
  }
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

function generateConversionFunnelFromRealData(clicks: AffiliateClick[], conversions: AffiliateConversion[], quizSessions: QuizSession[], leadData: { totalLeads: number }) {
  const totalClicks = clicks.length;
  const quizStarts = quizSessions.length; // All quiz sessions represent quiz starts
  const quizCompletions = leadData.totalLeads; // Use centralized lead calculation
  const bookings = conversions.filter(c => c.conversionType === "booking").length;

  return [
    { stage: "Clicks", count: totalClicks, percentage: 100 },
    { stage: "Quiz Starts", count: quizStarts, percentage: totalClicks > 0 ? (quizStarts / totalClicks) * 100 : 0 },
    { stage: "Quiz Completions", count: quizCompletions, percentage: totalClicks > 0 ? (quizCompletions / totalClicks) * 100 : 0 },
    { stage: "Booked Calls", count: bookings, percentage: totalClicks > 0 ? (bookings / totalClicks) * 100 : 0 },
  ];
}

function generateRecentActivityFromRealData(clicks: AffiliateClick[], conversions: AffiliateConversion[]) {
  const allActivity = [
    ...clicks.map(click => ({
      date: click.createdAt.toISOString().split('T')[0],
      action: "Click",
      amount: 0,
      commission: 0,
    })),
    ...conversions.map(conversion => ({
      date: conversion.createdAt.toISOString().split('T')[0],
      action: conversion.conversionType === "booking" ? "Booking" : "Lead",
      amount: conversion.saleValue ? Number(conversion.saleValue) : 0,
      commission: conversion.commissionAmount ? Number(conversion.commissionAmount) : 0,
    })),
  ];

  // Sort by date descending and take the last 10
  return allActivity
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
}

// Helper function to generate daily stats using centralized lead calculation
async function generateDailyStatsWithCentralizedLeads(
  affiliateId: string,
  clicks: AffiliateClick[],
  conversions: AffiliateConversion[],
  dateRange: string
) {
  const stats = [];

  if (dateRange === "24h" || dateRange === "1d") {
    // For 24 hours, show hourly data
    const now = new Date();

    // For "Last 24 hours", go back 24 hours from now
    for (let i = 23; i >= 0; i--) {
      // Calculate the timestamp for each of the last 24 hours (going backwards from now)
      const hourTimestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourStart = new Date(hourTimestamp);
      hourStart.setMinutes(0, 0, 0);
      const hourEnd = new Date(hourTimestamp);
      hourEnd.setMinutes(59, 59, 999);

      const hourLabel = `${hourTimestamp.getHours().toString().padStart(2, '0')}:00`;

      // Filter data for this specific hour using proper time ranges
      const hourClicks = clicks.filter(c => {
        const clickDate = new Date(c.createdAt);
        return clickDate >= hourStart && clickDate <= hourEnd;
      });

      const hourConversions = conversions.filter(c => {
        const convDate = new Date(c.createdAt);
        return convDate >= hourStart && convDate <= hourEnd;
      });

      const hourBookings = hourConversions.filter(c => c.conversionType === "booking");

      // Calculate leads for this hour using centralized function
      const hourLeadData = await calculateLeadsWithDateRange(hourStart, hourEnd, affiliateId);

      stats.push({
        date: hourLabel,
        clicks: hourClicks.length,
        leads: hourLeadData.totalLeads,
        bookedCalls: hourBookings.length,
        commission: hourConversions.reduce((sum, c) => sum + Number(c.commissionAmount || 0), 0),
      });
    }
  } else {
    // For other timeframes, show daily data
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
      const dayClicks = clicks.filter(c => {
        const clickDate = new Date(c.createdAt);
        return clickDate >= dayStart && clickDate <= dayEnd;
      });

      const dayConversions = conversions.filter(c => {
        const convDate = new Date(c.createdAt);
        return convDate >= dayStart && convDate <= dayEnd;
      });

      const dayBookings = dayConversions.filter(c => c.conversionType === "booking");
      const dayCommission = dayConversions.reduce((sum, c) => sum + Number(c.commissionAmount || 0), 0);

      // Calculate leads for this day using centralized function
      const dayLeadData = await calculateLeadsWithDateRange(dayStart, dayEnd, affiliateId);

      const dayData = {
        date: dateStr,
        clicks: dayClicks.length,
        leads: dayLeadData.totalLeads,
        bookedCalls: dayBookings.length,
        commission: dayCommission,
      };

      // Log days with bookings
      if (dayBookings.length > 0) {
        console.log(`📊 Day ${dateStr}: ${dayBookings.length} bookings`, dayBookings.map(b => b.id));
      }

      stats.push(dayData);
    }

    console.log(`📈 Generated ${stats.length} data points, bookings in ${stats.filter(s => s.bookedCalls > 0).length} days`);
  }

  return stats;
}
