import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, rateLimitExceededResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // 🛡️ SECURITY: Rate limit quiz starts (30 per minute)
  const rateLimitResult = await rateLimit(request, 'api');
  if (!rateLimitResult.success) {
    return rateLimitExceededResponse(rateLimitResult);
  }

  try {
    const { quizType = "financial-profile", affiliateCode: requestAffiliateCode } = await request.json();

    // Only use affiliate code if explicitly provided in the request
    // Don't use cookie-based affiliate codes for direct website visits
    let affiliateCode = requestAffiliateCode || null;

    // Validate affiliate code if provided (ensure it's active and approved)
    if (affiliateCode) {
      try {
        const affiliate = await prisma.affiliate.findUnique({
          where: { referralCode: affiliateCode },
          select: { id: true, isActive: true, isApproved: true },
        });

        if (!affiliate || !affiliate.isActive || !affiliate.isApproved) {
          console.log("⚠️ Invalid, inactive, or unapproved affiliate code, ignoring:", affiliateCode);
          affiliateCode = null; // Don't track invalid affiliates
        } else {
          console.log("🎯 Quiz started with valid affiliate code:", affiliateCode);
          // Note: Click tracking is handled separately by /api/track-affiliate to avoid double counting
        }
      } catch (error) {
        console.error("Error validating affiliate code:", error);
        affiliateCode = null; // Don't track if validation fails
      }
    } else {
      console.log("ℹ️ No affiliate code found in request - direct website visit");
    }

    // Create session and get first question + count in parallel (optimization)
    const [session, firstQuestion, questionCount] = await Promise.all([
      prisma.quizSession.create({
        data: {
          quizType,
          status: "in_progress",
          affiliateCode,
        },
      }),
      prisma.quizQuestion.findFirst({
        where: { 
          active: true,
          quizType: quizType
        },
        orderBy: { order: "asc" },
      }),
      prisma.quizQuestion.count({
        where: {
          active: true,
          quizType: quizType,
        },
      }),
    ]);

    if (!firstQuestion) {
      return NextResponse.json(
        { error: "No questions available for this quiz type" },
        { status: 404 }
      );
    }

    // Return session, question, and count in one response (optimization: eliminates extra API call)
    return NextResponse.json({
      sessionId: session.id,
      question: firstQuestion,
      totalQuestions: questionCount,
    });
  } catch (error) {
    console.error("Error starting quiz:", error);
    return NextResponse.json(
      { error: "Failed to start quiz" },
      { status: 500 }
    );
  }
}