import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { quizType = "financial-profile" } = await request.json();

    // Create a new quiz session
    const session = await prisma.quizSession.create({
      data: {
        quizType,
        status: "in_progress",
      },
    });

    // Get the first question for this quiz type
    const firstQuestion = await prisma.quizQuestion.findFirst({
      where: { 
        active: true,
        quizType: quizType
      },
      orderBy: { order: "asc" },
    });

    if (!firstQuestion) {
      return NextResponse.json(
        { error: "No questions available for this quiz type" },
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