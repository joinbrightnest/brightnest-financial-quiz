import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
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
      // Set a simple session cookie (you can make this more secure later)
      const response = NextResponse.json({ success: true });
      response.cookies.set("admin_authenticated", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
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
