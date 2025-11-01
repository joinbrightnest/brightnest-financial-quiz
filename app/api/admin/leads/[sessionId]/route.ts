import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/admin-auth-server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin authentication required" },
      { status: 401 }
    );
  }
  
  try {
    const { sessionId } = await params;

    // Get the quiz session with all related data
    const quizSession = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        user: true,
        result: true,
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!quizSession) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    // Get affiliate information if this session has an affiliate code
    let affiliate = null;
    if (quizSession.affiliateCode) {
      // First try to find by referral code
      affiliate = await prisma.affiliate.findUnique({
        where: { referralCode: quizSession.affiliateCode },
        select: {
          name: true,
          referralCode: true,
        }
      });

      // If not found, try to find by custom tracking link
      if (!affiliate) {
        const affiliateResult = await prisma.$queryRaw`
          SELECT "name", "referral_code"
          FROM "affiliates"
          WHERE "custom_tracking_link" = ${`/${quizSession.affiliateCode}`}
          LIMIT 1
        `;
        
        if (Array.isArray(affiliateResult) && affiliateResult.length > 0) {
          affiliate = {
            name: affiliateResult[0].name,
            referralCode: affiliateResult[0].referral_code,
          };
        }
      }
    }

    // Extract name and email from quiz answers (like general admin CRM)
    const nameAnswer = quizSession.answers.find(a =>
      a.question?.prompt?.toLowerCase().includes("name") ||
      a.question?.text?.toLowerCase().includes("name")
    );
    const emailAnswer = quizSession.answers.find(a =>
      a.question?.prompt?.toLowerCase().includes("email") ||
      a.question?.text?.toLowerCase().includes("email")
    );

    // Get appointment data if it exists (to show deal close date)
    const email = emailAnswer?.value || emailAnswer?.answer || emailAnswer?.answerValue;
    let appointment = null;
    let affiliateConversion = null;
    
    if (email && typeof email === 'string') {
      appointment = await prisma.appointment.findFirst({
        where: {
          customerEmail: email.toLowerCase()
        }
      });
      
      // Get the affiliate conversion record to get the actual close date
      // Match by quiz session ID first (most accurate), fall back to matching by affiliate + time
      if (appointment && appointment.outcome === 'converted' && quizSession.affiliateCode) {
        const affiliateRecord = await prisma.affiliate.findUnique({
          where: { referralCode: quizSession.affiliateCode }
        });
        
        if (affiliateRecord) {
          // Try to find conversion record linked to this specific quiz session
          affiliateConversion = await prisma.affiliateConversion.findFirst({
            where: {
              affiliateId: affiliateRecord.id,
              conversionType: 'sale',
              // Some conversions might have quizSessionId, use it if available
              OR: [
                { quizSessionId: quizSession.id },
                // Fall back to matching by time window (within 1 day of appointment update)
                {
                  createdAt: {
                    gte: new Date(new Date(appointment.updatedAt).getTime() - 60 * 60 * 1000), // 1 hour before
                    lte: new Date(new Date(appointment.updatedAt).getTime() + 60 * 60 * 1000), // 1 hour after
                  }
                }
              ]
            },
            orderBy: {
              createdAt: 'desc'
            }
          });
          
          console.log('🔍 Deal close date lookup for', quizSession.id);
          console.log('   Quiz completed:', quizSession.completedAt);
          console.log('   Appointment updated:', appointment?.updatedAt);
          console.log('   Conversion found:', affiliateConversion ? 'YES' : 'NO');
          console.log('   Conversion created:', affiliateConversion?.createdAt);
        }
      }
    }

    // Determine status based on appointment outcome (same logic as basic-stats route)
    let status = 'Completed'; // Default for completed quiz sessions
    if (appointment) {
      if (appointment.outcome) {
        // Show actual call outcome (same as admin basic-stats route)
        switch (appointment.outcome) {
          case 'converted':
            status = 'Purchased (Call)';
            break;
          case 'not_interested':
            status = 'Not Interested';
            break;
          case 'needs_follow_up':
            status = 'Needs Follow Up';
            break;
          case 'wrong_number':
            status = 'Wrong Number';
            break;
          case 'no_answer':
            status = 'No Answer';
            break;
          case 'callback_requested':
            status = 'Callback Requested';
            break;
          case 'rescheduled':
            status = 'Rescheduled';
            break;
          default:
            status = 'Booked';
        }
      } else {
        // Appointment exists but no outcome yet
        status = 'Booked';
      }
    }

    // Determine source based on affiliate (same logic as basic-stats route)
    let source = 'Website'; // Default
    if (affiliate) {
      source = affiliate.name;
    }

    // Transform the data for the lead details view
    const leadData = {
      id: quizSession.id,
      sessionId: quizSession.id,
      quizType: quizSession.quizType,
      startedAt: quizSession.startedAt.toISOString(),
      completedAt: quizSession.completedAt?.toISOString() || null,
      status: status, // Use calculated status, not raw quizSession.status
      durationMs: quizSession.durationMs,
      result: quizSession.result ? {
        archetype: quizSession.result.archetype,
        score: quizSession.result.score,
        insights: quizSession.result.insights || [],
      } : null,
      answers: quizSession.answers.map(answer => ({
        questionId: answer.questionId,
        questionText: answer.question?.prompt || answer.question?.text || "Unknown question",
        answer: answer.value,
        answerValue: answer.value,
      })),
      user: {
        email: email || "N/A",
        name: nameAnswer?.value || nameAnswer?.answer || nameAnswer?.answerValue || "N/A",
        role: "user",
      },
      affiliate: affiliate ? {
        name: affiliate.name,
        referralCode: affiliate.referralCode,
      } : null,
      appointment: appointment ? {
        id: appointment.id,
        outcome: appointment.outcome,
        saleValue: appointment.saleValue ? Number(appointment.saleValue) : null,
        scheduledAt: appointment.scheduledAt.toISOString(),
        createdAt: appointment.createdAt.toISOString(),
        updatedAt: appointment.updatedAt.toISOString(),
      } : null,
      dealClosedAt: affiliateConversion ? affiliateConversion.createdAt.toISOString() : null,
      source: source, // Include calculated source
    };

    return NextResponse.json(leadData);
  } catch (error) {
    console.error("Error fetching lead data:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead data" },
      { status: 500 }
    );
  }
}
