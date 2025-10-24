import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAdminAuth } from '@/lib/admin-auth-server';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }
  
  try {
    const { id } = await params;

    const loadingScreen = await prisma.loadingScreen.findUnique({
      where: { id }
    });

    if (!loadingScreen) {
      return NextResponse.json({ error: 'Loading screen not found' }, { status: 404 });
    }

    return NextResponse.json({ loadingScreen });
  } catch (error) {
    console.error('Error fetching loading screen:', error);
    return NextResponse.json({ error: 'Failed to fetch loading screen' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }
  
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
      progressBarFillColor,
      progressBarBgColor,
      progressBarTextColor,
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
        progressBarFillColor,
        progressBarBgColor,
        progressBarTextColor,
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
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }
  
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
