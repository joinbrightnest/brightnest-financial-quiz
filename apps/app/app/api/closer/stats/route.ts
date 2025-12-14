import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiErrors, handleApiError } from '@/lib/api-utils';
import { authenticateCloser } from '../auth-utils';

export async function GET(request: NextRequest) {
  try {
    // 🔒 SECURITY: Authenticate using httpOnly cookie or Authorization header
    const auth = authenticateCloser(request);
    if (!auth.success) {
      return apiErrors.unauthorized(auth.error);
    }

    const closerId = auth.closerId;

    // Get fresh closer data from database
    const closer = await prisma.closer.findUnique({
      where: { id: closerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        totalCalls: true,
        totalConversions: true,
        totalRevenue: true,
        conversionRate: true,
        isActive: true,
        isApproved: true,
        createdAt: true,
      }
    });

    if (!closer) {
      return apiErrors.notFound('Closer');
    }

    // Calculate actual stats from appointments (single source of truth)
    const appointments = await prisma.appointment.findMany({
      where: { closerId: closerId },
      select: {
        status: true,
        outcome: true,
        saleValue: true,
        commissionAmount: true
      }
    });

    // Calculate real stats from appointments (single source of truth)
    const actualTotalCalls = appointments.length;

    // Only count conversions where outcome is 'converted' AND saleValue exists AND is > 0 (actual closed sales)
    const actualTotalConversions = appointments.filter(apt => {
      const isConverted = apt.outcome === 'converted';
      const hasSaleValue = apt.saleValue !== null && apt.saleValue !== undefined && Number(apt.saleValue) > 0;
      return isConverted && hasSaleValue;
    }).length;

    const actualTotalRevenue = appointments
      .filter(apt => apt.outcome === 'converted' && apt.saleValue !== null && apt.saleValue !== undefined && Number(apt.saleValue) > 0)
      .reduce((sum, apt) => sum + (Number(apt.saleValue) || 0), 0);
    const actualConversionRate = actualTotalCalls > 0 ? parseFloat(((actualTotalConversions / actualTotalCalls) * 100).toFixed(4)) : 0;

    // Sync database fields with calculated values (for round-robin assignment and consistency)
    // Only update if there's a discrepancy to avoid unnecessary writes
    if (closer.totalCalls !== actualTotalCalls ||
      closer.totalConversions !== actualTotalConversions ||
      Math.abs(Number(closer.totalRevenue || 0) - actualTotalRevenue) > 0.01 ||
      Math.abs(Number(closer.conversionRate || 0) - actualConversionRate) > 0.0001) {
      try {
        await prisma.closer.update({
          where: { id: closerId },
          data: {
            totalCalls: actualTotalCalls,
            totalConversions: actualTotalConversions,
            totalRevenue: actualTotalRevenue,
            conversionRate: actualConversionRate,
          }
        });
        console.log('🔄 Synced closer stats in database:', {
          closerId: closerId,
          totalCalls: `${closer.totalCalls} → ${actualTotalCalls}`,
          totalConversions: `${closer.totalConversions} → ${actualTotalConversions}`,
          totalRevenue: `${closer.totalRevenue} → ${actualTotalRevenue}`,
        });
      } catch (syncError) {
        console.error('⚠️ Error syncing closer stats to database (non-critical):', syncError);
        // Continue even if sync fails - we still return correct values
      }
    }

    // Return calculated values (always correct, regardless of DB state)
    const closerWithDefaults = {
      ...closer,
      totalCalls: actualTotalCalls,
      totalConversions: actualTotalConversions,
      totalRevenue: actualTotalRevenue,
      conversionRate: actualConversionRate,
    };

    console.log('📊 Fresh closer stats fetched:', {
      id: closer.id,
      name: closer.name,
      totalCalls: closerWithDefaults.totalCalls,
      totalConversions: closerWithDefaults.totalConversions,
      totalRevenue: closerWithDefaults.totalRevenue,
      conversionRate: closerWithDefaults.conversionRate,
    });

    return NextResponse.json({
      success: true,
      closer: closerWithDefaults
    });

  } catch (error) {
    return handleApiError(error, 'fetching closer stats');
  }
}

