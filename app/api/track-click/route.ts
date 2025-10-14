import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { affiliateCode } = await request.json();

    if (!affiliateCode) {
      return NextResponse.json({ error: "Affiliate code is required" }, { status: 400 });
    }

    console.log("Tracking click for affiliate:", affiliateCode);

    // Find affiliate by referral code
    const affiliate = await prisma.affiliate.findUnique({
      where: { referralCode: affiliateCode },
    });

    if (!affiliate || !affiliate.isActive) {
      return NextResponse.json({ error: "Invalid or inactive affiliate" }, { status: 404 });
    }

    // Record the click
    try {
      await prisma.affiliateClick.create({
        data: {
          affiliateId: affiliate.id,
          referralCode: affiliate.referralCode,
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });

      // Update affiliate's total clicks
      await prisma.affiliate.update({
        where: { id: affiliate.id },
        data: {
          totalClicks: {
            increment: 1,
          },
        },
      });

      console.log("Click tracked successfully for:", affiliateCode);
    } catch (error) {
      console.error("Error recording click:", error);
    }

    return NextResponse.json({ success: true, message: "Click tracked" });
  } catch (error) {
    console.error("Track click API error:", error);
    return NextResponse.json({ error: "Failed to track click" }, { status: 500 });
  }
}
