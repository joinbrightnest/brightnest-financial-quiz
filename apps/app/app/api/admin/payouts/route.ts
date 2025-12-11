import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AffiliatePayout, AffiliateConversion, Prisma } from "@prisma/client";
import { verifyAdminAuth } from "@/lib/admin-auth-server";
import { payoutsQuerySchema, parseQueryParams } from "@/lib/validation";

interface RawPayout {
  id: string;
  amount_due: number;
  status: string;
  paid_at: Date | null;
  notes: string | null;
  created_at: Date;
  affiliate_id: string;
  affiliate_name: string;
  affiliate_email: string;
  affiliate_referral_code: string;
}

export async function GET(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin authentication required" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);

    // 🛡️ Validate query parameters
    const validation = parseQueryParams(payoutsQuerySchema, searchParams);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { status, affiliateId, dateRange, page, limit } = validation.data;
    const offset = (page - 1) * limit;

    // Calculate date filter
    const now = new Date();
    let startDate: Date | undefined;

    if (dateRange !== "all") {
      switch (dateRange) {
        case "24h":
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "1y":
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }
    }

    // Build where clause using Prisma types for safety
    const whereClause: Prisma.AffiliatePayoutWhereInput = {};

    if (status && status !== "all") {
      whereClause.status = status as any;
    }

    if (affiliateId) {
      whereClause.affiliateId = affiliateId;
    }

    if (startDate) {
      whereClause.createdAt = {
        gte: startDate
      };
    }

    // Get payouts with affiliate info using Prisma ORM (Safe)
    const payouts = await prisma.affiliatePayout.findMany({
      where: whereClause,
      include: {
        affiliate: {
          select: {
            id: true,
            name: true,
            email: true,
            referralCode: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await prisma.affiliatePayout.count({
      where: whereClause
    });

    // Calculate summary stats using Prisma aggregate
    const summaryStats = await prisma.affiliatePayout.aggregate({
      where: whereClause,
      _sum: {
        amountDue: true
      },
      _count: true
    });

    // Completed Stats
    const completedStats = await prisma.affiliatePayout.aggregate({
      where: {
        ...whereClause,
        status: 'completed'
      },
      _sum: {
        amountDue: true
      },
      _count: true
    });

    // Pending Stats (from Payouts table)
    const pendingStats = await prisma.affiliatePayout.aggregate({
      where: {
        ...whereClause,
        status: 'pending'
      },
      _sum: {
        amountDue: true
      },
      _count: true
    });

    // Held Commissions Stats (from Conversions table)
    // These are commissions that are held and waiting to become available
    const conversionsWhereClause: Prisma.AffiliateConversionWhereInput = {
      commissionStatus: 'held',
    };

    if (affiliateId) {
      conversionsWhereClause.affiliateId = affiliateId;
    } else if (startDate) {
      // Only apply date filter to conversions if not filtering by specific affiliate? 
      // Original logic had logic `conversionDateFilter = startDate ? ...`
      conversionsWhereClause.createdAt = { gte: startDate };
    }

    // Get held commissions aggregating by affiliate count manually or logical equivalent
    // The original query did COUNT(DISTINCT affiliate_id). Prisma doesn't support distinct count in aggregate easily.
    // We'll trust the amount sum is the most important part.
    const heldCommissionsStats = await prisma.affiliateConversion.aggregate({
      where: conversionsWhereClause,
      _sum: {
        commissionAmount: true
      }
    });

    // For affiliate count in held commissions:
    const heldAffiliatesCount = await prisma.affiliateConversion.groupBy({
      by: ['affiliateId'],
      where: conversionsWhereClause,
    });

    // Total Earned Stats
    const totalEarnedWhereClause: Prisma.AffiliateConversionWhereInput = {};
    if (affiliateId) totalEarnedWhereClause.affiliateId = affiliateId;
    if (startDate) totalEarnedWhereClause.createdAt = { gte: startDate };

    const totalEarnedStats = await prisma.affiliateConversion.aggregate({
      where: totalEarnedWhereClause,
      _sum: {
        commissionAmount: true
      }
    });

    const totalEarnedAffiliatesCount = await prisma.affiliateConversion.groupBy({
      by: ['affiliateId'],
      where: totalEarnedWhereClause,
    });

    // Transform payouts data to match expected frontend structure
    const transformedPayouts = payouts.map(payout => ({
      id: payout.id,
      amountDue: Number(payout.amountDue),
      status: payout.status,
      paidAt: payout.paidAt,
      notes: payout.notes,
      createdAt: payout.createdAt,
      affiliate: {
        id: payout.affiliateId,
        name: payout.affiliate?.name || 'Unknown',
        email: payout.affiliate?.email || 'Unknown',
        referralCode: payout.affiliate?.referralCode || 'Unknown',
      },
    }));

    // If affiliateId is provided, also fetch commission hold details
    let commissionHoldInfo = null;
    if (affiliateId) {
      try {
        // Get commission hold period from settings
        const setting = await prisma.settings.findUnique({
          where: { key: 'commission_hold_days' }
        });
        const holdDays = setting?.value ? parseInt(setting.value as string) : 30;

        // Get held commissions for this affiliate
        const heldCommissions = await prisma.affiliateConversion.findMany({
          where: {
            affiliateId: affiliateId,
            commissionStatus: 'held',
            commissionAmount: {
              gt: 0
            }
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        commissionHoldInfo = {
          holdDays,
          heldCommissions: heldCommissions.map(conv => ({
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
          totalAmount: Number(summaryStats._sum.amountDue) || 0,
          totalCount: summaryStats._count || 0,
          completedAmount: Number(completedStats._sum.amountDue) || 0,
          completedCount: completedStats._count || 0,
          // Use held commissions for pending (commissions waiting for hold period)
          pendingAmount: Number(heldCommissionsStats._sum.commissionAmount) || 0,
          pendingCount: heldAffiliatesCount.length || 0,
          // Total earned by all affiliates
          totalEarned: Number(totalEarnedStats._sum.commissionAmount) || 0,
          totalAffiliates: totalEarnedAffiliatesCount.length || 0,
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
