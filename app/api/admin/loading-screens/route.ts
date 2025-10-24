import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAdminAuth } from '@/lib/admin-auth-server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const quizType = searchParams.get('quizType');

    if (!quizType) {
      return NextResponse.json({ error: 'Quiz type is required' }, { status: 400 });
    }

    const loadingScreens = await prisma.loadingScreen.findMany({
      where: {
        quizType: quizType,
        isActive: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json({ loadingScreens });
  } catch (error: any) {
    console.error('Error fetching loading screens:', error);
    
    // If table doesn't exist, return empty array
    if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
      return NextResponse.json({ loadingScreens: [] });
    }
    
    return NextResponse.json({ error: 'Failed to fetch loading screens' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    const {
      quizType,
      title,
      subtitle,
      personalizedText,
      duration,
      iconType,
      animationStyle,
      backgroundColor,
      textColor,
      iconColor,
      progressBarColor,
      progressBarFillColor,
      progressBarBgColor,
      progressBarTextColor,
      showProgressBar,
      progressText,
      triggerQuestionId,
      // Image fields
      imageUrl,
      imageAlt,
      showImage
    } = body;

    if (!quizType || !title) {
      return NextResponse.json({ error: 'Quiz type and title are required' }, { status: 400 });
    }

    const loadingScreen = await prisma.loadingScreen.create({
      data: {
        quizType,
        title,
        subtitle,
        personalizedText,
        duration: duration || 3000,
        iconType: iconType || 'puzzle-4',
        animationStyle: animationStyle || 'complete-rotate',
        backgroundColor: backgroundColor || '#ffffff',
        textColor: textColor || '#000000',
        iconColor: iconColor || '#06b6d4',
        progressBarColor: progressBarColor || '#ef4444',
        progressBarFillColor: progressBarFillColor || '#fb513d',
        progressBarBgColor: progressBarBgColor || '#e4dece',
        progressBarTextColor: progressBarTextColor || '#191717',
        showProgressBar: showProgressBar !== undefined ? showProgressBar : true,
        progressText,
        triggerQuestionId,
        // Image fields
        imageUrl: imageUrl || null,
        imageAlt: imageAlt || null,
        showImage: showImage !== undefined ? showImage : false,
        isActive: true
      }
    });

    return NextResponse.json({ loadingScreen });
  } catch (error) {
    console.error('Error creating loading screen:', error);
    return NextResponse.json({ error: 'Failed to create loading screen' }, { status: 500 });
  }
}
