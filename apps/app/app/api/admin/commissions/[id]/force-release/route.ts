import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth-server';
import { forceReleaseCommission } from '@/lib/commission';
import { handleApiError } from '@/lib/api-utils';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // 🔒 SECURITY: Require admin authentication
    if (!verifyAdminAuth(request)) {
        return NextResponse.json(
            { error: 'Unauthorized - Admin authentication required' },
            { status: 401 }
        );
    }

    try {
        const { id } = await params;

        console.log(`⚠️ Admin force-releasing commission: ${id}`);

        const result = await forceReleaseCommission(id);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error force-releasing commission:', error);

        // Handle expected business logic errors (e.g., status not 'held')
        if (error instanceof Error && error.message.includes('not in \'held\' status')) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return handleApiError(error, 'force-releasing commission');
    }
}
