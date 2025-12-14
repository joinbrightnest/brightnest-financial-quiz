import { NextRequest, NextResponse } from "next/server";
import { CallOutcome, AffiliateClick, AffiliateConversion, AffiliatePayout, Appointment } from "@prisma/client";
import { calculateLeadsByCode, calculateLeadsWithDateRange } from "@/lib/lead-calculation";
import { prisma } from "@/lib/prisma";
import { dateRangeSchema, parseQueryParams } from "@/lib/validation";
import { z } from 'zod';
import { getAffiliateIdFromToken } from "../auth-utils";

// Schema for affiliate stats query params
const affiliateOwnStatsSchema = z.object({
  dateRange: dateRangeSchema.optional(),
});

export async function GET(request: NextRequest) {
  try {
    // 🔒 SECURITY: Use auth-utils for token extraction (supports cookie + header)
    const affiliateId = getAffiliateIdFromToken(request);
    if (!affiliateId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    // 🛡️ Validate query parameters
    const validation = parseQueryParams(affiliateOwnStatsSchema, searchParams);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { dateRange = '30d' } = validation.data;

    // Calculate date filter
    const now = new Date();
    let startDate: Date;

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
      case "all":
        startDate = new Date(0); // All time
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days
    }

    // Get affiliate data (without includes to avoid issues)
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Set upper bound for date filtering (current time) - SAME as admin API line 76
    const endDate = new Date();

    // Get related data separately with error handling
    let clicks: AffiliateClick[] = [];
    let conversions: AffiliateConversion[] = [];
    let payouts: AffiliatePayout[] = [];

    try {
      [clicks, conversions, payouts] = await Promise.all([
        prisma.affiliateClick.findMany({
          where: {
            affiliateId: affiliate.id,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }).catch(() => []),
        prisma.affiliateConversion.findMany({
          where: {
            affiliateId: affiliate.id,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }).catch(() => []),
        // Payouts should not be date-filtered - we want all-time pending/paid commission
        prisma.affiliatePayout.findMany({
          where: {
            affiliateId: affiliate.id,
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

    // Calculate stats using the SAME logic as admin API for consistency
    const totalClicks = affiliateWithData.clicks.length;

    // Calculate Total Leads using centralized lead calculation (same as admin API line 115-116)
    const leadsData = await calculateLeadsByCode(affiliate.referralCode, dateRange);
    const totalLeads = leadsData.totalLeads;

    const totalBookings = affiliateWithData.conversions.filter(c => c.conversionType === "booking").length;

    // Count sales from AffiliateConversion records (SAME as admin API line 118)
    // This matches the admin API's approach exactly
    const totalSales = affiliateWithData.conversions.filter(c => c.conversionType === "sale").length;

    // Conversion rate should be click-to-booking rate (matches admin API)
    // This represents the percentage of clicks that resulted in booked calls
    const conversionRate = totalClicks > 0 ? (totalBookings / totalClicks) * 100 : 0;

    // NOTE: Commission is calculated from AffiliateConversion records (source of truth)
    // Appointments are not used for commission calculation, but we fetch them for consistency
    // Admin API uses updatedAt (when appointment was converted), but we use conversion records instead
    // which is more accurate since conversion records are created when the deal is actually closed
    const dateFilteredAppointments: Appointment[] = []; // Not used for commission, but kept for API consistency

    // Calculate pending and paid commissions from filtered payouts
    const pendingCommission = affiliateWithData.payouts
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + Number(p.amountDue || 0), 0);

    const paidCommission = affiliateWithData.payouts
      .filter(p => p.status === "completed")
      .reduce((sum, p) => sum + Number(p.amountDue || 0), 0);

    // Generate daily stats from real data - SAME as admin API (line 149)
    // Pass the same appointment data and lead data to ensure consistency between card and graph
    const dailyStats = await generateDailyStatsFromRealData(
      affiliateWithData.clicks,
      affiliateWithData.conversions,
      dateRange,
      affiliate.referralCode,
      dateFilteredAppointments,
      leadsData
    );

    // Calculate date-filtered commission from daily stats
    // This commission respects the selected date range (24h, 7d, 30d, etc.)
    const totalCommission = dailyStats.reduce((sum, day) => sum + day.commission, 0);

    const stats = {
      totalClicks,
      totalLeads,
      totalBookings,
      totalSales,
      totalCommission, // Use date-filtered commission (respects time period)
      conversionRate,
      averageSaleValue: totalSales > 0 ? totalCommission / totalSales : 0,
      pendingCommission,
      paidCommission,
      dailyStats,
    };

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error("Affiliate stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

async function generateDailyStatsFromRealData(clicks: AffiliateClick[], conversions: AffiliateConversion[], dateRange: string, affiliateCode: string, cardAppointments?: Appointment[], preCalculatedLeadData?: { leads: Record<string, unknown>[] }) {
  const stats = [];

  // Get affiliate info for commission rate
  const affiliate = await prisma.affiliate.findUnique({
    where: { referralCode: affiliateCode },
  });

  if (!affiliate) {
    return [];
  }

  // Calculate date ranges for optimization
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const startOfWeek = new Date(now);
  const dayOfWeek = now.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(now.getDate() - daysToMonday);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // NOTE: Commission is calculated from AffiliateConversion records (source of truth)
  // Appointments are not used for commission calculation - conversion records are more accurate
  // since they're created when the deal is actually closed, not when the appointment was booked
  const convertedAppointments: Appointment[] = []; // Not used - commission comes from conversion records

  // Use pre-calculated lead data if provided, otherwise fetch it
  const allLeadsData = preCalculatedLeadData || await calculateLeadsByCode(affiliateCode, dateRange);

  if (dateRange === "24h") {
    // For 24 hours, show hourly data for the last 24 hours
    const now = new Date();

    for (let i = 23; i >= 0; i--) {
      const hourTimestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourStart = new Date(hourTimestamp);
      hourStart.setMinutes(0, 0, 0);
      const hourEnd = new Date(hourTimestamp);
      hourEnd.setMinutes(59, 59, 999);

      const hourLabel = `${hourTimestamp.getHours().toString().padStart(2, '0')}:00`;

      const hourClicks = clicks.filter(c => {
        const clickDate = new Date(c.createdAt);
        return clickDate >= hourStart && clickDate <= hourEnd;
      });

      const hourConversions = conversions.filter(c => {
        const convDate = new Date(c.createdAt);
        return convDate >= hourStart && convDate <= hourEnd;
      });

      // Filter sale conversions for this specific hour (SOURCE OF TRUTH for commission)
      // CRITICAL: Use AffiliateConversion.createdAt (when conversion record was created = when deal CLOSED)
      // NOT Appointment.updatedAt (changes on ANY field update) or Appointment.createdAt (when call was booked)
      const hourSaleConversions = conversions.filter(c => {
        const closeDate = new Date(c.createdAt); // When the conversion was recorded
        return c.conversionType === 'sale' && closeDate >= hourStart && closeDate <= hourEnd;
      });

      // Calculate commission from sale conversion records
      const hourCommission = hourSaleConversions.reduce((sum, conv) => {
        const commissionAmount = Number(conv.commissionAmount || 0);
        return sum + commissionAmount;
      }, 0);

      // Filter leads data for this specific hour
      const hourLeads = allLeadsData.leads.filter((lead: Record<string, unknown>) => {
        const leadDate = new Date(lead.createdAt as string);
        return leadDate >= hourStart && leadDate <= hourEnd;
      });

      stats.push({
        date: hourLabel,
        clicks: hourClicks.length,
        leads: hourLeads.length,
        bookedCalls: hourConversions.filter(c => c.conversionType === "booking").length,
        commission: hourCommission,
      });
    }
  } else {
    // For all other date ranges - show daily data
    const now = new Date();
    let days: number;

    switch (dateRange) {
      case "7d":
        days = 7;
        break;
      case "30d":
        days = 30;
        break;
      case "90d":
        days = 90;
        break;
      case "1y":
        days = 365;
        break;
      case "all":
        // Show last 90 days for "all time" to keep it manageable
        days = 90;
        break;
      default:
        days = 30;
    }

    console.log(`📅 Generating ${days} days of data for dateRange: ${dateRange}`);

    // Iterate through days from oldest to newest
    for (let i = 0; i < days; i++) {
      const daysAgo = days - 1 - i; // Count backwards from most recent day
      const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      // Don't go beyond the current time
      if (dayEnd > now) {
        dayEnd.setTime(now.getTime());
      }

      const dateStr = date.toISOString().split('T')[0];

      // Filter data for this specific day using time ranges
      const dayClicks = clicks.filter(c => {
        const clickDate = new Date(c.createdAt);
        return clickDate >= dayStart && clickDate <= dayEnd;
      });

      const dayConversions = conversions.filter(c => {
        const convDate = new Date(c.createdAt);
        return convDate >= dayStart && convDate <= dayEnd;
      });

      // Filter sale conversions for this specific day (SOURCE OF TRUTH for commission)
      // CRITICAL: Use AffiliateConversion.createdAt (when conversion record was created = when deal CLOSED)
      // NOT Appointment.updatedAt (changes on ANY field update) or Appointment.createdAt (when call was booked)
      const daySaleConversions = conversions.filter(c => {
        const closeDate = new Date(c.createdAt); // When the conversion was recorded
        return c.conversionType === 'sale' && closeDate >= dayStart && closeDate <= dayEnd;
      });

      // Calculate commission from sale conversion records
      const dayCommission = daySaleConversions.reduce((sum, conv) => {
        const commissionAmount = Number(conv.commissionAmount || 0);
        return sum + commissionAmount;
      }, 0);

      // Filter leads data for this specific day
      const dayLeads = allLeadsData.leads.filter((lead: Record<string, unknown>) => {
        const leadDate = new Date(lead.createdAt as string);
        return leadDate >= dayStart && leadDate <= dayEnd;
      });

      const dayBookings = dayConversions.filter(c => c.conversionType === "booking");

      if (dayBookings.length > 0) {
        console.log(`📊 Day ${dateStr}: ${dayBookings.length} bookings`);
      }

      stats.push({
        date: dateStr,
        clicks: dayClicks.length,
        leads: dayLeads.length,
        bookedCalls: dayBookings.length,
        commission: dayCommission,
      });
    }

    console.log(`📈 Generated ${stats.length} data points, bookings in ${stats.filter(s => s.bookedCalls > 0).length} days`);
  }

  // Ensure graph commission matches card commission for consistency
  const totalCommissionFromAppointments = stats.reduce((sum, stat) => sum + stat.commission, 0);

  // The card now uses appointmentBasedCommission, so graph should match it
  // No need to adjust since both use the same calculation method

  return stats;
}
