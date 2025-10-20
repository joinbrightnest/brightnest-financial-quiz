import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { calculateLeadsByCode, calculateLeadsWithDateRange } from "@/lib/lead-calculation";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const affiliateCode = searchParams.get('affiliateCode');
  const dateRange = searchParams.get('dateRange') || '30d';

  if (!affiliateCode) {
    return NextResponse.json({ error: "Affiliate code is required" }, { status: 400 });
  }

  try {
    console.log('Admin affiliate stats request:', { affiliateCode, dateRange });
    // First try to find by referral code
    let affiliate = await prisma.affiliate.findUnique({
      where: { referralCode: affiliateCode },
    });

    // If not found, try to find by custom tracking link
    if (!affiliate) {
      const affiliateResult = await prisma.$queryRaw`
        SELECT * FROM "affiliates" 
        WHERE "custom_tracking_link" = ${`/${affiliateCode}`}
        LIMIT 1
      `;
      
      affiliate = Array.isArray(affiliateResult) && affiliateResult.length > 0 
        ? affiliateResult[0] 
        : null;
    }

    if (!affiliate) {
      return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
    }
    
    const [clicks, conversions, quizSessions] = await Promise.all([
      prisma.affiliateClick.findMany({
        where: { affiliateId: affiliate.id },
        orderBy: { createdAt: "desc" },
        take: 10
      }),
      prisma.affiliateConversion.findMany({
        where: { affiliateId: affiliate.id },
        orderBy: { createdAt: "desc" },
        take: 10
      }),
      prisma.quizSession.findMany({
        where: { affiliateCode: affiliateCode },
        orderBy: { createdAt: "desc" },
        take: 10
      })
    ]);

    const totalClicks = clicks.length;
    const totalQuizStarts = quizSessions.length;
    const leadData = await calculateLeadsByCode(affiliateCode, dateRange);
    const totalLeads = leadData.totalLeads;
    const totalBookings = conversions.filter((c) => c.conversionType === "booking").length;
    const totalSales = conversions.filter((c) => c.conversionType === "sale").length;
    const totalCommission = affiliate.totalCommission || 0; // Use database field instead of calculating from conversions
    const conversionRate = totalClicks > 0 ? (totalSales / totalClicks) * 100 : 0;

    // Generate daily stats from real data using centralized lead calculation
    const dailyStats = await generateDailyStatsFromRealData(clicks, conversions, dateRange, affiliateCode);
    
    const affiliateData = {
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        tier: affiliate.tier,
        referralCode: affiliate.referralCode,
        customLink: affiliate.customLink || `https://joinbrightnest.com/${affiliate.referralCode}`,
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
        totalQuizStarts,
        totalLeads,
        totalBookings,
        totalSales,
        totalCommission,
        conversionRate,
        averageSaleValue: totalSales > 0 ? Number(totalCommission) / totalSales : 0,
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

    return NextResponse.json(affiliateData);

  } catch (error) {
    console.error("Error fetching affiliate data:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Failed to fetch affiliate data" },
      { status: 500 }
    );
  }
}

async function generateDailyStatsFromRealData(clicks: any[], conversions: any[], dateRange: string, affiliateCode: string) {
  const stats = [];
  
  // Get affiliate info for commission rate
  const affiliate = await prisma.affiliate.findUnique({
    where: { referralCode: affiliateCode },
  });

  if (!affiliate) {
    return [];
  }
  
  if (dateRange === "1d") {
    // For 24 hours, show hourly data for the last 24 hours
    for (let i = 23; i >= 0; i--) {
      const date = new Date();
      date.setHours(date.getHours() - i);
      const dateStr = date.toISOString().split('T')[0];
      const hourStr = date.getHours().toString().padStart(2, '0');
      
      const hourClicks = clicks.filter(c => {
        const clickDate = c.createdAt.toISOString().split('T')[0];
        const clickHour = c.createdAt.getHours().toString().padStart(2, '0');
        return clickDate === dateStr && clickHour === hourStr;
      });
      
      const hourConversions = conversions.filter(c => {
        const convDate = c.createdAt.toISOString().split('T')[0];
        const convHour = c.createdAt.getHours().toString().padStart(2, '0');
        return convDate === dateStr && convHour === hourStr;
      });
      
      // Get appointments that were converted in this hour
      const hourStart = new Date(date);
      hourStart.setHours(date.getHours(), 0, 0, 0);
      const hourEnd = new Date(date);
      hourEnd.setHours(date.getHours(), 59, 59, 999);
      
      const hourAppointments = await prisma.appointment.findMany({
        where: {
          affiliateCode: affiliateCode,
          outcome: 'converted',
          updatedAt: {
            gte: hourStart,
            lte: hourEnd,
          },
        },
      }).catch((error) => {
        console.error('Error fetching hour appointments:', error);
        return [];
      });

      // Calculate commission from appointments (actual sales)
      const hourCommission = hourAppointments.reduce((sum, apt) => {
        const saleValue = Number(apt.saleValue || 0);
        return sum + (saleValue * Number(affiliate.commissionRate));
      }, 0);
      
      // Calculate real leads for this hour using centralized function
      const hourLeadData = await calculateLeadsWithDateRange(hourStart, hourEnd, undefined, affiliateCode);
      
      stats.push({
        date: `${dateStr}T${hourStr}:00:00.000Z`, // Include hour for proper sorting
        clicks: hourClicks.length,
        leads: hourLeadData.totalLeads,
        bookedCalls: hourConversions.filter(c => c.conversionType === "booking").length,
        commission: hourCommission,
      });
    }
  } else {
    // For other timeframes, show daily data
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 365;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayClicks = clicks.filter(c => c.createdAt.toISOString().split('T')[0] === dateStr);
      const dayConversions = conversions.filter(c => c.createdAt.toISOString().split('T')[0] === dateStr);
      
      // Get appointments that were converted on this day
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayAppointments = await prisma.appointment.findMany({
        where: {
          affiliateCode: affiliateCode,
          outcome: 'converted',
          updatedAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      }).catch((error) => {
        console.error('Error fetching day appointments:', error);
        return [];
      });

      // Calculate commission from appointments (actual sales)
      const dayCommission = dayAppointments.reduce((sum, apt) => {
        const saleValue = Number(apt.saleValue || 0);
        return sum + (saleValue * Number(affiliate.commissionRate));
      }, 0);
      
      // Calculate real leads for this day using centralized function
      const dayLeadData = await calculateLeadsWithDateRange(dayStart, dayEnd, undefined, affiliateCode);
      
      stats.push({
        date: dateStr,
        clicks: dayClicks.length,
        leads: dayLeadData.totalLeads,
        bookedCalls: dayConversions.filter(c => c.conversionType === "booking").length,
        commission: dayCommission,
      });
    }
  }
  
  return stats;
}
