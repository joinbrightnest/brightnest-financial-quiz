import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, questionId, value, dwellMs } = await request.json();

    // Save the answer
    await prisma.quizAnswer.create({
      data: {
        sessionId,
        questionId,
        value,
        dwellMs,
      },
    });

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

    const nextQuestion = await prisma.quizQuestion.findFirst({
      where: {
        active: true,
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
    });
  } catch (error) {
    console.error("Error saving answer:", error);
    return NextResponse.json(
      { error: "Failed to save answer" },
      { status: 500 }
    );
  }
}
