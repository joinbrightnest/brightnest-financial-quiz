import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('questionId');
    const category = searchParams.get('category');

    const whereClause: { isActive: boolean; triggers?: any; category?: string } = { isActive: true };
    
    if (questionId) {
      whereClause.triggers = {
        some: {
          questionId,
          isActive: true
        }
      };
    }

    if (category) {
      whereClause.category = category;
    }

    const articles = await prisma.article.findMany({
      where: whereClause,
      include: {
        triggers: {
          where: { isActive: true },
          include: {
            question: {
              select: { prompt: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, type, category, tags, triggers } = body;

    console.log('Article creation request:', { title, content, type, category, tags, triggers });

    // Create article in database
    const article = await prisma.article.create({
      data: {
        title,
        content,
        type: type || 'ai_generated',
        category: category || 'general',
        tags: tags || [],
        triggers: {
          create: triggers?.map((trigger: any) => ({
            questionId: trigger.questionId,
            optionValue: trigger.optionValue,
            condition: trigger.condition || {},
            priority: trigger.priority || 0,
            isActive: trigger.isActive !== false
          })) || []
        }
      },
      include: {
        triggers: {
          include: {
            question: {
              select: { prompt: true }
            }
          }
        }
      }
    });

    return NextResponse.json({ 
      article,
      message: 'Article saved successfully to database'
    });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}
