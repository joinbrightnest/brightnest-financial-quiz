import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCloserIdFromToken } from '@/lib/closer-auth';

const prisma = new PrismaClient();

// DELETE a note
export async function DELETE(req: NextRequest, { params }: { params: { noteId: string } }) {
  try {
    const closerId = await getCloserIdFromToken(req);
    if (!closerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { noteId } = params;

    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Security check: ensure the closer is assigned to the lead this note belongs to
    const appointment = await prisma.appointment.findFirst({
      where: {
        customerEmail: note.leadEmail,
        closerId: closerId,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Forbidden: You cannot delete notes for this lead.' }, { status: 403 });
    }

    await prisma.note.delete({
      where: { id: noteId },
    });

    // Optional: Log this deletion event
    const closer = await prisma.closer.findUnique({ where: { id: closerId }});
    await prisma.closerAuditLog.create({
        data: {
          closerId: closerId,
          type: 'note_deleted',
          description: `${closer?.name || 'Closer'} deleted a note.`,
          details: {
            appointmentId: appointment.id,
            noteId: note.id,
          }
        }
      });


    return NextResponse.json({ message: 'Note deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
