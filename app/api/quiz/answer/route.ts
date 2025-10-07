import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, questionId, value, dwellMs } = await request.json();

    // Check if answer already exists
    const existingAnswer = await prisma.quizAnswer.findFirst({
      where: {
        sessionId,
        questionId,
      },
    });

    if (existingAnswer) {
      // Update existing answer
      await prisma.quizAnswer.update({
        where: { id: existingAnswer.id },
        data: {
          value,
          dwellMs,
        },
      });
    } else {
      // Create new answer
      await prisma.quizAnswer.create({
        data: {
          sessionId,
          questionId,
          value,
          dwellMs,
        },
      });
    }

    // Get the next question
    const currentQuestion = await prisma.quizQuestion.findUnique({
      where: { id: questionId },
    });

    if (!currentQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Check for loading screen after this question
    const loadingScreen = await prisma.loadingScreen.findFirst({
      where: {
        quizType: currentQuestion.quizType,
        triggerQuestionId: questionId,
        isActive: true,
      },
    });

    const nextQuestion = await prisma.quizQuestion.findFirst({
      where: {
        active: true,
        quizType: currentQuestion.quizType,
        order: { gt: currentQuestion.order },
      },
      orderBy: { order: "asc" },
    });

    if (!nextQuestion) {
      // No more questions, mark session as completed
      await prisma.quizSession.update({
        where: { id: sessionId },
        data: {
          status: "completed",
          completedAt: new Date(),
        },
      });

      return NextResponse.json({
        isComplete: true,
        message: "Quiz completed",
      });
    }

    return NextResponse.json({
      isComplete: false,
      nextQuestion,
      loadingScreen: loadingScreen || null,
    });
  } catch (error) {
    console.error("Error saving answer:", error);
    return NextResponse.json(
      { error: "Failed to save answer" },
      { status: 500 }
    );
  }
}
