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
    const name = searchParams.get("name");
    
    if (!name) {
      return NextResponse.json(
        { error: "Name parameter is required (e.g., ?name=aluna)" },
        { status: 400 }
      );
    }

    // Search for quiz sessions with this name in answers
    const allQuizSessions = await prisma.quizSession.findMany({
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
      take: 100
    });

    // Filter sessions that have the name in any answer
    const matchingSessions = allQuizSessions.filter(session => {
      return session.answers.some(answer => {
        const value = String(answer.value || '').toLowerCase();
        return value.includes(name.toLowerCase());
      });
    });

    const results = [];

    for (const session of matchingSessions) {
      // Find name and email from quiz answers
      const nameAnswer = session.answers.find(a => 
        (a.question?.prompt?.toLowerCase().includes('name') || 
         a.question?.type === 'text') &&
        String(a.value || '').toLowerCase().includes(name.toLowerCase())
      );
      
      const emailAnswer = session.answers.find(a => 
        a.question?.type === 'email' || 
        a.question?.prompt?.toLowerCase().includes('email')
      );

      const quizName = nameAnswer?.value || 'Unknown';
      const quizEmail = emailAnswer?.value ? String(emailAnswer.value) : null;

      // Find appointments matching the quiz email or name
      let appointment = null;
      if (quizEmail) {
        appointment = await prisma.appointment.findFirst({
          where: {
            OR: [
              { customerEmail: { equals: quizEmail, mode: 'insensitive' } },
              { customerName: { contains: quizName, mode: 'insensitive' } }
            ]
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

      results.push({
        quizSession: {
          sessionId: session.id,
          name: quizName,
          email: quizEmail, // Email from quiz
          affiliateCode: session.affiliateCode,
          status: session.status,
          createdAt: session.createdAt.toISOString(),
          completedAt: session.completedAt?.toISOString() || null,
        },
        appointment: appointment ? {
          appointmentId: appointment.id,
          calendlyName: appointment.customerName,
          calendlyEmail: appointment.customerEmail, // Email from Calendly
          outcome: appointment.outcome,
          saleValue: appointment.saleValue ? Number(appointment.saleValue) : null,
          affiliateCode: appointment.affiliateCode,
          calendlyEventId: appointment.calendlyEventId,
          createdAt: appointment.createdAt.toISOString(),
          updatedAt: appointment.updatedAt.toISOString(),
          emailMatch: quizEmail && appointment.customerEmail ? 
            quizEmail.toLowerCase().trim() === appointment.customerEmail.toLowerCase().trim() : 
            false
        } : null,
        emailComparison: {
          quizEmail: quizEmail || null,
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
    }

    return NextResponse.json({
      success: true,
      searchName: name,
      resultsFound: results.length,
      results: results
    });
  } catch (error) {
    console.error("Error finding lead emails:", error);
    return NextResponse.json(
      { 
        error: "Failed to find lead emails",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

