import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { archetypeCopyService, ArchetypeCopyRequest } from "@/lib/ai-content";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Get session with answers and result
    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        answers: {
          include: { question: true },
          orderBy: { createdAt: "asc" }
        },
        result: true
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Build quiz summary from answers
    const quizSummary = buildQuizSummary(session.answers);
    
    // Get user name if available
    const userName = session.answers.find(answer => 
      answer.question.prompt.toLowerCase().includes('name')
    )?.value as string;

    // Format quiz answers for AI
    const quizAnswers = session.answers.map(answer => ({
      question: answer.question.prompt,
      answer: typeof answer.value === 'string' ? answer.value : JSON.stringify(answer.value)
    }));

    let personalizedCopy;

    if (session.result) {
      // Result exists - generate personalized copy
      const copyRequest: ArchetypeCopyRequest = {
        archetype: session.result.archetype,
        quizSummary,
        scores: session.result.scores as Record<string, number>,
        userName: userName || undefined,
        quizAnswers
      };

      personalizedCopy = await archetypeCopyService.generatePersonalizedCopy(copyRequest);
    } else {
      // Result doesn't exist yet - generate fallback copy based on answers
      const fallbackRequest: ArchetypeCopyRequest = {
        archetype: "Stability Seeker", // Default archetype
        quizSummary,
        scores: { debt: 0, savings: 0, spending: 0, investing: 0 }, // Default scores
        userName: userName || undefined,
        quizAnswers
      };

      personalizedCopy = await archetypeCopyService.generatePersonalizedCopy(fallbackRequest);
    }

    return NextResponse.json({
      copy: personalizedCopy,
      archetype: session.result?.archetype || "Stability Seeker",
      scores: session.result?.scores || { debt: 0, savings: 0, spending: 0, investing: 0 }
    });

  } catch (error) {
    console.error("Error generating archetype copy:", error);
    return NextResponse.json(
      { error: "Failed to generate personalized copy" },
      { status: 500 }
    );
  }
}

function buildQuizSummary(answers: any[]): string {
  const summaryParts: string[] = [];
  
  // Group answers by category/theme
  const categories: Record<string, string[]> = {
    preferences: [],
    behaviors: [],
    goals: [],
    challenges: []
  };

  answers.forEach(answer => {
    const prompt = answer.question.prompt.toLowerCase();
    const answerValue = typeof answer.value === 'string' ? answer.value : JSON.stringify(answer.value);
    
    if (prompt.includes('prefer') || prompt.includes('like') || prompt.includes('enjoy')) {
      categories.preferences.push(answerValue);
    } else if (prompt.includes('usually') || prompt.includes('often') || prompt.includes('tend to')) {
      categories.behaviors.push(answerValue);
    } else if (prompt.includes('goal') || prompt.includes('want') || prompt.includes('aim')) {
      categories.goals.push(answerValue);
    } else if (prompt.includes('struggle') || prompt.includes('difficult') || prompt.includes('challenge')) {
      categories.challenges.push(answerValue);
    } else {
      // Default to behaviors for general questions
      categories.behaviors.push(answerValue);
    }
  });

  // Build summary
  if (categories.preferences.length > 0) {
    summaryParts.push(`User prefers ${categories.preferences.join(', ')}`);
  }
  
  if (categories.behaviors.length > 0) {
    summaryParts.push(`User typically ${categories.behaviors.join(', ')}`);
  }
  
  if (categories.goals.length > 0) {
    summaryParts.push(`User wants to ${categories.goals.join(', ')}`);
  }
  
  if (categories.challenges.length > 0) {
    summaryParts.push(`User struggles with ${categories.challenges.join(', ')}`);
  }

  return summaryParts.join('. ') || 'User completed financial quiz with various responses indicating their financial personality and preferences.';
}
