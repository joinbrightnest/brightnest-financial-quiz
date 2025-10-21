import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

    if (decoded.role !== 'closer') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { outcome, notes, saleValue, recordingLink } = await request.json();

    if (!outcome) {
      return NextResponse.json(
        { error: 'Outcome is required' },
        { status: 400 }
      );
    }

    // Verify the appointment belongs to this closer
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: id,
        closerId: decoded.closerId
      }
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Calculate commission if sale value is provided
    let commissionAmount = null;
    if (saleValue && outcome === 'converted') {
      const closer = await prisma.closer.findUnique({
        where: { id: decoded.closerId }
      });
      
      if (closer) {
        commissionAmount = parseFloat(saleValue) * Number(closer.commissionRate);
      }
    }

    // Calculate affiliate commission if appointment has affiliate code
    let affiliateCommissionAmount = null;
    if (saleValue && outcome === 'converted' && appointment.affiliateCode) {
      const affiliate = await prisma.affiliate.findUnique({
        where: { referralCode: appointment.affiliateCode }
      });
      
      if (affiliate) {
        affiliateCommissionAmount = parseFloat(saleValue) * Number(affiliate.commissionRate);
        
        // Update affiliate's total commission
        await prisma.affiliate.update({
          where: { id: affiliate.id },
          data: {
            totalCommission: { increment: affiliateCommissionAmount }
          }
        });
        
        console.log('💰 Affiliate commission calculated:', {
          affiliateCode: appointment.affiliateCode,
          affiliateName: affiliate.name,
          saleValue: parseFloat(saleValue),
          commissionRate: affiliate.commissionRate,
          commissionAmount: affiliateCommissionAmount
        });
      }
    }

    // Prepare recording link data based on outcome
    const recordingLinkData: any = {};
    if (recordingLink) {
      switch (outcome) {
        case 'converted':
          recordingLinkData.recordingLinkConverted = recordingLink;
          break;
        case 'not_interested':
          recordingLinkData.recordingLinkNotInterested = recordingLink;
          break;
        case 'needs_follow_up':
          recordingLinkData.recordingLinkNeedsFollowUp = recordingLink;
          break;
        case 'wrong_number':
          recordingLinkData.recordingLinkWrongNumber = recordingLink;
          break;
        case 'no_answer':
          recordingLinkData.recordingLinkNoAnswer = recordingLink;
          break;
        case 'callback_requested':
          recordingLinkData.recordingLinkCallbackRequested = recordingLink;
          break;
        case 'rescheduled':
          recordingLinkData.recordingLinkRescheduled = recordingLink;
          break;
      }
    }

    // Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: id },
      data: {
        outcome,
        notes: notes || null,
        saleValue: saleValue ? parseFloat(saleValue) : null,
        commissionAmount,
        status: 'completed',
        updatedAt: new Date(),
        ...recordingLinkData
      }
    });

    // Update closer stats if converted
    if (outcome === 'converted' && saleValue) {
      await prisma.closer.update({
        where: { id: decoded.closerId },
        data: {
          totalCalls: { increment: 1 },
          totalConversions: { increment: 1 },
          totalRevenue: { increment: parseFloat(saleValue) },
          conversionRate: {
            // Recalculate conversion rate
            set: await calculateConversionRate(decoded.closerId)
          }
        }
      });
    } else {
      // Just increment total calls
      await prisma.closer.update({
        where: { id: decoded.closerId },
        data: {
          totalCalls: { increment: 1 },
          conversionRate: {
            set: await calculateConversionRate(decoded.closerId)
          }
        }
      });
    }

    // Create audit log
    await prisma.closerAuditLog.create({
      data: {
        closerId: decoded.closerId,
        action: 'appointment_outcome_updated',
        details: {
          appointmentId: id,
          outcome,
          saleValue,
          commissionAmount,
          affiliateCode: appointment.affiliateCode,
          affiliateCommissionAmount,
          customerName: appointment.customerName,
          recordingLink,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    });

    console.log('✅ Appointment outcome updated:', {
      appointmentId: id,
      closerId: decoded.closerId,
      outcome,
      saleValue
    });

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment
    });

  } catch (error) {
    console.error('❌ Error updating appointment outcome:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function calculateConversionRate(closerId: string): Promise<number> {
  const closer = await prisma.closer.findUnique({
    where: { id: closerId }
  });

  if (!closer || closer.totalCalls === 0) {
    return 0;
  }

  return closer.totalConversions / closer.totalCalls;
}
