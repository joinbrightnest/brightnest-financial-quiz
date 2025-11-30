import { prisma } from './prisma';
import { Prisma, QuizAnswer, QuizQuestion } from '@prisma/client';

/**
 * Centralized lead calculation function - SINGLE SOURCE OF TRUTH
 * 
 * A lead is defined as: A completed quiz session that has both name AND email answers
 * This ensures consistency across all APIs and components
 */
export async function calculateLeads(params: {
  affiliateId?: string;
  affiliateCode?: string;
  dateRange?: string;
  startDate?: Date;
  endDate?: Date;
  quizType?: string;
}) {
  const { affiliateId, affiliateCode, dateRange = '30d', startDate, endDate, quizType } = params;

  // Build date filter
  const buildDateFilter = () => {
    if (startDate && endDate) {
      return {
        gte: startDate,
        lte: endDate
      };
    }

    const now = new Date();
    let filterStartDate = new Date();

    switch (dateRange) {
      case '24h':  // Handle '24h' parameter from frontend
      case '1d':
        filterStartDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        filterStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        filterStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        filterStartDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        filterStartDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        filterStartDate = new Date(0); // All time
        break;
      default:
        filterStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    return { gte: filterStartDate };
  };

  const dateFilter = buildDateFilter();

  // Get all active questions first to avoid N+1 queries
  const allQuestions = await prisma.quizQuestion.findMany({
    where: { active: true }
  });
  const questionMap = new Map(allQuestions.map(q => [q.id, q]));

  // Build where clause for quiz sessions
  const whereClause: Prisma.QuizSessionWhereInput = {
    createdAt: dateFilter,
    status: "completed",
    ...(quizType ? { quizType } : {}),
    // Optimization: Only fetch sessions that likely have an email (leads)
    answers: {
      some: {
        OR: [
          { question: { type: 'email' } },
          { question: { prompt: { contains: 'email', mode: 'insensitive' } } }
        ],
        value: { not: Prisma.DbNull }
      }
    }
  };

  // Add affiliate filter if provided
  if (affiliateId) {
    // Find affiliate by ID to get referral code
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
      select: { referralCode: true }
    });
    if (affiliate?.referralCode) {
      whereClause.affiliateCode = affiliate.referralCode;
    }
  } else if (affiliateCode) {
    whereClause.affiliateCode = affiliateCode;
  }

  // Get all completed sessions (leads)
  // We don't include question in the query to avoid N+1
  const allCompletedSessions = await prisma.quizSession.findMany({
    where: whereClause,
    include: {
      answers: true, // Fetch answers but NOT nested questions
    },
    orderBy: { createdAt: "desc" },
  });

  // Attach questions to answers in memory and filter for valid leads
  const actualLeads = allCompletedSessions.filter(session => {
    // Attach questions to answers
    session.answers.forEach((answer: QuizAnswer & { question?: QuizQuestion }) => {
      if (answer.questionId) {
        answer.question = questionMap.get(answer.questionId);
      }
    });

    const nameAnswer = session.answers.find((a: QuizAnswer & { question?: QuizQuestion }) =>
      a.question?.prompt?.toLowerCase().includes('name')
    );
    const emailAnswer = session.answers.find((a: QuizAnswer & { question?: QuizQuestion }) =>
      a.question?.prompt?.toLowerCase().includes('email') ||
      a.question?.type === 'email'
    );

    return nameAnswer && emailAnswer && nameAnswer.value && emailAnswer.value;
  });

  // Deduplicate by email - keep only the most recent quiz session for each email
  // This prevents duplicate leads when someone completes the quiz multiple times
  const leadsByEmail = new Map();
  for (const lead of actualLeads) {
    const emailAnswer = lead.answers.find((a: QuizAnswer & { question?: QuizQuestion }) =>
      a.question?.prompt?.toLowerCase().includes('email') ||
      a.question?.type === 'email'
    );
    const email = emailAnswer?.value ? String(emailAnswer.value) : null;

    if (email) {
      const existingLead = leadsByEmail.get(email);
      if (!existingLead || new Date(lead.completedAt || lead.createdAt) > new Date(existingLead.completedAt || existingLead.createdAt)) {
        leadsByEmail.set(email, lead);
      }
    }
  }
  const deduplicatedLeads = Array.from(leadsByEmail.values());

  return {
    totalLeads: deduplicatedLeads.length,
    leads: deduplicatedLeads,
    allCompletedSessions: allCompletedSessions.length,
    leadConversionRate: allCompletedSessions.length > 0 ? (deduplicatedLeads.length / allCompletedSessions.length) * 100 : 0
  };
}

/**
 * Calculate leads for a specific affiliate by ID
 */
export async function calculateAffiliateLeads(affiliateId: string, dateRange: string = '30d') {
  return calculateLeads({ affiliateId, dateRange });
}

/**
 * Calculate leads for a specific affiliate by referral code
 */
export async function calculateLeadsByCode(affiliateCode: string, dateRange: string = '30d') {
  return calculateLeads({ affiliateCode, dateRange });
}

/**
 * Calculate total leads across all affiliates
 */
export async function calculateTotalLeads(dateRange: string = '30d', quizType?: string) {
  return calculateLeads({ dateRange, quizType });
}

/**
 * Calculate leads with custom date range
 */
export async function calculateLeadsWithDateRange(startDate: Date, endDate: Date, affiliateId?: string, affiliateCode?: string) {
  return calculateLeads({ affiliateId, affiliateCode, startDate, endDate });
}
