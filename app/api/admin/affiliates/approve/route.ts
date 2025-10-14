import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { affiliateId, approved } = await request.json();

    if (!affiliateId) {
      return NextResponse.json(
        { error: "Affiliate ID is required" },
        { status: 400 }
      );
    }

    // Update affiliate approval status
    const affiliate = await prisma.affiliate.update({
      where: { id: affiliateId },
      data: { isApproved: approved },
    });

    // Create audit log
    await prisma.affiliateAuditLog.create({
      data: {
        affiliateId: affiliate.id,
        action: approved ? "account_approved" : "account_rejected",
        details: { approved },
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Affiliate ${approved ? 'approved' : 'rejected'} successfully`,
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        tier: affiliate.tier,
        isApproved: affiliate.isApproved,
      },
    });
  } catch (error) {
    console.error("Affiliate approval error:", error);
    return NextResponse.json(
      { error: "Failed to update affiliate status" },
      { status: 500 }
    );
  }
}
