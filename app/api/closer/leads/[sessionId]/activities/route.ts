import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCloserIdFromToken } from '@/lib/closer-auth';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const closerId = getCloserIdFromToken(request);
    if (!closerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = params;

    const lead = await prisma.quizCompletion.findUnique({
      where: { sessionId },
      select: {
        appointment: {
          select: {
            closerId: true,
          },
        },
      },
    });

    if (!lead || lead.appointment?.closerId !== closerId) {
      return NextResponse.json({ error: 'Lead not found or access denied' }, { status: 404 });
    }

    const activities = await prisma.activityLog.findMany({
      where: {
        sessionId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching activities for closer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
