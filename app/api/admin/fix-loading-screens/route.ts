import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Get all unassigned loading screens
    const unassignedScreens = await prisma.loadingScreen.findMany({
      where: {
        triggerQuestionId: null,
        isActive: true
      }
    });

    if (unassignedScreens.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No unassigned loading screens found',
        fixed: 0
      });
    }

    // Get the first question for each quiz type
    const quizTypes = [...new Set(unassignedScreens.map(s => s.quizType))];
    const firstQuestions = await Promise.all(
      quizTypes.map(async (quizType) => {
        const firstQuestion = await prisma.quizQuestion.findFirst({
          where: { 
            quizType,
            active: true 
          },
          orderBy: { order: 'asc' }
        });
        return { quizType, firstQuestion };
      })
    );

    // Create a map of quizType to first question
    const questionMap = firstQuestions.reduce((acc, item) => {
      if (item.firstQuestion) {
        acc[item.quizType] = item.firstQuestion.id;
      }
      return acc;
    }, {} as Record<string, string>);

    // Update unassigned loading screens to be assigned to the first question
    let fixedCount = 0;
    for (const screen of unassignedScreens) {
      const firstQuestionId = questionMap[screen.quizType];
      if (firstQuestionId) {
        await prisma.loadingScreen.update({
          where: { id: screen.id },
          data: { triggerQuestionId: firstQuestionId }
        });
        fixedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Fixed ${fixedCount} loading screens by assigning them to first questions`,
      fixed: fixedCount,
      totalUnassigned: unassignedScreens.length
    });

  } catch (error: any) {
    console.error('Error fixing loading screens:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fix loading screens',
      details: error?.message 
    }, { status: 500 });
  }
}
