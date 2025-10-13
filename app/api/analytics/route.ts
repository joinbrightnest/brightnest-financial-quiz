import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const quizType = searchParams.get("quizType") || "all";
    const dateRange = searchParams.get("dateRange") || "30d";

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

    // Build where clause
    const whereClause: any = {
      createdAt: {
        gte: startDate,
      },
    };

    if (quizType !== "all") {
      whereClause.quizType = quizType;
    }

    // Get basic metrics
    const [
      totalSessions,
      completedSessions,
      quizSessions,
      archetypeData,
      quizTypeDistribution,
    ] = await Promise.all([
      // Total sessions
      prisma.quizSession.count({
        where: whereClause,
      }),
      
      // Completed sessions
      prisma.quizSession.count({
        where: {
          ...whereClause,
          status: "completed",
        },
      }),
      
      // Detailed session data
      prisma.quizSession.findMany({
        where: whereClause,
        include: {
          user: true,
          result: true,
          answers: {
            include: {
              question: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 100, // Limit for performance
      }),
      
      // Archetype distribution
      prisma.result.groupBy({
        by: ["archetype"],
        where: {
          session: whereClause,
        },
        _count: {
          archetype: true,
        },
      }),
      
      // Quiz type distribution
      prisma.quizSession.groupBy({
        by: ["quizType"],
        where: whereClause,
        _count: {
          quizType: true,
        },
      }),
    ]);

    // Calculate conversion rate
    const conversionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    // Process archetype data
    const totalArchetypes = archetypeData.reduce((sum, item) => sum + item._count.archetype, 0);
    const archetypeDistribution = archetypeData.map((item) => ({
      archetype: item.archetype,
      count: item._count.archetype,
      percentage: totalArchetypes > 0 ? (item._count.archetype / totalArchetypes) * 100 : 0,
    }));

    // Process quiz type distribution
    const totalQuizTypes = quizTypeDistribution.reduce((sum, item) => sum + item._count.quizType, 0);
    const processedQuizTypeDistribution = quizTypeDistribution.map((item) => ({
      quizType: item.quizType,
      count: item._count.quizType,
      percentage: totalQuizTypes > 0 ? (item._count.quizType / totalQuizTypes) * 100 : 0,
      conversionRate: 75, // Mock conversion rate - would need more complex query
    }));

    // Calculate average completion time
    const completedSessionsWithDuration = await prisma.quizSession.findMany({
      where: {
        ...whereClause,
        status: "completed",
        durationMs: {
          not: null,
        },
      },
      select: {
        durationMs: true,
      },
    });

    const avgCompletionTime = completedSessionsWithDuration.length > 0
      ? completedSessionsWithDuration.reduce((sum, session) => sum + (session.durationMs || 0), 0) / completedSessionsWithDuration.length
      : 0;

    // Get distinct quiz types count
    const distinctQuizTypes = await prisma.quizSession.groupBy({
      by: ["quizType"],
      where: whereClause,
    });

    // Generate mock leads growth data (would need more complex time-series query)
    const leadsGrowth = generateMockLeadsGrowth(dateRange);

    // Generate mock funnel data
    const funnelData = [
      { stage: "Visitors", count: totalSessions * 3, percentage: 100 },
      { stage: "Quiz Starts", count: totalSessions, percentage: 33.3 },
      { stage: "Completed", count: completedSessions, percentage: (completedSessions / totalSessions) * 33.3 },
      { stage: "Booked Call", count: Math.floor(completedSessions * 0.1), percentage: (Math.floor(completedSessions * 0.1) / totalSessions) * 33.3 },
      { stage: "Sale", count: Math.floor(completedSessions * 0.05), percentage: (Math.floor(completedSessions * 0.05) / totalSessions) * 33.3 },
    ];

    // Generate archetype segments with mock behavioral data
    const archetypeSegments = archetypeDistribution.map((item) => ({
      archetype: item.archetype,
      totalLeads: item.count,
      percentage: item.percentage,
      avgCompletionTime: Math.floor(avgCompletionTime / 1000 / 60), // Convert to minutes
      behaviors: getArchetypeBehaviors(item.archetype),
      trend: Math.floor(Math.random() * 20) - 10, // Mock trend data
    }));

    const analyticsData = {
      // Global metrics
      totalLeads: totalSessions,
      totalCompletions: completedSessions,
      conversionRate,
      avgCompletionTime: Math.floor(avgCompletionTime / 1000 / 60), // Convert to minutes
      distinctArchetypes: archetypeData.length,
      assessmentCategories: distinctQuizTypes.length,
      dropOffRate: 100 - conversionRate,

      // Distributions
      quizTypeDistribution: processedQuizTypeDistribution,
      archetypeDistribution,

      // Detailed data
      quizSessions: quizSessions.map((session) => ({
        id: session.id,
        quizType: session.quizType,
        status: session.status,
        startedAt: session.startedAt.toISOString(),
        completedAt: session.completedAt?.toISOString(),
        durationMs: session.durationMs,
        user: session.user ? { email: session.user.email } : undefined,
        result: session.result ? {
          archetype: session.result.archetype,
          scores: session.result.scores,
        } : undefined,
        answers: session.answers.map((answer) => ({
          id: answer.id,
          questionId: answer.questionId,
          value: answer.value,
          createdAt: answer.createdAt.toISOString(),
          question: {
            prompt: answer.question.prompt,
            type: answer.question.type,
          },
        })),
      })),

      archetypeSegments,

      // Time-based data
      leadsGrowth,

      // Funnel data
      funnelData,
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}

function generateMockLeadsGrowth(dateRange: string) {
  const now = new Date();
  const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 365;
  const data = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toISOString().split('T')[0],
      leads: Math.floor(Math.random() * 50) + 10,
      completions: Math.floor(Math.random() * 30) + 5,
    });
  }

  return data;
}

function getArchetypeBehaviors(archetype: string): string[] {
  const behaviorMap: { [key: string]: string[] } = {
    "Stability Seeker": ["Conservative spending", "Emergency fund priority", "Risk-averse investing"],
    "Growth Optimizer": ["Aggressive investing", "Long-term planning", "Market research"],
    "Balanced Builder": ["Diversified portfolio", "Moderate risk", "Regular savings"],
    "Freedom Fighter": ["Debt elimination", "Financial independence", "Minimalist lifestyle"],
    "Family Provider": ["Education savings", "Life insurance", "Estate planning"],
    "Adventure Seeker": ["Experiential spending", "Travel budget", "Flexible income"],
  };

  return behaviorMap[archetype] || ["Financial planning", "Goal setting", "Budget management"];
}
