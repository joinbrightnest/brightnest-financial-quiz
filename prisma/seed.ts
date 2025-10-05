import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const questions = [
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
    ]
  },
  {
    order: 2,
    prompt: "How do you typically handle unexpected expenses?",
    type: "single",
    options: [
      {
        label: "Use credit cards and worry about it later",
        value: "credit_cards",
        weightCategory: "debt",
        weightValue: 2
      },
      {
        label: "Dip into my emergency fund",
        value: "emergency_fund",
        weightCategory: "savings",
        weightValue: 2
      },
      {
        label: "Cut back on other expenses to cover it",
        value: "cut_expenses",
        weightCategory: "spending",
        weightValue: 2
      },
      {
        label: "Sell some investments if needed",
        value: "sell_investments",
        weightCategory: "investing",
        weightValue: 2
      }
    ]
  },
  {
    order: 3,
    prompt: "What's your approach to budgeting?",
    type: "single",
    options: [
      {
        label: "I don't really budget - I just try to spend less",
        value: "no_budget",
        weightCategory: "debt",
        weightValue: 1
      },
      {
        label: "I save first, then spend what's left",
        value: "save_first",
        weightCategory: "savings",
        weightValue: 2
      },
      {
        label: "I track every expense carefully",
        value: "track_expenses",
        weightCategory: "spending",
        weightValue: 2
      },
      {
        label: "I focus on maximizing my investment returns",
        value: "maximize_returns",
        weightCategory: "investing",
        weightValue: 2
      }
    ]
  },
  {
    order: 4,
    prompt: "How do you feel about taking financial risks?",
    type: "single",
    options: [
      {
        label: "I avoid risks - I prefer guaranteed outcomes",
        value: "avoid_risks",
        weightCategory: "spending",
        weightValue: 2
      },
      {
        label: "I'm comfortable with moderate risks for better returns",
        value: "moderate_risks",
        weightCategory: "investing",
        weightValue: 2
      },
      {
        label: "I take calculated risks to accelerate my goals",
        value: "calculated_risks",
        weightCategory: "investing",
        weightValue: 3
      },
      {
        label: "I prefer to eliminate debt before taking any risks",
        value: "eliminate_debt_first",
        weightCategory: "debt",
        weightValue: 2
      }
    ]
  },
  {
    order: 5,
    prompt: "What motivates you most about money?",
    type: "single",
    options: [
      {
        label: "Being debt-free and financially independent",
        value: "debt_free",
        weightCategory: "debt",
        weightValue: 3
      },
      {
        label: "Having a secure financial cushion",
        value: "secure_cushion",
        weightCategory: "savings",
        weightValue: 3
      },
      {
        label: "Living within my means and being responsible",
        value: "live_within_means",
        weightCategory: "spending",
        weightValue: 3
      },
      {
        label: "Building wealth and maximizing opportunities",
        value: "build_wealth",
        weightCategory: "investing",
        weightValue: 3
      }
    ]
  }
];

async function main() {
  console.log('Starting seed...');

  // Clear existing questions
  await prisma.quizAnswer.deleteMany();
  await prisma.result.deleteMany();
  await prisma.quizSession.deleteMany();
  await prisma.quizQuestion.deleteMany();

  // Create questions
  for (const question of questions) {
    await prisma.quizQuestion.create({
      data: {
        order: question.order,
        prompt: question.prompt,
        type: question.type,
        options: question.options,
        active: true,
      },
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
