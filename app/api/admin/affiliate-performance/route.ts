import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    // Get detailed performance data for each affiliate
    const affiliatePerformance = await Promise.all(
      affiliates.map(async (affiliate) => {
        // Get clicks for this affiliate (with date filter)
        const clicks = await prisma.affiliateClick.findMany({
          where: {
            affiliateId: affiliate.id,
            createdAt: {
              gte: startDate,
            },
          },
        });

        // Get conversions for this affiliate (with date filter)
        const conversions = await prisma.affiliateConversion.findMany({
          where: {
            affiliateId: affiliate.id,
            createdAt: {
              gte: startDate,
            },
          },
        });

        // Get quiz sessions for this affiliate (with date filter)
        const quizSessions = await prisma.quizSession.findMany({
          where: {
            affiliateCode: affiliate.referralCode,
            createdAt: {
              gte: startDate,
            },
          },
        });

        // Get completed quiz sessions to find emails
        const completedQuizSessions = quizSessions.filter(session => session.status === "completed");
        const completedSessionIds = completedQuizSessions.map(s => s.id);
        
        // Get emails from completed quiz sessions by finding email answers (batch query for efficiency)
        const completedSessionEmails = new Set<string>();
        if (completedSessionIds.length > 0) {
          // Fetch all email answers for completed sessions in one query
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
          
          // Group by session ID to get the email for each session
          const emailsBySession = new Map<string, string>();
          emailAnswers.forEach(answer => {
            if (answer.value) {
              const email = String(answer.value).toLowerCase().trim();
              emailsBySession.set(answer.sessionId, email);
              completedSessionEmails.add(email);
            }
          });
        }

        // Get ALL appointments for this affiliate (with date filter)
        const allAppointments = await prisma.appointment.findMany({
          where: {
            affiliateCode: affiliate.referralCode,
            createdAt: {
              gte: startDate,
            },
          },
        });

        // For the funnel:
        // - "Completed" counts only completed quiz sessions (strict sequential requirement)
        // - "Booked Calls" counts appointments with completed quiz sessions (sequential flow)
        // - "Sales" counts ALL affiliate sales (includes direct bookings without quiz completion)
        // This ensures we show all affiliate sales while maintaining the quiz completion flow for bookings
        
        // Booked calls: only count appointments with completed quiz sessions (sequential flow)
        const validBookedAppointments = allAppointments.filter(apt => {
          const appointmentEmail = apt.customerEmail?.toLowerCase().trim();
          return appointmentEmail && completedSessionEmails.has(appointmentEmail);
        });
        
        // Sales: count ALL affiliate sales (all appointments with affiliate code and outcome='converted')
        // This matches Lead Analytics and shows all affiliate sales, even if they didn't complete the quiz
        const allAffiliateSales = allAppointments.filter(apt => apt.outcome === 'converted');

        // Calculate conversion rates
        const clickCount = clicks.length;
        const conversionCount = conversions.length;
        const quizCount = quizSessions.length;
        const completionCount = completedQuizSessions.length;
        
        // Count bookings (from appointments with completed quiz sessions) and sales (all affiliate sales)
        const bookingCount = validBookedAppointments.length;
        const saleCount = allAffiliateSales.length;

        // Calculate actual revenue from ALL converted affiliate appointments (total sale values)
        const convertedAppointments = allAffiliateSales.filter(apt => apt.saleValue);
        const totalRevenue = convertedAppointments.reduce((sum, apt) => sum + (Number(apt.saleValue) || 0), 0);

        // Calculate EARNED commission from converted appointments (respects date filter)
        // This is the commission that affiliates have earned in the selected period
        const totalEarnedCommission = convertedAppointments.reduce((sum, apt) => {
          const saleValue = Number(apt.saleValue || 0);
          return sum + (saleValue * Number(affiliate.commissionRate));
        }, 0);

        // Get actually PAID commissions (from completed payouts - for reference)
        let totalPaidCommission = 0;
        try {
          const payouts = await prisma.affiliatePayout.findMany({
            where: {
              affiliateId: affiliate.id,
              status: 'completed'
            }
          });
          totalPaidCommission = payouts.reduce((sum, payout) => sum + Number(payout.amountDue || 0), 0);
        } catch (error) {
          console.log('No payouts found for affiliate:', affiliate.id);
          totalPaidCommission = 0;
        }


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
