import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const affiliateId = params.id;

    // Get affiliate data
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Get all quiz sessions attributed to this affiliate
    const quizSessions = await prisma.quizSession.findMany({
      where: {
        affiliateCode: affiliate.referralCode,
      },
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
    });

    // Transform the data for the CRM view
    const leads = quizSessions.map(session => ({
      id: session.id,
      sessionId: session.id,
      quizType: session.quizType,
      startedAt: session.startedAt.toISOString(),
      completedAt: session.completedAt?.toISOString() || null,
      status: session.status,
      durationMs: session.durationMs,
      result: session.result ? {
        archetype: session.result.archetype,
        score: session.result.score,
        insights: session.result.insights || [],
      } : null,
      answers: session.answers.map(answer => ({
        questionId: answer.questionId,
        questionText: answer.question?.text || "Unknown question",
        answer: answer.answer,
        answerValue: answer.answerValue,
      })),
      user: session.user ? {
        email: session.user.email,
        role: session.user.role,
      } : null,
    }));

    // Calculate CRM stats
    const totalLeads = leads.length;
    const totalCompletions = leads.filter(lead => lead.status === "completed").length;
    const completionRate = totalLeads > 0 ? (totalCompletions / totalLeads) * 100 : 0;
    const averageCompletionTime = totalCompletions > 0 
      ? leads
          .filter(lead => lead.durationMs)
          .reduce((sum, lead) => sum + (lead.durationMs || 0), 0) / totalCompletions / 60000 // Convert to minutes
      : 0;

    // Get distinct archetypes
    const archetypes = leads
      .filter(lead => lead.result?.archetype)
      .map(lead => lead.result!.archetype);
    const distinctArchetypes = [...new Set(archetypes)];

    // Quiz type distribution
    const quizTypeCounts: { [key: string]: number } = {};
    leads.forEach(lead => {
      quizTypeCounts[lead.quizType] = (quizTypeCounts[lead.quizType] || 0) + 1;
    });

    const quizTypeDistribution = Object.entries(quizTypeCounts).map(([quizType, count]) => ({
      quizType,
      count,
      percentage: totalLeads > 0 ? (count / totalLeads) * 100 : 0,
    }));

    // Archetype distribution
    const archetypeCounts: { [key: string]: number } = {};
    archetypes.forEach(archetype => {
      archetypeCounts[archetype] = (archetypeCounts[archetype] || 0) + 1;
    });

    const archetypeDistribution = Object.entries(archetypeCounts).map(([archetype, count]) => ({
      archetype,
      count,
      percentage: totalLeads > 0 ? (count / totalLeads) * 100 : 0,
    }));

    const stats = {
      totalLeads,
      totalCompletions,
      completionRate,
      averageCompletionTime,
      distinctArchetypes: distinctArchetypes.length,
      quizTypeDistribution,
      archetypeDistribution,
    };

    return NextResponse.json({
      leads,
      stats,
    });
  } catch (error) {
    console.error("Error fetching affiliate CRM data:", error);
    return NextResponse.json(
      { error: "Failed to fetch CRM data" },
      { status: 500 }
    );
  }
}
