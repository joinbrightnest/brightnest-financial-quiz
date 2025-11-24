import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  try {
    // Trigger a server-side test error
    throw new Error('🎉 Server-Side Sentry Test - This error should appear in Sentry!');
  } catch (error) {
    // Manually capture to ensure it's sent
    Sentry.captureException(error);
    
    return NextResponse.json({ 
      error: 'Test error thrown and captured by Sentry',
      message: 'Check your Sentry dashboard!'
    }, { status: 500 });
  }
}

