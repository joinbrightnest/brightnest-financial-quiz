import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth-server';
import { prisma } from '@/lib/prisma';

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
    const { calendlyLink } = await request.json();

    console.log(`🎯 Updating Calendly link for closer ${id}:`, calendlyLink);

    // Update the closer's Calendly link
    const updatedCloser = await prisma.closer.update({
      where: { id },
      data: {
        calendlyLink: calendlyLink || null,
      },
    });

    console.log(`✅ Successfully updated Calendly link for closer: ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Calendly link updated successfully',
      closer: {
        id: updatedCloser.id,
        name: updatedCloser.name,
        calendlyLink: updatedCloser.calendlyLink,
      }
    });

  } catch (error) {
    console.error('❌ Error updating Calendly link:', error);
    return NextResponse.json(
      { error: 'Failed to update Calendly link' },
      { status: 500 }
    );
  }
}
