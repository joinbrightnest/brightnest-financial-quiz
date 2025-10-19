import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
      case '1d':
        filterStartDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        filterStartDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        filterStartDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        filterStartDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        filterStartDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        filterStartDate.setDate(now.getDate() - 30);
    }
    return { gte: filterStartDate };
  };

  const dateFilter = buildDateFilter();

  // Build where clause for quiz sessions
  const whereClause: any = {
    createdAt: dateFilter,
    status: "completed",
    ...(quizType ? { quizType } : {})
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

  // Get all completed sessions
  const allCompletedSessions = await prisma.quizSession.findMany({
    where: whereClause,
    include: {
      answers: {
        include: {
          question: true,
        },
      },
    },
  });

  // Get all appointments for this affiliate
  const allAppointments = await prisma.appointment.findMany({
    where: {
      affiliateCode: affiliateCode,
      createdAt: dateFilter,
    },
  });

  // Filter to only include sessions that have name and email (actual leads)
  const actualLeads = allCompletedSessions.filter(session => {
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

  // Combine quiz session leads and appointments
  const totalLeads = actualLeads.length + allAppointments.length;
  const allLeads = [
    ...actualLeads.map(session => ({
      type: 'quiz_session',
      id: session.id,
      customerName: session.answers.find(a => 
        a.question?.prompt?.toLowerCase().includes('name') ||
        a.question?.text?.toLowerCase().includes('name')
      )?.value || 'Unknown',
      customerEmail: session.answers.find(a => 
        a.question?.prompt?.toLowerCase().includes('email') ||
        a.question?.text?.toLowerCase().includes('email')
      )?.value || 'Unknown',
      createdAt: session.createdAt,
    })),
    ...allAppointments.map(appointment => ({
      type: 'appointment',
      id: appointment.id,
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
      createdAt: appointment.createdAt,
    }))
  ];

  return {
    totalLeads,
    leads: allLeads,
    allCompletedSessions: allCompletedSessions.length,
    allAppointments: allAppointments.length,
    leadConversionRate: allCompletedSessions.length > 0 ? (actualLeads.length / allCompletedSessions.length) * 100 : 0
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
