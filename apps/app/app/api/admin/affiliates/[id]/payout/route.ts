import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PayoutStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { verifyAdminAuth } from "@/lib/admin-auth-server";

export async function POST(
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
    const { id } = await params;
    const body = await request.json();
    const { amount, notes, status = "completed" } = body;

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Get minimum payout from settings
    let minimumPayout = 50; // Default fallback
    try {
      const settingsResult = await prisma.$queryRaw`
        SELECT value FROM "Settings" WHERE key = 'minimum_payout'
      ` as { value: string }[];
      if (settingsResult.length > 0) {
        minimumPayout = parseFloat(settingsResult[0].value);
      }
    } catch (error) {
      console.log('Using default minimum payout:', minimumPayout);
    }

    // Enforce minimum payout
    if (amount < minimumPayout) {
      return NextResponse.json(
        { error: `Payout amount must be at least $${minimumPayout.toFixed(2)}. Current minimum payout threshold is $${minimumPayout.toFixed(2)}.` },
        { status: 400 }
      );
    }

    // Get affiliate
    const affiliate = await prisma.affiliate.findUnique({
      where: { id },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Check if affiliate has enough available commission (not totalCommission, which is lifetime)
    // Calculate available commission from conversions with status='available'
    const availableConversions = await prisma.affiliateConversion.aggregate({
      where: {
        affiliateId: id,
        commissionStatus: 'available',
        commissionAmount: {
          gt: 0
        }
      },
      _sum: {
        commissionAmount: true
      }
    });

    const availableCommission = Number(availableConversions._sum.commissionAmount || 0);

    // Check if affiliate has enough available commission
    if (availableCommission < amount) {
      return NextResponse.json(
        { error: `Insufficient available commission. Available: $${availableCommission.toFixed(2)}, Requested: $${amount.toFixed(2)}` },
        { status: 400 }
      );
    }

    // Create payout record using raw SQL to avoid enum issues
    const payout = await prisma.$queryRaw`
      INSERT INTO affiliate_payouts (id, affiliate_id, amount_due, status, notes, created_at, updated_at)
      VALUES (gen_random_uuid(), ${id}, ${amount}, 'completed', ${notes || `Manual payout of $${amount}`}, NOW(), NOW())
      RETURNING *
    `;

    // Mark conversions as "paid" - process available commissions up to the payout amount
    // This ensures the "Available Commission" reflects what's actually available
    // Using cumulative sum to mark conversions until we reach the payout amount
    await prisma.$executeRaw`
      UPDATE affiliate_conversions
      SET commission_status = 'paid'
      WHERE id IN (
        SELECT id FROM (
          SELECT 
            id,
            commission_amount,
            SUM(commission_amount) OVER (ORDER BY created_at ASC) as cumulative_sum
          FROM affiliate_conversions
          WHERE affiliate_id = ${id}
            AND commission_status = 'available'
            AND commission_amount > 0
        ) as cumulative
        WHERE cumulative_sum <= ${amount}
      )
    `;

    // Note: We don't decrement totalCommission because it represents lifetime earnings
    // The "available" amount is calculated as: sum of conversions with status='available'

    // Get updated affiliate data
    const updatedAffiliate = await prisma.affiliate.findUnique({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      payout,
      affiliate: updatedAffiliate,
    });
  } catch (error) {
    console.error("Error creating payout:", error);
    return NextResponse.json(
      {
        error: "Failed to create payout",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get affiliate with payouts
    const affiliate = await prisma.affiliate.findUnique({
      where: { id },
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

    // Calculate available commission from conversions with status='available'
    const availableConversions = await prisma.affiliateConversion.aggregate({
      where: {
        affiliateId: id,
        commissionStatus: 'available',
      },
      _sum: {
        commissionAmount: true,
      },
    });

    const availableCommission = Number(availableConversions._sum.commissionAmount || 0);

    // Calculate total paid from completed payouts
    const totalPaid = affiliate.payouts
      .filter(p => p.status === "completed")
      .reduce((sum, p) => sum + Number(p.amountDue), 0);

    const pendingPayouts = affiliate.payouts
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + Number(p.amountDue), 0);

    return NextResponse.json({
      success: true,
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        totalCommission: affiliate.totalCommission, // Lifetime total
        totalPaid,
        pendingPayouts,
        availableCommission, // Sum of conversions with status='available'
      },
      payouts: affiliate.payouts,
    });
  } catch (error) {
    console.error("Error fetching affiliate payouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch affiliate payouts" },
      { status: 500 }
    );
  }
}
