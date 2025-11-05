import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // 🔒 SECURITY: Require JWT_SECRET (no fallback)
    const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!JWT_SECRET) {
      console.error('FATAL: JWT_SECRET or NEXTAUTH_SECRET environment variable is required');
      return NextResponse.json(
        { error: 'Authentication configuration error' },
        { status: 500 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.role !== 'closer') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get fresh closer data from database
    const closer = await prisma.closer.findUnique({
      where: { id: decoded.closerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        totalCalls: true,
        totalConversions: true,
        totalRevenue: true,
        conversionRate: true,
        isActive: true,
        isApproved: true,
        createdAt: true,
      }
    });

    if (!closer) {
      return NextResponse.json(
        { error: 'Closer not found' },
        { status: 404 }
      );
    }

    // Calculate actual stats from appointments (single source of truth)
    const appointments = await prisma.appointment.findMany({
      where: { closerId: decoded.closerId },
      select: {
        status: true,
        outcome: true,
        saleValue: true,
        commissionAmount: true
      }
    });

    // Calculate real stats from appointments
    const actualTotalCalls = appointments.length;
    
    // Debug: Log all appointments with outcome='converted'
    const allConverted = appointments.filter(apt => apt.outcome === 'converted');
    console.log('🔍 All appointments with outcome=converted:', allConverted.map(apt => ({
      outcome: apt.outcome,
      saleValue: apt.saleValue,
      saleValueType: typeof apt.saleValue,
      saleValueNumber: apt.saleValue ? Number(apt.saleValue) : null,
      hasSaleValue: apt.saleValue !== null && apt.saleValue !== undefined
    })));
    
    // Only count conversions where outcome is 'converted' AND saleValue exists AND is > 0 (actual closed sales)
    const actualTotalConversions = appointments.filter(apt => {
      const isConverted = apt.outcome === 'converted';
      const hasSaleValue = apt.saleValue !== null && apt.saleValue !== undefined && Number(apt.saleValue) > 0;
      return isConverted && hasSaleValue;
    }).length;
    
    const actualTotalRevenue = appointments
      .filter(apt => apt.outcome === 'converted' && apt.saleValue !== null && apt.saleValue !== undefined && Number(apt.saleValue) > 0)
      .reduce((sum, apt) => sum + (Number(apt.saleValue) || 0), 0);
    const actualConversionRate = actualTotalCalls > 0 ? parseFloat(((actualTotalConversions / actualTotalCalls) * 100).toFixed(4)) : 0;

    // Ensure numeric fields have default values
    const closerWithDefaults = {
      ...closer,
      totalCalls: actualTotalCalls,
      totalConversions: actualTotalConversions,
      totalRevenue: actualTotalRevenue,
      conversionRate: actualConversionRate,
    };

    console.log('📊 Fresh closer stats fetched:', {
      id: closer.id,
      name: closer.name,
      totalCalls: closerWithDefaults.totalCalls,
      totalConversions: closerWithDefaults.totalConversions,
      totalRevenue: closerWithDefaults.totalRevenue,
      conversionRate: closerWithDefaults.conversionRate,
    });

    return NextResponse.json({
      success: true,
      closer: closerWithDefaults
    });

  } catch (error) {
    console.error('❌ Error fetching closer stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
