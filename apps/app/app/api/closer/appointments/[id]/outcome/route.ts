import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@brightnest/shared';
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

    // 🔒 SECURITY: Require JWT_SECRET (no fallback)
    const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!JWT_SECRET) {
      console.error('FATAL: JWT_SECRET or NEXTAUTH_SECRET environment variable is required');
      return NextResponse.json(
        { error: 'Authentication configuration error' },
        { status: 500 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string; closerId: string };

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
    // Only calculate commission if this is a NEW conversion (not already converted)
    let affiliateCommissionAmount = null;
    if (saleValue && outcome === 'converted' && appointment.affiliateCode && appointment.outcome !== 'converted') {
      const affiliate = await prisma.affiliate.findUnique({
        where: { referralCode: appointment.affiliateCode }
      });

      if (affiliate) {
        affiliateCommissionAmount = parseFloat(saleValue) * Number(affiliate.commissionRate);

        // Get commission hold days from settings
        let commissionHoldDays = 30; // Default fallback
        try {
          const holdDaysResult = await prisma.$queryRaw`
            SELECT value FROM "Settings" WHERE key = 'commission_hold_days'
          ` as { value: string }[];
          if (holdDaysResult.length > 0) {
            commissionHoldDays = parseInt(holdDaysResult[0].value);
          }
        } catch (error) {
          console.log('Using default commission hold days:', commissionHoldDays);
        }

        // Calculate hold until date
        const holdUntil = new Date();
        holdUntil.setDate(holdUntil.getDate() + commissionHoldDays);

        // Check if conversion already exists for this affiliate/saleValue in last 1 minute (prevent duplicates)
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        const existingConversion = await prisma.affiliateConversion.findFirst({
          where: {
            affiliateId: affiliate.id,
            conversionType: "sale",
            saleValue: parseFloat(saleValue),
            createdAt: {
              gte: oneMinuteAgo
            }
          }
        });

        if (existingConversion) {
          console.log('⚠️ Duplicate conversion detected (same affiliate, sale value within 1 min), skipping:', {
            appointmentId: id,
            existingConversionId: existingConversion.id,
            affiliateCode: appointment.affiliateCode,
            saleValue: parseFloat(saleValue)
          });
          affiliateCommissionAmount = null; // Don't increment totalCommission again
        } else {
          // Create AffiliateConversion record with held status
          await prisma.affiliateConversion.create({
            data: {
              affiliateId: affiliate.id,
              referralCode: appointment.affiliateCode,
              conversionType: "sale",
              status: "confirmed",
              commissionAmount: affiliateCommissionAmount,
              saleValue: parseFloat(saleValue),
              commissionStatus: "held",
              holdUntil: holdUntil
            }
          });
        }

        // Update affiliate's total commission and total sales (only if not a duplicate)
        if (affiliateCommissionAmount !== null) {
          await prisma.affiliate.update({
            where: { id: affiliate.id },
            data: {
              totalCommission: { increment: affiliateCommissionAmount },
              totalSales: { increment: 1 }
            }
          });
        }

        console.log('💰 Affiliate commission calculated and held:', {
          appointmentId: id,
          affiliateCode: appointment.affiliateCode,
          affiliateId: affiliate.id,
          affiliateReferralCode: affiliate.referralCode,
          affiliateName: affiliate.name,
          saleValue: parseFloat(saleValue),
          commissionRate: affiliate.commissionRate,
          commissionAmount: affiliateCommissionAmount,
          commissionStatus: 'held',
          holdUntil: holdUntil.toISOString(),
          holdDays: commissionHoldDays,
          previousOutcome: appointment.outcome,
          newOutcome: outcome,
          previousTotalCommission: Number(affiliate.totalCommission || 0),
          newTotalCommission: Number(affiliate.totalCommission || 0) + (affiliateCommissionAmount || 0)
        });
      }
    } else if (saleValue && outcome === 'converted' && appointment.affiliateCode && appointment.outcome === 'converted') {
      console.log('⚠️ Commission already calculated for this appointment:', {
        appointmentId: id,
        affiliateCode: appointment.affiliateCode,
        saleValue: parseFloat(saleValue),
        previousOutcome: appointment.outcome,
        newOutcome: outcome
      });
    }

    // Prepare recording link data based on outcome
    const recordingLinkData: Record<string, string> = {};
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

    // Update closer stats based on conversion changes
    // Note: totalCalls is calculated from appointments.length in the stats API, so we don't update it here
    // We only update totalConversions and totalRevenue when conversion status changes
    const previousOutcome = appointment.outcome;
    const previousSaleValue = appointment.saleValue ? parseFloat(appointment.saleValue.toString()) : 0;
    const previousWasConversion = previousOutcome === 'converted' && previousSaleValue > 0;

    const newIsConversion = outcome === 'converted' && saleValue && parseFloat(saleValue) > 0;
    const newSaleValue = saleValue ? parseFloat(saleValue) : 0;

    // If changing from conversion to non-conversion, decrement conversions and revenue
    if (previousWasConversion && !newIsConversion) {
      await prisma.closer.update({
        where: { id: decoded.closerId },
        data: {
          totalConversions: { decrement: 1 },
          totalRevenue: { decrement: previousSaleValue },
          conversionRate: {
            set: await calculateConversionRate(decoded.closerId)
          }
        }
      });
    }
    // If changing from non-conversion to conversion, increment conversions and revenue
    else if (!previousWasConversion && newIsConversion) {
      await prisma.closer.update({
        where: { id: decoded.closerId },
        data: {
          totalConversions: { increment: 1 },
          totalRevenue: { increment: newSaleValue },
          conversionRate: {
            set: await calculateConversionRate(decoded.closerId)
          }
        }
      });
    }
    // If both are conversions but sale value changed, adjust revenue
    else if (previousWasConversion && newIsConversion && previousSaleValue !== newSaleValue) {
      const revenueDiff = newSaleValue - previousSaleValue;
      await prisma.closer.update({
        where: { id: decoded.closerId },
        data: {
          totalRevenue: { increment: revenueDiff },
          conversionRate: {
            set: await calculateConversionRate(decoded.closerId)
          }
        }
      });
    }
    // If updating conversion but sale value becomes invalid, remove conversion
    else if (previousWasConversion && outcome === 'converted' && (!saleValue || parseFloat(saleValue) <= 0)) {
      await prisma.closer.update({
        where: { id: decoded.closerId },
        data: {
          totalConversions: { decrement: 1 },
          totalRevenue: { decrement: previousSaleValue },
          conversionRate: {
            set: await calculateConversionRate(decoded.closerId)
          }
        }
      });
    }
    // Otherwise, just recalculate conversion rate (no stat changes needed)
    else {
      await prisma.closer.update({
        where: { id: decoded.closerId },
        data: {
          conversionRate: {
            set: await calculateConversionRate(decoded.closerId)
          }
        }
      });
    }

    // Create audit log - ALWAYS store notes and recordingLink for this specific outcome
    // Even if they're empty/null, we store them to preserve the historical state
    // This ensures each outcome update has its own recording link and notes preserved
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
          recordingLink: recordingLink || null, // Always store, even if null (preserves "no recording" state)
          notes: notes || null, // Always store, even if null (preserves "no notes" state)
          previousOutcome: appointment.outcome, // Store previous outcome for tracking changes
        },
        ipAddress: request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    });

    console.log('📝 Audit log created with details:', {
      appointmentId: id,
      outcome,
      recordingLink: recordingLink || '(not provided)',
      notes: notes || '(not provided)',
      previousOutcome: appointment.outcome
    });

    console.log('✅ Appointment outcome updated:', {
      appointmentId: id,
      closerId: decoded.closerId,
      outcome,
      saleValue,
      affiliateCode: appointment.affiliateCode,
      affiliateCommission: affiliateCommissionAmount,
      updatedAppointmentData: {
        id: updatedAppointment.id,
        outcome: updatedAppointment.outcome,
        saleValue: updatedAppointment.saleValue,
        affiliateCode: updatedAppointment.affiliateCode,
        updatedAt: updatedAppointment.updatedAt?.toISOString()
      }
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
  // Calculate conversion rate from actual appointments (single source of truth)
  const appointments = await prisma.appointment.findMany({
    where: { closerId: closerId },
    select: {
      outcome: true,
      saleValue: true
    }
  });

  const totalCalls = appointments.length;
  if (totalCalls === 0) {
    return 0;
  }

  // Only count conversions where outcome is 'converted' AND saleValue exists AND is > 0
  const totalConversions = appointments.filter(apt => {
    const isConverted = apt.outcome === 'converted';
    const hasSaleValue = apt.saleValue !== null && apt.saleValue !== undefined && Number(apt.saleValue) > 0;
    return isConverted && hasSaleValue;
  }).length;

  return totalConversions / totalCalls;
}
