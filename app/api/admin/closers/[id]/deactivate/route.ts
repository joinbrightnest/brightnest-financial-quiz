import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get current closer status
    const currentCloser = await prisma.closer.findUnique({
      where: { id },
      select: { isActive: true }
    });

    if (!currentCloser) {
      return NextResponse.json(
        { error: 'Closer not found' },
        { status: 404 }
      );
    }

    // Toggle active status
    const closer = await prisma.closer.update({
      where: { id },
      data: {
        isActive: !currentCloser.isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      }
    });

    // Create audit log
    await prisma.closerAuditLog.create({
      data: {
        closerId: id,
        action: closer.isActive ? 'activated' : 'deactivated',
        details: {
          changedBy: 'admin',
          changedAt: new Date().toISOString(),
          previousStatus: currentCloser.isActive,
          newStatus: closer.isActive,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    });

    console.log(`✅ Closer ${closer.isActive ? 'activated' : 'deactivated'}:`, {
      id: closer.id,
      name: closer.name,
      email: closer.email
    });

    return NextResponse.json({
      success: true,
      closer
    });

  } catch (error) {
    console.error('❌ Error updating closer status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
