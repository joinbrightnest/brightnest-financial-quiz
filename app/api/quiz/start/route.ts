import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { quizType = "financial-profile", affiliateCode: requestAffiliateCode } = await request.json();

    // Get affiliate code from cookie or request
    const affiliateCode = requestAffiliateCode || request.cookies.get("affiliate_ref")?.value;

    // If we have an affiliate code, track the click (only when quiz is actually started)
    if (affiliateCode) {
      console.log("🎯 Quiz started with affiliate code:", affiliateCode);
      try {
        // Find the affiliate
        const affiliate = await (prisma as any).affiliate.findUnique({
          where: { referralCode: affiliateCode },
        });

        if (affiliate && affiliate.isActive) {
          console.log("✅ Found affiliate:", affiliate.name);
          // Record the click (this happens when user actually starts a quiz)
          await (prisma as any).affiliateClick.create({
            data: {
              affiliateId: affiliate.id,
              referralCode: affiliate.referralCode,
              ipAddress: request.headers.get("x-forwarded-for") || "unknown",
              userAgent: request.headers.get("user-agent") || "unknown",
            },
          });

          // Update affiliate's total clicks
          await (prisma as any).affiliate.update({
            where: { id: affiliate.id },
            data: {
              totalClicks: {
                increment: 1,
              },
            },
          });

          console.log("🎉 Affiliate click tracked successfully:", affiliateCode);
        } else {
          console.log("❌ Affiliate not found or inactive:", affiliateCode);
          // For now, just log that we would track this click
          console.log("📊 Would track click for affiliate:", affiliateCode);
        }
      } catch (error) {
        console.error("❌ Error tracking affiliate click:", error);
        console.log("📊 Would track click for affiliate:", affiliateCode);
        // Continue with quiz creation even if tracking fails
      }
    } else {
      console.log("ℹ️ No affiliate code found in request");
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