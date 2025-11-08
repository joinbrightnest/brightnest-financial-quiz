import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCloserIdFromToken } from '@/lib/closer-auth';

export async function GET(request: NextRequest) {
  try {
    const closerId = getCloserIdFromToken(request);
    if (!closerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const leadEmail = searchParams.get('leadEmail');

    // If leadEmail is provided, fetch tasks for that specific lead
    if (leadEmail) {
      // Security check: Verify the closer is assigned to this lead
      const appointment = await prisma.appointment.findFirst({
        where: {
          customerEmail: leadEmail,
          closerId: closerId
        }
      });

      if (!appointment) {
        return NextResponse.json({ error: 'Forbidden: You are not assigned to this lead.' }, { status: 403 });
      }

      // Fetch tasks for this lead (exclude cancelled status)
      const tasks = await prisma.task.findMany({
        where: { 
          leadEmail,
          status: { in: ['pending', 'in_progress', 'completed'] } // Only valid statuses
        },
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
          { status: 'asc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' },
        ],
      });

      return NextResponse.json({ tasks });
    }

    // If no leadEmail, fetch ALL tasks for this closer across all their leads (exclude cancelled status)
    const tasks = await prisma.task.findMany({
      where: { 
        closerId: closerId,
        status: { in: ['pending', 'in_progress', 'completed'] } // Only valid statuses
      },
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
        { status: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Fetch appointments for tasks that don't have appointmentId set but have leadEmail
    // Match by leadEmail to customerEmail
    const tasksWithAppointments = await Promise.all(
      tasks.map(async (task) => {
        // If task already has appointment, use it
        if (task.appointment) {
          return task;
        }

        // Otherwise, find appointment by matching leadEmail to customerEmail
        if (task.leadEmail) {
          const appointment = await prisma.appointment.findFirst({
            where: {
              customerEmail: task.leadEmail,
              closerId: closerId,
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
      })
    );

    return NextResponse.json(tasksWithAppointments);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const closerId = getCloserIdFromToken(request);
    if (!closerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadEmail, title, description, priority, dueDate } = await request.json();

    // Title, priority, and due date are required
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Task title is required' },
        { status: 400 }
      );
    }

    if (!priority) {
      return NextResponse.json(
        { error: 'Priority is required' },
        { status: 400 }
      );
    }

    if (!dueDate) {
      return NextResponse.json(
        { error: 'Due date is required' },
        { status: 400 }
      );
    }

    // If leadEmail is provided (Type 1: task for a specific lead), verify the closer is assigned to this lead
    if (leadEmail) {
      const appointment = await prisma.appointment.findFirst({
        where: {
          customerEmail: leadEmail,
          closerId: closerId
        }
      });

      if (!appointment) {
        return NextResponse.json({ error: 'Forbidden: You are not assigned to this lead.' }, { status: 403 });
      }
    }

    const task = await prisma.task.create({
      data: {
        leadEmail: leadEmail || null, // Type 1: has leadEmail (appears in activity log), Type 2: null (general task)
        title,
        description: description || null,
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'pending',
        closerId: closerId, // REQUIRED - every task must be assigned to a closer
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
