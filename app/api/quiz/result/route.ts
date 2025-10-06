import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateArchetype, ScoreCategory } from "@/lib/scoring";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    // Get all answers for this session
    const answers = await prisma.quizAnswer.findMany({
      where: { sessionId },
      include: { question: true },
    });

    // Calculate scores
    const scores: ScoreCategory = {
      debt: 0,
      savings: 0,
      spending: 0,
      investing: 0,
    };

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
      }
    });

    // Calculate archetype
    const archetype = calculateArchetype(scores);

    // Get the session to calculate duration
    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
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

    // Save result
    const result = await prisma.result.create({
      data: {
        sessionId,
        archetype,
        scores: scores as unknown as Record<string, number>,
      },
    });

    return NextResponse.json({
      resultId: result.id,
      archetype,
      scores,
    });
  } catch (error) {
    console.error("Error calculating result:", error);
    return NextResponse.json(
      { error: "Failed to calculate result" },
      { status: 500 }
    );
  }
}
