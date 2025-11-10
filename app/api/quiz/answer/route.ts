import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, questionId, value, dwellMs } = await request.json();

    // Validate required fields
    if (!sessionId || !questionId || value === undefined) {
      return NextResponse.json(
        { error: "Session ID, question ID, and value are required" },
        { status: 400 }
      );
    }

    // Handle preload requests (don't save answer, just get next question)
    const isPreload = value === "preload";

    // Run database operations in parallel for better performance
    const [existingAnswer, currentQuestion, session] = await Promise.all([
      prisma.quizAnswer.findFirst({
        where: { sessionId, questionId },
      }),
      prisma.quizQuestion.findUnique({
        where: { id: questionId },
      }),
      prisma.quizSession.findUnique({
        where: { id: sessionId },
        select: { id: true, quizType: true, status: true },
      }),
    ]);

    // Validate session exists
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Validate session is still in progress
    if (session.status === "completed") {
      return NextResponse.json(
        { error: "Quiz session already completed" },
        { status: 400 }
      );
    }

    // Validate question exists
    if (!currentQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Validate question belongs to same quiz type as session
    if (currentQuestion.quizType !== session.quizType) {
      return NextResponse.json(
        { error: "Question does not belong to this quiz session" },
        { status: 400 }
      );
    }

    // Save/update answer (skip for preload requests)
    // Use transaction with upsert to handle race conditions safely (unique constraint protects against duplicates)
    if (!isPreload) {
      // Use upsert pattern: check if exists, then update or create
      // The unique constraint on [sessionId, questionId] prevents duplicates
      if (existingAnswer) {
        await prisma.quizAnswer.update({
          where: { id: existingAnswer.id },
          data: { value, dwellMs },
        });
      } else {
        // Use create with error handling for race conditions
        try {
          await prisma.quizAnswer.create({
            data: { sessionId, questionId, value, dwellMs },
          });
        } catch (error: any) {
          // If unique constraint violation (race condition), update instead
          if (error?.code === 'P2002' || error?.message?.includes('Unique constraint')) {
            const raceAnswer = await prisma.quizAnswer.findFirst({
              where: { sessionId, questionId },
            });
            if (raceAnswer) {
              await prisma.quizAnswer.update({
                where: { id: raceAnswer.id },
                data: { value, dwellMs },
              });
            }
          } else {
            throw error;
          }
        }
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
