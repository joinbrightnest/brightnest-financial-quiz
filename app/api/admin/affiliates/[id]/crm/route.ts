import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/admin-auth-server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin authentication required" },
      { status: 401 }
    );
  }
  
  try {
    const { id: affiliateId } = await params;

    // Get affiliate data using raw SQL to include customTrackingLink
    const affiliateResult = await prisma.$queryRaw`
      SELECT * FROM "affiliates" 
      WHERE "id" = ${affiliateId}
      LIMIT 1
    `;
    
    const affiliate = Array.isArray(affiliateResult) && affiliateResult.length > 0 
      ? affiliateResult[0] 
      : null;

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Get all quiz sessions attributed to this affiliate
    // Include both original referral code and custom tracking link
    const whereClause = affiliate.custom_tracking_link 
      ? {
          OR: [
            { affiliateCode: affiliate.referral_code },
            { affiliateCode: affiliate.custom_tracking_link.replace('/', '') }
          ]
        }
      : {
          affiliateCode: affiliate.referral_code,
        };

    const allQuizSessions = await prisma.quizSession.findMany({
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
    });

    // Filter to only include sessions that have name and email (actual leads)
    // A lead is someone who completed the quiz AND provided contact information
    const quizSessionsWithContactInfo = allQuizSessions.filter(session => {
      const nameAnswer = session.answers.find(a => 
        a.question?.prompt?.toLowerCase().includes("name") || 
        a.question?.text?.toLowerCase().includes("name")
      );
      const emailAnswer = session.answers.find(a => 
        a.question?.prompt?.toLowerCase().includes("email") || 
        a.question?.text?.toLowerCase().includes("email")
      );
      
      return nameAnswer && emailAnswer && nameAnswer.value && emailAnswer.value;
    });

    // Transform the data for the CRM view
    const leads = quizSessionsWithContactInfo.map(session => {
      // Extract name and email from quiz answers (like general admin CRM)
      // Look for questions containing "name" or "email" in the text
      const nameAnswer = session.answers.find(a => 
        a.question?.prompt?.toLowerCase().includes("name") || 
        a.question?.text?.toLowerCase().includes("name")
      );
      const emailAnswer = session.answers.find(a => 
        a.question?.prompt?.toLowerCase().includes("email") || 
        a.question?.text?.toLowerCase().includes("email")
      );
      
      return {
        id: session.id,
        sessionId: session.id,
        quizType: session.quizType,
        name: nameAnswer?.value || nameAnswer?.answer || nameAnswer?.answerValue || "N/A",
        email: emailAnswer?.value || emailAnswer?.answer || emailAnswer?.answerValue || "N/A",
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
          questionText: answer.question?.prompt || "Unknown question",
          answer: answer.value,
          answerValue: answer.value,
        })),
        user: {
          email: emailAnswer?.value || emailAnswer?.answer || emailAnswer?.answerValue || "N/A",
          name: nameAnswer?.value || nameAnswer?.answer || nameAnswer?.answerValue || "N/A",
          role: "user",
        },
      };
    });

    // Calculate CRM stats - only count actual leads (completed sessions with contact info)
    const totalLeads = leads.filter(lead => lead.status === "completed").length;
    const totalCompletions = totalLeads; // Same as totalLeads since we only count actual leads
    const completionRate = leads.length > 0 ? (totalLeads / leads.length) * 100 : 0;
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

    // Quiz type distribution (only for completed leads)
    const quizTypeCounts: { [key: string]: number } = {};
    leads.filter(lead => lead.status === "completed").forEach(lead => {
      quizTypeCounts[lead.quizType] = (quizTypeCounts[lead.quizType] || 0) + 1;
    });

    const quizTypeDistribution = Object.entries(quizTypeCounts).map(([quizType, count]) => ({
      quizType,
      count,
      percentage: totalLeads > 0 ? (count / totalLeads) * 100 : 0,
    })).filter(item => item.count > 0); // Only show quiz types that have completed leads

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

    // Only return completed quiz sessions as leads (matching general admin CRM)
    const completedLeads = leads.filter(lead => lead.status === "completed");
    
    return NextResponse.json({
      leads: completedLeads,
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
