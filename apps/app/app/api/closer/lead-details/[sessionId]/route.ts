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
    let email = emailAnswer?.value ? String(emailAnswer.value) : null;

    // Get appointment - try by email first, then by session ID
    let appointment = null;
    if (email) {
      appointment = await prisma.appointment.findFirst({
        where: {
          customerEmail: email,
          closerId: closerId
        },
        include: {
          closer: true
        }
      });
    }

    // If no appointment found by email, try finding by closer ID and session timeframe
    if (!appointment) {
      appointment = await prisma.appointment.findFirst({
        where: {
          closerId: closerId,
          // Match by customer name if available
          ...(nameAnswer?.value && {
            customerName: {
              contains: String(nameAnswer.value),
              mode: 'insensitive' as const
            }
          })
        },
        include: {
          closer: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    // 🔒 SECURITY: Verify this closer is assigned to this lead
    // Check if closer has either:
    // 1. An appointment for this lead, OR
    // 2. Tasks assigned for this lead
    const hasAppointment = appointment && appointment.closerId === closerId;

    let hasTasks = false;
    if (email && !hasAppointment) {
      const tasksCount = await prisma.task.count({
        where: {
          leadEmail: email,
          closerId: closerId
        }
      });
      hasTasks = tasksCount > 0;
    }

    if (!hasAppointment && !hasTasks) {
      return NextResponse.json(
        { error: "Forbidden - This lead is not assigned to you" },
        { status: 403 }
      );
    }

    // Use appointment email if quiz answers don't have email
    if (!email && appointment) {
      email = appointment.customerEmail;
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
        score: typeof quizSession.result.scores === 'object' && quizSession.result.scores !== null
          ? (quizSession.result.scores as any).total || 0
          : 0,
        insights: [],
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
          questionText: answer.question?.prompt || "Unknown question",
          answer: displayAnswer,
          answerValue: answerValue,
        };
      }),
      user: {
        email: email || "N/A",
        name: nameAnswer?.value ? (typeof nameAnswer.value === 'string' ? nameAnswer.value : JSON.stringify(nameAnswer.value)) : "N/A",
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
        createdAt: (appointment.createdAt || new Date()).toISOString(),
        updatedAt: (appointment.updatedAt || new Date()).toISOString(),
      } : null,
      dealClosedAt: appointment?.outcome === 'converted' ? (appointment.updatedAt || new Date()).toISOString() : null,
      source: source, // Include calculated source
      extractedEmail: email, // Include extracted email for task creation
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
