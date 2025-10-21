import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { closerId, calendlyEvent, affiliateCode, customerData, sessionId } = await request.json();

    console.log("🎯 Closer booking tracked:", {
      closerId,
      calendlyEvent,
      affiliateCode,
      sessionId
    });

    if (!closerId) {
      console.log("No closer ID provided for booking");
      return NextResponse.json({ success: true, message: "Booking tracked (no closer)" });
    }

    // Extract customer details
    let customerName = 'Unknown';
    let customerEmail = 'unknown@example.com';
    let customerPhone = null;
    let scheduledAt = new Date();
    let calendlyEventId = `manual-${Date.now()}`;

    // Use customer data from the form if available
    if (customerData?.name) {
      customerName = customerData.name;
      console.log("✅ Using customer name from form:", customerName);
    }
    if (customerData?.email) {
      customerEmail = customerData.email;
      console.log("✅ Using customer email from form:", customerEmail);
    }

    // Try to extract customer data from Calendly event
    if (calendlyEvent?.invitee?.name && customerName === 'Unknown') {
      customerName = calendlyEvent.invitee.name;
      console.log("✅ Found customer name in event:", customerName);
    }
    if (calendlyEvent?.invitee?.email && customerEmail === 'unknown@example.com') {
      customerEmail = calendlyEvent.invitee.email;
      console.log("✅ Found customer email in event:", customerEmail);
    }

    console.log("📝 Final booking details:", {
      customerName,
      customerEmail,
      scheduledAt,
      calendlyEventId
    });

    // Find the closer
    const closer = await prisma.closer.findUnique({
      where: { id: closerId },
      select: {
        id: true,
        name: true,
        isActive: true,
      }
    });

    if (!closer || !closer.isActive) {
      console.log("Closer not found or inactive for booking:", closerId);
      return NextResponse.json({ 
        success: true, 
        message: "Booking tracked (closer not found)",
        closerId,
        customerName,
        scheduledAt: scheduledAt.toISOString()
      });
    }

    console.log("✅ Found closer:", closer.name);

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        closerId: closer.id,
        calendlyEventId,
        customerName,
        customerEmail,
        customerPhone,
        scheduledAt,
        duration: 30,
        status: 'scheduled',
        affiliateCode: affiliateCode || null,
      },
    });

    console.log("✅ Appointment created:", appointment.id);
    
    // Track affiliate conversion using existing logic if affiliate code is provided
    if (affiliateCode) {
      try {
        console.log("🎯 Tracking affiliate conversion for booking:", affiliateCode);
        
        // Find the affiliate
        const affiliate = await prisma.affiliate.findUnique({
          where: { referralCode: affiliateCode },
        });

        if (affiliate && affiliate.isActive) {
          // Record the booking conversion (same logic as track-booking API)
          await prisma.affiliateConversion.create({
            data: {
              affiliateId: affiliate.id,
              referralCode: affiliateCode,
              conversionType: "booking",
              status: "confirmed",
              commissionAmount: 0.00, // No commission for booking, only for sales
              saleValue: 0.00,
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

          console.log("✅ Affiliate booking conversion tracked:", affiliateCode);
        } else {
          console.log("⚠️ Affiliate not found or inactive:", affiliateCode);
        }
      } catch (error) {
        console.error("❌ Error tracking affiliate conversion:", error);
        // Don't fail the whole booking if affiliate tracking fails
      }
    }
    
    // Try to link to quiz session if sessionId is provided
    if (sessionId) {
      try {
        const quizSession = await prisma.quizSession.findUnique({
          where: { id: sessionId }
        });
        
        if (quizSession && quizSession.status === 'completed') {
          console.log("✅ Found quiz session for linking:", quizSession.id);
          // Note: We'll link by email matching since direct sessionId relation needs schema update
          console.log("✅ Session linking will be handled by email matching");
        } else {
          console.log("⚠️ Session not found or not completed:", sessionId);
        }
      } catch (error) {
        console.error("❌ Error linking to session:", error);
      }
    }

    // Update closer's total calls
    await prisma.closer.update({
      where: { id: closer.id },
      data: {
        totalCalls: {
          increment: 1,
        },
      },
    });

    console.log("✅ Closer total calls updated");

    return NextResponse.json({ 
      success: true, 
      message: "Booking tracked successfully",
      appointment: {
        id: appointment.id,
        customerName: appointment.customerName,
        scheduledAt: appointment.scheduledAt,
      },
      closer: {
        name: closer.name,
        id: closer.id,
      }
    });

  } catch (error) {
    console.error("❌ Error tracking closer booking:", error);
    return NextResponse.json({ 
      success: true, // Return success to not break the booking flow
      message: "Booking tracked (error occurred)",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
