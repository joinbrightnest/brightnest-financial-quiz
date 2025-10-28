import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/admin-auth-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
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

    const activities: Array<{
      id: string;
      type: 'quiz_completed' | 'call_booked' | 'deal_closed' | 'note_added' | 'task_created';
      timestamp: string;
      leadName: string;
      actor?: string; // Who performed the action
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
          details: {
            scheduledAt: appointment.scheduledAt.toISOString(),
            closerName: appointment.closer?.name || null
          }
        });

        // 3. Deal closed activity (if appointment outcome is converted)
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

          activities.push({
            id: `deal_${appointment.id}`,
            type: 'deal_closed',
            timestamp: closeDate.toISOString(),
            leadName,
            actor: appointment.closer?.name || 'Unknown',
            details: {
              amount: appointment.saleValue ? Number(appointment.saleValue) : null,
              commission: appointment.commissionAmount ? Number(appointment.commissionAmount) : null
            }
          });
        }
      }

      // 4. Notes added (all notes for this lead)
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

      // 5. Tasks created (all tasks for this lead)
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
        activities.push({
          id: `task_${task.id}`,
          type: 'task_created',
          timestamp: task.createdAt.toISOString(),
          leadName,
          actor: task.closer?.name || 'Unknown',
          details: {
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate?.toISOString() || null,
            completedAt: task.completedAt?.toISOString() || null
          }
        });
      });
    }

    // Sort all activities by timestamp (newest first for timeline display, but we'll reverse on frontend)
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

