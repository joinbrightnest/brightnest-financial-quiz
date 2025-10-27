import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, CallOutcome } from "@prisma/client";
import { calculateAffiliateLeads, calculateLeadsWithDateRange } from "@/lib/lead-calculation";
import { verifyAdminAuth } from "@/lib/admin-auth-server";

const prisma = new PrismaClient();

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

    // Get related data with error handling
    let clicks = [];
    let conversions = [];
    let quizSessions = [];
    let appointments = [];
    
    try {
      [clicks, conversions, quizSessions, appointments] = await Promise.all([
        prisma.affiliateClick.findMany({
          where: {
            affiliateId: affiliate.id,
            createdAt: {
              gte: startDate,
            },
          },
        }),
        prisma.affiliateConversion.findMany({
          where: {
            affiliateId: affiliate.id,
            createdAt: {
              gte: startDate,
            },
          },
        }),
        prisma.quizSession.findMany({
          where: {
            affiliateCode: affiliate.referralCode,
            createdAt: {
              gte: startDate,
            },
          },
        }),
        prisma.appointment.findMany({
          where: {
            affiliateCode: affiliate.referralCode,
            createdAt: {
              gte: startDate,
            },
          },
        }),
      ]);
      console.log("Retrieved clicks:", clicks.length, "conversions:", conversions.length, "quiz sessions:", quizSessions.length, "appointments:", appointments.length);
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
    // Count actual bookings from appointments table (source of truth)
    const totalBookings = appointments.length;
    
    // Use stored commission for main display (all-time total, consistent with database)
    // This ensures commission shows immediately when deals are closed
    const totalCommission = Number(affiliate.totalCommission || 0);
    
    // Calculate date-filtered commission for analysis
    const appointments = await prisma.appointment.findMany({
      where: {
        affiliateCode: affiliate.referralCode,
        outcome: 'converted',
        updatedAt: {
          gte: startDate,
        },
      },
    }).catch(() => []);
    
    const dateFilteredCommission = appointments.reduce((sum, apt) => {
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
      appointmentsFound: appointments.length,
      appointments: appointments.map(apt => ({
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
    const dailyStats = await generateDailyStatsWithCentralizedLeads(affiliateId, clicks, conversions, appointments, dateRange);

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

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching affiliate stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch affiliate stats" },
      { status: 500 }
    );
  }
}

function generateDailyStatsFromRealData(clicks: any[], conversions: any[], dateRange: string) {
  const stats = [];
  
  if (dateRange === "1d") {
    // For 24 hours, show hourly data for the last 24 hours
    for (let i = 23; i >= 0; i--) {
      const date = new Date();
      date.setHours(date.getHours() - i);
      const dateStr = date.toISOString().split('T')[0];
      const hourStr = date.getHours().toString().padStart(2, '0');
      
      const hourClicks = clicks.filter(c => {
        const clickDate = c.createdAt.toISOString().split('T')[0];
        const clickHour = c.createdAt.getHours().toString().padStart(2, '0');
        return clickDate === dateStr && clickHour === hourStr;
      });
      
      const hourConversions = conversions.filter(c => {
        const convDate = c.createdAt.toISOString().split('T')[0];
        const convHour = c.createdAt.getHours().toString().padStart(2, '0');
        return convDate === dateStr && convHour === hourStr;
      });
      
      stats.push({
        date: `${dateStr}T${hourStr}:00:00.000Z`, // Include hour for proper sorting
        clicks: hourClicks.length,
        leads: hourConversions.filter(c => c.status === "confirmed" && c.conversionType === "quiz_completion").length,
        bookedCalls: hourConversions.filter(c => c.conversionType === "booking").length,
        commission: hourConversions.reduce((sum, c) => sum + Number(c.commissionAmount || 0), 0),
      });
    }
  } else {
    // For other timeframes, show daily data
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 365;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayClicks = clicks.filter(c => c.createdAt.toISOString().split('T')[0] === dateStr);
      const dayConversions = conversions.filter(c => c.createdAt.toISOString().split('T')[0] === dateStr);
      const dayBookings = dayConversions.filter(c => c.conversionType === "booking");
      const dayCommission = dayConversions.reduce((sum, c) => sum + Number(c.commissionAmount || 0), 0);
      
      stats.push({
        date: dateStr,
        clicks: dayClicks.length,
        leads: dayConversions.filter(c => c.status === "confirmed" && c.conversionType === "quiz_completion").length,
        bookedCalls: dayConversions.filter(c => c.conversionType === "booking").length,
        commission: dayCommission,
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

function generateConversionFunnelFromRealData(clicks: any[], conversions: any[], quizSessions: any[], leadData: any) {
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

function generateRecentActivityFromRealData(clicks: any[], conversions: any[]) {
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
  clicks: any[], 
  conversions: any[], 
  appointments: any[],
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
      
      const hourAppointments = appointments.filter(a => {
        const aptDate = new Date(a.createdAt);
        return aptDate >= hourStart && aptDate <= hourEnd;
      });
      
      const hourConversions = conversions.filter(c => {
        const convDate = new Date(c.createdAt);
        return convDate >= hourStart && convDate <= hourEnd;
      });
      
      // Calculate leads for this hour using centralized function
      const hourLeadData = await calculateLeadsWithDateRange(hourStart, hourEnd, affiliateId);
      
      stats.push({
        date: hourLabel,
        clicks: hourClicks.length,
        leads: hourLeadData.totalLeads,
        bookedCalls: hourAppointments.length, // Count from appointments, not conversions
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
      
      const dayAppointments = appointments.filter(a => {
        const aptDate = new Date(a.createdAt);
        return aptDate >= dayStart && aptDate <= dayEnd;
      });
      
      const dayConversions = conversions.filter(c => {
        const convDate = new Date(c.createdAt);
        return convDate >= dayStart && convDate <= dayEnd;
      });
      
      const dayCommission = dayConversions.reduce((sum, c) => sum + Number(c.commissionAmount || 0), 0);
      
      // Calculate leads for this day using centralized function
      const dayLeadData = await calculateLeadsWithDateRange(dayStart, dayEnd, affiliateId);
      
      stats.push({
        date: dateStr,
        clicks: dayClicks.length,
        leads: dayLeadData.totalLeads,
        bookedCalls: dayAppointments.length, // Count from appointments, not conversions
        commission: dayCommission,
      });
    }
  }
  
  return stats;
}
