import { NextResponse } from 'next/server';
import { AFFILIATE_COOKIE_CONFIG } from '../auth-utils';

export async function POST() {
    const response = NextResponse.json({ success: true });

    // Clear the affiliate token cookie
    response.cookies.set(AFFILIATE_COOKIE_CONFIG.name, '', {
        ...AFFILIATE_COOKIE_CONFIG,
        maxAge: 0, // Immediately expire
    });

    return response;
}
