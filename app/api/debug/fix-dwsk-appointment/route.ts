import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Manually fix dwsk's appointment email
    const dwskAppointment = await prisma.appointment.findFirst({
      where: {
        customerName: "dwsk"
      }
    });

    if (dwskAppointment) {
      await prisma.appointment.update({
        where: { id: dwskAppointment.id },
        data: { customerEmail: "kkk@gmia.co" }
      });

      return NextResponse.json({
        message: "Updated dwsk's appointment email",
        appointmentId: dwskAppointment.id,
        oldEmail: dwskAppointment.customerEmail,
        newEmail: "kkk@gmia.co"
      });
    } else {
      return NextResponse.json({
        message: "No dwsk appointment found"
      });
    }
  } catch (error) {
    console.error("Error fixing dwsk appointment:", error);
    return NextResponse.json(
      { error: "Failed to fix dwsk appointment" },
      { status: 500 }
    );
  }
}

