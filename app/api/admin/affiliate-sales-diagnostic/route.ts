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
    // Get all affiliates
    const affiliates = await prisma.affiliate.findMany({
      where: {
        isApproved: true,
      },
      select: {
        id: true,
        referralCode: true,
        name: true,
      },
    });

    const diagnosticResults = [];

    // For each affiliate, check their sales
    for (const affiliate of affiliates) {
      // Get all converted appointments for this affiliate
      const affiliateSales = await prisma.appointment.findMany({
        where: {
          affiliateCode: affiliate.referralCode,
          outcome: 'converted',
        },
        select: {
          id: true,
          customerName: true,
          customerEmail: true,
          saleValue: true,
          createdAt: true,
          updatedAt: true,
          calendlyEventId: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Get all completed quiz sessions for this affiliate
      const completedSessions = await prisma.quizSession.findMany({
        where: {
          affiliateCode: affiliate.referralCode,
          status: 'completed',
        },
        select: {
          id: true,
          createdAt: true,
          completedAt: true,
        },
      });

      // Get emails from completed quiz sessions
      const completedSessionIds = completedSessions.map(s => s.id);
      const completedSessionEmails = new Set<string>();
      
      if (completedSessionIds.length > 0) {
        const emailAnswers = await prisma.quizAnswer.findMany({
          where: {
            sessionId: { in: completedSessionIds },
            OR: [
              { question: { type: 'email' } },
              { question: { prompt: { contains: 'email' } } },
              { question: { prompt: { contains: 'Email' } } }
            ]
          },
          include: {
            question: true,
            session: {
              select: {
                id: true,
                affiliateCode: true,
              }
            }
          }
        });

        emailAnswers.forEach(answer => {
          if (answer.value) {
            const email = String(answer.value).toLowerCase().trim();
            completedSessionEmails.add(email);
          }
        });
      }

      // Check each sale for matching quiz session
      const salesAnalysis = affiliateSales.map(sale => {
        const appointmentEmail = sale.customerEmail?.toLowerCase().trim();
        const hasMatchingQuizSession = appointmentEmail && completedSessionEmails.has(appointmentEmail);

        return {
          appointmentId: sale.id,
          customerName: sale.customerName,
          customerEmail: sale.customerEmail, // Email used in Calendly
          saleValue: sale.saleValue ? Number(sale.saleValue) : null,
          calendlyEventId: sale.calendlyEventId,
          createdAt: sale.createdAt.toISOString(),
          updatedAt: sale.updatedAt.toISOString(),
          hasMatchingQuizSession,
          affiliateCode: affiliate.referralCode,
          affiliateName: affiliate.name,
        };
      });

      if (salesAnalysis.length > 0) {
        diagnosticResults.push({
          affiliate: {
            id: affiliate.id,
            name: affiliate.name,
            referralCode: affiliate.referralCode,
          },
          totalSales: salesAnalysis.length,
          salesWithQuiz: salesAnalysis.filter(s => s.hasMatchingQuizSession).length,
          salesWithoutQuiz: salesAnalysis.filter(s => !s.hasMatchingQuizSession).length,
          sales: salesAnalysis,
        });
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalAffiliates: diagnosticResults.length,
        totalSales: diagnosticResults.reduce((sum, aff) => sum + aff.totalSales, 0),
        salesWithQuiz: diagnosticResults.reduce((sum, aff) => sum + aff.salesWithQuiz, 0),
        salesWithoutQuiz: diagnosticResults.reduce((sum, aff) => sum + aff.salesWithoutQuiz, 0),
      },
      details: diagnosticResults,
    });
  } catch (error) {
    console.error("Error in affiliate sales diagnostic:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch diagnostic data",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

