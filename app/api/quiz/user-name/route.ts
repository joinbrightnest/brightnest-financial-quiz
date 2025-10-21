import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Get the name answer from the quiz answers
    const nameAnswer = await prisma.quizAnswer.findFirst({
      where: {
        sessionId,
        question: {
          type: "text",
          prompt: {
            contains: "name",
            mode: "insensitive"
          }
        }
      },
      include: {
        question: true
      }
    });

    // Get the email answer from the quiz answers
    const emailAnswer = await prisma.quizAnswer.findFirst({
      where: {
        sessionId,
        question: {
          type: "text",
          prompt: {
            contains: "email",
            mode: "insensitive"
          }
        }
      },
      include: {
        question: true
      }
    });

    console.log('Name answer search result:', nameAnswer ? 'found' : 'not found');
    console.log('Email answer search result:', emailAnswer ? 'found' : 'not found');
    
    if (nameAnswer) {
      console.log('Name answer details:', {
        questionPrompt: nameAnswer.question.prompt,
        answerValue: nameAnswer.value
      });
    }

    if (emailAnswer) {
      console.log('Email answer details:', {
        questionPrompt: emailAnswer.question.prompt,
        answerValue: emailAnswer.value
      });
    }

    let name = null;
    let email = null;

    if (nameAnswer) {
      name = nameAnswer.value as string;
    } else {
      // Try to find any text answer as fallback for name
      const anyTextAnswer = await prisma.quizAnswer.findFirst({
        where: {
          sessionId,
          question: {
            type: "text"
          }
        },
        include: {
          question: true
        }
      });
      
      if (anyTextAnswer) {
        console.log('Fallback text answer for name:', {
          questionPrompt: anyTextAnswer.question.prompt,
          answerValue: anyTextAnswer.value
        });
        name = anyTextAnswer.value as string;
      }
    }

    if (emailAnswer) {
      email = emailAnswer.value as string;
    } else {
      // Try to find any text answer that looks like an email as fallback
      const allTextAnswers = await prisma.quizAnswer.findMany({
        where: {
          sessionId,
          question: {
            type: "text"
          }
        },
        include: {
          question: true
        }
      });
      
      for (const answer of allTextAnswers) {
        if (answer.value && typeof answer.value === 'string' && answer.value.includes('@')) {
          console.log('Found potential email in fallback:', answer.value);
          email = answer.value as string;
          break;
        }
      }
    }

    return NextResponse.json({
      name,
      email,
    });
  } catch (error) {
    console.error("Error fetching user name:", error);
    return NextResponse.json(
      { error: "Failed to fetch user name" },
      { status: 500 }
    );
  }
}
