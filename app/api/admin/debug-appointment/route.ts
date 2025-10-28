import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/admin-auth-server';

export async function GET(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Find appointment by email
    const appointment = await prisma.appointment.findFirst({
      where: {
        customerEmail: email.toLowerCase()
      },
      include: {
        closer: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Get audit logs for this appointment
    const auditLogs = appointment?.closerId ? await prisma.closerAuditLog.findMany({
      where: {
        action: 'appointment_outcome_updated',
        closerId: appointment.closerId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    }) : [];

    return NextResponse.json({
      email,
      appointmentFound: !!appointment,
      appointment: appointment ? {
        id: appointment.id,
        customerName: appointment.customerName,
        customerEmail: appointment.customerEmail,
        outcome: appointment.outcome,
        status: appointment.status,
        notes: appointment.notes,
        saleValue: appointment.saleValue,
        closerId: appointment.closerId,
        closerName: appointment.closer?.name,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt
      } : null,
      auditLogsCount: auditLogs.length,
      auditLogs: auditLogs.map(log => ({
        id: log.id,
        createdAt: log.createdAt,
        details: log.details
      }))
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      { error: 'Internal error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

