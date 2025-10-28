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
        },
        appointment: {
          include: {
            closer: {
              select: {
                id: true,
                name: true
              }
            }
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

    // Get affiliate conversion for deal closure info
    let affiliateConversion = null;
    if (quizSession.affiliateCode) {
      const affiliate = await prisma.affiliate.findUnique({
        where: { referralCode: quizSession.affiliateCode }
      });
      
      if (affiliate && quizSession.appointment?.outcome === 'converted') {
        affiliateConversion = await prisma.affiliateConversion.findFirst({
          where: {
            affiliateId: affiliate.id,
            conversionType: 'sale',
            OR: [
              { quizSessionId: quizSession.id },
              {
                createdAt: {
                  gte: new Date(new Date(quizSession.appointment.updatedAt).getTime() - 60 * 60 * 1000),
                  lte: new Date(new Date(quizSession.appointment.updatedAt).getTime() + 60 * 60 * 1000),
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
    const emailAnswer = quizSession.answers.find(a => 
      a.question?.prompt?.toLowerCase().includes('email')
    );
    
    const notes = emailAnswer ? await prisma.note.findMany({
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

    // Build activity timeline
    const activities: Array<{
      id: string;
      type: 'quiz_completed' | 'call_booked' | 'deal_closed' | 'note_added';
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
    if (quizSession.appointment) {
      const nameAnswer = quizSession.answers.find(a => 
        a.question?.prompt?.toLowerCase().includes('name')
      );
      
      activities.push({
        id: `appointment-${quizSession.appointment.id}`,
        type: 'call_booked',
        timestamp: quizSession.appointment.createdAt.toISOString(),
        leadName: nameAnswer?.value || quizSession.appointment.customerName,
        details: {
          scheduledAt: quizSession.appointment.scheduledAt,
          closerName: quizSession.appointment.closer?.name
        }
      });
    }

    // 3. Deal Closed
    if (affiliateConversion && quizSession.appointment) {
      const nameAnswer = quizSession.answers.find(a => 
        a.question?.prompt?.toLowerCase().includes('name')
      );
      
      activities.push({
        id: `deal-${affiliateConversion.id}`,
        type: 'deal_closed',
        timestamp: affiliateConversion.createdAt.toISOString(),
        actor: quizSession.appointment.closer?.name || 'Unknown Closer',
        leadName: nameAnswer?.value || quizSession.appointment.customerName,
        details: {
          amount: quizSession.appointment.saleValue,
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
        actor: note.closer?.name || 'Unknown',
        leadName: nameAnswer?.value || 'Lead',
        details: {
          content: note.content
        }
      });
    });

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      success: true,
      activities,
      leadEmail: emailAnswer?.value
    });

  } catch (error) {
    console.error('Error fetching activity log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity log', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

