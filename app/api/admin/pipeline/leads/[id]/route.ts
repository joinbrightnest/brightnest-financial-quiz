import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, notes } = await request.json();

    // Map pipeline status back to appointment status and outcome
    const { appointmentStatus, outcome } = mapPipelineStatusToAppointment(status);

    const updateData: any = {};
    
    if (status) {
      updateData.status = appointmentStatus;
      if (outcome) {
        updateData.outcome = outcome;
      }
    }
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: id },
      data: updateData,
      include: {
        closer: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    console.log('✅ Pipeline lead updated:', {
      appointmentId: id,
      status: appointmentStatus,
      outcome,
      notes: notes ? 'Updated' : 'Not changed'
    });

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment
    });

  } catch (error) {
    console.error('❌ Error updating pipeline lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Map pipeline status back to appointment status and outcome
function mapPipelineStatusToAppointment(pipelineStatus: string): { appointmentStatus: string; outcome: string | null } {
  switch (pipelineStatus) {
    case 'new':
      return { appointmentStatus: 'completed', outcome: null };
    case 'booked_call':
      return { appointmentStatus: 'scheduled', outcome: null };
    case 'follow_up':
      return { appointmentStatus: 'completed', outcome: 'needs_follow_up' };
    case 'callback_requested':
      return { appointmentStatus: 'completed', outcome: 'callback_requested' };
    case 'converted':
      return { appointmentStatus: 'completed', outcome: 'converted' };
    case 'not_interested':
      return { appointmentStatus: 'completed', outcome: 'not_interested' };
    case 'rescheduled':
      return { appointmentStatus: 'completed', outcome: 'rescheduled' };
    default:
      return { appointmentStatus: 'completed', outcome: null };
  }
}
