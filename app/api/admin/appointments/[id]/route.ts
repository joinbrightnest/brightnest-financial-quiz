import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log(`🗑️ Deleting appointment: ${id}`);

    // Check if appointment exists
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        scheduledAt: true,
        closerId: true,
      }
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Delete the appointment
    await prisma.appointment.delete({
      where: { id }
    });

    // If appointment was assigned to a closer, update their total calls
    if (appointment.closerId) {
      try {
        await prisma.closer.update({
          where: { id: appointment.closerId },
          data: {
            totalCalls: {
              decrement: 1,
            },
          },
        });
        console.log(`✅ Updated closer ${appointment.closerId} total calls`);
      } catch (error) {
        console.error('❌ Error updating closer total calls:', error);
        // Don't fail the deletion for this
      }
    }

    console.log(`✅ Successfully deleted appointment: ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Appointment deleted successfully',
      deletedAppointment: {
        id: appointment.id,
        customerName: appointment.customerName,
        scheduledAt: appointment.scheduledAt,
      }
    });

  } catch (error) {
    console.error('❌ Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}
