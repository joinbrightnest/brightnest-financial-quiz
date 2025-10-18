import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { calculateAffiliateLeads, calculateLeadsWithDateRange } from "@/lib/lead-calculation";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: affiliateId } = await params;
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get("dateRange") || "30d";

    // Calculate date filter
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case "1d":
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
      default:
        startDate = new Date(0); // All time
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
    
    try {
      [clicks, conversions, quizSessions] = await Promise.all([
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
      ]);
      console.log("Retrieved clicks:", clicks.length, "conversions:", conversions.length, "quiz sessions:", quizSessions.length);
    } catch (error) {
      console.error("Error fetching related data:", error);
      // Set empty arrays if there's an error
      clicks = [];
      conversions = [];
      quizSessions = [];
    }

    // Calculate stats from real data using centralized lead calculation
    const totalClicks = clicks.length;
    const leadData = await calculateAffiliateLeads(affiliateId, dateRange);
    const totalLeads = leadData.totalLeads;
    const totalBookings = conversions.filter(c => c.conversionType === "booking").length;
    const totalCommission = conversions.reduce((sum, c) => sum + Number(c.commissionAmount || 0), 0);
    const conversionRate = totalClicks > 0 ? (totalBookings / totalClicks) * 100 : 0;

    // Generate daily stats from real data using centralized lead calculation
    const dailyStats = await generateDailyStatsWithCentralizedLeads(affiliateId, clicks, conversions, dateRange);

    // Generate traffic sources from real data
    const trafficSources = generateTrafficSourcesFromRealData(clicks);

    // Generate conversion funnel from real data
    const conversionFunnel = generateConversionFunnelFromRealData(clicks, conversions, quizSessions);

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

function generateConversionFunnelFromRealData(clicks: any[], conversions: any[], quizSessions: any[]) {
  const totalClicks = clicks.length;
  const quizStarts = quizSessions.length; // All quiz sessions represent quiz starts
  const quizCompletions = conversions.filter(c => c.status === "confirmed").length;
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
  dateRange: string
) {
  const stats = [];
  
  if (dateRange === "1d") {
    // For 24 hours, show hourly data
    const now = new Date();
    const startHour = now.getHours() - 23; // Last 24 hours
    
    for (let i = 0; i < 24; i++) {
      const hour = (startHour + i + 24) % 24; // Handle negative hours
      const hourStr = hour.toString().padStart(2, '0');
      const dateStr = now.toISOString().split('T')[0];
      
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
      
      // Calculate leads for this hour using centralized function
      const hourStart = new Date(now);
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date(now);
      hourEnd.setHours(hour, 59, 59, 999);
      
      const hourLeadData = await calculateLeadsWithDateRange(hourStart, hourEnd, affiliateId);
      
      stats.push({
        date: `${dateStr}T${hourStr}:00:00.000Z`,
        clicks: hourClicks.length,
        leads: hourLeadData.totalLeads,
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
      
      // Calculate leads for this day using centralized function
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayLeadData = await calculateLeadsWithDateRange(dayStart, dayEnd, affiliateId);
      
      stats.push({
        date: dateStr,
        clicks: dayClicks.length,
        leads: dayLeadData.totalLeads,
        bookedCalls: dayBookings.length,
        commission: dayCommission,
      });
    }
  }
  
  return stats;
}
