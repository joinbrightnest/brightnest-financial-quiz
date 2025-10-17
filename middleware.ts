import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  
  // Handle affiliate quiz redirects
  const affiliateQuizMatch = url.pathname.match(/^\/([^\/]+)\/quiz\/([^\/]+)$/)
  
  if (affiliateQuizMatch) {
    const [, affiliateCode, quizType] = affiliateQuizMatch
    
    // Track the affiliate redirect (async, don't wait for it)
    fetch(`${url.origin}/api/track-affiliate-redirect?affiliate=${affiliateCode}&utm_source=${url.searchParams.get('utm_source') || ''}&utm_medium=${url.searchParams.get('utm_medium') || ''}&utm_campaign=${url.searchParams.get('utm_campaign') || ''}`)
      .catch(error => console.error('Error tracking affiliate redirect:', error));
    
    // Redirect to quiz with affiliate parameter
    url.pathname = `/quiz/${quizType}`
    url.searchParams.set('affiliate', affiliateCode)
    
    return NextResponse.redirect(url)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}