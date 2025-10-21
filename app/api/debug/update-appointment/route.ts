import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { appointmentId, customerName, customerEmail } = await request.json();
    
    console.log("🔧 Manual appointment update:", {
      appointmentId,
      customerName,
      customerEmail
    });

    if (!appointmentId) {
      return NextResponse.json(
        { error: "appointmentId is required" },
        { status: 400 }
      );
    }

    // Find the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Update the appointment with correct customer data
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        customerName: customerName || appointment.customerName,
        customerEmail: customerEmail || appointment.customerEmail,
      }
    });

    console.log("✅ Appointment updated:", {
      id: updatedAppointment.id,
      customerName: updatedAppointment.customerName,
      customerEmail: updatedAppointment.customerEmail
    });

    return NextResponse.json({
      success: true,
      message: "Appointment updated successfully",
      appointment: {
        id: updatedAppointment.id,
        customerName: updatedAppointment.customerName,
        customerEmail: updatedAppointment.customerEmail
      }
    });

  } catch (error) {
    console.error("❌ Error updating appointment:", error);
    return NextResponse.json(
      { 
        error: "Failed to update appointment", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
