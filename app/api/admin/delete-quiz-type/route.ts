import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { quizType } = await request.json();

    if (!quizType) {
      return NextResponse.json({ error: "Quiz type is required" }, { status: 400 });
    }

    console.log(`Starting deletion of quiz type: ${quizType}`);

    // Step 1: Delete all quiz answers for this quiz type
    console.log("Deleting quiz answers...");
    const deletedAnswers = await prisma.quizAnswer.deleteMany({
      where: {
        question: {
          quizType: quizType,
        },
      },
    });
    console.log(`Deleted ${deletedAnswers.count} quiz answers`);

    // Step 2: Delete all results for this quiz type
    console.log("Deleting results...");
    const deletedResults = await prisma.result.deleteMany({
      where: {
        session: {
          quizType: quizType,
        },
      },
    });
    console.log(`Deleted ${deletedResults.count} results`);

    // Step 3: Delete all quiz sessions for this quiz type
    console.log("Deleting quiz sessions...");
    const deletedSessions = await prisma.quizSession.deleteMany({
      where: {
        quizType: quizType,
      },
    });
    console.log(`Deleted ${deletedSessions.count} quiz sessions`);

    // Step 4: Delete all questions for this quiz type
    console.log("Deleting quiz questions...");
    const deletedQuestions = await prisma.quizQuestion.deleteMany({
      where: {
        quizType: quizType,
      },
    });
    console.log(`Deleted ${deletedQuestions.count} quiz questions`);

    const totalDeleted = deletedAnswers.count + deletedResults.count + deletedSessions.count + deletedQuestions.count;

    console.log(`Successfully deleted quiz type: ${quizType}`);
    console.log(`Total records deleted: ${totalDeleted}`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted quiz type "${quizType}" and all associated data.`,
      deletedCounts: {
        answers: deletedAnswers.count,
        results: deletedResults.count,
        sessions: deletedSessions.count,
        questions: deletedQuestions.count,
        total: totalDeleted,
      },
    });
  } catch (error) {
    console.error("Error deleting quiz type:", error);
    return NextResponse.json(
      { error: `Failed to delete quiz type: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
