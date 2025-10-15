import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: affiliateId } = await params;

    // Get affiliate data
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: affiliate.id,
      name: affiliate.name,
      email: affiliate.email,
      tier: affiliate.tier,
      referralCode: affiliate.referralCode,
      customLink: affiliate.customLink,
      customTrackingLink: (affiliate as any).customTrackingLink || null,
      commissionRate: affiliate.commissionRate,
      totalClicks: affiliate.totalClicks,
      totalLeads: affiliate.totalLeads,
      totalBookings: affiliate.totalBookings,
      totalCommission: affiliate.totalCommission,
      isApproved: affiliate.isApproved,
      createdAt: affiliate.createdAt.toISOString(),
      updatedAt: affiliate.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching affiliate:", error);
    return NextResponse.json(
      { error: "Failed to fetch affiliate data" },
      { status: 500 }
    );
  }
}
