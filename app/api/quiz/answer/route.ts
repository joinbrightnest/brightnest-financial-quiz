import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, rateLimitExceededResponse } from "@/lib/rate-limit";
import { quizAnswerSchema, validateRequest } from "@/lib/validation";

// Helper function to check for articles (optimized)
async function checkForArticles(questionId: string, answerValue: string) {
  try {
    const articles = await prisma.article.findMany({
      where: {
        isActive: true,
        triggers: {
          some: {
            isActive: true,
            OR: [
              {
                questionId: questionId,
                optionValue: answerValue
              },
              {
                optionValue: answerValue
              }
            ]
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1,
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        category: true,
        tags: true,
        subtitle: true,
        personalizedText: true,
        backgroundColor: true,
        textColor: true,
        iconColor: true,
        accentColor: true,
        iconType: true,
        showIcon: true,
        showStatistic: true,
        statisticText: true,
        statisticValue: true,
        ctaText: true,
        showCta: true,
        textAlignment: true,
        contentPosition: true,
        backgroundStyle: true,
        backgroundGradient: true,
        contentPadding: true,
        showTopBar: true,
        topBarColor: true,
        titleFontSize: true,
        titleFontWeight: true,
        contentFontSize: true,
        contentFontWeight: true,
        lineHeight: true,
        imageUrl: true,
        imageAlt: true,
        showImage: true,
      }
    });

    if (articles.length === 0) return null;

    const article = articles[0];
    return {
      id: article.id,
      title: article.title,
      content: article.content,
      type: article.type,
      category: article.category,
      keyPoints: Array.isArray(article.tags) ? article.tags : [],
      sources: [],
      subtitle: article.subtitle,
      personalizedText: article.personalizedText,
      backgroundColor: article.backgroundColor,
      textColor: article.textColor,
      iconColor: article.iconColor,
      accentColor: article.accentColor,
      iconType: article.iconType,
      showIcon: article.showIcon,
      showStatistic: article.showStatistic,
      statisticText: article.statisticText,
      statisticValue: article.statisticValue,
      ctaText: article.ctaText,
      showCta: article.showCta,
      textAlignment: article.textAlignment,
      contentPosition: article.contentPosition,
      backgroundStyle: article.backgroundStyle,
      backgroundGradient: article.backgroundGradient,
      contentPadding: article.contentPadding,
      showTopBar: article.showTopBar,
      topBarColor: article.topBarColor,
      titleFontSize: article.titleFontSize,
      titleFontWeight: article.titleFontWeight,
      contentFontSize: article.contentFontSize,
      contentFontWeight: article.contentFontWeight,
      lineHeight: article.lineHeight,
      imageUrl: article.imageUrl,
      imageAlt: article.imageAlt,
      showImage: article.showImage,
    };
  } catch (error) {
    console.error('Error checking for articles:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  // 🛡️ SECURITY: Rate limit quiz answer submissions (60 per minute)
  const rateLimitResult = await rateLimit(request, 'api');
  if (!rateLimitResult.success) {
    return rateLimitExceededResponse(rateLimitResult);
  }

  try {
    const body = await request.json();
    
    // ✅ SECURITY: Validate input with Zod
    const validation = validateRequest(quizAnswerSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    const { sessionId, questionId, value, dwellMs, checkArticles } = validation.data;

    // Handle preload requests (don't save answer, just get next question)
    const isPreload = value === "preload";

    // Run database operations in parallel for better performance
    // Also check for articles in parallel if requested (optimization: reduce round trips)
    const operations: Promise<any>[] = [
      prisma.quizAnswer.findFirst({
        where: { sessionId, questionId },
        select: { id: true, value: true, dwellMs: true },
      }),
      prisma.quizQuestion.findUnique({
        where: { id: questionId },
        select: { id: true, order: true, quizType: true, active: true },
      }),
      prisma.quizSession.findUnique({
        where: { id: sessionId },
        select: { id: true, quizType: true, status: true },
      }),
    ];

    // Check for articles in parallel if requested (optimization)
    let article: any = null;
    if (checkArticles && !isPreload) {
      // Convert value to string for article checking
      const answerValue = typeof value === 'string' ? value : JSON.stringify(value);
      operations.push(checkForArticles(questionId, answerValue));
    }

    const results = await Promise.all(operations);
    const [existingAnswer, currentQuestion, session, ...rest] = results;
    
    // Extract article if it was checked
    if (checkArticles && !isPreload && rest.length > 0) {
      article = rest[0] || null;
    }

    // Validate session exists
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Validate session is still in progress
    if (session.status === "completed") {
      return NextResponse.json(
        { error: "Quiz session already completed" },
        { status: 400 }
      );
    }

    // Validate question exists
    if (!currentQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Validate question belongs to same quiz type as session
    if (currentQuestion.quizType !== session.quizType) {
      return NextResponse.json(
        { error: "Question does not belong to this quiz session" },
        { status: 400 }
      );
    }

    // Save/update answer (skip for preload requests)
    // Use transaction with upsert to handle race conditions safely (unique constraint protects against duplicates)
    if (!isPreload) {
      // Use upsert pattern: check if exists, then update or create
      // The unique constraint on [sessionId, questionId] prevents duplicates
      if (existingAnswer) {
        await prisma.quizAnswer.update({
          where: { id: existingAnswer.id },
          data: { value, dwellMs },
        });
      } else {
        // Use create with error handling for race conditions
        try {
          await prisma.quizAnswer.create({
            data: { sessionId, questionId, value, dwellMs },
          });
        } catch (error: any) {
          // If unique constraint violation (race condition), update instead
          if (error?.code === 'P2002' || error?.message?.includes('Unique constraint')) {
            const raceAnswer = await prisma.quizAnswer.findFirst({
              where: { sessionId, questionId },
            });
            if (raceAnswer) {
              await prisma.quizAnswer.update({
                where: { id: raceAnswer.id },
                data: { value, dwellMs },
              });
            }
          } else {
            throw error;
          }
        }
      }
    }

    // Get next question and loading screen in parallel (optimized: select only needed fields)
    const [nextQuestion, loadingScreen] = await Promise.all([
      prisma.quizQuestion.findFirst({
        where: {
          active: true,
          quizType: currentQuestion.quizType,
          order: { gt: currentQuestion.order },
        },
        orderBy: { order: "asc" },
      }),
      prisma.loadingScreen.findFirst({
        where: {
          quizType: currentQuestion.quizType,
          triggerQuestionId: questionId,
          isActive: true,
        },
      }),
    ]);

    if (!nextQuestion) {
      // No more questions - let the result endpoint handle completion
      // This ensures answers are saved before marking as completed
      return NextResponse.json({
        isComplete: true,
        message: "Quiz completed",
        article: article || null, // Return article if found (for consistency)
      });
    }

    return NextResponse.json({
      isComplete: false,
      nextQuestion,
      loadingScreen: loadingScreen || null,
      article: article || null, // Return article if found (optimization: reduces round trips)
    });
  } catch (error) {
    console.error("Error saving answer:", error);
    return NextResponse.json(
      { error: "Failed to save answer" },
      { status: 500 }
    );
  }
}
