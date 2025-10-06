import { NextRequest, NextResponse } from "next/server";
import { simpleArticleSystem } from "@/lib/simple-articles";

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

    // Load the simple article system
    await simpleArticleSystem.loadArticles();
    
    // Get article for this answer
    const article = await simpleArticleSystem.getArticleForAnswer(
      'Financial question', // We don't have the question prompt here, but it's not needed
      answerValue,
      answerLabel
    );

    const articles = article ? [{
      id: article.id,
      title: article.title,
      content: article.content,
      type: 'simple',
      category: article.category,
      keyPoints: article.keyPoints,
      stat: article.stat,
      description: article.description
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
