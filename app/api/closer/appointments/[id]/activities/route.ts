import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authentication token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!JWT_SECRET) {
      return NextResponse.json(
        { error: 'Authentication configuration error' },
        { status: 500 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.role !== 'closer') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get the appointment to find lead email
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        closer: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Verify the appointment belongs to this closer
    if (appointment.closerId !== decoded.closerId) {
      return NextResponse.json(
        { error: 'Unauthorized - This appointment does not belong to you' },
        { status: 403 }
      );
    }

    const leadEmail = appointment.customerEmail;

    // Find the quiz session from the email
    const quizSession = await prisma.quizSession.findFirst({
      where: {
        answers: {
          some: {
            value: {
              contains: leadEmail
            }
          }
        }
      },
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

    // Find name from answers
    const nameAnswer = quizSession?.answers.find(
      a => a.question?.type === 'text' || a.question?.prompt.toLowerCase().includes('name')
    );
    const leadName = nameAnswer?.value ? String(nameAnswer.value) : appointment.customerName || 'Lead';

    const activities: Array<{
      id: string;
      type: 'quiz_completed' | 'call_booked' | 'deal_closed' | 'outcome_marked' | 'outcome_updated' | 'note_added' | 'task_created' | 'task_started' | 'task_completed';
      timestamp: string;
      leadName: string;
      actor?: string;
      details?: any;
    }> = [];

    // 1. Quiz completed activity
    if (quizSession && quizSession.completedAt) {
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
    if (appointment) {
      // Determine which recording link to use (priority: outcome-specific > general)
      let recordingLink = null;
      if (appointment.outcome) {
        switch (appointment.outcome) {
          case 'converted':
            recordingLink = appointment.recordingLinkConverted;
            break;
          case 'not_interested':
            recordingLink = appointment.recordingLinkNotInterested;
            break;
          case 'needs_follow_up':
            recordingLink = appointment.recordingLinkNeedsFollowUp;
            break;
          case 'wrong_number':
            recordingLink = appointment.recordingLinkWrongNumber;
            break;
          case 'no_answer':
            recordingLink = appointment.recordingLinkNoAnswer;
            break;
          case 'callback_requested':
            recordingLink = appointment.recordingLinkCallbackRequested;
            break;
          case 'rescheduled':
            recordingLink = appointment.recordingLinkRescheduled;
            break;
          default:
            recordingLink = appointment.recordingLink;
        }
      } else {
        // No outcome set yet, use general recording link
        recordingLink = appointment.recordingLink;
      }

      activities.push({
        id: `call_${appointment.id}`,
        type: 'call_booked',
        timestamp: appointment.createdAt.toISOString(),
        leadName,
        details: {
          scheduledAt: appointment.scheduledAt.toISOString(),
          closerName: appointment.closer?.name || null,
          closerId: appointment.closerId || null,
          recordingLink: recordingLink || null,
          notes: appointment.notes || null,
          outcome: appointment.outcome || null
        }
      });

      // 3. Outcome history with call details - Get ALL outcome changes from audit log
      const outcomeAuditLogs = await prisma.closerAuditLog.findMany({
        where: {
          action: 'appointment_outcome_updated',
          closerId: decoded.closerId
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

        // Get recording link and notes from the audit log details first (like admin API)
        // This ensures we show the recording link and notes that were set at the time of this specific outcome update
        let recordingLink = details?.recordingLink || null;
        
        // Fallback to appointment fields if not in audit log (for older records)
        if (!recordingLink) {
          switch (outcome) {
            case 'converted':
              recordingLink = appointment.recordingLinkConverted;
              break;
            case 'not_interested':
              recordingLink = appointment.recordingLinkNotInterested;
              break;
            case 'needs_follow_up':
              recordingLink = appointment.recordingLinkNeedsFollowUp;
              break;
            case 'wrong_number':
              recordingLink = appointment.recordingLinkWrongNumber;
              break;
            case 'no_answer':
              recordingLink = appointment.recordingLinkNoAnswer;
              break;
            case 'callback_requested':
              recordingLink = appointment.recordingLinkCallbackRequested;
              break;
            case 'rescheduled':
              recordingLink = appointment.recordingLinkRescheduled;
              break;
            default:
              recordingLink = appointment.recordingLink;
          }
        }

        // Get notes from audit log (stored when outcome was updated)
        // Fallback to appointment notes for older records
        const notes = details?.notes !== undefined ? details.notes : (appointment.notes || null);

        // First outcome = "marked", subsequent = "updated"
        const isFirstOutcome = index === 0;
        
        activities.push({
          id: `outcome_${log.id}`,
          type: isFirstOutcome ? 'outcome_marked' : 'outcome_updated' as any,
          timestamp: log.createdAt.toISOString(),
          leadName,
          actor: log.closer?.name || 'Unknown',
          details: {
            outcome: outcome,
            saleValue: details?.saleValue ? Number(details.saleValue) : null,
            previousOutcome: details?.previousOutcome || null,
            isFirstOutcome,
            recordingLink: recordingLink || null,
            notes: notes
          }
        });
      });

      // 4. Deal closed activity (ONLY if appointment outcome is converted)
      if (appointment.outcome === 'converted') {
        // Find the affiliate conversion record to get the exact close date
        const conversion = quizSession ? await prisma.affiliateConversion.findFirst({
          where: {
            quizSessionId: quizSession.id,
            conversionType: 'sale'
          },
          orderBy: {
            createdAt: 'desc'
          }
        }) : null;

        const closeDate = conversion?.createdAt || appointment.updatedAt;

        // Find the audit log entry for the "converted" outcome to get the notes and recording link
        const convertedOutcomeLog = appointmentOutcomeLogs.find((log) => {
          const details = log.details as any;
          return details?.outcome === 'converted';
        });

        // Get recording link and notes from audit log if available, otherwise fallback to appointment
        const convertedDetails = convertedOutcomeLog?.details as any;
        const recordingLink = convertedDetails?.recordingLink || appointment.recordingLinkConverted || appointment.recordingLink || null;
        const notes = convertedDetails?.notes !== undefined ? convertedDetails.notes : (appointment.notes || null);

        activities.push({
          id: `deal_${appointment.id}`,
          type: 'deal_closed',
          timestamp: closeDate.toISOString(),
          leadName,
          actor: appointment.closer?.name || 'Unknown',
          details: {
            outcome: 'converted', // Include outcome for consistent UI display
            amount: appointment.saleValue ? Number(appointment.saleValue) : null,
            saleValue: appointment.saleValue ? Number(appointment.saleValue) : null, // Also include saleValue for consistency
            commission: appointment.commissionAmount ? Number(appointment.commissionAmount) : null,
            recordingLink: recordingLink,
            notes: notes
          }
        });
      }

      // If appointment has outcome but no audit logs yet, still show call details
      if (appointment.outcome && appointmentOutcomeLogs.length === 0) {
        let recordingLink = null;
        switch (appointment.outcome) {
          case 'converted':
            recordingLink = appointment.recordingLinkConverted;
            break;
          case 'not_interested':
            recordingLink = appointment.recordingLinkNotInterested;
            break;
          case 'needs_follow_up':
            recordingLink = appointment.recordingLinkNeedsFollowUp;
            break;
          case 'wrong_number':
            recordingLink = appointment.recordingLinkWrongNumber;
            break;
          case 'no_answer':
            recordingLink = appointment.recordingLinkNoAnswer;
            break;
          case 'callback_requested':
            recordingLink = appointment.recordingLinkCallbackRequested;
            break;
          case 'rescheduled':
            recordingLink = appointment.recordingLinkRescheduled;
            break;
          default:
            recordingLink = appointment.recordingLink;
        }

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
              isFirstOutcome: true,
              recordingLink: recordingLink || null,
              notes: appointment.notes || null
            }
          });
        }
      }
    }

    // 5. Notes added (all notes for this lead)
    if (leadEmail) {
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

      // 6. Tasks created (all tasks for this lead)
      const tasks = await prisma.task.findMany({
        where: { leadEmail },
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

      tasks.forEach(task => {
        // 1. Task created
        activities.push({
          id: `task_created_${task.id}`,
          type: 'task_created',
          timestamp: task.createdAt.toISOString(),
          leadName,
          actor: task.closer?.name || 'Unknown',
          details: {
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate?.toISOString() || null
          }
        });

        // 2. Task started (if status is in_progress or completed)
        if (task.status === 'in_progress' || task.status === 'completed') {
          const startTime = task.updatedAt.toISOString();
          activities.push({
            id: `task_started_${task.id}`,
            type: 'task_started',
            timestamp: startTime,
            leadName,
            actor: task.closer?.name || 'Unknown',
            details: {
              title: task.title
            }
          });
        }

        // 3. Task completed (if completedAt exists)
        if (task.completedAt) {
          activities.push({
            id: `task_completed_${task.id}`,
            type: 'task_completed',
            timestamp: task.completedAt.toISOString(),
            leadName,
            actor: task.closer?.name || 'Unknown',
            details: {
              title: task.title
            }
          });
        }
      });
    }

    // Sort all activities by timestamp
    const activityTypePriority: { [key: string]: number } = {
      'quiz_completed': 1,
      'call_booked': 2,
      'task_created': 3,
      'task_started': 4,
      'note_added': 5,
      'outcome_marked': 6,
      'outcome_updated': 7,
      'task_completed': 8,
      'deal_closed': 9
    };

    activities.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      
      if (timeA === timeB) {
        const priorityA = activityTypePriority[a.type] || 999;
        const priorityB = activityTypePriority[b.type] || 999;
        return priorityA - priorityB;
      }
      
      return timeA - timeB;
    });

    return NextResponse.json({ activities });

  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

