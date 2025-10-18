import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const affiliateCode = searchParams.get('affiliateCode');
  const dateRange = searchParams.get('dateRange') || '30d';

  if (!affiliateCode) {
    return NextResponse.json({ error: "Affiliate code is required" }, { status: 400 });
  }

  try {
    console.log("Looking for affiliate with code:", affiliateCode);
    
    // First try to find by referral code
    let affiliate = await prisma.affiliate.findUnique({
      where: { referralCode: affiliateCode },
    });

    // If not found, try to find by custom tracking link
    if (!affiliate) {
      console.log("Not found by referral code, trying custom tracking link...");
      const affiliateResult = await prisma.$queryRaw`
        SELECT * FROM "affiliates" 
        WHERE "custom_tracking_link" = ${`/${affiliateCode}`}
        LIMIT 1
      `;
      
      affiliate = Array.isArray(affiliateResult) && affiliateResult.length > 0 
        ? affiliateResult[0] 
        : null;
    }

    console.log("Affiliate lookup result:", affiliate ? "Found" : "Not found");
    
    if (!affiliate) {
      return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
    }

    console.log("Found affiliate:", affiliate.id, affiliate.referral_code || affiliate.referralCode, affiliate.name);
    
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
    const totalLeads = conversions.filter((c) => c.status === "confirmed" && c.conversionType === "quiz_completion").length;
    const totalBookings = conversions.filter((c) => c.conversionType === "booking").length;
    const totalSales = conversions.filter((c) => c.conversionType === "sale").length;
    const totalCommission = conversions.reduce((sum, c) => sum + Number(c.commissionAmount || 0), 0);
    const conversionRate = totalClicks > 0 ? (totalSales / totalClicks) * 100 : 0;

    // Generate daily stats from real data
    const dailyStats = generateDailyStatsFromRealData(clicks, conversions, dateRange);
    
    const affiliateData = {
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        tier: affiliate.tier,
        referralCode: affiliate.referral_code || affiliate.referralCode,
        customLink: affiliate.custom_tracking_link || `https://joinbrightnest.com/${affiliate.referral_code || affiliate.referralCode}`,
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
        dailyStats,
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

function generateDailyStatsFromRealData(clicks: any[], conversions: any[], dateRange: string) {
  const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 365;
  const stats = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayClicks = clicks.filter(c => c.createdAt.toISOString().split('T')[0] === dateStr);
    const dayConversions = conversions.filter(c => c.createdAt.toISOString().split('T')[0] === dateStr);
    const dayBookings = dayConversions.filter(c => c.conversionType === "booking");
    const daySales = dayConversions.filter(c => c.conversionType === "sale");
    const dayCommission = dayConversions.reduce((sum, c) => sum + Number(c.commissionAmount || 0), 0);
    
    stats.push({
      date: dateStr,
      clicks: dayClicks.length,
      leads: dayConversions.filter(c => c.status === "confirmed" && c.conversionType === "quiz_completion").length,
      sales: daySales.length,
      commission: dayCommission,
    });
  }
  
  return stats;
}
