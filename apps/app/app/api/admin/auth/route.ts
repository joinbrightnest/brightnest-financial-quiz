import { NextRequest, NextResponse } from "next/server";
import { generateAdminToken } from "@/lib/admin-auth-server";
import { rateLimit, rateLimitExceededResponse } from "@/lib/rate-limit";
import { setCrossDomainCookie } from "@/lib/session";

export async function POST(request: NextRequest) {
  // 🛡️ SECURITY: Rate limit authentication attempts (5 per 15 minutes)
  const rateLimitResult = await rateLimit(request, 'auth');
  if (!rateLimitResult.success) {
    return rateLimitExceededResponse(rateLimitResult);
  }

  try {
    const body = await request.json();
    const { code } = body;

    // Admin code from environment variable (required)
    const adminCode = process.env.ADMIN_ACCESS_CODE;
    if (!adminCode) {
      return NextResponse.json(
        { error: "Admin access not configured" },
        { status: 500 }
      );
    }
    
    if (code === adminCode) {
      // Generate JWT token for secure authentication
      const token = generateAdminToken();
      
      const response = NextResponse.json({ 
        success: true,
        token // Return token to client
      });
      
      // Set as httpOnly cookie with cross-domain support
      // This allows the admin session to work across joinbrightnest.com and app.joinbrightnest.com
      setCrossDomainCookie(response, "admin_token", token, {
        maxAge: 60 * 60 * 24 // 24 hours
      });
      
      return response;
    } else {
      return NextResponse.json(
        { error: "Invalid access code" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
