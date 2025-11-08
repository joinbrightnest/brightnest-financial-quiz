import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  
  // Handle affiliate quiz redirects
  const affiliateQuizMatch = url.pathname.match(/^\/([^\/]+)\/quiz\/([^\/]+)$/)
  
  if (affiliateQuizMatch) {
    const [, affiliateCode, quizType] = affiliateQuizMatch
    
    // Redirect to quiz with affiliate parameter
    // Note: Affiliate tracking is handled by the page-level validateAndTrackAffiliate function
    // to avoid duplicate clicks from middleware + page tracking
    url.pathname = `/quiz/${quizType}`
    url.searchParams.set('affiliate', affiliateCode)
    
    return NextResponse.redirect(url)
  }
  
  // 🛡️ SECURITY: Add CORS and security headers
  const response = NextResponse.next()
  
  // CORS headers
  const origin = request.headers.get('origin')
  const allowedOrigins = [
    'https://joinbrightnest.com',
    'https://www.joinbrightnest.com',
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ].filter(Boolean)
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }
  
  // Security headers
  // Allow Calendly iframes for booking functionality
  // Use SAMEORIGIN instead of DENY to allow Calendly embeds
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  // Allow Calendly domain for iframes (needed for booking widget)
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://calendly.com https://*.calendly.com"
  )
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )
  
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}