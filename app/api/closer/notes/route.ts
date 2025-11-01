import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCloserIdFromToken } from '@/lib/closer-auth';

export async function POST(req: NextRequest) {
  try {
    const closerId = getCloserIdFromToken(req);
    if (!closerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadEmail, content } = await req.json();

    if (!leadEmail || !content) {
      return NextResponse.json({ error: 'Lead email and content are required' }, { status: 400 });
    }

    // Security check: Verify the closer is assigned to this lead
    const appointment = await prisma.appointment.findFirst({
        where: {
            customerEmail: leadEmail,
            closerId: closerId
        }
    });
    
    if (!appointment) {
        return NextResponse.json({ error: 'Forbidden: You are not assigned to this lead.' }, { status: 403 });
    }

    const closer = await prisma.closer.findUnique({ where: { id: closerId } });
    const closerName = closer?.name || `Closer ${closerId}`;

    const newNote = await prisma.note.create({
      data: {
        leadEmail,
        content,
        createdBy: closerName,
        createdByType: 'closer',
      },
    });

    // Also create an audit log for this event
    await prisma.closerAuditLog.create({
      data: {
        closerId: closerId,
        type: 'note_added',
        description: `${closerName} added a note.`,
        details: {
          appointmentId: appointment.id,
          noteId: newNote.id,
          content: newNote.content,
        }
      }
    });

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
