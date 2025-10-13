import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Mock admin users (in production, this would be in a database)
const ADMIN_USERS = [
  {
    email: "admin@brightnest.com",
    password: "admin123", // In production, this would be hashed
    role: "admin",
    name: "Admin User",
  },
  {
    email: "ceo@brightnest.com", 
    password: "ceo123",
    role: "ceo",
    name: "CEO",
  },
  {
    email: "ops@brightnest.com",
    password: "ops123", 
    role: "ops",
    name: "Operations Team",
  },
];

const JWT_SECRET = process.env.JWT_SECRET || "brightnest-analytics-secret-key";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = ADMIN_USERS.find(u => u.email === email);
    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        email: user.email,
        role: user.role,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Auth API error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    return NextResponse.json({
      valid: true,
      user: {
        email: decoded.email,
        role: decoded.role,
        name: decoded.name,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401 }
    );
  }
}
