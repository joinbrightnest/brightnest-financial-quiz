import { verify } from 'jsonwebtoken';
import { NextRequest } from 'next/server';

/**
 * Get JWT secret from environment variables
 * Throws error if not configured (fail-fast approach)
 */
function getJWTSecret(): string {
  const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET or NEXTAUTH_SECRET environment variable is required for closer authentication');
  }
  return JWT_SECRET;
}

/**
 * Get closer ID from request token.
 * 🔒 SECURITY: Now supports both httpOnly cookies (preferred) and Authorization header (fallback)
 */
export function getCloserIdFromToken(request: Request | NextRequest): string | null {
  try {
    // 1. Check httpOnly cookie first (preferred, more secure)
    if ('cookies' in request && typeof request.cookies?.get === 'function') {
      const cookieToken = (request as NextRequest).cookies.get('closerToken')?.value;
      if (cookieToken) {
        const JWT_SECRET = getJWTSecret();
        const decoded = verify(cookieToken, JWT_SECRET) as { closerId: string; role: string };
        if (decoded.role === 'closer') {
          return decoded.closerId;
        }
      }
    }

    // 2. Fallback to Authorization header (for API clients, testing, backward compatibility)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const JWT_SECRET = getJWTSecret();
    const decoded = verify(token, JWT_SECRET) as { closerId: string; role: string };

    if (decoded.role !== 'closer') {
      return null;
    }

    return decoded.closerId;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}
