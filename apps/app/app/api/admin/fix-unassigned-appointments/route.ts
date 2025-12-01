import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth-server';
import { prisma } from '@/lib/prisma';

/**
 * Fix unassigned appointments by assigning them to available closers
 * Uses round-robin assignment (same logic as Calendly webhook)
 */
export async function POST(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }

  try {
    // Find all unassigned appointments (that should have closers)
    const unassignedAppointments = await prisma.appointment.findMany({
      where: {
        closerId: null,
        status: {
          in: ['scheduled', 'confirmed'] // Only active appointments
        }
      },
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        scheduledAt: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc' // Assign oldest first
      }
    });

    console.log(`📋 Found ${unassignedAppointments.length} unassigned appointments`);

    if (unassignedAppointments.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No unassigned appointments to process',
        assignedCount: 0,
        unassignedCount: 0
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
        totalCalls: 'asc' // Round-robin: assign to closer with fewer calls
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

    // Track assignments for logging
    const assignments: Array<{
      appointmentId: string;
      customerEmail: string;
      closerId: string;
      closerName: string;
    }> = [];

    // Round-robin assignment
    let closerIndex = 0;
    let assignedCount = 0;

    for (const appointment of unassignedAppointments) {
      // Get the next closer (round-robin)
      const assignedCloser = availableClosers[closerIndex];

      // Assign the appointment to the closer
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          closerId: assignedCloser.id,
          status: appointment.status === 'scheduled' ? 'confirmed' : appointment.status
        }
      });

      // Increment the closer's total calls count
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
        customerEmail: appointment.customerEmail,
        closerId: assignedCloser.id,
        closerName: assignedCloser.name
      });

      assignedCount++;

      // Move to next closer (round-robin)
      closerIndex = (closerIndex + 1) % availableClosers.length;
    }

    console.log(`✅ Assigned ${assignedCount} appointments to closers`);

    // Log assignments for audit
    assignments.forEach(assignment => {
      console.log(`  ✅ ${assignment.customerEmail} → ${assignment.closerName}`);
    });

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${assignedCount} appointments to closers`,
      assignedCount,
      unassignedCount: unassignedAppointments.length - assignedCount,
      assignments: assignments.slice(0, 10) // Return first 10 for preview
    });

  } catch (error) {
    console.error('❌ Error fixing unassigned appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fix unassigned appointments', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Get statistics about unassigned appointments
 */
export async function GET(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }

  try {
    // Count unassigned appointments by status
    const unassignedCounts = await prisma.appointment.groupBy({
      by: ['status'],
      where: {
        closerId: null,
        status: {
          in: ['scheduled', 'confirmed']
        }
      },
      _count: {
        id: true
      }
    });

    // Get total unassigned count
    const totalUnassigned = await prisma.appointment.count({
      where: {
        closerId: null,
        status: {
          in: ['scheduled', 'confirmed']
        }
      }
    });

    // Get available closers count
    const availableClosersCount = await prisma.closer.count({
      where: {
        isActive: true,
        isApproved: true
      }
    });

    // Get oldest unassigned appointment
    const oldestUnassigned = await prisma.appointment.findFirst({
      where: {
        closerId: null,
        status: {
          in: ['scheduled', 'confirmed']
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        id: true,
        customerEmail: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      totalUnassigned,
      availableClosersCount,
      unassignedByStatus: unassignedCounts.reduce((acc, item) => {
        acc[item.status || 'unknown'] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      oldestUnassigned: oldestUnassigned ? {
        id: oldestUnassigned.id,
        customerEmail: oldestUnassigned.customerEmail,
        createdAt: (oldestUnassigned.createdAt || new Date()).toISOString(),
        ageDays: Math.floor((Date.now() - (oldestUnassigned.createdAt || new Date()).getTime()) / (1000 * 60 * 60 * 24))
      } : null
    });

  } catch (error) {
    console.error('❌ Error getting unassigned appointments stats:', error);
    return NextResponse.json(
      { error: 'Failed to get statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

