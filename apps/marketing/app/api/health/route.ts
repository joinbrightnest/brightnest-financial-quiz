import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    // 🧪 TESTING: Simulate unhealthy status for UptimeRobot alert test
    // TODO: Revert this after testing!

    console.log('⚠️ Health check - SIMULATING FAILURE for alert test');

    return NextResponse.json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'brightnest-marketing',
        database: 'disconnected',
        error: 'SIMULATED FAILURE - Testing UptimeRobot alerts'
    }, {
        status: 503,
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
    });
}
