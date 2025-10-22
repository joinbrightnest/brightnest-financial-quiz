import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PayoutStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Create payout record with minimal required fields
    const payout = await prisma.affiliatePayout.create({
      data: {
        affiliateId: id,
        amount: amount,
        status: "completed",
        notes: notes || `Manual payout of $${amount}`,
      },
    });

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
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      affiliateId: id,
      amount,
      notes,
      status
    });
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
