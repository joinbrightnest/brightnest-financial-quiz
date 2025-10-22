import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const sessionId = "cmh0zqqar000gjp04bvpeutnf";
    
    // Get all quiz answers for this session
    const answers = await prisma.quizAnswer.findMany({
      where: { sessionId },
      include: {
        question: true
      }
    });

    // Get the session details
    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        answers: {
          include: {
            question: true
          }
        }
      }
    });

    return NextResponse.json({
      sessionId,
      session: session ? {
        id: session.id,
        status: session.status,
        createdAt: session.createdAt,
        completedAt: session.completedAt,
        answersCount: session.answers.length
      } : null,
      answers: answers.map(answer => ({
        id: answer.id,
        questionId: answer.questionId,
        value: answer.value,
        questionPrompt: answer.question?.prompt,
        questionType: answer.question?.type
      }))
    });
  } catch (error) {
    console.error("Error checking session data:", error);
    return NextResponse.json(
      { error: "Failed to check session data" },
      { status: 500 }
    );
  }
}

