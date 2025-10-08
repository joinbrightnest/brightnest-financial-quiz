import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Schema Check API - Starting request');
    
    // Check the actual table structure
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'articles' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    console.log('🔍 Schema Check API - Articles table columns:', columns);
    
    // Try to get one article with raw SQL
    const rawArticles = await prisma.$queryRaw`
      SELECT * FROM articles LIMIT 1
    `;
    
    console.log('🔍 Schema Check API - Raw articles:', rawArticles);
    
    return NextResponse.json({ 
      success: true,
      columns: columns,
      rawArticles: rawArticles
    });
  } catch (error) {
    console.error('💥 Schema Check API - Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message 
      },
      { status: 500 }
    );
  }
}
