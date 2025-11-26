import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/admin-auth-server';
import { getCloserIdFromToken } from '@/lib/closer-auth';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const isAdmin = verifyAdminAuth(request);
        const closerId = getCloserIdFromToken(request);

        if (!isAdmin && !closerId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { taskId } = await params;
        const body = await request.json();
        const { title, description, priority, status, dueDate } = body;

        // Verify the task exists
        const existingTask = await prisma.task.findUnique({
            where: { id: taskId },
        });

        if (!existingTask) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Permission Check
        if (!isAdmin) {
            // Closer permission logic
            if (existingTask.leadEmail) {
                // Type 1: Lead-specific task - verify the closer is assigned to this lead
                const appointment = await prisma.appointment.findFirst({
                    where: {
                        customerEmail: existingTask.leadEmail,
                        closerId: closerId!
                    }
                });

                if (!appointment) {
                    return NextResponse.json({ error: 'Forbidden: You are not assigned to this lead.' }, { status: 403 });
                }
            } else {
                // Type 2: General task - verify the task belongs to this closer
                if (existingTask.closerId !== closerId) {
                    return NextResponse.json({ error: 'Forbidden: This task does not belong to you.' }, { status: 403 });
                }
            }
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (priority !== undefined) updateData.priority = priority;

        if (status !== undefined) {
            // Reject cancelled status - it's no longer supported (from Closer API)
            if (status === 'cancelled') {
                return NextResponse.json({ error: 'Cancelled status is no longer supported' }, { status: 400 });
            }

            updateData.status = status;
            if (status === 'completed' && !existingTask.completedAt) {
                updateData.completedAt = new Date();
            } else if (status !== 'completed') {
                updateData.completedAt = null;
            }
        }

        if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

        const task = await prisma.task.update({
            where: { id: taskId },
            data: updateData,
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
        console.error('Error updating task:', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const isAdmin = verifyAdminAuth(request);
        const closerId = getCloserIdFromToken(request);

        if (!isAdmin && !closerId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { taskId } = await params;

        // Verify the task exists
        const existingTask = await prisma.task.findUnique({
            where: { id: taskId },
        });

        if (!existingTask) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Permission Check
        if (!isAdmin) {
            // Closer permission logic
            if (existingTask.leadEmail) {
                // Type 1: Lead-specific task - verify the closer is assigned to this lead
                const appointment = await prisma.appointment.findFirst({
                    where: {
                        customerEmail: existingTask.leadEmail,
                        closerId: closerId!
                    }
                });

                if (!appointment) {
                    return NextResponse.json({ error: 'Forbidden: You are not assigned to this lead.' }, { status: 403 });
                }
            } else {
                // Type 2: General task - verify the task belongs to this closer
                if (existingTask.closerId !== closerId) {
                    return NextResponse.json({ error: 'Forbidden: This task does not belong to you.' }, { status: 403 });
                }
            }
        }

        await prisma.task.delete({
            where: { id: taskId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}
