import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const quizType = searchParams.get('quizType') || searchParams.get('type') || 'financial-profile';

    const count = await prisma.quizQuestion.count({
      where: { 
        active: true,
        quizType: quizType
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching question count:", error);
    return NextResponse.json(
      { error: "Failed to fetch question count" },
      { status: 500 }
    );
  }
}
