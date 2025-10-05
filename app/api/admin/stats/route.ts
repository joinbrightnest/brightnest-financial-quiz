import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "admin") {
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

    // Get recent sessions
    const recentSessions = await prisma.quizSession.findMany({
      where: { status: "completed" },
      include: { result: true },
      orderBy: { completedAt: "desc" },
      take: 10,
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
