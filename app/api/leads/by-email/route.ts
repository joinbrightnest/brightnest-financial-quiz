import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

    // Allow both closer and admin to access this endpoint
    if (decoded.role !== 'closer' && decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Find the lead by email in quiz answers
    const quizSessions = await prisma.quizSession.findMany({
      where: {
        answers: {
          some: {
            value: {
              contains: email.toLowerCase()
            }
          }
        }
      },
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
      take: 1
    });

    if (quizSessions.length === 0) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    const lead = quizSessions[0];

    // Get appointment separately if it exists, matching by customer email
    const appointment = await prisma.appointment.findFirst({
      where: {
        customerEmail: email.toLowerCase()
      }
    });

    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        answers: lead.answers,
        appointment: appointment,
        status: lead.status,
        createdAt: lead.createdAt,
        completedAt: lead.completedAt
      }
    });

  } catch (error) {
    console.error('Error fetching lead by email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

