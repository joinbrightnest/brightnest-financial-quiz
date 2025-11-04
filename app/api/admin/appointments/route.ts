import { NextRequest, NextResponse } from 'next/server';
import { calculateLeadsByCode } from '@/lib/lead-calculation';
import { verifyAdminAuth } from '@/lib/admin-auth-server';
import { prisma } from '@/lib/prisma';

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

    // Debug: Log booked appointments and their closer assignments
    const bookedAppointments = appointments.filter(a => a.status === 'booked' || a.status === 'scheduled');
    console.log('🔍 BOOKED APPOINTMENTS:', bookedAppointments.map(a => ({
      name: a.customerName,
      email: a.customerEmail,
      status: a.status,
      closerId: a.closerId,
      closerName: a.closer?.name || 'UNASSIGNED',
      scheduledAt: a.scheduledAt
    })));

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

export async function POST(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      scheduledAt,
      duration = 30,
      calendlyEventId,
      affiliateCode,
      closerId: providedCloserId
    } = body;

    // Validate required fields
    if (!customerName || !customerEmail || !scheduledAt) {
      return NextResponse.json(
        { error: 'customerName, customerEmail, and scheduledAt are required' },
        { status: 400 }
      );
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        calendlyEventId: calendlyEventId || `manual-${Date.now()}`,
        customerName,
        customerEmail: customerEmail.toLowerCase(), // Normalize email
        customerPhone: customerPhone || null,
        scheduledAt: new Date(scheduledAt),
        duration,
        status: 'scheduled',
        affiliateCode: affiliateCode || null,
        closerId: providedCloserId || null // If provided, use it; otherwise will be auto-assigned
      }
    });

    console.log('✅ Appointment created:', {
      appointmentId: appointment.id,
      customerName,
      customerEmail,
      hasCloserId: !!providedCloserId
    });

    // Auto-assign closer if not provided
    if (!providedCloserId) {
      await autoAssignToCloser(appointment.id);
    }

    // Fetch the created appointment with closer info
    const createdAppointment = await prisma.appointment.findUnique({
      where: { id: appointment.id },
      include: {
        closer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      appointment: createdAppointment
    });

  } catch (error) {
    console.error('❌ Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Auto-assign appointment to available closer (round-robin)
 * Same logic as Calendly webhook
 */
async function autoAssignToCloser(appointmentId: string): Promise<void> {
  try {
    console.log('🔄 Starting auto-assignment for appointment:', appointmentId);

    // Find all active, approved closers
    const availableClosers = await prisma.closer.findMany({
      where: {
        isActive: true,
        isApproved: true
      },
      select: {
        id: true,
        name: true,
        totalCalls: true
      },
      orderBy: {
        totalCalls: 'asc' // Round-robin: assign to closer with fewer calls
      }
    });

    console.log('👥 Available closers:', availableClosers.map(c => ({
      name: c.name,
      totalCalls: c.totalCalls
    })));

    if (availableClosers.length === 0) {
      console.warn('⚠️ No available closers for auto-assignment. Appointment will remain unassigned.');
      // Log for monitoring - could send alert here
      return;
    }

    // Get the closer with the least calls (round-robin)
    const assignedCloser = availableClosers[0];

    // Assign the appointment to the closer
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        closerId: assignedCloser.id,
        status: 'confirmed'
      }
    });

    // Increment the closer's total calls count
    await prisma.closer.update({
      where: { id: assignedCloser.id },
      data: {
        totalCalls: {
          increment: 1
        }
      }
    });

    console.log('✅ Auto-assigned appointment to closer (round-robin):', {
      appointmentId,
      closerId: assignedCloser.id,
      closerName: assignedCloser.name,
      previousTotalCalls: assignedCloser.totalCalls,
      newTotalCalls: assignedCloser.totalCalls + 1
    });

  } catch (error) {
    console.error('❌ Error in auto-assignment:', error);
    // Don't throw - appointment was created successfully, just assignment failed
    // Could be retried later via fix-unassigned-appointments endpoint
  }
}