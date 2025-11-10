import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { verifyAdminAuth } from '@/lib/admin-auth-server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin authentication required" },
      { status: 401 }
    );
  }
  
  try {
    const { id } = await params;
    const { newPassword } = await request.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Find the closer
    const closer = await prisma.closer.findUnique({
      where: { id },
      select: { id: true, name: true, email: true }
    });

    if (!closer) {
      return NextResponse.json(
        { error: 'Closer not found' },
        { status: 404 }
      );
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update the closer's password
    await prisma.closer.update({
      where: { id },
      data: { passwordHash }
    });

    // Create audit log
    await prisma.closerAuditLog.create({
      data: {
        closerId: id,
        action: 'password_reset_by_admin',
        details: {
          resetBy: 'admin',
          resetAt: new Date().toISOString(),
          closerName: closer.name,
          closerEmail: closer.email,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    });

    console.log('✅ Password reset for closer:', {
      id: closer.id,
      name: closer.name,
      email: closer.email
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      closer: {
        id: closer.id,
        name: closer.name,
        email: closer.email
      }
    });

  } catch (error) {
    console.error('❌ Error resetting closer password:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}







