import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get all closers with their appointments
    const closers = await prisma.closer.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        calendlyLink: true,
        isActive: true,
        isApproved: true,
        createdAt: true,
      }
    });

    // Get all appointments
    const appointments = await prisma.appointment.findMany({
      select: {
        id: true,
        closerId: true,
        outcome: true,
        saleValue: true,
      }
    });

    // Calculate stats for each closer from actual appointment data
    const closersWithStats = closers.map(closer => {
      const closerAppointments = appointments.filter(a => a.closerId === closer.id);
      const conversions = closerAppointments.filter(a => a.outcome === 'converted');
      const totalRevenue = conversions.reduce((sum, a) => sum + (Number(a.saleValue) || 0), 0);
      const totalCalls = closerAppointments.length;
      const totalConversions = conversions.length;
      const conversionRate = totalCalls > 0 ? totalConversions / totalCalls : 0;

      return {
        ...closer,
        totalCalls,
        totalConversions,
        totalRevenue,
        conversionRate,
      };
    });

    return NextResponse.json({
      success: true,
      closers: closersWithStats
    });

  } catch (error) {
    console.error('❌ Error fetching closers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
