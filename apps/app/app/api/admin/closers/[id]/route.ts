import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth-server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }
  
  try {
    const { id } = await params;

    // Get closer info before deletion for audit log
    const closer = await prisma.closer.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    if (!closer) {
      return NextResponse.json(
        { error: 'Closer not found' },
        { status: 404 }
      );
    }

    // Check if closer has any appointments
    const appointmentCount = await prisma.appointment.count({
      where: { closerId: id }
    });

    // Create audit log before deletion
    await prisma.closerAuditLog.create({
      data: {
        closerId: id,
        action: 'deleted',
        details: {
          deletedBy: 'admin',
          deletedAt: new Date().toISOString(),
          closerName: closer.name,
          closerEmail: closer.email,
          appointmentCount: appointmentCount,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    });

    // Unassign any appointments from this closer first (before deletion)
    await prisma.appointment.updateMany({
      where: { closerId: id },
      data: { closerId: null }
    });

    // Delete closer (tasks will be unassigned due to onDelete: SetNull in schema)
    await prisma.closer.delete({
      where: { id },
    });

    console.log('✅ Closer deleted:', {
      id: closer.id,
      name: closer.name,
      email: closer.email,
      appointmentCount
    });

    return NextResponse.json({
      success: true,
      message: 'Closer deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting closer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

