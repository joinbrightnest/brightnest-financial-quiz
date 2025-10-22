import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check appointments for the specific emails from the leads
    const emails = ["kkk@gmia.co", "ion@gmail.com"];
    
    const appointments = await prisma.appointment.findMany({
      where: { 
        customerEmail: { in: emails }
      },
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        status: true,
        outcome: true,
        saleValue: true,
        createdAt: true
      }
    });

    // Also check all appointments to see what emails exist
    const allAppointments = await prisma.appointment.findMany({
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        status: true,
        outcome: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json({
      targetEmails: emails,
      foundAppointments: appointments,
      allAppointments: allAppointments,
      totalAppointments: allAppointments.length
    });
  } catch (error) {
    console.error("Error checking appointments:", error);
    return NextResponse.json(
      { error: "Failed to check appointments" },
      { status: 500 }
    );
  }
}

