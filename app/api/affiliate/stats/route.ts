import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
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
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());

    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get("dateRange") || "30d";

    // Calculate date filter
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
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
    let clicks = [];
    let conversions = [];
    let payouts = [];
    
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

    // Calculate stats using centralized lead calculation
    const totalClicks = affiliateWithData.clicks.length;
    const leadData = await calculateLeadsByCode(affiliate.referralCode, dateRange);
    const totalLeads = leadData.totalLeads;
    const totalBookings = affiliateWithData.conversions.filter(c => c.conversionType === "booking").length;
    const totalSales = affiliateWithData.conversions.filter(c => c.conversionType === "sale").length;
    const totalCommission = affiliate.totalCommission || 0; // Use database field instead of calculating from conversions
    const conversionRate = totalClicks > 0 ? (totalSales / totalClicks) * 100 : 0;
    const averageSaleValue = totalSales > 0 ? Number(totalCommission) / totalSales : 0;

    // Calculate pending and paid commissions
    const pendingCommission = affiliateWithData.payouts
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + Number(p.amount), 0);
    
    const paidCommission = affiliateWithData.payouts
      .filter(p => p.status === "completed")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Generate daily stats based on actual data
    const dailyStats = await generateDailyStatsWithRealData(affiliate.referralCode, dateRange);

    const stats = {
      totalClicks,
      totalLeads,
      totalBookings,
      totalSales,
      totalCommission,
      conversionRate,
      averageSaleValue,
      pendingCommission,
      paidCommission,
      dailyStats,
    };

    return NextResponse.json(stats);
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
  const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 365;
  const data = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    // Get real data for this day
    const dayClicks = await prisma.affiliateClick.findMany({
      where: {
        affiliate: { referralCode: affiliateCode },
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    const dayConversions = await prisma.affiliateConversion.findMany({
      where: {
        affiliate: { referralCode: affiliateCode },
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    // Calculate real leads for this specific day
    const dayLeadData = await calculateLeadsWithDateRange(dayStart, dayEnd, undefined, affiliateCode);
    
    data.push({
      date: date.toISOString().split('T')[0],
      clicks: dayClicks.length,
      leads: dayLeadData.totalLeads,
      bookedCalls: dayConversions.filter(c => c.conversionType === "booking").length,
      commission: dayConversions.reduce((sum, c) => sum + Number(c.commissionAmount || 0), 0),
    });
  }

  return data;
}
