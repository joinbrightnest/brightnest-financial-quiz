import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Create a test affiliate for demonstration
    const testAffiliate = await prisma.affiliate.create({
      data: {
        name: "Test Affiliate",
        email: "test@affiliate.com",
        passwordHash: "hashed_password",
        tier: "quiz",
        referralCode: "TEST123",
        customLink: "https://example.com/test",
        commissionRate: 0.1,
        totalCommission: 500.00,
        isActive: true,
        isApproved: true,
      },
    });

    return NextResponse.json({
      success: true,
      affiliate: testAffiliate,
      message: "Test affiliate created successfully"
    });
  } catch (error) {
    console.error("Error creating test affiliate:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to create test affiliate",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
