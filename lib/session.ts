/**
 * Session & Cookie Utilities
 * 
 * Handles cross-domain session management between:
 * - joinbrightnest.com (marketing site)
 * - app.brightnest.com (app platform)
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * Cookie configuration for cross-domain support
 */
export const getCookieOptions = (isProduction = process.env.NODE_ENV === 'production') => {
  return {
    // Use root domain for cross-subdomain cookies
    // .brightnest.com works for both joinbrightnest.com and app.brightnest.com
    domain: isProduction ? process.env.COOKIE_DOMAIN || '.brightnest.com' : undefined,
    path: '/',
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' as const : 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  }
}

/**
 * Set a cross-domain cookie
 */
export function setCrossDomainCookie(
  response: NextResponse,
  name: string,
  value: string,
  options?: Partial<ReturnType<typeof getCookieOptions>>
) {
  const cookieOptions = {
    ...getCookieOptions(),
    ...options,
  }
  
  response.cookies.set(name, value, cookieOptions)
  return response
}

/**
 * Get current domain type
 */
export function getDomainType(request: NextRequest): 'marketing' | 'app' {
  const hostname = request.headers.get('host') || ''
  
  if (hostname.includes('app.brightnest') || hostname.includes('app.localhost')) {
    return 'app'
  }
  
  return 'marketing'
}

/**
 * Get the opposite domain URL
 */
export function getOppositeDomainUrl(request: NextRequest, path: string = '/'): string {
  const hostname = request.headers.get('host') || ''
  const protocol = request.headers.get('x-forwarded-proto') || 'http'
  const currentType = getDomainType(request)
  
  let newHostname = hostname
  
  if (currentType === 'marketing') {
    // Switch to app domain
    newHostname = hostname.replace('joinbrightnest.com', 'app.brightnest.com').replace('localhost', 'app.localhost')
  } else {
    // Switch to marketing domain
    newHostname = hostname.replace('app.brightnest.com', 'joinbrightnest.com').replace('app.localhost', 'localhost')
  }
  
  return `${protocol}://${newHostname}${path}`
}

