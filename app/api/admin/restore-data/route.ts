import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Financial Profile Quiz Questions
const financialProfileQuestions = [
  {
    order: 1,
    prompt: "What's your primary financial goal right now?",
    type: "single",
    options: [
      {
        label: "Pay off debt as quickly as possible",
        value: "payoff_debt",
        weightCategory: "debt",
        weightValue: 3
      },
      {
        label: "Build up my emergency savings",
        value: "emergency_savings",
        weightCategory: "savings",
        weightValue: 3
      },
      {
        label: "Create a stable monthly budget",
        value: "stable_budget",
        weightCategory: "spending",
        weightValue: 3
      },
      {
        label: "Start investing for long-term growth",
        value: "start_investing",
        weightCategory: "investing",
        weightValue: 3
      }
    ],
    active: true,
    skipButton: false,
    continueButton: false,
    continueButtonColor: '#09727c'
  },
  {
    order: 2,
    prompt: "How do you typically handle unexpected expenses?",
    type: "single",
    options: [
      {
        label: "Use my emergency fund",
        value: "emergency_fund",
        weightCategory: "savings",
        weightValue: 3
      },
      {
        label: "Put it on a credit card",
        value: "credit_card",
        weightCategory: "debt",
        weightValue: 3
      },
      {
        label: "Borrow from family or friends",
        value: "borrow",
        weightCategory: "debt",
        weightValue: 2
      },
      {
        label: "Cut back on other expenses",
        value: "cut_back",
        weightCategory: "spending",
        weightValue: 3
      }
    ],
    active: true,
    skipButton: false,
    continueButton: false,
    continueButtonColor: '#09727c'
  },
  {
    order: 3,
    prompt: "What's your approach to budgeting?",
    type: "single",
    options: [
      {
        label: "I track every expense meticulously",
        value: "meticulous",
        weightCategory: "spending",
        weightValue: 3
      },
      {
        label: "I have a general idea of my spending",
        value: "general",
        weightCategory: "spending",
        weightValue: 2
      },
      {
        label: "I don't really budget",
        value: "no_budget",
        weightCategory: "spending",
        weightValue: 1
      },
      {
        label: "I use budgeting apps or tools",
        value: "apps",
        weightCategory: "spending",
        weightValue: 3
      }
    ],
    active: true,
    skipButton: false,
    continueButton: false,
    continueButtonColor: '#09727c'
  },
  {
    order: 4,
    prompt: "How do you feel about investing?",
    type: "single",
    options: [
      {
        label: "I'm comfortable with high-risk investments",
        value: "high_risk",
        weightCategory: "investing",
        weightValue: 3
      },
      {
        label: "I prefer low-risk, stable investments",
        value: "low_risk",
        weightCategory: "investing",
        weightValue: 2
      },
      {
        label: "I'm not sure about investing",
        value: "unsure",
        weightCategory: "investing",
        weightValue: 1
      },
      {
        label: "I don't invest at all",
        value: "no_invest",
        weightCategory: "investing",
        weightValue: 0
      }
    ],
    active: true,
    skipButton: false,
    continueButton: false,
    continueButtonColor: '#09727c'
  },
  {
    order: 5,
    prompt: "What's your biggest financial concern?",
    type: "single",
    options: [
      {
        label: "Not having enough for retirement",
        value: "retirement",
        weightCategory: "investing",
        weightValue: 3
      },
      {
        label: "Paying off debt",
        value: "debt_payoff",
        weightCategory: "debt",
        weightValue: 3
      },
      {
        label: "Building emergency savings",
        value: "emergency_savings_concern",
        weightCategory: "savings",
        weightValue: 3
      },
      {
        label: "Managing daily expenses",
        value: "daily_expenses",
        weightCategory: "spending",
        weightValue: 3
      }
    ],
    active: true,
    skipButton: false,
    continueButton: false,
    continueButtonColor: '#09727c'
  }
];

export async function POST() {
  try {
    console.log('Starting data restoration...');

    // Clear existing questions for financial-profile
    await prisma.quizQuestion.deleteMany({
      where: {
        quizType: 'financial-profile'
      }
    });

    // Create new questions
    const createdQuestions = await Promise.all(
      financialProfileQuestions.map(async (questionData) => {
        return prisma.quizQuestion.create({
          data: {
            quizType: 'financial-profile',
            order: questionData.order,
            prompt: questionData.prompt,
            type: questionData.type,
            options: questionData.options,
            active: questionData.active,
            skipButton: questionData.skipButton,
            continueButton: questionData.continueButton,
            continueButtonColor: questionData.continueButtonColor,
            textUnderAnswers: null,
            textUnderButton: null,
          },
        });
      })
    );

    console.log('Data restoration completed successfully!');
    
    return NextResponse.json({ 
      success: true, 
      message: "Data restoration completed successfully",
      questionsCreated: createdQuestions.length
    });
  } catch (error) {
    console.error("Error restoring data:", error);
    return NextResponse.json(
      { error: `Failed to restore data: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
