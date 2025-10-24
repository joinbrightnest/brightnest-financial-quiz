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

    // Try to extract customer data from Calendly event payload
    console.log("🔍 Calendly event structure:", JSON.stringify(calendlyEvent, null, 2));
    
    if (calendlyEvent) {
      // Try different possible locations for customer data
      const invitee = calendlyEvent.invitee || calendlyEvent.payload?.invitee;
      const event = calendlyEvent.event || calendlyEvent.payload?.event;
      
      console.log("🔍 Invitee data:", invitee);
      console.log("🔍 Event data:", event);
      
      if (invitee) {
        if (invitee.name && customerName === 'Unknown') {
          customerName = invitee.name;
          console.log("✅ Found customer name in invitee:", customerName);
        }
        if (invitee.email && customerEmail === 'unknown@example.com') {
          customerEmail = invitee.email;
          console.log("✅ Found customer email in invitee:", customerEmail);
        }
        if (invitee.phone_number) {
          customerPhone = invitee.phone_number;
          console.log("✅ Found customer phone in invitee:", customerPhone);
        }
      }
      
      if (event) {
        if (event.start_time) {
          scheduledAt = new Date(event.start_time);
          console.log("✅ Found scheduled time:", scheduledAt);
        }
        if (event.uri) {
          calendlyEventId = event.uri.split('/').pop() || `manual-${Date.now()}`;
          console.log("✅ Found Calendly event ID:", calendlyEventId);
        }
      }
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

    // Try to find existing appointment by Calendly event ID first
    let appointment = null;
    if (calendlyEventId && calendlyEventId !== `manual-${Date.now()}`) {
      appointment = await prisma.appointment.findUnique({
        where: { calendlyEventId }
      });
      
      if (appointment) {
        console.log("✅ Found existing appointment:", appointment.id);
        
        // Update the existing appointment with closer assignment
        appointment = await prisma.appointment.update({
          where: { id: appointment.id },
          data: {
            closerId: closer.id,
            affiliateCode: affiliateCode || appointment.affiliateCode,
          }
        });
        
        console.log("✅ Updated existing appointment with closer assignment");
      }
    }

    // If no existing appointment found, create a new one
    if (!appointment) {
      console.log("📝 Creating new appointment (no existing appointment found)");
      
      appointment = await prisma.appointment.create({
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

      console.log("✅ New appointment created:", appointment.id);
    }
    
    // NOTE: Booking conversion tracking is handled by /api/track-booking
    // This route only handles appointment creation and closer assignment
    // to avoid duplicate booking conversions
    if (affiliateCode) {
      console.log("ℹ️ Affiliate code present, booking conversion handled by /api/track-booking:", affiliateCode);
    }
    
    // Session linking is handled by email matching in the lead status system
    if (sessionId) {
      console.log("✅ Session ID provided for potential linking:", sessionId);
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
