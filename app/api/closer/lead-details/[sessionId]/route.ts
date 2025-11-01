import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCloserIdFromToken } from '@/lib/closer-auth';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const closerId = await getCloserIdFromToken(request);
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

    if (!appointment) {
        // If there is no appointment, the closer has no access.
        return NextResponse.json({ error: 'Lead not assigned to this closer' }, { status: 403 });
    }
    // Also verify ownership
    if (appointment.closerId !== closerId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch Notes
    const notes = await prisma.note.findMany({
      where: { leadEmail: leadEmail },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Construct the detailed activity timeline, mirroring admin logic
    const leadName = quizSession.answers.find(a => a.question?.prompt.toLowerCase().includes('name'))?.value as string || 'Lead';
    
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
        closerName: null, // System events don't have a closer
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
      completedAt: quizSession.completedAt,
      status: appointment?.status || quizSession.status,
      answers: quizSession.answers.map(a => ({
        questionText: a.question?.prompt,
        answerValue: a.value,
      })),
      appointment: appointment,
      dealClosedAt: appointment?.outcome === 'converted' ? appointment.updatedAt : null,
      closer: appointment?.closer,
      source: quizSession.affiliateCode ? 'Affiliate' : 'Website', // Simplified
      activities: allActivities,
      notes: notes,
    };

    return NextResponse.json(leadData);

  } catch (error) {
    console.error('Error fetching lead details for closer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
