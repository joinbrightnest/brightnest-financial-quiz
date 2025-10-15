import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log("Affiliate profile API called");
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No authorization header found");
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    console.log("Decoded token:", decoded);

    // Get affiliate profile
    console.log("Looking for affiliate with ID:", decoded.affiliateId);
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: decoded.affiliateId },
    });

    console.log("Affiliate found:", affiliate ? "Yes" : "No");
    if (!affiliate) {
      console.log("Affiliate not found in database");
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Use custom tracking link if available, otherwise use default
    const activeTrackingLink = affiliate.customTrackingLink || `https://joinbrightnest.com/${affiliate.referralCode}`;
    
    console.log("Affiliate data:", {
      id: affiliate.id,
      name: affiliate.name,
      referralCode: affiliate.referralCode,
      customLink: affiliate.customLink,
      customTrackingLink: affiliate.customTrackingLink,
      activeTrackingLink: activeTrackingLink
    });

    return NextResponse.json({
      id: affiliate.id,
      name: affiliate.name,
      email: affiliate.email,
      tier: affiliate.tier,
      referralCode: affiliate.referralCode,
      customLink: activeTrackingLink,
      commissionRate: affiliate.commissionRate,
      totalClicks: affiliate.totalClicks,
      totalLeads: affiliate.totalLeads,
      totalBookings: affiliate.totalBookings,
      totalSales: affiliate.totalSales,
      totalCommission: affiliate.totalCommission,
      isApproved: affiliate.isApproved,
      payoutMethod: affiliate.payoutMethod,
      createdAt: affiliate.createdAt,
    });
  } catch (error) {
    console.error("Affiliate profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
