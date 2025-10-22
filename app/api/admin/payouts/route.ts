import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      whereClause.status = status;
    }
    if (affiliateId) {
      whereClause.affiliateId = affiliateId;
    }

    // Build SQL query conditions
    let statusCondition = "";
    let affiliateCondition = "";
    if (status && status !== "all") {
      statusCondition = `AND status = '${status}'`;
    }
    if (affiliateId) {
      affiliateCondition = `AND affiliate_id = '${affiliateId}'`;
    }

    // Get payouts with affiliate info using raw SQL
    const payouts = await prisma.$queryRawUnsafe(`
      SELECT 
        p.*,
        a.id as affiliate_id,
        a.name as affiliate_name,
        a.email as affiliate_email,
        a.referral_code as affiliate_referral_code
      FROM affiliate_payouts p
      JOIN affiliates a ON p.affiliate_id = a.id
      WHERE 1=1 ${statusCondition} ${affiliateCondition}
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    // Get total count
    const totalCountResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count
      FROM affiliate_payouts p
      WHERE 1=1 ${statusCondition} ${affiliateCondition}
    `);
    const totalCount = Number(totalCountResult[0].count);

    // Calculate summary stats using raw SQL
    const summaryStats = await prisma.$queryRawUnsafe(`
      SELECT 
        COALESCE(SUM(amount_due), 0) as total_amount,
        COUNT(*) as total_count
      FROM affiliate_payouts p
      WHERE 1=1 ${statusCondition} ${affiliateCondition}
    `);

    const completedStats = await prisma.$queryRawUnsafe(`
      SELECT 
        COALESCE(SUM(amount_due), 0) as total_amount,
        COUNT(*) as total_count
      FROM affiliate_payouts p
      WHERE 1=1 ${statusCondition} ${affiliateCondition} AND status = 'completed'
    `);

    const pendingStats = await prisma.$queryRawUnsafe(`
      SELECT 
        COALESCE(SUM(amount_due), 0) as total_amount,
        COUNT(*) as total_count
      FROM affiliate_payouts p
      WHERE 1=1 ${statusCondition} ${affiliateCondition} AND status = 'pending'
    `);

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
          totalAmount: Number(summaryStats[0].total_amount) || 0,
          totalCount: Number(summaryStats[0].total_count) || 0,
          completedAmount: Number(completedStats[0].total_amount) || 0,
          completedCount: Number(completedStats[0].total_count) || 0,
          pendingAmount: Number(pendingStats[0].total_amount) || 0,
          pendingCount: Number(pendingStats[0].total_count) || 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching payouts:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch payouts",
        details: error instanceof Error ? error.message : "Unknown error"
      },
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

    // Create payout record using raw SQL to avoid enum issues
    const payout = await prisma.$queryRaw`
      INSERT INTO affiliate_payouts (id, affiliate_id, amount_due, status, notes, created_at, updated_at, paid_at)
      VALUES (gen_random_uuid(), ${affiliateId}, ${amount}, ${status}, ${notes || `Manual payout of $${amount}`}, NOW(), NOW(), ${status === "completed" ? "NOW()" : "NULL"})
      RETURNING *
    `;

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
      { 
        success: false,
        error: "Failed to create payout",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
