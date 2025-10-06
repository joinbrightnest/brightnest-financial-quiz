import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Simple admin authentication - check for admin code in headers
    const adminCode = request.headers.get("x-admin-code");
    
    if (adminCode !== "brightnest2025") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get basic stats
    const totalSessions = await prisma.quizSession.count();
    const completedSessions = await prisma.quizSession.count({
      where: { status: "completed" },
    });
    
    const avgDuration = await prisma.quizSession.aggregate({
      _avg: { durationMs: true },
      where: { status: "completed" },
    });

    // Get recent sessions with answers
    const recentSessions = await prisma.quizSession.findMany({
      where: { status: "completed" },
      include: { 
        result: true,
        answers: {
          include: {
            question: true,
          },
        },
      },
      orderBy: { completedAt: "desc" },
      take: 20,
    });

    // Get archetype distribution
    const archetypeStats = await prisma.result.groupBy({
      by: ["archetype"],
      _count: { archetype: true },
    });

    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    return NextResponse.json({
      totalSessions,
      completedSessions,
      completionRate: Math.round(completionRate * 100) / 100,
      avgDurationMs: avgDuration._avg.durationMs || 0,
      recentSessions,
      archetypeStats,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

