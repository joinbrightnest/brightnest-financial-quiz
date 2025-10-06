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

    // For now, just return success without saving to database
    // This allows the system to work while we set up the database
    console.log('Article creation request:', { title, content, type, category, tags, triggers });

    // Simulate successful creation
    const mockArticle = {
      id: `article-${Date.now()}`,
      title,
      content,
      type,
      category,
      tags: tags || [],
      triggers: triggers || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({ 
      article: mockArticle,
      message: 'Article saved successfully (mock save - database not yet configured)'
    });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}
