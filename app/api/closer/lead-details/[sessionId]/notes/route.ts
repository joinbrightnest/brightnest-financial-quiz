import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCloserIdFromToken } from '@/lib/closer-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  // 🔒 SECURITY: Require closer authentication
  const closerId = getCloserIdFromToken(request);
  if (!closerId) {
    return NextResponse.json(
      { error: 'Unauthorized - Closer authentication required' },
      { status: 401 }
    );
  }

  const { sessionId } = params;

  try {
    // Get the quiz session to find lead email
    const quizSession = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        answers: {
          include: {
            question: true
          }
        }
      }
    });

    if (!quizSession) {
      return NextResponse.json(
        { error: 'Quiz session not found' },
        { status: 404 }
      );
    }

    // Find email from answers
    const emailAnswer = quizSession.answers.find(
      a => a.question?.type === 'email' || a.question?.prompt.toLowerCase().includes('email')
    );
    const leadEmail = emailAnswer?.value ? String(emailAnswer.value) : null;

    if (!leadEmail) {
      return NextResponse.json(
        { error: 'Lead email not found' },
        { status: 404 }
      );
    }

    // Verify this closer has access to this lead
    const appointment = await prisma.appointment.findFirst({
      where: { customerEmail: leadEmail },
    });

    if (!appointment || appointment.closerId !== closerId) {
      return NextResponse.json(
        { error: 'Forbidden - This lead is not assigned to you' },
        { status: 403 }
      );
    }

    // Get notes for this lead
    const notes = await prisma.note.findMany({
      where: { leadEmail: leadEmail },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

