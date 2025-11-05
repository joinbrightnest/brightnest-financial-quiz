import { NextRequest, NextResponse } from "next/server";
import { calculateTotalLeads, calculateLeadsByCode, calculateLeads } from "@/lib/lead-calculation";
import { getLeadStatuses } from "@/lib/lead-status";
import { verifyAdminAuth } from "@/lib/admin-auth-server";
import { prisma } from "@/lib/prisma";

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
  const quizType = searchParams.get('quizType') || null;
  const duration = searchParams.get('duration') || 'all';
  const affiliateCode = searchParams.get('affiliateCode') || null;
  
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

    // Get total sessions (all quiz attempts)
    const totalSessions = await prisma.quizSession.count({
      where: {
        createdAt: dateFilter,
        ...(quizType ? { quizType } : {}),
        ...(affiliateCode ? { affiliateCode } : {})
      }
    });
    
    // Calculate average duration for completed sessions
    const avgDurationResult = await prisma.quizSession.aggregate({
      _avg: { durationMs: true },
      where: { 
        createdAt: dateFilter,
        status: "completed",
        durationMs: { not: null },
        ...(quizType ? { quizType } : {}),
        ...(affiliateCode ? { affiliateCode } : {})
      },
    });

    // Get all completed sessions first
    const allCompletedSessions = await prisma.quizSession.findMany({
      where: {
        createdAt: dateFilter,
        status: "completed",
        ...(quizType ? { quizType } : {}),
        ...(affiliateCode ? { affiliateCode } : {})
      },
      include: { 
        result: true,
        answers: {
          include: {
            question: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Use centralized lead calculation with filters
    // Convert duration parameter to format expected by calculateTotalLeads
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
      // Get all leads without date restriction
      const allCompletedSessionsAllTime = await prisma.quizSession.findMany({
        where: {
          status: "completed",
          ...(quizType ? { quizType } : {}),
          ...(affiliateCode ? { affiliateCode } : {})
        },
        include: {
          answers: {
            include: {
              question: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      
      // Filter to only include sessions that have name and email (actual leads)
      const actualLeadsAllTime = allCompletedSessionsAllTime.filter(session => {
        const nameAnswer = session.answers.find(a => 
          a.question?.prompt?.toLowerCase().includes('name')
        );
        const emailAnswer = session.answers.find(a => 
          a.question?.prompt?.toLowerCase().includes('email')
        );
        
        return nameAnswer && emailAnswer && nameAnswer.value && emailAnswer.value;
      });
      
      allLeads = actualLeadsAllTime;
      leadData = { leads: allLeads, totalLeads: actualLeadsAllTime.length };
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
      
      const appointmentAffiliateCodes = await prisma.appointment.findMany({
        where: {
          affiliateCode: { not: null }
        },
        select: {
          affiliateCode: true
        },
        distinct: ['affiliateCode']
      });
      
      const allAffiliateCodes = [
        ...leadsAffiliateCodes,
        ...appointmentAffiliateCodes.map(a => a.affiliateCode).filter((code): code is string => code !== null)
      ];
      
      const affiliateCodes = [...new Set(allAffiliateCodes)]; // Remove duplicates
      
      console.log('🔍 Affiliate codes found in leads and appointments:', affiliateCodes);
      
      if (affiliateCodes.length > 0) {
        // Get all affiliates to check against
        const allAffiliates = await prisma.affiliate.findMany({
          select: {
            referralCode: true,
            name: true,
            customLink: true,
          }
        });

        console.log('👥 All affiliates:', allAffiliates.map((a: any) => ({ 
          name: a.name, 
          referralCode: a.referralCode, 
          customLink: a.customLink 
        })));

        // Create a map of affiliate codes to names
        affiliateMap = {};
        
        // Check each affiliate code against all possible matches
        affiliateCodes.forEach(code => {
          // Try exact referral code match
          const exactMatch = allAffiliates.find(affiliate => 
            affiliate.referralCode === code
          );
          
          if (exactMatch) {
            affiliateMap[code] = exactMatch.name;
            console.log(`✅ Found exact match: ${code} -> ${exactMatch.name}`);
            return;
          }
          
          // Try custom tracking link match (remove leading slash)
          const customMatch = allAffiliates.find(affiliate => 
            affiliate.customLink === `/${code}` || 
            affiliate.customLink === code
          );
          
          if (customMatch) {
            affiliateMap[code] = customMatch.name;
            console.log(`✅ Found custom link match: ${code} -> ${customMatch.name}`);
            return;
          }
          
          console.log(`❌ No match found for affiliate code: ${code}`);
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

    // Get all appointments for these emails (with closer info)
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
      let status = 'Stage'; // Default for completed quiz sessions
      
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
      
      // Determine source with debugging
      // Check both quiz session affiliate code AND appointment affiliate code
      let source = 'Website'; // Default
      let affiliateCodeToCheck = lead.affiliateCode || appointment?.affiliateCode;
      
      if (affiliateCodeToCheck) {
        const mappedName = affiliateMap[affiliateCodeToCheck];
        if (mappedName) {
          source = mappedName;
          const sourceType = lead.affiliateCode ? 'quiz session' : 'appointment';
          console.log(`✅ Lead ${lead.id} (${email}): affiliateCode=${affiliateCodeToCheck} (from ${sourceType}) -> source=${source}`);
        } else {
          console.log(`❌ Lead ${lead.id} (${email}): affiliateCode=${affiliateCodeToCheck} not found in map, defaulting to Website`);
        }
      } else {
        console.log(`ℹ️ Lead ${lead.id} (${email}): no affiliateCode in quiz session or appointment, defaulting to Website`);
      }
      
      // For deal close date, use appointment updatedAt when outcome is converted
      // This approximates when the deal was closed (when outcome was set)
      const dealClosedAt = appointment?.outcome === 'converted' && appointment?.updatedAt 
        ? appointment.updatedAt.toISOString() 
        : null;
      
      return {
        ...lead,
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

    // Get archetype distribution
    const archetypeStats = await prisma.result.groupBy({
      by: ["archetype"],
      _count: { archetype: true },
    });

    // Calculate completion rate (using actual leads as completed sessions)
    const completedSessions = allLeads.length;
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    // Get behavior analytics - drop-off rates per question
    const totalQuestions = await prisma.quizQuestion.count({
      where: { 
        active: true
      }
    });

    // Get all questions ordered by their order field
    // Use quiz type filter if specified, otherwise default
    let defaultQuizType = quizType || 'financial-profile';
    
    const allQuestions = await prisma.quizQuestion.findMany({
      where: { 
        active: true,
        quizType: defaultQuizType
      },
      orderBy: { order: 'asc' }
    });

    // Get filtered sessions first (applying date and affiliate filters)
    const filteredSessions = await prisma.quizSession.findMany({
      where: {
        createdAt: dateFilter,
        ...(quizType ? { quizType } : {}),
        ...(affiliateCode ? { affiliateCode } : {})
      },
      select: {
        id: true
      }
    });

    const filteredSessionIds = filteredSessions.map(s => s.id);

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

    const questionAnalytics = allQuestions.map((question, index) => {
      const answeredCount = questionCountMap.get(question.id) || 0;
      const retentionRate = totalSessions > 0 ? (answeredCount / totalSessions) * 100 : 0;

      // Show quiz type in question text
      const questionText = question.prompt;

      console.log(`📊 Question ${question.order} (DB order: ${question.order}): ${questionText}`);
      console.log(`   Answers: ${answeredCount}/${totalSessions} (${retentionRate.toFixed(1)}% retention)`);

      return {
        questionNumber: question.order,
        questionText: questionText,
        answeredCount,
        retentionRate: Math.round(retentionRate * 100) / 100,
        originalOrder: question.order,
        quizType: question.quizType,
        selectedQuizType: defaultQuizType, // Show which quiz was selected
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

      // Get affiliate clicks and normal website clicks
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

      // Normal website clicks don't have affiliate association, so only include them if showing all affiliates
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

      // Combine all clicks
      const allClicks = [...affiliateClicks, ...normalClicks];

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

    // Calculate clicks - count actual click records filtered by date and affiliate
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
    const partialSubmissions = totalSessions - completedSessions; // Started but didn't complete
    const leadsCollected = allLeads.length; // Count completed sessions (all completed quizzes are leads)
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

    return NextResponse.json({
      totalSessions,
      completedSessions,
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
      leadsCollected,
      averageTimeMs,
      topDropOffQuestions: questionsWithDrops,
      quizTypes: formattedQuizTypes,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({
      totalSessions: 0,
      completedSessions: 0,
      completionRate: 0,
      avgDurationMs: 0,
      allLeads: [],
      archetypeStats: [],
      questionAnalytics: [],
      dailyActivity: [],
      visitors: 0,
      partialSubmissions: 0,
      leadsCollected: 0,
      averageTimeMs: 0,
      topDropOffQuestions: [],
    });
  }
}
