import { NextResponse } from 'next/server';

export async function GET() {
    // Return empty list to silence 404 errors in console
    // The source of this call could not be found in the codebase, likely from an extension or legacy client cache
    return NextResponse.json({ notifications: [] });
}
