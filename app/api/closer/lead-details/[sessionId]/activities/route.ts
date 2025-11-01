import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCloserIdFromToken } from '@/lib/closer-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  // 🔒 SECURITY: Require closer authentication
  const closerId = getCloserIdFromToken(request);
  if (!closerId) {
    return NextResponse.json(
      { error: 'Unauthorized - Closer authentication required' },
      { status: 401 }
    );
  }

  const { sessionId } = await params;

  try {
    // Get the quiz session to find lead email
    const quizSession = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        answers: {
          include: {
            question: true
          },
          orderBy: {
            createdAt: 'asc'
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
    
    // Find name from answers
    const nameAnswer = quizSession.answers.find(
      a => a.question?.type === 'text' || a.question?.prompt.toLowerCase().includes('name')
    );
    const leadName = nameAnswer?.value ? String(nameAnswer.value) : 'Lead';

    // Verify this closer has access to this lead
    if (leadEmail) {
      const appointment = await prisma.appointment.findFirst({
        where: { customerEmail: leadEmail },
      });

      if (!appointment || appointment.closerId !== closerId) {
        return NextResponse.json(
          { error: 'Forbidden - This lead is not assigned to you' },
          { status: 403 }
        );
      }
    }

    const activities: Array<{
      id: string;
      type: 'quiz_completed' | 'call_booked' | 'deal_closed' | 'outcome_marked' | 'outcome_updated' | 'note_added' | 'task_created' | 'task_started' | 'task_completed';
      timestamp: string;
      leadName: string;
      actor?: string;
      details?: any;
    }> = [];

    // 1. Quiz completed activity
    if (quizSession.completedAt) {
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

    // 2. Call booked activity (if they have an appointment)
    if (leadEmail) {
      const appointment = await prisma.appointment.findFirst({
        where: { customerEmail: leadEmail },
        include: {
          closer: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (appointment) {
        activities.push({
          id: `call_${appointment.id}`,
          type: 'call_booked',
          timestamp: appointment.createdAt.toISOString(),
          leadName,
          actor: appointment.closer?.name,
          details: {
            scheduledAt: appointment.scheduledAt.toISOString(),
            closerName: appointment.closer?.name || null,
          },
        });

        // Get ALL outcome updates from CloserAuditLog (matching admin logic)
        const outcomeAuditLogs = await prisma.closerAuditLog.findMany({
          where: {
            action: 'appointment_outcome_updated',
            closerId: appointment.closerId || undefined
          },
          include: {
            closer: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        });

        // Filter logs for this specific appointment
        const appointmentOutcomeLogs = outcomeAuditLogs.filter(log => {
          const details = log.details as any;
          return details?.appointmentId === appointment.id;
        });

        // Add each outcome change as an activity
        appointmentOutcomeLogs.forEach((log) => {
          const details = log.details as any;
          const outcome = details?.outcome;
          
          let activityType: 'outcome_updated' | 'outcome_marked' | 'deal_closed' | 'note_added' = 'outcome_marked';
          
          if (log.type === 'note_added') {
            activityType = 'note_added';
          } else if (outcome === 'converted') {
            activityType = 'deal_closed';
          }

          activities.push({
            id: log.id,
            type: activityType,
            timestamp: log.createdAt.toISOString(),
            leadName,
            actor: log.closer?.name || 'Unknown',
            details: { 
              outcome: outcome,
              recordingLink: details?.recordingLink,
              notes: details?.notes,
              ...details 
            },
          });
        });
      }
    }

    // Sort activities by timestamp
    activities.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

