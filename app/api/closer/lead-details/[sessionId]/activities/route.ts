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

        // 3. Outcome history - Get ALL outcome changes from audit log
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

        // Add each outcome change as an activity with call details
        appointmentOutcomeLogs.forEach((log, index) => {
          const details = log.details as any;
          const outcome = details?.outcome;
          
          // Skip converted outcomes (they'll be shown as "deal_closed" instead)
          if (outcome === 'converted') return;

          // First outcome = "marked", subsequent = "updated"
          const isFirstOutcome = index === 0;
          
          activities.push({
            id: `outcome_${log.id}`,
            type: isFirstOutcome ? 'outcome_marked' : 'outcome_updated',
            timestamp: log.createdAt.toISOString(),
            leadName,
            actor: log.closer?.name || 'Unknown',
            details: {
              outcome: outcome,
              recordingLink: details?.recordingLink || null,
              notes: details?.notes || null
            }
          });
        });

        // 4. Deal closed activity (ONLY if appointment outcome is converted)
        if (appointment.outcome === 'converted') {
          activities.push({
            id: `deal_${appointment.id}`,
            type: 'deal_closed',
            timestamp: appointment.updatedAt.toISOString(),
            leadName,
            actor: appointment.closer?.name || 'Unknown',
            details: {
              outcome: 'converted',
              amount: appointment.saleValue ? Number(appointment.saleValue) : null
            }
          });
        }
      }

      // 5. Notes added (all notes for this lead) - EXACT COPY FROM ADMIN
      const notes = await prisma.note.findMany({
        where: { leadEmail },
        orderBy: {
          createdAt: 'asc'
        }
      });

      notes.forEach(note => {
        activities.push({
          id: `note_${note.id}`,
          type: 'note_added',
          timestamp: note.createdAt.toISOString(),
          leadName,
          actor: note.createdBy || 'Unknown',
          details: {
            content: note.content,
            createdByType: note.createdByType
          }
        });
      });
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
