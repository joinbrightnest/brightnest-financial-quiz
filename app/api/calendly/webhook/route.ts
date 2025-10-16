import { NextRequest, NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🎯 Calendly webhook received:', {
      event: body.event,
      payload: body.payload
    });

    // TODO: Uncomment when database migration is complete
    // Handle different Calendly events
    // if (body.event === 'invitee.created') {
    //   await handleInviteeCreated(body.payload);
    // } else if (body.event === 'invitee.canceled') {
    //   await handleInviteeCanceled(body.payload);
    // } else if (body.event === 'invitee.rescheduled') {
    //   await handleInviteeRescheduled(body.payload);
    // }

    // For now, just log the webhook data
    console.log('📝 Webhook data logged (database not ready yet):', body);

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook received - database migration pending' 
    });

  } catch (error) {
    console.error('❌ Error processing Calendly webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// TODO: Uncomment when database migration is complete
/*
async function handleInviteeCreated(payload: any) {
  try {
    const { event, invitee, questions_and_answers } = payload;
    
    // Extract customer information
    const customerName = invitee.name || 'Unknown';
    const customerEmail = invitee.email;
    const customerPhone = invitee.phone_number || null;
    const scheduledAt = new Date(event.start_time);
    const duration = Math.round((new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / (1000 * 60));
    
    // Extract UTM parameters and affiliate code from questions
    let affiliateCode = null;
    let utmSource = null;
    let utmMedium = null;
    let utmCampaign = null;
    
    if (questions_and_answers) {
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

    // If there's an affiliate code, try to find and assign to an active closer
    if (affiliateCode) {
      await tryAutoAssignToCloser(appointment.id, affiliateCode);
    }

  } catch (error) {
    console.error('❌ Error handling invitee created:', error);
  }
}
*/

// TODO: Uncomment when database migration is complete
/*
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

async function tryAutoAssignToCloser(appointmentId: string, affiliateCode: string) {
  try {
    // Find the affiliate
    const affiliate = await prisma.affiliate.findUnique({
      where: { referralCode: affiliateCode },
      select: { id: true, name: true }
    });

    if (!affiliate) {
      console.log('⚠️ Affiliate not found for auto-assignment:', affiliateCode);
      return;
    }

    // Find an active, approved closer (you could implement more sophisticated assignment logic here)
    const availableCloser = await prisma.closer.findFirst({
      where: {
        isActive: true,
        isApproved: true
      },
      orderBy: {
        totalCalls: 'asc' // Assign to closer with fewer calls (load balancing)
      }
    });

    if (availableCloser) {
      // Assign the appointment to the closer
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          closerId: availableCloser.id,
          status: 'confirmed'
        }
      });

      console.log('✅ Auto-assigned appointment to closer:', {
        appointmentId,
        closerId: availableCloser.id,
        closerName: availableCloser.name,
        affiliateCode
      });
    } else {
      console.log('⚠️ No available closers for auto-assignment');
    }

  } catch (error) {
    console.error('❌ Error in auto-assignment:', error);
  }
}
*/
