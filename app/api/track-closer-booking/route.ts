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

    // Debug: Log the full Calendly event structure
    console.log("🔍 Full Calendly event structure:", JSON.stringify(calendlyEvent, null, 2));

    if (!closerId) {
      console.log("No closer ID provided for booking");
      return NextResponse.json({ success: true, message: "Booking tracked (no closer)" });
    }

    // Extract customer details from Calendly event
    let customerName = 'Unknown';
    let customerEmail = 'unknown@example.com';
    let customerPhone = null;
    let scheduledAt = new Date();
    let calendlyEventId = `manual-${Date.now()}`;

    // If we have URIs, try to fetch the actual data
    if (calendlyEvent?.invitee?.uri) {
      try {
        console.log("🔍 Fetching invitee data from:", calendlyEvent.invitee.uri);
        const inviteeResponse = await fetch(calendlyEvent.invitee.uri);
        if (inviteeResponse.ok) {
          const inviteeData = await inviteeResponse.json();
          customerName = inviteeData.resource?.name || 'Unknown';
          customerEmail = inviteeData.resource?.email || 'unknown@example.com';
          customerPhone = inviteeData.resource?.phone_number || null;
          console.log("✅ Fetched invitee data:", { customerName, customerEmail });
        }
      } catch (error) {
        console.error("❌ Error fetching invitee data:", error);
      }
    }

    // If we have scheduled event URI, try to fetch the scheduled time
    if (calendlyEvent?.event?.uri) {
      try {
        console.log("🔍 Fetching scheduled event data from:", calendlyEvent.event.uri);
        const eventResponse = await fetch(calendlyEvent.event.uri);
        if (eventResponse.ok) {
          const eventData = await eventResponse.json();
          scheduledAt = eventData.resource?.start_time ? 
            new Date(eventData.resource.start_time) : 
            new Date();
          calendlyEventId = eventData.resource?.uri?.split('/').pop() || `manual-${Date.now()}`;
          console.log("✅ Fetched event data:", { scheduledAt, calendlyEventId });
        }
      } catch (error) {
        console.error("❌ Error fetching event data:", error);
      }
    }

    console.log("📝 Extracted booking details:", {
      customerName,
      customerEmail,
      scheduledAt,
      calendlyEventId
    });

    // Try to find the closer with timeout
    let closer;
    try {
      const closerPromise = prisma.closer.findUnique({
        where: { id: closerId },
        select: {
          id: true,
          name: true,
          isActive: true,
        }
      });

      // Add timeout to prevent hanging
      closer = await Promise.race([
        closerPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database timeout')), 5000)
        )
      ]);
    } catch (dbError) {
      console.error("❌ Database error finding closer:", dbError);
      // Return success even if database fails - we don't want to break the booking
      return NextResponse.json({ 
        success: true, 
        message: "Booking tracked (database temporarily unavailable)",
        closerId,
        customerName,
        scheduledAt: scheduledAt.toISOString()
      });
    }

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

    // Try to create appointment with timeout
    let appointment;
    try {
      const appointmentPromise = prisma.appointment.create({
        data: {
          closerId: closer.id,
          calendlyEventId,
          customerName,
          customerEmail,
          customerPhone,
          scheduledAt,
          duration: 30,
          status: 'scheduled' as any, // Use string instead of enum to avoid database issues
          affiliateCode: affiliateCode || null,
        },
      });

      appointment = await Promise.race([
        appointmentPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database timeout')), 5000)
        )
      ]);

      console.log("✅ Appointment created:", appointment.id);
    } catch (dbError) {
      console.error("❌ Database error creating appointment:", dbError);
      // Return success even if appointment creation fails
      return NextResponse.json({ 
        success: true, 
        message: "Booking tracked (appointment creation failed)",
        closer: {
          name: closer.name,
          id: closer.id,
        },
        customerName,
        scheduledAt: scheduledAt.toISOString()
      });
    }

    // Try to update closer's total calls with timeout
    try {
      const updatePromise = prisma.closer.update({
        where: { id: closer.id },
        data: {
          totalCalls: {
            increment: 1,
          },
        },
      });

      await Promise.race([
        updatePromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database timeout')), 5000)
        )
      ]);

      console.log("✅ Closer total calls updated");
    } catch (dbError) {
      console.error("❌ Database error updating closer calls:", dbError);
      // Don't fail the whole request for this
    }

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
    return NextResponse.json({ 
      success: true, // Return success to not break the booking flow
      message: "Booking tracked (closer assignment failed)",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
