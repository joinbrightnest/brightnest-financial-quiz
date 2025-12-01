import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@brightnest/shared';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadEmail = searchParams.get('leadEmail');

    if (!leadEmail) {
      return NextResponse.json({ error: 'Lead email is required' }, { status: 400 });
    }

    const notes = await prisma.note.findMany({
      where: {
        leadEmail: leadEmail,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadEmail, content, createdBy, createdByType } = body;

    if (!leadEmail || !content) {
      return NextResponse.json({ error: 'Lead email and content are required' }, { status: 400 });
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
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}

