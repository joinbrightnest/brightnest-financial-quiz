import { prisma } from './prisma';

/**
 * Commission Release Logic - SINGLE SOURCE OF TRUTH
 *
 * This function handles releasing affiliate commissions that have completed their hold period.
 * It is designed to be called by both:
 *   1. Admin manual trigger (POST /api/admin/process-commission-releases)
 *   2. Automated Vercel Cron job (GET /api/auto-release-commissions)
 *
 * CRITICAL BUSINESS RULES:
 * - Only releases commissions where commissionStatus = 'held'
 * - Only releases if holdUntil date has passed
 * - Only considers commissions with commissionAmount > 0
 * - DOES NOT increment totalCommission on the Affiliate record (it's already done at sale time)
 */

export interface ReleaseResult {
    success: boolean;
    releasedCount: number;
    releasedAmount: number;
    releasedIds: string[];
    currentDate: Date;
}

/**
 * Find and release all commissions that are eligible (hold period has passed).
 */
export async function releaseEligibleCommissions(): Promise<ReleaseResult> {
    const now = new Date();

    // Find commissions ready for release
    const eligible = await prisma.affiliateConversion.findMany({
        where: {
            commissionStatus: 'held',
            commissionAmount: { gt: 0 },
            holdUntil: { lte: now },
        },
        select: {
            id: true,
            commissionAmount: true,
        },
    });

    if (eligible.length === 0) {
        return {
            success: true,
            releasedCount: 0,
            releasedAmount: 0,
            releasedIds: [],
            currentDate: now,
        };
    }

    const ids = eligible.map((c) => c.id);

    // Update all in a single batch operation (efficient)
    await prisma.affiliateConversion.updateMany({
        where: { id: { in: ids } },
        data: {
            commissionStatus: 'available',
            releasedAt: now,
        },
    });

    const totalAmount = eligible.reduce(
        (sum, c) => sum + parseFloat(c.commissionAmount.toString()),
        0
    );

    return {
        success: true,
        releasedCount: eligible.length,
        releasedAmount: totalAmount,
        releasedIds: ids,
        currentDate: now,
    };
}

/**
 * Get status information about held and available commissions.
 */
export async function getCommissionStatus() {
    const now = new Date();

    const [readyForRelease, totalHeld, totalAvailable, heldSum, availableSum] = await Promise.all([
        prisma.affiliateConversion.count({
            where: {
                commissionStatus: 'held',
                commissionAmount: { gt: 0 },
                holdUntil: { lte: now },
            },
        }),
        prisma.affiliateConversion.count({
            where: {
                commissionStatus: 'held',
                commissionAmount: { gt: 0 },
            },
        }),
        prisma.affiliateConversion.count({
            where: {
                commissionStatus: 'available',
                commissionAmount: { gt: 0 },
            },
        }),
        prisma.affiliateConversion.aggregate({
            where: {
                commissionStatus: 'held',
                commissionAmount: { gt: 0 },
            },
            _sum: { commissionAmount: true },
        }),
        prisma.affiliateConversion.aggregate({
            where: {
                commissionStatus: 'available',
                commissionAmount: { gt: 0 },
            },
            _sum: { commissionAmount: true },
        }),
    ]);

    return {
        readyForRelease,
        totalHeld,
        totalAvailable,
        heldAmount: parseFloat(heldSum._sum.commissionAmount?.toString() || '0'),
        availableAmount: parseFloat(availableSum._sum.commissionAmount?.toString() || '0'),
        currentDate: now,
    };
}

/**
 * Force release a specific commission (Admin Override).
 * Ignores the hold period.
 */
export async function forceReleaseCommission(commissionId: string) {
    const now = new Date();

    const commission = await prisma.affiliateConversion.findUnique({
        where: { id: commissionId },
    });

    if (!commission) {
        throw new Error('Commission not found');
    }

    if (commission.commissionStatus !== 'held') {
        throw new Error(`Commission is not in 'held' status (current: ${commission.commissionStatus})`);
    }

    // Update status to available
    // NO double counting: totalCommission is not touched here
    await prisma.affiliateConversion.update({
        where: { id: commissionId },
        data: {
            commissionStatus: 'available',
            releasedAt: now,
        },
    });

    return {
        success: true,
        message: 'Commission force-released successfully',
        commissionId,
        releasedAt: now,
    };
}

