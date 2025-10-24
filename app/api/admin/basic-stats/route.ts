import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { calculateTotalLeads, calculateLeadsByCode } from "@/lib/lead-calculation";
import { getLeadStatuses } from "@/lib/lead-status";

const prisma = new PrismaClient();

export async function DELETE(request: Request) {
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateRange = searchParams.get('dateRange') || '7d';
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const quizType = searchParams.get('quizType') || null;
  const affiliateCode = searchParams.get('affiliateCode') || null;
  
  try {
    // Build date filter
    const buildDateFilter = () => {
      // If dateRange is 'all', return no filter (show all data)
      if (dateRange === 'all') {
        return {};
      }

      const now = new Date();
      let startDate = new Date();
      let endDate = new Date();

      if (dateRange === 'custom' && startDate && endDate) {
        const customStart = new Date(startDate);
        const customEnd = new Date(endDate);
        customEnd.setHours(23, 59, 59, 999);
        return {
          gte: customStart,
          lte: customEnd
        };
      } else {
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
          case '90d':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          case '1y':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }
        return { gte: startDate };
      }
    };

    const dateFilter = buildDateFilter();

    // Get total sessions (all quiz attempts)
    const totalSessions = await prisma.quizSession.count({
      where: {
        createdAt: dateFilter,
        ...(quizType ? { quizType } : {})
      }
    });
    
    // Calculate average duration for completed sessions
    const avgDurationResult = await prisma.quizSession.aggregate({
      _avg: { durationMs: true },
      where: { 
        createdAt: dateFilter,
        status: "completed",
        durationMs: { not: null },
        ...(quizType ? { quizType } : {})
      },
    });

    // Get all completed sessions first
    const allCompletedSessions = await prisma.quizSession.findMany({
      where: {
        createdAt: dateFilter,
        status: "completed",
        ...(quizType ? { quizType } : {})
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

    // Use centralized lead calculation instead of duplicate logic
    // If affiliateCode is provided, filter leads for that specific affiliate
    let leadData;
    if (affiliateCode) {
      leadData = await calculateLeadsByCode(affiliateCode, dateRange);
    } else {
      leadData = await calculateTotalLeads(dateRange, quizType || undefined);
    }
    const allLeads = leadData.leads;

    // Get affiliate information for leads that have affiliate codes
    let affiliateMap: Record<string, string> = {};
    
    if (allLeads.length > 0) {
      const affiliateCodes = allLeads
        .filter(lead => lead.affiliateCode)
        .map(lead => lead.affiliateCode!)
        .filter((code): code is string => code !== null);
      
      if (affiliateCodes.length > 0) {
        // First try to find by referral code
        const affiliatesByReferralCode = await prisma.affiliate.findMany({
          where: {
            referralCode: {
              in: affiliateCodes
            }
          },
          select: {
            referralCode: true,
            name: true,
          }
        });

        // Then try to find by custom tracking link using raw SQL
        const affiliatesByCustomLink = await prisma.$queryRaw`
          SELECT "referral_code", "name", "custom_tracking_link"
          FROM "affiliates" 
          WHERE "custom_tracking_link" = ANY(${affiliateCodes.map(code => `/${code}`)})
        `;

        // Create a map of affiliate codes to names
        affiliateMap = {};
        
        // Add affiliates found by referral code
        affiliatesByReferralCode.forEach(affiliate => {
          affiliateMap[affiliate.referralCode] = affiliate.name;
        });
        
        // Add affiliates found by custom tracking link
        if (Array.isArray(affiliatesByCustomLink)) {
          affiliatesByCustomLink.forEach((affiliate: any) => {
            const customCode = affiliate.custom_tracking_link?.replace('/', '');
            if (customCode) {
              affiliateMap[customCode] = affiliate.name;
            }
          });
        }
      }
    }

    // Get accurate lead statuses (completed vs booked) using contact info from CRM
    const leadIds = allLeads.map(lead => lead.id);
    
    // Extract emails from the leads data (which comes from CRM contact info)
    const leadEmails: Record<string, string> = {};
    allLeads.forEach(lead => {
      const emailAnswer = lead.answers.find(a => 
        a.question?.prompt?.toLowerCase().includes('email') ||
        a.question?.type === 'email'
      );
      if (emailAnswer?.value) {
        leadEmails[lead.id] = emailAnswer.value as string;
      }
    });

    // Get all appointments for these emails
    const emails = Object.values(leadEmails);
    const appointments = await prisma.appointment.findMany({
      where: { 
        customerEmail: { in: emails }
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
      
      // Determine status: if appointment exists, show "Booked", otherwise "Completed"
      const status = appointment ? 'Booked' : 'Completed';
      
      return {
        ...lead,
        status,
        source: lead.affiliateCode 
          ? (affiliateMap[lead.affiliateCode] || 'Unknown Affiliate')
          : 'Website'
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
        active: true,
        ...(quizType ? { quizType } : {})
      }
    });

    // Get all questions ordered by their order field
    // Handle "all" quiz types by finding the quiz with biggest drop-offs
    let defaultQuizType = quizType || 'financial-profile';
    
    if (quizType === 'all') {
      // Find the quiz type with the highest drop-off rate
      const quizTypes = await prisma.quizQuestion.groupBy({
        by: ['quizType'],
        where: { active: true }
      });
      
      let maxDropOffRate = 0;
      let problematicQuizType = 'financial-profile';
      
      for (const qt of quizTypes) {
        // Get questions for this quiz type
        const questions = await prisma.quizQuestion.findMany({
          where: { 
            active: true,
            quizType: qt.quizType
          },
          orderBy: { order: 'asc' }
        });
        
        // Get total sessions for this quiz type
        const quizSessions = await prisma.quizSession.count({
          where: {
            createdAt: dateFilter,
            quizType: qt.quizType
          }
        });
        
        if (quizSessions > 0) {
          // Get first question answers for this quiz type
          const firstQuestion = questions[0];
          if (firstQuestion) {
            const firstQuestionAnswers = await prisma.quizAnswer.count({
              where: {
                questionId: firstQuestion.id,
                createdAt: dateFilter
              }
            });
            
            const dropOffRate = ((quizSessions - firstQuestionAnswers) / quizSessions) * 100;
            
            console.log(`🔍 Quiz Type Analysis: ${qt.quizType}`);
            console.log(`   Sessions: ${quizSessions}, First Question Answers: ${firstQuestionAnswers}`);
            console.log(`   Drop-off Rate: ${dropOffRate.toFixed(1)}%`);
            
            if (dropOffRate > maxDropOffRate) {
              maxDropOffRate = dropOffRate;
              problematicQuizType = qt.quizType;
              console.log(`   ✅ New most problematic quiz: ${qt.quizType} (${dropOffRate.toFixed(1)}% drop-off)`);
            }
          }
        }
      }
      
      defaultQuizType = problematicQuizType;
      console.log(`🎯 Selected most problematic quiz: ${defaultQuizType} (${maxDropOffRate.toFixed(1)}% drop-off)`);
    }
    
    const allQuestions = await prisma.quizQuestion.findMany({
      where: { 
        active: true,
        quizType: defaultQuizType
      },
      orderBy: { order: 'asc' }
    });

    // Get all question analytics in a single query to avoid connection pool issues
    const questionAnalyticsData = await prisma.quizAnswer.groupBy({
      by: ['questionId'],
      _count: {
        sessionId: true
      },
      where: {
        questionId: {
          in: allQuestions.map(q => q.id)
        }
      }
    });

    // Create a map for quick lookup
    const questionCountMap = new Map(
      questionAnalyticsData.map(item => [item.questionId, item._count.sessionId])
    );

    const questionAnalytics = allQuestions.map((question, index) => {
      const answeredCount = questionCountMap.get(question.id) || 0;
      const retentionRate = totalSessions > 0 ? (answeredCount / totalSessions) * 100 : 0;

      // Show quiz type in question text when "all" was selected
      const questionText = quizType === 'all' 
        ? `${question.prompt} (${question.quizType})` 
        : question.prompt;

      console.log(`📊 Question ${question.order} (DB order: ${question.order}): ${questionText}`);
      console.log(`   Answers: ${answeredCount}/${totalSessions} (${retentionRate.toFixed(1)}% retention)`);

      return {
        questionNumber: question.order,
        questionText: questionText,
        answeredCount,
        retentionRate: Math.round(retentionRate * 100) / 100,
        originalOrder: question.order,
        quizType: question.quizType,
        selectedQuizType: quizType === 'all' ? defaultQuizType : quizType, // Show which quiz was selected
      };
    });

    // Get activity data based on date range
    const getActivityData = async (dateRange: string) => {
      const now = new Date();
      let startDate = new Date();
      let endDate = new Date();

      switch (dateRange) {
          case '1d':
            startDate.setHours(now.getHours() - 24);
            break;
          case '7d':
            startDate.setDate(now.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(now.getDate() - 30);
            break;
          case '90d':
            startDate.setDate(now.getDate() - 90);
            break;
          case '1y':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
          default:
            startDate = new Date(0); // All time
        }

      // Get all sessions in the timeframe
      const sessions = await prisma.quizSession.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
          ...(quizType ? { quizType } : {})
        },
        select: {
          createdAt: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // Group sessions by timeframe
      const groupedData: { [key: string]: number } = {};
      
      sessions.forEach(session => {
        const date = new Date(session.createdAt);
        let key: string;
        
        switch (dateRange) {
          case '1d':
            key = date.toISOString().slice(0, 13); // YYYY-MM-DDTHH
            break;
          case '7d':
            key = date.toISOString().slice(0, 10); // YYYY-MM-DD
            break;
          case '30d':
            key = date.toISOString().slice(0, 10); // YYYY-MM-DD
            break;
          case '90d':
            key = date.toISOString().slice(0, 10); // YYYY-MM-DD
            break;
          case '1y':
            key = date.toISOString().slice(0, 7); // YYYY-MM
            break;
          case 'custom':
            key = date.toISOString().slice(0, 10); // YYYY-MM-DD
            break;
          default:
            key = date.toISOString().slice(0, 10);
        }
        
        groupedData[key] = (groupedData[key] || 0) + 1;
      });

      // Convert to array format with properly formatted dates
      return Object.entries(groupedData).map(([key, count]) => {
        let formattedDate: string;
        
        switch (dateRange) {
          case '1d':
            // Convert YYYY-MM-DDTHH to a proper date string
            formattedDate = new Date(key + ':00:00.000Z').toISOString();
            break;
          case '7d':
            // Convert YYYY-MM-DD to a proper date string
            formattedDate = new Date(key + 'T00:00:00.000Z').toISOString();
            break;
          case '30d':
            // Convert YYYY-MM-DD to a proper date string
            formattedDate = new Date(key + 'T00:00:00.000Z').toISOString();
            break;
          case '90d':
            // Convert YYYY-MM-DD to a proper date string
            formattedDate = new Date(key + 'T00:00:00.000Z').toISOString();
            break;
          case '1y':
            // Convert YYYY-MM to a proper date string
            formattedDate = new Date(key + '-01T00:00:00.000Z').toISOString();
            break;
          case 'custom':
            // Convert YYYY-MM-DD to a proper date string
            formattedDate = new Date(key + 'T00:00:00.000Z').toISOString();
            break;
          default:
            formattedDate = new Date(key + 'T00:00:00.000Z').toISOString();
        }
        
        return {
          createdAt: formattedDate,
          _count: { id: count }
        };
      });
    };

    const dailyActivity = await getActivityData(dateRange);

    // Calculate clicks - CORRECT LOGIC:
    // Clicks = Affiliate clicks (from affiliateClick table) + Quiz sessions (from quizSession table)
    // For specific quiz: Count affiliate clicks + quiz sessions for that quiz
    // For "all quizzes": Count all affiliate clicks + all quiz sessions
    
    let totalClicks = 0;
    
    if (quizType && quizType !== 'all') {
      // For specific quiz type:
      // 1. Count affiliate clicks (these are clicks on affiliate links, regardless of which quiz they led to)
      const affiliateClicks = await prisma.affiliateClick.count({
        where: {
          createdAt: dateFilter
        }
      });
      
      // 2. Count quiz sessions for this specific quiz type
      const quizSessions = await prisma.quizSession.count({
        where: {
          createdAt: dateFilter,
          quizType: quizType
        }
      });
      
      totalClicks = affiliateClicks + quizSessions;
    } else {
      // For "all quizzes":
      // 1. Count ALL affiliate clicks
      const affiliateClicks = await prisma.affiliateClick.count({
        where: {
          createdAt: dateFilter
        }
      });
      
      // 2. Count ALL quiz sessions
      const quizSessions = await prisma.quizSession.count({
        where: {
          createdAt: dateFilter
        }
      });
      
      totalClicks = affiliateClicks + quizSessions;
    }
    
    const clicks = totalClicks; // Total clicks for the selected quiz type(s)
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

    // Add affiliate data if affiliateCode is provided
    let affiliateData = null;
    if (affiliateCode) {
      console.log("Looking for affiliate with code:", affiliateCode);
      try {
        const affiliate = await prisma.affiliate.findUnique({
          where: { referralCode: affiliateCode },
        });

        console.log("Affiliate lookup result:", affiliate ? "Found" : "Not found");
        if (affiliate) {
          console.log("Found affiliate:", affiliate.id, affiliate.referralCode, affiliate.name);
          
          const [clicks, conversions] = await Promise.all([
            prisma.affiliateClick.findMany({
              where: { affiliateId: affiliate.id },
              orderBy: { createdAt: "desc" },
              take: 10
            }),
            prisma.affiliateConversion.findMany({
              where: { affiliateId: affiliate.id },
              orderBy: { createdAt: "desc" },
              take: 10
            })
          ]);
          
          console.log("Retrieved clicks:", clicks.length, "conversions:", conversions.length);

          const totalClicks = clicks.length;
          const totalLeads = conversions.filter((c: any) => c.status === "completed").length;
          const totalBookings = conversions.filter((c: any) => c.conversionType === "booking").length;
          const totalSales = conversions.filter((c: any) => c.conversionType === "sale").length;
          const totalCommission = conversions.reduce((sum: number, c: any) => sum + Number(c.commissionAmount || 0), 0);
          const conversionRate = totalClicks > 0 ? (totalSales / totalClicks) * 100 : 0;

          affiliateData = {
            affiliate: {
              id: affiliate.id,
              name: affiliate.name,
              email: affiliate.email,
              tier: affiliate.tier,
              referralCode: affiliate.referralCode,
              customLink: affiliate.customLink,
              commissionRate: affiliate.commissionRate,
              totalClicks: affiliate.totalClicks,
              totalLeads: affiliate.totalLeads,
              totalBookings: affiliate.totalBookings,
              totalSales: affiliate.totalSales,
              totalCommission: affiliate.totalCommission,
              isApproved: affiliate.isApproved,
              createdAt: affiliate.createdAt,
              updatedAt: affiliate.updatedAt
            },
            stats: {
              totalClicks,
              totalLeads,
              totalBookings,
              totalSales,
              totalCommission,
              conversionRate,
              averageSaleValue: totalSales > 0 ? totalCommission / totalSales : 0,
              pendingCommission: 0,
              paidCommission: 0,
              dailyStats: []
            },
            clicks: clicks.map((click: any) => ({
              id: click.id,
              createdAt: click.createdAt,
              ipAddress: click.ipAddress
            })),
            conversions: conversions.map((conv: any) => ({
              id: conv.id,
              conversionType: conv.conversionType,
              status: conv.status,
              createdAt: conv.createdAt,
              value: conv.value
            }))
          };
        }
      } catch (error) {
        console.error("Error fetching affiliate data:", error);
        console.error("Error details:", error instanceof Error ? error.message : String(error));
        console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
        // Don't provide fallback data - let the error bubble up
        affiliateData = null;
      }
    }

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
      // New metrics
      clicks,
      partialSubmissions,
      leadsCollected,
      averageTimeMs,
      topDropOffQuestions: questionsWithDrops,
      quizTypes: formattedQuizTypes,
      affiliateData,
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
