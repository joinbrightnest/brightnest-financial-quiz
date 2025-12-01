import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { verifyAdminAuth } from '@/lib/admin-auth-server';
import { prisma } from '@brightnest/shared';

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

    // Find the affiliate
    const affiliate = await prisma.affiliate.findUnique({
      where: { id },
      select: { id: true, name: true, email: true }
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update the affiliate's password
    await prisma.affiliate.update({
      where: { id },
      data: { passwordHash }
    });

    // Create audit log
    await prisma.affiliateAuditLog.create({
      data: {
        affiliateId: id,
        action: 'password_reset_by_admin',
        details: {
          resetBy: 'admin',
          resetAt: new Date().toISOString(),
          affiliateName: affiliate.name,
          affiliateEmail: affiliate.email,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    });

    console.log('✅ Password reset for affiliate:', {
      id: affiliate.id,
      name: affiliate.name,
      email: affiliate.email
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email
      }
    });

  } catch (error) {
    console.error('❌ Error resetting affiliate password:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
