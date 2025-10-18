import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

    if (decoded.role !== 'closer') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get fresh closer data from database
    const closer = await prisma.closer.findUnique({
      where: { id: decoded.closerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        totalCalls: true,
        totalConversions: true,
        totalRevenue: true,
        conversionRate: true,
        isActive: true,
        isApproved: true,
        createdAt: true,
      }
    });

    if (!closer) {
      return NextResponse.json(
        { error: 'Closer not found' },
        { status: 404 }
      );
    }

    // Ensure numeric fields have default values
    const closerWithDefaults = {
      ...closer,
      totalCalls: closer.totalCalls || 0,
      totalConversions: closer.totalConversions || 0,
      totalRevenue: closer.totalRevenue || 0,
      conversionRate: closer.conversionRate || 0,
    };

    console.log('📊 Fresh closer stats fetched:', {
      id: closer.id,
      name: closer.name,
      totalCalls: closerWithDefaults.totalCalls,
      totalConversions: closerWithDefaults.totalConversions,
      totalRevenue: closerWithDefaults.totalRevenue,
      conversionRate: closerWithDefaults.conversionRate,
    });

    return NextResponse.json({
      success: true,
      closer: closerWithDefaults
    });

  } catch (error) {
    console.error('❌ Error fetching closer stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
