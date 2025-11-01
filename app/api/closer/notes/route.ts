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

    const { leadEmail, content } = await req.json();

    if (!leadEmail || !content) {
      return NextResponse.json({ error: 'Missing leadEmail or content' }, { status: 400 });
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

    const newNote = await prisma.note.create({
      data: {
        leadEmail,
        content,
        createdBy: closer?.name || `Closer ${closerId}`,
        createdByType: 'closer',
      },
    });

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
