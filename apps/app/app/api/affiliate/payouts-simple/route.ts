import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

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

    // Verify JWT token
    const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!JWT_SECRET) {
      console.error("FATAL: JWT_SECRET or NEXTAUTH_SECRET environment variable is required");
      return NextResponse.json(
        { error: "Authentication configuration error" },
        { status: 500 }
      );
    }

    let decoded: { affiliateId: string } | jwt.JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { affiliateId: string } | jwt.JwtPayload;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    if (!decoded || !decoded.affiliateId) {
      return NextResponse.json(
        { error: "Invalid token: missing affiliateId" },
        { status: 401 }
      );
    }

    // Get affiliate with payouts and conversions to properly calculate hold amounts
    console.log("Fetching affiliate:", decoded.affiliateId);
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: decoded.affiliateId },
      include: {
        payouts: {
          orderBy: { createdAt: "desc" },
        },
        conversions: true,
      },
    });
    console.log("Affiliate found:", !!affiliate);

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Get commission hold period from settings
    const settingsResult = await prisma.$queryRaw`
      SELECT value FROM "Settings" WHERE key = 'commission_hold_days'
    ` as { value: string }[];

    const holdDays = settingsResult.length > 0 ? parseInt(settingsResult[0].value) : 30;

    // Calculate held and available commissions based on conversion status
    const heldCommissions = affiliate.conversions.filter(c =>
      c.commissionStatus === 'held' && Number(c.commissionAmount) > 0
    );
    const availableConversions = affiliate.conversions.filter(c =>
      c.commissionStatus === 'available' && Number(c.commissionAmount) > 0
    );

    const heldAmount = heldCommissions.reduce((sum, c) => sum + Number(c.commissionAmount), 0);
    const availableAmount = availableConversions.reduce((sum, c) => sum + Number(c.commissionAmount), 0);

    // Calculate payout summary
    const totalPaid = affiliate.payouts
      .filter(p => p.status === "completed")
      .reduce((sum, p) => sum + Number(p.amountDue), 0);

    const pendingPayouts = affiliate.payouts
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + Number(p.amountDue), 0);

    const totalEarned = Number(affiliate.totalCommission || 0);
    // Available commission = available conversions - already paid out - pending payouts
    // Pending payouts are already committed, so they should be subtracted from available balance
    const availableCommission = Math.max(0, availableAmount - totalPaid - pendingPayouts);

    console.log("Calculations:", { totalEarned, totalPaid, heldAmount, availableAmount, availableCommission });

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
          heldCommission: heldAmount,
          holdDays,
        },
        commissionHoldInfo: {
          heldCommissions: heldCommissions.map(c => {
            const holdUntilDate = c.holdUntil ? new Date(c.holdUntil) : null;
            const now = new Date();
            const daysLeft = holdUntilDate ? Math.ceil((holdUntilDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
            const isReadyForRelease = holdUntilDate ? holdUntilDate <= now : false;

            return {
              id: c.id,
              amount: Number(c.commissionAmount),
              createdAt: c.createdAt,
              holdUntil: c.holdUntil,
              daysLeft: Math.max(0, daysLeft), // Ensure non-negative
              isReadyForRelease,
            };
          }),
          totalHeldAmount: heldAmount,
          totalAvailableAmount: availableAmount,
          holdDays,
          readyForRelease: heldCommissions.filter(c => c.holdUntil && new Date(c.holdUntil) <= new Date()).length,
          existingCommissions: availableConversions.length,
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
