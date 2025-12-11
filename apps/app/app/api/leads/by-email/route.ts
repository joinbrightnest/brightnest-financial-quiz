import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { emailQuerySchema, parseQueryParams } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // 🔒 SECURITY: Require JWT_SECRET (no fallback)
    const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!JWT_SECRET) {
      console.error('FATAL: JWT_SECRET or NEXTAUTH_SECRET environment variable is required');
      return NextResponse.json(
        { error: 'Authentication configuration error' },
        { status: 500 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string; closerId?: string };

    // Allow both closer and admin to access this endpoint
    if (decoded.role !== 'closer' && decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    // 🛡️ Validate query parameters
    const validation = parseQueryParams(emailQuerySchema, searchParams);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Find the lead by email in quiz answers - use simpler search
    const emailLower = email.toLowerCase();

    const quizSessions = await prisma.quizSession.findMany({
      include: {
        answers: {
          include: {
            question: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Filter sessions that have the email in their answers
    const matchingSession = quizSessions.find(session => {
      return session.answers.some(answer => {
        if (!answer.value) return false;
        const valueStr = typeof answer.value === 'string' ? answer.value : JSON.stringify(answer.value);
        return valueStr.toLowerCase().includes(emailLower);
      });
    });

    if (!matchingSession) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    const lead = matchingSession;

    // Get appointment separately if it exists, matching by customer email
    const appointment = await prisma.appointment.findFirst({
      where: {
        customerEmail: email.toLowerCase()
      }
    });

    // Get affiliate information if lead has affiliate code
    let source = 'Website'; // Default
    if (lead.affiliateCode) {
      // Find affiliate by referral code
      const affiliate = await prisma.affiliate.findFirst({
        where: {
          OR: [
            { referralCode: lead.affiliateCode },
            { customLink: `/${lead.affiliateCode}` },
            { customLink: lead.affiliateCode }
          ]
        },
        select: {
          name: true
        }
      });

      if (affiliate) {
        source = affiliate.name;
      }
    }

    // For deal close date, use appointment updatedAt when outcome is converted
    // This approximates when the deal was closed (when outcome was set)
    const dealClosedAt = appointment?.outcome === 'converted' && appointment?.updatedAt
      ? appointment.updatedAt.toISOString()
      : null;

    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        answers: lead.answers,
        appointment: appointment,
        status: lead.status,
        createdAt: lead.createdAt,
        completedAt: lead.completedAt,
        dealClosedAt: dealClosedAt, // When the deal was actually closed
        affiliateCode: lead.affiliateCode,
        source: source
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

