import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

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
            startDate.setDate(now.getDate() - 7);
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

    // Get all leads (completed sessions - anyone who completed the quiz is a lead)
    const allLeads = await prisma.quizSession.findMany({
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

    // Add source information to each lead
    const leadsWithSource = allLeads.map(lead => ({
      ...lead,
      source: lead.affiliateCode 
        ? affiliateMap[lead.affiliateCode] || 'Unknown Affiliate'
        : 'Website'
    }));

    // Get archetype distribution
    const archetypeStats = await prisma.result.groupBy({
      by: ["archetype"],
      _count: { archetype: true },
    });

    // Calculate completion rate (using leads as completed sessions)
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
    const allQuestions = await prisma.quizQuestion.findMany({
      where: { 
        active: true,
        ...(quizType ? { quizType } : {})
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

    const questionAnalytics = allQuestions.map(question => {
      const answeredCount = questionCountMap.get(question.id) || 0;
      const retentionRate = totalSessions > 0 ? (answeredCount / totalSessions) * 100 : 0;

      return {
        questionNumber: question.order,
        questionText: question.prompt,
        answeredCount,
        retentionRate: Math.round(retentionRate * 100) / 100,
      };
    });

    // Get activity data based on date range
    const getActivityData = async (dateRange: string, customStartDate?: string, customEndDate?: string) => {
      const now = new Date();
      let startDate = new Date();
      let endDate = new Date();

      if (dateRange === 'custom' && customStartDate && customEndDate) {
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        // Set end date to end of day
        endDate.setHours(23, 59, 59, 999);
      } else {
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
            startDate.setDate(now.getDate() - 7);
        }
      }

      // Get all sessions in the timeframe
      const sessions = await prisma.quizSession.findMany({
        where: {
          createdAt: {
            gte: startDate,
            ...(dateRange === 'custom' && customStartDate && customEndDate ? { lte: endDate } : {})
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

    const dailyActivity = await getActivityData(dateRange, startDate || undefined, endDate || undefined);

    // Calculate new metrics
    const visitors = totalSessions; // Total unique visitors who started the quiz
    const partialSubmissions = totalSessions - completedSessions; // Started but didn't complete
    const leadsCollected = allLeads.length; // Count completed sessions (all completed quizzes are leads)
    const averageTimeMs = avgDurationResult._avg.durationMs || 0; // Average time in milliseconds

    // Get top 3 questions responsible for biggest drop-offs (questions that CAUSE the drop)
    // Only calculate if there are actual user sessions (not just empty quiz structure)
    const questionsWithDrops = totalSessions > 0 ? questionAnalytics
      .filter((q): q is NonNullable<typeof q> => q !== null)
      .map((q, index) => {
        const previousQuestion = index > 0 ? questionAnalytics[index - 1] : null;
        
        // Calculate drop from previous question
        let dropFromPrevious = 0;
        let previousRetentionRate = 100; // Default to 100% for first question
        
        if (previousQuestion) {
          previousRetentionRate = previousQuestion.retentionRate;
          dropFromPrevious = previousRetentionRate - q.retentionRate;
        } else {
          // For the first question, calculate drop from 100% (all users who started)
          dropFromPrevious = 100 - q.retentionRate;
        }
        
        return {
          questionNumber: q.questionNumber,
          questionText: q.questionText,
          dropFromPrevious: Math.round(dropFromPrevious * 100) / 100,
          retentionRate: q.retentionRate,
          previousRetentionRate: previousRetentionRate
        };
      })
      .filter(q => q.dropFromPrevious > 0) // Only questions that caused a drop
      .sort((a, b) => b.dropFromPrevious - a.dropFromPrevious)
      .slice(0, 3) // Top 3 questions responsible for drops
      : []; // Return empty array if no user sessions exist

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
      allLeads: leadsWithSource,
      archetypeStats,
      questionAnalytics: questionAnalytics.filter(Boolean),
      dailyActivity,
      // New metrics
      visitors,
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
