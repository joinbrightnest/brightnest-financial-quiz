import { NextRequest, NextResponse } from "next/server";
import { calculateArchetype, ScoreCategory } from "@/lib/scoring";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    console.log('Processing result for sessionId:', sessionId);

    // Get all answers for this session
    const answers = await prisma.quizAnswer.findMany({
      where: { sessionId },
      include: { question: true },
    });
    
    console.log('Found answers:', answers.length);
    console.log('Answer details:', answers.map(a => ({ questionId: a.questionId, value: a.value })));

    // Calculate scores
    const scores: ScoreCategory = {
      debt: 0,
      savings: 0,
      spending: 0,
      investing: 0,
    };

    let totalPoints = 0;

    answers.forEach((answer) => {
      const questionOptions = answer.question.options as Array<{
        value: string;
        weightCategory: keyof ScoreCategory;
        weightValue: number;
      }>;

      const selectedOption = questionOptions.find(
        (option) => option.value === answer.value
      );

      if (selectedOption) {
        scores[selectedOption.weightCategory] += selectedOption.weightValue;
        totalPoints += selectedOption.weightValue;
      }
    });

    // Calculate archetype
    const archetype = calculateArchetype(scores);

    // Get qualification threshold from settings
    let qualificationThreshold = 17; // Default fallback
    try {
      const settingsResult = await prisma.$queryRaw<Array<{ value: string }>>`
        SELECT value FROM "Settings" WHERE key = 'qualification_threshold'
      `;
      if (settingsResult && settingsResult[0]) {
        qualificationThreshold = parseInt(settingsResult[0].value);
      }
    } catch (error) {
      console.log('Settings table not found, using default threshold:', qualificationThreshold);
    }

    // Determine qualification based on dynamic threshold
    const qualifiesForCall = totalPoints >= qualificationThreshold;

    // Get the session to calculate duration
    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId }
    });

    console.log('Session found:', !!session);

    if (!session) {
      console.log('Session not found for ID:', sessionId);
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Calculate duration in milliseconds
    const completedAt = new Date();
    const startedAt = session.startedAt;
    const durationMs = completedAt.getTime() - startedAt.getTime();

    // Update session with completion data and duration
    await prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        status: "completed",
        completedAt,
        durationMs,
      },
    });

    // Handle affiliate conversion tracking
    if (session.affiliateCode) {
      try {
        // Find the affiliate
        const affiliate = await prisma.affiliate.findUnique({
          where: { referralCode: session.affiliateCode },
        });

        if (affiliate && affiliate.isActive) {
          // Get commission hold days from settings
          let commissionHoldDays = 30; // Default fallback
          try {
            const holdDaysResult = await prisma.$queryRaw`
              SELECT value FROM "Settings" WHERE key = 'commission_hold_days'
            ` as any[];
            if (holdDaysResult.length > 0) {
              commissionHoldDays = parseInt(holdDaysResult[0].value);
            }
          } catch (error) {
            console.log('Using default commission hold days:', commissionHoldDays);
          }

          // Calculate hold until date
          const holdUntil = new Date();
          holdUntil.setDate(holdUntil.getDate() + commissionHoldDays);

          // Record the conversion (lead)
          await prisma.affiliateConversion.create({
            data: {
              affiliateId: affiliate.id,
              quizSessionId: sessionId,
              referralCode: session.affiliateCode,
              conversionType: "quiz_completion",
              status: "confirmed",
              commissionAmount: 0.00,
              saleValue: 0.00,
              commissionStatus: "held",
              holdUntil: holdUntil,
            },
          });

          // Update affiliate's total leads
          await prisma.affiliate.update({
            where: { id: affiliate.id },
            data: {
              totalLeads: {
                increment: 1,
              },
            },
          });

          console.log("Affiliate conversion tracked:", session.affiliateCode);
        }
      } catch (error) {
        console.error("Error tracking affiliate conversion:", error);
        // Continue with result creation even if tracking fails
      }
    }

    // Check if result already exists
    let result = await prisma.result.findUnique({
      where: { sessionId }
    });

    if (result) {
      console.log('Result already exists:', result.id);
    } else {
      // Save result
      console.log('Creating result with data:', { sessionId, archetype, scores });
      
      result = await prisma.result.create({
        data: {
          sessionId,
          archetype,
          scores: {
            ...scores,
            totalPoints,
            qualifiesForCall,
          } as unknown as Record<string, number>,
        },
      });

      console.log('Result created successfully:', result.id);
    }

    return NextResponse.json({
      resultId: result.id,
      archetype,
      scores,
      totalPoints,
      qualifiesForCall,
    });
  } catch (error) {
    console.error("Error calculating result:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: "Failed to calculate result" },
      { status: 500 }
    );
  }
}
