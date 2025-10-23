import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { affiliateCode, bookingDetails } = await request.json();

    console.log("🎯 Booking tracked:", {
      affiliateCode,
      bookingDetails
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

    // Record the booking conversion
    await prisma.affiliateConversion.create({
      data: {
        affiliateId: affiliate.id,
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
