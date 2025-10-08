import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Articles Test API - Starting request');
    
    const articles = await prisma.article.findMany({
      where: {
        isActive: true
      }
    });

    console.log('🔍 Articles Test API - Found articles:', articles.length);
    
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('💥 Articles Test API - Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
