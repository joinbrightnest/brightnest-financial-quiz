import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const referralCode = searchParams.get("referralCode");

    if (!referralCode) {
      return NextResponse.json({ error: "Referral code is required" }, { status: 400 });
    }

    console.log("Fetching affiliate data for:", referralCode);

    // Find affiliate by referral code
    const affiliate = await prisma.affiliate.findUnique({
      where: { referralCode: referralCode },
    });

    if (!affiliate) {
      return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
    }

    // Get clicks and conversions for this affiliate
    const [clicks, conversions] = await Promise.all([
      prisma.affiliateClick.findMany({
        where: { affiliateId: affiliate.id },
        orderBy: { createdAt: "desc" },
        take: 10
      }).catch(() => []),
      prisma.affiliateConversion.findMany({
        where: { affiliateId: affiliate.id },
        orderBy: { createdAt: "desc" },
        take: 10
      }).catch(() => [])
    ]);

    // Calculate stats
    const totalClicks = clicks.length;
    const totalLeads = conversions.filter(c => c.status === "confirmed").length;
    const totalBookings = conversions.filter(c => c.conversionType === "booking").length;
    const totalSales = conversions.filter(c => c.conversionType === "sale").length;
    const totalCommission = conversions.reduce((sum, c) => sum + Number(c.commissionAmount || 0), 0);
    const conversionRate = totalClicks > 0 ? (totalSales / totalClicks) * 100 : 0;

    const stats = {
      totalClicks,
      totalLeads,
      totalBookings,
      totalSales,
      totalCommission,
      conversionRate,
      averageSaleValue: totalSales > 0 ? totalCommission / totalSales : 0,
      pendingCommission: 0,
      paidCommission: 0,
      dailyStats: []
    };

    return NextResponse.json({
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        tier: affiliate.tier,
        referralCode: affiliate.referralCode,
        customLink: affiliate.customLink,
        commissionRate: affiliate.commissionRate,
        totalClicks: affiliate.totalClicks,
        totalLeads: affiliate.totalLeads,
        totalBookings: affiliate.totalBookings,
        totalSales: affiliate.totalSales,
        totalCommission: affiliate.totalCommission,
        isApproved: affiliate.isApproved,
        createdAt: affiliate.createdAt,
        updatedAt: affiliate.updatedAt
      },
      stats,
      clicks: clicks.map(click => ({
        id: click.id,
        createdAt: click.createdAt,
        ipAddress: click.ipAddress
      })),
      conversions: conversions.map(conv => ({
        id: conv.id,
        conversionType: conv.conversionType,
        status: conv.status,
        createdAt: conv.createdAt,
        value: String(conv.value || '')
      }))
    });

  } catch (error) {
    console.error("Error fetching affiliate data:", error);
    return NextResponse.json(
      { error: "Failed to fetch affiliate data", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
