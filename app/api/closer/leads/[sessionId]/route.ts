import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';
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
      where: {
        id: sessionId,
      },
      select: {
        id: true,
        quizType: true,
        completedAt: true,
        status: true,
        answers: {
          select: {
            question: {
              select: {
                prompt: true,
              },
            },
            value: true,
          },
        },
        appointment: {
          select: {
            closerId: true,
            saleValue: true,
          },
        },
        dealClosedAt: true,
        source: true,
      },
    });

    if (!lead || lead.appointment?.closerId !== closerId) {
      return NextResponse.json({ error: 'Lead not found or access denied' }, { status: 404 });
    }
    
    const closer = await prisma.closer.findUnique({
      where: { id: closerId },
      select: { name: true }
    });

    const formattedLead = {
      ...lead,
      sessionId: lead.id, // Ensure sessionId is in the response for the page
      answers: lead.answers.map(a => ({
        questionText: a.question?.prompt || 'Unknown Question',
        answer: a.value,
      })),
      closer: closer,
    };

    return NextResponse.json(formattedLead);
  } catch (error) {
    console.error('Error fetching lead data for closer:', error);
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
