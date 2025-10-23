import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("Simple affiliate payouts API called");
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

    // Get affiliate with payouts only (no conversions to avoid commissionStatus issues)
    console.log("Fetching affiliate:", decoded.affiliateId);
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: decoded.affiliateId },
      include: {
        payouts: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    console.log("Affiliate found:", !!affiliate);

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Calculate payout summary (simple version)
    const totalPaid = affiliate.payouts
      .filter(p => p.status === "completed")
      .reduce((sum, p) => sum + Number(p.amountDue), 0);

    const pendingPayouts = affiliate.payouts
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + Number(p.amountDue), 0);

    const totalEarned = Number(affiliate.totalCommission || 0);
    const availableCommission = totalEarned - totalPaid;

    console.log("Calculations:", { totalEarned, totalPaid, availableCommission });

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
          availableCommission,
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
          availableCommission,
          heldCommission: 0,
          holdDays: 30,
        },
        commissionHoldInfo: {
          heldCommissions: [],
          totalHeldAmount: 0,
          totalAvailableAmount: availableCommission,
          holdDays: 30,
          readyForRelease: 0,
          existingCommissions: 0,
        }
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
