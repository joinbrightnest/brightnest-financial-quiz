import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { quizType = "financial-profile", affiliateCode: requestAffiliateCode } = await request.json();

    // Only use affiliate code if explicitly provided in the request
    // Don't use cookie-based affiliate codes for direct website visits
    const affiliateCode = requestAffiliateCode || null;

    // If we have an affiliate code, just log it (click tracking is handled by /api/track-affiliate)
    if (affiliateCode) {
      console.log("🎯 Quiz started with affiliate code:", affiliateCode);
      // Note: Click tracking is handled separately by /api/track-affiliate to avoid double counting
    } else {
      console.log("ℹ️ No affiliate code found in request - direct website visit");
    }

    // Create a new quiz session
    const session = await prisma.quizSession.create({
      data: {
        quizType,
        status: "in_progress",
        affiliateCode,
      },
    });

    // Get the first question for this quiz type
    const firstQuestion = await prisma.quizQuestion.findFirst({
      where: { 
        active: true,
        quizType: quizType
      },
      orderBy: { order: "asc" },
    });

    if (!firstQuestion) {
      return NextResponse.json(
        { error: "No questions available for this quiz type" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      sessionId: session.id,
      question: firstQuestion,
    });
  } catch (error) {
    console.error("Error starting quiz:", error);
    return NextResponse.json(
      { error: "Failed to start quiz" },
      { status: 500 }
    );
  }
}