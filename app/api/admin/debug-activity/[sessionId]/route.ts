import { NextRequest, NextResponse } from 'next/server';
<parameter name="prisma">/lib/prisma';
import { verifyAdminAuth } from '@/lib/admin-auth-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { sessionId } = await params;

    // Get quiz session
    const quizSession = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        answers: {
          include: {
            question: true
          }
        }
      }
    });

    if (!quizSession) {
      return NextResponse.json({ error: 'Quiz session not found' }, { status: 404 });
    }

    // Try to find email
    const emailAnswer = quizSession.answers.find(a => 
      a.question?.prompt?.toLowerCase().includes('email')
    );

    const email = emailAnswer?.value || emailAnswer?.answer || (emailAnswer as any)?.answerValue;

    // Try to find appointment
    let appointment = null;
    if (email && typeof email === 'string') {
      appointment = await prisma.appointment.findFirst({
        where: {
          customerEmail: email.toLowerCase()
        },
        include: {
          closer: true
        }
      });
    }

    return NextResponse.json({
      debug: {
        sessionId,
        quizSession: {
          id: quizSession.id,
          status: quizSession.status,
          completedAt: quizSession.completedAt,
        },
        emailAnswer: {
          found: !!emailAnswer,
          value: emailAnswer?.value,
          answer: (emailAnswer as any)?.answer,
          answerValue: (emailAnswer as any)?.answerValue,
          extractedEmail: email,
          questionPrompt: emailAnswer?.question?.prompt,
        },
        appointment: {
          found: !!appointment,
          id: appointment?.id,
          customerEmail: appointment?.customerEmail,
          outcome: appointment?.outcome,
          status: appointment?.status,
          updatedAt: appointment?.updatedAt,
          closerName: appointment?.closer?.name,
        },
        allAnswers: quizSession.answers.map(a => ({
          questionPrompt: a.question?.prompt,
          value: a.value,
          type: typeof a.value,
        })),
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

