import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get all appointments with closer information
    const appointments = await prisma.appointment.findMany({
      orderBy: {
        scheduledAt: 'desc'
      },
      include: {
        closer: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      appointments
    });

  } catch (error) {
    console.error('❌ Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      customerName, 
      customerEmail, 
      customerPhone, 
      scheduledAt, 
      duration, 
      affiliateCode,
      calendlyEventId 
    } = await request.json();

    // Validate required fields
    if (!customerName || !customerEmail || !scheduledAt || !calendlyEventId) {
      return NextResponse.json(
        { error: 'Customer name, email, scheduled time, and event ID are required' },
        { status: 400 }
      );
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        calendlyEventId,
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        scheduledAt: new Date(scheduledAt),
        duration: duration || 30,
        status: 'scheduled',
        affiliateCode: affiliateCode || null,
      },
      include: {
        closer: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    console.log('✅ Appointment created manually:', {
      appointmentId: appointment.id,
      customerName,
      customerEmail,
      scheduledAt: appointment.scheduledAt
    });

    return NextResponse.json({
      success: true,
      appointment
    });

  } catch (error) {
    console.error('❌ Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
