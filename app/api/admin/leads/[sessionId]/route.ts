import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    // Get the quiz session with all related data
    const quizSession = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        user: true,
        result: true,
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!quizSession) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    // Get affiliate information if this session has an affiliate code
    let affiliate = null;
    if (quizSession.affiliateCode) {
      // First try to find by referral code
      affiliate = await prisma.affiliate.findUnique({
        where: { referralCode: quizSession.affiliateCode },
        select: {
          name: true,
          referralCode: true,
        }
      });

      // If not found, try to find by custom tracking link
      if (!affiliate) {
        const affiliateResult = await prisma.$queryRaw`
          SELECT "name", "referral_code"
          FROM "affiliates"
          WHERE "custom_tracking_link" = ${`/${quizSession.affiliateCode}`}
          LIMIT 1
        `;
        
        if (Array.isArray(affiliateResult) && affiliateResult.length > 0) {
          affiliate = {
            name: affiliateResult[0].name,
            referralCode: affiliateResult[0].referral_code,
          };
        }
      }
    }

    // Extract name and email from quiz answers (like general admin CRM)
    const nameAnswer = quizSession.answers.find(a =>
      a.question?.prompt?.toLowerCase().includes("name") ||
      a.question?.text?.toLowerCase().includes("name")
    );
    const emailAnswer = quizSession.answers.find(a =>
      a.question?.prompt?.toLowerCase().includes("email") ||
      a.question?.text?.toLowerCase().includes("email")
    );

    // Transform the data for the lead details view
    const leadData = {
      id: quizSession.id,
      sessionId: quizSession.id,
      quizType: quizSession.quizType,
      startedAt: quizSession.startedAt.toISOString(),
      completedAt: quizSession.completedAt?.toISOString() || null,
      status: quizSession.status,
      durationMs: quizSession.durationMs,
      result: quizSession.result ? {
        archetype: quizSession.result.archetype,
        score: quizSession.result.score,
        insights: quizSession.result.insights || [],
      } : null,
      answers: quizSession.answers.map(answer => ({
        questionId: answer.questionId,
        questionText: answer.question?.prompt || answer.question?.text || "Unknown question",
        answer: answer.value,
        answerValue: answer.value,
      })),
      user: {
        email: emailAnswer?.value || emailAnswer?.answer || emailAnswer?.answerValue || "N/A",
        name: nameAnswer?.value || nameAnswer?.answer || nameAnswer?.answerValue || "N/A",
        role: "user",
      },
      affiliate: affiliate ? {
        name: affiliate.name,
        referralCode: affiliate.referralCode,
      } : null,
    };

    return NextResponse.json(leadData);
  } catch (error) {
    console.error("Error fetching lead data:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead data" },
      { status: 500 }
    );
  }
}
