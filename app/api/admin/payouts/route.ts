import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PayoutStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const affiliateId = searchParams.get("affiliateId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    if (status && status !== "all") {
      whereClause.status = status as PayoutStatus;
    }
    if (affiliateId) {
      whereClause.affiliateId = affiliateId;
    }

    // Get payouts with affiliate info
    const [payouts, totalCount] = await Promise.all([
      prisma.affiliatePayout.findMany({
        where: whereClause,
        include: {
          affiliate: {
            select: {
              id: true,
              name: true,
              email: true,
              referralCode: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.affiliatePayout.count({ where: whereClause }),
    ]);

    // Calculate summary stats
    const summaryStats = await prisma.affiliatePayout.aggregate({
      where: whereClause,
      _sum: {
        amountDue: true,
      },
      _count: {
        id: true,
      },
    });

    const completedStats = await prisma.affiliatePayout.aggregate({
      where: { ...whereClause, status: "completed" },
      _sum: {
        amountDue: true,
      },
      _count: {
        id: true,
      },
    });

    const pendingStats = await prisma.affiliatePayout.aggregate({
      where: { ...whereClause, status: "pending" },
      _sum: {
        amountDue: true,
      },
      _count: {
        id: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        payouts,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
        summary: {
          totalAmount: summaryStats._sum.amountDue || 0,
          totalCount: summaryStats._count.id,
          completedAmount: completedStats._sum.amountDue || 0,
          completedCount: completedStats._count.id,
          pendingAmount: pendingStats._sum.amountDue || 0,
          pendingCount: pendingStats._count.id,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching payouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch payouts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { affiliateId, amount, notes, status = "completed" } = body;

    // Validate input
    if (!affiliateId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Affiliate ID and amount are required" },
        { status: 400 }
      );
    }

    // Get affiliate
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
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

    // Create payout record
    const payout = await prisma.affiliatePayout.create({
      data: {
        affiliateId,
        amountDue: amount,
        status: status as PayoutStatus,
        paidAt: status === "completed" ? new Date() : null,
        notes: notes || `Manual payout of $${amount}`,
      },
      include: {
        affiliate: {
          select: {
            id: true,
            name: true,
            email: true,
            referralCode: true,
          },
        },
      },
    });

    // Update affiliate's total commission (subtract the paid amount)
    const updatedAffiliate = await prisma.affiliate.update({
      where: { id: affiliateId },
      data: {
        totalCommission: {
          decrement: amount,
        },
      },
    });

    // Create audit log
    await prisma.affiliateAuditLog.create({
      data: {
        affiliateId,
        action: "COMMISSION_PAID",
        details: {
          amount: amount,
          payoutId: payout.id,
          previousCommission: affiliate.totalCommission,
          newCommission: updatedAffiliate.totalCommission,
          notes: notes,
          adminAction: true,
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
      { error: "Failed to create payout" },
      { status: 500 }
    );
  }
}
