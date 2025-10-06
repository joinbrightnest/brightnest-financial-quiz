import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { quizType, questions } = await request.json();

    if (!quizType || !questions) {
      return NextResponse.json(
        { error: "Quiz type and questions are required" },
        { status: 400 }
      );
    }

    // Delete existing questions for this quiz type
    await prisma.quizQuestion.deleteMany({
      where: {
        quizType: quizType,
      },
    });

    // Create new questions
    const newQuestions = await Promise.all(
      questions.map((question: any) => {
        // Handle new questions (those with IDs starting with "new-")
        const isNewQuestion = question.id.startsWith("new-");
        
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

    return NextResponse.json({
      success: true,
      message: `Successfully saved ${newQuestions.length} questions for ${quizType}`,
      savedCount: newQuestions.length,
    });
  } catch (error) {
    console.error("Error saving quiz questions:", error);
    return NextResponse.json(
      { error: "Failed to save quiz questions" },
      { status: 500 }
    );
  }
}
