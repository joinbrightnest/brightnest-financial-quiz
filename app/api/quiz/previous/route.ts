import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, currentQuestionId } = await request.json();

    // Get the current question to find its order
    const currentQuestion = await prisma.quizQuestion.findUnique({
      where: { id: currentQuestionId },
    });

    if (!currentQuestion) {
      return NextResponse.json(
        { error: "Current question not found" },
        { status: 404 }
      );
    }

    // Get the previous question
    const previousQuestion = await prisma.quizQuestion.findFirst({
      where: {
        active: true,
        quizType: currentQuestion.quizType,
        order: { lt: currentQuestion.order },
      },
      orderBy: { order: "desc" },
    });

    if (!previousQuestion) {
      return NextResponse.json(
        { error: "No previous question found" },
        { status: 404 }
      );
    }

    // Get the existing answer for the previous question (if any)
    const existingAnswer = await prisma.quizAnswer.findFirst({
      where: {
        sessionId,
        questionId: previousQuestion.id,
      },
    });

    return NextResponse.json({
      question: previousQuestion,
      existingAnswer: existingAnswer?.value || null,
      questionNumber: currentQuestion.order - 1, // Go back to previous question number
    });
  } catch (error) {
    console.error("Error getting previous question:", error);
    return NextResponse.json(
      { error: "Failed to get previous question" },
      { status: 500 }
    );
  }
}
