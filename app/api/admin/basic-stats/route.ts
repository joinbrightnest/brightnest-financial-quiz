import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE() {
  try {
    // Delete all quiz data
    await prisma.quizAnswer.deleteMany();
    await prisma.result.deleteMany();
    await prisma.quizSession.deleteMany();
    
    return NextResponse.json({ success: true, message: "All metrics reset successfully" });
  } catch (error) {
    console.error("Error resetting metrics:", error);
    return NextResponse.json(
      { error: "Failed to reset metrics" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const activityTimeframe = searchParams.get('activity') || 'daily';
  const quizType = searchParams.get('quizType') || null;
  const affiliateCode = searchParams.get('affiliateCode') || null;
  
  try {
    // Get total sessions (all quiz attempts)
    const totalSessions = await prisma.quizSession.count({
      where: quizType ? { quizType } : {}
    });
    
    // Calculate average duration for completed sessions
    const avgDurationResult = await prisma.quizSession.aggregate({
      _avg: { durationMs: true },
      where: { 
        status: "completed",
        durationMs: { not: null },
        ...(quizType ? { quizType } : {})
      },
    });

    // Get all leads (completed sessions - anyone who completed the quiz is a lead)
    const allLeads = await prisma.quizSession.findMany({
      where: {
        status: "completed",
        ...(quizType ? { quizType } : {})
      },
      include: { 
        result: true,
        answers: {
          include: {
            question: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Get archetype distribution
    const archetypeStats = await prisma.result.groupBy({
      by: ["archetype"],
      _count: { archetype: true },
    });

    // Calculate completion rate (using leads as completed sessions)
    const completedSessions = allLeads.length;
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    // Get behavior analytics - drop-off rates per question
    const totalQuestions = await prisma.quizQuestion.count({
      where: { 
        active: true,
        ...(quizType ? { quizType } : {})
      }
    });

    // Get all questions ordered by their order field
    const allQuestions = await prisma.quizQuestion.findMany({
      where: { 
        active: true,
        ...(quizType ? { quizType } : {})
      },
      orderBy: { order: 'asc' }
    });

    const questionAnalytics = await Promise.all(
      allQuestions.map(async (question) => {
        // Count unique sessions that answered this question
        const uniqueSessionsAnswered = await prisma.quizAnswer.findMany({
          where: { questionId: question.id },
          select: { sessionId: true },
          distinct: ['sessionId']
        });

        const answeredCount = uniqueSessionsAnswered.length;

        // Calculate retention rate (how many people are still in the quiz)
        const retentionRate = totalSessions > 0 ? (answeredCount / totalSessions) * 100 : 0;

        return {
          questionNumber: question.order,
          questionText: question.prompt,
          answeredCount,
          retentionRate: Math.round(retentionRate * 100) / 100,
        };
      })
    );

    // Get activity data based on timeframe
    const getActivityData = async (timeframe: string) => {
      const now = new Date();
      const startDate = new Date();

      switch (timeframe) {
        case 'hourly':
          startDate.setHours(now.getHours() - 24);
          break;
        case 'daily':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'weekly':
          startDate.setDate(now.getDate() - 30);
          break;
        case 'monthly':
          startDate.setMonth(now.getMonth() - 12);
          break;
        default:
          startDate.setDate(now.getDate() - 7);
      }

      // Get all sessions in the timeframe
      const sessions = await prisma.quizSession.findMany({
        where: {
          createdAt: {
            gte: startDate
          },
          ...(quizType ? { quizType } : {})
        },
        select: {
          createdAt: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // Group sessions by timeframe
      const groupedData: { [key: string]: number } = {};
      
      sessions.forEach(session => {
        const date = new Date(session.createdAt);
        let key: string;
        
        switch (timeframe) {
          case 'hourly':
            key = date.toISOString().slice(0, 13); // YYYY-MM-DDTHH
            break;
          case 'daily':
            key = date.toISOString().slice(0, 10); // YYYY-MM-DD
            break;
          case 'weekly':
            // Get start of week (Monday)
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay() + 1);
            key = weekStart.toISOString().slice(0, 10);
            break;
          case 'monthly':
            key = date.toISOString().slice(0, 7); // YYYY-MM
            break;
          default:
            key = date.toISOString().slice(0, 10);
        }
        
        groupedData[key] = (groupedData[key] || 0) + 1;
      });

      // Convert to array format with properly formatted dates
      return Object.entries(groupedData).map(([key, count]) => {
        let formattedDate: string;
        
        switch (timeframe) {
          case 'hourly':
            // Convert YYYY-MM-DDTHH to a proper date string
            formattedDate = new Date(key + ':00:00.000Z').toISOString();
            break;
          case 'daily':
            // Convert YYYY-MM-DD to a proper date string
            formattedDate = new Date(key + 'T00:00:00.000Z').toISOString();
            break;
          case 'weekly':
            // Convert YYYY-MM-DD to a proper date string
            formattedDate = new Date(key + 'T00:00:00.000Z').toISOString();
            break;
          case 'monthly':
            // Convert YYYY-MM to a proper date string
            formattedDate = new Date(key + '-01T00:00:00.000Z').toISOString();
            break;
          default:
            formattedDate = new Date(key + 'T00:00:00.000Z').toISOString();
        }
        
        return {
          createdAt: formattedDate,
          _count: { id: count }
        };
      });
    };

    const dailyActivity = await getActivityData(activityTimeframe);

    // Calculate new metrics
    const visitors = totalSessions; // Total unique visitors who started the quiz
    const partialSubmissions = totalSessions - completedSessions; // Started but didn't complete
    const leadsCollected = allLeads.length; // Count completed sessions (all completed quizzes are leads)
    const averageTimeMs = avgDurationResult._avg.durationMs || 0; // Average time in milliseconds

    // Get top 3 questions responsible for biggest drop-offs (questions that CAUSE the drop)
    const questionsWithDrops = questionAnalytics
      .filter((q): q is NonNullable<typeof q> => q !== null)
      .map((q, index) => {
        const previousQuestion = index > 0 ? questionAnalytics[index - 1] : null;
        
        // Calculate drop from previous question
        let dropFromPrevious = 0;
        let previousRetentionRate = 100; // Default to 100% for first question
        
        if (previousQuestion) {
          previousRetentionRate = previousQuestion.retentionRate;
          dropFromPrevious = previousRetentionRate - q.retentionRate;
        } else {
          // For the first question, calculate drop from 100% (all users who started)
          dropFromPrevious = 100 - q.retentionRate;
        }
        
        return {
          questionNumber: q.questionNumber,
          questionText: q.questionText,
          dropFromPrevious: Math.round(dropFromPrevious * 100) / 100,
          retentionRate: q.retentionRate,
          previousRetentionRate: previousRetentionRate
        };
      })
      .filter(q => q.dropFromPrevious > 0) // Only questions that caused a drop
      .sort((a, b) => b.dropFromPrevious - a.dropFromPrevious)
      .slice(0, 3); // Top 3 questions responsible for drops

    // Get all quiz types for dashboard integration
    const quizTypes = await prisma.quizQuestion.groupBy({
      by: ['quizType'],
      _count: {
        id: true,
      },
      where: {
        active: true,
      },
    });

    const formattedQuizTypes = quizTypes.map(quizType => {
      const displayName = quizType.quizType
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      const getDescription = (type: string) => {
        switch (type) {
          case 'financial-profile':
            return 'General financial personality assessment';
          case 'health-finance':
            return 'Healthcare and medical expense management';
          case 'marriage-finance':
            return 'Couples financial planning and management';
          default:
            return 'Custom quiz created by user';
        }
      };

      return {
        name: quizType.quizType,
        displayName: displayName,
        description: getDescription(quizType.quizType),
        questionCount: quizType._count.id,
      };
    });

    // Add affiliate data if affiliateCode is provided
    let affiliateData = null;
    if (affiliateCode) {
      console.log("Looking for affiliate with code:", affiliateCode);
      try {
        const affiliate = await prisma.affiliate.findUnique({
          where: { referralCode: affiliateCode },
        });

        console.log("Affiliate lookup result:", affiliate ? "Found" : "Not found");
        if (affiliate) {
          console.log("Found affiliate:", affiliate.id, affiliate.referralCode, affiliate.name);
          
          const [clicks, conversions] = await Promise.all([
            prisma.affiliateClick.findMany({
              where: { affiliateId: affiliate.id },
              orderBy: { createdAt: "desc" },
              take: 10
            }),
            prisma.affiliateConversion.findMany({
              where: { affiliateId: affiliate.id },
              orderBy: { createdAt: "desc" },
              take: 10
            })
          ]);
          
          console.log("Retrieved clicks:", clicks.length, "conversions:", conversions.length);

          const totalClicks = clicks.length;
          const totalLeads = conversions.filter((c: any) => c.status === "completed").length;
          const totalBookings = conversions.filter((c: any) => c.conversionType === "booking").length;
          const totalSales = conversions.filter((c: any) => c.conversionType === "sale").length;
          const totalCommission = conversions.reduce((sum: number, c: any) => sum + Number(c.commissionAmount || 0), 0);
          const conversionRate = totalClicks > 0 ? (totalSales / totalClicks) * 100 : 0;

          affiliateData = {
            affiliate: {
              id: affiliate.id,
              name: affiliate.name,
              email: affiliate.email,
              tier: affiliate.tier,
              referralCode: affiliate.referralCode,
              customLink: affiliate.customLink,
              commissionRate: affiliate.commissionRate,
              totalClicks: affiliate.totalClicks,
              totalLeads: affiliate.totalLeads,
              totalBookings: affiliate.totalBookings,
              totalSales: affiliate.totalSales,
              totalCommission: affiliate.totalCommission,
              isApproved: affiliate.isApproved,
              createdAt: affiliate.createdAt,
              updatedAt: affiliate.updatedAt
            },
            stats: {
              totalClicks,
              totalLeads,
              totalBookings,
              totalSales,
              totalCommission,
              conversionRate,
              averageSaleValue: totalSales > 0 ? totalCommission / totalSales : 0,
              pendingCommission: 0,
              paidCommission: 0,
              dailyStats: []
            },
            clicks: clicks.map((click: any) => ({
              id: click.id,
              createdAt: click.createdAt,
              ipAddress: click.ipAddress
            })),
            conversions: conversions.map((conv: any) => ({
              id: conv.id,
              conversionType: conv.conversionType,
              status: conv.status,
              createdAt: conv.createdAt,
              value: conv.value
            }))
          };
        }
      } catch (error) {
        console.error("Error fetching affiliate data:", error);
        // Don't provide fallback data - let the error bubble up
        affiliateData = null;
      }
    }

    return NextResponse.json({
      totalSessions,
      completedSessions,
      completionRate: Math.round(completionRate * 100) / 100,
      avgDurationMs: avgDurationResult._avg.durationMs || 0,
      allLeads,
      archetypeStats,
      questionAnalytics: questionAnalytics.filter(Boolean),
      dailyActivity,
      // New metrics
      visitors,
      partialSubmissions,
      leadsCollected,
      averageTimeMs,
      topDropOffQuestions: questionsWithDrops,
      quizTypes: formattedQuizTypes,
      affiliateData,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({
      totalSessions: 0,
      completedSessions: 0,
      completionRate: 0,
      avgDurationMs: 0,
      allLeads: [],
      archetypeStats: [],
      questionAnalytics: [],
      dailyActivity: [],
      visitors: 0,
      partialSubmissions: 0,
      leadsCollected: 0,
      averageTimeMs: 0,
      topDropOffQuestions: [],
    });
  }
}
