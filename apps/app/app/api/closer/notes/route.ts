import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCloserIdFromToken } from '@/lib/closer-auth';

export async function POST(req: NextRequest) {
  try {
    const closerId = getCloserIdFromToken(req);
    console.log('[Note Creation] closerId:', closerId);
    
    if (!closerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('[Note Creation] Request body:', body);
    
    const { leadEmail, content } = body;

    if (!leadEmail || !content) {
      console.log('[Note Creation] Missing leadEmail or content');
      return NextResponse.json({ error: 'Lead email and content are required' }, { status: 400 });
    }

    // Ensure leadEmail is a string
    const emailString = String(leadEmail);
    console.log('[Note Creation] Looking for appointment with email:', emailString);

    // Security check: Verify the closer is assigned to this lead
    const appointment = await prisma.appointment.findFirst({
        where: {
            customerEmail: emailString,
            closerId: closerId
        }
    });
    
    console.log('[Note Creation] Found appointment:', appointment?.id);
    
    if (!appointment) {
        console.log('[Note Creation] No appointment found for this closer and lead');
        return NextResponse.json({ error: 'Forbidden: You are not assigned to this lead.' }, { status: 403 });
    }

    const closer = await prisma.closer.findUnique({ where: { id: closerId } });
    const closerName = closer?.name || `Closer ${closerId}`;

    console.log('[Note Creation] Creating note...');
    const newNote = await prisma.note.create({
      data: {
        leadEmail: emailString,
        content: String(content),
        createdBy: closerName,
        createdByType: 'closer',
      },
    });

    console.log('[Note Creation] Note created:', newNote.id);

    // Also create an audit log for this event
    console.log('[Note Creation] Creating audit log...');
    await prisma.closerAuditLog.create({
      data: {
        closerId: closerId,
        action: 'note_added',
        details: {
          appointmentId: appointment.id,
          noteId: newNote.id,
          content: newNote.content,
        }
      }
    });

    console.log('[Note Creation] Success!');
    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error('[Note Creation] Error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
