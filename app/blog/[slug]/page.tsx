import Link from "next/link";
import PostContents from "@/components/PostContents";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

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
      heroText: "THE PSYCHOLOGICAL TRAP OF DEFERRED PAYMENTS",
      sections: [
        {
          title: "1. The illusion of affordability",
          body: "When you split a $200 purchase into four $50 payments, your brain registers it as 'only $50' — not the full $200. This mental accounting trick makes spending feel smaller than it is. You're not avoiding the cost; you're just delaying when you feel it, which often leads to spending more than you would have otherwise."
        },
        {
          title: "2. The compound interest trap",
          body: "Buy now, pay later services make money from late fees and interest. One missed payment can cascade into a cycle of fees that cost more than the original purchase. What starts as a $50 payment plan can easily become $75 or $100 with fees, turning a manageable purchase into financial stress."
        },
        {
          title: "3. The detachment from real cost",
          body: "When payment is abstracted and delayed, you lose connection to the actual money leaving your account. Cash feels real; a future payment feels like a concept. This psychological distance makes it easier to overspend and harder to make mindful financial decisions. The best purchase is one you can afford today, not one you hope to afford later."
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
      heroText: "BUILDING FINANCIAL TRUST AND ALIGNMENT",
      sections: [
        {
          title: "1. Start with values, not numbers",
          body: "Before diving into budgets and bills, talk about what money means to each of you. What does financial security look like? What are your shared goals? When you align on values first, the numbers become a tool for achieving something meaningful together, not a source of conflict."
        },
        {
          title: "2. Make it a regular conversation",
          body: "Money talks shouldn't be emergency meetings or annual reviews. Schedule regular check-ins — monthly works for most couples — where you discuss goals, spending, and concerns in a low-pressure setting. When money conversations become routine, they lose their tension and become collaborative planning sessions."
        },
        {
          title: "3. Separate individual and shared spending",
          body: "You don't have to merge everything. Maintain individual accounts for personal spending while having a shared account for joint expenses. This gives each person autonomy and prevents resentment over personal purchases. Clear boundaries around 'yours, mine, and ours' actually reduce financial conflict, not increase it."
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
      heroText: "A SIMPLE SYSTEM FOR EFFORTLESS MONEY MANAGEMENT",
      sections: [
        {
          title: "1. The Bills Account",
          body: "This is where your fixed expenses live: rent, utilities, insurance, subscriptions — everything that's predictable and recurring. Calculate your monthly total, divide it by your pay frequency, and automate that transfer. Once it's set up, you never think about bills again. They just get paid."
        },
        {
          title: "2. The Goals Account",
          body: "Separate savings by purpose: emergency fund, vacation, down payment, whatever matters to you. This isn't one vague 'savings' account — it's specific goals with specific timelines. When you can see progress toward each goal separately, saving becomes tangible and motivating. You're not just saving; you're saving for something."
        },
        {
          title: "3. The Life Account",
          body: "Everything else goes here: groceries, gas, entertainment, discretionary spending. This is your flexible spending money, and when it's gone, it's gone. Having clear boundaries between fixed expenses, savings goals, and daily life makes decision-making automatic. No more wondering if you can afford something — the account balance tells you clearly."
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
      heroText: "FINANCIAL STABILITY WHEN YOUR INCOME FLUCTUATES",
      sections: [
        {
          title: "1. Base your budget on your worst month",
          body: "Don't budget for the average — budget for the leanest month you've had. This creates automatic buffer space when income is higher. When good months happen, the excess goes straight to savings, not lifestyle inflation. Living below your variable income is how you create stability in instability."
        },
        {
          title: "2. Build a larger emergency fund",
          body: "While traditional advice suggests 3-6 months of expenses, with variable income, aim for 6-12 months. This larger cushion smooths out income fluctuations and prevents panic during slower periods. Your emergency fund isn't just for emergencies — it's your income volatility buffer."
        },
        {
          title: "3. Smooth income with a 'salary' system",
          body: "Pay yourself a consistent monthly 'salary' from a separate income account. When high months happen, the surplus builds in that account. During low months, you draw from the accumulated surplus. You get consistent monthly payouts while your actual income can fluctuate wildly. Consistency comes from planning, not luck."
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
                    1‑on‑1 coaching. Personalized macros & workouts designed for your changing body. Join thousands proving it's never too late to become your strongest self.
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
                const mainSections = ["Introduction", "Why budgets fail", "How to fix it — a behaviour-based roadmap", "Behaviour change mindset – the key to lasting success", "Quick checklist for your next budget", "Conclusion"];
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
                          const parts: (string | JSX.Element)[] = [];
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
                                      <li key={idx} className="flex items-start gap-3">
                                        {isChecklist ? (
                                          <div className="flex-shrink-0 w-5 h-5 mt-0.5 border-2 border-slate-400 rounded-sm bg-white flex items-center justify-center">
                                            <svg className="w-3 h-3 text-teal-600 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                          </div>
                                        ) : (
                                          <svg className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                          </svg>
                                        )}
                                        <span className="flex-1">{parseMarkdown(bullet)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            }
                            continue;
                          }
                          
                          // Check if paragraph starts with bold text in "How to fix it" section - create a step card
                          if (para.match(/^\*\*/) && s.title.toLowerCase().includes('fix it')) {
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
                                  <div className="flex items-center gap-3" style={{ maxWidth: '600px', width: '100%' }}>
                                    <span className="px-3 py-1.5 bg-slate-200 rounded-md text-sm font-medium text-slate-700 line-through decoration-slate-500 whitespace-nowrap w-[160px] flex-shrink-0 text-center">
                                      {fromText}
                                    </span>
                                    <svg className="w-5 h-5 text-teal-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                    <span className="px-3 py-1.5 bg-teal-600 text-white rounded-md text-sm font-semibold whitespace-nowrap flex-1 text-center">
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
              <p className="text-sm text-white/90 mb-5 max-w-2xl mx-auto">Uncover what's holding you back from getting toned & feeling confident in your skin!</p>
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
                  <p className="text-sm text-slate-600 line-clamp-3 mb-3 leading-relaxed">Budgets aren't about restriction — they're about freedom. Discover the 3 behavior shifts that make budgeting actually work.</p>
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
                  <p className="text-sm text-slate-600 line-clamp-3 mb-3 leading-relaxed">That innocent payment plan could be costing you more than money. Let's talk about the psychological trap of deferred payments.</p>
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
                  <p className="text-sm text-slate-600 line-clamp-3 mb-3 leading-relaxed">Money conversations don't have to be awkward. Here's how to build financial trust and alignment in your relationship.</p>
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
            <p className="text-white/90 mb-5 max-w-2xl mx-auto">Uncover what's holding you back from getting toned & feeling confident in your skin!</p>
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


