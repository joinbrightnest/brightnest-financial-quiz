import { NextRequest, NextResponse } from "next/server";
import { articleService } from "@/lib/article-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, questionId, answerValue, answerLabel } = body;

    if (!sessionId || !questionId || !answerValue) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For now, always generate a dynamic article since database tables might not exist yet
    const dynamicArticle = await articleService.generateDynamicArticle(
      sessionId,
      questionId,
      answerValue,
      answerLabel
    );

    const articles = dynamicArticle ? [{
      id: dynamicArticle.article.id,
      title: dynamicArticle.article.title,
      content: dynamicArticle.article.content,
      type: dynamicArticle.article.type,
      category: dynamicArticle.article.category,
      confidence: dynamicArticle.confidence
    }] : [];

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error getting articles:', error);
    return NextResponse.json(
      { error: 'Failed to get articles' },
      { status: 500 }
    );
  }
}
