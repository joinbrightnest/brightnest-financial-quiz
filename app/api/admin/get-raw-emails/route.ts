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
    const sessionId = searchParams.get("sessionId");
    const appointmentId = searchParams.get("appointmentId");
    const name = searchParams.get("name"); // Also support name search
    
    if (!sessionId && !appointmentId && !name) {
      return NextResponse.json(
        { error: "sessionId, appointmentId, or name parameter is required" },
        { status: 400 }
      );
    }

    let quizSession = null;
    let appointment = null;

    // Get quiz session directly by ID or by searching for name
    if (sessionId) {
      quizSession = await prisma.quizSession.findUnique({
        where: { id: sessionId },
        include: {
          answers: {
            include: {
              question: true
            }
          }
        }
      });
    } else if (name) {
      // Search by name
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
      
      quizSession = allSessions.find(session => {
        return session.answers.some(answer => {
          const value = String(answer.value || '').toLowerCase();
          return value.includes(name.toLowerCase());
        });
      }) || null;
    }

    // Get appointment directly by ID or by searching for name
    if (appointmentId) {
      appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        select: {
          id: true,
          customerName: true,
          customerEmail: true,
          outcome: true,
          saleValue: true,
          affiliateCode: true,
          calendlyEventId: true,
          createdAt: true,
          updatedAt: true,
        }
      });
    } else if (name && !appointment) {
      // Try to find appointment by name
      appointment = await prisma.appointment.findFirst({
        where: {
          customerName: { contains: name, mode: 'insensitive' }
        },
        select: {
          id: true,
          customerName: true,
          customerEmail: true,
          outcome: true,
          saleValue: true,
          affiliateCode: true,
          calendlyEventId: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    // Extract email from quiz session answers (RAW - no assumptions)
    let quizEmail = null;
    let quizName = null;
    let allQuizAnswers = [];
    
    if (quizSession) {
      allQuizAnswers = quizSession.answers.map(a => ({
        questionId: a.questionId,
        questionPrompt: a.question?.prompt || null,
        questionType: a.question?.type || null,
        answerValue: a.value,
        answerId: a.id
      }));
      
      // Find email answer - look for email type or email in prompt
      const emailAnswer = quizSession.answers.find(a => 
        a.question?.type === 'email' || 
        a.question?.prompt?.toLowerCase().includes('email')
      );
      
      if (emailAnswer) {
        quizEmail = emailAnswer.value ? String(emailAnswer.value) : null;
      }
      
      // Find name answer
      const nameAnswer = quizSession.answers.find(a => 
        a.question?.prompt?.toLowerCase().includes('name') ||
        (a.question?.type === 'text' && a.value && !a.value.includes('@'))
      );
      
      if (nameAnswer) {
        quizName = nameAnswer.value ? String(nameAnswer.value) : null;
      }
    }

    return NextResponse.json({
      success: true,
      quizSession: quizSession ? {
        sessionId: quizSession.id,
        name: quizName,
        email: quizEmail,
        affiliateCode: quizSession.affiliateCode,
        status: quizSession.status,
        createdAt: quizSession.createdAt.toISOString(),
        completedAt: quizSession.completedAt?.toISOString() || null,
        allAnswers: allQuizAnswers // Show ALL answers for debugging
      } : null,
      appointment: appointment ? {
        appointmentId: appointment.id,
        customerName: appointment.customerName,
        customerEmail: appointment.customerEmail, // RAW Calendly email
        outcome: appointment.outcome,
        saleValue: appointment.saleValue ? Number(appointment.saleValue) : null,
        affiliateCode: appointment.affiliateCode,
        calendlyEventId: appointment.calendlyEventId,
        createdAt: appointment.createdAt.toISOString(),
        updatedAt: appointment.updatedAt.toISOString(),
      } : null,
      emailComparison: {
        quizEmail: quizEmail,
        calendlyEmail: appointment?.customerEmail || null,
        emailsMatch: quizEmail && appointment?.customerEmail ? 
          quizEmail.toLowerCase().trim() === appointment.customerEmail.toLowerCase().trim() : 
          false,
        emailDifference: quizEmail && appointment?.customerEmail && 
          quizEmail.toLowerCase().trim() !== appointment.customerEmail.toLowerCase().trim() ?
          {
            quiz: quizEmail,
            calendly: appointment.customerEmail,
            normalizedQuiz: quizEmail.toLowerCase().trim(),
            normalizedCalendly: appointment.customerEmail.toLowerCase().trim()
          } : null
      }
    });
  } catch (error) {
    console.error("Error getting raw emails:", error);
    return NextResponse.json(
      { 
        error: "Failed to get raw emails",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

