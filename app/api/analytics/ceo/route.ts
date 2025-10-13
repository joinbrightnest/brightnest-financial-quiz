import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
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

    const whereClause = {
      createdAt: {
        gte: startDate,
      },
    };

    // Get comprehensive CEO-level analytics
    const [
      totalSessions,
      completedSessions,
      quizTypeDistribution,
      archetypeDistribution,
      leadsGrowth,
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
      
      // Quiz type distribution
      prisma.quizSession.groupBy({
        by: ["quizType"],
        where: whereClause,
        _count: {
          quizType: true,
        },
        orderBy: {
          _count: {
            quizType: "desc",
          },
        },
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
        orderBy: {
          _count: {
            archetype: "desc",
          },
        },
      }),
      
      // Time-series data for growth chart
      getLeadsGrowthData(whereClause, dateRange),
    ]);

    // Calculate conversion rate
    const conversionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    // Process quiz type distribution
    const totalQuizTypes = quizTypeDistribution.reduce((sum, item) => sum + item._count.quizType, 0);
    const processedQuizTypeDistribution = quizTypeDistribution.map((item) => ({
      quizType: item.quizType,
      count: item._count.quizType,
      percentage: totalQuizTypes > 0 ? (item._count.quizType / totalQuizTypes) * 100 : 0,
      conversionRate: 75, // Mock conversion rate
    }));

    // Process archetype distribution
    const totalArchetypes = archetypeDistribution.reduce((sum, item) => sum + item._count.archetype, 0);
    const processedArchetypeDistribution = archetypeDistribution.map((item) => ({
      archetype: item.archetype,
      count: item._count.archetype,
      percentage: totalArchetypes > 0 ? (item._count.archetype / totalArchetypes) * 100 : 0,
    }));

    // Generate funnel data
    const funnelData = [
      { stage: "Visitors", count: totalSessions * 3, percentage: 100 },
      { stage: "Quiz Starts", count: totalSessions, percentage: 33.3 },
      { stage: "Completed", count: completedSessions, percentage: (completedSessions / totalSessions) * 33.3 },
      { stage: "Booked Call", count: Math.floor(completedSessions * 0.1), percentage: (Math.floor(completedSessions * 0.1) / totalSessions) * 33.3 },
      { stage: "Sale", count: Math.floor(completedSessions * 0.05), percentage: (Math.floor(completedSessions * 0.05) / totalSessions) * 33.3 },
    ];

    const ceoData = {
      // Global metrics
      totalLeads: totalSessions,
      totalCompletions: completedSessions,
      conversionRate,
      avgCompletionTime: 8, // Mock average completion time in minutes
      distinctArchetypes: archetypeDistribution.length,
      assessmentCategories: quizTypeDistribution.length,
      dropOffRate: 100 - conversionRate,

      // Distributions
      quizTypeDistribution: processedQuizTypeDistribution,
      archetypeDistribution: processedArchetypeDistribution,

      // Time-based data
      leadsGrowth,

      // Funnel data
      funnelData,

      // Additional CEO-specific metrics
      topPerformingQuiz: processedQuizTypeDistribution[0] || null,
      topArchetype: processedArchetypeDistribution[0] || null,
      growthRate: calculateGrowthRate(leadsGrowth),
      averageSessionValue: 150, // Mock average session value
      totalRevenue: Math.floor(completedSessions * 0.05 * 150), // Mock revenue calculation
    };

    return NextResponse.json(ceoData);
  } catch (error) {
    console.error("CEO Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch CEO analytics data" },
      { status: 500 }
    );
  }
}

async function getLeadsGrowthData(whereClause: any, dateRange: string) {
  const now = new Date();
  const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 365;
  const data = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));

    const [leads, completions] = await Promise.all([
      prisma.quizSession.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      }),
      prisma.quizSession.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
          status: "completed",
        },
      }),
    ]);

    data.push({
      date: dayStart.toISOString().split('T')[0],
      leads,
      completions,
    });
  }

  return data;
}

function calculateGrowthRate(leadsGrowth: any[]) {
  if (leadsGrowth.length < 2) return 0;
  
  const firstWeek = leadsGrowth.slice(0, 7).reduce((sum, day) => sum + day.leads, 0);
  const lastWeek = leadsGrowth.slice(-7).reduce((sum, day) => sum + day.leads, 0);
  
  if (firstWeek === 0) return 0;
  return ((lastWeek - firstWeek) / firstWeek) * 100;
}
