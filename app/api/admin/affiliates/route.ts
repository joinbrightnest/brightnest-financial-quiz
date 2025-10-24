import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PayoutStatus } from "@prisma/client";
import { verifyAdminAuth } from "@/lib/admin-auth-server";

export async function GET(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin authentication required" },
      { status: 401 }
    );
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "approved";
    const tier = searchParams.get("tier") || "all";

    // Build where clause
    const whereClause: any = {};
    
    if (status === "approved") {
      whereClause.isApproved = true;
    } else if (status === "pending") {
      whereClause.isApproved = false;
    }
    
    if (tier !== "all") {
      whereClause.tier = tier;
    }

    // Get affiliates with payout data and conversions
    const affiliates = await prisma.affiliate.findMany({
      where: whereClause,
      include: {
        payouts: true,
        conversions: {
          where: {
            commissionAmount: {
              gt: 0 // Only conversions with actual commission amounts
            }
          }
        },
      },
      orderBy: {
        totalCommission: "desc",
      },
    });

    // Calculate payout summaries for each affiliate
    const affiliatesWithPayouts = affiliates.map(affiliate => {
      const totalPaid = affiliate.payouts?.reduce((sum, payout) => sum + Number(payout.amountDue), 0) || 0;
      
      // Calculate pending commissions (held commissions)
      const pendingCommissions = affiliate.conversions
        .filter(conv => conv.commissionStatus === 'held')
        .reduce((sum, conv) => sum + Number(conv.commissionAmount), 0);
      
      // Calculate available commissions (available status or null/undefined)
      const availableCommissions = affiliate.conversions
        .filter(conv => conv.commissionStatus === 'available' || 
                       conv.commissionStatus === null || 
                       conv.commissionStatus === undefined)
        .reduce((sum, conv) => sum + Number(conv.commissionAmount), 0);
      
      // Calculate pending payouts (payouts with pending status)
      const pendingPayouts = affiliate.payouts
        ?.filter(payout => payout.status === 'pending')
        .reduce((sum, payout) => sum + Number(payout.amountDue), 0) || 0;

      return {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        referralCode: affiliate.referralCode,
        tier: affiliate.tier,
        totalCommission: Number(affiliate.totalCommission || 0),
        totalPaid,
        pendingPayouts,
        pendingCommissions,
        availableCommission: availableCommissions,
        isApproved: affiliate.isApproved,
        createdAt: affiliate.createdAt,
        updatedAt: affiliate.updatedAt,
      };
    });

    return NextResponse.json({
      success: true,
      affiliates: affiliatesWithPayouts,
      totalCount: affiliatesWithPayouts.length,
    });
  } catch (error) {
    console.error("Error fetching affiliates:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch affiliates",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
