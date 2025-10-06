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

    // Get relevant articles
    const articleMatches = await articleService.getRelevantArticles(
      sessionId,
      questionId,
      answerValue
    );

    // Try to generate dynamic article if no matches found
    if (articleMatches.length === 0) {
      const dynamicArticle = await articleService.generateDynamicArticle(
        sessionId,
        questionId,
        answerValue,
        answerLabel
      );

      if (dynamicArticle) {
        articleMatches.push(dynamicArticle);
      }
    }

    // Convert to article format
    const articles = articleMatches.map(match => ({
      id: match.article.id,
      title: match.article.title,
      content: match.article.content,
      type: match.article.type,
      category: match.article.category,
      confidence: match.confidence
    }));

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error getting articles:', error);
    return NextResponse.json(
      { error: 'Failed to get articles' },
      { status: 500 }
    );
  }
}
