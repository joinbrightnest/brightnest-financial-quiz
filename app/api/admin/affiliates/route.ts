import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PayoutStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
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

    // Get affiliates with payout data
    const affiliates = await prisma.affiliate.findMany({
      where: whereClause,
      include: {
        payouts: true,
      },
      orderBy: {
        totalCommission: "desc",
      },
    });

    // Calculate payout summaries for each affiliate
    const affiliatesWithPayouts = affiliates.map(affiliate => {
      const totalPaid = affiliate.payouts?.reduce((sum, payout) => sum + Number(payout.amountDue), 0) || 0;
      // totalCommission is already the current available balance (reduced by payouts)
      const availableCommission = Number(affiliate.totalCommission || 0);

      return {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        referralCode: affiliate.referralCode,
        tier: affiliate.tier,
        totalCommission: Number(affiliate.totalCommission || 0),
        totalPaid,
        pendingPayouts: 0,
        availableCommission,
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
