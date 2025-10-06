import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { quizType, questions } = await request.json();

    console.log("Received save request:", { quizType, questionsCount: questions?.length });

    if (!quizType || !questions) {
      return NextResponse.json(
        { error: "Quiz type and questions are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Questions must be an array" },
        { status: 400 }
      );
    }

    // Delete existing questions for this quiz type
    console.log("Deleting existing questions for quiz type:", quizType);
    await prisma.quizQuestion.deleteMany({
      where: {
        quizType: quizType,
      },
    });

    // Create new questions
    console.log("Creating new questions:", questions.length);
    const newQuestions = await Promise.all(
      questions.map((question: {
        id: string;
        quizType: string;
        order: number;
        prompt: string;
        type: string;
        options: object;
        active: boolean;
      }) => {
        console.log("Creating question:", question.order, question.prompt);
        return prisma.quizQuestion.create({
          data: {
            quizType: question.quizType,
            order: question.order,
            prompt: question.prompt,
            type: question.type,
            options: question.options as object,
            active: question.active,
          },
        });
      })
    );

    console.log("Successfully created questions:", newQuestions.length);

    return NextResponse.json({
      success: true,
      message: `Successfully saved ${newQuestions.length} questions for ${quizType}`,
      savedCount: newQuestions.length,
    });
  } catch (error) {
    console.error("Error saving quiz questions:", error);
    return NextResponse.json(
      { error: `Failed to save quiz questions: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
