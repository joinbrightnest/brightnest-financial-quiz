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
    console.log('[Closer API] closerId:', closerId);
    
    if (!closerId) {
      console.error('[Closer API] Unauthorized: No closer ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = params;
    console.log('[Closer API] sessionId:', sessionId);

    // 1. Fetch the core lead data (QuizSession)
    const quizSession = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        answers: { include: { question: true } },
        result: true,
        user: true,
      },
    });

    if (!quizSession) {
      console.error('[Closer API] Quiz session not found');
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    
    const emailAnswer = quizSession.answers.find(a => a.question?.prompt.toLowerCase().includes('email'));
    const leadEmail = emailAnswer?.value as string;
    console.log('[Closer API] leadEmail:', leadEmail);

    if (!leadEmail) {
        console.error('[Closer API] Lead email not found in answers');
        return NextResponse.json({ error: 'Lead email not found' }, { status: 404 });
    }

    const nameAnswer = quizSession.answers.find(a => a.question?.prompt.toLowerCase().includes('name'));

    const appointment = await prisma.appointment.findFirst({
        where: { customerEmail: leadEmail },
        include: { closer: true }
    });

    console.log('[Closer API] appointment:', appointment ? appointment.id : 'null');

    if (!appointment) {
        console.error('[Closer API] No appointment found for this lead');
        return NextResponse.json({ error: 'Lead not assigned to this closer' }, { status: 403 });
    }
    
    // Also verify ownership
    if (appointment.closerId !== closerId) {
      console.error('[Closer API] Access denied: appointment.closerId !== closerId');
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch Notes
    const notes = await prisma.note.findMany({
      where: { leadEmail: leadEmail },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Construct the detailed activity timeline, mirroring admin logic
    const leadName = nameAnswer?.value as string || 'Lead';
    
    // Get system activities
    const systemActivities = await prisma.activityLog.findMany({
        where: { quizSessionId: sessionId },
        orderBy: { createdAt: 'asc' },
    });

    // Get closer-specific activities
    const closerActivities = await prisma.closerAuditLog.findMany({
        where: {
            details: {
                path: ['appointmentId'],
                equals: appointment.id
            }
        },
        orderBy: { createdAt: 'asc' },
        include: { closer: true }
    });

    // Format and combine all activities
    const formattedSystemActivities = systemActivities.map(log => ({
        id: log.id,
        type: log.type,
        description: log.description.replace('A new user', leadName),
        date: log.createdAt,
        details: log.details,
        closerName: null,
    }));

    const formattedCloserActivities = closerActivities.map(log => ({
        id: log.id,
        type: log.type,
        description: log.description,
        date: log.createdAt,
        details: log.details,
        closerName: log.closer?.name || 'Unknown Closer',
    }));

    const allActivities = [...formattedSystemActivities, ...formattedCloserActivities]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const leadData = {
      id: quizSession.id,
      sessionId: quizSession.id,
      quizType: quizSession.quizType,
      startedAt: quizSession.startedAt?.toISOString(),
      completedAt: quizSession.completedAt?.toISOString(),
      status: quizSession.status,
      durationMs: quizSession.durationMs,
      result: quizSession.result ? {
        archetype: quizSession.result.archetype,
        score: quizSession.result.score,
        insights: quizSession.result.insights || [],
      } : null,
      answers: quizSession.answers.map(a => ({
        questionText: a.question?.prompt,
        answerValue: a.value,
        answer: a.value,
      })),
      user: {
        email: leadEmail || "N/A",
        name: leadName,
        role: "user",
      },
      appointment: appointment ? {
        id: appointment.id,
        outcome: appointment.outcome,
        saleValue: appointment.saleValue ? Number(appointment.saleValue) : null,
        scheduledAt: appointment.scheduledAt.toISOString(),
        createdAt: appointment.createdAt.toISOString(),
        updatedAt: appointment.updatedAt.toISOString(),
        recordingLink: appointment.recordingLink,
        closerNotes: appointment.notes,
      } : null,
      dealClosedAt: appointment?.outcome === 'converted' ? appointment.updatedAt.toISOString() : null,
      closer: appointment?.closer,
      source: quizSession.affiliateCode ? 'Affiliate' : 'Website',
      activities: allActivities,
      notes: notes,
    };

    console.log('[Closer API] Successfully returning lead data');
    return NextResponse.json(leadData);

  } catch (error) {
    console.error('[Closer API] Error fetching lead details:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
