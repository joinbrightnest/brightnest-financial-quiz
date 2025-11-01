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

    // 1. Fetch the core lead data (QuizSession)
    const quizSession = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        answers: { include: { question: true } },
      },
    });

    if (!quizSession) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    
    const emailAnswer = quizSession.answers.find(a => a.question?.prompt.toLowerCase().includes('email'));
    const leadEmail = emailAnswer?.value as string;

    if (!leadEmail) {
        return NextResponse.json({ error: 'Lead email not found' }, { status: 404 });
    }

    const appointment = await prisma.appointment.findFirst({
        where: { customerEmail: leadEmail },
        include: { closer: true }
    });

    // Verify ownership
    if (appointment?.closerId !== closerId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch Notes
    const notes = await prisma.note.findMany({
      where: { leadEmail: leadEmail },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Construct the detailed activity timeline
    const leadName = quizSession.answers.find(a => a.question?.prompt.toLowerCase().includes('name'))?.value as string || 'Lead';
    const activities: any[] = [];

    // Quiz completed activity
    if (quizSession.completedAt) {
      activities.push({
        id: `quiz_${quizSession.id}`,
        type: 'quiz_completed',
        timestamp: quizSession.completedAt.toISOString(),
        leadName,
        details: {
          quizType: quizSession.quizType,
          answersCount: quizSession.answers.length,
        },
      });
    }

    // Call booked activity
    if (appointment) {
      activities.push({
        id: `call_${appointment.id}`,
        type: 'call_booked',
        timestamp: appointment.createdAt.toISOString(),
        leadName,
        details: {
          scheduledAt: appointment.scheduledAt.toISOString(),
          closerName: appointment.closer?.name || null,
        },
      });

      const outcomeLogs = await prisma.closerAuditLog.findMany({
        where: {
            details: {
                path: ['appointmentId'],
                equals: appointment.id
            }
        },
        orderBy: { createdAt: 'asc' },
        include: { closer: true }
      });

      outcomeLogs.forEach((log) => {
        const details = log.details as any;
        activities.push({
          id: log.id,
          type: details?.outcome === 'converted' ? 'deal_closed' : 'outcome_updated',
          timestamp: log.createdAt.toISOString(),
          leadName,
          actor: log.closer?.name || 'Unknown',
          details: { ...details },
        });
      });
    }

    // Sort activities
    activities.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // 3. Assemble the final payload
    const leadData = {
      id: quizSession.id,
      sessionId: quizSession.id,
      quizType: quizSession.quizType,
      completedAt: quizSession.completedAt,
      status: appointment?.status || quizSession.status,
      answers: quizSession.answers.map(a => ({
        questionText: a.question?.prompt,
        answer: a.value,
      })),
      appointment: appointment,
      dealClosedAt: appointment?.outcome === 'converted' ? appointment.updatedAt : null,
      closer: appointment?.closer,
      source: quizSession.affiliateCode ? 'Affiliate' : 'Website', // Simplified
      activities: activities,
      notes: notes, // Include notes in the payload
    };

    return NextResponse.json(leadData);

  } catch (error) {
    console.error('Error fetching lead details for closer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
