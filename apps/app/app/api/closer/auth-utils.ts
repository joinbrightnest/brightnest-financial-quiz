/**
 * Closer Portal Authentication Utilities
 * 
 * Provides centralized token extraction and verification for all Closer API routes.
 * Supports both httpOnly cookie (preferred for browser) and Authorization header (for API clients).
 */

import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

interface CloserTokenPayload {
    closerId: string;
    email: string;
    role: 'closer';
    iat: number;
    exp: number;
}

/**
 * Extract closer token from request.
 * Priority: Cookie (httpOnly) > Authorization Header (Bearer token)
 * 
 * @param request - Next.js request object
 * @returns The token string or null if not found
 */
export function getCloserToken(request: NextRequest): string | null {
    // 1. Check httpOnly cookie first (preferred, more secure)
    const cookieToken = request.cookies.get('closerToken')?.value;
    if (cookieToken) {
        return cookieToken;
    }

    // 2. Fallback to Authorization header (for API clients, testing, backward compatibility)
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    return null;
}

/**
 * Verify and decode a closer JWT token.
 * 
 * @param token - The JWT token string
 * @returns Decoded payload or null if invalid/expired
 */
export function verifyCloserToken(token: string): CloserTokenPayload | null {
    const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

    if (!JWT_SECRET) {
        console.error('FATAL: JWT_SECRET or NEXTAUTH_SECRET environment variable is required');
        return null;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as CloserTokenPayload;

        // Ensure it's a closer token (not admin or other type)
        if (decoded.role !== 'closer') {
            return null;
        }

        return decoded;
    } catch (error) {
        // Token is invalid or expired
        return null;
    }
}

/**
 * Complete authentication check for Closer API routes.
 * Extracts token, verifies it, and returns the closer ID.
 * 
 * @param request - Next.js request object
 * @returns Object with closerId on success, or error message on failure
 */
export function authenticateCloser(request: NextRequest):
    | { success: true; closerId: string; email: string }
    | { success: false; error: string; status: 401 | 500 } {

    const token = getCloserToken(request);

    if (!token) {
        return {
            success: false,
            error: 'Authorization token required',
            status: 401
        };
    }

    const decoded = verifyCloserToken(token);

    if (!decoded) {
        return {
            success: false,
            error: 'Invalid or expired token',
            status: 401
        };
    }

    return {
        success: true,
        closerId: decoded.closerId,
        email: decoded.email,
    };
}
