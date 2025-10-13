import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Middleware can be used for other purposes in the future
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Add any routes that need middleware protection here
  ],
}