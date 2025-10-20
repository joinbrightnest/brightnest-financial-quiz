import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, CallOutcome } from "@prisma/client";
import { calculateLeadsByCode, calculateLeadsWithDateRange } from "@/lib/lead-calculation";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());

    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get("dateRange") || "month";

    // Calculate date filter
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "yesterday":
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
        break;
      case "week":
        // Start of this week (Monday)
        const startOfWeek = new Date(now);
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startOfWeek.setDate(now.getDate() - daysToMonday);
        startDate = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate());
        break;
      case "month":
        // Start of this month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "all":
        startDate = new Date(0); // All time
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days
    }

    // Get affiliate data (without includes to avoid issues)
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: decoded.affiliateId },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Get related data separately with error handling
    let clicks = [];
    let conversions = [];
    let payouts = [];
    
    try {
      [clicks, conversions, payouts] = await Promise.all([
        prisma.affiliateClick.findMany({
          where: {
            affiliateId: affiliate.id,
            createdAt: {
              gte: startDate,
            },
          },
        }).catch(() => []),
        prisma.affiliateConversion.findMany({
          where: {
            affiliateId: affiliate.id,
            createdAt: {
              gte: startDate,
            },
          },
        }).catch(() => []),
        prisma.affiliatePayout.findMany({
          where: {
            affiliateId: affiliate.id,
            createdAt: {
              gte: startDate,
            },
          },
        }).catch(() => []),
      ]);
    } catch (error) {
      console.error("Error fetching related data:", error);
      // Continue with empty arrays if related data fails
    }

    // Combine the data
    const affiliateWithData = {
      ...affiliate,
      clicks,
      conversions,
      payouts,
    };

    // Calculate stats using centralized lead calculation
    const totalClicks = affiliateWithData.clicks.length;
    const leadData = await calculateLeadsByCode(affiliate.referralCode, dateRange);
    const totalLeads = leadData.totalLeads;
    const totalBookings = affiliateWithData.conversions.filter(c => c.conversionType === "booking").length;
    const totalSales = affiliateWithData.conversions.filter(c => c.conversionType === "sale").length;
    const totalCommission = affiliate.totalCommission || 0; // Use database field instead of calculating from conversions
    const conversionRate = totalClicks > 0 ? (totalSales / totalClicks) * 100 : 0;
    const averageSaleValue = totalSales > 0 ? Number(totalCommission) / totalSales : 0;

    // Calculate pending and paid commissions
    const pendingCommission = affiliateWithData.payouts
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + Number(p.amount), 0);
    
    const paidCommission = affiliateWithData.payouts
      .filter(p => p.status === "completed")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Generate daily stats based on actual data
    const dailyStats = await generateDailyStatsWithRealData(affiliate.referralCode, dateRange);

    const stats = {
      totalClicks,
      totalLeads,
      totalBookings,
      totalSales,
      totalCommission,
      conversionRate,
      averageSaleValue,
      pendingCommission,
      paidCommission,
      dailyStats,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Affiliate stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

async function generateDailyStatsWithRealData(affiliateCode: string, dateRange: string) {
  const now = new Date();
  let days: number;
  let startDate: Date;
  
  switch (dateRange) {
    case "today":
      days = 1;
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "yesterday":
      days = 1;
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
      break;
    case "week":
      // Calculate days from start of week to today
      const startOfWeek = new Date(now);
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(now.getDate() - daysToMonday);
      startDate = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate());
      days = Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
      break;
    case "month":
      // Calculate days from start of month to today
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      days = Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
      break;
      case "all":
        // Show last 90 days for "all time" to keep it manageable
        days = 90;
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
    default:
      days = 30;
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  const data = [];

  // Get affiliate info for commission rate
  const affiliate = await prisma.affiliate.findUnique({
    where: { referralCode: affiliateCode },
  });

  if (!affiliate) {
    return [];
  }

  // Fetch all data for the entire date range at once for better performance
  const rangeEnd = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
  
  const [allClicks, allConversions, allAppointments] = await Promise.all([
    prisma.affiliateClick.findMany({
      where: {
        affiliate: { referralCode: affiliateCode },
        createdAt: {
          gte: startDate,
          lte: rangeEnd,
        },
      },
    }),
    prisma.affiliateConversion.findMany({
      where: {
        affiliate: { referralCode: affiliateCode },
        createdAt: {
          gte: startDate,
          lte: rangeEnd,
        },
      },
    }),
    prisma.appointment.findMany({
      where: {
        affiliateCode: affiliateCode,
        updatedAt: {
          gte: startDate,
          lte: rangeEnd,
        },
      },
    }).catch((error) => {
      console.error('Error fetching appointments:', error);
      return [];
    })
  ]);

  // Filter for converted appointments
  const convertedAppointments = allAppointments.filter(apt => apt.outcome === 'converted');

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    const dateStr = date.toISOString().split('T')[0];
    
    // Filter data for this specific day
    const dayClicks = allClicks.filter(c => c.createdAt.toISOString().split('T')[0] === dateStr);
    const dayConversions = allConversions.filter(c => c.createdAt.toISOString().split('T')[0] === dateStr);
    const dayAppointments = convertedAppointments.filter(apt => apt.updatedAt.toISOString().split('T')[0] === dateStr);

    // Calculate commission from appointments (actual sales)
    const dayCommission = dayAppointments.reduce((sum, apt) => {
      const saleValue = Number(apt.saleValue || 0);
      return sum + (saleValue * Number(affiliate.commissionRate));
    }, 0);

    // Calculate real leads for this specific day
    const dayLeadData = await calculateLeadsWithDateRange(dayStart, dayEnd, undefined, affiliateCode);
    
    data.push({
      date: dateStr,
      clicks: dayClicks.length,
      leads: dayLeadData.totalLeads,
      bookedCalls: dayConversions.filter(c => c.conversionType === "booking").length,
      commission: dayCommission,
    });
  }
  
  // If affiliate has commission but no appointments found, distribute it across active days
  const totalCommissionFromAppointments = data.reduce((sum, day) => sum + day.commission, 0);
  if (totalCommissionFromAppointments === 0 && Number(affiliate.totalCommission) > 0) {
    const activeDays = data.filter(day => day.clicks > 0 || day.bookedCalls > 0);
    if (activeDays.length > 0) {
      const commissionPerDay = Number(affiliate.totalCommission) / activeDays.length;
      data.forEach(day => {
        if (day.clicks > 0 || day.bookedCalls > 0) {
          day.commission = commissionPerDay;
        }
      });
    }
  }

  return data;
}
