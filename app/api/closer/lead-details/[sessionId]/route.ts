import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCloserIdFromToken } from "@/lib/closer-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  // 🔒 SECURITY: Require closer authentication
  const closerId = getCloserIdFromToken(request);
  if (!closerId) {
    return NextResponse.json(
      { error: "Unauthorized - Closer authentication required" },
      { status: 401 }
    );
  }
  
  try {
    const { sessionId } = params;

    // Get the quiz session with all related data (EXACT COPY FROM ADMIN)
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

    // Extract name and email from quiz answers
    const nameAnswer = quizSession.answers.find(
      a => a.question?.type === 'text' || a.question?.prompt.toLowerCase().includes('name')
    );
    
    const emailAnswer = quizSession.answers.find(
      a => a.question?.type === 'email' || a.question?.prompt.toLowerCase().includes('email')
    );
    const email = emailAnswer?.value ? String(emailAnswer.value) : null;

    // Get appointment
    let appointment = null;
    if (email) {
      appointment = await prisma.appointment.findFirst({
        where: { customerEmail: email },
        include: {
          closer: true
        }
      });
    }

    // 🔒 SECURITY: Verify this closer is assigned to this lead
    if (!appointment || appointment.closerId !== closerId) {
      return NextResponse.json(
        { error: "Forbidden - This lead is not assigned to you" },
        { status: 403 }
      );
    }

    // Get affiliate conversion if exists
    let affiliateConversion = null;
    if (email) {
      affiliateConversion = await prisma.affiliateConversion.findFirst({
        where: { 
          leadEmail: email,
          status: 'paid'
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    // Transform the data for the lead details view (EXACT COPY FROM ADMIN)
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
        email: email || "N/A",
        name: nameAnswer?.value || nameAnswer?.answer || nameAnswer?.answerValue || "N/A",
        role: "user",
      },
      appointment: appointment ? {
        id: appointment.id,
        outcome: appointment.outcome,
        saleValue: appointment.saleValue ? Number(appointment.saleValue) : null,
        scheduledAt: appointment.scheduledAt.toISOString(),
        createdAt: appointment.createdAt.toISOString(),
        updatedAt: appointment.updatedAt.toISOString(),
      } : null,
      dealClosedAt: affiliateConversion ? affiliateConversion.createdAt.toISOString() : null,
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
