import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@brightnest/shared';

export async function GET(request: NextRequest) {
  try {
    // First, let's check all closers to see what we have
    const allClosers = await prisma.closer.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
        isApproved: true,
        calendlyLink: true,
      }
    });
    
    console.log('🔍 All closers in database:', allClosers);

    // Get the first active and approved closer with a Calendly link
    const activeCloser = await prisma.closer.findFirst({
      where: {
        isActive: true,
        isApproved: true,
        calendlyLink: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        calendlyLink: true,
      },
      orderBy: {
        createdAt: 'asc' // Get the first one (oldest)
      }
    });

    console.log('🎯 Active closer found:', activeCloser);

    if (!activeCloser) {
      return NextResponse.json({
        success: false,
        message: 'No active closer with Calendly link found',
        calendlyLink: null
      });
    }

    console.log(`🎯 Found active closer for booking: ${activeCloser.name} (${activeCloser.id})`);

    return NextResponse.json({
      success: true,
      closer: {
        id: activeCloser.id,
        name: activeCloser.name,
        calendlyLink: activeCloser.calendlyLink,
      }
    });

  } catch (error) {
    console.error('❌ Error fetching active closer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
