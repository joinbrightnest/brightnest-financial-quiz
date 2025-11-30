import { NextRequest, NextResponse } from "next/server";
import { calculateTotalLeads, calculateLeadsByCode, calculateLeads } from "@/lib/lead-calculation";
import { getLeadStatuses } from "@/lib/lead-status";
import { verifyAdminAuth } from "@/lib/admin-auth-server";
import { prisma } from "@/lib/prisma";
import { Redis } from '@upstash/redis';
import { ADMIN_CONSTANTS } from '@/app/admin/constants';

// Initialize Redis client for caching (optional)
let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
    console.log('✅ Redis caching enabled for admin stats');
  } else {
    console.log('ℹ️ Redis not configured - stats will not be cached');
  }
} catch (error) {
  console.warn('⚠️ Failed to initialize Redis for caching:', error);
}

export async function DELETE(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin authentication required" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const resetType = searchParams.get('type') || 'quiz'; // 'quiz', 'affiliate', 'closer', 'all'

    console.log(`🔄 Starting ${resetType} data reset...`);

    if (resetType === 'quiz' || resetType === 'all') {
      // Delete quiz-related data
      await prisma.quizAnswer.deleteMany();
      await prisma.result.deleteMany();
      await prisma.quizSession.deleteMany();
      await prisma.articleView.deleteMany();

      // Also reset affiliate stats since they're connected to quiz data
      await prisma.affiliate.updateMany({
        data: {
          totalClicks: 0,
          totalLeads: 0,
          totalBookings: 0,
          totalSales: 0,
          totalCommission: 0
        }
      });

      // Reset closer stats since they're connected to quiz data
      await prisma.closer.updateMany({
        data: {
          totalCalls: 0,
          totalConversions: 0,
          totalRevenue: 0,
          conversionRate: 0
        }
      });

      console.log('✅ Quiz data and connected stats deleted');
    }

    if (resetType === 'affiliate' || resetType === 'all') {
      // Delete affiliate-related data
      await prisma.affiliateClick.deleteMany();
      await prisma.normalWebsiteClick.deleteMany(); // Delete normal website clicks
      await prisma.affiliateConversion.deleteMany();
      await prisma.affiliatePayout.deleteMany();
      await prisma.affiliateAuditLog.deleteMany();
      // Reset affiliate stats but keep the affiliate accounts
      await prisma.affiliate.updateMany({
        data: {
          totalClicks: 0,
          totalLeads: 0,
          totalBookings: 0,
          totalSales: 0,
          totalCommission: 0
        }
      });
      console.log('✅ Affiliate data deleted');
    }

    if (resetType === 'closer' || resetType === 'all') {
      // Delete closer-related data
      await prisma.appointment.deleteMany();
      await prisma.closerAuditLog.deleteMany();
      // Reset closer stats but keep the closer accounts
      await prisma.closer.updateMany({
        data: {
          totalCalls: 0,
          totalConversions: 0,
          totalRevenue: 0,
          conversionRate: 0
        }
      });
      console.log('✅ Closer data deleted');
    }

    if (resetType === 'all') {
      // Also reset user data if doing complete reset
      await prisma.user.deleteMany();
      console.log('✅ User data deleted');
    }

    console.log(`🎉 ${resetType} data reset completed successfully`);

    return NextResponse.json({
      success: true,
      message: `${resetType} data reset successfully`,
      resetType: resetType
    });
  } catch (error) {
    console.error("Error resetting data:", error);
    return NextResponse.json(
      { error: "Failed to reset data" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin authentication required" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const quizTypeParam = searchParams.get('quizType') || null;
  // Normalize 'all' to null for filtering (sessions don't have quizType='all')
  const quizType = quizTypeParam && quizTypeParam !== 'all' ? quizTypeParam : null;
  const duration = searchParams.get('duration') || 'all';
  const affiliateCode = searchParams.get('affiliateCode') || null;
  const nocache = searchParams.get('nocache') === 'true'; // Bypass cache for refresh button

  // 🚀 PERFORMANCE: Check cache first (5 minute TTL) - unless nocache is requested
  const cacheKey = `admin:stats:${quizType || 'all'}:${duration}:${affiliateCode || 'all'}`;

  if (redis && !nocache) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json(cached, {
          headers: {
            'X-Cache': 'HIT',
            'Cache-Control': `public, s-maxage=${ADMIN_CONSTANTS.CACHE.DASHBOARD_STATS_TTL}, stale-while-revalidate=${ADMIN_CONSTANTS.CACHE.DASHBOARD_STATS_TTL}`
          }
        });
      }
    } catch (error) {
      // Continue with normal flow if cache fails
    }
  }

  try {
    // Build date filter based on duration parameter
    const buildDateFilter = () => {
      if (duration === 'all') {
        return {}; // No date filter - show all data
      }

      const now = new Date();
      let startDate = new Date();

      switch (duration) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          return {}; // Default to all data
      }
      return { gte: startDate };
    };

    const dateFilter = buildDateFilter();

    // 🚀 PERFORMANCE: Parallelize initial queries for better speed
    const [totalSessions, avgDurationResult] = await Promise.all([
      // Get total sessions (all quiz attempts)
      prisma.quizSession.count({
        where: {
          createdAt: dateFilter,
          ...(quizType ? { quizType } : {}),
          ...(affiliateCode ? { affiliateCode } : {})
        }
      }),
      // Calculate average duration for completed sessions
      prisma.quizSession.aggregate({
        _avg: { durationMs: true },
        where: {
          createdAt: dateFilter,
          status: "completed",
          durationMs: { not: null },
          ...(quizType ? { quizType } : {}),
          ...(affiliateCode ? { affiliateCode } : {})
        },
      })
    ]);

    // Use centralized lead calculation with filters
    // Convert duration parameter to format expected by calculateLeads
    let leadData: { leads: any[]; totalLeads: number };
    let allLeads: any[];

    if (duration === '24h') {
      const leadDataResult = await calculateLeads({
        dateRange: '1d',
        quizType: quizType || undefined,
        affiliateCode: affiliateCode || undefined
      });
      allLeads = leadDataResult.leads;
      leadData = { leads: allLeads, totalLeads: leadDataResult.totalLeads };
    } else if (duration === 'all') {
      // For 'all', we need to bypass date filtering completely
      // Get all leads without date restriction (with smart limit to prevent memory issues)
      const MAX_LEADS_LIMIT = 500; // Lean & smart: prevent loading thousands of records

      // Optimization: Fetch questions first to avoid N+1
      const allQuestions = await prisma.quizQuestion.findMany({
        where: { active: true }
      });
      const questionMap = new Map(allQuestions.map(q => [q.id, q]));

      const allCompletedSessionsAllTime = await prisma.quizSession.findMany({
        where: {
          status: "completed",
          ...(quizType ? { quizType } : {}),
          ...(affiliateCode ? { affiliateCode } : {})
        },
        include: {
          answers: true, // Fetch answers but NOT nested questions
        },
        orderBy: { createdAt: "desc" },
        take: MAX_LEADS_LIMIT, // Smart pagination: limit to most recent 500 leads
      });

      // Filter to only include sessions that have name and email (actual leads)
      const actualLeadsAllTime = allCompletedSessionsAllTime.filter(session => {
        // Attach questions to answers in memory
        session.answers.forEach((answer: any) => {
          if (answer.questionId) {
            answer.question = questionMap.get(answer.questionId);
          }
        });

        const nameAnswer = session.answers.find((a: any) =>
          a.question?.prompt?.toLowerCase().includes('name')
        );
        const emailAnswer = session.answers.find((a: any) =>
          a.question?.prompt?.toLowerCase().includes('email')
        );

        return nameAnswer && emailAnswer && nameAnswer.value && emailAnswer.value;
      });

      // Deduplicate by email - keep only the most recent quiz session for each email
      // This prevents duplicate leads when someone completes the quiz multiple times
      const leadsByEmail = new Map();
      for (const lead of actualLeadsAllTime) {
        const emailAnswer = lead.answers.find((a: any) =>
          a.question?.prompt?.toLowerCase().includes('email')
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

      allLeads = deduplicatedLeads;
      leadData = { leads: deduplicatedLeads, totalLeads: deduplicatedLeads.length };
    } else {
      // Map duration to calculateLeads format (7d, 30d, 90d, 1y)
      const leadDataResult = await calculateLeads({
        dateRange: duration,
        quizType: quizType || undefined,
        affiliateCode: affiliateCode || undefined
      });
      allLeads = leadDataResult.leads;
      leadData = { leads: allLeads, totalLeads: leadDataResult.totalLeads };
    }

    // Get affiliate information for leads that have affiliate codes
    let affiliateMap: Record<string, string> = {};

    if (allLeads.length > 0) {
      // Get affiliate codes from both quiz sessions and appointments
      const leadsAffiliateCodes = allLeads
        .filter(lead => lead.affiliateCode)
        .map(lead => lead.affiliateCode!)
        .filter((code): code is string => code !== null);

      // 🚀 PERFORMANCE: Parallelize affiliate queries
      const [appointmentAffiliateCodes, allAffiliates] = await Promise.all([
        prisma.appointment.findMany({
          where: {
            affiliateCode: { not: null }
          },
          select: {
            affiliateCode: true
          },
          distinct: ['affiliateCode']
        }),
        // Get all affiliates to check against (fetch early for parallelization)
        prisma.affiliate.findMany({
          select: {
            referralCode: true,
            name: true,
            customLink: true,
          }
        })
      ]);

      const allAffiliateCodes = [
        ...leadsAffiliateCodes,
        ...appointmentAffiliateCodes.map(a => a.affiliateCode).filter((code): code is string => code !== null)
      ];

      const affiliateCodes = [...new Set(allAffiliateCodes)]; // Remove duplicates

      if (affiliateCodes.length > 0) {
        // 🚀 PERFORMANCE: Build lookup maps instead of repeated finds (O(n) instead of O(n²))
        affiliateMap = {};

        // Create maps for O(1) lookups
        const referralCodeMap = new Map(
          allAffiliates.map(a => [a.referralCode, a.name])
        );
        const customLinkMap = new Map(
          allAffiliates.map(a => [a.customLink?.replace(/^\//, ''), a.name])
        );

        // Map affiliate codes to names using maps (O(n) instead of O(n²))
        affiliateCodes.forEach(code => {
          // Try exact referral code match
          if (referralCodeMap.has(code)) {
            affiliateMap[code] = referralCodeMap.get(code)!;
            return;
          }

          // Try custom tracking link match (with and without leading slash)
          const cleanCode = code.replace(/^\//, '');
          if (customLinkMap.has(cleanCode)) {
            affiliateMap[code] = customLinkMap.get(cleanCode)!;
            return;
          }

          if (customLinkMap.has(`/${code}`)) {
            affiliateMap[code] = customLinkMap.get(`/${code}`)!;
            return;
          }
        });
      }
    }

    // Get accurate lead statuses (completed vs booked) using contact info from CRM
    const leadIds = allLeads.map(lead => lead.id);

    // Extract emails from the leads data (which comes from CRM contact info)
    const leadEmails: Record<string, string> = {};
    allLeads.forEach(lead => {
      const emailAnswer = lead.answers.find((a: any) =>
        a.question?.prompt?.toLowerCase().includes('email') ||
        a.question?.type === 'email'
      );
      if (emailAnswer?.value) {
        leadEmails[lead.id] = emailAnswer.value as string;
      }
    });

    // Get all appointments for these emails (with closer info and quiz session link)
    const emails = Object.values(leadEmails);
    const appointments = await prisma.appointment.findMany({
      where: {
        customerEmail: { in: emails }
      },
      include: {
        closer: {
          select: {
            id: true,
            name: true
          }
        },
        quizSession: {
          select: {
            id: true,
            affiliateCode: true
          }
        }
      }
    });

    // Group appointments by email
    const appointmentsByEmail = appointments.reduce((acc, appointment) => {
      acc[appointment.customerEmail] = appointment;
      return acc;
    }, {} as Record<string, any>);

    // Add source information and update status for each lead
    const leadsWithSource = allLeads.map(lead => {
      const email = leadEmails[lead.id];
      const appointment = email ? appointmentsByEmail[email] : null;

      // Determine status based on appointment outcome
      let status = 'Completed'; // Default for completed quiz sessions

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

      // Determine source with affiliate code checking
      // Check both quiz session affiliate code AND appointment affiliate code
      let source = 'Website'; // Default
      const affiliateCodeToCheck = lead.affiliateCode || appointment?.affiliateCode;

      if (affiliateCodeToCheck) {
        const mappedName = affiliateMap[affiliateCodeToCheck];
        if (mappedName) {
          source = mappedName;
        }
      }

      // For deal close date, use appointment updatedAt when outcome is converted
      // This approximates when the deal was closed (when outcome was set)
      const dealClosedAt = appointment?.outcome === 'converted' && appointment?.updatedAt
        ? appointment.updatedAt.toISOString()
        : null;

      // Transform answers to show labels instead of values for multiple choice questions
      const transformedAnswers = lead.answers.map((answer: any) => {
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
          ...answer,
          value: displayAnswer, // Replace value with label for display
          originalValue: answerValue, // Keep original value for reference if needed
        };
      });

      return {
        ...lead,
        answers: transformedAnswers, // Use transformed answers with labels
        status,
        source,
        saleValue: appointment?.saleValue ? appointment.saleValue.toString() : null, // Include sale value from appointment
        dealClosedAt, // When the deal was actually closed (for converted deals)
        closerName: appointment?.closer?.name || null, // Include closer name for Deal Owner column
        appointment: {
          outcome: appointment?.outcome || null,
          saleValue: appointment?.saleValue ? appointment.saleValue.toString() : null,
          id: appointment?.id || null,
          createdAt: appointment?.createdAt ? appointment.createdAt.toISOString() : null,
          scheduledAt: appointment?.scheduledAt ? appointment.scheduledAt.toISOString() : null,
          updatedAt: appointment?.updatedAt ? appointment.updatedAt.toISOString() : null,
          closer: appointment?.closer ? {
            id: appointment.closer.id,
            name: appointment.closer.name
          } : null
        } // Include necessary appointment data including closer
      };
    });

    // Calculate completion rate
    // Get count of ALL completed sessions (not just leads with contact info)
    const completedSessionsCount = await prisma.quizSession.count({
      where: {
        createdAt: dateFilter,
        status: "completed",
        ...(quizType ? { quizType } : {}),
        ...(affiliateCode ? { affiliateCode } : {})
      }
    });

    // Leads are completed sessions WITH name and email
    const leadsCollected = allLeads.length;

    // Completion rate is based on ALL completed sessions, not just leads
    const completionRate = totalSessions > 0 ? (completedSessionsCount / totalSessions) * 100 : 0;

    // 🚀 PERFORMANCE: Parallelize archetype and question queries
    // First, get filtered session IDs for archetype filtering
    const filteredSessionsForArchetypes = await prisma.quizSession.findMany({
      where: {
        createdAt: dateFilter,
        status: "completed", // Only completed sessions have results/archetypes
        ...(quizType ? { quizType } : {}),
        ...(affiliateCode ? { affiliateCode } : {})
      },
      select: {
        id: true
      }
    });

    const filteredSessionIdsForArchetypes = filteredSessionsForArchetypes.map(s => s.id);

    // Get archetype distribution for filtered sessions only
    const archetypeStatsData = filteredSessionIdsForArchetypes.length > 0
      ? await prisma.result.groupBy({
        by: ["archetype"],
        _count: { archetype: true },
        where: {
          sessionId: {
            in: filteredSessionIdsForArchetypes
          }
        }
      })
      : [];

    // Get filtered sessions first to determine which questions to include
    const filteredSessions = await prisma.quizSession.findMany({
      where: {
        createdAt: dateFilter,
        ...(quizType ? { quizType } : {}),
        ...(affiliateCode ? { affiliateCode } : {})
      },
      select: {
        id: true,
        quizType: true  // Need quizType to get matching questions
      }
    });

    const filteredSessionIds = filteredSessions.map(s => s.id);

    // When quizType is null (meaning 'all'), get questions from all quiz types that have sessions
    // When quizType is specified, get questions only for that type
    let allQuestions;
    if (quizType) {
      // Specific quiz type: get questions for that type only
      allQuestions = await prisma.quizQuestion.findMany({
        where: {
          active: true,
          quizType: quizType
        },
        orderBy: { order: 'asc' }
      });
    } else {
      // 'all' or no filter: get questions from all quiz types that have sessions
      const uniqueQuizTypes = [...new Set(filteredSessions.map(s => s.quizType))];
      if (uniqueQuizTypes.length > 0) {
        allQuestions = await prisma.quizQuestion.findMany({
          where: {
            active: true,
            quizType: { in: uniqueQuizTypes }
          },
          orderBy: [{ quizType: 'asc' }, { order: 'asc' }]  // Group by quiz type, then by order
        });
      } else {
        // No sessions found, but we still want to show questions for default type
        allQuestions = await prisma.quizQuestion.findMany({
          where: {
            active: true,
            quizType: 'financial-profile'
          },
          orderBy: { order: 'asc' }
        });
      }
    }

    const [totalQuestions] = await Promise.all([
      // Get behavior analytics - drop-off rates per question
      prisma.quizQuestion.count({
        where: {
          active: true
        }
      })
    ]);

    const archetypeStats = archetypeStatsData;

    // filteredSessionIds already calculated above from filteredSessions

    // Get question analytics for ONLY the filtered sessions
    // If no sessions match filters, skip the query and use empty results
    const questionAnalyticsData = filteredSessionIds.length > 0
      ? await prisma.quizAnswer.groupBy({
        by: ['questionId'],
        _count: {
          sessionId: true
        },
        where: {
          questionId: {
            in: allQuestions.map(q => q.id)
          },
          sessionId: {
            in: filteredSessionIds // ✅ Filter by session IDs (applies date + affiliate filters)
          }
        }
      })
      : []; // Empty array if no sessions match filters

    // Create a map for quick lookup
    const questionCountMap = new Map(
      questionAnalyticsData.map(item => [item.questionId, item._count.sessionId])
    );

    // When showing "all" quiz types, calculate retention rate per quiz type
    // Group sessions by quiz type for accurate retention calculation
    const sessionsByQuizType = filteredSessions.reduce((acc, session) => {
      if (!acc[session.quizType]) {
        acc[session.quizType] = [];
      }
      acc[session.quizType].push(session.id);
      return acc;
    }, {} as Record<string, string[]>);

    // When showing multiple quiz types, we need to ensure question numbers are unique
    // Create a sequential question number across all quiz types
    const questionAnalytics = allQuestions.map((question, index) => {
      const answeredCount = questionCountMap.get(question.id) || 0;

      // Calculate retention rate: when showing "all", use sessions of the same quiz type as the question
      // When showing a specific type, use totalSessions
      let retentionRate = 0;
      if (quizType) {
        // Specific quiz type: use totalSessions (already filtered by quiz type)
        retentionRate = totalSessions > 0 ? (answeredCount / totalSessions) * 100 : 0;
      } else {
        // "All" types: use sessions of the same quiz type as this question
        const sessionsForThisQuizType = sessionsByQuizType[question.quizType]?.length || 0;
        retentionRate = sessionsForThisQuizType > 0 ? (answeredCount / sessionsForThisQuizType) * 100 : 0;
      }

      // Show quiz type in question text if showing multiple quiz types
      const questionText = !quizType && allQuestions.length > 0
        ? `[${question.quizType}] ${question.prompt}`
        : question.prompt;

      return {
        questionNumber: index + 1, // Sequential number across all questions (Q1, Q2, Q3...)
        questionText: questionText,
        answeredCount,
        retentionRate: Math.round(retentionRate * 100) / 100,
        originalOrder: question.order,
        quizType: question.quizType,
        selectedQuizType: quizType || 'all',
      };
    });

    // Get activity data based on duration filter
    const getActivityData = async () => {
      const now = new Date();
      let startDate = new Date();

      if (duration === 'all') {
        startDate = new Date(0); // All time
      } else {
        switch (duration) {
          case '24h':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case '90d':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          case '1y':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days
        }
      }

      // Get all sessions in the timeframe
      const sessions = await prisma.quizSession.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
          ...(quizType ? { quizType } : {}),
          ...(affiliateCode ? { affiliateCode } : {})
        },
        select: {
          createdAt: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // Group sessions by hour (for 24h) or by day (for other periods)
      const groupedData: { [key: string]: number } = {};

      if (duration === '24h') {
        // For 24h view, group by hour
        sessions.forEach(session => {
          const date = new Date(session.createdAt);
          // Group by hour: YYYY-MM-DD HH:00
          const key = date.toISOString().slice(0, 13) + ':00:00.000Z';

          groupedData[key] = (groupedData[key] || 0) + 1;
        });

        // Fill in missing hours with 0 to show complete timeline
        const hoursData: { [key: string]: number } = {};
        for (let i = 0; i < 24; i++) {
          const hourDate = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
          const hourKey = hourDate.toISOString().slice(0, 13) + ':00:00.000Z';
          hoursData[hourKey] = groupedData[hourKey] || 0;
        }

        // Convert to array format
        return Object.entries(hoursData).map(([key, count]) => ({
          createdAt: key,
          _count: { id: count }
        }));
      } else {
        // For other periods, group by day
        sessions.forEach(session => {
          const date = new Date(session.createdAt);
          const key = date.toISOString().slice(0, 10); // YYYY-MM-DD

          groupedData[key] = (groupedData[key] || 0) + 1;
        });

        // Fill in missing days with 0 to show complete timeline
        const daysData: { [key: string]: number } = {};
        const totalDays = duration === '7d' ? 7 : duration === '30d' ? 30 : duration === '90d' ? 90 : duration === '1y' ? 365 : 30;

        for (let i = 0; i < totalDays; i++) {
          const dayDate = new Date(now.getTime() - (totalDays - 1 - i) * 24 * 60 * 60 * 1000);
          const dayKey = dayDate.toISOString().slice(0, 10); // YYYY-MM-DD
          daysData[dayKey] = groupedData[dayKey] || 0;
        }

        // Convert to array format with properly formatted dates
        return Object.entries(daysData).map(([key, count]) => {
          const formattedDate = new Date(key + 'T00:00:00.000Z').toISOString();

          return {
            createdAt: formattedDate,
            _count: { id: count }
          };
        });
      }
    };

    const dailyActivity = await getActivityData();

    // Get clicks activity over time (similar to quiz started chart)
    const getClicksActivityData = async () => {
      const now = new Date();
      let startDate = new Date();

      if (duration === 'all') {
        startDate = new Date(0); // All time
      } else {
        switch (duration) {
          case '24h':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case '90d':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          case '1y':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
      }

      // Get affiliate ID if filtering by affiliate
      let affiliateIdForFilter: string | undefined;
      if (affiliateCode) {
        const affiliate = await prisma.affiliate.findUnique({
          where: { referralCode: affiliateCode },
          select: { id: true }
        });
        affiliateIdForFilter = affiliate?.id;
      }

      // FUNNEL LOGIC:
      // Step 1: Clicks = ALL people who land on the page (regardless of whether they start a quiz)
      // Step 2: Quiz Started = People who clicked the button to start a quiz (quiz sessions created)
      // Step 3: Completed = People who finished the quiz (completed quiz sessions)
      // 
      // Clicks are NOT filtered by quiz type because clicks happen BEFORE quiz type is chosen.
      // However, when a quiz type filter is applied, other metrics (Quiz Started, Completed) ARE filtered.
      // This allows us to see the full funnel: All Clicks → Quiz Started (of type) → Completed (of type)

      // Get ALL clicks within the date range and affiliate filter (no quiz session matching required)
      const affiliateClicks = await prisma.affiliateClick.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
          ...(affiliateIdForFilter ? { affiliateId: affiliateIdForFilter } : {})
        },
        select: {
          createdAt: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // Get normal website clicks (only if showing all affiliates)
      const normalClicks = affiliateCode ? [] : await prisma.normalWebsiteClick.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        select: {
          createdAt: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // Combine ALL clicks (no filtering by quiz sessions - these are all page visits)
      const allClicks = [
        ...affiliateClicks,
        ...normalClicks
      ];

      // Group clicks by hour (for 24h) or by day (for other periods)
      const groupedData: { [key: string]: number } = {};

      if (duration === '24h') {
        // For 24h view, group by hour
        allClicks.forEach(click => {
          const date = new Date(click.createdAt);
          const key = date.toISOString().slice(0, 13) + ':00:00.000Z';
          groupedData[key] = (groupedData[key] || 0) + 1;
        });

        // Fill in missing hours with 0
        const hoursData: { [key: string]: number } = {};
        for (let i = 0; i < 24; i++) {
          const hourDate = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
          const hourKey = hourDate.toISOString().slice(0, 13) + ':00:00.000Z';
          hoursData[hourKey] = groupedData[hourKey] || 0;
        }

        return Object.entries(hoursData).map(([key, count]) => ({
          createdAt: key,
          _count: { id: count }
        }));
      } else if (duration === 'all') {
        // For 'all' duration, group all clicks by day (no limit on days)
        allClicks.forEach(click => {
          const date = new Date(click.createdAt);
          const key = date.toISOString().slice(0, 10); // YYYY-MM-DD
          groupedData[key] = (groupedData[key] || 0) + 1;
        });

        // Sort keys by date and return as array
        const sortedKeys = Object.keys(groupedData).sort();
        return sortedKeys.map(key => {
          const formattedDate = new Date(key + 'T00:00:00.000Z').toISOString();
          return {
            createdAt: formattedDate,
            _count: { id: groupedData[key] }
          };
        });
      } else {
        // For other periods, group by day
        allClicks.forEach(click => {
          const date = new Date(click.createdAt);
          const key = date.toISOString().slice(0, 10);
          groupedData[key] = (groupedData[key] || 0) + 1;
        });

        // Fill in missing days with 0
        const daysData: { [key: string]: number } = {};
        const totalDays = duration === '7d' ? 7 : duration === '30d' ? 30 : duration === '90d' ? 90 : duration === '1y' ? 365 : 30;

        for (let i = 0; i < totalDays; i++) {
          const dayDate = new Date(now.getTime() - (totalDays - 1 - i) * 24 * 60 * 60 * 1000);
          const dayKey = dayDate.toISOString().slice(0, 10);
          daysData[dayKey] = groupedData[dayKey] || 0;
        }

        return Object.entries(daysData).map(([key, count]) => {
          const formattedDate = new Date(key + 'T00:00:00.000Z').toISOString();
          return {
            createdAt: formattedDate,
            _count: { id: count }
          };
        });
      }
    };

    const clicksActivity = await getClicksActivityData();

    // Calculate clicks - count ALL clicks (all people who landed on the page)
    // Clicks are NOT filtered by quiz type - they represent all page visits
    // This is funnel step 1, before quiz type is chosen
    let totalClicks = 0;

    if (affiliateCode) {
      // If filtering by affiliate, get the affiliate ID and count their clicks
      const affiliate = await prisma.affiliate.findUnique({
        where: { referralCode: affiliateCode },
        select: { id: true }
      });

      if (affiliate) {
        totalClicks = await prisma.affiliateClick.count({
          where: {
            affiliateId: affiliate.id,
            createdAt: dateFilter
          }
        });
      }
    } else {
      // Count all affiliate clicks
      const affiliateClicksCount = await prisma.affiliateClick.count({
        where: {
          createdAt: dateFilter
        }
      });

      // Count normal website clicks (these don't have affiliate association)
      const normalWebsiteClicksCount = await prisma.normalWebsiteClick.count({
        where: {
          createdAt: dateFilter
        }
      });

      totalClicks = affiliateClicksCount + normalWebsiteClicksCount;
    }

    const clicks = totalClicks; // Total clicks (affiliate clicks + normal website clicks)
    const partialSubmissions = totalSessions - completedSessionsCount; // Started but didn't complete
    const averageTimeMs = avgDurationResult._avg.durationMs || 0; // Average time in milliseconds

    // Get top 3 questions responsible for biggest drop-offs (questions that CAUSE the drop)
    // Only calculate if there are actual user sessions (not just empty quiz structure)
    console.log(`\n🎯 CALCULATING DROP-OFFS (${totalSessions} total sessions)...`);

    // Calculate drop-offs by looking at each question and seeing how many people dropped off before reaching it
    const questionsWithDrops = totalSessions > 0 ? questionAnalytics
      .filter((q): q is NonNullable<typeof q> => q !== null)
      .map((q, index) => {
        // For each question, calculate how many people dropped off before reaching it
        const previousQuestion = index > 0 ? questionAnalytics[index - 1] : null;

        let dropOffCount = 0;
        let previousRetentionRate = 100; // Default to 100% for first question

        if (previousQuestion) {
          // People who answered the previous question but didn't reach this question
          previousRetentionRate = previousQuestion.retentionRate;
          dropOffCount = previousQuestion.retentionRate - q.retentionRate;
        } else {
          // For the first question, people who started but didn't answer it
          dropOffCount = 100 - q.retentionRate;
        }

        const dropOffPercentage = Math.round(dropOffCount * 100) / 100;

        console.log(`  Q${q.questionNumber}: ${q.retentionRate}% reached this question`);
        console.log(`    Previous: ${previousRetentionRate}% → Current: ${q.retentionRate}%`);
        console.log(`    Drop-off: ${dropOffPercentage}% (${dropOffCount} people dropped off before reaching Q${q.questionNumber})`);
        console.log(`    Question: ${q.questionText}`);

        // Only include questions where there's actually a drop-off
        if (dropOffPercentage > 0) {
          return {
            questionNumber: q.questionNumber, // Show the question where people dropped off
            questionText: q.questionText,
            dropFromPrevious: dropOffPercentage,
            retentionRate: q.retentionRate,
            previousRetentionRate: previousRetentionRate
          };
        }
        return null;
      })
      .filter((q): q is NonNullable<typeof q> => q !== null) // Remove null entries
      .filter(q => q.dropFromPrevious > 5) // Only show significant drops (5% or more)
      .sort((a, b) => b.dropFromPrevious - a.dropFromPrevious)
      .slice(0, 3) // Top 3 questions responsible for drops
      : []; // Return empty array if no user sessions exist

    console.log(`\n🎯 TOP DROP-OFFS FOUND: ${questionsWithDrops.length}`);
    questionsWithDrops.forEach((q, index) => {
      console.log(`  #${index + 1}: Q${q.questionNumber} - ${q.dropFromPrevious}% drop-off`);
    });

    // Get all quiz types for dashboard integration
    const quizTypes = await prisma.quizQuestion.groupBy({
      by: ['quizType'],
      _count: {
        id: true,
      },
      where: {
        active: true,
      },
    });

    const formattedQuizTypes = quizTypes.map(quizType => {
      const displayName = quizType.quizType
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      const getDescription = (type: string) => {
        switch (type) {
          case 'financial-profile':
            return 'General financial personality assessment';
          case 'health-finance':
            return 'Healthcare and medical expense management';
          case 'marriage-finance':
            return 'Couples financial planning and management';
          default:
            return 'Custom quiz created by user';
        }
      };

      return {
        name: quizType.quizType,
        displayName: displayName,
        description: getDescription(quizType.quizType),
        questionCount: quizType._count.id,
      };
    });

    const stats = {
      totalSessions,
      completedSessions: completedSessionsCount, // All completed sessions (status="completed")
      completionRate: Math.round(completionRate * 100) / 100,
      avgDurationMs: avgDurationResult._avg.durationMs || 0,
      totalLeads: leadData.totalLeads,
      allLeads: leadsWithSource,
      archetypeStats,
      questionAnalytics: questionAnalytics.filter(Boolean),
      dailyActivity,
      clicksActivity,
      // New metrics
      clicks,
      partialSubmissions,
      leadsCollected, // Completed sessions WITH name and email (actual leads)
      averageTimeMs,
      topDropOffQuestions: questionsWithDrops,
      quizTypes: formattedQuizTypes,
    };

    // 🚀 PERFORMANCE: Cache result for 5 minutes (300 seconds)
    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(stats), { ex: ADMIN_CONSTANTS.CACHE.DASHBOARD_STATS_TTL });
        console.log('✅ Stats cached successfully for:', cacheKey);
      } catch (error) {
        console.warn('Cache write failed (non-critical):', error);
        // Continue even if caching fails
      }
    }

    return NextResponse.json(stats, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'private, max-age=300', // 5 minutes
      }
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({
      totalSessions: 0,
      completedSessions: 0,
      completionRate: 0,
      avgDurationMs: 0,
      totalLeads: 0,
      allLeads: [],
      archetypeStats: [],
      questionAnalytics: [],
      dailyActivity: [],
      clicksActivity: [],
      clicks: 0,
      partialSubmissions: 0,
      leadsCollected: 0,
      averageTimeMs: 0,
      topDropOffQuestions: [],
      quizTypes: [],
    });
  }
}
