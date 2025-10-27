import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/admin-auth-server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin authentication required" },
      { status: 401 }
    );
  }
  
  try {
    // Get unapproved affiliates and check if they have activity
    const unapprovedAffiliates = await prisma.affiliate.findMany({
      where: {
        isApproved: false,  // Only show unapproved affiliates
        isActive: true,     // Only show active affiliates (exclude rejected ones)
      },
      include: {
        clicks: {
          select: { id: true },
          take: 1, // Just check if any clicks exist
        },
        conversions: {
          select: { id: true },
          take: 1, // Just check if any conversions exist
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Auto-approve affiliates who have generated activity
    const affiliatesToAutoApprove = [];
    const trulyPendingAffiliates = [];

    for (const affiliate of unapprovedAffiliates) {
      const hasActivity = affiliate.clicks.length > 0 || affiliate.conversions.length > 0;
      
      if (hasActivity) {
        // Auto-approve this affiliate
        affiliatesToAutoApprove.push(affiliate.id);
      } else {
        // Keep as pending
        trulyPendingAffiliates.push(affiliate);
      }
    }

    // Auto-approve affiliates with activity
    if (affiliatesToAutoApprove.length > 0) {
      await prisma.affiliate.updateMany({
        where: {
          id: {
            in: affiliatesToAutoApprove,
          },
        },
        data: {
          isApproved: true,
        },
      });

      console.log(`Auto-approved ${affiliatesToAutoApprove.length} affiliates with activity`);
    }

    return NextResponse.json({
      success: true,
      pendingAffiliates: trulyPendingAffiliates.map(affiliate => ({
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
      autoApproved: affiliatesToAutoApprove.length,
    });
  } catch (error) {
    console.error("Pending affiliates API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending affiliates" },
      { status: 500 }
    );
  }
}
