import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Get the name answer from the quiz answers
    const nameAnswer = await prisma.quizAnswer.findFirst({
      where: {
        sessionId,
        question: {
          type: "text"
        }
      },
      include: {
        question: true
      }
    });

    if (!nameAnswer) {
      return NextResponse.json(
        { name: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      name: nameAnswer.value as string,
    });
  } catch (error) {
    console.error("Error fetching user name:", error);
    return NextResponse.json(
      { error: "Failed to fetch user name" },
      { status: 500 }
    );
  }
}
