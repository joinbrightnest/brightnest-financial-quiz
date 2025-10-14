import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const affiliateCode = searchParams.get('affiliateCode');

  if (!affiliateCode) {
    return NextResponse.json({ error: "Affiliate code is required" }, { status: 400 });
  }

  try {
    console.log("Looking for affiliate with code:", affiliateCode);
    
    const affiliate = await prisma.affiliate.findUnique({
      where: { referralCode: affiliateCode },
    });

    console.log("Affiliate lookup result:", affiliate ? "Found" : "Not found");
    
    if (!affiliate) {
      return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
    }

    console.log("Found affiliate:", affiliate.id, affiliate.referralCode, affiliate.name);
    
    const [clicks, conversions] = await Promise.all([
      prisma.affiliateClick.findMany({
        where: { affiliateId: affiliate.id },
        orderBy: { createdAt: "desc" },
        take: 10
      }),
      prisma.affiliateConversion.findMany({
        where: { affiliateId: affiliate.id },
        orderBy: { createdAt: "desc" },
        take: 10
      })
    ]);
    
    console.log("Retrieved clicks:", clicks.length, "conversions:", conversions.length);

    const totalClicks = clicks.length;
    const totalLeads = conversions.filter((c) => c.status === "confirmed").length;
    const totalBookings = conversions.filter((c) => c.conversionType === "booking").length;
    const totalSales = conversions.filter((c) => c.conversionType === "sale").length;
    const totalCommission = conversions.reduce((sum, c) => sum + Number(c.commissionAmount || 0), 0);
    const conversionRate = totalClicks > 0 ? (totalSales / totalClicks) * 100 : 0;

    const affiliateData = {
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        tier: affiliate.tier,
        referralCode: affiliate.referralCode,
        customLink: `https://joinbrightnest.com/${affiliate.referralCode}`,
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
      stats: {
        totalClicks,
        totalLeads,
        totalBookings,
        totalSales,
        totalCommission,
        conversionRate,
        averageSaleValue: totalSales > 0 ? totalCommission / totalSales : 0,
        pendingCommission: 0,
        paidCommission: 0,
        dailyStats: [],
      },
      clicks: clicks.map((click) => ({
        id: click.id,
        createdAt: click.createdAt,
        ipAddress: click.ipAddress,
        userAgent: click.userAgent
      })),
      conversions: conversions.map((conv) => ({
        id: conv.id,
        conversionType: conv.conversionType,
        status: conv.status,
        createdAt: conv.createdAt,
        value: conv.saleValue
      }))
    };

    console.log("✅ Affiliate data created successfully");
    return NextResponse.json(affiliateData);

  } catch (error) {
    console.error("Error fetching affiliate data:", error);
    console.error("Error details:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch affiliate data" },
      { status: 500 }
    );
  }
}
