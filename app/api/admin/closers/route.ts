import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get all closers
    const closers = await prisma.closer.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        isApproved: true,
        totalCalls: true,
        totalConversions: true,
        totalRevenue: true,
        conversionRate: true,
        createdAt: true,
      }
    });

    // Ensure numeric fields have default values
    const closersWithDefaults = closers.map(closer => ({
      ...closer,
      totalCalls: closer.totalCalls || 0,
      totalConversions: closer.totalConversions || 0,
      totalRevenue: closer.totalRevenue || 0,
      conversionRate: closer.conversionRate || 0,
    }));

    return NextResponse.json({
      success: true,
      closers: closersWithDefaults
    });

  } catch (error) {
    console.error('❌ Error fetching closers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
