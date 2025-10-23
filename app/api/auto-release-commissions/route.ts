import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Running automatic commission release...');

    // Get commission hold days from settings
    let commissionHoldDays = 30; // Default fallback
    try {
      const holdDaysResult = await prisma.$queryRaw`
        SELECT value FROM "Settings" WHERE key = 'commission_hold_days'
      ` as any[];
      if (holdDaysResult.length > 0) {
        commissionHoldDays = parseInt(holdDaysResult[0].value);
      }
    } catch (error) {
      console.log('Using default commission hold days:', commissionHoldDays);
    }

    // Calculate cutoff date (commissions older than this are ready for release)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - commissionHoldDays);

    console.log(`📅 Cutoff date: ${cutoffDate.toISOString()}`);
    console.log(`⏰ Hold period: ${commissionHoldDays} days`);

    // Find commissions ready for release
    const readyCommissions = await prisma.affiliateConversion.findMany({
      where: {
        commissionStatus: 'held',
        holdUntil: {
          lte: cutoffDate
        }
      },
      include: {
        affiliate: true
      }
    });

    console.log(`🎯 Found ${readyCommissions.length} commissions ready for automatic release`);

    if (readyCommissions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No commissions ready for automatic release',
        releasedCount: 0,
        releasedAmount: 0,
        cutoffDate: cutoffDate.toISOString(),
        holdDays: commissionHoldDays
      });
    }

    // Release the commissions
    let releasedCount = 0;
    let releasedAmount = 0;
    const affiliateUpdates = new Map();

    for (const commission of readyCommissions) {
      // Update commission status
      await prisma.affiliateConversion.update({
        where: { id: commission.id },
        data: {
          commissionStatus: 'available',
          releasedAt: new Date()
        }
      });

      // Track affiliate updates
      const affiliateId = commission.affiliateId;
      if (!affiliateUpdates.has(affiliateId)) {
        affiliateUpdates.set(affiliateId, {
          affiliate: commission.affiliate,
          totalCommission: 0
        });
      }
      
      const affiliateUpdate = affiliateUpdates.get(affiliateId);
      affiliateUpdate.totalCommission += Number(commission.commissionAmount);
      
      releasedCount++;
      releasedAmount += Number(commission.commissionAmount);

      console.log(`✅ Released commission ${commission.id}: $${commission.commissionAmount}`);
    }

    // Update affiliate total commissions
    for (const [affiliateId, update] of affiliateUpdates) {
      await prisma.affiliate.update({
        where: { id: affiliateId },
        data: {
          totalCommission: {
            increment: update.totalCommission
          }
        }
      });
      console.log(`💰 Updated affiliate ${update.affiliate.name}: +$${update.totalCommission}`);
    }

    console.log(`🎉 Automatic release complete: ${releasedCount} commissions, $${releasedAmount} total`);

    return NextResponse.json({
      success: true,
      message: `Automatically released ${releasedCount} commissions`,
      releasedCount,
      releasedAmount,
      cutoffDate: cutoffDate.toISOString(),
      holdDays: commissionHoldDays,
      releasedCommissions: readyCommissions.map(c => ({
        id: c.id,
        affiliateName: c.affiliate.name,
        amount: c.commissionAmount,
        holdUntil: c.holdUntil
      }))
    });

  } catch (error) {
    console.error('❌ Error in automatic commission release:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
