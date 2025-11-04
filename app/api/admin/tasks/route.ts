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

    // Build where clause
    const where: any = {};
    if (leadEmail) {
      where.leadEmail = leadEmail;
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
