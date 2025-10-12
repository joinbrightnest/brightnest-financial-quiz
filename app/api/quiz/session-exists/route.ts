import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "SessionId is required" },
        { status: 400 }
      );
    }

    // Check if session exists in database
    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      select: { id: true }
    });

    return NextResponse.json({
      exists: !!session
    });
  } catch (error) {
    console.error("Error checking session existence:", error);
    return NextResponse.json(
      { error: "Failed to check session" },
      { status: 500 }
    );
  }
}
