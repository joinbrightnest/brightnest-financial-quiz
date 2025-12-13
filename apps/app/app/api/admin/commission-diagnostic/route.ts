import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/admin-auth-server';

// Cleanup endpoint - DELETE invalid commission records with $0 amount
export async function DELETE(request: NextRequest) {
    if (!verifyAdminAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Count before deletion
        const countBefore = await prisma.affiliateConversion.count({
            where: {
                commissionAmount: { equals: 0 }
            }
        });

        // Delete all conversions with $0 commission (invalid data)
        const deleted = await prisma.affiliateConversion.deleteMany({
            where: {
                commissionAmount: { equals: 0 }
            }
        });

        console.log(`🗑️ Deleted ${deleted.count} invalid $0 commission records`);

        return NextResponse.json({
            success: true,
            message: `Successfully deleted ${deleted.count} invalid commission records`,
            deletedCount: deleted.count,
            countBefore
        });

    } catch (error) {
        console.error('Cleanup error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
