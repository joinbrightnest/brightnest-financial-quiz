import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { fromQuizType, toQuizType } = await request.json();

    if (!fromQuizType || !toQuizType) {
      return NextResponse.json(
        { error: "Both fromQuizType and toQuizType are required" },
        { status: 400 }
      );
    }

    if (fromQuizType === toQuizType) {
      return NextResponse.json(
        { error: "Cannot duplicate to the same quiz type" },
        { status: 400 }
      );
    }

    // Get all questions from the source quiz type
    const sourceQuestions = await prisma.quizQuestion.findMany({
      where: {
        quizType: fromQuizType,
        active: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    if (sourceQuestions.length === 0) {
      return NextResponse.json(
        { error: "No questions found in source quiz type" },
        { status: 404 }
      );
    }

    // Delete existing questions for the target quiz type
    await prisma.quizQuestion.deleteMany({
      where: {
        quizType: toQuizType,
      },
    });

    // Create new questions for the target quiz type
    const newQuestions = await Promise.all(
      sourceQuestions.map((question) =>
        prisma.quizQuestion.create({
          data: {
            quizType: toQuizType,
            order: question.order,
            prompt: question.prompt,
            type: question.type,
            options: question.options as object,
            active: true,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Successfully duplicated ${newQuestions.length} questions from ${fromQuizType} to ${toQuizType}`,
      duplicatedCount: newQuestions.length,
    });
  } catch (error) {
    console.error("Error duplicating questions:", error);
    return NextResponse.json(
      { error: "Failed to duplicate questions" },
      { status: 500 }
    );
  }
}
