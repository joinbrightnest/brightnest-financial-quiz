import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { quizName, quizDescription, questions } = await request.json();

    console.log("Received new quiz creation:", { quizName, questionsCount: questions?.length });

    if (!quizName || !questions) {
      return NextResponse.json(
        { error: "Quiz name and questions are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Questions must be an array" },
        { status: 400 }
      );
    }

    // Generate a unique quiz type from the quiz name
    const quizType = quizName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    // Check if quiz type already exists
    const existingQuiz = await prisma.quizQuestion.findFirst({
      where: { quizType }
    });

    if (existingQuiz) {
      return NextResponse.json(
        { error: "A quiz with this name already exists. Please choose a different name." },
        { status: 400 }
      );
    }

    // Create new questions for the new quiz type
    console.log("Creating new quiz questions:", questions.length);
    const newQuestions = await Promise.all(
      questions.map((question: {
        id: string;
        quizType: string;
        order: number;
        prompt: string;
        type: string;
        options: object;
        active: boolean;
        skipButton?: boolean;
        continueButton?: boolean;
        continueButtonColor?: string;
      }) => {
        console.log("Creating question:", question.order, question.prompt);
        return prisma.quizQuestion.create({
          data: {
            quizType: quizType,
            order: question.order,
            prompt: question.prompt,
            type: question.type,
            options: question.options as object,
            active: question.active,
            skipButton: question.skipButton || false,
            continueButton: question.continueButton || false,
            continueButtonColor: question.continueButtonColor || '#09727c',
          },
        });
      })
    );

    console.log("Successfully created new quiz:", newQuestions.length, "questions");

    return NextResponse.json({
      success: true,
      message: `Successfully created new quiz "${quizName}" with ${newQuestions.length} questions`,
      quizType: quizType,
      createdCount: newQuestions.length,
    });
  } catch (error) {
    console.error("Error creating new quiz:", error);
    return NextResponse.json(
      { error: `Failed to create new quiz: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
