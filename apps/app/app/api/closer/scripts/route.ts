import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCloserIdFromToken } from '@/lib/closer-auth';

export async function GET(request: NextRequest) {
  try {
    const closerId = getCloserIdFromToken(request);
    if (!closerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the script assigned to this closer
    const assignment = await prisma.closerScriptAssignment.findFirst({
      where: {
        closerId: closerId
      },
      include: {
        script: {
          select: {
            id: true,
            name: true,
            callScript: true,
            programDetails: true,
            emailTemplates: true,
            isDefault: true,
            isActive: true,
            updatedAt: true
          }
        }
      }
    });

    // If no assignment, try to get the default script
    if (!assignment) {
      const defaultScript = await prisma.closerScript.findFirst({
        where: {
          isDefault: true,
          isActive: true
        },
        select: {
          id: true,
          name: true,
          callScript: true,
          programDetails: true,
          emailTemplates: true,
          isDefault: true,
          isActive: true,
          updatedAt: true
        }
      });

      if (defaultScript) {
        return NextResponse.json({
          success: true,
          script: defaultScript
        });
      }

      // No script found
      return NextResponse.json({
        success: false,
        message: 'No script assigned or available'
      });
    }

    // Return the assigned script
    return NextResponse.json({
      success: true,
      script: assignment.script
    });
  } catch (error) {
    console.error('❌ Error fetching closer script:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

