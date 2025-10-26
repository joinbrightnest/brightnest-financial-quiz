import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export async function PUT(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { closerId: string; email: string };

    const body = await request.json();
    const { title, description, priority, status, dueDate } = body;

    // Verify the task belongs to this closer
    const existingTask = await prisma.task.findUnique({
      where: { id: params.taskId },
    });

    if (!existingTask || existingTask.closerId !== decoded.closerId) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'completed' && !existingTask.completedAt) {
        updateData.completedAt = new Date();
      } else if (status !== 'completed') {
        updateData.completedAt = null;
      }
    }
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const task = await prisma.task.update({
      where: { id: params.taskId },
      data: updateData,
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { closerId: string; email: string };

    // Verify the task belongs to this closer
    const existingTask = await prisma.task.findUnique({
      where: { id: params.taskId },
    });

    if (!existingTask || existingTask.closerId !== decoded.closerId) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id: params.taskId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}

