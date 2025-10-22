import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, CallOutcome } from "@prisma/client";
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
    console.log("Sample affiliate fields:", affiliates[0] ? Object.keys(affiliates[0]) : "No affiliates found");
    console.log("Sample affiliate referralCode:", affiliates[0]?.referralCode);
    
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

    // Copy the working logic from affiliate-performance API directly
    const topAffiliates = await Promise.all(approvedAffiliates.map(async (affiliate) => {
      // Get clicks for this affiliate
      const clicks = await prisma.affiliateClick.findMany({
        where: {
          affiliateId: affiliate.id,
        },
      });

      // Get conversions for this affiliate
      const conversions = await prisma.affiliateConversion.findMany({
        where: {
          affiliateId: affiliate.id,
        },
      });

      // Get quiz sessions for this affiliate
      const quizSessions = await prisma.quizSession.findMany({
        where: {
          affiliateCode: affiliate.referralCode,
        },
      });

      // Get appointments for this affiliate
      const appointments = await prisma.appointment.findMany({
        where: {
          affiliateCode: affiliate.referralCode,
        },
      });

      // Calculate conversion rates
      const clickCount = clicks.length;
      const conversionCount = conversions.length;
      const quizCount = quizSessions.length;
      const completionCount = quizSessions.filter(session => session.status === "completed").length;
      
      // Count actual bookings and sales from appointments (more accurate)
      const bookingCount = appointments.length;
      const saleCount = appointments.filter(apt => apt.outcome === CallOutcome.converted).length;
      
      // Use centralized lead calculation
      const leadData = await calculateAffiliateLeads(affiliate.id, '30d');
      const leadCount = leadData.totalLeads;

      // Calculate actual revenue from converted appointments (total sale values)
      const totalRevenue = appointments
        .filter(apt => apt.outcome === CallOutcome.converted && apt.saleValue)
        .reduce((sum, apt) => sum + (Number(apt.saleValue) || 0), 0);

      // Use stored commission from database (consistent with other APIs)
      const totalCommission = Number(affiliate.totalCommission || 0);

      // Calculate conversion rates
      const clickToQuizRate = clickCount > 0 ? (quizCount / clickCount) * 100 : 0;
      const quizToCompletionRate = quizCount > 0 ? (completionCount / quizCount) * 100 : 0;
      const clickToCompletionRate = clickCount > 0 ? (completionCount / clickCount) * 100 : 0;

      return {
        id: affiliate.id,
        name: affiliate.name,
        tier: affiliate.tier,
        referralCode: affiliate.referralCode,
        clicks: clickCount,
        quizStarts: quizCount,
        leads: leadCount,
        bookedCalls: bookingCount,
        sales: saleCount,
        conversionRate: clickToCompletionRate,
        revenue: totalRevenue,
        commission: totalCommission,
        lastActive: affiliate.updatedAt.toISOString(),
      };
    }));
    
    // Sort by revenue
    topAffiliates.sort((a, b) => b.revenue - a.revenue);
    
    // Calculate correct overview metrics from topAffiliates data
    const totalLeadsFromAffiliates = topAffiliates.reduce((sum, aff) => sum + aff.leads, 0);
    const totalBookedCalls = topAffiliates.reduce((sum, aff) => sum + aff.bookedCalls, 0);
    const totalSalesValue = topAffiliates.reduce((sum, aff) => sum + aff.revenue, 0); // Use actual revenue, not commission
    const totalCommissionsPaid = topAffiliates.reduce((sum, aff) => sum + (Number(aff.commission) * 0.7), 0); // 70% paid
    const totalCommissionsPending = topAffiliates.reduce((sum, aff) => sum + (Number(aff.commission) * 0.3), 0); // 30% pending
    
    // Debug logging for overview metrics
    console.log("Overview Metrics Debug:", {
      totalLeadsFromAffiliates,
      totalBookedCalls,
      totalSalesValue,
      totalCommissionsPaid,
      totalCommissionsPending,
      topAffiliatesSummary: topAffiliates.map(aff => ({
        name: aff.name,
        leads: aff.leads,
        revenue: aff.revenue,
        commission: aff.commission
      }))
    });

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

    // Calculate real traffic source breakdown from affiliate clicks
    const allClicks = await prisma.affiliateClick.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        affiliate: true,
      },
    });

    // Group clicks by source (you may need to add a source field to affiliateClick table)
    const sourceCounts = allClicks.reduce((acc, click) => {
      // For now, we'll use affiliate tier as source since there's no source field
      // You should add a 'source' field to the affiliateClick table for proper tracking
      const source = click.affiliate?.tier || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalClicks = allClicks.length;
    const trafficSourceBreakdown = Object.entries(sourceCounts).map(([source, count]) => ({
      source: source.charAt(0).toUpperCase() + source.slice(1),
      count,
      percentage: totalClicks > 0 ? (count / totalClicks) * 100 : 0,
    })).sort((a, b) => b.count - a.count);

    // Calculate real conversion funnel by tier from actual data
    const conversionFunnelByTier = await Promise.all(
      ['quiz', 'creator', 'agency'].map(async (tier) => {
        // Get affiliates of this tier
        const tierAffiliates = affiliatesWithData.filter(aff => aff.tier === tier && aff.isApproved);
        
        if (tierAffiliates.length === 0) {
          return {
            tier,
            clicks: 0,
            quizStarts: 0,
            completed: 0,
            booked: 0,
            closed: 0,
          };
        }

        // Calculate aggregated metrics for this tier
        const tierClicks = tierAffiliates.reduce((sum, aff) => {
          return sum + (aff.clicks?.length || 0);
        }, 0);

        const tierQuizStarts = tierAffiliates.reduce((sum, aff) => {
          return sum + (aff.quizSessions?.length || 0);
        }, 0);

        const tierCompleted = tierAffiliates.reduce((sum, aff) => {
          const completed = aff.quizSessions?.filter(session => session.status === "completed").length || 0;
          return sum + completed;
        }, 0);

        // Get appointments for this tier
        const tierAppointments = await Promise.all(
          tierAffiliates.map(async (aff) => {
            return prisma.appointment.findMany({
              where: {
                affiliateCode: aff.referralCode,
                createdAt: {
                  gte: startDate,
                },
              },
            });
          })
        );

        const tierBooked = tierAppointments.flat().length;
        const tierClosed = tierAppointments.flat().filter(apt => apt.outcome === CallOutcome.converted).length;

        return {
          tier,
          clicks: tierClicks,
          quizStarts: tierQuizStarts,
          completed: tierCompleted,
          booked: tierBooked,
          closed: tierClosed,
        };
      })
    );

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
