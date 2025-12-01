import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth-server';
import { prisma } from '@brightnest/shared';

export async function PUT(
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

    // Update closer to approved
    const closer = await prisma.closer.update({
      where: { id },
      data: {
        isApproved: true,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isApproved: true,
        isActive: true,
      }
    });

    // Create audit log
    await prisma.closerAuditLog.create({
      data: {
        closerId: id,
        action: 'approved',
        details: {
          approvedBy: 'admin',
          approvedAt: new Date().toISOString(),
        },
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    });

    console.log('✅ Closer approved:', {
      id: closer.id,
      name: closer.name,
      email: closer.email
    });

    return NextResponse.json({
      success: true,
      closer
    });

  } catch (error) {
    console.error('❌ Error approving closer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
