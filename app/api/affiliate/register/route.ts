import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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

    // Check if affiliate already exists
    const existingAffiliate = await prisma.affiliate.findUnique({
      where: { email },
    });

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
    // Simple affiliate link format: https://joinbrightnest.com/referralcode
    const customLink = `https://joinbrightnest.com/${referralCode}`;
    
    console.log("Generated affiliate link:", {
      name,
      referralCode,
      customLink
    });

    // Set commission rate based on tier
    const commissionRates = {
      quiz: 0.10,    // 10%
      creator: 0.15, // 15%
      agency: 0.20,  // 20%
    };

    const commissionRate = commissionRates[tier as keyof typeof commissionRates] || 0.10;

    // Create affiliate
    const affiliate = await prisma.affiliate.create({
      data: {
        name,
        email,
        passwordHash,
        tier: tier || "quiz",
        referralCode,
        customLink,
        payoutMethod: payoutMethod || "stripe",
        commissionRate,
      },
    });

    // Create audit log
    await prisma.affiliateAuditLog.create({
      data: {
        affiliateId: affiliate.id,
        action: "account_created",
        details: {
          tier,
          payoutMethod,
          commissionRate,
        },
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Affiliate account created successfully. Your account is pending admin approval.",
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        tier: affiliate.tier,
        referralCode: affiliate.referralCode,
        customLink: affiliate.customLink,
        isApproved: false,
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
