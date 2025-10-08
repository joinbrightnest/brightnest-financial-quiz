import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test DB API - Starting request');
    
    // Test basic database connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('🔍 Test DB API - Basic query result:', result);
    
    // Test if articles table exists
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('articles', 'article_triggers', 'quiz_questions')
    `;
    console.log('🔍 Test DB API - Tables found:', tables);
    
    // Try to count articles
    try {
      const articleCount = await prisma.article.count();
      console.log('🔍 Test DB API - Article count:', articleCount);
      
      return NextResponse.json({ 
        success: true, 
        tables: tables,
        articleCount: articleCount,
        message: 'Database connection successful'
      });
    } catch (articleError) {
      console.error('💥 Test DB API - Article query failed:', articleError);
      
      return NextResponse.json({ 
        success: false, 
        tables: tables,
        articleError: articleError.message,
        message: 'Database connected but articles table has issues'
      });
    }
    
  } catch (error) {
    console.error('💥 Test DB API - Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        message: 'Database connection failed'
      },
      { status: 500 }
    );
  }
}
