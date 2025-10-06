import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const quizType = searchParams.get("quizType");

    if (!quizType) {
      return NextResponse.json(
        { error: "Quiz type is required" },
        { status: 400 }
      );
    }

    const questions = await prisma.quizQuestion.findMany({
      where: {
        quizType: quizType,
        active: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json({
      questions,
      count: questions.length,
    });
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz questions" },
      { status: 500 }
    );
  }
}
