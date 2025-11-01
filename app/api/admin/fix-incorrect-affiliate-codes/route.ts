import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/admin-auth-server";

export async function GET(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin authentication required" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action"); // "analyze" or "fix"
    const dryRun = action !== "fix"; // Default to dry run unless action=fix

    // Find appointments with affiliate codes
    const appointmentsWithAffiliateCodes = await prisma.appointment.findMany({
      where: {
        affiliateCode: { not: null }
      },
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        affiliateCode: true,
        createdAt: true,
        calendlyEventId: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const suspiciousAppointments = [];

    // Check each appointment for inconsistencies
    for (const appointment of appointmentsWithAffiliateCodes) {
      // Get quiz sessions with matching email
      const quizSessions = await prisma.quizSession.findMany({
        where: {
          answers: {
            some: {
              question: {
                prompt: { contains: 'email', mode: 'insensitive' }
              },
              value: appointment.customerEmail
            }
          }
        },
        select: {
          id: true,
          affiliateCode: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Find email answer more accurately
      const quizSessionsByEmail = await prisma.quizSession.findMany({
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
        take: 100 // Limit for performance
      });

      const matchingQuizSession = quizSessionsByEmail.find(session => {
        const emailAnswer = session.answers.find(a => 
          (a.question?.type === 'email' || 
           a.question?.prompt?.toLowerCase().includes('email')) &&
          a.value?.toString().toLowerCase() === appointment.customerEmail?.toLowerCase()
        );
        return !!emailAnswer;
      });

      // Check if appointment affiliate code doesn't match quiz session
      const isInconsistent = matchingQuizSession && 
        matchingQuizSession.affiliateCode !== appointment.affiliateCode &&
        matchingQuizSession.affiliateCode !== null;

      // Check if quiz session has no affiliate code but appointment does
      const hasNoQuizAffiliateButAppointmentHasOne = matchingQuizSession &&
        matchingQuizSession.affiliateCode === null &&
        appointment.affiliateCode !== null;

      if (isInconsistent || hasNoQuizAffiliateButAppointmentHasOne) {
        suspiciousAppointments.push({
          appointmentId: appointment.id,
          customerName: appointment.customerName,
          customerEmail: appointment.customerEmail,
          appointmentAffiliateCode: appointment.affiliateCode,
          quizAffiliateCode: matchingQuizSession?.affiliateCode || null,
          quizSessionId: matchingQuizSession?.id || null,
          createdAt: appointment.createdAt.toISOString(),
          issue: isInconsistent ? 'affiliate_code_mismatch' : 'appointment_has_affiliate_but_quiz_doesnt',
          suggestedFix: matchingQuizSession?.affiliateCode || null
        });
      }
    }

    // If action is "fix", update the appointments
    if (!dryRun && suspiciousAppointments.length > 0) {
      const updates = [];
      for (const appointment of suspiciousAppointments) {
        // Fix: Set affiliate code to match quiz session (or null if quiz has none)
        const newAffiliateCode = appointment.suggestedFix;
        
        try {
          await prisma.appointment.update({
            where: { id: appointment.appointmentId },
            data: {
              affiliateCode: newAffiliateCode
            }
          });
          
          updates.push({
            appointmentId: appointment.appointmentId,
            customerName: appointment.customerName,
            oldAffiliateCode: appointment.appointmentAffiliateCode,
            newAffiliateCode: newAffiliateCode,
            fixed: true
          });
        } catch (error) {
          console.error(`Error fixing appointment ${appointment.appointmentId}:`, error);
          updates.push({
            appointmentId: appointment.appointmentId,
            customerName: appointment.customerName,
            error: error instanceof Error ? error.message : 'Unknown error',
            fixed: false
          });
        }
      }

      return NextResponse.json({
        success: true,
        action: "fix",
        totalAnalyzed: appointmentsWithAffiliateCodes.length,
        suspiciousFound: suspiciousAppointments.length,
        fixed: updates.filter(u => u.fixed).length,
        failed: updates.filter(u => !u.fixed).length,
        updates: updates
      });
    }

    // Return analysis only (dry run)
    return NextResponse.json({
      success: true,
      action: "analyze",
      dryRun: true,
      totalAnalyzed: appointmentsWithAffiliateCodes.length,
      suspiciousFound: suspiciousAppointments.length,
      suspiciousAppointments: suspiciousAppointments,
      note: "To fix these, add ?action=fix to the URL"
    });

  } catch (error) {
    console.error("Error analyzing/fixing affiliate codes:", error);
    return NextResponse.json(
      { 
        error: "Failed to analyze/fix affiliate codes",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

