import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, questionId, value, dwellMs } = await request.json();

    // Handle preload requests (don't save answer, just get next question)
    const isPreload = value === "preload";

    // Run database operations in parallel for better performance
    const [existingAnswer, currentQuestion] = await Promise.all([
      prisma.quizAnswer.findFirst({
        where: { sessionId, questionId },
      }),
      prisma.quizQuestion.findUnique({
        where: { id: questionId },
      }),
    ]);

    if (!currentQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Save/update answer (skip for preload requests)
    if (!isPreload) {
      if (existingAnswer) {
        await prisma.quizAnswer.update({
          where: { id: existingAnswer.id },
          data: { value, dwellMs },
        });
      } else {
        await prisma.quizAnswer.create({
          data: { sessionId, questionId, value, dwellMs },
        });
      }
    }

    // Get next question and loading screen in parallel
    const [nextQuestion, loadingScreen] = await Promise.all([
      prisma.quizQuestion.findFirst({
        where: {
          active: true,
          quizType: currentQuestion.quizType,
          order: { gt: currentQuestion.order },
        },
        orderBy: { order: "asc" },
      }),
      prisma.loadingScreen.findFirst({
        where: {
          quizType: currentQuestion.quizType,
          triggerQuestionId: questionId,
          isActive: true,
        },
      }),
    ]);

    if (!nextQuestion) {
      // No more questions - let the result endpoint handle completion
      // This ensures answers are saved before marking as completed
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
