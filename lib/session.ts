/**
 * Session & Cookie Utilities
 * 
 * Handles cross-domain session management between:
 * - joinbrightnest.com (marketing site)
 * - app.joinbrightnest.com (app platform)
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * Cookie configuration for cross-domain support
 */
export const getCookieOptions = (isProduction = process.env.NODE_ENV === 'production') => {
  return {
    // Use root domain for cross-subdomain cookies
    // .joinbrightnest.com works for both joinbrightnest.com and app.joinbrightnest.com
    domain: isProduction ? process.env.COOKIE_DOMAIN || '.joinbrightnest.com' : undefined,
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
  const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'app.joinbrightnest.com'
  
  if (hostname.includes(APP_DOMAIN) || hostname.includes('app.localhost')) {
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
  
  const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'joinbrightnest.com'
  const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'app.joinbrightnest.com'
  
  let newHostname = hostname
  
  if (currentType === 'marketing') {
    // Switch to app domain
    newHostname = APP_DOMAIN
  } else {
    // Switch to marketing domain
    newHostname = MAIN_DOMAIN
  }
  
  return `${protocol}://${newHostname}${path}`
}

