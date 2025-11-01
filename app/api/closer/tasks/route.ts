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

    if (!leadEmail) {
      return NextResponse.json({ error: 'Lead email is required' }, { status: 400 });
    }

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

    // Fetch tasks for this lead
    const tasks = await prisma.task.findMany({
      where: { leadEmail },
      include: {
        closer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // pending, in_progress, completed, cancelled
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ tasks });
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

    if (!leadEmail || !title) {
      return NextResponse.json(
        { error: 'Lead email and title are required' },
        { status: 400 }
      );
    }

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

    const task = await prisma.task.create({
      data: {
        leadEmail,
        title,
        description: description || null,
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'pending',
        closerId: closerId,
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
