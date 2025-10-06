import { NextRequest, NextResponse } from "next/server";
import { aiContentService } from "@/lib/ai-content";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionId, questionPrompt, answerValue, answerLabel, category } = body;

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
