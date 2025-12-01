import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { verifyAdminAuth } from '@/lib/admin-auth-server';
import { getCloserIdFromToken } from '@/lib/closer-auth';

export async function GET(request: NextRequest) {
    try {
        const isAdmin = verifyAdminAuth(request);
        const closerId = getCloserIdFromToken(request);

        if (!isAdmin && !closerId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const leadEmail = searchParams.get('leadEmail');
        const filterCloserId = searchParams.get('closerId');

        const where: Prisma.TaskWhereInput = {
            status: { in: ['pending', 'in_progress', 'completed'] }
        };

        if (leadEmail) {
            where.leadEmail = leadEmail;
        }

        // Role-specific logic
        if (isAdmin) {
            // Admin can filter by closerId
            if (filterCloserId && filterCloserId !== 'all') {
                where.closerId = filterCloserId;
            }
        } else {
            // Closer logic
            if (leadEmail) {
                // If viewing specific lead tasks, verify assignment
                // Note: We allow closers to see tasks for leads they are assigned to, 
                // even if the task itself might be assigned to someone else (though usually it's them)
                // Ideally, we check if they have an appointment with this lead
                const appointment = await prisma.appointment.findFirst({
                    where: {
                        customerEmail: leadEmail,
                        closerId: closerId!
                    }
                });

                if (!appointment) {
                    return NextResponse.json({ error: 'Forbidden: You are not assigned to this lead.' }, { status: 403 });
                }
            } else {
                // If viewing general task list, only show their own tasks
                where.closerId = closerId!;
            }
        }

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
                { status: 'asc' },
                { dueDate: 'asc' },
                { createdAt: 'desc' },
            ],
        });

        // Post-processing to attach appointments if missing
        // This logic was present in both original files
        const tasksWithAppointments = await Promise.all(
            tasks.map(async (task) => {
                if (task.appointment) return task;

                if (task.leadEmail) {
                    // Find appointment matching lead email
                    // For admin: find any appointment
                    // For closer: find appointment assigned to them (or any? original code used closerId filter for closer API)

                    const appointmentWhere: Prisma.AppointmentWhereInput = { customerEmail: task.leadEmail };
                    if (!isAdmin) {
                        appointmentWhere.closerId = closerId;
                    }

                    const appointment = await prisma.appointment.findFirst({
                        where: appointmentWhere,
                        select: {
                            id: true,
                            customerName: true,
                            customerEmail: true,
                        },
                    });

                    return { ...task, appointment: appointment || null };
                }
                return task;
            })
        );

        return NextResponse.json({ tasks: tasksWithAppointments });
        // Note: Admin API returned { tasks: [...] }, Closer API returned [...]
        // We should standardize this. The shared component expects { tasks: [...] } or [...]?
        // Let's check the shared component.

    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const isAdmin = verifyAdminAuth(request);
        const closerId = getCloserIdFromToken(request);

        if (!isAdmin && !closerId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { leadEmail, title, description, priority, dueDate } = body;
        let assignedCloserId = body.closerId;

        // Validation
        if (!title || !title.trim()) {
            return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
        }
        if (!priority) {
            return NextResponse.json({ error: 'Priority is required' }, { status: 400 });
        }

        // Role-specific validation and assignment
        if (isAdmin) {
            if (!assignedCloserId) {
                // Fallback: Try to find closer from lead's appointment
                if (leadEmail) {
                    const appointment = await prisma.appointment.findFirst({
                        where: { customerEmail: leadEmail },
                        select: { closerId: true }
                    });

                    if (appointment?.closerId) {
                        assignedCloserId = appointment.closerId;
                    }
                }

                // If still no closer ID, return error
                if (!assignedCloserId) {
                    return NextResponse.json({ error: 'Closer assignment is required. This lead may not have an assigned closer.' }, { status: 400 });
                }
            }

            // Verify closer exists/active
            const closer = await prisma.closer.findUnique({ where: { id: assignedCloserId } });
            if (!closer || !closer.isActive || !closer.isApproved) {
                return NextResponse.json({ error: 'Invalid or inactive closer' }, { status: 400 });
            }
        } else {
            // Closer assigns to self
            assignedCloserId = closerId;

            if (!dueDate) {
                // Closer API required due date, Admin didn't seem to enforce it strictly in schema but UI might
                return NextResponse.json({ error: 'Due date is required' }, { status: 400 });
            }

            if (leadEmail) {
                // Verify assignment
                const appointment = await prisma.appointment.findFirst({
                    where: { customerEmail: leadEmail, closerId: closerId! }
                });
                if (!appointment) {
                    return NextResponse.json({ error: 'Forbidden: You are not assigned to this lead.' }, { status: 403 });
                }
            }
        }

        // Link to appointment if exists
        let appointmentId = null;
        if (leadEmail) {
            const appointment = await prisma.appointment.findFirst({
                where: { customerEmail: leadEmail }
            });
            appointmentId = appointment?.id || null;
        }

        const task = await prisma.task.create({
            data: {
                leadEmail: leadEmail || null,
                title,
                description: description || null,
                priority: priority || 'medium',
                dueDate: dueDate ? new Date(dueDate) : null,
                status: 'pending',
                closerId: assignedCloserId,
                appointmentId,
            },
            include: {
                closer: { select: { id: true, name: true, email: true } },
                appointment: { select: { id: true, customerName: true, customerEmail: true } },
            },
        });

        return NextResponse.json({ task });

    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
