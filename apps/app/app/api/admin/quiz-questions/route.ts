import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/admin-auth-server";
import { z } from 'zod';

// Schema for quizType query param (required)
const quizTypeRequiredSchema = z.object({
  quizType: z.string().min(1).max(100),
});

export async function GET(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin authentication required" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);

    // 🛡️ Validate query parameters
    const params: Record<string, string | undefined> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const validation = quizTypeRequiredSchema.safeParse(params);
    if (!validation.success) {
      const errorMessages = validation.error.issues
        .map(e => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      return NextResponse.json(
        { error: `Validation failed: ${errorMessages}` },
        { status: 400 }
      );
    }

    const { quizType } = validation.data;

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
