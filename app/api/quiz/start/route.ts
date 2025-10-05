import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Create a new quiz session
    const session = await prisma.quizSession.create({
      data: {
        status: "in_progress",
      },
    });

    // Get the first question
    const firstQuestion = await prisma.quizQuestion.findFirst({
      where: { active: true },
      orderBy: { order: "asc" },
    });

    if (!firstQuestion) {
      return NextResponse.json(
        { error: "No questions available" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      sessionId: session.id,
      question: firstQuestion,
    });
  } catch (error) {
    console.error("Error starting quiz:", error);
    return NextResponse.json(
      { error: "Failed to start quiz" },
      { status: 500 }
    );
  }
}
