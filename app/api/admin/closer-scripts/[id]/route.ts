import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth-server';
import { prisma } from '@/lib/prisma';

// PUT - Update a script
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { name, callScript, programDetails, emailTemplates, isDefault, isActive } = body;

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.closerScript.updateMany({
        where: { 
          isDefault: true,
          id: { not: params.id }
        },
        data: { isDefault: false }
      });
    }

    const script = await prisma.closerScript.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(callScript !== undefined && { callScript }),
        ...(programDetails !== undefined && { programDetails }),
        ...(emailTemplates !== undefined && { emailTemplates }),
        ...(isDefault !== undefined && { isDefault }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return NextResponse.json({
      success: true,
      script
    });
  } catch (error) {
    console.error('❌ Error updating script:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a script
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }

  try {
    await prisma.closerScript.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('❌ Error deleting script:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

