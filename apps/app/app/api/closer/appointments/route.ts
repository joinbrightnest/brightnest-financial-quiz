import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateCloser } from '../auth-utils';

export async function GET(request: NextRequest) {
  try {
    // 🔒 SECURITY: Authenticate using httpOnly cookie or Authorization header
    const auth = authenticateCloser(request);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      );
    }

    // Get closer's appointments - only show uncontacted leads (no outcome yet)
    const appointments = await prisma.appointment.findMany({
      where: {
        closerId: auth.closerId,
        outcome: null // Only show appointments that haven't been contacted yet
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
      // 🚀 PERFORMANCE: Fetch ONLY relevant affiliates using a targeted query
      // This replaces the previous "load all affiliates" approach which was inefficient
      const relevantAffiliates = await prisma.affiliate.findMany({
        where: {
          OR: [
            { referralCode: { in: affiliateCodes } },
            // Check custom links (both precise match and potential '/code' format depending on storage)
            { customLink: { in: affiliateCodes } },
            { customLink: { in: affiliateCodes.map(c => `/${c}`) } }
          ]
        },
        select: {
          referralCode: true,
          name: true,
          customLink: true
        }
      });

      // Map affiliate codes to names
      affiliateCodes.forEach(code => {
        // Try exact referral code match first
        const exactMatch = relevantAffiliates.find(aff => aff.referralCode === code);
        if (exactMatch) {
          affiliateMap[code] = exactMatch.name;
          return;
        }

        // Try custom link match
        const customMatch = relevantAffiliates.find(aff =>
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
    console.error('❌ Error fetching closer appointments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
