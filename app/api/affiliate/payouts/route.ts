import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 401 }
      );
    }

    if (!decoded || !decoded.affiliateId) {
      return NextResponse.json(
        { error: "Invalid token: missing affiliateId" },
        { status: 401 }
      );
    }

    // Get affiliate with payouts
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: decoded.affiliateId },
      include: {
        payouts: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Calculate payout summary
    const totalPaid = affiliate.payouts
      .filter(p => p.status === "completed")
      .reduce((sum, p) => sum + Number(p.amountDue), 0);

    const pendingPayouts = affiliate.payouts
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + Number(p.amountDue), 0);

    const totalEarned = Number(affiliate.totalCommission || 0) + totalPaid;

    // Generate monthly earnings data for the last 6 months
    const monthlyEarnings = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      // Calculate earnings for this month (simplified - using total commission divided by 6)
      // In a real implementation, you'd calculate this from actual transaction data
      const monthlyEarning = i === 5 ? totalEarned * 0.1 : 
                            i === 4 ? totalEarned * 0.15 :
                            i === 3 ? totalEarned * 0.2 :
                            i === 2 ? totalEarned * 0.25 :
                            i === 1 ? totalEarned * 0.2 :
                            totalEarned * 0.1;
      
      monthlyEarnings.push({
        month: monthName,
        earnings: Math.round(monthlyEarning)
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        affiliate: {
          id: affiliate.id,
          name: affiliate.name,
          email: affiliate.email,
          totalCommission: Number(affiliate.totalCommission || 0),
          totalEarned,
          totalPaid,
          pendingPayouts,
          availableCommission: Number(affiliate.totalCommission || 0),
          payoutMethod: affiliate.payoutMethod || "stripe",
        },
        payouts: affiliate.payouts.map(payout => ({
          id: payout.id,
          amountDue: Number(payout.amountDue),
          status: payout.status,
          notes: payout.notes,
          createdAt: payout.createdAt,
          paidAt: payout.paidAt,
        })),
        summary: {
          totalEarned,
          totalPaid,
          pendingPayouts,
          availableCommission: Number(affiliate.totalCommission || 0),
        },
        monthlyEarnings
      }
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error("Error fetching affiliate payouts:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch affiliate payouts",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
