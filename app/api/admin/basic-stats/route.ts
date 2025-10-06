import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  try {
    // Get total sessions (all quiz attempts)
    const totalSessions = await prisma.quizSession.count();
    
    // Get completed sessions (where all questions were answered)
    const completedSessions = await prisma.quizSession.count({
      where: { status: "completed" },
    });

    // Calculate average duration for completed sessions
    const avgDurationResult = await prisma.quizSession.aggregate({
      _avg: { durationMs: true },
      where: { 
        status: "completed",
        durationMs: { not: null }
      },
    });

    // Get all leads (sessions with name and email, completed or not)
    const allLeads = await prisma.quizSession.findMany({
      where: {
        answers: {
          some: {
            question: {
              type: "email"
            }
          }
        }
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

    // Calculate completion rate
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    // Get behavior analytics - drop-off rates per question
    const totalQuestions = await prisma.quizQuestion.count({
      where: { active: true }
    });

    const questionAnalytics = await Promise.all(
      Array.from({ length: totalQuestions }, async (_, index) => {
        const questionNumber = index + 1;
        const question = await prisma.quizQuestion.findFirst({
          where: { 
            active: true,
            order: questionNumber 
          }
        });

        if (!question) return null;

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
          questionNumber,
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
          }
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

      // Convert to array format
      return Object.entries(groupedData).map(([createdAt, count]) => ({
        createdAt,
        _count: { id: count }
      }));
    };

    const dailyActivity = await getActivityData(activityTimeframe);

    // Calculate new metrics
    const visitors = totalSessions; // Total unique visitors who started the quiz
    const partialSubmissions = totalSessions - completedSessions; // Started but didn't complete
    const leadsCollected = allLeads.length; // Count unique sessions with email answers (consistent with allLeads)

    // Get top 3 questions responsible for biggest drop-offs (questions that CAUSE the drop)
    const questionsWithDrops = questionAnalytics
      .filter((q): q is NonNullable<typeof q> => q !== null)
      .map((q, index) => {
        const previousQuestion = index > 0 ? questionAnalytics[index - 1] : null;
        const dropFromPrevious = previousQuestion ? previousQuestion.retentionRate - q.retentionRate : 0;
        
        return {
          questionNumber: q.questionNumber,
          questionText: q.questionText,
          dropFromPrevious: Math.round(dropFromPrevious * 100) / 100,
          retentionRate: q.retentionRate,
          previousRetentionRate: previousQuestion?.retentionRate || 100
        };
      })
      .filter(q => q.dropFromPrevious > 0) // Only questions that caused a drop
      .sort((a, b) => b.dropFromPrevious - a.dropFromPrevious)
      .slice(0, 3); // Top 3 questions responsible for drops

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
      topDropOffQuestions: questionsWithDrops,
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
      topDropOffQuestions: [],
    });
  }
}
