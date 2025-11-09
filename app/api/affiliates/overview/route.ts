import { NextRequest, NextResponse } from "next/server";
import { CallOutcome } from "@prisma/client";
import { calculateAffiliateLeads } from "@/lib/lead-calculation";
import { prisma } from "@/lib/prisma";

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
      default:
        startDate = new Date(0); // All time
    }

    // Build where clause for affiliates
    const affiliateWhereClause: any = {};
    if (tier !== "all") {
      affiliateWhereClause.tier = tier;
    }

    // PERFORMANCE OPTIMIZATION: Fetch all data in bulk queries (4 queries total instead of 54+)
    console.log("Fetching affiliates from database...");
    
    const affiliates = await prisma.affiliate.findMany({
      where: {
        isApproved: true, // Use isApproved instead of isActive for consistency with admin API
        ...(tier !== "all" && tier !== undefined && { tier: tier as any }),
      },
      orderBy: {
        totalCommission: "desc",
      },
    });
    
    console.log(`Found ${affiliates.length} affiliates`);
    
    if (affiliates.length === 0) {
      return NextResponse.json({
        totalActiveAffiliates: 0,
        totalPendingAffiliates: 0,
        totalLeadsFromAffiliates: 0,
        totalBookedCalls: 0,
        totalCommissionsPaid: 0,
        totalCommissionsPending: 0,
        totalCommissionsEarned: 0,
        totalSalesValue: 0,
        topAffiliates: [],
        trafficSourceBreakdown: [],
        conversionFunnelByTier: [],
        pendingAffiliates: [],
      });
    }
    
    // BULK FETCH: Get all data in 4 queries instead of 54+
    const affiliateIds = affiliates.map(a => a.id);
    const referralCodes = affiliates.map(a => a.referralCode);
    
    const [allClicks, allConversions, allQuizSessions, allAppointments] = await Promise.all([
      prisma.affiliateClick.findMany({
        where: {
          affiliateId: { in: affiliateIds },
          createdAt: { gte: startDate },
        },
      }),
      prisma.affiliateConversion.findMany({
        where: {
          affiliateId: { in: affiliateIds },
          createdAt: { gte: startDate },
        },
      }),
      prisma.quizSession.findMany({
        where: {
          affiliateCode: { in: referralCodes },
          createdAt: { gte: startDate },
        },
        select: {
          id: true,
          affiliateCode: true,
          status: true,
          createdAt: true,
          result: {
            select: {
              id: true,
            },
          },
        },
      }),
      prisma.appointment.findMany({
        where: {
          affiliateCode: { in: referralCodes },
          createdAt: { gte: startDate },
        },
        select: {
          id: true,
          affiliateCode: true,
          outcome: true,
          saleValue: true,
          customerEmail: true, // Need email for matching to quiz sessions
        },
      }),
    ]);
    
    // Get all completed quiz session IDs for email matching
    const completedSessionIds = allQuizSessions
      .filter((s: any) => s.status === "completed")
      .map((s: any) => s.id);
    
    // Bulk fetch all email answers for completed sessions (single query)
    const completedSessionEmailsMap = new Map<string, string>(); // sessionId -> email
    if (completedSessionIds.length > 0) {
      const emailAnswers = await prisma.quizAnswer.findMany({
        where: {
          sessionId: { in: completedSessionIds },
          OR: [
            { question: { type: 'email' } },
            { question: { prompt: { contains: 'email' } } },
            { question: { prompt: { contains: 'Email' } } }
          ]
        },
        include: {
          question: true
        }
      });
      
      emailAnswers.forEach(answer => {
        if (answer.value && answer.sessionId) {
          const email = String(answer.value).toLowerCase().trim();
          completedSessionEmailsMap.set(answer.sessionId, email);
        }
      });
    }
    
    // Create a set of all completed session emails for quick lookup
    const completedSessionEmailsSet = new Set(completedSessionEmailsMap.values());
    
    // Group data by affiliate (in memory - fast)
    const dataByAffiliate = new Map();
    affiliates.forEach(aff => {
      const affiliateQuizSessions = allQuizSessions.filter((s: any) => s.affiliateCode === aff.referralCode);
      const affiliateAppointments = allAppointments.filter((a: any) => a.affiliateCode === aff.referralCode);
      
      // Get emails for this affiliate's completed quiz sessions
      const affiliateCompletedSessionIds = affiliateQuizSessions
        .filter((s: any) => s.status === "completed")
        .map((s: any) => s.id);
      const affiliateCompletedEmails = new Set<string>();
      affiliateCompletedSessionIds.forEach((sessionId: string) => {
        const email = completedSessionEmailsMap.get(sessionId);
        if (email) {
          affiliateCompletedEmails.add(email);
        }
      });
      
      dataByAffiliate.set(aff.id, {
        affiliate: aff,
        clicks: allClicks.filter(c => c.affiliateId === aff.id),
        conversions: allConversions.filter(c => c.affiliateId === aff.id),
        quizSessions: affiliateQuizSessions,
        appointments: affiliateAppointments,
        completedSessionEmails: affiliateCompletedEmails, // Pre-calculated emails for this affiliate
      });
    });
    
    console.log(`Bulk fetched data for ${affiliates.length} affiliates in 4 queries`);

    // Calculate overview metrics
    const approvedAffiliates = affiliates.filter(aff => aff.isApproved);
    const pendingAffiliates = affiliates.filter(aff => !aff.isApproved);
    
    const totalActiveAffiliates = approvedAffiliates.length;
    const totalPendingAffiliates = pendingAffiliates.length;

    // PERFORMANCE: Process affiliates using pre-fetched data (no more queries!)
    const topAffiliates = approvedAffiliates.map((affiliate) => {
      const affiliateData = dataByAffiliate.get(affiliate.id);
      if (!affiliateData) return null;
      
      const { clicks, conversions, quizSessions, appointments, completedSessionEmails } = affiliateData;

      // Calculate metrics using pre-fetched data
      const clickCount = clicks.length;
      const quizCount = quizSessions.length;
      const completionCount = quizSessions.filter((s: any) => s.status === "completed").length;
      
      // Use pre-calculated emails from dataByAffiliate (no additional query needed)
      const completedSessionEmails = affiliateData.completedSessionEmails || new Set<string>();
      
      // Match appointments to completed quiz sessions by email (consistent with admin API)
      // This ensures we only count bookings that came from the quiz flow
      const validBookedAppointments = appointments.filter((apt: any) => {
        if (!apt.customerEmail) return false;
        const appointmentEmail = apt.customerEmail.toLowerCase().trim();
        return completedSessionEmails.has(appointmentEmail);
      });
      
      // Count bookings from completed quiz flow (consistent with admin API)
      const bookingCount = validBookedAppointments.length;
      // Sales: count ALL affiliate sales (matches Lead Analytics and admin API)
      const saleCount = appointments.filter((apt: any) => apt.outcome === CallOutcome.converted).length;
      
      // Lead count = completed quiz sessions with results
      const leadCount = quizSessions.filter((s: any) => s.status === "completed" && s.result).length;

      // Calculate revenue from converted appointments
      const totalRevenue = appointments
        .filter((apt: any) => apt.outcome === CallOutcome.converted && apt.saleValue)
        .reduce((sum: number, apt: any) => sum + (Number(apt.saleValue) || 0), 0);

      // Calculate commission from actual revenue (don't use database field - it may be doubled)
      // Commission = Revenue × Commission Rate
      const totalCommission = totalRevenue * Number(affiliate.commissionRate);

      // Calculate conversion rate
      const clickToCompletionRate = clickCount > 0 ? (completionCount / clickCount) * 100 : 0;

      return {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
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
    }).filter(Boolean);
    
    // Sort by revenue
    topAffiliates.sort((a, b) => (b?.revenue || 0) - (a?.revenue || 0));
    
    // Calculate correct overview metrics from topAffiliates data
    const totalLeadsFromAffiliates = topAffiliates.reduce((sum, aff) => sum + (aff?.leads || 0), 0);
    const totalBookedCalls = topAffiliates.reduce((sum, aff) => sum + (aff?.bookedCalls || 0), 0);
    const totalSalesValue = topAffiliates.reduce((sum, aff) => sum + (aff?.revenue || 0), 0); // Use actual revenue, not commission
    
    // Calculate total commissions earned in the selected date range
    // This is the commission calculated from revenue in the date range
    const totalCommissionsEarnedInPeriod = topAffiliates.reduce((sum, aff) => sum + Number(aff?.commission || 0), 0);
    
    // Get actual paid/pending from payout records for all affiliates (all time, not date-filtered)
    // Note: For accurate pending calculation, we should use AffiliateConversion records with commissionStatus
    // But for overview display, we'll use the simpler calculation from payouts
    const allPayouts = await prisma.affiliatePayout.findMany({
      where: {
        affiliateId: {
          in: affiliates.map(a => a.id)
        }
      }
    });
    
    const totalCommissionsPaid = allPayouts
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + Number(p.amountDue), 0);
    
    // Calculate pending payouts (payouts with pending status)
    const totalPendingPayouts = allPayouts
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + Number(p.amountDue), 0);
    
    // For overview, show commissions earned in period and pending payouts
    // Note: This is a simplified calculation. For accurate pending commissions,
    // we should calculate from AffiliateConversion records with commissionStatus (like payout API)
    // But that would require additional queries and might impact performance
    const totalCommissionsPending = totalPendingPayouts; // Show pending payouts as pending commissions
    
    // Debug logging for overview metrics
    console.log("Overview Metrics Debug:", {
      totalLeadsFromAffiliates,
      totalBookedCalls,
      totalSalesValue,
      totalCommissionsPaid,
      totalCommissionsPending,
      topAffiliatesSummary: topAffiliates.map(aff => ({
        name: aff?.name || '',
        leads: aff?.leads || 0,
        revenue: aff?.revenue || 0,
        commission: aff?.commission || 0
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

    // PERFORMANCE: Use already-fetched clicks data
    const sourceCounts = allClicks.reduce((acc, click) => {
      // Get affiliate tier from affiliateId
      const affiliate = affiliates.find(a => a.id === click.affiliateId);
      const source = affiliate?.tier || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalClicks = allClicks.length;
    const trafficSourceBreakdown = Object.entries(sourceCounts).map(([source, count]) => ({
      source: source.charAt(0).toUpperCase() + source.slice(1),
      count,
      percentage: totalClicks > 0 ? (count / totalClicks) * 100 : 0,
    })).sort((a, b) => b.count - a.count);

    // PERFORMANCE: Calculate funnel using pre-fetched data
    const conversionFunnelByTier = ['quiz', 'creator', 'agency'].map((tierName) => {
      // Get affiliates of this tier
      const tierAffiliates = approvedAffiliates.filter(aff => aff.tier === tierName);
      
      if (tierAffiliates.length === 0) {
        return {
          tier: tierName,
          clicks: 0,
          quizStarts: 0,
          completed: 0,
          booked: 0,
          closed: 0,
        };
      }

      // Calculate metrics using pre-fetched data
      let tierClicks = 0;
      let tierQuizStarts = 0;
      let tierCompleted = 0;
      let tierBooked = 0;
      let tierClosed = 0;

      tierAffiliates.forEach(aff => {
        const affiliateData = dataByAffiliate.get(aff.id);
        if (affiliateData) {
          tierClicks += affiliateData.clicks.length;
          tierQuizStarts += affiliateData.quizSessions.length;
          tierCompleted += affiliateData.quizSessions.filter((s: any) => s.status === "completed").length;
          
          // Match appointments to completed quiz sessions by email (consistent with individual affiliate metrics)
          const completedSessionEmails = affiliateData.completedSessionEmails || new Set<string>();
          const validBookedAppointments = affiliateData.appointments.filter((apt: any) => {
            if (!apt.customerEmail) return false;
            const appointmentEmail = apt.customerEmail.toLowerCase().trim();
            return completedSessionEmails.has(appointmentEmail);
          });
          
          tierBooked += validBookedAppointments.length;
          // Sales: count ALL affiliate sales (matches admin API and individual metrics)
          tierClosed += affiliateData.appointments.filter((a: any) => a.outcome === CallOutcome.converted).length;
        }
      });

      return {
        tier: tierName,
        clicks: tierClicks,
        quizStarts: tierQuizStarts,
        completed: tierCompleted,
        booked: tierBooked,
        closed: tierClosed,
      };
    });

    const affiliateData = {
      totalActiveAffiliates,
      totalPendingAffiliates,
        totalLeadsFromAffiliates,
        totalBookedCalls,
        totalSalesValue,
        totalCommissionsPaid,
        totalCommissionsPending,
        totalCommissionsEarned: totalCommissionsEarnedInPeriod, // Commissions earned in selected period
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
