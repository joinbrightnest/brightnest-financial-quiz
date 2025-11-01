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

    // First, verify this closer is assigned to this lead
    const lead = await prisma.quizCompletion.findUnique({
      where: { id: sessionId },
      select: {
        appointment: {
          select: {
            closerId: true,
          },
        },
      },
    });

    if (!lead || lead.appointment?.closerId !== closerId) {
      return NextResponse.json({ error: 'Lead not found or access denied' }, { status: 404 });
    }

    // Now, build the activity timeline similar to the admin endpoint
    const quizSession = await prisma.quizCompletion.findUnique({
      where: { id: sessionId },
      include: {
        answers: {
          include: {
            question: true
          }
        },
        appointment: {
            include: {
                closer: true
            }
        }
      }
    });

    if (!quizSession) {
      return NextResponse.json({ error: 'Quiz session not found' }, { status: 404 });
    }

    const emailAnswer = quizSession.answers.find(a => a.question?.prompt.toLowerCase().includes('email'));
    const leadEmail = emailAnswer?.value;
    const nameAnswer = quizSession.answers.find(a => a.question?.prompt.toLowerCase().includes('name'));
    const leadName = nameAnswer?.value || 'Lead';

    const activities: any[] = [];

    // 1. Quiz completed
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

    // 2. Call booked
    const appointment = quizSession.appointment;
    if (appointment) {
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
    
        // 3. Outcome history from ActivityLog
        const outcomeLogs = await prisma.activityLog.findMany({
            where: {
                sessionId: sessionId,
                type: {
                    in: ['outcome_updated', 'outcome_marked', 'deal_closed']
                }
            },
            orderBy: {
                timestamp: 'asc'
            }
        });

        outcomeLogs.forEach((log, index) => {
            const details = log.details as any;
            const outcome = details?.outcome;

            // Use deal_closed type for converted outcome
            const activityType = outcome === 'converted' ? 'deal_closed' : (index === 0 ? 'outcome_marked' : 'outcome_updated');
            
            activities.push({
                id: log.id,
                type: activityType,
                timestamp: log.timestamp.toISOString(),
                leadName,
                actor: log.actor || appointment.closer?.name || 'Unknown',
                details: {
                    outcome: outcome,
                    saleValue: details?.saleValue ? Number(details.saleValue) : null,
                    previousOutcome: details?.previousOutcome || null,
                    recordingLink: details?.recordingLink || null,
                    notes: details?.notes || null
                }
            });
        });
    }
    
    // Sort activities chronologically
    activities.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching activities for closer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
