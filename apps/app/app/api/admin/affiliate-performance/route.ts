import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/admin-auth-server";
import { Redis } from '@upstash/redis';
import { ADMIN_CONSTANTS } from '@/app/admin/constants';

// Initialize Redis client for caching (optional)
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export async function GET(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin authentication required" },
      { status: 401 }
    );
  }

  try {
    // Get date range filter from query params
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get("dateRange") || "all";
    const nocache = searchParams.get('nocache') === 'true'; // Bypass cache for refresh button

    // 🚀 PERFORMANCE: Check cache first (5 minute TTL) - unless nocache is requested
    const cacheKey = `admin:affiliate-performance:${dateRange}`;

    if (redis && !nocache) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return NextResponse.json(cached, {
            headers: {
              'X-Cache': 'HIT',
              'Cache-Control': `public, s-maxage=${ADMIN_CONSTANTS.CACHE.DASHBOARD_STATS_TTL}, stale-while-revalidate=${ADMIN_CONSTANTS.CACHE.DASHBOARD_STATS_TTL}`
            }
          });
        }
      } catch (error) {
        console.warn('Cache read failed (non-critical):', error);
        // Continue with normal flow if cache fails
      }
    }

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

    // Get all approved affiliates with their performance data
    const affiliates = await prisma.affiliate.findMany({
      where: {
        isApproved: true,
      },
      orderBy: {
        totalClicks: "desc",
      },
    });

    // 🚀 PERFORMANCE: Batch fetch all related data to avoid N+1 queries
    const affiliateIds = affiliates.map(a => a.id);
    const referralCodes = affiliates.map(a => a.referralCode);

    // Parallelize all batch queries
    const [
      allClicks,
      allConversions,
      allQuizSessions,
      allAppointments,
      allPayouts
    ] = await Promise.all([
      // 1. Get all clicks for these affiliates
      prisma.affiliateClick.findMany({
        where: {
          affiliateId: { in: affiliateIds },
          createdAt: { gte: startDate }
        }
      }),
      // 2. Get all conversions for these affiliates
      prisma.affiliateConversion.findMany({
        where: {
          affiliateId: { in: affiliateIds },
          createdAt: { gte: startDate }
        }
      }),
      // 3. Get all quiz sessions for these referral codes
      prisma.quizSession.findMany({
        where: {
          affiliateCode: { in: referralCodes },
          createdAt: { gte: startDate }
        }
      }),
      // 4. Get all appointments for these referral codes
      prisma.appointment.findMany({
        where: {
          affiliateCode: { in: referralCodes },
          createdAt: { gte: startDate }
        }
      }),
      // 5. Get all payouts for these affiliates
      prisma.affiliatePayout.findMany({
        where: {
          affiliateId: { in: affiliateIds },
          status: 'completed' // Filter by status directly in query
        }
      })
    ]);

    // Group data by affiliate ID or Referral Code for O(1) lookup
    const clicksByAffiliateId = new Map<string, typeof allClicks>();
    allClicks.forEach(click => {
      const list = clicksByAffiliateId.get(click.affiliateId) || [];
      list.push(click);
      clicksByAffiliateId.set(click.affiliateId, list);
    });

    const conversionsByAffiliateId = new Map<string, typeof allConversions>();
    allConversions.forEach(conv => {
      const list = conversionsByAffiliateId.get(conv.affiliateId) || [];
      list.push(conv);
      conversionsByAffiliateId.set(conv.affiliateId, list);
    });

    const payoutsByAffiliateId = new Map<string, typeof allPayouts>();
    allPayouts.forEach(payout => {
      const list = payoutsByAffiliateId.get(payout.affiliateId) || [];
      list.push(payout);
      payoutsByAffiliateId.set(payout.affiliateId, list);
    });

    const sessionsByReferralCode = new Map<string, typeof allQuizSessions>();
    allQuizSessions.forEach(session => {
      if (session.affiliateCode) {
        const list = sessionsByReferralCode.get(session.affiliateCode) || [];
        list.push(session);
        sessionsByReferralCode.set(session.affiliateCode, list);
      }
    });

    const appointmentsByReferralCode = new Map<string, typeof allAppointments>();
    allAppointments.forEach(app => {
      if (app.affiliateCode) {
        const list = appointmentsByReferralCode.get(app.affiliateCode) || [];
        list.push(app);
        appointmentsByReferralCode.set(app.affiliateCode, list);
      }
    });

    // Fetch emails for completed sessions in ONE batch query
    const completedSessionIds = allQuizSessions
      .filter(s => s.status === "completed")
      .map(s => s.id);

    let completedSessionEmails = new Map<string, string>(); // sessionId -> email

    if (completedSessionIds.length > 0) {
      const emailAnswers = await prisma.quizAnswer.findMany({
        where: {
          sessionId: { in: completedSessionIds },
          OR: [
            { question: { type: 'email' } },
            { question: { prompt: { contains: 'email', mode: 'insensitive' } } }
          ]
        },
        select: {
          sessionId: true,
          value: true
        }
      });

      emailAnswers.forEach(answer => {
        if (answer.value) {
          const email = String(answer.value).toLowerCase().trim();
          completedSessionEmails.set(answer.sessionId, email);
        }
      });
    }

    // Process each affiliate using in-memory data
    const affiliatePerformance = affiliates.map((affiliate) => {
      const clicks = clicksByAffiliateId.get(affiliate.id) || [];
      const conversions = conversionsByAffiliateId.get(affiliate.id) || [];
      const quizSessions = sessionsByReferralCode.get(affiliate.referralCode) || [];
      const allAppointments = appointmentsByReferralCode.get(affiliate.referralCode) || [];
      const payouts = payoutsByAffiliateId.get(affiliate.id) || [];

      // Get completed quiz sessions
      const completedQuizSessions = quizSessions.filter(session => session.status === "completed");

      // Get emails for THIS affiliate's completed sessions
      const affiliateSessionEmails = new Set<string>();
      completedQuizSessions.forEach(session => {
        const email = completedSessionEmails.get(session.id);
        if (email) {
          affiliateSessionEmails.add(email);
        }
      });

      // Match appointments
      const validBookedAppointments = allAppointments.filter(apt => {
        if (!apt.customerEmail) return false;
        const appointmentEmail = apt.customerEmail.toLowerCase().trim();
        return affiliateSessionEmails.has(appointmentEmail);
      });

      const allAffiliateSales = allAppointments.filter(apt => apt.outcome === 'converted');

      // Calculate metrics
      const clickCount = clicks.length;
      const conversionCount = conversions.length;
      const quizCount = quizSessions.length;
      const completionCount = completedQuizSessions.length;
      const bookingCount = validBookedAppointments.length;
      const saleCount = allAffiliateSales.length;

      // Revenue & Commission
      const convertedAppointments = allAffiliateSales.filter(apt => apt.saleValue);
      const totalRevenue = convertedAppointments.reduce((sum, apt) => sum + (Number(apt.saleValue) || 0), 0);

      const totalEarnedCommission = convertedAppointments.reduce((sum, apt) => {
        const saleValue = Number(apt.saleValue || 0);
        return sum + (saleValue * Number(affiliate.commissionRate));
      }, 0);

      const totalPaidCommission = payouts.reduce((sum, payout) => sum + Number(payout.amountDue || 0), 0);

      // Rates
      const clickToQuizRate = clickCount > 0 ? (quizCount / clickCount) * 100 : 0;
      const quizToCompletionRate = quizCount > 0 ? (completionCount / quizCount) * 100 : 0;
      const clickToCompletionRate = clickCount > 0 ? (completionCount / clickCount) * 100 : 0;

      return {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        referralCode: affiliate.referralCode,
        customLink: affiliate.customLink,
        tier: affiliate.tier,
        commissionRate: affiliate.commissionRate,
        visitors: clickCount,
        quizStarts: quizCount,
        completed: completionCount,
        bookedCall: bookingCount,
        sales: saleCount,
        clickToQuizRate,
        quizToCompletionRate,
        clickToCompletionRate,
        totalRevenue,
        totalCommission: totalEarnedCommission,
        totalPaidCommission,
        createdAt: affiliate.createdAt,
        updatedAt: affiliate.updatedAt,
      };
    });

    // Calculate overall affiliate stats
    const totalAffiliates = affiliatePerformance.length;
    const totalVisitors = affiliatePerformance.reduce((sum, aff) => sum + aff.visitors, 0);
    const totalQuizStarts = affiliatePerformance.reduce((sum, aff) => sum + aff.quizStarts, 0);
    const totalCompleted = affiliatePerformance.reduce((sum, aff) => sum + aff.completed, 0);
    const totalBookedCalls = affiliatePerformance.reduce((sum, aff) => sum + aff.bookedCall, 0);
    const totalSales = affiliatePerformance.reduce((sum, aff) => sum + aff.sales, 0);
    const totalRevenue = affiliatePerformance.reduce((sum, aff) => sum + aff.totalRevenue, 0);
    const totalCommission = affiliatePerformance.reduce((sum, aff) => sum + aff.totalCommission, 0); // Total earned
    const totalPaidCommission = affiliatePerformance.reduce((sum, aff) => sum + aff.totalPaidCommission, 0); // Actually paid

    // Calculate overall conversion rates
    const overallClickToQuizRate = totalVisitors > 0 ? (totalQuizStarts / totalVisitors) * 100 : 0;
    const overallQuizToCompletionRate = totalQuizStarts > 0 ? (totalCompleted / totalQuizStarts) * 100 : 0;
    // Click to Completion Rate: percentage of visitors who completed the quiz
    const overallClickToCompletionRate = totalVisitors > 0 ? (totalCompleted / totalVisitors) * 100 : 0;
    // Click to Sales Rate: percentage of visitors who made a purchase (separate metric)
    const overallClickToSalesRate = totalVisitors > 0 ? (totalSales / totalVisitors) * 100 : 0;

    // Get top performing affiliates
    const topAffiliates = affiliatePerformance
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    const responseData = {
      success: true,
      data: {
        // Overall stats
        totalAffiliates,
        totalVisitors,
        totalQuizStarts,
        totalCompleted,
        totalBookedCalls,
        totalSales,
        totalRevenue,
        totalCommission, // Total earned commissions (all time)
        totalPaidCommission, // Actually paid commissions
        overallClickToQuizRate,
        overallQuizToCompletionRate,
        overallClickToCompletionRate,
        overallClickToSalesRate,
        // Individual affiliate performance
        affiliatePerformance,
        topAffiliates,
      },
    };

    // Cache the result for 5 minutes (300 seconds)
    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(responseData), { ex: ADMIN_CONSTANTS.CACHE.DASHBOARD_STATS_TTL });
      } catch (e) {
        console.error('Redis set error:', e);
      }
    }

    return NextResponse.json(responseData, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': `public, s-maxage=${ADMIN_CONSTANTS.CACHE.DASHBOARD_STATS_TTL}, stale-while-revalidate=${ADMIN_CONSTANTS.CACHE.DASHBOARD_STATS_TTL}`
      }
    });
  } catch (error) {
    console.error("Error fetching affiliate performance:", error);
    console.error("Error details:", error instanceof Error ? error.message : 'Unknown error');
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      {
        error: "Failed to fetch affiliate performance data",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
