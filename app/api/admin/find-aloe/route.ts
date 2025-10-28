import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/admin-auth-server';

export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find appointments first (easier to search)
    const appointments = await prisma.appointment.findMany({
      where: {
        customerEmail: {
          contains: 'kdsak',
          mode: 'insensitive'
        }
      },
      include: {
        closer: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    // Get all recent quiz sessions and filter in JS
    const allSessions = await prisma.quizSession.findMany({
      include: {
        answers: {
          include: {
            question: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    // Filter sessions that have "kdsak" in any answer
    const sessions = allSessions.filter(s => 
      s.answers.some(a => {
        const val = String(a.value || '').toLowerCase();
        return val.includes('kdsak');
      })
    ).slice(0, 5);

    return NextResponse.json({
      sessions: sessions.map(s => ({
        sessionId: s.id,
        status: s.status,
        createdAt: s.createdAt,
        completedAt: s.completedAt,
        email: s.answers.find(a => a.value && typeof a.value === 'string' && (a.value as string).includes('@'))?.value,
        name: s.answers.find(a => a.question?.prompt?.toLowerCase().includes('name'))?.value,
      })),
      appointments: appointments.map(a => ({
        id: a.id,
        customerName: a.customerName,
        customerEmail: a.customerEmail,
        outcome: a.outcome,
        status: a.status,
        updatedAt: a.updatedAt,
        closerName: a.closer?.name,
      })),
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

