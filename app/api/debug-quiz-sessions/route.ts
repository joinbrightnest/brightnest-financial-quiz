import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const affiliateCode = searchParams.get('affiliateCode') || 'castan';

    console.log(`🔍 Looking for quiz sessions for affiliate: ${affiliateCode}`);

    // Find all quiz sessions for this affiliate
    const sessions = await prisma.quizSession.findMany({
      where: {
        affiliateCode: affiliateCode
      },
      include: {
        answers: {
          include: {
            question: true
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    });

    console.log(`📊 Found ${sessions.length} quiz sessions for affiliate: ${affiliateCode}`);

    const sessionData = sessions.map(session => ({
      id: session.id,
      status: session.status,
      completedAt: session.completedAt,
      answers: session.answers.map(answer => ({
        questionPrompt: answer.question.prompt,
        questionType: answer.question.type,
        value: answer.value
      }))
    }));

    return NextResponse.json({
      success: true,
      affiliateCode,
      sessionCount: sessions.length,
      sessions: sessionData
    });

  } catch (error) {
    console.error('❌ Error fetching quiz sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz sessions' },
      { status: 500 }
    );
  }
}
