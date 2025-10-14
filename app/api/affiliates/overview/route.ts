import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get("dateRange") || "30d";
    const tier = searchParams.get("tier") || "all";

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

    // Build where clause for affiliates
    const affiliateWhereClause: any = {};
    if (tier !== "all") {
      affiliateWhereClause.tier = tier;
    }

    // Get real affiliate data from database (both approved and pending)
    const affiliates = await prisma.affiliate.findMany({
      where: {
        isActive: true,
        ...(tier !== "all" && { tier }),
      },
      include: {
        clicks: {
          where: {
            createdAt: {
              gte: startDate,
            },
          },
        },
        conversions: {
          where: {
            createdAt: {
              gte: startDate,
            },
          },
        },
      },
      orderBy: {
        totalCommission: "desc",
      },
    });

    // Calculate overview metrics
    const approvedAffiliates = affiliates.filter(aff => aff.isApproved);
    const pendingAffiliates = affiliates.filter(aff => !aff.isApproved);
    
    const totalActiveAffiliates = approvedAffiliates.length;
    const totalPendingAffiliates = pendingAffiliates.length;
    const totalLeadsFromAffiliates = approvedAffiliates.reduce((sum, aff) => sum + aff.totalLeads, 0);
    const totalSalesValue = approvedAffiliates.reduce((sum, aff) => sum + (aff.totalSales * 200), 0); // Mock $200 per sale
    const totalCommissionsPaid = approvedAffiliates.reduce((sum, aff) => sum + (aff.totalCommission * 0.7), 0); // 70% paid
    const totalCommissionsPending = approvedAffiliates.reduce((sum, aff) => sum + (aff.totalCommission * 0.3), 0); // 30% pending

    // Generate top affiliates performance data (only approved ones)
    const topAffiliates = approvedAffiliates.map(affiliate => ({
      id: affiliate.id,
      name: affiliate.name,
      tier: affiliate.tier,
      clicks: affiliate.clicks.length,
      leads: affiliate.conversions.filter(c => c.status === "lead").length,
      bookedCalls: affiliate.conversions.filter(c => c.status === "booked_call").length,
      sales: affiliate.conversions.filter(c => c.status === "sale").length,
      conversionRate: affiliate.clicks.length > 0 ? (affiliate.conversions.filter(c => c.status === "sale").length / affiliate.clicks.length) * 100 : 0,
      revenue: affiliate.conversions.filter(c => c.status === "sale").length * 200, // Mock $200 per sale
      commission: affiliate.totalCommission,
      lastActive: affiliate.updatedAt.toISOString(),
    })).sort((a, b) => b.revenue - a.revenue);

    // Generate pending affiliates data
    const pendingAffiliatesData = pendingAffiliates.map(affiliate => ({
      id: affiliate.id,
      name: affiliate.name,
      email: affiliate.email,
      tier: affiliate.tier,
      referralCode: affiliate.referralCode,
      customLink: affiliate.customLink,
      commissionRate: affiliate.commissionRate,
      createdAt: affiliate.createdAt.toISOString(),
    }));

    // Generate traffic source breakdown
    const trafficSourceBreakdown = [
      { source: "YouTube", count: 1250, percentage: 35.2 },
      { source: "TikTok", count: 980, percentage: 27.6 },
      { source: "Instagram", count: 750, percentage: 21.1 },
      { source: "Facebook", count: 420, percentage: 11.8 },
      { source: "Direct", count: 150, percentage: 4.2 },
    ];

    // Generate conversion funnel by tier
    const conversionFunnelByTier = [
      {
        tier: "creator",
        clicks: 2000,
        quizStarts: 134,
        completed: 89,
        booked: 35,
        closed: 18,
      },
      {
        tier: "quiz", 
        clicks: 1990,
        quizStarts: 145,
        completed: 67,
        booked: 40,
        closed: 19,
      },
      {
        tier: "agency",
        clicks: 2100,
        quizStarts: 156,
        completed: 156,
        booked: 45,
        closed: 28,
      },
    ];

    const affiliateData = {
      totalActiveAffiliates,
      totalPendingAffiliates,
      totalLeadsFromAffiliates,
      totalSalesValue,
      totalCommissionsPaid,
      totalCommissionsPending,
      topAffiliates,
      pendingAffiliates: pendingAffiliatesData,
      trafficSourceBreakdown,
      conversionFunnelByTier,
    };

    return NextResponse.json(affiliateData);
  } catch (error) {
    console.error("Affiliate overview API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch affiliate overview data" },
      { status: 500 }
    );
  }
}
