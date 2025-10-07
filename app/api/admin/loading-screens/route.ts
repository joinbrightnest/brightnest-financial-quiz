import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
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
  } catch (error) {
    console.error('Error fetching loading screens:', error);
    return NextResponse.json({ error: 'Failed to fetch loading screens' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
      triggerQuestionId
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
        iconType: iconType || 'puzzle',
        animationStyle: animationStyle || 'spin',
        backgroundColor: backgroundColor || '#ffffff',
        textColor: textColor || '#000000',
        iconColor: iconColor || '#3b82f6',
        triggerQuestionId,
        isActive: true
      }
    });

    return NextResponse.json({ loadingScreen });
  } catch (error) {
    console.error('Error creating loading screen:', error);
    return NextResponse.json({ error: 'Failed to create loading screen' }, { status: 500 });
  }
}
