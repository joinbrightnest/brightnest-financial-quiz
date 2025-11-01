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

    // 1. Fetch the core lead data (QuizCompletion) and verify ownership
    const lead = await prisma.quizCompletion.findUnique({
      where: { id: sessionId },
      include: {
        answers: { include: { question: true } },
        appointment: { include: { closer: true } },
      },
    });

    if (!lead || lead.appointment?.closerId !== closerId) {
      return NextResponse.json({ error: 'Lead not found or access denied' }, { status: 404 });
    }

    // 2. Construct the detailed activity timeline
    const leadName = lead.answers.find(a => a.question?.prompt.toLowerCase().includes('name'))?.value || 'Lead';
    const activities: any[] = [];

    // Quiz completed activity
    if (lead.completedAt) {
      activities.push({
        id: `quiz_${lead.id}`,
        type: 'quiz_completed',
        timestamp: lead.completedAt.toISOString(),
        leadName,
        details: {
          quizType: lead.quizType,
          answersCount: lead.answers.length,
        },
      });
    }

    // Call booked activity
    if (lead.appointment) {
      activities.push({
        id: `call_${lead.appointment.id}`,
        type: 'call_booked',
        timestamp: lead.appointment.createdAt.toISOString(),
        leadName,
        details: {
          scheduledAt: lead.appointment.scheduledAt.toISOString(),
          closerName: lead.appointment.closer?.name || null,
        },
      });

      // Outcome history from ActivityLog
      const outcomeLogs = await prisma.activityLog.findMany({
        where: { sessionId: sessionId, type: { in: ['outcome_updated', 'outcome_marked', 'deal_closed'] } },
        orderBy: { timestamp: 'asc' },
      });

      outcomeLogs.forEach((log) => {
        const details = log.details as any;
        activities.push({
          id: log.id,
          type: details?.outcome === 'converted' ? 'deal_closed' : log.type,
          timestamp: log.timestamp.toISOString(),
          leadName,
          actor: log.actor || lead.appointment.closer?.name || 'Unknown',
          details: { ...details },
        });
      });
    }

    // Sort activities
    activities.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // 3. Assemble the final payload
    const leadData = {
      id: lead.id,
      sessionId: lead.id,
      quizType: lead.quizType,
      completedAt: lead.completedAt,
      status: lead.status,
      answers: lead.answers.map(a => ({
        questionText: a.question?.prompt,
        answer: a.value,
      })),
      appointment: lead.appointment,
      dealClosedAt: lead.appointment?.outcome === 'converted' ? lead.appointment.updatedAt : null,
      closer: lead.appointment?.closer,
      source: lead.source,
      activities: activities,
    };

    return NextResponse.json(leadData);

  } catch (error) {
    console.error('Error fetching lead details for closer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
