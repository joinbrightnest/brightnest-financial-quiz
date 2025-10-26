import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { closerId: string; email: string };

    const { searchParams } = new URL(request.url);
    const leadEmail = searchParams.get('leadEmail');

    if (!leadEmail) {
      return NextResponse.json({ error: 'Lead email is required' }, { status: 400 });
    }

    const tasks = await prisma.task.findMany({
      where: {
        leadEmail: leadEmail,
        closerId: decoded.closerId,
      },
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { closerId: string; email: string };

    const body = await request.json();
    const { leadEmail, title, description, priority, dueDate, appointmentId } = body;

    if (!leadEmail || !title) {
      return NextResponse.json({ error: 'Lead email and title are required' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        leadEmail,
        title,
        description,
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        closerId: decoded.closerId,
        appointmentId: appointmentId || null,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

