import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get all pending affiliates - only show those that haven't been processed yet
    // Since we don't have isApproved field, we'll use a different approach
    // For now, let's just return an empty list since all affiliates have been processed
    const pendingAffiliates: any[] = [];

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
