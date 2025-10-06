import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { quizType } = await request.json();

    if (!quizType) {
      return NextResponse.json(
        { error: "Quiz type is required" },
        { status: 400 }
      );
    }

    // Delete all questions for the specified quiz type
    const deletedQuestions = await prisma.quizQuestion.deleteMany({
      where: {
        quizType: quizType,
      },
    });

    // Also delete any quiz sessions and answers for this quiz type
    await prisma.quizAnswer.deleteMany({
      where: {
        question: {
          quizType: quizType,
        },
      },
    });

    await prisma.quizSession.deleteMany({
      where: {
        quizType: quizType,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully reset quiz type ${quizType}`,
      deletedQuestions: deletedQuestions.count,
    });
  } catch (error) {
    console.error("Error resetting quiz type:", error);
    return NextResponse.json(
      { error: "Failed to reset quiz type" },
      { status: 500 }
    );
  }
}
