import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  },
  {
    order: 6,
    prompt: "How often do you check your bank account?",
    type: "single",
    options: [
      {
        label: "Daily - I'm very hands-on",
        value: "daily_check",
        weightCategory: "spending",
        weightValue: 2
      },
      {
        label: "Weekly - I like to stay informed",
        value: "weekly_check",
        weightCategory: "savings",
        weightValue: 2
      },
      {
        label: "Monthly - I review my statements",
        value: "monthly_check",
        weightCategory: "investing",
        weightValue: 2
      },
      {
        label: "Rarely - I trust my automatic systems",
        value: "rarely_check",
        weightCategory: "debt",
        weightValue: 1
      }
    ]
  },
  {
    order: 7,
    prompt: "What's your biggest financial worry?",
    type: "single",
    options: [
      {
        label: "Not having enough for retirement",
        value: "retirement_worry",
        weightCategory: "investing",
        weightValue: 3
      },
      {
        label: "Unexpected medical expenses",
        value: "medical_worry",
        weightCategory: "savings",
        weightValue: 3
      },
      {
        label: "Losing my job or income",
        value: "job_worry",
        weightCategory: "spending",
        weightValue: 2
      },
      {
        label: "Never paying off my debt",
        value: "debt_worry",
        weightCategory: "debt",
        weightValue: 3
      }
    ]
  },
  {
    order: 8,
    prompt: "How do you prefer to learn about finances?",
    type: "single",
    options: [
      {
        label: "Reading books and articles",
        value: "reading",
        weightCategory: "investing",
        weightValue: 2
      },
      {
        label: "Watching videos and courses",
        value: "videos",
        weightCategory: "savings",
        weightValue: 2
      },
      {
        label: "Working with a financial advisor",
        value: "advisor",
        weightCategory: "spending",
        weightValue: 2
      },
      {
        label: "Learning through trial and error",
        value: "trial_error",
        weightCategory: "debt",
        weightValue: 1
      }
    ]
  },
  {
    order: 9,
    prompt: "What's your ideal financial future?",
    type: "single",
    options: [
      {
        label: "Complete financial freedom and early retirement",
        value: "early_retirement",
        weightCategory: "investing",
        weightValue: 3
      },
      {
        label: "A comfortable, secure lifestyle",
        value: "comfortable_lifestyle",
        weightCategory: "savings",
        weightValue: 3
      },
      {
        label: "Being able to help family and friends",
        value: "help_others",
        weightCategory: "spending",
        weightValue: 2
      },
      {
        label: "Just getting out of debt and staying there",
        value: "debt_free_life",
        weightCategory: "debt",
        weightValue: 3
      }
    ]
  },
  {
    order: 10,
    prompt: "How do you handle financial stress?",
    type: "single",
    options: [
      {
        label: "I create a detailed plan and stick to it",
        value: "detailed_plan",
        weightCategory: "spending",
        weightValue: 2
      },
      {
        label: "I focus on increasing my income",
        value: "increase_income",
        weightCategory: "investing",
        weightValue: 2
      },
      {
        label: "I cut expenses and save more",
        value: "cut_expenses_save",
        weightCategory: "savings",
        weightValue: 3
      },
      {
        label: "I try to ignore it and hope it gets better",
        value: "ignore_stress",
        weightCategory: "debt",
        weightValue: 1
      }
    ]
  }
];

// Health Finance Quiz Questions
const healthFinanceQuestions = [
  {
    order: 1,
    prompt: "How do you currently manage healthcare costs?",
    type: "single",
    options: [
      {
        label: "I have comprehensive health insurance",
        value: "comprehensive_insurance",
        weightCategory: "savings",
        weightValue: 3
      },
      {
        label: "I use a high-deductible plan with HSA",
        value: "high_deductible_hsa",
        weightCategory: "investing",
        weightValue: 3
      },
      {
        label: "I pay out-of-pocket and hope for the best",
        value: "out_of_pocket",
        weightCategory: "debt",
        weightValue: 2
      },
      {
        label: "I avoid medical care due to cost concerns",
        value: "avoid_care",
        weightCategory: "spending",
        weightValue: 1
      }
    ]
  },
  {
    order: 2,
    prompt: "What's your biggest health-related financial worry?",
    type: "single",
    options: [
      {
        label: "Unexpected medical emergencies",
        value: "medical_emergencies",
        weightCategory: "savings",
        weightValue: 3
      },
      {
        label: "Rising insurance premiums",
        value: "rising_premiums",
        weightCategory: "spending",
        weightValue: 2
      },
      {
        label: "Long-term care costs",
        value: "long_term_care",
        weightCategory: "investing",
        weightValue: 3
      },
      {
        label: "Prescription medication costs",
        value: "prescription_costs",
        weightCategory: "debt",
        weightValue: 2
      }
    ]
  },
  {
    order: 3,
    prompt: "How do you prioritize health spending?",
    type: "single",
    options: [
      {
        label: "Prevention and wellness first",
        value: "prevention_first",
        weightCategory: "savings",
        weightValue: 3
      },
      {
        label: "Only when absolutely necessary",
        value: "only_necessary",
        weightCategory: "spending",
        weightValue: 2
      },
      {
        label: "I invest in health for long-term benefits",
        value: "invest_health",
        weightCategory: "investing",
        weightValue: 3
      },
      {
        label: "I put it on credit cards when needed",
        value: "credit_cards",
        weightCategory: "debt",
        weightValue: 2
      }
    ]
  },
  {
    order: 4,
    prompt: "What's your approach to health savings?",
    type: "single",
    options: [
      {
        label: "I have a dedicated health emergency fund",
        value: "health_emergency_fund",
        weightCategory: "savings",
        weightValue: 3
      },
      {
        label: "I contribute to an HSA regularly",
        value: "hsa_contributions",
        weightCategory: "investing",
        weightValue: 3
      },
      {
        label: "I save what I can when I can",
        value: "irregular_saving",
        weightCategory: "spending",
        weightValue: 2
      },
      {
        label: "I don't save specifically for health costs",
        value: "no_health_saving",
        weightCategory: "debt",
        weightValue: 1
      }
    ]
  },
  {
    order: 5,
    prompt: "How do you handle health insurance decisions?",
    type: "single",
    options: [
      {
        label: "I carefully compare plans and costs",
        value: "compare_plans",
        weightCategory: "savings",
        weightValue: 3
      },
      {
        label: "I choose the cheapest option available",
        value: "cheapest_option",
        weightCategory: "spending",
        weightValue: 2
      },
      {
        label: "I prioritize coverage over cost",
        value: "coverage_over_cost",
        weightCategory: "investing",
        weightValue: 2
      },
      {
        label: "I avoid thinking about it until open enrollment",
        value: "avoid_decision",
        weightCategory: "debt",
        weightValue: 1
      }
    ]
  },
  {
    order: 6,
    prompt: "What's your first name?",
    type: "text",
    options: [
      {
        label: "Enter your name",
        value: "name_input",
        weightCategory: "contact",
        weightValue: 0
      }
    ]
  },
  {
    order: 7,
    prompt: "What's your email address?",
    type: "email",
    options: [
      {
        label: "Enter your email",
        value: "email_input",
        weightCategory: "contact",
        weightValue: 0
      }
    ]
  }
];

// Marriage Finance Quiz Questions
const marriageFinanceQuestions = [
  {
    order: 1,
    prompt: "How do you and your partner handle money decisions?",
    type: "single",
    options: [
      {
        label: "We make all decisions together",
        value: "decisions_together",
        weightCategory: "savings",
        weightValue: 3
      },
      {
        label: "One person handles most financial decisions",
        value: "one_person_handles",
        weightCategory: "spending",
        weightValue: 2
      },
      {
        label: "We have separate accounts and split costs",
        value: "separate_accounts",
        weightCategory: "investing",
        weightValue: 2
      },
      {
        label: "We avoid talking about money",
        value: "avoid_money_talks",
        weightCategory: "debt",
        weightValue: 1
      }
    ]
  },
  {
    order: 2,
    prompt: "What's your biggest financial challenge as a couple?",
    type: "single",
    options: [
      {
        label: "Different spending habits",
        value: "different_spending",
        weightCategory: "spending",
        weightValue: 3
      },
      {
        label: "Saving for shared goals",
        value: "saving_goals",
        weightCategory: "savings",
        weightValue: 3
      },
      {
        label: "Planning for retirement together",
        value: "retirement_planning",
        weightCategory: "investing",
        weightValue: 3
      },
      {
        label: "Managing existing debt",
        value: "managing_debt",
        weightCategory: "debt",
        weightValue: 3
      }
    ]
  },
  {
    order: 3,
    prompt: "How do you handle financial disagreements?",
    type: "single",
    options: [
      {
        label: "We discuss and compromise",
        value: "discuss_compromise",
        weightCategory: "savings",
        weightValue: 3
      },
      {
        label: "We avoid the topic to keep peace",
        value: "avoid_topic",
        weightCategory: "debt",
        weightValue: 1
      },
      {
        label: "We set budgets and stick to them",
        value: "set_budgets",
        weightCategory: "spending",
        weightValue: 2
      },
      {
        label: "We seek professional financial advice",
        value: "professional_advice",
        weightCategory: "investing",
        weightValue: 3
      }
    ]
  },
  {
    order: 4,
    prompt: "What's your approach to joint financial goals?",
    type: "single",
    options: [
      {
        label: "We have a detailed financial plan",
        value: "detailed_plan",
        weightCategory: "savings",
        weightValue: 3
      },
      {
        label: "We save what we can when we can",
        value: "irregular_saving",
        weightCategory: "spending",
        weightValue: 2
      },
      {
        label: "We invest for long-term growth",
        value: "invest_growth",
        weightCategory: "investing",
        weightValue: 3
      },
      {
        label: "We focus on paying off debt first",
        value: "payoff_debt_first",
        weightCategory: "debt",
        weightValue: 3
      }
    ]
  },
  {
    order: 5,
    prompt: "How do you handle financial transparency?",
    type: "single",
    options: [
      {
        label: "We share all financial information openly",
        value: "full_transparency",
        weightCategory: "savings",
        weightValue: 3
      },
      {
        label: "We keep some financial privacy",
        value: "some_privacy",
        weightCategory: "spending",
        weightValue: 2
      },
      {
        label: "We have separate financial lives",
        value: "separate_finances",
        weightCategory: "investing",
        weightValue: 2
      },
      {
        label: "We don't discuss finances much",
        value: "avoid_finances",
        weightCategory: "debt",
        weightValue: 1
      }
    ]
  },
  {
    order: 6,
    prompt: "What's your first name?",
    type: "text",
    options: [
      {
        label: "Enter your name",
        value: "name_input",
        weightCategory: "contact",
        weightValue: 0
      }
    ]
  },
  {
    order: 7,
    prompt: "What's your email address?",
    type: "email",
    options: [
      {
        label: "Enter your email",
        value: "email_input",
        weightCategory: "contact",
        weightValue: 0
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

  // Create Financial Profile questions
  for (const question of financialProfileQuestions) {
    await prisma.quizQuestion.create({
      data: {
        quizType: "financial-profile",
        order: question.order,
        prompt: question.prompt,
        type: question.type,
        options: question.options,
        active: true,
      },
    });
  }

  // Create Health Finance questions
  for (const question of healthFinanceQuestions) {
    await prisma.quizQuestion.create({
      data: {
        quizType: "health-finance",
        order: question.order,
        prompt: question.prompt,
        type: question.type,
        options: question.options,
        active: true,
      },
    });
  }

  // Create Marriage Finance questions
  for (const question of marriageFinanceQuestions) {
    await prisma.quizQuestion.create({
      data: {
        quizType: "marriage-finance",
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
