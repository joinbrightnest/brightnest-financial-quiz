import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/admin-auth-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }

  try {
    const { sessionId } = params;

    // Get quiz session with related data
    const quizSession = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        answers: {
          include: {
            question: true
          }
        }
      }
    });

    if (!quizSession) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Get email from quiz answers
    const emailAnswer = quizSession.answers.find(a => 
      a.question?.prompt?.toLowerCase().includes('email')
    );

    // Get appointment by matching email (same as main leads route)
    const email = emailAnswer?.value;
    let appointment = null;
    
    if (email && typeof email === 'string') {
      appointment = await prisma.appointment.findFirst({
        where: {
          customerEmail: email.toLowerCase()
        },
        select: {
          id: true,
          customerName: true,
          customerEmail: true,
          scheduledAt: true,
          outcome: true,  // EXPLICITLY select outcome
          notes: true,
          saleValue: true,
          status: true,
          closerId: true,
          createdAt: true,
          updatedAt: true,
          closer: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
    }

    console.log('🔍 Appointment lookup:', {
      sessionId,
      email,
      appointmentFound: !!appointment,
      appointmentId: appointment?.id,
      outcome: appointment?.outcome,
      closerId: appointment?.closerId
    });

    // Get affiliate conversion for deal closure info
    let affiliateConversion = null;
    if (quizSession.affiliateCode && appointment?.outcome === 'converted') {
      const affiliate = await prisma.affiliate.findUnique({
        where: { referralCode: quizSession.affiliateCode }
      });
      
      if (affiliate) {
        affiliateConversion = await prisma.affiliateConversion.findFirst({
          where: {
            affiliateId: affiliate.id,
            conversionType: 'sale',
            OR: [
              { quizSessionId: quizSession.id },
              {
                createdAt: {
                  gte: new Date(new Date(appointment.updatedAt).getTime() - 60 * 60 * 1000),
                  lte: new Date(new Date(appointment.updatedAt).getTime() + 60 * 60 * 1000),
                }
              }
            ]
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
      }
    }

    // Get notes for this lead
    
    const notes = emailAnswer ? await prisma.note.findMany({
      where: {
        leadEmail: emailAnswer.value
      },
      orderBy: {
        createdAt: 'desc'
      }
    }) : [];

    // Get tasks for this lead
    const tasks = emailAnswer ? await prisma.task.findMany({
      where: {
        leadEmail: emailAnswer.value
      },
      include: {
        closer: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }) : [];

    // Get audit logs for appointment outcome changes
    // Fetch all outcome update logs for this closer and filter by appointmentId
    const allAuditLogs = appointment ? await prisma.closerAuditLog.findMany({
      where: {
        action: 'appointment_outcome_updated',
        closerId: appointment.closerId || undefined
      },
      include: {
        closer: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }) : [];

    // Filter by appointmentId in JavaScript since JSON querying can be database-specific
    const auditLogs = allAuditLogs.filter(log => {
      const details = log.details as any;
      return details?.appointmentId === appointment?.id;
    });

    console.log('📊 Activity Log Debug:', {
      sessionId,
      appointmentId: appointment?.id,
      closerId: appointment?.closerId,
      totalAuditLogs: allAuditLogs.length,
      filteredAuditLogs: auditLogs.length,
      auditLogSample: allAuditLogs.slice(0, 2).map(log => ({
        id: log.id,
        details: log.details
      }))
    });

    // Build activity timeline
    const activities: Array<{
      id: string;
      type: 'quiz_completed' | 'call_booked' | 'deal_closed' | 'note_added' | 'task_created' | 'task_started' | 'task_finished' | 'outcome_updated';
      timestamp: string;
      actor?: string;
      leadName?: string;
      details?: any;
    }> = [];

    // 1. Quiz Completed
    if (quizSession.completedAt) {
      const nameAnswer = quizSession.answers.find(a => 
        a.question?.prompt?.toLowerCase().includes('name')
      );
      
      activities.push({
        id: `quiz-${quizSession.id}`,
        type: 'quiz_completed',
        timestamp: quizSession.completedAt.toISOString(),
        leadName: nameAnswer?.value || 'Unknown',
        details: {
          quizType: quizSession.quizType,
          answersCount: quizSession.answers.length
        }
      });
    }

    // 2. Call Booked
    if (appointment) {
      const nameAnswer = quizSession.answers.find(a => 
        a.question?.prompt?.toLowerCase().includes('name')
      );
      
      activities.push({
        id: `appointment-${appointment.id}`,
        type: 'call_booked',
        timestamp: appointment.createdAt.toISOString(),
        leadName: nameAnswer?.value || appointment.customerName,
        details: {
          scheduledAt: appointment.scheduledAt,
          closerName: appointment.closer?.name
        }
      });
    }

    // 3. Deal Closed
    if (affiliateConversion && appointment) {
      const nameAnswer = quizSession.answers.find(a => 
        a.question?.prompt?.toLowerCase().includes('name')
      );
      
      activities.push({
        id: `deal-${affiliateConversion.id}`,
        type: 'deal_closed',
        timestamp: affiliateConversion.createdAt.toISOString(),
        actor: appointment.closer?.name || 'Unknown Closer',
        leadName: nameAnswer?.value || appointment.customerName,
        details: {
          amount: appointment.saleValue,
          commission: affiliateConversion.commissionAmount
        }
      });
    }

    // 4. Notes Added
    notes.forEach(note => {
      const nameAnswer = quizSession.answers.find(a => 
        a.question?.prompt?.toLowerCase().includes('name')
      );
      
      activities.push({
        id: `note-${note.id}`,
        type: 'note_added',
        timestamp: note.createdAt.toISOString(),
        actor: note.createdBy || 'Unknown',
        leadName: nameAnswer?.value || 'Lead',
        details: {
          content: note.content
        }
      });
    });

    // 5. SHOW OUTCOME - Force it to appear
    const nameAnswerForOutcome = quizSession.answers.find(a => 
      a.question?.prompt?.toLowerCase().includes('name')
    );
    
    if (appointment) {
      console.log('🔥 APPOINTMENT DATA:', {
        id: appointment.id,
        hasOutcome: !!appointment.outcome,
        outcomeValue: appointment.outcome,
        outcomeType: typeof appointment.outcome,
        allKeys: Object.keys(appointment)
      });
      
      // Force add outcome if it exists
      if (appointment.outcome) {
        const outcomeActivity = {
          id: `outcome-${appointment.id}-${Date.now()}`,
          type: 'outcome_updated' as const,
          timestamp: appointment.updatedAt.toISOString(),
          actor: appointment.closer?.name || 'Stefan',
          leadName: nameAnswerForOutcome?.value || 'Lead',
          details: {
            outcome: String(appointment.outcome),
            saleValue: appointment.saleValue,
            notes: appointment.notes
          }
        };
        
        console.log('✅ PUSHING OUTCOME ACTIVITY:', outcomeActivity);
        activities.push(outcomeActivity);
        console.log('✅ Activities array length after push:', activities.length);
      }
    }

    // 6. Task Activities
    tasks.forEach(task => {
      const nameAnswer = quizSession.answers.find(a => 
        a.question?.prompt?.toLowerCase().includes('name')
      );

      // Task created
      activities.push({
        id: `task-created-${task.id}`,
        type: 'task_created',
        timestamp: task.createdAt.toISOString(),
        actor: task.closer?.name || 'Unknown',
        leadName: nameAnswer?.value || 'Lead',
        details: {
          title: task.title,
          description: task.description,
          priority: task.priority,
          dueDate: task.dueDate
        }
      });

      // Task started (if status is in_progress or completed and updatedAt != createdAt)
      if ((task.status === 'in_progress' || task.status === 'completed') && 
          task.updatedAt.getTime() !== task.createdAt.getTime()) {
        activities.push({
          id: `task-started-${task.id}`,
          type: 'task_started',
          timestamp: task.updatedAt.toISOString(),
          actor: task.closer?.name || 'Unknown',
          leadName: nameAnswer?.value || 'Lead',
          details: {
            title: task.title
          }
        });
      }

      // Task finished (if completed)
      if (task.status === 'completed' && task.completedAt) {
        activities.push({
          id: `task-finished-${task.id}`,
          type: 'task_finished',
          timestamp: task.completedAt.toISOString(),
          actor: task.closer?.name || 'Unknown',
          leadName: nameAnswer?.value || 'Lead',
          details: {
            title: task.title
          }
        });
      }
    });

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      success: true,
      activities,
      leadEmail: emailAnswer?.value,
      // Debug info
      debug: {
        appointmentFound: !!appointment,
        appointmentId: appointment?.id,
        outcome: appointment?.outcome,
        closerId: appointment?.closerId,
        totalAuditLogs: allAuditLogs.length,
        filteredAuditLogs: auditLogs.length
      }
    });

  } catch (error) {
    console.error('Error fetching activity log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity log', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

