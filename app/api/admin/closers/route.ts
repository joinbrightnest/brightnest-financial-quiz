import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }
  
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
      // Only count conversions where outcome is 'converted' AND saleValue exists AND is > 0 (actual closed sales)
      const conversions = closerAppointments.filter(a => 
        a.outcome === 'converted' && 
        a.saleValue !== null && 
        a.saleValue !== undefined && 
        Number(a.saleValue) > 0
      );
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
