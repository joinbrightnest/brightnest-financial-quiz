import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/admin-auth-server';
import { getCloserIdFromToken } from '@/lib/closer-auth';
import { rateLimit, rateLimitExceededResponse } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/api-utils';
import { z } from 'zod';

// Validation schemas
const getNoteSchema = z.object({
  leadEmail: z.string().email(),
});

const createNoteSchema = z.object({
  leadEmail: z.string().email(),
  content: z.string().min(1).max(10000),
  createdBy: z.string().optional(),
  createdByType: z.string().optional(),
});

/**
 * Check if a closer has access to notes for a specific lead
 * Access is granted if closer has an appointment or task for this lead
 */
async function closerHasAccessToLead(closerId: string, leadEmail: string): Promise<boolean> {
  // Check for appointment assignment
  const appointment = await prisma.appointment.findFirst({
    where: {
      customerEmail: leadEmail,
      closerId: closerId,
    },
    select: { id: true },
  });

  if (appointment) return true;

  // Check for task assignment
  const task = await prisma.task.findFirst({
    where: {
      leadEmail: leadEmail,
      closerId: closerId,
    },
    select: { id: true },
  });

  return !!task;
}

export async function GET(request: NextRequest) {
  // 🔒 SECURITY: Role-based authentication
  const isAdmin = verifyAdminAuth(request);
  const closerId = getCloserIdFromToken(request);

  if (!isAdmin && !closerId) {
    return NextResponse.json(
      { error: 'Unauthorized - Authentication required' },
      { status: 401 }
    );
  }

  // 🛡️ SECURITY: Rate limit notes access (60 per minute)
  const rateLimitResult = await rateLimit(request, 'operational');
  if (!rateLimitResult.success) {
    return rateLimitExceededResponse(rateLimitResult);
  }

  try {
    const { searchParams } = new URL(request.url);
    const leadEmail = searchParams.get('leadEmail');

    // Validate query parameters
    const validation = getNoteSchema.safeParse({ leadEmail });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid leadEmail parameter' },
        { status: 400 }
      );
    }

    const validatedEmail = validation.data.leadEmail;

    // 🔒 SECURITY: Authorization check for closers
    if (!isAdmin && closerId) {
      const hasAccess = await closerHasAccessToLead(closerId, validatedEmail);
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Forbidden - This lead is not assigned to you' },
          { status: 403 }
        );
      }
    }

    const notes = await prisma.note.findMany({
      where: {
        leadEmail: validatedEmail,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(notes);
  } catch (error) {
    return handleApiError(error, 'fetching notes');
  }
}

export async function POST(request: NextRequest) {
  // 🔒 SECURITY: Role-based authentication
  const isAdmin = verifyAdminAuth(request);
  const closerId = getCloserIdFromToken(request);

  if (!isAdmin && !closerId) {
    return NextResponse.json(
      { error: 'Unauthorized - Authentication required' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Validate input
    const validation = createNoteSchema.safeParse(body);
    if (!validation.success) {
      const errorMessages = validation.error.issues
        .map(e => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      return NextResponse.json(
        { error: `Validation failed: ${errorMessages}` },
        { status: 400 }
      );
    }

    const { leadEmail, content, createdBy, createdByType } = validation.data;

    // 🔒 SECURITY: Authorization check for closers
    if (!isAdmin && closerId) {
      const hasAccess = await closerHasAccessToLead(closerId, leadEmail);
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Forbidden - This lead is not assigned to you' },
          { status: 403 }
        );
      }
    }

    const note = await prisma.note.create({
      data: {
        leadEmail,
        content,
        createdBy: createdBy || null,
        createdByType: createdByType || null,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'creating note');
  }
}
