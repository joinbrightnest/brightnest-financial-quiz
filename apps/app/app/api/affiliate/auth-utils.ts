import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'affiliateToken';

interface AffiliateTokenPayload {
    affiliateId: string;
    email: string;
    tier: string;
    role: 'affiliate';
}

/**
 * Extract affiliate token from request.
 * Checks httpOnly cookie first, then falls back to Authorization header.
 */
export function getAffiliateToken(request: NextRequest): string | null {
    // Check cookie first (preferred, secure method)
    const cookieToken = request.cookies.get(COOKIE_NAME)?.value;
    if (cookieToken) return cookieToken;

    // Fallback to Authorization header (for API clients/testing)
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    return null;
}

/**
 * Verify affiliate token and return payload.
 * Returns null if token is invalid or expired.
 */
export function verifyAffiliateToken(token: string): AffiliateTokenPayload | null {
    const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!JWT_SECRET) {
        console.error('FATAL: JWT_SECRET or NEXTAUTH_SECRET environment variable is required');
        return null;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AffiliateTokenPayload;
        if (!decoded.affiliateId) {
            return null;
        }
        return decoded;
    } catch {
        return null;
    }
}

/**
 * Get affiliate ID from token in request.
 * Convenience function combining getAffiliateToken and verifyAffiliateToken.
 */
export function getAffiliateIdFromToken(request: NextRequest): string | null {
    const token = getAffiliateToken(request);
    if (!token) return null;

    const payload = verifyAffiliateToken(token);
    return payload?.affiliateId || null;
}

/**
 * Cookie configuration for affiliate authentication
 */
export const AFFILIATE_COOKIE_CONFIG = {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
};
