import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth-server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }

  try {
    // Find all unassigned appointments
    const unassignedAppointments = await prisma.appointment.findMany({
      where: {
        closerId: null,
        status: {
          in: ['scheduled', 'confirmed']
        }
      },
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        scheduledAt: true
      }
    });

    console.log(`📋 Found ${unassignedAppointments.length} unassigned appointments`);

    if (unassignedAppointments.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No unassigned appointments to process',
        assignedCount: 0
      });
    }

    // Find all active, approved closers
    const availableClosers = await prisma.closer.findMany({
      where: {
        isActive: true,
        isApproved: true
      },
      select: {
        id: true,
        name: true,
        totalCalls: true
      },
      orderBy: {
        totalCalls: 'asc'
      }
    });

    if (availableClosers.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No available closers to assign appointments to',
        unassignedCount: unassignedAppointments.length
      }, { status: 400 });
    }

    console.log(`👥 Found ${availableClosers.length} available closers`);

    const assignments: Array<{ appointmentId: string; customerName: string; closerName: string }> = [];
    let closerIndex = 0;

    // Round-robin assignment
    for (const appointment of unassignedAppointments) {
      const assignedCloser = availableClosers[closerIndex];

      // Assign the appointment
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          closerId: assignedCloser.id,
          status: 'confirmed'
        }
      });

      // Increment the closer's total calls
      await prisma.closer.update({
        where: { id: assignedCloser.id },
        data: {
          totalCalls: {
            increment: 1
          }
        }
      });

      assignments.push({
        appointmentId: appointment.id,
        customerName: appointment.customerName,
        closerName: assignedCloser.name
      });

      console.log(`✅ Assigned ${appointment.customerName} to ${assignedCloser.name}`);

      // Move to next closer (round-robin)
      closerIndex = (closerIndex + 1) % availableClosers.length;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${assignments.length} appointments`,
      assignedCount: assignments.length,
      assignments
    });

  } catch (error) {
    console.error('❌ Error auto-assigning appointments:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to auto-assign appointments',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

