import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@brightnest/shared';
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
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string; closerId: string };

    if (decoded.role !== 'closer') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get all closer's appointments that have been contacted (have an outcome) - for database/follow-up view
    const appointments = await prisma.appointment.findMany({
      where: {
        closerId: decoded.closerId,
        outcome: {
          not: null // Only show appointments that have been contacted (have an outcome)
        }
      },
      orderBy: {
        scheduledAt: 'desc'
      },
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        scheduledAt: true,
        duration: true,
        status: true,
        outcome: true,
        notes: true,
        saleValue: true,
        commissionAmount: true,
        affiliateCode: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        createdAt: true,
        updatedAt: true,
        recordingLinkConverted: true,
        recordingLinkNotInterested: true,
        recordingLinkNeedsFollowUp: true,
        recordingLinkWrongNumber: true,
        recordingLinkNoAnswer: true,
        recordingLinkCallbackRequested: true,
        recordingLinkRescheduled: true,
      }
    });

    // Get unique affiliate codes from appointments
    const affiliateCodes = appointments
      .filter(apt => apt.affiliateCode)
      .map(apt => apt.affiliateCode!)
      .filter((code, index, self) => self.indexOf(code) === index); // Remove duplicates

    // Create a map of affiliate codes to names
    const affiliateMap: Record<string, string> = {};

    if (affiliateCodes.length > 0) {
      // Get all affiliates to match against (more flexible than OR with IN)
      const allAffiliates = await prisma.affiliate.findMany({
        select: {
          referralCode: true,
          name: true,
          customLink: true
        }
      });

      // Map affiliate codes to names
      affiliateCodes.forEach(code => {
        // Try exact referral code match first
        const exactMatch = allAffiliates.find(aff => aff.referralCode === code);
        if (exactMatch) {
          affiliateMap[code] = exactMatch.name;
          return;
        }

        // Try custom link match (check both with and without leading slash)
        const customMatch = allAffiliates.find(aff =>
          aff.customLink === `/${code}` || aff.customLink === code
        );
        if (customMatch) {
          affiliateMap[code] = customMatch.name;
        }
      });
    }

    // Add source information to each appointment
    const appointmentsWithSource = appointments.map(apt => ({
      ...apt,
      source: apt.affiliateCode
        ? (affiliateMap[apt.affiliateCode] || 'Affiliate')
        : 'Website'
    }));

    return NextResponse.json({
      success: true,
      appointments: appointmentsWithSource
    });

  } catch (error) {
    console.error('❌ Error fetching all closer appointments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

