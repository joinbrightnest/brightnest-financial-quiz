import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Test 1: Check if table exists by querying it
    const screens = await prisma.loadingScreen.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    
    // Test 2: Get count of all loading screens
    const totalCount = await prisma.loadingScreen.count();
    
    // Test 3: Get count by quiz type
    const countByType = await prisma.$queryRaw`
      SELECT "quizType", COUNT(*) as count 
      FROM "loading_screens" 
      GROUP BY "quizType"
    `;

    return NextResponse.json({ 
      success: true,
      tableExists: true,
      totalScreens: totalCount,
      recentScreens: screens.map(s => ({
        id: s.id,
        title: s.title,
        quizType: s.quizType,
        triggerQuestionId: s.triggerQuestionId,
        createdAt: s.createdAt
      })),
      countByType,
      message: 'Loading screens table is working correctly!'
    });
  } catch (error: any) {
    console.error('Error testing loading screens:', error);
    
    // Check if table doesn't exist
    if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
      return NextResponse.json({ 
        success: false,
        tableExists: false,
        error: 'Loading screens table does not exist',
        message: 'Please run the migration at /admin/run-migration',
        errorCode: error?.code
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to test loading screens',
      details: error?.message,
      errorCode: error?.code
    }, { status: 500 });
  }
}

