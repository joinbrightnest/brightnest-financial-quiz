import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth-server';
import { prisma } from '@brightnest/shared';

// GET - Fetch all scripts
export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }

  try {
    const scripts = await prisma.closerScript.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        assignments: {
          include: {
            closer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      scripts
    });
  } catch (error) {
    console.error('❌ Error fetching scripts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new script
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { name, callScript, programDetails, emailTemplates, isDefault } = body;

    if (!name || !callScript) {
      return NextResponse.json(
        { error: 'Name and call script are required' },
        { status: 400 }
      );
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.closerScript.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    const script = await prisma.closerScript.create({
      data: {
        name,
        callScript,
        programDetails: programDetails || null,
        emailTemplates: emailTemplates || null,
        isDefault: isDefault || false,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      script
    });
  } catch (error) {
    console.error('❌ Error creating script:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

