import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check if quizSession table has quizType column
    const sessions = await prisma.quizSession.findMany({
      take: 1
    });

    // Check if quizQuestion table has quizType column
    const questions = await prisma.quizQuestion.findMany({
      take: 1
    });

    return NextResponse.json({
      sessions: sessions,
      questions: questions,
      sessionCount: await prisma.quizSession.count(),
      questionCount: await prisma.quizQuestion.count()
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Database debug failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
