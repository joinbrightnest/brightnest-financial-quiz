import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get all quiz sessions with their answers
    const sessions = await prisma.quizSession.findMany({
      include: {
        answers: {
          include: {
            question: true,
          },
        },
        result: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20, // Get more sessions to find completed ones
    });

    // Also get total counts
    const totalSessions = await prisma.quizSession.count();
    const totalAnswers = await prisma.quizAnswer.count();
    const totalQuestions = await prisma.quizQuestion.count();

    return NextResponse.json({
      debug: {
        totalSessions,
        totalAnswers,
        totalQuestions,
        sessionsWithAnswers: sessions.map(session => ({
          id: session.id,
          quizType: session.quizType,
          status: session.status,
          createdAt: session.createdAt,
          completedAt: session.completedAt,
          answersCount: session.answers.length,
          answers: session.answers.map(answer => ({
            id: answer.id,
            questionId: answer.questionId,
            questionPrompt: answer.question.prompt,
            questionOrder: answer.question.order,
            questionType: answer.question.type,
            value: answer.value,
            createdAt: answer.createdAt,
          })),
          result: session.result,
        })),
      },
    });
  } catch (error) {
    console.error("Error debugging answers:", error);
    return NextResponse.json(
      { error: "Failed to debug answers" },
      { status: 500 }
    );
  }
}
