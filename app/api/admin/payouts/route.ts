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
    `) as any[];

    // Get total count
    const totalCountResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count
      FROM affiliate_payouts p
      WHERE 1=1 ${statusCondition} ${affiliateCondition}
    `) as any[];
    const totalCount = Number(totalCountResult[0].count);

    // Calculate summary stats using raw SQL
    const summaryStats = await prisma.$queryRawUnsafe(`
      SELECT 
        COALESCE(SUM(amount_due), 0) as total_amount,
        COUNT(*) as total_count
      FROM affiliate_payouts p
      WHERE 1=1 ${statusCondition} ${affiliateCondition}
    `) as any[];

    const completedStats = await prisma.$queryRawUnsafe(`
      SELECT 
        COALESCE(SUM(amount_due), 0) as total_amount,
        COUNT(*) as total_count
      FROM affiliate_payouts p
      WHERE 1=1 ${statusCondition} ${affiliateCondition} AND status = 'completed'
    `) as any[];

    // Get pending/held commissions from conversions table (not from payouts)
    // These are commissions that are held and waiting to become available
    const heldCommissionsStats = await prisma.$queryRawUnsafe(`
      SELECT 
        COALESCE(SUM(commission_amount), 0) as total_amount,
        COUNT(DISTINCT affiliate_id) as affiliate_count
      FROM affiliate_conversions
      WHERE commission_status = 'held'
      ${affiliateId ? `AND affiliate_id = '${affiliateId}'` : ''}
    `) as any[];
    
    // Get total earned commissions (all affiliates)
    const totalEarnedStats = await prisma.$queryRawUnsafe(`
      SELECT 
        COALESCE(SUM(total_commission), 0) as total_earned,
        COUNT(*) as affiliate_count
      FROM affiliates
      WHERE is_approved = true
      ${affiliateId ? `AND id = '${affiliateId}'` : ''}
    `) as any[];
    
    const pendingStats = await prisma.$queryRawUnsafe(`
      SELECT 
        COALESCE(SUM(amount_due), 0) as total_amount,
        COUNT(*) as total_count
      FROM affiliate_payouts p
      WHERE 1=1 ${statusCondition} ${affiliateCondition} AND status = 'pending'
    `) as any[];

    // Transform payouts data to match expected frontend structure
    const transformedPayouts = payouts.map((payout: any) => ({
      id: payout.id,
      amountDue: Number(payout.amount_due),
      status: payout.status,
      paidAt: payout.paid_at,
      notes: payout.notes,
      createdAt: payout.created_at,
      affiliate: {
        id: payout.affiliate_id,
        name: payout.affiliate_name,
        email: payout.affiliate_email,
        referralCode: payout.affiliate_referral_code,
      },
    }));

    // If affiliateId is provided, also fetch commission hold details
    let commissionHoldInfo = null;
    if (affiliateId) {
      try {
        // Get commission hold period from settings
        const holdDaysResult = await prisma.$queryRaw`
          SELECT value FROM "Settings" WHERE key = 'commission_hold_days'
        ` as any[];
        const holdDays = holdDaysResult.length > 0 ? parseInt(holdDaysResult[0].value) : 30;

        // Get held commissions for this affiliate
        const heldCommissions = await prisma.affiliateConversion.findMany({
          where: {
            affiliateId: affiliateId,
            commissionStatus: 'held',
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        commissionHoldInfo = {
          holdDays,
          heldCommissions: heldCommissions.map((conv: any) => ({
            id: conv.id,
            amount: Number(conv.commissionAmount),
            createdAt: conv.createdAt,
            holdUntil: conv.holdUntil,
          })),
        };
      } catch (error) {
        console.error("Error fetching commission hold info:", error);
        commissionHoldInfo = null;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        payouts: transformedPayouts,
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
          // Use held commissions for pending (commissions waiting for hold period)
          pendingAmount: Number(heldCommissionsStats[0].total_amount) || 0,
          pendingCount: Number(heldCommissionsStats[0].affiliate_count) || 0,
          // Total earned by all affiliates
          totalEarned: Number(totalEarnedStats[0].total_earned) || 0,
          totalAffiliates: Number(totalEarnedStats[0].affiliate_count) || 0,
        },
      },
      commissionHoldInfo,
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

// POST method removed - payout creation is handled by /api/admin/affiliates/[id]/payout
