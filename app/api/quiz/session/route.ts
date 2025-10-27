import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Get the quiz session with answers
    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Extract name and email from answers
    const nameAnswer = session.answers.find(a => 
      a.question?.prompt?.toLowerCase().includes('name')
    );
    const emailAnswer = session.answers.find(a => 
      a.question?.prompt?.toLowerCase().includes('email')
    );

    return NextResponse.json({
      id: session.id,
      name: nameAnswer?.value || '',
      email: emailAnswer?.value || '',
      affiliateCode: session.affiliateCode,
      completedAt: session.completedAt,
      answers: session.answers,
    });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

