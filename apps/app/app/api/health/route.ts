import { NextResponse } from 'next/server';
import { prisma } from '@brightnest/shared';

export async function GET() {
    try {
        // Test database connection with a simple query
        await prisma.$queryRaw`SELECT 1`;

        return NextResponse.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'brightnest-app',
            database: 'connected',
            uptime: process.uptime()
        }, {
            status: 200,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            }
        });
    } catch (error) {
        console.error('Health check failed:', error);

        return NextResponse.json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            service: 'brightnest-app',
            database: 'disconnected',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 503,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            }
        });
    }
}
