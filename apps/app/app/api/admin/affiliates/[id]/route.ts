import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/admin-auth-server";
import { prisma } from "@/lib/prisma";
import { calculateLeads } from "@/lib/lead-calculation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin authentication required" },
      { status: 401 }
    );
  }

  try {
    const { id: affiliateId } = await params;

    // Get affiliate data using raw SQL to include customTrackingLink
    const affiliateResult = await prisma.$queryRaw`
      SELECT * FROM "affiliates" 
      WHERE "id" = ${affiliateId}
      LIMIT 1
    `;

    const affiliate = Array.isArray(affiliateResult) && affiliateResult.length > 0
      ? affiliateResult[0]
      : null;

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
      referralCode: affiliate.referral_code,
      customLink: affiliate.custom_link,
      customTrackingLink: affiliate.custom_tracking_link || null,
      commissionRate: affiliate.commission_rate,
      totalClicks: await prisma.affiliateClick.count({ where: { affiliateId: affiliate.id } }),
      totalLeads: (await calculateLeads({ affiliateCode: affiliate.referral_code, dateRange: "all" })).totalLeads,
      totalBookings: await prisma.affiliateConversion.count({
        where: {
          affiliateId: affiliate.id,
          conversionType: 'booking'
        }
      }),
      totalCommission: Number((await prisma.affiliateConversion.aggregate({
        _sum: { commissionAmount: true },
        where: { affiliateId: affiliate.id }
      }))._sum.commissionAmount || 0),
      isApproved: affiliate.is_approved,
      isActive: affiliate.is_active,
      createdAt: affiliate.created_at,
      updatedAt: affiliate.updated_at,
    });
  } catch (error) {
    console.error("Error fetching affiliate:", error);
    return NextResponse.json(
      { error: "Failed to fetch affiliate data" },
      { status: 500 }
    );
  }
}
