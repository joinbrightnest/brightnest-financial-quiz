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
    const dateRange = searchParams.get("dateRange") || "all";
    
    // Calculate date filter
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

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
        payouts: true, // Get ALL payouts to calculate accurate totalPaid
        conversions: {
          where: {
            commissionAmount: {
              gt: 0 // Only conversions with actual commission amounts
            },
            // Don't filter by date - we need ALL conversions to calculate current available balance
          }
        },
      },
      orderBy: {
        totalCommission: "desc",
      },
    });

    // Calculate payout summaries for each affiliate
    const affiliatesWithPayouts = affiliates.map(affiliate => {
      // Only count completed payouts as "paid"
      const totalPaid = affiliate.payouts
        ?.filter(payout => payout.status === 'completed')
        .reduce((sum, payout) => sum + Number(payout.amountDue), 0) || 0;
      
      // Calculate pending commissions (held commissions)
      const pendingCommissions = affiliate.conversions
        .filter(conv => conv.commissionStatus === 'held')
        .reduce((sum, conv) => sum + Number(conv.commissionAmount), 0);
      
      // Calculate available commissions (ONLY available status, not paid or held)
      const availableCommissions = affiliate.conversions
        .filter(conv => conv.commissionStatus === 'available')
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
