import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Check Articles API - Starting request');
    
    // Try to get basic article count first
    const articleCount = await prisma.article.count();
    console.log('🔍 Check Articles API - Article count:', articleCount);
    
    // Try to get one article to see what fields exist
    const sampleArticle = await prisma.article.findFirst({
      where: { isActive: true }
    });
    
    console.log('🔍 Check Articles API - Sample article:', sampleArticle);
    
    return NextResponse.json({ 
      success: true,
      articleCount,
      sampleArticle,
      message: "Database connection successful"
    });
  } catch (error: any) {
    console.error('💥 Check Articles API - Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: "Failed to connect to database or query articles"
    }, { status: 500 });
  }
}
