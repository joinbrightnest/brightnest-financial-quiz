import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get all appointments (leads) with closer information
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

    // Transform appointments to leads format
    const leads = appointments.map(appointment => ({
      id: appointment.id,
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
      customerPhone: appointment.customerPhone,
      scheduledAt: appointment.scheduledAt.toISOString(),
      status: mapAppointmentStatusToPipelineStatus(appointment.status, appointment.outcome),
      notes: appointment.notes || '',
      saleValue: appointment.saleValue ? Number(appointment.saleValue) : undefined,
      closer: appointment.closer,
      createdAt: appointment.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      leads
    });

  } catch (error) {
    console.error('❌ Error fetching pipeline leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Map appointment status and outcome to pipeline status
function mapAppointmentStatusToPipelineStatus(status: string, outcome: string | null): string {
  // If there's an outcome, use that as the pipeline status
  if (outcome) {
    switch (outcome) {
      case 'converted':
        return 'converted';
      case 'not_interested':
        return 'not_interested';
      case 'needs_follow_up':
        return 'follow_up';
      case 'callback_requested':
        return 'callback_requested';
      case 'rescheduled':
        return 'rescheduled';
      default:
        return 'new';
    }
  }

  // If no outcome, map based on appointment status
  switch (status) {
    case 'scheduled':
    case 'confirmed':
      return 'booked_call';
    case 'completed':
      return 'new'; // Completed but no outcome means it's a new lead
    default:
      return 'new';
  }
}
