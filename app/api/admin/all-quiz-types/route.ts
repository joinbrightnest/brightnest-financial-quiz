import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get all unique quiz types from the database
    const quizTypes = await prisma.quizQuestion.groupBy({
      by: ['quizType'],
      _count: {
        id: true,
      },
      where: {
        active: true,
      },
    });

    // Convert to the format expected by the frontend
    const formattedQuizTypes = quizTypes.map(quizType => {
      // Convert quiz type name to display name
      const displayName = quizType.quizType
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Generate description based on quiz type
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
      success: true,
      quizTypes: formattedQuizTypes,
      totalQuizTypes: formattedQuizTypes.length,
    });
  } catch (error) {
    console.error("Error fetching quiz types:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz types" },
      { status: 500 }
    );
  }
}
