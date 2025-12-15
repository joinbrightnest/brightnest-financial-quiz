import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { emailQuerySchema, parseQueryParams } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    // 🔒 SECURITY: Require JWT_SECRET (no fallback)
    const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!JWT_SECRET) {
      console.error('FATAL: JWT_SECRET or NEXTAUTH_SECRET environment variable is required');
      return NextResponse.json(
        { error: 'Authentication configuration error' },
        { status: 500 }
      );
    }

    // Try to get token from Authorization header first, then from cookie
    let token: string | undefined;
    const authHeader = request.headers.get('authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Fallback to cookie-based auth (for closer portal)
      token = request.cookies.get('closerToken')?.value;
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

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

    // Find the lead by email in quiz answers using raw SQL
    // (Prisma's string_contains with mode: 'insensitive' doesn't work on JSON fields)
    const emailLower = email.toLowerCase();

    // Use raw SQL to cast JSON to text and search case-insensitively
    const matchingAnswers = await prisma.$queryRaw<{ sessionId: string }[]>`
      SELECT DISTINCT "sessionId"
      FROM "quiz_answers"
      WHERE LOWER(CAST(value AS TEXT)) LIKE ${`%${emailLower}%`}
      LIMIT 1
    `;

    let matchingSession = null;

    if (matchingAnswers.length > 0) {
      // Found via direct query - fetch the full session
      matchingSession = await prisma.quizSession.findUnique({
        where: { id: matchingAnswers[0].sessionId },
        include: {
          answers: {
            include: {
              question: true
            }
          }
        }
      });
    } else {
      // Fallback: Try to find by appointment's customerEmail (in case quiz answer structure differs)
      const appointmentMatch = await prisma.appointment.findFirst({
        where: { customerEmail: emailLower },
        select: { customerEmail: true }
      });

      if (appointmentMatch) {
        // Search for session with this email in any JSON format
        // Use raw query for JSON search as a fallback
        const rawResults = await prisma.$queryRaw<{ id: string }[]>`
          SELECT DISTINCT qs.id
          FROM "QuizSession" qs
          JOIN "QuizAnswer" qa ON qa."sessionId" = qs.id
          WHERE LOWER(CAST(qa.value AS TEXT)) LIKE ${`%${emailLower}%`}
          ORDER BY qs."createdAt" DESC
          LIMIT 1
        `;

        if (rawResults.length > 0) {
          matchingSession = await prisma.quizSession.findUnique({
            where: { id: rawResults[0].id },
            include: {
              answers: {
                include: {
                  question: true
                }
              }
            }
          });
        }
      }
    }

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

