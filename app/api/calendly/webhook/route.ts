import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🎯 Calendly webhook received:', {
      event: body.event,
      payload: body.payload
    });

    // Handle different Calendly events
    if (body.event === 'invitee.created') {
      await handleInviteeCreated(body.payload);
    } else if (body.event === 'invitee.canceled') {
      await handleInviteeCanceled(body.payload);
    } else if (body.event === 'invitee.rescheduled') {
      await handleInviteeRescheduled(body.payload);
    }

    console.log('📝 Calendly webhook processed successfully:', body.event);

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    });

  } catch (error) {
    console.error('❌ Error processing Calendly webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Calendly webhook handlers
async function handleInviteeCreated(payload: any) {
  try {
    const { event, invitee, questions_and_answers } = payload;
    
    console.log('🔍 Calendly webhook payload analysis:', {
      event: event ? 'present' : 'missing',
      invitee: invitee ? 'present' : 'missing',
      questions_and_answers: questions_and_answers ? 'present' : 'missing'
    });
    
    console.log('🔍 Full invitee data:', JSON.stringify(invitee, null, 2));
    console.log('🔍 Full event data:', JSON.stringify(event, null, 2));
    
    // Extract customer information with better fallbacks
    let customerName = 'Unknown';
    let customerEmail = 'unknown@example.com';
    let customerPhone = null;
    
    // Try multiple sources for customer name
    if (invitee?.name) {
      customerName = invitee.name;
      console.log('✅ Found customer name in invitee.name:', customerName);
    } else if (invitee?.first_name && invitee?.last_name) {
      customerName = `${invitee.first_name} ${invitee.last_name}`;
      console.log('✅ Found customer name from first_name + last_name:', customerName);
    } else if (invitee?.first_name) {
      customerName = invitee.first_name;
      console.log('✅ Found customer name from first_name:', customerName);
    } else {
      console.log('⚠️ No customer name found in invitee data');
    }
    
    // Extract email (normalize to lowercase for consistency)
    if (invitee?.email) {
      customerEmail = invitee.email.toLowerCase();
      console.log('✅ Found customer email:', customerEmail);
    } else {
      console.log('⚠️ No customer email found in invitee data');
    }
    
    // Extract phone
    if (invitee?.phone_number) {
      customerPhone = invitee.phone_number;
      console.log('✅ Found customer phone:', customerPhone);
    }
    
    const scheduledAt = new Date(event.start_time);
    const duration = Math.round((new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / (1000 * 60));
    
    // Extract UTM parameters and affiliate code from questions
    let affiliateCode = null;
    let utmSource = null;
    let utmMedium = null;
    let utmCampaign = null;
    
    if (questions_and_answers) {
      console.log('🔍 Questions and answers:', JSON.stringify(questions_and_answers, null, 2));
      for (const qa of questions_and_answers) {
        const question = qa.question?.toLowerCase() || '';
        const answer = qa.answer || '';
        
        if (question.includes('affiliate') || question.includes('referral')) {
          affiliateCode = answer;
        } else if (question.includes('utm_source') || question.includes('source')) {
          utmSource = answer;
        } else if (question.includes('utm_medium') || question.includes('medium')) {
          utmMedium = answer;
        } else if (question.includes('utm_campaign') || question.includes('campaign')) {
          utmCampaign = answer;
        }
      }
    }

    // Create appointment record
    const appointment = await prisma.appointment.create({
      data: {
        calendlyEventId: event.uuid,
        customerName,
        customerEmail,
        customerPhone,
        scheduledAt,
        duration,
        status: 'scheduled',
        affiliateCode,
        utmSource,
        utmMedium,
        utmCampaign,
      }
    });

    console.log('✅ Appointment created from Calendly:', {
      appointmentId: appointment.id,
      customerName,
      customerEmail,
      scheduledAt: scheduledAt.toISOString(),
      affiliateCode
    });

    // ALWAYS auto-assign appointments to available closers (round-robin)
    await autoAssignToCloser(appointment.id);

  } catch (error) {
    console.error('❌ Error handling invitee created:', error);
  }
}

async function handleInviteeCanceled(payload: any) {
  try {
    const { event, invitee } = payload;
    
    // Update appointment status to cancelled
    const appointment = await prisma.appointment.updateMany({
      where: {
        calendlyEventId: event.uuid
      },
      data: {
        status: 'cancelled',
        notes: `Cancelled by ${invitee.name || invitee.email}`
      }
    });

    console.log('✅ Appointment cancelled:', {
      calendlyEventId: event.uuid,
      customerEmail: invitee.email
    });

  } catch (error) {
    console.error('❌ Error handling invitee canceled:', error);
  }
}

async function handleInviteeRescheduled(payload: any) {
  try {
    const { event, invitee, old_invitee } = payload;
    
    // Update appointment with new scheduled time
    const appointment = await prisma.appointment.updateMany({
      where: {
        calendlyEventId: event.uuid
      },
      data: {
        scheduledAt: new Date(event.start_time),
        duration: Math.round((new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / (1000 * 60)),
        status: 'rescheduled',
        notes: `Rescheduled from ${old_invitee?.event?.start_time || 'unknown'}`
      }
    });

    console.log('✅ Appointment rescheduled:', {
      calendlyEventId: event.uuid,
      customerEmail: invitee.email,
      newScheduledAt: event.start_time
    });

  } catch (error) {
    console.error('❌ Error handling invitee rescheduled:', error);
  }
}

async function autoAssignToCloser(appointmentId: string) {
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
      console.log('⚠️ No available closers for auto-assignment');
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
  }
}
