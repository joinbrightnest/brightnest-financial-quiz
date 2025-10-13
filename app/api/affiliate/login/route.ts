import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { findMockAffiliate } from "@/lib/mock-affiliates";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find affiliate (mock data for now)
    const affiliate = findMockAffiliate(email);

    if (!affiliate) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if account is active
    if (!affiliate.isActive) {
      return NextResponse.json(
        { error: "Account is deactivated" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, affiliate.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate simple session token (for now, we'll use a simple approach)
    const token = Buffer.from(JSON.stringify({
      affiliateId: affiliate.id,
      email: affiliate.email,
      tier: affiliate.tier,
      timestamp: Date.now(),
    })).toString('base64');

    // Create audit log (mock for now)
    console.log(`Affiliate login: ${affiliate.email} from ${request.headers.get("x-forwarded-for") || "unknown"}`);

    return NextResponse.json({
      success: true,
      token,
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        tier: affiliate.tier,
        referralCode: affiliate.referralCode,
        customLink: affiliate.customLink,
        commissionRate: affiliate.commissionRate,
        totalClicks: affiliate.totalClicks,
        totalLeads: affiliate.totalLeads,
        totalBookings: affiliate.totalBookings,
        totalSales: affiliate.totalSales,
        totalCommission: affiliate.totalCommission,
        isApproved: affiliate.isApproved,
      },
    });
  } catch (error) {
    console.error("Affiliate login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
