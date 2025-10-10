import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // First, try to get articles from the database (if/then logic)
    const articlesFromDatabase = await getArticlesFromDatabase(questionId, answerValue);
    
    if (articlesFromDatabase.length > 0) {
      return NextResponse.json({ articles: articlesFromDatabase });
    }

    // No articles found in database - return empty array
    // This ensures clean if/then logic - only show articles that are explicitly created
    return NextResponse.json({ articles: [] });
  } catch (error) {
    console.error('Error getting articles:', error);
    return NextResponse.json(
      { error: 'Failed to get articles' },
      { status: 500 }
    );
  }
}

async function getArticlesFromDatabase(questionId: string, answerValue: string) {
  try {
    // Optimized query - get articles directly without complex joins
    const articles = await prisma.article.findMany({
      where: {
        isActive: true,
        triggers: {
          some: {
            isActive: true,
            OR: [
              {
                questionId: questionId,
                optionValue: answerValue
              },
              {
                optionValue: answerValue
              }
            ]
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1 // Only get the first article for faster response
    });

    // Raw articles from database

    // Found articles for question and answer

    // Format articles for the frontend with all customization fields
    return articles.map(article => ({
      id: article.id,
      title: article.title,
      content: article.content,
      type: article.type,
      category: article.category,
      keyPoints: Array.isArray(article.tags) ? article.tags : [],
      sources: [],
      // Customization fields
      subtitle: (article as any).subtitle,
      personalizedText: (article as any).personalizedText,
      backgroundColor: (article as any).personalizedBackgroundCol || (article as any).backgroundColor,
      textColor: (article as any).textColor,
      iconColor: (article as any).iconColor,
      accentColor: (article as any).accentColor,
      iconType: (article as any).iconType,
      showIcon: (article as any).showIcon,
      showStatistic: (article as any).showStatistic,
      statisticText: (article as any).statisticText,
      statisticValue: (article as any).statisticValue,
      ctaText: (article as any).ctaText,
      showCta: (article as any).showCta,
      // Layout and positioning fields
      textAlignment: (article as any).textAlignment,
      contentPosition: (article as any).contentPosition,
      backgroundStyle: (article as any).backgroundStyle,
      backgroundGradient: (article as any).backgroundGradient,
      contentPadding: (article as any).contentPadding,
      showTopBar: (article as any).showTopBar,
      topBarColor: (article as any).topBarColor,
      // Text formatting fields
      titleFontSize: (article as any).titleFontSize,
      titleFontWeight: (article as any).titleFontWeight,
      contentFontSize: (article as any).contentFontSize,
      contentFontWeight: (article as any).contentFontWeight,
      lineHeight: (article as any).lineHeight,
      // Image fields
      imageUrl: (article as any).imageUrl,
      imageAlt: (article as any).imageAlt,
      showImage: (article as any).showImage
    }));
  } catch (error) {
    console.error('Error getting articles from database:', error);
    return [];
  }
}
