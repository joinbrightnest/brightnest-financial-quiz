import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 🔒 SECURITY: Verify this is called by Vercel Cron or with valid API secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Allow requests from Vercel Cron (has specific header) or with valid API secret
    const isVercelCron = request.headers.get('user-agent')?.includes('vercel-cron');
    const hasValidSecret = cronSecret && authHeader === `Bearer ${cronSecret}`;
    
    if (!isVercelCron && !hasValidSecret) {
      console.error('❌ Unauthorized commission release attempt');
      return NextResponse.json(
        { error: 'Unauthorized - This endpoint is only accessible via Vercel Cron or with valid API secret' },
        { status: 401 }
      );
    }
    
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

    // Get current date/time - commissions where holdUntil has passed are ready for release
    const now = new Date();

    console.log(`📅 Current date: ${now.toISOString()}`);
    console.log(`⏰ Hold period: ${commissionHoldDays} days`);

    // Find commissions ready for release
    // ONLY include conversions with actual commission amounts > 0
    // Release commissions where holdUntil date has passed (is in the past)
    const readyCommissions = await prisma.affiliateConversion.findMany({
      where: {
        commissionStatus: 'held',
        commissionAmount: {
          gt: 0 // Only conversions with actual commission amounts
        },
        holdUntil: {
          lte: now // Release if holdUntil is less than or equal to now
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
        currentDate: now.toISOString(),
        holdDays: commissionHoldDays
      });
    }

    // Release the commissions
    let releasedCount = 0;
    let releasedAmount = 0;

    for (const commission of readyCommissions) {
      // Update commission status to available
      // Note: We don't increment totalCommission here because it was already
      // incremented when the sale was first recorded in the outcome endpoint
      await prisma.affiliateConversion.update({
        where: { id: commission.id },
        data: {
          commissionStatus: 'available',
          releasedAt: new Date()
        }
      });
      
      releasedCount++;
      releasedAmount += Number(commission.commissionAmount);

      console.log(`✅ Released commission ${commission.id}: $${commission.commissionAmount} for affiliate ${commission.affiliate.name}`);
    }

    console.log(`🎉 Automatic release complete: ${releasedCount} commissions, $${releasedAmount} total`);

    return NextResponse.json({
      success: true,
      message: `Automatically released ${releasedCount} commissions`,
      releasedCount,
      releasedAmount,
      currentDate: now.toISOString(),
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
