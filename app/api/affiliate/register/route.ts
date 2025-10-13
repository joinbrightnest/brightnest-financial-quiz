import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { mockAffiliates, addMockAffiliate, findMockAffiliate } from "@/lib/mock-affiliates";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, tier, payoutMethod } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if affiliate already exists (mock check for now)
    const existingAffiliate = findMockAffiliate(email);
    if (existingAffiliate) {
      return NextResponse.json(
        { error: "An affiliate with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate unique referral code
    const referralCode = generateReferralCode(name);
    const customLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://brightnest.com'}/?ref=${referralCode}`;

    // Set commission rate based on tier
    const commissionRates = {
      quiz: 0.10,    // 10%
      creator: 0.15, // 15%
      agency: 0.20,  // 20%
    };

    const commissionRate = commissionRates[tier as keyof typeof commissionRates] || 0.10;

    // Create affiliate (mock for now)
    const affiliate = {
      id: `aff_${Date.now()}`,
      name,
      email,
      passwordHash,
      tier: tier || "quiz",
      referralCode,
      customLink,
      payoutMethod: payoutMethod || "stripe",
      commissionRate,
      isApproved: tier === "quiz", // Auto-approve quiz tier, others need approval
      totalClicks: 0,
      totalLeads: 0,
      totalBookings: 0,
      totalSales: 0,
      totalCommission: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to mock array
    addMockAffiliate(affiliate);

    return NextResponse.json({
      success: true,
      message: "Affiliate account created successfully",
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        tier: affiliate.tier,
        referralCode: affiliate.referralCode,
        customLink: affiliate.customLink,
        isApproved: affiliate.isApproved,
      },
    });
  } catch (error) {
    console.error("Affiliate registration error:", error);
    return NextResponse.json(
      { error: "Failed to create affiliate account" },
      { status: 500 }
    );
  }
}

function generateReferralCode(name: string): string {
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${cleanName}${randomSuffix}`.substring(0, 12);
}
