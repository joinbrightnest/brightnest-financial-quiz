import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCloserIdFromToken } from "@/lib/closer-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  // 🔒 SECURITY: Require closer authentication
  const closerId = getCloserIdFromToken(request);
  if (!closerId) {
    return NextResponse.json(
      { error: "Unauthorized - Closer authentication required" },
      { status: 401 }
    );
  }
  
  try {
    const { sessionId } = await params;

    // Get the quiz session with all related data (EXACT COPY FROM ADMIN)
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

    // Extract name and email from quiz answers
    const nameAnswer = quizSession.answers.find(
      a => a.question?.type === 'text' || a.question?.prompt.toLowerCase().includes('name')
    );
    
    const emailAnswer = quizSession.answers.find(
      a => a.question?.type === 'email' || a.question?.prompt.toLowerCase().includes('email')
    );
    const email = emailAnswer?.value ? String(emailAnswer.value) : null;

    // Get appointment
    let appointment = null;
    if (email) {
      appointment = await prisma.appointment.findFirst({
        where: { customerEmail: email },
        include: {
          closer: true
        }
      });
    }

    // 🔒 SECURITY: Verify this closer is assigned to this lead
    if (!appointment || appointment.closerId !== closerId) {
      return NextResponse.json(
        { error: "Forbidden - This lead is not assigned to you" },
        { status: 403 }
      );
    }

    // Determine status based on appointment outcome (same logic as admin dashboard)
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

    // Determine source based on affiliate code (same logic as admin)
    // Check both quiz session affiliate code AND appointment affiliate code (like admin basic-stats)
    let source = 'Website'; // Default
    let affiliate = null;
    const affiliateCodeToCheck = quizSession.affiliateCode || appointment?.affiliateCode;
    
    if (affiliateCodeToCheck) {
      // First try to find by referral code
      affiliate = await prisma.affiliate.findUnique({
        where: { referralCode: affiliateCodeToCheck },
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
          WHERE "custom_tracking_link" = ${`/${affiliateCodeToCheck}`}
          LIMIT 1
        `;
        
        if (Array.isArray(affiliateResult) && affiliateResult.length > 0) {
          affiliate = {
            name: affiliateResult[0].name,
            referralCode: affiliateResult[0].referral_code,
          };
        }
      }
      
      // Set source from affiliate name if found
      if (affiliate) {
        source = affiliate.name;
      }
    }

    // Transform the data for the lead details view (EXACT COPY FROM ADMIN)
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
      answers: quizSession.answers.map(answer => {
        // Get the answer value (could be string, number, etc.)
        const answerValue = answer.value;
        let displayAnswer = answerValue;
        
        // Try to find the label from question options if question type is single/multiple choice
        if (answer.question && (answer.question.type === 'single' || answer.question.type === 'multiple')) {
          try {
            const options = answer.question.options as any;
            if (Array.isArray(options)) {
              // Find matching option by value
              const matchingOption = options.find((opt: any) => {
                // Handle both string and JSON values
                if (typeof opt.value === 'string' && typeof answerValue === 'string') {
                  return opt.value === answerValue;
                }
                // Also try JSON string comparison
                return JSON.stringify(opt.value) === JSON.stringify(answerValue);
              });
              
              if (matchingOption && matchingOption.label) {
                displayAnswer = matchingOption.label;
              }
            }
          } catch (error) {
            // If parsing fails, fall back to raw value
            console.error('Error parsing question options:', error);
          }
        }
        
        // For text/email inputs, use the value directly (it's already the user's input)
        return {
          questionId: answer.questionId,
          questionText: answer.question?.prompt || answer.question?.text || "Unknown question",
          answer: displayAnswer,
          answerValue: answerValue,
        };
      }),
      user: {
        email: email || "N/A",
        name: nameAnswer?.value || nameAnswer?.answer || nameAnswer?.answerValue || "N/A",
        role: "user",
      },
      closer: appointment?.closer ? {
        id: appointment.closer.id,
        name: appointment.closer.name,
      } : null,
      appointment: appointment ? {
        id: appointment.id,
        outcome: appointment.outcome,
        saleValue: appointment.saleValue ? Number(appointment.saleValue) : null,
        scheduledAt: appointment.scheduledAt.toISOString(),
        createdAt: appointment.createdAt.toISOString(),
        updatedAt: appointment.updatedAt.toISOString(),
      } : null,
      dealClosedAt: appointment?.outcome === 'converted' ? appointment.updatedAt.toISOString() : null,
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
