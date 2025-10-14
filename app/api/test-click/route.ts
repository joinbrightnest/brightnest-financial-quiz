import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { affiliateCode } = await request.json();

    if (!affiliateCode) {
      return NextResponse.json({ error: "Affiliate code is required" }, { status: 400 });
    }

    console.log("Testing affiliate click tracking for:", affiliateCode);

    // Find the affiliate
    const affiliate = await prisma.affiliate.findUnique({
      where: { referralCode: affiliateCode },
    });

    if (!affiliate) {
      return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
    }

    console.log("Affiliate found:", affiliate.name, "Active:", affiliate.isActive);

    if (!affiliate.isActive) {
      return NextResponse.json({ error: "Affiliate is not active" }, { status: 400 });
    }

    // Record the click
    const click = await prisma.affiliateClick.create({
      data: {
        affiliateId: affiliate.id,
        referralCode: affiliate.referralCode,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    // Update affiliate's total clicks
    const updatedAffiliate = await prisma.affiliate.update({
      where: { id: affiliate.id },
      data: {
        totalClicks: {
          increment: 1,
        },
      },
    });

    console.log("Click tracked successfully. New total clicks:", updatedAffiliate.totalClicks);

    return NextResponse.json({
      success: true,
      message: "Click tracked successfully",
      affiliate: {
        name: affiliate.name,
        referralCode: affiliate.referralCode,
        totalClicks: updatedAffiliate.totalClicks,
      },
      click: {
        id: click.id,
        createdAt: click.createdAt,
      },
    });
  } catch (error) {
    console.error("Error tracking affiliate click:", error);
    return NextResponse.json(
      { error: "Failed to track click", details: error.message },
      { status: 500 }
    );
  }
}
