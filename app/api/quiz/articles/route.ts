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
    console.log(`Looking for articles triggered by question ${questionId} with answer ${answerValue}`);
    
    // Find articles that are triggered by this question and answer
    const articles = await prisma.article.findMany({
      where: {
        isActive: true,
        triggers: {
          some: {
            OR: [
              {
                questionId: questionId,
                optionValue: answerValue,
                isActive: true
              },
              {
                optionValue: answerValue,
                isActive: true
              }
            ]
          }
        }
      },
      include: {
        triggers: {
          where: {
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
      }
    });

    console.log(`Found ${articles.length} articles for question ${questionId} with answer ${answerValue}`);

    // Format articles for the frontend
    return articles.map(article => ({
      id: article.id,
      title: article.title,
      content: article.content,
      type: article.type,
      category: article.category,
      keyPoints: Array.isArray(article.tags) ? article.tags : [],
      sources: []
    }));
  } catch (error) {
    console.error('Error getting articles from database:', error);
    return [];
  }
}
