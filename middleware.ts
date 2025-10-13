import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the request is for analytics pages
  if (request.nextUrl.pathname.startsWith('/analytics')) {
    // Skip auth check for the auth page itself
    if (request.nextUrl.pathname === '/analytics/auth') {
      return NextResponse.next()
    }

    // Check for analytics token in cookies or authorization header
    const token = request.cookies.get('analytics_token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      // Redirect to auth page
      return NextResponse.redirect(new URL('/analytics/auth', request.url))
    }

    // You could also verify the JWT token here if needed
    // For now, we'll just check if it exists
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/analytics/:path*',
  ],
}