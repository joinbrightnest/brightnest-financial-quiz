import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if this is an admin API route
  if (request.nextUrl.pathname.startsWith('/api/admin/')) {
    // Skip auth route itself
    if (request.nextUrl.pathname === '/api/admin/auth') {
      return NextResponse.next();
    }

    // Check for admin authentication cookie
    const adminCookie = request.cookies.get('admin_authenticated');
    
    if (!adminCookie || adminCookie.value !== 'true') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
  }

  // Add security headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Only add HSTS in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
