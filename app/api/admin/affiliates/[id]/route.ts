import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyAdminAuth } from "@/lib/admin-auth-server";

const prisma = new PrismaClient();

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
          totalClicks: affiliate.total_clicks,
          totalLeads: affiliate.total_leads,
          totalBookings: affiliate.total_bookings,
          totalCommission: affiliate.total_commission,
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
