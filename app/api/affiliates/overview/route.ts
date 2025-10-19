import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { calculateAffiliateLeads } from "@/lib/lead-calculation";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log("Affiliate overview API called");
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get("dateRange") || "30d";
    const tier = searchParams.get("tier") || "all";
    
    console.log("Parameters:", { dateRange, tier });

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
    console.log("Fetching affiliates from database...");
    
    // First, try to get affiliates without includes to see if that works
    const affiliates = await prisma.affiliate.findMany({
      where: {
        isActive: true,
        ...(tier !== "all" && tier !== undefined && { tier: tier as any }),
      },
      orderBy: {
        totalCommission: "desc",
      },
    });
    
    console.log(`Found ${affiliates.length} affiliates without includes`);
    
    // Now get the related data separately to avoid potential issues
    const affiliatesWithData = await Promise.all(
      affiliates.map(async (affiliate) => {
        try {
          const [clicks, conversions, quizSessions] = await Promise.all([
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
              include: {
                result: true,
              },
            }),
          ]);
          
          return {
            ...affiliate,
            clicks,
            conversions,
            quizSessions,
          };
        } catch (error) {
          console.error(`Error fetching data for affiliate ${affiliate.id}:`, error);
          return {
            ...affiliate,
            clicks: [],
            conversions: [],
            quizSessions: [],
          };
        }
      })
    );
    
    console.log(`Found ${affiliatesWithData.length} affiliates with data`);

    // Calculate overview metrics
    const approvedAffiliates = affiliatesWithData.filter(aff => aff.isApproved);
    const pendingAffiliates = affiliatesWithData.filter(aff => !aff.isApproved);
    
    const totalActiveAffiliates = approvedAffiliates.length;
    const totalPendingAffiliates = pendingAffiliates.length;
    const totalLeadsFromAffiliates = approvedAffiliates.reduce((sum, aff) => sum + aff.totalLeads, 0);
    const totalBookedCalls = approvedAffiliates.reduce((sum, aff) => sum + aff.conversions.filter(c => c.conversionType === "booking").length, 0);
    const totalSalesValue = approvedAffiliates.reduce((sum, aff) => sum + (aff.totalSales * 200), 0); // Mock $200 per sale
    const totalCommissionsPaid = approvedAffiliates.reduce((sum, aff) => sum + (Number(aff.totalCommission) * 0.7), 0); // 70% paid
    const totalCommissionsPending = approvedAffiliates.reduce((sum, aff) => sum + (Number(aff.totalCommission) * 0.3), 0); // 30% pending

    // Generate top affiliates performance data (only approved ones)
    const topAffiliates = await Promise.all(approvedAffiliates.map(async (affiliate) => {
      // Use centralized lead calculation
      const leadData = await calculateAffiliateLeads(affiliate.id, '30d');
      
      return {
        id: affiliate.id,
        name: affiliate.name,
        tier: affiliate.tier,
        clicks: affiliate.clicks.length,
        quizStarts: affiliate.quizSessions.length, // Add quiz starts from quiz sessions
        leads: leadData.totalLeads,
        bookedCalls: affiliate.conversions.filter(c => c.conversionType === "booking").length,
        sales: affiliate.conversions.filter(c => c.conversionType === "sale").length,
        conversionRate: affiliate.clicks.length > 0 ? (affiliate.conversions.filter(c => c.conversionType === "sale").length / affiliate.clicks.length) * 100 : 0,
        revenue: affiliate.conversions.filter(c => c.conversionType === "sale").length * 200, // Mock $200 per sale
        commission: affiliate.totalCommission,
        lastActive: affiliate.updatedAt.toISOString(),
      };
    }));
    
    // Sort by revenue
    topAffiliates.sort((a, b) => b.revenue - a.revenue);

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
      totalBookedCalls,
      totalSalesValue,
      totalCommissionsPaid,
      totalCommissionsPending,
      topAffiliates,
      pendingAffiliates: pendingAffiliatesData,
      trafficSourceBreakdown,
      conversionFunnelByTier,
    };

    console.log("Returning affiliate data:", {
      totalActiveAffiliates: affiliateData.totalActiveAffiliates,
      totalPendingAffiliates: affiliateData.totalPendingAffiliates,
      topAffiliatesCount: affiliateData.topAffiliates.length
    });
    
    return NextResponse.json(affiliateData);
  } catch (error) {
    console.error("Affiliate overview API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch affiliate overview data" },
      { status: 500 }
    );
  }
}
