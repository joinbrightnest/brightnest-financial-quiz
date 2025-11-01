import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!JWT_SECRET) {
      console.error('FATAL: JWT_SECRET or NEXTAUTH_SECRET is not set');
      return NextResponse.json({ error: 'Authentication configuration error' }, { status: 500 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.role !== 'closer') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id: appointmentId } = await params;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        closer: { select: { id: true, name: true } }
      }
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (appointment.closerId !== decoded.closerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const leadEmail = appointment.customerEmail;
    
    // This is the critical change: We safely fetch the quiz session. It's okay if it's null.
    const quizSession = leadEmail ? await prisma.quizSession.findFirst({
      where: { answers: { some: { value: { contains: leadEmail } } } },
      include: { answers: { include: { question: true } } }
    }) : null;

    const leadName = quizSession?.answers?.find(
      a => a.question?.prompt.toLowerCase().includes('name')
    )?.value || appointment.customerName || 'Lead';

    const activities: any[] = [];

    // 1. Quiz completed (only if a quiz session exists)
    if (quizSession?.completedAt) {
      activities.push({
        id: `quiz_${quizSession.id}`,
        type: 'quiz_completed',
        timestamp: quizSession.completedAt.toISOString(),
        leadName,
        details: {
          quizType: quizSession.quizType,
          answersCount: quizSession.answers.length
        }
      });
    }

    // 2. Call booked activity
    activities.push({
      id: `call_${appointment.id}`,
      type: 'call_booked',
      timestamp: appointment.createdAt.toISOString(),
      leadName,
      details: {
        scheduledAt: appointment.scheduledAt.toISOString(),
        closerName: appointment.closer?.name || null,
        closerId: appointment.closerId || null,
      }
    });

    // 3. Outcome history from audit logs
    const outcomeAuditLogs = await prisma.closerAuditLog.findMany({
        where: {
          action: 'appointment_outcome_updated',
          closerId: decoded.closerId
        },
        include: { closer: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' }
    });

    // Filter logs for this specific appointment
    const appointmentOutcomeLogs = outcomeAuditLogs.filter(log => {
      const details = log.details as any;
      return details?.appointmentId === appointment.id;
    });

    const getLegacyRecordingLink = (outcome: string | null): string | null => {
        if (!outcome) return null;
        switch (outcome) {
            case 'converted': return appointment.recordingLinkConverted;
            case 'not_interested': return appointment.recordingLinkNotInterested;
            case 'needs_follow_up': return appointment.recordingLinkNeedsFollowUp;
            case 'wrong_number': return appointment.recordingLinkWrongNumber;
            case 'no_answer': return appointment.recordingLinkNoAnswer;
            case 'callback_requested': return appointment.recordingLinkCallbackRequested;
            case 'rescheduled': return appointment.recordingLinkRescheduled;
            default: return null;
        }
    };

    appointmentOutcomeLogs.forEach((log, index) => {
      const details = log.details as any;
      const outcome = details?.outcome;
      
      if (outcome === 'converted') return;

      const recordingLink = details?.hasOwnProperty('recordingLink') ? details.recordingLink : getLegacyRecordingLink(outcome);
      const notes = details?.hasOwnProperty('notes') ? details.notes : appointment.notes || null;

      activities.push({
        id: `outcome_${log.id}`,
        type: index === 0 ? 'outcome_marked' : 'outcome_updated',
        timestamp: log.createdAt.toISOString(),
        leadName,
        actor: log.closer?.name || 'Unknown',
        details: {
          outcome,
          saleValue: details?.saleValue ? Number(details.saleValue) : null,
          previousOutcome: details?.previousOutcome || null,
          recordingLink: recordingLink || null,
          notes: notes || null
        }
      });
    });

    // 4. Deal closed activity
    if (appointment.outcome === 'converted') {
        const convertedLog = outcomeAuditLogs.find(log => (log.details as any)?.outcome === 'converted');
        const convertedDetails = convertedLog?.details as any;

        const recordingLink = convertedDetails?.hasOwnProperty('recordingLink') 
            ? convertedDetails.recordingLink 
            : getLegacyRecordingLink('converted');

        const notes = convertedDetails?.hasOwnProperty('notes') 
            ? convertedDetails.notes 
            : appointment.notes || null;

        activities.push({
            id: `deal_${appointment.id}`,
            type: 'deal_closed',
            timestamp: (convertedLog?.createdAt || appointment.updatedAt).toISOString(),
            leadName,
            actor: appointment.closer?.name || 'Unknown',
            details: {
              outcome: 'converted',
              saleValue: appointment.saleValue ? Number(appointment.saleValue) : null,
              commission: appointment.commissionAmount ? Number(appointment.commissionAmount) : null,
              recordingLink: recordingLink || null,
              notes: notes || null
            }
        });
    }

    // Handle legacy appointments with no audit logs
    if (appointment.outcome && outcomeAuditLogs.length === 0) {
        if (appointment.outcome !== 'converted') {
            activities.push({
                id: `outcome_${appointment.id}`,
                type: 'outcome_marked',
                timestamp: appointment.updatedAt.toISOString(),
                leadName,
                actor: appointment.closer?.name || 'Unknown',
                details: {
                    outcome: appointment.outcome,
                    saleValue: appointment.saleValue ? Number(appointment.saleValue) : null,
                    recordingLink: getLegacyRecordingLink(appointment.outcome) || null,
                    notes: appointment.notes || null
                }
            });
        }
    }

    // 5. Notes and Tasks
    if (leadEmail) {
        const notes = await prisma.note.findMany({ where: { leadEmail }, orderBy: { createdAt: 'asc' } });
        notes.forEach(note => activities.push({
            id: `note_${note.id}`,
            type: 'note_added',
            timestamp: note.createdAt.toISOString(),
            leadName,
            actor: note.createdBy || 'Unknown',
            details: { content: note.content }
        }));

        const tasks = await prisma.task.findMany({ where: { leadEmail }, include: { closer: true }, orderBy: { createdAt: 'asc' } });
        tasks.forEach(task => {
            activities.push({
                id: `task_created_${task.id}`, type: 'task_created', timestamp: task.createdAt.toISOString(),
                leadName, actor: task.closer?.name || 'Unknown', details: { title: task.title }
            });
            if (task.completedAt) {
                activities.push({
                    id: `task_completed_${task.id}`, type: 'task_completed', timestamp: task.completedAt.toISOString(),
                    leadName, actor: task.closer?.name || 'Unknown', details: { title: task.title }
                });
            }
        });
    }

    activities.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return NextResponse.json({ activities });

  } catch (error) {
    console.error('Error fetching closer activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}
