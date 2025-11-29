import { verify } from 'jsonwebtoken';

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

export function getCloserIdFromToken(request: Request): string | null {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.substring(7);
        const JWT_SECRET = getJWTSecret();
        const decoded = verify(token, JWT_SECRET) as { closerId: string };
        
        return decoded.closerId;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}
