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
        // 🚀 PERFORMANCE: Optimization to existing logic - batch fetching appointments instead of N+1
        const tasksWithAppointments = [...tasks];

        // Identify tasks that need appointment lookup (have email but no linked appointment)
        const tasksNeedingAppointment = tasks.filter(t => !t.appointment && t.leadEmail);

        if (tasksNeedingAppointment.length > 0) {
            const leadEmails = tasksNeedingAppointment.map(t => t.leadEmail!);

            // Build where clause for batch query
            const appointmentWhere: Prisma.AppointmentWhereInput = {
                customerEmail: { in: leadEmails }
            };

            // Apply closer restriction for non-admins
            if (!isAdmin && closerId) {
                appointmentWhere.closerId = closerId;
            }

            // Fetch all potentially matching appointments in one query
            const matchingAppointments = await prisma.appointment.findMany({
                where: appointmentWhere,
                select: {
                    id: true,
                    customerName: true,
                    customerEmail: true,
                    // If filtering by closerId, we need to know whose appointment it is
                    // But if we filtered in the query, we know they belong to the closer (or are visible)
                }
            });

            // Create lookup map: email -> appointment
            // Note: If multiple appointments exist for an email, this takes the last one found.
            // This behavior matches (roughly) logic of findFirst in a loop, but is much faster.
            const appointmentMap = new Map();
            matchingAppointments.forEach(apt => {
                if (apt.customerEmail) {
                    appointmentMap.set(apt.customerEmail, apt);
                }
            });

            // Attach appointments to tasks
            // We modify a copy or map correctly
            /* Since tasksWithAppointments is a reference to tasks array (objects), 
               and we need to add the 'appointment' property to the object which might not exist on the type fully inferred by Prisma unless included
               The tasks type from Prisma with include returns (Task & { appointment: ... | null })
               So redundant mapping is fine.
            */

            // Rebuild the array with enriched data
            for (let i = 0; i < tasksWithAppointments.length; i++) {
                const task = tasksWithAppointments[i];
                if (!task.appointment && task.leadEmail) {
                    const foundAppt = appointmentMap.get(task.leadEmail);
                    if (foundAppt) {
                        // We need to cast or ensure type compatibility, but tasks array is already typed to include appointment
                        // @ts-ignore - appending property to object
                        tasksWithAppointments[i] = { ...task, appointment: foundAppt };
                    }
                }
            }
        }

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

        console.log('Task Creation Debug:', {
            leadEmail,
            title,
            priority,
            dueDate,
            assignedCloserId,
            isAdmin,
            closerIdFromToken: closerId
        });

        // Validation
        if (!title || !title.trim()) {
            console.log('Task Creation Failed: Missing title');
            return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
        }
        if (!priority) {
            console.log('Task Creation Failed: Missing priority');
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
                    // Fallback 2: If user is also a closer (dual auth), assign to self
                    if (closerId) {
                        assignedCloserId = closerId;
                    } else {
                        console.log('Task Creation Failed: No closer ID and fallback failed');
                        return NextResponse.json({ error: 'Closer assignment is required. This lead may not have an assigned closer.' }, { status: 400 });
                    }
                } else {
                    console.log('Task Creation: Fallback successful, found closerId:', assignedCloserId);
                }
            }

            // Verify closer exists/active
            const closer = await prisma.closer.findUnique({ where: { id: assignedCloserId } });
            if (!closer || !closer.isActive || !closer.isApproved) {
                console.log('Task Creation Failed: Invalid or inactive closer', { closer });
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
