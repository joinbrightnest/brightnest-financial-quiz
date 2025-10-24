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

    // Check if affiliate has enough commission
    if (Number(affiliate.totalCommission) < amount) {
      return NextResponse.json(
        { error: "Insufficient commission balance" },
        { status: 400 }
      );
    }

    // Create payout record using raw SQL to avoid enum issues
    const payout = await prisma.$queryRaw`
      INSERT INTO affiliate_payouts (id, affiliate_id, amount_due, status, notes, created_at, updated_at)
      VALUES (gen_random_uuid(), ${id}, ${amount}, 'completed', ${notes || `Manual payout of $${amount}`}, NOW(), NOW())
      RETURNING *
    `;

    // Update affiliate's total commission (subtract the paid amount)
    const updatedAffiliate = await prisma.affiliate.update({
      where: { id },
      data: {
        totalCommission: {
          decrement: amount,
        },
      },
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

    // Calculate payout summary
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
        totalCommission: affiliate.totalCommission,
        totalPaid,
        pendingPayouts,
        availableCommission: Number(affiliate.totalCommission) - totalPaid,
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
