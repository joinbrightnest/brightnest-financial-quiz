import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { affiliateCode } = await request.json();

    if (!affiliateCode) {
      return NextResponse.json({ error: "Affiliate code is required" }, { status: 400 });
    }

    console.log("Testing affiliate click for:", affiliateCode);

    // Find the affiliate
    const affiliate = await (prisma as any).affiliate.findUnique({
      where: { referralCode: affiliateCode },
    });

    if (!affiliate) {
      return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
    }

    console.log("Found affiliate:", affiliate.name);

    // Record the click
    const click = await (prisma as any).affiliateClick.create({
      data: {
        affiliateId: affiliate.id,
        referralCode: affiliate.referralCode,
        ipAddress: "test-ip",
        userAgent: "test-user-agent",
      },
    });

    console.log("Created click record:", click.id);

    // Update affiliate's total clicks
    const updatedAffiliate = await (prisma as any).affiliate.update({
      where: { id: affiliate.id },
      data: {
        totalClicks: {
          increment: 1,
        },
      },
    });

    console.log("Updated affiliate clicks:", updatedAffiliate.totalClicks);

    return NextResponse.json({
      success: true,
      message: `Click tracked for ${affiliateCode}`,
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        referralCode: affiliate.referralCode,
        totalClicks: updatedAffiliate.totalClicks,
      },
      click: {
        id: click.id,
        createdAt: click.createdAt,
      }
    });

  } catch (error) {
    console.error("Test affiliate click error:", error);
    return NextResponse.json(
      { error: "Failed to track test click", details: error.message },
      { status: 500 }
    );
  }
}
