import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // 🔒 SECURITY: Require JWT_SECRET (no fallback)
    const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!JWT_SECRET) {
      console.error('FATAL: JWT_SECRET or NEXTAUTH_SECRET environment variable is required');
      return NextResponse.json(
        { error: 'Authentication configuration error' },
        { status: 500 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.role !== 'closer') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get closer's appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        closerId: decoded.closerId
      },
      orderBy: {
        scheduledAt: 'desc'
      },
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        scheduledAt: true,
        duration: true,
        status: true,
        outcome: true,
        notes: true,
        saleValue: true,
        commissionAmount: true,
        affiliateCode: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        createdAt: true,
        updatedAt: true,
        recordingLinkConverted: true,
        recordingLinkNotInterested: true,
        recordingLinkNeedsFollowUp: true,
        recordingLinkWrongNumber: true,
        recordingLinkNoAnswer: true,
        recordingLinkCallbackRequested: true,
        recordingLinkRescheduled: true,
      }
    });

    return NextResponse.json({
      success: true,
      appointments
    });

  } catch (error) {
    console.error('❌ Error fetching closer appointments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
