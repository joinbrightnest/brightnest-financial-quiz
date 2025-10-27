import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { calculateAffiliateLeads } from "@/lib/lead-calculation";
import { verifyAdminAuth } from "@/lib/admin-auth-server";

const prisma = new PrismaClient();

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

    // ⚡ PERFORMANCE: Bulk fetch all data for ALL affiliates at once (4 queries instead of N*6 queries)
    const affiliateIds = affiliates.map(a => a.id);
    const referralCodes = affiliates.map(a => a.referralCode);

    const [allClicks, allConversions, allQuizSessions, allAppointments, allPayouts] = await Promise.all([
      prisma.affiliateClick.findMany({
        where: {
          affiliateId: { in: affiliateIds },
          createdAt: { gte: startDate },
        },
        select: {
          id: true,
          affiliateId: true,
          createdAt: true,
        },
      }),
      prisma.affiliateConversion.findMany({
        where: {
          affiliateId: { in: affiliateIds },
          createdAt: { gte: startDate },
        },
        select: {
          id: true,
          affiliateId: true,
          createdAt: true,
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
          createdAt: true,
        },
      }),
      prisma.affiliatePayout.findMany({
        where: {
          affiliateId: { in: affiliateIds },
          status: 'completed',
        },
        select: {
          id: true,
          affiliateId: true,
          amountDue: true,
        },
      }),
    ]);

    // Group data by affiliate (in-memory processing - FAST!)
    const dataByAffiliate = new Map();
    affiliates.forEach(aff => {
      dataByAffiliate.set(aff.id, {
        affiliate: aff,
        clicks: allClicks.filter(c => c.affiliateId === aff.id),
        conversions: allConversions.filter(c => c.affiliateId === aff.id),
        quizSessions: allQuizSessions.filter(s => s.affiliateCode === aff.referralCode),
        appointments: allAppointments.filter(a => a.affiliateCode === aff.referralCode),
        payouts: allPayouts.filter(p => p.affiliateId === aff.id),
      });
    });

    // Calculate performance metrics for each affiliate (using pre-fetched data)
    const affiliatePerformance = affiliates.map((affiliate) => {
      const data = dataByAffiliate.get(affiliate.id);
      if (!data) {
        console.error('No data found for affiliate:', affiliate.id);
        return null;
      }
      const { clicks, conversions, quizSessions, appointments, payouts } = data;

      // Calculate metrics from pre-fetched data
      const clickCount = clicks.length;
      const conversionCount = conversions.length;
      const quizCount = quizSessions.length;
      const completionCount = quizSessions.filter(session => session.status === "completed").length;
      
      // Count actual bookings and sales from appointments
      const bookingCount = appointments.length;
      const saleCount = appointments.filter(apt => apt.outcome === 'converted').length;

      // Calculate actual revenue from converted appointments
      const totalRevenue = appointments
        .filter(apt => apt.outcome === 'converted' && apt.saleValue)
        .reduce((sum, apt) => sum + (Number(apt.saleValue) || 0), 0);

      // Get actually PAID commissions from pre-fetched payouts
      const totalPaidCommission = payouts.reduce((sum, payout) => sum + Number(payout.amountDue || 0), 0);

      // Use stored commission from database for total earned
      const totalEarnedCommission = Number(affiliate.totalCommission || 0);

      // Calculate conversion rates
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
        // Funnel metrics
        visitors: clickCount,
        quizStarts: quizCount,
        completed: completionCount,
        bookedCall: bookingCount,
        sales: saleCount,
        // Conversion rates
        clickToQuizRate: clickToQuizRate,
        quizToCompletionRate: quizToCompletionRate,
        clickToCompletionRate: clickToCompletionRate,
        // Revenue
        totalRevenue: totalRevenue,
        totalCommission: totalEarnedCommission,
        totalPaidCommission: totalPaidCommission,
        // Dates
        createdAt: affiliate.createdAt,
        updatedAt: affiliate.updatedAt,
      };
    }).filter(Boolean); // Remove any null entries

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
    const overallClickToCompletionRate = totalVisitors > 0 ? (totalSales / totalVisitors) * 100 : 0; // Use sales, not completions

    // Get top performing affiliates
    const topAffiliates = affiliatePerformance
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    return NextResponse.json({
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
        // Individual affiliate performance
        affiliatePerformance,
        topAffiliates,
      },
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
