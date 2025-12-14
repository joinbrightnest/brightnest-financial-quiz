import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAffiliateIdFromToken } from "../auth-utils";

export async function GET(request: NextRequest) {
  try {
    console.log("Affiliate profile API called");

    // 🔒 SECURITY: Use auth-utils for token extraction (supports cookie + header)
    const affiliateId = getAffiliateIdFromToken(request);
    if (!affiliateId) {
      console.log("No valid token found");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get affiliate profile with click count in a single query (fixes N+1)
    console.log("Looking for affiliate with ID:", affiliateId);
    const [affiliate, clickCount] = await Promise.all([
      prisma.affiliate.findUnique({
        where: { id: affiliateId },
      }),
      prisma.affiliateClick.count({
        where: { affiliateId: affiliateId },
      }),
    ]);

    console.log("Affiliate found:", affiliate ? "Yes" : "No");
    if (!affiliate) {
      console.log("Affiliate not found in database");
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Use custom tracking link if available, otherwise use default
    const customTrackingLink = affiliate.custom_tracking_link;
    const activeTrackingLink = customTrackingLink || `https://joinbrightnest.com/${affiliate.referralCode}`;

    return NextResponse.json({
      id: affiliate.id,
      name: affiliate.name,
      email: affiliate.email,
      tier: affiliate.tier,
      referralCode: affiliate.referralCode,
      customLink: activeTrackingLink,
      commissionRate: affiliate.commissionRate,
      totalClicks: clickCount, // Use pre-fetched count (fixes N+1)
      totalLeads: affiliate.totalLeads,
      totalBookings: affiliate.totalBookings,
      totalSales: affiliate.totalSales,
      totalCommission: affiliate.totalCommission,
      isApproved: affiliate.isApproved,
      payoutMethod: affiliate.payoutMethod,
      createdAt: affiliate.createdAt,
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error("Affiliate profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
