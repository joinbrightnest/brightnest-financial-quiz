import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, rateLimitExceededResponse } from "@/lib/rate-limit";
import { Redis } from "@upstash/redis"; // ✅ For caching quiz questions

// Initialize Redis client (will use env vars automatically)
let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
  }
} catch (error) {
  console.warn('Redis not available for quiz caching:', error);
}

export async function POST(request: NextRequest) {
  // 🛡️ SECURITY: Rate limit quiz starts (30 per minute)
  const rateLimitResult = await rateLimit(request, 'api');
  if (!rateLimitResult.success) {
    return rateLimitExceededResponse(rateLimitResult);
  }

  try {
    const { quizType = "financial-profile", affiliateCode: requestAffiliateCode } = await request.json();

    // Only use affiliate code if explicitly provided in the request
    // Don't use cookie-based affiliate codes for direct website visits
    let affiliateCode = requestAffiliateCode || null;

    // Validate affiliate code if provided (ensure it's active and approved)
    if (affiliateCode) {
      try {
        const affiliate = await prisma.affiliate.findUnique({
          where: { referralCode: affiliateCode },
          select: { id: true, isActive: true, isApproved: true },
        });

        if (!affiliate || !affiliate.isActive || !affiliate.isApproved) {
          console.log("⚠️ Invalid, inactive, or unapproved affiliate code, ignoring:", affiliateCode);
          affiliateCode = null; // Don't track invalid affiliates
        } else {
          console.log("🎯 Quiz started with valid affiliate code:", affiliateCode);
          // Note: Click tracking is handled separately by /api/track-affiliate to avoid double counting
        }
      } catch (error) {
        console.error("Error validating affiliate code:", error);
        affiliateCode = null; // Don't track if validation fails
      }
    } else {
      console.log("ℹ️ No affiliate code found in request - direct website visit");
    }

    // ✅ OPTIMIZATION: Try to get questions from cache first
    let firstQuestion: any = null; // Use 'any' for now as Redis returns string, DB returns object
    let questionCount: number | null = null;

    if (redis) {
      try {
        const cacheKey = `quiz:${quizType}:first`;
        const countKey = `quiz:${quizType}:count`;

        // Try cache first (parallel fetch)
        const [cachedQuestion, cachedCount] = await Promise.all([
          redis.get(cacheKey),
          redis.get(countKey),
        ]);

        if (cachedQuestion && cachedCount !== null) { // cachedCount can be 0, so check for null
          firstQuestion = JSON.parse(cachedQuestion as string); // Parse the JSON string from Redis
          questionCount = cachedCount as number;
          console.log(`✅ Cache hit for quiz type: ${quizType}`);
        }
      } catch (cacheError) {
        console.warn('Cache read failed, falling back to database:', cacheError);
        firstQuestion = null; // Ensure we fall back to DB if parsing fails
        questionCount = null;
      }
    }

    let session;

    // Cache miss or Redis unavailable - fetch from database
    if (!firstQuestion || questionCount === null) { // Check for null on questionCount
      const [dbSession, dbQuestion, dbCount] = await Promise.all([
        prisma.quizSession.create({
          data: {
            quizType,
            status: "in_progress",
            affiliateCode,
          },
        }),
        prisma.quizQuestion.findFirst({
          where: {
            active: true,
            quizType: quizType
          },
          orderBy: { order: "asc" },
        }),
        prisma.quizQuestion.count({
          where: {
            active: true,
            quizType: quizType,
          },
        }),
      ]);

      session = dbSession;
      firstQuestion = dbQuestion;
      questionCount = dbCount;

      // Store in cache for 1 hour (questions rarely change)
      if (redis && firstQuestion) {
        try {
          const cacheKey = `quiz:${quizType}:first`;
          const countKey = `quiz:${quizType}:count`;

          await Promise.all([
            redis.set(cacheKey, JSON.stringify(firstQuestion), { ex: 3600 }), // 1 hour TTL
            redis.set(countKey, questionCount, { ex: 3600 }),
          ]);
          console.log(`✅ Cached quiz data for type: ${quizType}`);
        } catch (cacheError) {
          console.warn('Cache write failed:', cacheError);
        }
      }
    } else {
      // Cache hit - only need to create session
      session = await prisma.quizSession.create({
        data: {
          quizType,
          status: "in_progress",
          affiliateCode,
        },
      });
    }

    if (!firstQuestion) {
      return NextResponse.json(
        { error: "No questions available for this quiz type" },
        { status: 404 }
      );
    }

    // Return session, question, and count in one response (optimization: eliminates extra API call)
    return NextResponse.json({
      sessionId: session.id,
      question: firstQuestion,
      totalQuestions: questionCount,
    });
  } catch (error) {
    console.error("Error starting quiz:", error);
    return NextResponse.json(
      { error: "Failed to start quiz" },
      { status: 500 }
    );
  }
}