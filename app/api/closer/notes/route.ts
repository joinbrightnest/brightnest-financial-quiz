import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCloserIdFromToken } from '@/lib/closer-auth';

export async function POST(req: NextRequest) {
  try {
    const closerId = getCloserIdFromToken(req);
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
      return NextResponse.json({ error: 'Lead session not found' }, { status: 404 });
    }

    const leadEmail = quizSession.answers.find(a => a.question?.prompt.toLowerCase().includes('email'))?.value;
    
    if (!leadEmail) {
      return NextResponse.json({ error: 'Could not find email for this lead' }, { status: 404 });
    }

    // Ensure a lead record exists, similar to admin logic
    let lead = await prisma.lead.findUnique({ where: { email: leadEmail } });
    if (!lead) {
      const name = quizSession.answers.find(a => a.question?.prompt.toLowerCase().includes('name'))?.value || 'N/A';
      const phone = quizSession.answers.find(a => a.question?.prompt.toLowerCase().includes('phone'))?.value || 'N/A';
      lead = await prisma.lead.create({
        data: {
          name: name,
          email: leadEmail,
          phone: phone,
          quizSessionId: sessionId
        }
      });
    }

    // Security check: Find the appointment to verify closer assignment
    const appointment = await prisma.appointment.findFirst({
        where: {
            customerEmail: leadEmail,
            closerId: closerId
        }
    });
    
    // We still require an appointment to authorize the closer to add a note
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
