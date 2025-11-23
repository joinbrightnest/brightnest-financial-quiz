import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  // Determine which domain we're on
  const isAppDomain = hostname.includes('app.brightnest') || hostname.includes('app.localhost')
  const isMainDomain = hostname.includes('joinbrightnest.com') || hostname.includes('localhost') && !isAppDomain
  
  // Routes that should ONLY be on app.brightnest.com
  const appOnlyRoutes = [
    '/admin',
    '/closers',
    '/affiliates/dashboard',
    '/affiliates/profile',
    '/affiliates/links',
    '/affiliates/payouts',
  ]
  
  // Routes that should ONLY be on joinbrightnest.com (marketing)
  const marketingOnlyRoutes = [
    '/about',
    '/blog',
    '/faq',
    '/tools',
    '/partners',
  ]
  
  // Check if current path should be on app domain
  const shouldBeOnApp = appOnlyRoutes.some(route => pathname.startsWith(route))
  
  // Check if current path should be on marketing domain
  const shouldBeOnMarketing = marketingOnlyRoutes.some(route => pathname.startsWith(route))
  
  // Redirect logic
  if (isMainDomain && shouldBeOnApp) {
    // On main domain but accessing app-only route → redirect to app domain
    const url = new URL(request.url)
    url.host = hostname.replace('joinbrightnest.com', 'app.brightnest.com').replace('localhost:3000', 'app.localhost:3000')
    return NextResponse.redirect(url)
  }
  
  if (isAppDomain && shouldBeOnMarketing) {
    // On app domain but accessing marketing-only route → redirect to main domain
    const url = new URL(request.url)
    url.host = hostname.replace('app.brightnest.com', 'joinbrightnest.com').replace('app.localhost:3000', 'localhost:3000')
    return NextResponse.redirect(url)
  }
  
  // Redirect homepage based on domain
  if (pathname === '/') {
    if (isAppDomain) {
      // App domain homepage → redirect to admin dashboard
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    // Main domain homepage → stay on homepage (marketing site)
  }
  
  // Allow the request to continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
