import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Fetching all appointments for testing...");
    
    // Get all appointments with their details
    const appointments = await prisma.appointment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10, // Get last 10 appointments
    });

    console.log("📊 Found appointments:", appointments.length);

    // Format the data for easy reading
    const formattedAppointments = appointments.map(apt => ({
      id: apt.id,
      customerName: apt.customerName,
      customerEmail: apt.customerEmail,
      calendlyEventId: apt.calendlyEventId,
      scheduledAt: apt.scheduledAt.toISOString(),
      status: apt.status,
      outcome: apt.outcome,
      affiliateCode: apt.affiliateCode,
      closerName: apt.closerId || 'No closer assigned',
      createdAt: apt.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      appointments: formattedAppointments,
      total: appointments.length
    });

  } catch (error) {
    console.error("❌ Error fetching appointments:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch appointments", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
