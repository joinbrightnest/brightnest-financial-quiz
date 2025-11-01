import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCloserIdFromToken } from '@/lib/closer-auth'; 

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const closerId = await getCloserIdFromToken(req);
    if (!closerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, content } = await req.json();

    if (!sessionId || !content) {
      return NextResponse.json({ error: 'Missing sessionId or content' }, { status: 400 });
    }

    const quizSession = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: { answers: { include: { question: true } } },
    });

    if (!quizSession) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const leadEmail = quizSession.answers.find(a => a.question?.prompt.toLowerCase().includes('email'))?.value;
    
    if (!leadEmail) {
      return NextResponse.json({ error: 'Could not find email for this lead' }, { status: 404 });
    }

    // You might want to verify that the lead this note is being added to
    // is actually assigned to this closer. This adds a layer of security.
    const appointment = await prisma.appointment.findFirst({
        where: {
            customerEmail: leadEmail,
            closerId: closerId
        }
    });

    if (!appointment) {
        return NextResponse.json({ error: 'Lead not assigned to this closer' }, { status: 403 });
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
