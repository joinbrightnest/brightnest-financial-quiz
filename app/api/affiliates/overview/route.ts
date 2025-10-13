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

    // Mock affiliate data (in production, this would come from your affiliate tables)
    const mockAffiliates = [
      {
        id: "aff_001",
        name: "Sarah Johnson",
        tier: "creator",
        referral_code: "SARAH2024",
        commission_rate: 0.15,
        total_clicks: 1250,
        total_leads: 89,
        total_bookings: 23,
        total_sales: 12,
        total_commission: 2400,
        created_at: new Date("2024-01-15"),
      },
      {
        id: "aff_002", 
        name: "Mike Chen",
        tier: "quiz",
        referral_code: "MIKEQUIZ",
        commission_rate: 0.10,
        total_clicks: 890,
        total_leads: 67,
        total_bookings: 18,
        total_sales: 8,
        total_commission: 1200,
        created_at: new Date("2024-02-01"),
      },
      {
        id: "aff_003",
        name: "FinanceGuru Agency",
        tier: "agency",
        referral_code: "FINANCEGURU",
        commission_rate: 0.20,
        total_clicks: 2100,
        total_leads: 156,
        total_bookings: 45,
        total_sales: 28,
        total_commission: 5600,
        created_at: new Date("2024-01-01"),
      },
      {
        id: "aff_004",
        name: "Emma Davis",
        tier: "creator",
        referral_code: "EMMADAVIS",
        commission_rate: 0.12,
        total_clicks: 750,
        total_leads: 45,
        total_bookings: 12,
        total_sales: 6,
        total_commission: 900,
        created_at: new Date("2024-02-15"),
      },
      {
        id: "aff_005",
        name: "QuizMaster Pro",
        tier: "quiz",
        referral_code: "QUIZMASTER",
        commission_rate: 0.08,
        total_clicks: 1100,
        total_leads: 78,
        total_bookings: 22,
        total_sales: 11,
        total_commission: 1320,
        created_at: new Date("2024-01-20"),
      },
    ];

    // Filter by tier if specified
    const filteredAffiliates = tier === "all" 
      ? mockAffiliates 
      : mockAffiliates.filter(affiliate => affiliate.tier === tier);

    // Calculate overview metrics
    const totalActiveAffiliates = filteredAffiliates.length;
    const totalLeadsFromAffiliates = filteredAffiliates.reduce((sum, aff) => sum + aff.total_leads, 0);
    const totalSalesValue = filteredAffiliates.reduce((sum, aff) => sum + (aff.total_sales * 200), 0); // Mock $200 per sale
    const totalCommissionsPaid = filteredAffiliates.reduce((sum, aff) => sum + (aff.total_commission * 0.7), 0); // 70% paid
    const totalCommissionsPending = filteredAffiliates.reduce((sum, aff) => sum + (aff.total_commission * 0.3), 0); // 30% pending

    // Generate top affiliates performance data
    const topAffiliates = filteredAffiliates.map(affiliate => ({
      id: affiliate.id,
      name: affiliate.name,
      tier: affiliate.tier,
      clicks: affiliate.total_clicks,
      leads: affiliate.total_leads,
      bookedCalls: affiliate.total_bookings,
      sales: affiliate.total_sales,
      conversionRate: affiliate.total_clicks > 0 ? (affiliate.total_leads / affiliate.total_clicks) * 100 : 0,
      revenue: affiliate.total_sales * 200, // Mock $200 per sale
      commission: affiliate.total_commission,
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random within last 7 days
    })).sort((a, b) => b.revenue - a.revenue);

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
      totalLeadsFromAffiliates,
      totalSalesValue,
      totalCommissionsPaid,
      totalCommissionsPending,
      topAffiliates,
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
