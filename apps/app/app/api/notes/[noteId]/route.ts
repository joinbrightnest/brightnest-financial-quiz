import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/admin-auth-server';
import { getCloserIdFromToken } from '@/lib/closer-auth';

/**
 * Check if a closer has access to notes for a specific lead
 * Access is granted if closer has an appointment or task for this lead
 */
async function closerHasAccessToLead(closerId: string, leadEmail: string): Promise<boolean> {
  const appointment = await prisma.appointment.findFirst({
    where: { customerEmail: leadEmail, closerId },
    select: { id: true },
  });
  if (appointment) return true;

  const task = await prisma.task.findFirst({
    where: { leadEmail, closerId },
    select: { id: true },
  });
  return !!task;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
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
    const { noteId } = await params;

    // Get the note first to check authorization
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { id: true, leadEmail: true },
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // 🔒 SECURITY: Authorization check for closers
    if (!isAdmin && closerId) {
      const hasAccess = await closerHasAccessToLead(closerId, note.leadEmail);
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Forbidden - This note belongs to a lead not assigned to you' },
          { status: 403 }
        );
      }
    }

    await prisma.note.delete({
      where: { id: noteId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
