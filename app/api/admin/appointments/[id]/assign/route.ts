import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { closerId } = await request.json();

    if (!closerId) {
      return NextResponse.json(
        { error: 'Closer ID is required' },
        { status: 400 }
      );
    }

    // Verify the closer exists and is active
    const closer = await prisma.closer.findUnique({
      where: { id: closerId },
      select: { id: true, name: true, isActive: true, isApproved: true }
    });

    if (!closer) {
      return NextResponse.json(
        { error: 'Closer not found' },
        { status: 404 }
      );
    }

    if (!closer.isActive || !closer.isApproved) {
      return NextResponse.json(
        { error: 'Closer is not active or approved' },
        { status: 400 }
      );
    }

    // Update appointment with closer assignment
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        closerId: closerId,
        status: 'confirmed', // Update status to confirmed when assigned
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

    // Create audit log
    await prisma.closerAuditLog.create({
      data: {
        closerId: closerId,
        action: 'appointment_assigned',
        details: {
          appointmentId: id,
          customerName: appointment.customerName,
          scheduledAt: appointment.scheduledAt,
          assignedBy: 'admin',
          assignedAt: new Date().toISOString(),
        },
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    });

    console.log('✅ Appointment assigned to closer:', {
      appointmentId: id,
      closerId: closerId,
      closerName: closer.name,
      customerName: appointment.customerName
    });

    return NextResponse.json({
      success: true,
      appointment
    });

  } catch (error) {
    console.error('❌ Error assigning appointment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
