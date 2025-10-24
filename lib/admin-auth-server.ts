import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // Change this!

export interface AdminAuthPayload {
  isAdmin: true;
  authenticatedAt: number;
}

/**
 * Verify admin credentials
 */
export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

/**
 * Generate a JWT token for admin authentication
 */
export function generateAdminToken(): string {
  const payload: AdminAuthPayload = {
    isAdmin: true,
    authenticatedAt: Date.now(),
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h', // Token expires in 24 hours
  });
}

/**
 * Verify admin JWT token
 */
export function verifyAdminToken(token: string): AdminAuthPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminAuthPayload;
    
    // Verify it's an admin token
    if (!decoded.isAdmin) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Verify admin authentication from request
 * Checks both Authorization header and httpOnly cookie
 */
export function verifyAdminAuth(req: NextRequest): boolean {
  // Check Authorization header first (for API calls)
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = verifyAdminToken(token);
    if (payload) {
      return true;
    }
  }
  
  // Check httpOnly cookie (for browser requests)
  const cookieToken = req.cookies.get('admin_token')?.value;
  if (cookieToken) {
    const payload = verifyAdminToken(cookieToken);
    if (payload) {
      return true;
    }
  }
  
  return false;
}

/**
 * Middleware to protect admin routes
 * Use this in your API routes to require authentication
 * 
 * Usage:
 * export async function GET(req: NextRequest) {
 *   if (!verifyAdminAuth(req)) {
 *     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 *   // Your protected code here...
 * }
 */
export function requireAdminAuth(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    if (!verifyAdminAuth(req)) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }
    
    // Authentication successful, proceed with the request
    return handler(req);
  };
}

/**
 * Extract admin token from request (for debugging/logging)
 */
export function getAdminTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
}

