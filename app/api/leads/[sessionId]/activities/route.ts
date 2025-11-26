import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/admin-auth-server';
import { getCloserIdFromToken } from '@/lib/closer-auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    // 🔒 SECURITY: Role-based authentication
    const isAdmin = verifyAdminAuth(request);
    const closerId = getCloserIdFromToken(request);

    if (!isAdmin && !closerId) {
        return NextResponse.json(
            { error: 'Unauthorized - Authentication required' },
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

        // Find email from answers - try multiple methods for robustness
        let leadEmail: string | null = null;

        // Method 1: Look for answer where question type is 'email' or prompt mentions email
        const emailAnswer = quizSession.answers.find(
            a => a.question?.type === 'email' || a.question?.prompt?.toLowerCase().includes('email')
        );
        if (emailAnswer?.value) {
            leadEmail = String(emailAnswer.value);
        }

        // Method 2: Fallback - look for any answer value that contains @
        if (!leadEmail) {
            const emailByValue = quizSession.answers.find(
                a => {
                    const val = a.value;
                    if (!val) return false;
                    const strVal = typeof val === 'string' ? val : JSON.stringify(val);
                    return strVal.includes('@');
                }
            );
            if (emailByValue?.value) {
                leadEmail = String(emailByValue.value);
            }
        }

        console.log('[Activities API] Session:', sessionId, 'Email found:', leadEmail, 'Role:', isAdmin ? 'admin' : 'closer');

        // Find name from answers
        const nameAnswer = quizSession.answers.find(
            a => a.question?.type === 'text' || a.question?.prompt?.toLowerCase().includes('name')
        );
        const leadName = nameAnswer?.value ? String(nameAnswer.value) : 'Lead';

        // 🔒 PERMISSION CHECK: Verify closer has access to this lead
        if (!isAdmin && leadEmail) {
            const appointment = await prisma.appointment.findFirst({
                where: { customerEmail: leadEmail },
            });

            const hasAppointment = appointment && appointment.closerId === closerId;

            let hasTasks = false;
            if (!hasAppointment) {
                const tasksCount = await prisma.task.count({
                    where: {
                        leadEmail: leadEmail,
                        closerId: closerId!
                    }
                });
                hasTasks = tasksCount > 0;
            }

            if (!hasAppointment && !hasTasks) {
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
                select: {
                    id: true,
                    closerId: true,
                    customerEmail: true,
                    customerName: true,
                    scheduledAt: true,
                    createdAt: true,
                    updatedAt: true,
                    outcome: true,
                    notes: true,
                    saleValue: true,
                    commissionAmount: true,
                    recordingLink: true,
                    recordingLinkConverted: true,
                    recordingLinkNotInterested: true,
                    recordingLinkNeedsFollowUp: true,
                    recordingLinkWrongNumber: true,
                    recordingLinkNoAnswer: true,
                    recordingLinkCallbackRequested: true,
                    recordingLinkRescheduled: true,
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
                const getLegacyRecordingLink = (outcome: string | null): string | null => {
                    if (!outcome) return appointment.recordingLink;
                    switch (outcome) {
                        case 'converted':
                            return appointment.recordingLinkConverted;
                        case 'not_interested':
                            return appointment.recordingLinkNotInterested;
                        case 'needs_follow_up':
                            return appointment.recordingLinkNeedsFollowUp;
                        case 'wrong_number':
                            return appointment.recordingLinkWrongNumber;
                        case 'no_answer':
                            return appointment.recordingLinkNoAnswer;
                        case 'callback_requested':
                            return appointment.recordingLinkCallbackRequested;
                        case 'rescheduled':
                            return appointment.recordingLinkRescheduled;
                        default:
                            return appointment.recordingLink;
                    }
                };

                activities.push({
                    id: `call_${appointment.id}`,
                    type: 'call_booked',
                    timestamp: appointment.createdAt.toISOString(),
                    leadName,
                    actor: appointment.closer?.name,
                    details: {
                        scheduledAt: appointment.scheduledAt.toISOString(),
                        closerName: appointment.closer?.name || null,
                        closerId: appointment.closerId || null,
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

                    // Get recording link and notes from the audit log details first
                    const recordingLink = details?.hasOwnProperty('recordingLink')
                        ? details.recordingLink
                        : getLegacyRecordingLink(outcome);

                    const notes = details?.hasOwnProperty('notes')
                        ? details.notes
                        : appointment.notes || null;

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
                            notes: notes || null
                        }
                    });
                });

                // 4. Deal closed activity (ONLY if appointment outcome is converted)
                if (appointment.outcome === 'converted') {
                    // Find the affiliate conversion record to get the exact close date
                    const conversion = await prisma.affiliateConversion.findFirst({
                        where: {
                            quizSessionId: quizSession.id,
                            conversionType: 'sale'
                        },
                        orderBy: {
                            createdAt: 'desc'
                        }
                    });

                    const closeDate = conversion?.createdAt || appointment.updatedAt;

                    // Find the audit log entry for the "converted" outcome
                    const convertedOutcomeLog = appointmentOutcomeLogs.find((log) => {
                        const details = log.details as any;
                        return details?.outcome === 'converted';
                    });

                    // Get recording link and notes from audit log if available
                    const convertedDetails = convertedOutcomeLog?.details as any;
                    const recordingLink = convertedDetails?.hasOwnProperty('recordingLink')
                        ? convertedDetails.recordingLink
                        : getLegacyRecordingLink('converted') || appointment.recordingLink || null;

                    const notes = convertedDetails?.hasOwnProperty('notes')
                        ? convertedDetails.notes
                        : appointment.notes || null;

                    activities.push({
                        id: `deal_${appointment.id}`,
                        type: 'deal_closed',
                        timestamp: closeDate.toISOString(),
                        leadName,
                        actor: appointment.closer?.name || 'Unknown',
                        details: {
                            outcome: 'converted',
                            amount: appointment.saleValue ? Number(appointment.saleValue) : null,
                            saleValue: appointment.saleValue ? Number(appointment.saleValue) : null,
                            commission: appointment.commissionAmount ? Number(appointment.commissionAmount) : null,
                            recordingLink: recordingLink || null,
                            notes: notes || null
                        }
                    });
                }

                // Handle legacy appointments (no audit logs yet)
                if (appointment.outcome && appointmentOutcomeLogs.length === 0 && appointment.outcome !== 'converted') {
                    const recordingLink = getLegacyRecordingLink(appointment.outcome);

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

            // 5. Notes added (all notes for this lead)
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

        // Sort all activities by timestamp with secondary sorting for logical order
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
