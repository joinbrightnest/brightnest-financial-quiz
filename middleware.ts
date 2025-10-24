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
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}