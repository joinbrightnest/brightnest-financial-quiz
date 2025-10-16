import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { closerId, calendlyEvent, affiliateCode } = await request.json();

    console.log("🎯 Closer booking tracked:", {
      closerId,
      calendlyEvent,
      affiliateCode
    });

    if (!closerId) {
      console.log("No closer ID provided for booking");
      return NextResponse.json({ success: true, message: "Booking tracked (no closer)" });
    }

    // Find the closer
    const closer = await prisma.closer.findUnique({
      where: { id: closerId },
    });

    if (!closer || !closer.isActive) {
      console.log("Closer not found or inactive for booking:", closerId);
      return NextResponse.json({ success: true, message: "Booking tracked (closer not found)" });
    }

    // Extract customer details from Calendly event
    const customerName = calendlyEvent?.invitee?.name || 'Unknown';
    const customerEmail = calendlyEvent?.invitee?.email || 'unknown@example.com';
    const customerPhone = calendlyEvent?.invitee?.phone_number || null;
    const scheduledAt = calendlyEvent?.scheduled_event?.start_time ? 
      new Date(calendlyEvent.scheduled_event.start_time) : 
      new Date();
    const calendlyEventId = calendlyEvent?.event?.uuid || `manual-${Date.now()}`;

    // Create appointment and auto-assign to closer
    const appointment = await prisma.appointment.create({
      data: {
        closerId: closer.id,
        calendlyEventId,
        customerName,
        customerEmail,
        customerPhone,
        scheduledAt,
        duration: 30, // Default duration
        status: 'scheduled',
        affiliateCode: affiliateCode || null,
        // UTM parameters can be extracted from Calendly event if available
      },
    });

    // Update closer's total calls
    await prisma.closer.update({
      where: { id: closer.id },
      data: {
        totalCalls: {
          increment: 1,
        },
      },
    });

    console.log("✅ Booking auto-assigned to closer:", closer.name);

    return NextResponse.json({ 
      success: true, 
      message: "Booking auto-assigned to closer successfully",
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
    return NextResponse.json({ error: "Failed to track closer booking" }, { status: 500 });
  }
}
