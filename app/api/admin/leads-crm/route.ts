import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyAdminAuth } from "@/lib/admin-auth-server";

const prisma = new PrismaClient();

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
    const quizType = searchParams.get('quizType') || 'all';
    const status = searchParams.get('status') || 'all';
    const dateRange = searchParams.get('dateRange') || 'all';
    const search = searchParams.get('search') || '';

    // Build date filter
    const buildDateFilter = () => {
      if (dateRange === 'all') {
        return {};
      }

      const now = new Date();
      let startDate = new Date();

      switch (dateRange) {
        case '1d':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          return {};
      }

      return {
        gte: startDate,
        lte: now
      };
    };

    const dateFilter = buildDateFilter();

    // Get all completed quiz sessions (leads)
    const quizSessions = await prisma.quizSession.findMany({
      where: {
        status: 'completed',
        ...(quizType !== 'all' ? { quizType } : {}),
        ...(dateFilter.createdAt ? { createdAt: dateFilter } : {}),
      },
      orderBy: {
        completedAt: 'desc'
      },
      include: {
        answers: {
          include: {
            question: true
          }
        },
        result: true
      }
    });

    // Filter to only include sessions that have name and email (actual leads)
    const actualLeads = quizSessions.filter(session => {
      const nameAnswer = session.answers.find(a => 
        a.question?.prompt?.toLowerCase().includes('name') ||
        a.question?.text?.toLowerCase().includes('name')
      );
      const emailAnswer = session.answers.find(a => 
        a.question?.prompt?.toLowerCase().includes('email') ||
        a.question?.text?.toLowerCase().includes('email')
      );
      
      return nameAnswer && emailAnswer && nameAnswer.value && emailAnswer.value;
    });

    // Get all appointments
    const appointments = await prisma.appointment.findMany({
      include: {
        closer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Group appointments by email
    const appointmentsByEmail = appointments.reduce((acc, appointment) => {
      acc[appointment.customerEmail] = appointment;
      return acc;
    }, {} as Record<string, any>);

    // Get all affiliates for source mapping
    const affiliates = await prisma.affiliate.findMany({
      select: {
        id: true,
        name: true,
        referralCode: true
      }
    });

    const affiliateMap = affiliates.reduce((acc, affiliate) => {
      acc[affiliate.referralCode] = affiliate.name;
      return acc;
    }, {} as Record<string, string>);

    // Transform leads with comprehensive data
    const leadsWithFullData = actualLeads.map(lead => {
      const nameAnswer = lead.answers.find(a => 
        a.question?.prompt?.toLowerCase().includes('name') ||
        a.question?.text?.toLowerCase().includes('name')
      );
      const emailAnswer = lead.answers.find(a => 
        a.question?.prompt?.toLowerCase().includes('email') ||
        a.question?.text?.toLowerCase().includes('email')
      );

      const email = emailAnswer?.value as string;
      const appointment = email ? appointmentsByEmail[email] : null;

      // Determine status based on appointment outcome
      let status = 'Completed';
      let closerAssigned = null;
      let callOutcome = null;
      let saleValue = null;
      let notes = null;
      let scheduledAt = null;
      let callHistory = [];

      if (appointment) {
        closerAssigned = appointment.closer;
        callOutcome = appointment.outcome;
        saleValue = appointment.saleValue;
        notes = appointment.notes;
        scheduledAt = appointment.scheduledAt;

        // Build call history
        if (appointment.outcome) {
          callHistory.push({
            date: appointment.scheduledAt,
            outcome: appointment.outcome,
            closer: appointment.closer?.name || 'Unknown',
            notes: appointment.notes,
            saleValue: appointment.saleValue
          });
        }

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
      }

      // Determine source
      const source = lead.affiliateCode 
        ? `Affiliate (${affiliateMap[lead.affiliateCode] || lead.affiliateCode})`
        : 'Website';

      // Get all quiz sessions for this email (cross-quiz data)
      const allSessionsForEmail = actualLeads.filter(s => {
        const sEmailAnswer = s.answers.find(a => 
          a.question?.prompt?.toLowerCase().includes('email') ||
          a.question?.text?.toLowerCase().includes('email')
        );
        return sEmailAnswer?.value === email;
      });

      return {
        id: lead.id,
        sessionId: lead.id,
        name: nameAnswer?.value || 'N/A',
        email: email || 'N/A',
        date: lead.createdAt,
        completedAt: lead.completedAt,
        quizType: lead.quizType,
        status,
        source,
        closerAssigned,
        callOutcome,
        saleValue,
        notes,
        scheduledAt,
        callHistory,
        // Quiz-specific data
        answers: lead.answers.map(answer => ({
          questionId: answer.questionId,
          questionText: answer.question?.prompt || answer.question?.text || 'Unknown question',
          answer: answer.value,
        })),
        result: lead.result ? {
          archetype: lead.result.archetype,
          score: lead.result.score,
          insights: lead.result.insights || [],
        } : null,
        // Cross-quiz data
        totalQuizzesCompleted: allSessionsForEmail.length,
        allQuizTypes: allSessionsForEmail.map(s => s.quizType),
        // Additional stats
        durationMs: lead.durationMs,
        utmSource: lead.utmSource,
        utmMedium: lead.utmMedium,
        utmCampaign: lead.utmCampaign,
      };
    });

    // Apply search filter
    let filteredLeads = leadsWithFullData;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredLeads = leadsWithFullData.filter(lead => 
        lead.name.toLowerCase().includes(searchLower) ||
        lead.email.toLowerCase().includes(searchLower) ||
        lead.sessionId.toLowerCase().includes(searchLower) ||
        lead.source.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (status !== 'all') {
      filteredLeads = filteredLeads.filter(lead => {
        if (status === 'completed') return lead.status === 'Completed';
        if (status === 'booked') return lead.status === 'Booked';
        if (status === 'purchased') return lead.status === 'Purchased (Call)';
        if (status === 'not_interested') return lead.status === 'Not Interested';
        if (status === 'needs_follow_up') return lead.status === 'Needs Follow Up';
        if (status === 'wrong_number') return lead.status === 'Wrong Number';
        if (status === 'no_answer') return lead.status === 'No Answer';
        if (status === 'callback_requested') return lead.status === 'Callback Requested';
        if (status === 'rescheduled') return lead.status === 'Rescheduled';
        return true;
      });
    }

    // Get summary stats
    const totalLeads = filteredLeads.length;
    const purchasedLeads = filteredLeads.filter(l => l.status === 'Purchased (Call)').length;
    const bookedLeads = filteredLeads.filter(l => l.status === 'Booked').length;
    const completedLeads = filteredLeads.filter(l => l.status === 'Completed').length;
    const totalRevenue = filteredLeads
      .filter(l => l.saleValue)
      .reduce((sum, l) => sum + (Number(l.saleValue) || 0), 0);

    return NextResponse.json({
      success: true,
      leads: filteredLeads,
      stats: {
        totalLeads,
        purchasedLeads,
        bookedLeads,
        completedLeads,
        totalRevenue,
        conversionRate: totalLeads > 0 ? (purchasedLeads / totalLeads) * 100 : 0,
        bookingRate: totalLeads > 0 ? (bookedLeads / totalLeads) * 100 : 0,
      }
    });

  } catch (error) {
    console.error("Error fetching CRM leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch CRM leads" },
      { status: 500 }
    );
  }
}
