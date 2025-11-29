import Link from "next/link";
import PostContents from "@/components/PostContents";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ChecklistItem from "./ChecklistItem";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Article content mapped by slug
const articlesMap: Record<string, {
    category: string;
    title: string;
    heroImages: Array<{ color: string }>;
    sections: Array<{ title: string; body: string }>;
    heroText?: string;
  }> = {
    "why-your-budget-keeps-failing": {
      category: "Habits",
      title: "Why Your Budget Keeps Failing (And How to Fix It)",
      heroImages: [
        { color: "from-teal-500 to-teal-600" },
        { color: "from-teal-600 to-teal-700" },
        { color: "from-teal-400 to-teal-500" }
      ],
      heroText: "A BEHAVIOUR-CHANGE APPROACH TO PERSONAL FINANCES",
      sections: [
        {
          title: "Introduction",
          body: "You set your budget at the start of the month. You felt good. You determined your income, laid out your expenses, promised yourself: This time is different. And yet… by week three you're overspending on dining out. By week four you're scrambling to cover bills. Sound familiar? You're definitely not alone. According to a 2023 survey by NerdWallet, 84% of Americans who say they have a monthly budget admit they've gone over it at least once.\n\nSo the issue isn't simply making a budget. The real issue is why the budget keeps failing. This post explores the underlying behavioural causes, backs them with recent statistics, and gives you a roadmap to build a budgeting system that actually lasts."
        },
        {
          title: "Why budgets fail",
          body: "The numbers tell the story: About 83% of U.S. adults say they overspend at least sometimes. Among those who have a monthly budget, 84% admit to exceeding it at some point. 57% of Americans report they don't have enough savings to cover a $1,000 emergency. 17% of U.S. adults said they did not pay all their bills in full in the previous month — and among those earning under $25k, the number jumps to 36%.\n\nThese numbers show: it's not just you. Budgeting failure is widespread. But more importantly: it's largely preventable if we understand the real reasons behind the breakdown.\n\nBelow are the most common behavioural traps that sabotage a budget:\n\n**1. Unrealistic goals or too-strict limits**\nMany budgets are built on ideal months — \"I'll spend only $50 on eating out\" when in reality you go out 3 nights a week. The mismatch between real life behaviour and budget assumptions causes immediate failure.\n\n*Sign: You blow one category and then everything else collapses.*\n\n**2. Failure to plan for irregular expenses & emergencies**\nIf your budget doesn't include \"fun money\", surprise bills, seasonal gifts, car repairs — you'll either bust your budget or ignore the unexpected.\n\n*Sign: You hit mid-month and suddenly feel like \"nothing left\" or you dip into debt.*\n\n**3. Lack of monitoring / feedback**\nA budget isn't \"set and forget\". If you don't review your spending and adjust, you'll drift off track.\n\n*Sign: You forget to check in on your budget until the month is over — then you're in the red.*\n\n**4. Misalignment with your values & behaviours**\nIf your budget restricts what truly matters to you, you'll rebel. For instance: you hate cooking at home but budget forces 90% at-home meals. That causes resentment and abandonment.\n\n*Sign: You feel deprived, resentful, or you repeatedly rationalise \"just this once\".*\n\n**5. Behavioural triggers: emotional spending, habit overspending**\nBudgeting often fails when it assumes rational behaviour — yet humans are emotional, impulsive. If you don't identify your spending triggers (stress, reward, convenience) the budget will lose.\n\n*Sign: You know you overspend when triggered (bad day, social outing, boredom) and budget didn't guard against that.*"
        },
        {
          title: "How to fix it — a behaviour-based roadmap",
          body: "Here's how to build a budgeting system that works with your behaviour, not against it:\n\n**Track real behaviour for 30–90 days**\nStart by simply tracking — no changes yet. What do you really spend on groceries, eating out, entertainment, subscriptions? Use bank statements, receipt photos, spending apps.\n\nWhy? Because your budget must reflect reality, not idealism.\n\n\"Start with 3 months of real expenses (yes, the coffee counts) … Treat your budget as a living tool — not a prison.\"\n\n**Build in flexibility and \"fun money\"**\nRather than zero-fun, carve out a category for flexible spending (\"treats\", \"going out\") that fits your values. When people feel deprived, they rebel. Allow latitude.\n\nAlso build in \"emergency/irregular\" funds (seasonal gifts, car repairs) by dividing annual costs into monthly budgeting.\n\n**Set realistic targets and adjust frequently**\nAfter you track actual behaviour, set targets that challenge yet are achievable. If you regularly spend $400 on groceries, don't budget $250 immediately — maybe $350 then reduce gradually.\n\nReview monthly and adjust. Sense of progress builds motivation.\n\n**Align budget with your values and goals**\nAsk yourself: What matters? The gym, travel, home-cooking, books? Your budget should reflect those priorities. If the budget starves what you value, it won't last.\n\nAlso link each spending category to a bigger goal — savings, debt reduction, experience — so that the budget feels purposeful.\n\n**Use behavioural \"guardrails\"**\nAutomate savings and emergency-fund deposits so you pay yourself first. Use separate accounts or \"pots\" for specific goals (vacation, repairs). Monitor weekly, not just monthly — small check-ins catch drift early.\n\nRecognise and plan for your personal triggers: if you overspend when stressed, plan \"stress buffer\" money or alternative activity.\n\n**Make the budget a living tool, not a fixed prison**\nThe best budgets evolve. Life changes: income shifts, cost of living rises, priorities change. Review and reshape.\n\n\"Budgets don't inherently get you to stop spending money… The problem is that restrictions are the ultimate fun-killer.\"\n\nSo aim for consistency over perfection. Adjust rather than abandon."
        },
        {
          title: "Behaviour change mindset – the key to lasting success",
          body: "Building the right budget structure is only part of the solution. The other part: adopting a mindset of behaviour change. Here are some mindset switches that matter:\n\n**From \"must cut\" to \"choose better\"**\nRather than seeing budget as deprivation, view it as empowerment: choosing where you want your money to go.\n\n**From \"one perfect month\" to \"progress over time\"**\nRarely does one month change everything; incremental adjustments lead to lasting change.\n\n**From \"I blew it – I quit\" to \"I drifted – I adjust\"**\nIf you overspend, don't abandon the budget; recognise and correct.\n\n**From \"spending equals fun\" to \"spending aligned with mission\"**\nWhen you link spending to your values (what you truly care about), you make decisions more consciously."
        },
        {
          title: "Quick checklist for your next budget",
          body: "Use this as your pre-launch checklist:\n\n• Did I track actual spending for 1–3 months before budgeting?\n• Did I build in a \"fun\" spending category that suits my lifestyle?\n• Did I include irregular/seasonal expenses (gifts, repairs)?\n• Are my targets realistic (based on past behaviour) rather than idealistic?\n• Have I aligned major categories with what I value most?\n• Is there an \"escape valve\" for when life happens (buffer fund)?\n• Will I review weekly? monthly? adjust as needed?\n• Do I automate savings and treat budget as a tool, not a punishment?"
        },
        {
          title: "Conclusion",
          body: "Budgeting isn't about strict rules or eliminating every treat. It's about designing a system that fits you — your lifestyle, your goals, your impulses — and then using that system to gradually shift your behaviour.\n\nThe statistics show that most people who budget still fail — not because budgets are broken, but because the budgets don't match reality or adapt as life happens. By tracking real spending, building flexibility, aligning with values, and treating your budget as a living tool, you'll move from budgeting frustration to budgeting that works.\n\nYour next budget can be the one you stick with. Let it reflect who you are and where you're going — not just what you think you should do."
        }
      ]
    },
    "hidden-cost-of-bnpl": {
      category: "Mindset",
      title: "The Hidden Cost of 'Buy Now, Pay Later'",
      heroImages: [
        { color: "from-teal-400 to-teal-500" },
        { color: "from-teal-600 to-teal-700" },
        { color: "from-teal-500 to-teal-600" }
      ],
      heroText: "HOW \"EASY-PAYMENTS\" CAN QUIETLY WRECK YOUR FINANCES — AND WHAT YOU CAN DO ABOUT IT",
      sections: [
        {
          title: "Introduction",
          body: "You see the button: \"Buy now, pay later — 4 easy payments, no interest.\" It's tempting. It promises instant gratification, no lump-sum impact today—and it feels smart. After all, it's marketed as the modern alternative to high-interest credit cards.\n\nBut beneath the slick ad copy lies a set of risks many people don't see until it's too late. The \"splurge now, worry later\" appeal of Buy Now, Pay Later (BNPL) isn't always what it seems—especially if you're trying to build a sustainable budgeting habit and real financial control.\n\nIn this post we'll dig into why BNPL can derail your budget, what the statistics really show, and how you can protect yourself (and your behavioural-finance muscles) from the hidden trap."
        },
        {
          title: "How big is the issue?",
          body: "A survey from Bankrate found that about half of BNPL users (49 %) experienced at least one financial problem after using these services: overspending, missed payments, or regret.\n\nResearch from FINRA revealed that nearly one-in-four Americans used a BNPL service in the past year. Among them, about 40 % missed payments.\n\nA study of over 570,000 pairs of BNPL users and non-users found BNPL users had 4 % more overdraft charges, 1.1 % higher credit-card interest, and 2.3 % more credit-card late fees than non-users. The annual cost impact? On average up to $176 extra per year for typical users and up to $252 for more vulnerable consumers.\n\nAccording to Consumer Financial Protection Bureau data, 10.5 % of BNPL borrowers in 2021 were charged at least one late fee, up from 7.8 % in 2020.\n\nSo yes—BNPL is popular. But popular isn't the same as safe. Especially if you're trying to build financial habits, not just handle transactions."
        },
        {
          title: "Why your budget can get sabotaged by BNPL",
          body: "Below are the main behavioural and structural traps that make BNPL risky for folks trying to change how they spend and manage money.\n\n**1. The illusion of \"interest-free\" convenience**\nBNPL is sold as \"free\" or \"no interest.\" But when payments are delayed or missed, fees and penalties can apply—and the overall cost is rarely transparent.\n\n*Sign: Because the payment is spread out, you feel less pain today and may buy more than you otherwise would. That undermines budgets built on consciously limiting spending.*\n\n**2. Multiple plans = debt-stacking**\nWhen you have several BNPL arrangements at once, the small installments add up. According to Investopedia, 60 % of BNPL users say they've had multiple BNPL loans at a time, including 23 % with three or more.\n\n*Sign: Your budget may account for one BNPL plan, but not three or four. Unexpected cash-flow burdens emerge.*\n\n**3. Late payments & fees bite**\nMissing a BNPL payment often triggers late fees—and sometimes other financial consequences, including negative credit impact.\n\n*Sign: The budget was likely built on \"on time\" payments. Late-fees disrupt the plan, force re-allocation of funds, and increase stress.*\n\n**4. Credit score confusion**\nMany consumers believe using BNPL will boost their credit score. Wrong. Most don't report to credit bureaus unless you miss payments and it goes to collections.\n\n*Sign: You may assume you're building credit while actually taking on unsecured short-term commitments—with no long-term benefit.*\n\n**5. Values-misalignment: spending vs saving**\nIf your overall goal is changing behaviour (saving more, reducing impulse buys, building resilience), BNPL often works against that. The ease of purchase can override the deliberation you'd usually apply.\n\n*Sign: Budgeting isn't just about numbers. It's about aligning spending with values. BNPL shortcuts that process.*"
        },
        {
          title: "How to fix it—or better: how to use BNPL safely (if you must)",
          body: "Here's a behaviour-based roadmap to either avoid BNPL traps altogether—or use them in a controlled, aligned way.\n\n**Treat BNPL as a purchase, not a payment-plan freebie**\nWhen you consider \"Buy now, pay later,\" ask: If I treated this as outright cash payment today, would I still buy it?\n\nIf your answer is \"no\", the risk is your budget will object for a reason. Let that objection guide your decision.\n\n**Limit the number of active BNPL plans**\nYou might budget for one BNPL payment monthly—but what if you have several? Create a rule: no more than one BNPL plan at a time (or better: none) unless it's essential.\n\nMonitor total monthly BNPL payments and treat them like any other fixed obligation.\n\n**Build in the cushion & align with your values**\nInclude \"BNPL cushion\" category in your budget: anticipate worst-case scenario (missed payment, fee).\n\nAsk: Does this purchase align with what I deeply value—rather than what's \"on sale because I can pay later\"?\n\nIf no, skip it.\n\n**Automate, monitor, adapt**\nSet up auto-payments so you never miss a BNPL payment.\n\nReview your budget weekly: track how many BNPL instalments are active.\n\nAdjust your budget when you add a BNPL plan—and make sure something else gives (spending cut, extra savings).\n\nThe key: the budget stays alive, it doesn't sleep while you click \"confirm\".\n\n**If you can, opt for paying upfront**\nSave for the purchase instead of defaulting to BNPL. If the product/service is important and aligns with your values, you'll feel better paying with money you already have. That builds both financial and behavioural strength."
        },
        {
          title: "Behaviour-change mindset: shifting the frame",
          body: "Your goal is not just to avoid debt—it's to build long-term habits that support your values and financial resilience. Here are mindset shifts to accompany the tactics:\n\n**From \"I can afford these small payments\" to \"I will choose this because I can afford it today, in full.\"**\n\n**From \"BNPL is the smart tech way to buy\" to \"I know my behaviour and pick payment methods that support it.\"**\n\n**From \"No interest = free money\" to \"Spreading payments doesn't reduce the cost tomorrow.\"**\n\n**From \"Budgeting is restricting\" to \"Budgeting is aligning spending to my mission.\"**\n\nWhen you change how you think, you change how you act—and that's what creates sustainable financial behaviour change, not just one good month of budgeting."
        },
        {
          title: "Quick checklist for your next BNPL decision",
          body: "Use this before you tap \"Buy now, pay later\":\n\n• Could I pay for this today in full without stretching other budget categories?\n• Will this one BNPL plan push me into having two or more active plans?\n• Have I built the margin in my budget for missed payment or fees?\n• Does this purchase align with my values and long-term goals?\n• Have I treated this as a purchase rather than a \"nice-to-have hidden loan\"?\n• Will I monitor instalments weekly and adjust if needed?"
        },
        {
          title: "Conclusion",
          body: "\"Buy now, pay later\" has become a seductive norm in the age of instant-everything. It promises flexibility—but for many, the hidden cost is stress, missed payments, mis-aligned spending and slower progress toward real financial goals.\n\nIf you're serious about behaviour change in personal finances, treat BNPL not as a clever bypass but as a decision with consequences. Use it only when it aligns fully with your budget, your values, and your goals—and always keep your spending behaviour intentional.\n\nYour financial life isn't built on \"how many payments can I spread this out over\". It's built on \"how deliberately do I choose what to buy, how I pay for it, and what that means for where I'm going.\" Take control now—and read the fine print before that \"4 easy payments\" ever become 4 easy regrets."
        }
      ]
    },
    "talk-about-money-with-your-partner": {
      category: "Relationships",
      title: "How to Talk About Money With Your Partner",
      heroImages: [
        { color: "from-teal-600 to-teal-700" },
        { color: "from-teal-500 to-teal-600" },
        { color: "from-teal-400 to-teal-500" }
      ],
      heroText: "BUILDING TRUST, ALIGNING GOALS & CHANGING MONEY HABITS TOGETHER",
      sections: [
        {
          title: "Introduction",
          body: "Money might not be the most romantic topic—but it is one of the most important conversations couples avoid. And when it's ignored, budget stress, hidden debt and frustration often creep in. According to recent research, over 60 % of people say that talking about money with their partner is challenging.\n\nIf you're serious about changing how you manage money—and doing it together—then this post is for you. We'll dig into why these conversations matter, back it up with solid data, and provide a step-by-step, behaviour-based roadmap to talk money without the drama."
        },
        {
          title: "Section 1: Why these conversations matter",
          body: "Financial communication is frequent in relationships: one study found couples have on average about 12 money-talks per month.\n\nYet it's also one of the least comfortable topics for partners: 60.1% of people say discussing money in a romantic relationship is difficult.\n\nIn a survey of U.S. adults, 32% felt uncomfortable talking finances with their partner, and 44% feared it would lead to disagreements. On average the couples reported 58 money-related arguments per year.\n\nAccording to UK guidance from MoneyHelper, talking about money with your partner helps create security, align spending, save jointly and avoid surprises.\n\nThe upshot: If you skip the conversation, you may be leaving your budget, your shared goals and even your relationship exposed. If you lean in instead, you build trust, reduce stress and create financial momentum as a team."
        },
        {
          title: "Section 2: The common stumbling blocks",
          body: "Here are the behavioural patterns and hidden traps that often derail couples when money talk avoids or goes wrong.\n\n**2.1 Different money-styles**\nOne partner may be a saver and planner, the other a spontaneous spender. MoneyHelper outlines that differing styles are normal—but must be understood.\n\n*Sign: Without awareness, frustration builds and judgement creeps in.*\n\n**2.2 Poor timing & avoidance**\nBecause money feels weighty or emotional, couples postpone the talk until something goes wrong. Research shows many recognise the benefits of financial communication, yet still find it difficult.\n\n*Sign: Problems accumulate, trust erodes, and the conversation finally comes in crisis mode.*\n\n**2.3 Lack of clarity on shared goals & roles**\nWithout clear shared goals or defined roles for expenses/budgeting, you end up with mis-aligned expectations.\n\n*Sign: Resentment builds when one partner feels they carry more, or the other feels ignored.*\n\n**2.4 Hidden debt or secrets**\nFinancial \"infidelity\" (hiding spending/debt) is surprisingly common. One overview found about 27% admitted hiding a financial secret.\n\n*Sign: When the truth comes out it hits trust, and creates extra financial burdens and emotional consequences.*"
        },
        {
          title: "Section 3: How to talk about money the right way",
          body: "Here's your step-by-step guide to create productive, respectful, value-aligned money conversations with your partner. Follow the roadmap like you're building a new habit together.\n\n**Set the stage**\nChoose when and where: pick a calm moment, without distractions—coffee table rather than dinner table for example.\n\nApproach it with curiosity, not accusation: \"I'd like to understand how you feel about money\" rather than \"We need to fix your spending\".\n\nAgree both will listen and share openly.\n\n**Explore your money stories**\nAsk: \"How did your family treat money when you were young?\"\n\nExplore your attitudes: saver vs spender, risk-taker vs planner.\n\nThese root stories shape how you behave today.\n\n**Share the data**\nUse your real numbers: income, expenses, debt, savings.\n\nIdentify what you jointly spend and what is individual.\n\nUse simple visuals or tracking to make this concrete.\n\nTransparency builds trust.\n\n**Define your shared goals and budget structure**\nAsk: What are we working toward together? (e.g., home, travel, security)\n\nSet SMART goals: Specific, Measurable, Achievable, Relevant, Time-bound. (E.g., Save €10,000 in 18 months).\n\nDecide how expenses will be handled: equal split, proportional to income, hybrids.\n\nCreate a budget together that reflects joint priorities and allows personal spending freedom.\n\n**Establish regular check-ins & adjust**\nChoose a monthly \"money date\": review how things went, what needs adjusting.\n\nAsk questions like: \"What surprised us? What felt good? What could we change?\"\n\nTreat the budget as flexible—not fixed in stone.\n\nBehaviour-change means iteration.\n\n**Build behavioural guards and autonomy**\nAllow each partner a \"fun-money\" allowance—so personal spending doesn't feel punished.\n\nAutomate savings and joint goals so money moves before temptation hits.\n\nIf one partner has debt or a risk behaviour (e.g., gambling), consider external coaching or counselling. MoneyHelper outlines how hidden behaviours erode joint finances."
        },
        {
          title: "Section 4: Mindset shifts that support lasting change",
          body: "This goes beyond the mechanics. For real change you'll need new ways of thinking—and together.\n\n**From \"my money vs your money\" to \"our money, our future.\"**\n\n**From \"I'm ashamed of my spending\" to \"I'm learning how I spend and choosing differently.\"**\n\n**From \"We must stop spending\" to \"We want to choose what we spend on together.\"**\n\n**From \"money causes fights\" to \"money conversations build trust.\"**\n\nResearch supports this: couples who talk about money more openly report less stress and better financial well-being."
        },
        {
          title: "Section 5: Quick checklist for your next money-conversation",
          body: "Use this as a tool before your next partner-money talk:\n\n• We scheduled a time and place for our money talk (not just \"whenever\").\n• We both shared our money histories and styles.\n• We reviewed our real numbers together (income/debt/expenses).\n• We set at least one shared financial goal with a deadline.\n• We agreed how we'll share expenses fairly and sustainably.\n• We created a fun-money allowance for each partner.\n• We set our next money-date and agreed how we'll review our progress.\n• We agreed to revisit & adjust the plan if life changes (job, children, move)."
        },
        {
          title: "Conclusion",
          body: "Talking about money with your partner isn't optional—it's foundational. Done well, it can deepen your connection, free you from hidden stress and build a stronger financial future together.\n\nWhen you lean in—exploring not just what you spend but why, aligning your values, creating shared goals and behaviours—you move from managing money in parallel to managing it as a team.\n\nYour next money conversation might feel awkward—but that's the point. Because it means growth. Set the date. Speak openly. Align together. Your financial behaviours, and your relationship, will thank you."
        }
      ]
    },
    "three-account-system": {
      category: "Planning",
      title: "The 3-Account System That Changed Everything",
      heroImages: [
        { color: "from-teal-500 to-teal-600" },
        { color: "from-teal-400 to-teal-500" },
        { color: "from-teal-600 to-teal-700" }
      ],
      heroText: "A SIMPLE BANKING STRUCTURE TO TRANSFORM YOUR CASH FLOW, SPENDING AND SAVINGS HABITS",
      sections: [
        {
          title: "Introduction",
          body: "What if you could look at three bank accounts and immediately know your bills are covered, your savings are growing — and that your discretionary spending is safe and intentional? You don't need dozens of spreadsheets or finance apps. You simply need a structure that aligns with how you behave.\n\nEnter the \"three-account\" system: a banking framework that moves you from \"I hope I've got enough\" to \"I know I'm covered\". It's about real-life accountability, not perfect numbers. In this post we'll explain what the system is, back it up with data and behavioural logic, and show you how to implement it—even if you've struggled with budgeting in the past."
        },
        {
          title: "Section 1: Why the system matters",
          body: "Many of us handle money like a giant pot: everything goes in, everything comes out, and we hope the end works out. But that uncertainty creates stress, overspending and missed savings.\n\nAn alternative: when you see separation and structure, you begin to treat each dollar as having a job. According to behavioural-finance theory, that kind of mental accounting (segregating funds into \"accounts\") helps improve self-control and clarity.\n\nMore concretely: banks and advisory blogs highlight that separating accounts can be a powerful budgeting tool. For example: a bank's resource page on multi-account budgeting states that creating separate accounts for different purposes makes the money you see correspond to what you intend.\n\nSo it's not just about numbers; it's about structure, clarity and subconscious alignment with behaviour. The three-account system works by simplifying the number of decisions you must make each month — and by automating the rest."
        },
        {
          title: "Section 2: What the 3-Account System looks like",
          body: "Here's a breakdown of the three accounts and the purpose each serves.\n\n**Account 1: Bills & Necessary Spending**\nThis account is for your non-negotiables — mortgage or rent, utilities, insurance, minimum debt payments, subscriptions, things you must pay each month.\n\nBy funneling these costs into one account you eliminate \"did I cover that?\" stress and create a base of financial security.\n\n*Sign: When one account contains just your essential obligations, you see when you're spending beyond that base. The rest of the money becomes freer, but with boundaries.*\n\n**Account 2: Savings & Future-You**\nThis account is for your \"when, not if\" expenses and your security net. This includes: emergency fund, annual irregular expenses (car maintenance, gift seasons, vacations), long-term savings.\n\nExample: One advisory piece splits this category into a \"Layaway Account\" for annual/special purchases and an \"Emergency Fund\".\n\n*Sign: When you earmark money for future you, you reduce the chance you'll dip into savings to cover surprise costs. Money becomes less reactive and more strategic.*\n\n**Account 3: Discretionary / Fun / Variable Spending**\nThis is your \"spend what you've allowed\" account. Grocery trips, take-out dinners, hobbies, new clothes, nights out — things that make life enjoyable but don't undermine your base and savings.\n\nBy isolating fun money you avoid the \"everything from one pot\" problem where you overspend and then realize the essentials or savings were underfunded.\n\n*Sign: This account gives you freedom, but with clarity. When you treat this as only the bucket for variable spending you remove guilt and ambiguity.*"
        },
        {
          title: "Section 3: Why this system works — behaviourally & practically",
          body: "Let's dive into how this setup leverages human behaviour and simplifies financial life.\n\n• Reduces choice fatigue: Rather than deciding \"Is this money for bills or savings or fun?\" every time you get paid, you've pre-assigned the job of each dollar.\n\n• Creates visible boundaries: When your \"fun\" account drops low you see it. When the \"bills\" account is full you feel relief. These triggers help your brain \"feel\" safe, which supports behaviour change.\n\n• Aligns with mental accounting: Psychology shows people assign different \"pots\" of money overall; giving this structure in real bank accounts magnifies the effect.\n\n• Supports automation: You can automate transfers so that income flows into these three buckets each pay-cycle. That means less manual tracking and more consistency.\n\n• Reduces risk of \"leakage\": One pot means \"Where did that money go?\" This system means you see when money leaves the wrong bucket (e.g., spending money entering your bills bucket).\n\n• Builds confidence: Once you have your essentials covered and savings growing, you feel safer, you spend less reactively, and the system reinforces the new behaviour."
        },
        {
          title: "Section 4: How to implement it — your step-by-step roadmap",
          body: "Ready to set it up? Here's how:\n\n**Determine your income & monthly obligations**\nStart by calculating your net income (after tax) per pay-cycle. List all monthly fixed obligations and average variable essentials (utilities, grocery minimum, transport, debt minimums).\n\n**Assign target allocations**\nDecide how much to allocate to each account each pay-cycle. Example ratios could be:\n\nBills & Essentials: ~50-60% of net income\n\nSavings & Future: ~20-30%\n\nDiscretionary/Variable Spending: ~10-30%\n\nThis mirrors many \"three bucket\" models. Adjust based on your circumstances.\n\n**Set up the bank accounts**\nOpen three separate accounts (if you don't already). Label them clearly: \"Essentials\", \"Savings\", \"Free Spending\".\n\nAutomate transfers immediately after payday: income → split into three.\n\nEnsure bills are paid via the Essentials account (set up direct debits). Ensure savings deposit goes to the Savings account. The remaining goes to Free Spending.\n\n**Fund and maintain**\nKeep enough in the Essentials account to cover at least one full month of fixed obligations — build buffer.\n\nIn your Savings account, set aside monthly contributions for both emergency fund and annual/irregular costs (car repairs, gifts, etc).\n\nIn your Free Spending account: spend only from here for the variable stuff. When it's gone, it's gone until next pay-cycle. No going back to the essentials or savings.\n\n**Review & adjust**\nAt the end of each month ask:\n\nDid the allocations feel realistic?\n\nWas the savings account underfunded or overfunded?\n\nDid I feel constrained or was the Free Spending account too small?\n\nAdjust the next month's proportions accordingly. The system must evolve with you.\n\n**Behavioural guardrails**\nIf you have debt or variable income: in the Essentials account maintain a bigger buffer (2-3 months of obligations).\n\nIf you anticipate annual bills: split your Savings account into two sub-pots (e.g., \"Emergency\" + \"Irregular Costs\") so you don't dip into emergency funds for normal annual costs.\n\nUse alerts: when your Free Spending account drops below a set threshold, pause new spending until next pay-cycle."
        },
        {
          title: "Section 5: Common pitfalls & how to avoid them",
          body: "Even a good system can be mishandled. Here's what to watch out for:\n\n**1. Too many accounts**\nWhile more buckets might feel cleaner, managing many accounts can become messy and defeats the simplicity. One article warned that multiple accounts \"can lead to fees and lost interest\" and complexity.\n\n*Sign: If managing accounts becomes a chore, you'll abandon the system.*\n\n**2. Neglecting the savings/future account**\nIf it's always underfunded, the system fails. Make it a priority.\n\n*Sign: Savings account stays empty while Free Spending account gets funded every month.*\n\n**3. Treating Free Spending as unlimited**\nJust because it's \"fun money\" doesn't mean no limits. Discipline still applies.\n\n*Sign: You regularly dip into Essentials or Savings accounts to cover Free Spending.*\n\n**4. Static targets in changing life**\nIf your income or obligations change (new job, child, move), adjust the proportions.\n\n*Sign: The allocations no longer match your reality, but you haven't updated them.*\n\n**5. Using accounts but not changing behaviour**\nStructure helps—but only if you use it. Discipline and review are required.\n\n*Sign: You have three accounts but still spend from whichever has money available.*"
        },
        {
          title: "Section 6: Behaviour-change mindset – making it sustainable",
          body: "This system isn't just about banking. It's about shifting how you relate to money.\n\n**From \"I hope we'll cover everything\" to \"I know we've covered the essentials.\"**\n\n**From \"Savings is what's left\" to \"Savings is its own category and I treat it first.\"**\n\n**From \"I'll buy when I feel like it\" to \"I spend when I've assigned that money fun.\"**\n\n**From \"Budgeting is a chore\" to \"My accounts tell the story of my financial values and choices.\"**\n\nWhen you change how you structure money — not just what you budget — you lock in new behaviour. And when your behaviour aligns with your goals (more freedom, less stress, more savings), the financial change sticks."
        },
        {
          title: "Section 7: Quick checklist for your next euro-payday",
          body: "Before you deposit your next paycheck:\n\n• Did I split my income into three accounts immediately?\n• Is my Essentials account funded so bills will be covered?\n• Did I transfer an amount into Savings (both emergency + irregular costs)?\n• Did I leave the rest in Free Spending only for discretionary use?\n• Did I review last month's actual vs planned for each account?\n• Did I adjust allocations for any upcoming changes (like annual expenses, or income change)?"
        },
        {
          title: "Conclusion",
          body: "The \"three-account\" system may look simple—but its power lies in how it reshapes behaviour. It gives your money structure, purpose and clarity. It aligns with how your mind already divides finances (mental accounting), but makes it tangible and automated.\n\nWhen you know your bills are covered, your savings are growing, and your spending is intentional — you move from stress to control. You don't just budget; you manage life on your terms.\n\nSet up the three accounts. Automate the splits. Review regularly. And let your money stop being chaotic and start working with you."
        }
      ]
    },
    "build-wealth-on-variable-income": {
      category: "Planning",
      title: "Building Wealth on a Variable Income",
      heroImages: [
        { color: "from-teal-400 to-teal-500" },
        { color: "from-teal-600 to-teal-700" },
        { color: "from-teal-500 to-teal-600" }
      ],
      heroText: "HOW TO GROW REAL FINANCIAL SECURITY WHEN YOUR PAYCHECKS DON'T ARRIVE LIKE CLOCKWORK",
      sections: [
        {
          title: "Introduction",
          body: "Maybe you're a freelancer, consultant, artist, gig-worker, or entrepreneur. Maybe your \"salary\" varies month to month. One thing's clear: when your income fluctuates, the standard financial advice — \"save 10% every paycheck, invest regularly, budget as usual\" — starts to feel like a square peg in a round hole.\n\nBut here's the truth: mobile income doesn't mean you can't build wealth. It just means you need a smarter strategy—one that honours the irregularity and uses it to your advantage. In this post, we'll explore the data behind variable income, the behavioural traps it creates, and a step-by-step blueprint to actually accumulate wealth, not just survive month to month."
        },
        {
          title: "Section 1: The scope of the challenge – what the numbers say",
          body: "Let's ground this in hard facts so you know you're not alone—and you know why this matters.\n\nIn the U.S., 59% of self-employed adults said their income varied from month to month, compared with only 28% of those working for someone else.\n\nResearch on the gig economy found that among freelance workers the standard deviation of monthly income was USD $850, compared to about $150 for traditional employees in one study.\n\nOne recent experiment found that higher income volatility (a larger coefficient of variation) actually led to higher savings behaviour, once people were aware of the risk.\n\nAccording to research, individuals with irregular incomes often over-predict their future income—this \"income prediction bias\" creates over-confidence and under-preparation.\n\nSo yes: making money that varies is common—and risky if you run your finances as though nothing changes. But the good news: when you know your income varies, you can design your system accordingly."
        },
        {
          title: "Section 2: The behavioural and systemic traps of variable income",
          body: "Why is building wealth harder when income fluctuates? Because human behaviour + typical financial systems aren't designed for the irregular. Let's break down the most common traps.\n\n**2.1 Living from paycheck to paycheck**\nWhen you don't know what you'll earn next month, the natural instinct is: spend what you've got, eat what you're given. You may skip savings because \"I'll save when things are stable.\" But the cycle repeats and savings never start.\n\n*Sign: You spend everything each month because \"next month might be different.\" Savings never accumulate.*\n\n**2.2 Budget built on a \"typical month\" that never happens**\nMaybe you set a budget assuming you'll earn €3,000 each month—but month 1 you get €4,000, month 2 you get €1,800. When you budget as if the \"good month\" is normal, you overspend early and then panic later.\n\n*Sign: Your budget assumes high-income months, so low-income months leave you short.*\n\n**2.3 Saving is deferred or treated as optional**\nBecause your income isn't always high, you may tell yourself: \"I'll save next month when it's easier.\" But that means savings always get pushed back, making compound growth much weaker.\n\n*Sign: Savings are always \"next month\" but that month never comes when income is low.*\n\n**2.4 Over-commitment and shock expense vulnerability**\nWith variable income you're more vulnerable to sudden drops. If you've committed to fixed costs assuming high income, a bad month hurts much more. Without a buffer, wealth-building stalls and debt creeps in.\n\n*Sign: You commit to fixed expenses based on your best month, then struggle when income drops.*\n\n**2.5 Mis-perception of income and planning fallacy**\nStudies show variable-income workers over-predict their next month's income (because they assume high-income months are \"normal\"). This bias causes under-saving and over-spending.\n\n*Sign: You consistently overestimate next month's income and undersave as a result.*"
        },
        {
          title: "Section 3: How to build wealth on a variable income — a behaviour-based roadmap",
          body: "Here's how you convert the irregular into reliability—and wealth accumulation. Follow this structured approach.\n\n**Track your real income and expenses (for 3–6 months)**\nBecause your income varies, you need to understand the range you operate in: your lowest, highest, average months. Also track your spending: what did you actually spend when you earned €X?\n\nThis gives you realistic baselines—not wishful numbers.\n\n**Create a minimum income budget**\nBased on your worst 3-6 month income scenario, design a budget that works even in a low-income month. This becomes your \"safe zone\".\n\nAnything you earn above that becomes upside—giving you freedom, reaction-capacity and peace of mind.\n\n**Automate savings and build two buffers**\nEmergency/Protection Buffer: Target at least 3–6 months of the minimum budget in cash or equivalent. This buffer protects you when income dips.\n\nWealth-building buffer: When income exceeds your minimum budget, automagically move a set percentage (e.g., 20-30%) into investments or savings. That way you treat upside as growth capital, not \"extra-spend\".\n\n**Prioritise variable income as growth income**\nWhen you have variable income, you might mentally think: \"I'll spend my top months, save the rest.\" Instead, flip it: treat your minimum income as baseline living; treat excess as investment income.\n\nThis means when you earn more, you actually build. If you earn less, your living is already covered.\n\n**Use a flexible payment/saving system**\nSet up a separate account: when money comes in, funnel it through a system that allocates: minimum budget → fixed costs → buffer → wealth-building.\n\nUse tiering: e.g., If income < €X, you follow conservative plan; if income > €Y, you apply more aggressive savings.\n\nTrack monthly \"income gap\" and ask: \"Is this month above or below baseline?\" If below, restrict spending; if above, allocate surplus to growth.\n\n**Invest consistently—even when income dips**\nWealth doesn't come just from saving—it comes from investing with time in the market. Use systematic investing: e.g., no matter what, invest X each month when buffer allows. Use \"surplus only\" investing when income is low, \"extra\" when high.\n\nEven irregular contributions beat none over time.\n\n**Review quarterly and adjust**\nYour income variability may evolve. Review every 3 months:\n\nHas your minimum income baseline changed?\n\nIs your buffer size still realistic?\n\nAre you hitting your wealth-building target?\n\nAre you overspending in high months?\n\nAdapt your system as you go."
        },
        {
          title: "Section 4: Mindset shifts that support lasting success",
          body: "Building wealth on variable income isn't just about systems—it's about how you think about your money. Here are key mindset changes:\n\n**From \"I'll save when things are stable\" to \"I build savings because I know things aren't stable.\"**\n\n**From \"Income up = spend more\" to \"Income up = invest more.\"**\n\n**From \"Budget fails when income changes\" to \"My system adjusts when income changes.\"**\n\n**From \"I'll get rich if I earn more\" to \"I'll get rich if I save/invest smarter regardless of income.\"**\n\nWhen you internalise that you don't need perfect income—you need a resilient system—you unlock lasting progress."
        },
        {
          title: "Section 5: Quick checklist for your next \"income-up\" moment",
          body: "Use this when your income spikes next:\n\n• Did I cover my minimum budget with this month's income?\n• Did I put automatic transfer into my buffer or emergency fund?\n• Did I allocate a pre-set percentage of the surplus into investments/savings?\n• Did I avoid increasing fixed spending commitments based on a one-off high month?\n• Did I review whether my minimum budget baseline still reflects my lowest realistic income?\n• Did I schedule a review for 3 months ahead to assess buffer and target progress?"
        },
        {
          title: "Conclusion",
          body: "Variable income can feel chaotic. But chaos isn't opposite of wealth—it simply requires a different strategy. By designing your financial system around your worst months, treating excess as growth, and adapting mindset and behaviour accordingly, you turn unpredictability into opportunity.\n\nWhether you earn €2,000 one month and €6,000 the next—or anything in between—your ability to build wealth will no longer depend solely on high income, but on intelligent structure, disciplined behaviour and consistent investing.\n\nStart today: track your income, build your baseline, automate your surplus—and watch your wealth journey become far more predictable than your paychecks."
        }
      ]
    }
  };

// Get article by slug or use fallback
  const FALLBACK_ARTICLE = {
    category: "Mindset",
    title: "Why The Weight Keeps Coming Back",
    heroImages: [
      { color: "from-teal-500 to-teal-600" },
      { color: "from-teal-600 to-teal-700" },
      { color: "from-teal-400 to-teal-500" }
    ],
    heroText: "3 HABITS THAT BRING THE WEIGHT BACK",
  sections: [
    {
      title: "1. Habits",
        body: "We all carry around the habits we've ingrained over the course of years — and it takes time and concerted effort to entrain new ones. If you slip back into your old habits for a moment, that's normal; if you don't pull yourself back out of them, that's where you'll run into trouble."
    },
    {
        title: "2. The pull of the 'old you'",
        body: "As habits become ingrained, they start to define the way we see ourselves. If you have no proof yet of the person you want to be, it's easy to think this is simply who you are. Intentional choices, consistently, create the new you."
    },
    {
      title: "3. Discipline as freedom vs. punishment",
        body: "You can white‑knuckle discipline for a bit; to sustain it for years, you have to associate it with freedom and your deeper 'why'."
    }
  ]
};

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;

  // Get article by slug or use fallback
  const article = articlesMap[slug] || FALLBACK_ARTICLE;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <SiteHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-7 lg:py-12 relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50/20 rounded-full blur-3xl"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 relative">
          {/* Left rail: post contents + promo card */}
          <aside className="lg:col-span-3">
            <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-28">
              {/* Post contents dropdown */}
              <PostContents
                sections={article.sections.map((s, i) => ({ id: `section-${i + 1}`, title: s.title }))}
              />

              {/* Promo card (hide on mobile to match reference; show only on desktop) */}
              <div className="hidden lg:block rounded-xl p-6 text-white shadow-lg text-center relative overflow-hidden" style={{
                background: "linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #0ea5e9 100%)"
              }}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 via-amber-400 to-teal-400"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="text-xs font-bold uppercase tracking-wider opacity-90 mb-2 bg-white/20 px-3 py-1 rounded-full inline-block">Limited time</div>
                  <h3 className="text-2xl font-bold leading-tight mb-3 mt-4">
                    Feel Like Your Body's Betraying You After 40?
                  </h3>
                  <p className="text-sm text-white/90 leading-relaxed mb-5">
                    1‑on‑1 coaching. Personalized macros & workouts designed for your changing body. Join thousands proving it&apos;s never too late to become your strongest self.
                  </p>
                  <Link
                    href="/quiz/financial-profile"
                    className="inline-flex items-center justify-center w-full bg-white hover:bg-slate-50 text-teal-600 font-semibold rounded-lg py-3 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] duration-300"
                  >
                    APPLY NOW
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Main article */}
          <main className="lg:col-span-9">
            <div className="mb-3 sm:mb-5">
              <div className="inline-block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full mb-2">{article.category}</div>
              <h1 className="mt-2 sm:mt-3 text-2xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                {article.title}
              </h1>
            </div>

            {/* Hero media strip (always 3-panel landscape; scaled heights per breakpoint) */}
            <div className="rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-lg border border-slate-200/60 mb-4 sm:mb-8 lg:mb-10">
              <div className="grid grid-cols-3">
                {article.heroImages.map((h, i) => (
                  <div key={i} className={`h-32 sm:h-48 md:h-64 lg:h-72 bg-gradient-to-br ${h.color} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                  </div>
                ))}
              </div>
              <div className="px-5 sm:px-8 pb-5 sm:pb-7">
                {article.heroText && (
                <div className="inline-flex items-center justify-center mt-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2 rounded-lg shadow-md">
                    {article.heroText}
                </div>
                )}
              </div>
            </div>

            {/* Body */}
            <article className="prose max-w-none">
              {article.sections.map((s, i) => {
                // Only show colored bar on main sections (Introduction, main topic sections, Conclusion)
                const mainSections = ["Introduction", "Why budgets fail", "How to fix it — a behaviour-based roadmap", "Behaviour change mindset – the key to lasting success", "Quick checklist for your next budget", "Conclusion", "How big is the issue?", "Why your budget can get sabotaged by BNPL", "How to fix it—or better: how to use BNPL safely (if you must)", "Behaviour-change mindset: shifting the frame", "Quick checklist for your next BNPL decision", "Section 1: Why these conversations matter", "Section 2: The common stumbling blocks", "Section 3: How to talk about money the right way", "Section 4: Mindset shifts that support lasting change", "Section 5: Quick checklist for your next money-conversation", "Section 1: Why the system matters", "Section 2: What the 3-Account System looks like", "Section 3: Why this system works — behaviourally & practically", "Section 4: How to implement it — your step-by-step roadmap", "Section 5: Common pitfalls & how to avoid them", "Section 6: Behaviour-change mindset – making it sustainable", "Section 7: Quick checklist for your next euro-payday", "Section 1: The scope of the challenge – what the numbers say", "Section 2: The behavioural and systemic traps of variable income", "Section 3: How to build wealth on a variable income — a behaviour-based roadmap", "Section 4: Mindset shifts that support lasting success", "Section 5: Quick checklist for your next \"income-up\" moment"];
                const isMainSection = mainSections.includes(s.title);
                
                return (
                <section key={i} id={`section-${i + 1}`} className="mb-10 scroll-mt-24 sm:scroll-mt-28 md:scroll-mt-32">
                    {isMainSection ? (
                      <div className="relative pl-4 sm:pl-6 mb-4">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-amber-400 rounded-full"></div>
                        <h2 className="text-lg sm:text-2xl font-bold text-slate-900">{s.title}</h2>
                      </div>
                    ) : (
                    <h2 className="text-lg sm:text-2xl font-bold text-slate-900 mb-4">{s.title}</h2>
                    )}
                    <div className="text-slate-700 leading-relaxed text-base sm:text-lg space-y-6">
                      {(() => {
                        const paragraphs = s.body.split('\n\n').filter(p => p.trim());
                        const result = [];
                        let i = 0;
                        // Reset step counter for "How to fix it" section
                        let stepCounter = s.title.toLowerCase().includes('fix it') ? 0 : 0;
                        
                        // Helper function to parse markdown-style bold and italic
                        const parseMarkdown = (text: string) => {
                          const parts: (string | React.ReactElement)[] = [];
                          let currentIndex = 0;
                          
                          // Match **bold** and *italic*
                          const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
                          let match;
                          
                          while ((match = regex.exec(text)) !== null) {
                            // Add text before match
                            if (match.index > currentIndex) {
                              parts.push(text.substring(currentIndex, match.index));
                            }
                            
                            // Process match
                            const matchText = match[0];
                            if (matchText.startsWith('**') && matchText.endsWith('**')) {
                              // Bold
                              parts.push(<strong key={`bold-${match.index}`} className="font-semibold text-slate-900">{matchText.slice(2, -2)}</strong>);
                            } else if (matchText.startsWith('*') && matchText.endsWith('*')) {
                              // Italic
                              parts.push(<em key={`italic-${match.index}`} className="italic text-slate-600">{matchText.slice(1, -1)}</em>);
                            }
                            
                            currentIndex = match.index + match[0].length;
                          }
                          
                          // Add remaining text
                          if (currentIndex < text.length) {
                            parts.push(text.substring(currentIndex));
                          }
                          
                          return parts.length > 0 ? parts : [text];
                        };
                        
                        // Helper to get icon for step number
                        const getStepIcon = (stepNum: number) => {
                          const icons = [
                            <svg key="1" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>, // clipboard
                            <svg key="2" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>, // settings
                            <svg key="3" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, // chart
                            <svg key="4" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, // target
                            <svg key="5" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>, // lock
                            <svg key="6" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> // refresh
                          ];
                          return icons[stepNum - 1] || icons[0];
                        };
                        
                        // Helper to get icon for reason number
                        const getReasonIcon = (reasonNum: number) => {
                          const icons = [
                            <svg key="1" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>, // alert
                            <svg key="2" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
                            <svg key="3" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, // check
                            <svg key="4" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, // lightning
                            <svg key="5" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> // trend
                          ];
                          return icons[reasonNum - 1] || icons[0];
                        };
                        
                        while (i < paragraphs.length) {
                          const para = paragraphs[i].trim();
                          
                          // Check if this and following paragraphs are bullets - group them
                          if (para.startsWith('•') || para.includes('•')) {
                            const bullets = [];
                            
                            // If paragraph contains multiple bullets separated by newlines, split them
                            if (para.includes('\n') && para.includes('•')) {
                              const lines = para.split('\n').filter(line => line.trim());
                              lines.forEach(line => {
                                const trimmed = line.trim();
                                if (trimmed.startsWith('•')) {
                                  bullets.push(trimmed.substring(1).trim());
                                } else if (trimmed) {
                                  // If line doesn't start with bullet but is part of a bullet list context, add it
                                  bullets.push(trimmed);
                                }
                              });
                              i++;
                            } else {
                              // Original logic: collect separate paragraphs that start with bullets
                              while (i < paragraphs.length && (paragraphs[i].trim().startsWith('•') || paragraphs[i].trim().includes('•'))) {
                                const currentPara = paragraphs[i].trim();
                                // Split by newlines if this paragraph contains multiple bullets
                                if (currentPara.includes('\n') && currentPara.includes('•')) {
                                  const lines = currentPara.split('\n').filter(line => line.trim());
                                  lines.forEach(line => {
                                    const trimmed = line.trim();
                                    if (trimmed.startsWith('•')) {
                                      bullets.push(trimmed.substring(1).trim());
                                    }
                                  });
                                } else if (currentPara.startsWith('•')) {
                                  bullets.push(currentPara.substring(1).trim());
                                }
                                i++;
                              }
                            }
                            
                            // Only render if we found bullets
                            if (bullets.length > 0) {
                              // Check if this is a checklist section - render with checkboxes
                              const isChecklist = s.title.toLowerCase().includes('checklist');
                              
                              result.push(
                                <div key={`bullets-${i}`} className={isChecklist ? "bg-slate-50 rounded-lg p-6 border border-slate-200" : "bg-slate-50 rounded-lg p-6 border border-slate-200"}>
                                  <ul className="space-y-3">
                                    {bullets.map((bullet, idx) => (
                                      isChecklist ? (
                                        <ChecklistItem key={idx} bullet={bullet} idx={idx} parsedContent={parseMarkdown(bullet)} />
                                      ) : (
                                        <li key={idx} className="flex items-start gap-3">
                                          <svg className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                          </svg>
                                          <span className="flex-1">{parseMarkdown(bullet)}</span>
                                        </li>
                                      )
                                    ))}
                                  </ul>
                                </div>
                              );
                            }
                            continue;
                          }
                          
                          // Check if paragraph starts with bold text in "How to fix it" section, "How to talk about money" section, "How to implement it" section, or "How to build wealth" section - create a step card
                          if (para.match(/^\*\*/) && (s.title.toLowerCase().includes('fix it') || s.title.toLowerCase().includes('how to talk about money') || s.title.toLowerCase().includes('how to implement it') || s.title.toLowerCase().includes('how to build wealth'))) {
                            // Check if it's not a numbered item (which would be 1., 2., etc.) or regular paragraph
                            // Match paragraph that STARTS with bold text (even if there's more content after)
                            const boldMatch = para.match(/^\*\*(.+?)\*\*/);
                            if (boldMatch && !para.match(/^\*\*\d+\./)) {
                              stepCounter++;
                              const stepTitle = boldMatch[1].trim();
                              const stepNum = stepCounter;
                              const restOfContent = [];
                              
                              // Extract any content after the bold title in the same paragraph
                              const afterBold = para.substring(boldMatch[0].length).trim();
                              if (afterBold) {
                                // Split by newlines within the paragraph to separate multiple lines
                                const linesAfterBold = afterBold.split('\n').filter(l => l.trim());
                                restOfContent.push(...linesAfterBold);
                              }
                              
                              // Collect following paragraphs until next bold step or numbered item
                              i++;
                              while (i < paragraphs.length) {
                                const nextPara = paragraphs[i].trim();
                                // Stop if we hit another bold step or numbered item
                                if ((nextPara.match(/^\*\*/) && !nextPara.match(/^\*\*\d+\./) && !nextPara.match(/^\*\*From/)) || nextPara.match(/^\*\*\d+\./)) {
                                  break;
                                }
                                restOfContent.push(nextPara);
                                i++;
                              }
                            
                            result.push(
                              <div key={`step-${stepNum}`} className="mb-6">
                                <div className="flex items-start gap-4 mb-3">
                                  <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center text-white shadow-md">
                                      <span className="text-lg font-bold">{stepNum}</span>
                                    </div>
                                  </div>
                                  <div className="flex-1 pt-1">
                                    <h3 className="font-bold text-slate-900 text-xl leading-tight mb-3">{stepTitle}</h3>
                                    <div className="space-y-3">
                                      {restOfContent.map((content, idx) => (
                                        <p key={idx} className="text-slate-700 leading-relaxed">{parseMarkdown(content)}</p>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                            continue;
                          }
                          }
                          
                          // Check if paragraph starts with numbered bold (like "**1. Title**") - create a card with icon
                          if (para.match(/^\*\*\d+\./)) {
                            const numMatch = para.match(/^\*\*(\d+)\./);
                            const num = numMatch ? parseInt(numMatch[1]) : 0;
                            const titleMatch = para.match(/^\*\*\d+\.\s*([^*]+)\*\*/);
                            const title = titleMatch ? titleMatch[1].trim() : '';
                            const restOfContent = [];
                            
                            // Collect following paragraphs until next numbered item
                            i++;
                            while (i < paragraphs.length && !paragraphs[i].trim().match(/^\*\*\d+\./) && !paragraphs[i].trim().match(/^\*\*Step \d+:/)) {
                              restOfContent.push(paragraphs[i].trim());
                              i++;
                            }
                            
                            // Separate description from "Sign:" text
                            let description = '';
                            let signText = '';
                            restOfContent.forEach(content => {
                              // Match "Sign:" in various formats: "Sign: text", "*Sign: text*", "*Sign: text"
                              const signMatch = content.match(/^\*?Sign:\s*([^*]+?)\*?$/i) || content.match(/Sign:\s*([^*]+?)(?:\*|$)/i);
                              if (signMatch && signMatch[1]) {
                                signText = signMatch[1].trim().replace(/\*$/, '').trim();
                              } else {
                                const cleanedContent = content.replace(/^\*Sign:\s*(.+?)\*$/i, '').trim();
                                if (cleanedContent && cleanedContent !== content) {
                                  // Content was a sign line, skip it
                                } else if (cleanedContent) {
                                  description += (description ? ' ' : '') + cleanedContent;
                                }
                              }
                            });
                            
                            // Fallback: try to extract sign from any remaining content
                            if (!signText && restOfContent.length > 0) {
                              const allContent = restOfContent.join(' ');
                              const signMatch = allContent.match(/Sign:\s*([^*]+?)(?:\*|$)/i);
                              if (signMatch && signMatch[1]) {
                                signText = signMatch[1].trim().replace(/\*$/, '').trim();
                                description = allContent.replace(/Sign:\s*[^*]+?\*/i, '').trim();
                              }
                            }
                            
                            result.push(
                              <div key={i} className="bg-gradient-to-r from-white to-slate-50 rounded-lg p-4 border-l-4 border-teal-500 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                                    {getReasonIcon(num)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-slate-900 text-base mb-1.5">{title}</h3>
                                    {description && (
                                      <p className="text-slate-600 text-sm leading-relaxed mb-2">{parseMarkdown(description)}</p>
                                    )}
                                    {signText && (
                                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-md">
                                        <svg className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <span className="text-xs font-medium text-amber-800">
                                          <span className="font-semibold">Sign:</span> {signText}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                            continue;
                          }
                          
                          // Check if paragraph starts with bold mindset shift
                          if (para.match(/^\*\*From/) && s.title.includes('mindset')) {
                            const restOfContent = [];
                            i++;
                            while (i < paragraphs.length && !paragraphs[i].trim().match(/^\*\*From/)) {
                              restOfContent.push(paragraphs[i].trim());
                              i++;
                            }
                            
                            // Parse "From X to Y" format
                            const fromToMatch = para.match(/^\*\*From\s+"([^"]+)"\s+to\s+"([^"]+)"\*\*/);
                            if (fromToMatch) {
                              const fromText = fromToMatch[1];
                              const toText = fromToMatch[2];
                              
                            result.push(
                              <div key={i} className="bg-gradient-to-r from-slate-50 to-teal-50 rounded-lg p-4 border border-teal-200/50 shadow-sm">
                                <div className="flex items-center justify-center">
                                  <div className="flex items-center gap-3 max-w-4xl w-full">
                                    <span className="px-3 py-1.5 bg-slate-200 rounded-md text-sm font-medium text-slate-700 line-through decoration-slate-500 flex-shrink-0 min-w-[180px] max-w-[180px] text-center break-words">
                                      {fromText}
                                    </span>
                                    <svg className="w-5 h-5 text-teal-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                    <span className="px-3 py-1.5 bg-teal-600 text-white rounded-md text-sm font-semibold flex-1 text-center break-words">
                                      {toText}
                                    </span>
                                  </div>
                                </div>
                                  {restOfContent.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                      {restOfContent.map((content, idx) => (
                                        <p key={idx} className="text-slate-600 text-sm leading-relaxed">
                                          {parseMarkdown(content)}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            } else {
                              // Fallback for non-standard format
                              const boldMatch = para.match(/^\*\*(.+?)\*\*/);
                              const boldText = boldMatch ? boldMatch[1] : para;
                              
                              result.push(
                                <div key={i} className="bg-white rounded-lg p-5 border-l-4 border-teal-500 shadow-sm">
                                  <h3 className="font-semibold text-slate-900 text-lg mb-3">{boldText}</h3>
                                  <div className="space-y-2">
                                    {restOfContent.map((content, idx) => (
                                      <p key={idx}>{parseMarkdown(content)}</p>
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                            continue;
                          }
                          
                          // Regular paragraphs
                          result.push(<p key={i}>{parseMarkdown(para)}</p>);
                          i++;
                        }
                        
                        return result;
                      })()}
                  </div>
                </section>
                );
              })}
            </article>

            {/* End of article content */}
          </main>
        </div>

        {/* Mid-page CTA (before Top Read Content) - Mobile only */}
        <div className="mt-8 sm:mt-10 relative lg:hidden">
          <div className="rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-teal-700 to-teal-600"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 via-amber-400 to-teal-400"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-800/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="text-xs font-bold uppercase tracking-wider opacity-90 mb-2 bg-white/20 px-3 py-1 rounded-full inline-block">Limited Time</div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 mt-4">Begin Your Journey To A Stronger, Healthier You</h3>
              <p className="text-sm text-white/90 mb-5 max-w-2xl mx-auto">Uncover what&apos;s holding you back from getting toned & feeling confident in your skin!</p>
              <Link href="/quiz/financial-profile" className="inline-block bg-white hover:bg-slate-50 text-teal-600 font-semibold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 duration-300">APPLY NOW</Link>
            </div>
          </div>
        </div>

        {/* Top Read Content - full width below the grid */}
        <section className="mt-8 sm:mt-12 relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-slate-900">Top Read Content</h2>
            <Link href="/blog" className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">View More</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/blog/why-your-budget-keeps-failing" className="group block">
              <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-slate-200/60 hover:border-teal-300 hover:shadow-lg transition-all duration-300">
                <div className="h-44 bg-gradient-to-br from-teal-500 to-teal-600 relative overflow-hidden group-hover:opacity-95 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-teal-600 transition-colors">{articlesMap["why-your-budget-keeps-failing"]?.title || "Why Your Budget Keeps Failing (And How to Fix It)"}</h3>
                  <p className="text-sm text-slate-600 line-clamp-3 mb-3 leading-relaxed">Budgets aren&apos;t about restriction — they&apos;re about freedom. Discover the 3 behavior shifts that make budgeting actually work.</p>
                  <div className="text-xs text-slate-500">4 min read</div>
                </div>
              </div>
            </Link>

            <Link href="/blog/hidden-cost-of-bnpl" className="group block">
              <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-slate-200/60 hover:border-teal-300 hover:shadow-lg transition-all duration-300">
                <div className="h-44 bg-gradient-to-br from-teal-600 to-teal-700 relative overflow-hidden group-hover:opacity-95 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-teal-600 transition-colors">{articlesMap["hidden-cost-of-bnpl"]?.title || "The Hidden Cost of 'Buy Now, Pay Later'"}</h3>
                  <p className="text-sm text-slate-600 line-clamp-3 mb-3 leading-relaxed">That innocent payment plan could be costing you more than money. Let&apos;s talk about the psychological trap of deferred payments.</p>
                  <div className="text-xs text-slate-500">3 min read</div>
                </div>
              </div>
            </Link>

            <Link href="/blog/talk-about-money-with-your-partner" className="group block">
              <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-slate-200/60 hover:border-teal-300 hover:shadow-lg transition-all duration-300">
                <div className="h-44 bg-gradient-to-br from-teal-400 to-teal-500 relative overflow-hidden group-hover:opacity-95 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-teal-600 transition-colors">{articlesMap["talk-about-money-with-your-partner"]?.title || "How to Talk About Money With Your Partner"}</h3>
                  <p className="text-sm text-slate-600 line-clamp-3 mb-3 leading-relaxed">Money conversations don&apos;t have to be awkward. Here&apos;s how to build financial trust and alignment in your relationship.</p>
                  <div className="text-xs text-slate-500">5 min read</div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* CTA strip - full width below Top Read Content */}
        <div className="mt-12 relative overflow-hidden rounded-xl p-6 sm:p-8 text-center text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-teal-700 to-teal-600"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 via-amber-400 to-teal-400"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-800/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Begin Your Journey To A Stronger, Healthier You</h3>
            <p className="text-white/90 mb-5 max-w-2xl mx-auto">Uncover what&apos;s holding you back from getting toned & feeling confident in your skin!</p>
            <Link href="/quiz/financial-profile" className="inline-block bg-white hover:bg-slate-50 text-teal-600 font-semibold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 duration-300">
              APPLY NOW
            </Link>
          </div>
        </div>
      </div>
      {/* Footer must be OUTSIDE the constrained container to span full width */}
      <SiteFooter />
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const title = `Read • ${slug.replace(/-/g, " ")}`;
  return {
    title,
    description: "Article • BrightNest",
  };
}


