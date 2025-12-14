import { NextRequest, NextResponse } from 'next/server';
import { setCrossDomainCookie, getCookieOptions } from '@/lib/session';

/**
 * Closer Logout API
 * 
 * Clears the httpOnly authentication cookie.
 * The frontend should call this endpoint on logout instead of just clearing localStorage.
 */
export async function POST(request: NextRequest) {
    try {
        const response = NextResponse.json({
            success: true,
            message: 'Logged out successfully'
        });

        // Clear the closer token cookie by setting it with maxAge: 0
        const cookieOptions = getCookieOptions();
        response.cookies.set('closerToken', '', {
            ...cookieOptions,
            maxAge: 0, // Immediately expire the cookie
        });

        return response;
    } catch (error) {
        console.error('❌ Error during closer logout:', error);
        return NextResponse.json(
            { error: 'Logout failed' },
            { status: 500 }
        );
    }
}
