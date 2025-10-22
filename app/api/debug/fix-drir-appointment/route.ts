import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Fix drir's appointment email
    const drirAppointment = await prisma.appointment.findFirst({
      where: {
        customerName: "drir"
      }
    });

    if (drirAppointment) {
      await prisma.appointment.update({
        where: { id: drirAppointment.id },
        data: { customerEmail: "idwi@gmail.com" }
      });

      return NextResponse.json({
        message: "Updated drir's appointment email",
        appointmentId: drirAppointment.id,
        oldEmail: drirAppointment.customerEmail,
        newEmail: "idwi@gmail.com"
      });
    } else {
      return NextResponse.json({
        message: "No drir appointment found"
      });
    }
  } catch (error) {
    console.error("Error fixing drir appointment:", error);
    return NextResponse.json(
      { error: "Failed to fix drir appointment" },
      { status: 500 }
    );
  }
}

