import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { affiliateCode, bookingDetails, sessionId } = await request.json();

    console.log("🎯 Booking tracked:", {
      affiliateCode,
      bookingDetails,
      sessionId
    });

    if (!affiliateCode) {
      console.log("No affiliate code provided for booking");
      return NextResponse.json({ success: true, message: "Booking tracked (no affiliate)" });
    }

    // Find the affiliate
    const affiliate = await prisma.affiliate.findUnique({
      where: { referralCode: affiliateCode },
    });

    if (!affiliate || !affiliate.isActive) {
      console.log("Affiliate not found or inactive for booking:", affiliateCode);
      return NextResponse.json({ success: true, message: "Booking tracked (affiliate not found)" });
    }

    // Get commission hold days from settings
    let commissionHoldDays = 30; // Default fallback
    try {
      const holdDaysResult = await prisma.$queryRaw`
        SELECT value FROM "Settings" WHERE key = 'commission_hold_days'
      ` as any[];
      if (holdDaysResult.length > 0) {
        commissionHoldDays = parseInt(holdDaysResult[0].value);
      }
    } catch (error) {
      console.log('Using default commission hold days:', commissionHoldDays);
    }

    // Calculate hold until date
    const holdUntil = new Date();
    holdUntil.setDate(holdUntil.getDate() + commissionHoldDays);

    // Check if a booking conversion already exists for this affiliate (prevent duplicates)
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const existingBookingConversion = await prisma.affiliateConversion.findFirst({
      where: {
        affiliateId: affiliate.id,
        conversionType: "booking",
        createdAt: {
          gte: thirtySecondsAgo
        }
      }
    });

    if (existingBookingConversion) {
      console.log("⚠️ Booking conversion already exists, skipping duplicate:", existingBookingConversion.id);
      return NextResponse.json({ success: true, message: "Booking already tracked (duplicate)" });
    }

    // Record the booking conversion with quiz session link
    await prisma.affiliateConversion.create({
      data: {
        affiliateId: affiliate.id,
        quizSessionId: sessionId || null, // Link to quiz session if available
        referralCode: affiliateCode,
        conversionType: "booking",
        status: "confirmed",
        commissionAmount: 0.00, // No commission for booking, only for sales
        saleValue: 0.00,
        commissionStatus: "held",
        holdUntil: holdUntil,
      },
    });

    // Update affiliate's total bookings
    await prisma.affiliate.update({
      where: { id: affiliate.id },
      data: {
        totalBookings: {
          increment: 1,
        },
      },
    });

    console.log("✅ Booking conversion tracked for affiliate:", affiliateCode);

    return NextResponse.json({
      success: true,
      message: "Booking tracked successfully",
      affiliate: {
        name: affiliate.name,
        referralCode: affiliate.referralCode,
      }
    });

  } catch (error) {
    console.error("❌ Error tracking booking:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to track booking",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
