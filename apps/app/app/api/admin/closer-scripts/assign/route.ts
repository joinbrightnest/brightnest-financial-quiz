import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth-server';
import { prisma } from '@brightnest/shared';

// POST - Assign script to closer(s)
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { scriptId, closerIds } = body;

    if (!scriptId || !closerIds || !Array.isArray(closerIds) || closerIds.length === 0) {
      return NextResponse.json(
        { error: 'Script ID and at least one closer ID are required' },
        { status: 400 }
      );
    }

    // Remove existing assignments for these closers (only one script per closer)
    await prisma.closerScriptAssignment.deleteMany({
      where: {
        closerId: { in: closerIds }
      }
    });

    // Create new assignments
    const assignments = await Promise.all(
      closerIds.map((closerId: string) =>
        prisma.closerScriptAssignment.create({
          data: {
            closerId,
            scriptId
          }
        })
      )
    );

    return NextResponse.json({
      success: true,
      assignments
    });
  } catch (error) {
    console.error('❌ Error assigning script:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove script assignment
export async function DELETE(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const closerId = searchParams.get('closerId');

    if (!closerId) {
      return NextResponse.json(
        { error: 'Closer ID is required' },
        { status: 400 }
      );
    }

    await prisma.closerScriptAssignment.deleteMany({
      where: { closerId }
    });

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('❌ Error removing script assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

