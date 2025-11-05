import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/admin-auth-server';

export async function GET(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const leadEmail = searchParams.get('leadEmail');
    const closerId = searchParams.get('closerId');

    // Build where clause
    const where: any = {
      // Only include valid task statuses (exclude 'cancelled' which isn't in the enum)
      status: {
        in: ['pending', 'in_progress', 'completed']
      }
    };
    if (leadEmail) {
      where.leadEmail = leadEmail;
    }
    if (closerId) {
      where.closerId = closerId;
    }

    // Fetch tasks with closer details and appointment
    const tasks = await prisma.task.findMany({
      where,
      include: {
        closer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        appointment: {
          select: {
            id: true,
            customerName: true,
            customerEmail: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // pending, in_progress, completed
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Fetch appointments for tasks that don't have appointmentId set but have leadEmail
    // Match by leadEmail to customerEmail (same logic as closers API)
    const tasksWithAppointments = await Promise.all(
      tasks.map(async (task) => {
        try {
          // If task already has appointment, use it
          if (task.appointment) {
            return task;
          }

          // Otherwise, find appointment by matching leadEmail to customerEmail
          // For admin, we don't filter by closerId since admins can see all appointments
          if (task.leadEmail) {
            const appointment = await prisma.appointment.findFirst({
              where: {
                customerEmail: task.leadEmail,
              },
              select: {
                id: true,
                customerName: true,
                customerEmail: true,
              },
            });

            return {
              ...task,
              appointment: appointment || null,
            };
          }

          return task;
        } catch (err) {
          console.error(`Error processing task ${task.id}:`, err);
          // Return task without appointment if there's an error
          return {
            ...task,
            appointment: null,
          };
        }
      })
    );

    return NextResponse.json({ tasks: tasksWithAppointments });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }

  try {
    const { leadEmail, title, description, priority, dueDate, closerId } = await request.json();

    if (!leadEmail || !title) {
      return NextResponse.json(
        { error: 'Lead email and title are required' },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        leadEmail,
        title,
        description: description || null,
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'pending',
        closerId: closerId || null,
      },
      include: {
        closer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
