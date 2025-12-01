import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/admin-auth-server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin authentication required" },
      { status: 401 }
    );
  }

  try {
    const { id: affiliateId } = await params;

    // Get affiliate data using raw SQL to include customTrackingLink
    const affiliateResult = await prisma.$queryRaw`
      SELECT * FROM "affiliates" 
      WHERE "id" = ${affiliateId}
      LIMIT 1
    `;

    const affiliate = Array.isArray(affiliateResult) && affiliateResult.length > 0
      ? affiliateResult[0]
      : null;

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Get all quiz sessions attributed to this affiliate
    // Include both original referral code and custom tracking link
    const whereClause = affiliate.custom_tracking_link
      ? {
        OR: [
          { affiliateCode: affiliate.referral_code },
          { affiliateCode: affiliate.custom_tracking_link.replace('/', '') }
        ]
      }
      : {
        affiliateCode: affiliate.referral_code,
      };

    const allQuizSessions = await prisma.quizSession.findMany({
      where: whereClause,
      include: {
        user: true,
        result: true,
        answers: {
          include: {
            question: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Filter to only include sessions that have name and email (actual leads)
    // A lead is someone who completed the quiz AND provided contact information
    const quizSessionsWithContactInfo = allQuizSessions.filter(session => {
      const nameAnswer = session.answers.find(a =>
        a.question?.prompt?.toLowerCase().includes("name")
      );
      const emailAnswer = session.answers.find(a =>
        a.question?.prompt?.toLowerCase().includes("email")
      );

      return nameAnswer && emailAnswer && nameAnswer.value && emailAnswer.value;
    });

    // Fetch all appointments for these leads to determine accurate status
    // Extract emails from quiz sessions
    const leadEmails = quizSessionsWithContactInfo.map(session => {
      const emailAnswer = session.answers.find(a =>
        a.question?.prompt?.toLowerCase().includes("email")
      );
      const emailValue = emailAnswer?.value;
      if (typeof emailValue === 'string') return emailValue.toLowerCase();
      if (typeof emailValue === 'object' && emailValue !== null) {
        const email = (emailValue as Record<string, unknown>).value || (emailValue as Record<string, unknown>).text;
        return email ? String(email).toLowerCase() : '';
      }
      return '';
    }).filter(email => email);

    // Fetch appointments for these emails
    const appointments = await prisma.appointment.findMany({
      where: {
        customerEmail: {
          in: leadEmails
        }
      }
    });

    // Create email -> appointment map for quick lookup
    const appointmentsByEmail = appointments.reduce((acc, apt) => {
      acc[apt.customerEmail.toLowerCase()] = apt;
      return acc;
    }, {} as Record<string, any>);

    // Transform the data for the CRM view
    const allLeads = quizSessionsWithContactInfo.map(session => {
      // Extract name and email from quiz answers (like general admin CRM)
      // Look for questions containing "name" or "email" in the prompt
      const nameAnswer = session.answers.find(a =>
        a.question?.prompt?.toLowerCase().includes("name")
      );
      const emailAnswer = session.answers.find(a =>
        a.question?.prompt?.toLowerCase().includes("email")
      );

      // Extract value from JSON if needed
      const getNameValue = (answer: typeof nameAnswer) => {
        if (!answer?.value) return "N/A";
        const value = answer.value as unknown;
        if (typeof value === 'string') return value;
        if (typeof value === 'object' && value !== null) {
          return (value as Record<string, unknown>).value as string || (value as Record<string, unknown>).text as string || JSON.stringify(value);
        }
        return String(value);
      };

      const getEmailValue = (answer: typeof emailAnswer) => {
        if (!answer?.value) return "N/A";
        const value = answer.value as unknown;
        if (typeof value === 'string') return value;
        if (typeof value === 'object' && value !== null) {
          return (value as Record<string, unknown>).value as string || (value as Record<string, unknown>).text as string || JSON.stringify(value);
        }
        return String(value);
      };

      const nameValue = getNameValue(nameAnswer);
      const emailValue = getEmailValue(emailAnswer);

      // Determine status based on appointment (same logic as basic-stats)
      let status = session.status; // Default from DB
      const appointment = emailValue ? appointmentsByEmail[emailValue.toLowerCase()] : null;

      if (appointment) {
        if (appointment.outcome) {
          // Show actual call outcome
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

      return {
        id: session.id,
        sessionId: session.id,
        quizType: session.quizType,
        name: nameValue,
        email: emailValue,
        startedAt: session.startedAt.toISOString(),
        completedAt: session.completedAt?.toISOString() || null,
        status, // Use updated status instead of session.status
        durationMs: session.durationMs,
        result: session.result ? {
          archetype: session.result.archetype,
          score: typeof session.result.scores === 'object' && session.result.scores !== null
            ? (session.result.scores as Record<string, number>).total || 0
            : 0,
          insights: [],
        } : null,
        answers: session.answers.map(answer => ({
          questionId: answer.questionId,
          questionText: answer.question?.prompt || "Unknown question",
          answer: JSON.stringify(answer.value),
          answerValue: typeof answer.value === 'number' ? answer.value : 0,
        })),
        user: {
          email: emailValue,
          name: nameValue,
          role: "user",
        },
      };
    });

    // Deduplicate by email - keep only the most recent quiz session for each email
    // This prevents duplicate leads when someone completes the quiz multiple times
    const leadsByEmail = new Map();
    for (const lead of allLeads) {
      const existingLead = leadsByEmail.get(lead.email);
      if (!existingLead || new Date(lead.completedAt || lead.startedAt) > new Date(existingLead.completedAt || existingLead.startedAt)) {
        leadsByEmail.set(lead.email, lead);
      }
    }
    const leads = Array.from(leadsByEmail.values());

    // Calculate CRM stats - count all leads (we already filtered for contact info)
    const totalLeads = leads.length;
    const completedLeads = leads.filter(lead =>
      lead.status.toLowerCase() === "completed" || lead.status === "Completed"
    ).length;
    const totalCompletions = completedLeads;
    const completionRate = leads.length > 0 ? (completedLeads / leads.length) * 100 : 0;
    const averageCompletionTime = totalCompletions > 0
      ? leads
        .filter(lead => lead.durationMs)
        .reduce((sum, lead) => sum + (lead.durationMs || 0), 0) / totalCompletions / 60000 // Convert to minutes
      : 0;

    // Get distinct archetypes
    const archetypes = leads
      .filter(lead => lead.result?.archetype)
      .map(lead => lead.result!.archetype);
    const distinctArchetypes = [...new Set(archetypes)];

    // Quiz type distribution (all leads)
    const quizTypeCounts: { [key: string]: number } = {};
    leads.forEach(lead => {
      quizTypeCounts[lead.quizType] = (quizTypeCounts[lead.quizType] || 0) + 1;
    });

    const quizTypeDistribution = Object.entries(quizTypeCounts).map(([quizType, count]) => ({
      quizType,
      count,
      percentage: totalLeads > 0 ? (count / totalLeads) * 100 : 0,
    })).filter(item => item.count > 0); // Only show quiz types that have completed leads

    // Archetype distribution
    const archetypeCounts: { [key: string]: number } = {};
    archetypes.forEach(archetype => {
      archetypeCounts[archetype] = (archetypeCounts[archetype] || 0) + 1;
    });

    const archetypeDistribution = Object.entries(archetypeCounts).map(([archetype, count]) => ({
      archetype,
      count,
      percentage: totalLeads > 0 ? (count / totalLeads) * 100 : 0,
    }));

    const stats = {
      totalLeads,
      totalCompletions,
      completionRate,
      averageCompletionTime,
      distinctArchetypes: distinctArchetypes.length,
      quizTypeDistribution,
      archetypeDistribution,
    };

    // Return all leads (status is now determined by appointment)
    return NextResponse.json({
      leads,
      stats,
    });
  } catch (error) {
    console.error("Error fetching affiliate CRM data:", error);
    return NextResponse.json(
      { error: "Failed to fetch CRM data" },
      { status: 500 }
    );
  }
}
