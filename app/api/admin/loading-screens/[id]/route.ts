import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
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
      showProgressBar,
      progressText,
      triggerQuestionId
    } = body;

    const loadingScreen = await prisma.loadingScreen.update({
      where: { id },
      data: {
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
        showProgressBar,
        progressText,
        triggerQuestionId
      }
    });

    return NextResponse.json({ loadingScreen });
  } catch (error) {
    console.error('Error updating loading screen:', error);
    return NextResponse.json({ error: 'Failed to update loading screen' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.loadingScreen.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting loading screen:', error);
    return NextResponse.json({ error: 'Failed to delete loading screen' }, { status: 500 });
  }
}
