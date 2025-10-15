import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get all pending affiliates (simplified - just get all affiliates for now)
    const pendingAffiliates = await prisma.affiliate.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      pendingAffiliates: pendingAffiliates.map(affiliate => ({
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        tier: affiliate.tier,
        referralCode: affiliate.referralCode,
        customLink: affiliate.customLink,
        commissionRate: affiliate.commissionRate,
        createdAt: affiliate.createdAt,
        updatedAt: affiliate.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Pending affiliates API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending affiliates" },
      { status: 500 }
    );
  }
}
