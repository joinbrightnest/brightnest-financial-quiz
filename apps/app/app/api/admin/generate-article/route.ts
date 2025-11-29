import { NextRequest, NextResponse } from "next/server";
import { aiContentService } from "@/lib/ai-content";
import { verifyAdminAuth } from "@/lib/admin-auth-server";

export async function POST(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin authentication required" },
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    const { questionPrompt, answerValue, answerLabel, category } = body;

    if (!questionPrompt || !answerValue || !answerLabel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const generated = await aiContentService.generatePersonalizedArticle({
      questionPrompt,
      selectedAnswer: answerValue,
      answerLabel,
      category: category || 'general'
    });

    return NextResponse.json({
      article: {
        title: generated.title,
        content: generated.content,
        keyPoints: generated.keyPoints,
        sources: generated.sources,
        confidence: generated.confidence,
        category: category || 'general',
        tags: generated.keyPoints
      }
    });
  } catch (error) {
    console.error('Error generating article:', error);
    return NextResponse.json(
      { error: 'Failed to generate article' },
      { status: 500 }
    );
  }
}
