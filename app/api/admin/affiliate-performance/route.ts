import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateAffiliateLeads } from "@/lib/lead-calculation";
import { verifyAdminAuth } from "@/lib/admin-auth-server";

export async function GET(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin authentication required" },
      { status: 401 }
    );
  }
  
  try {
    // Get all approved affiliates with their performance data
    const affiliates = await prisma.affiliate.findMany({
      where: {
        isApproved: true,
      },
      orderBy: {
        totalClicks: "desc",
      },
    });

    // Get detailed performance data for each affiliate
    const affiliatePerformance = await Promise.all(
      affiliates.map(async (affiliate) => {
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
        const saleCount = appointments.filter(apt => apt.outcome === 'converted').length;
        
        // Use centralized lead calculation with same date range as individual affiliate page (month)
        const leadData = await calculateAffiliateLeads(affiliate.id, 'month');
        const leadCount = leadData.totalLeads;

        // Calculate actual revenue from converted appointments (total sale values)
        const convertedAppointments = appointments.filter(apt => apt.outcome === 'converted' && apt.saleValue);
        const totalRevenue = convertedAppointments.reduce((sum, apt) => sum + (Number(apt.saleValue) || 0), 0);

        // Get actually PAID commissions (from completed payouts)
        let totalPaidCommission = 0;
        try {
          const payouts = await prisma.affiliatePayout.findMany({
            where: {
              affiliateId: affiliate.id,
              status: 'completed'
            }
          });
          totalPaidCommission = payouts.reduce((sum, payout) => sum + Number(payout.amount || 0), 0);
        } catch (error) {
          console.log('No payouts found for affiliate:', affiliate.id);
          totalPaidCommission = 0;
        }

        // Use stored commission from database for total earned (held + available + paid)
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
          bookedCall: bookingCount, // Use actual booking count
          sales: saleCount, // Use actual sale count
          // Conversion rates
          clickToQuizRate: clickToQuizRate,
          quizToCompletionRate: quizToCompletionRate,
          clickToCompletionRate: clickToCompletionRate,
          // Revenue
          totalRevenue: totalRevenue,
          totalCommission: totalEarnedCommission, // Total earned (all time)
          totalPaidCommission: totalPaidCommission, // Actually paid out
          // Dates
          createdAt: affiliate.createdAt,
          updatedAt: affiliate.updatedAt,
        };
      })
    );

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
