import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get all appointments with closer information
    const appointments = await prisma.appointment.findMany({
      orderBy: {
        scheduledAt: 'desc'
      },
      include: {
        closer: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      appointments
    });

  } catch (error) {
    console.error('❌ Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
