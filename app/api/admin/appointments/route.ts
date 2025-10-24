import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { calculateLeadsByCode } from '@/lib/lead-calculation';
import { verifyAdminAuth } from '@/lib/admin-auth-server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }
  
  try {
    // Get all appointments for admin dashboard
    const appointments = await prisma.appointment.findMany({
      orderBy: {
        scheduledAt: 'desc'
      },
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        scheduledAt: true,
        duration: true,
        status: true,
        outcome: true,
        notes: true,
        saleValue: true,
        commissionAmount: true,
        affiliateCode: true,
        closerId: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        createdAt: true,
        updatedAt: true,
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
            name: true,
            email: true
          }
        }
      }
    });

    // Get all quiz sessions that are completed and have name/email (actual leads)
    const quizSessions = await prisma.quizSession.findMany({
      where: {
        status: 'completed'
      },
      orderBy: {
        completedAt: 'desc'
      },
      include: {
        answers: {
          include: {
            question: true
          }
        }
      }
    });

    // Use centralized lead calculation logic (same as lib/lead-calculation.ts)
    const actualLeads = quizSessions.filter(session => {
      const nameAnswer = session.answers.find(a => 
        a.question?.prompt?.toLowerCase().includes('name') ||
        a.question?.text?.toLowerCase().includes('name')
      );
      const emailAnswer = session.answers.find(a => 
        a.question?.prompt?.toLowerCase().includes('email') ||
        a.question?.text?.toLowerCase().includes('email')
      );
      
      return nameAnswer && emailAnswer && nameAnswer.value && emailAnswer.value;
    });
    };

    // Combine appointments and quiz sessions into a unified data structure
    const allLeads = [
      // Appointments (people who booked calls)
      ...appointments.map(apt => ({
        id: apt.id,
        type: 'appointment',
        customerName: apt.customerName,
        customerEmail: apt.customerEmail,
        customerPhone: apt.customerPhone,
        scheduledAt: apt.scheduledAt,
        status: apt.status,
        outcome: apt.outcome,
        saleValue: apt.saleValue,
        notes: apt.notes,
        affiliateCode: apt.affiliateCode,
        closer: apt.closer,
        recordingLinkConverted: apt.recordingLinkConverted,
        recordingLinkNotInterested: apt.recordingLinkNotInterested,
        recordingLinkNeedsFollowUp: apt.recordingLinkNeedsFollowUp,
        recordingLinkWrongNumber: apt.recordingLinkWrongNumber,
        recordingLinkNoAnswer: apt.recordingLinkNoAnswer,
        recordingLinkCallbackRequested: apt.recordingLinkCallbackRequested,
        recordingLinkRescheduled: apt.recordingLinkRescheduled,
      })),
      // Quiz sessions (people who completed quiz but haven't booked calls)
      ...actualLeads.map(session => {
        // Extract name and email from answers
        const nameAnswer = session.answers.find(a => 
          a.question?.prompt?.toLowerCase().includes('name') ||
          a.question?.prompt?.toLowerCase().includes('name')
        );
        const emailAnswer = session.answers.find(a => 
          a.question?.prompt?.toLowerCase().includes('email') ||
          a.question?.prompt?.toLowerCase().includes('email')
        );

        return {
          id: session.id,
          type: 'quiz_session',
          customerName: nameAnswer?.value || 'Unknown',
          customerEmail: emailAnswer?.value || 'Unknown',
          customerPhone: null,
          scheduledAt: session.completedAt || session.createdAt,
          status: 'completed',
          outcome: null,
          saleValue: null,
          notes: null,
          affiliateCode: session.affiliateCode,
          closer: null,
          recordingLinkConverted: null,
          recordingLinkNotInterested: null,
          recordingLinkNeedsFollowUp: null,
          recordingLinkWrongNumber: null,
          recordingLinkNoAnswer: null,
          recordingLinkCallbackRequested: null,
          recordingLinkRescheduled: null,
        };
      })
    ];

    return NextResponse.json({
      success: true,
      appointments: allLeads
    });

  } catch (error) {
    console.error('❌ Error fetching admin appointments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}