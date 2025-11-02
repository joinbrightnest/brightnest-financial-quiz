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
          body: "You set your budget at the start of the month. You felt good. You determined your income, laid out your expenses, promised yourself: This time is different. And yet… by week three you're overspending on dining out. By week four you're scrambling to cover bills. Sound familiar? You're definitely not alone. According to a 2023 survey by NerdWallet, 84% of Americans who say they have a monthly budget admit they've gone over it at least once. So the issue isn't simply making a budget. The real issue is why the budget keeps failing. This post explores the underlying behavioural causes, backs them with recent statistics, and gives you a roadmap to build a budgeting system that actually lasts."
        },
        {
          title: "How big is the problem?",
          body: "About 83% of U.S. adults say they overspend at least sometimes. Among those who have a monthly budget, 84% admit to exceeding it at some point. 57% of Americans report they don't have enough savings to cover a $1,000 emergency. 17% of U.S. adults said they did not pay all their bills in full in the previous month — and among those earning under $25k, the number jumps to 36%. On financial literacy: Only 54% of U.S. adults say they know \"a great deal\" or \"a fair amount\" about personal finances; confidence in budgeting is lower (59%). These numbers show: it's not just you. Budgeting failure is widespread. But more importantly: it's largely preventable if we understand the real reasons behind the breakdown."
        },
        {
          title: "The top behavioural reasons your budget fails",
          body: "Below are the most common behavioural traps that sabotage a budget — with explanation and signs to watch for."
        },
        {
          title: "1. Unrealistic goals or too-strict limits",
          body: "Many budgets are built on ideal months — \"I'll spend only $50 on eating out\" when in reality you go out 3 nights a week. The mismatch between real life behaviour and budget assumptions causes immediate failure.\n\nSign: You blow one category (eating-out, groceries) and then everything else collapses or you abandon the budget entirely."
        },
        {
          title: "2. Failure to plan for irregular expenses & emergencies",
          body: "If your budget doesn't include \"fun money\", surprise bills, seasonal gifts, car repairs — you'll either bust your budget or ignore the unexpected, which erodes trust in the process.\n\nSign: You hit mid-month and suddenly feel like \"nothing left\" or you dip into debt."
        },
        {
          title: "3. Lack of monitoring / feedback",
          body: "A budget isn't \"set and forget\". If you don't review your spending and adjust, you'll drift off track. One article says quitting too soon is a major reason for failure.\n\nSign: You forget to check in on your budget until the month is over — then you're in the red."
        },
        {
          title: "4. Misalignment with your values & behaviours",
          body: "If your budget restricts what truly matters to you, you'll rebel. For instance: you hate cooking at home but budget forces 90% at-home meals. That causes resentment, overshooting, abandonment.\n\nSign: You feel deprived, resentful, or you repeatedly rationalise \"just this once\"."
        },
        {
          title: "5. Behavioural triggers: emotional spending, habit overspending",
          body: "Budgeting often fails when it assumes rational behaviour — yet humans are emotional, impulsive. If you don't identify your spending triggers (stress, reward, convenience) the budget will lose.\n\nSign: You know you overspend when triggered (bad day, social outing, boredom) and budget didn't guard against that."
        },
        {
          title: "How to fix it — a behaviour-based roadmap",
          body: "Here's how to build a budgeting system that works with your behaviour, not against it."
        },
        {
          title: "Step 1: Track real behaviour for 30–90 days",
          body: "Start by simply tracking — no changes yet. What do you really spend on groceries, eating out, entertainment, subscriptions? Use bank statements, receipt photos, spending apps.\n\nWhy? Because your budget must reflect reality, not idealism.\n\n\"Start with 3 months of real expenses (yes, the coffee counts) … Treat your budget as a living tool — not a prison.\""
        },
        {
          title: "Step 2: Build in flexibility and \"fun money\"",
          body: "Rather than zero-fun, carve out a category for flexible spending (\"treats\", \"going out\") that fits your values. When people feel deprived, they rebel. Allow latitude.\n\nAlso build in \"emergency/irregular\" funds (seasonal gifts, car repairs) by dividing annual costs into monthly budgeting."
        },
        {
          title: "Step 3: Set realistic targets and adjust frequently",
          body: "After you track actual behaviour, set targets that challenge yet are achievable. If you regularly spend $400 on groceries, don't budget $250 immediately — maybe $350 then reduce gradually.\n\nReview monthly and adjust. Sense of progress builds motivation."
        },
        {
          title: "Step 4: Align budget with your values and goals",
          body: "Ask yourself: What matters? The gym, travel, home-cooking, books? Your budget should reflect those priorities. If the budget starves what you value, it won't last.\n\nAlso link each spending category to a bigger goal — savings, debt reduction, experience — so that the budget feels purposeful."
        },
        {
          title: "Step 5: Use behavioural \"guardrails\"",
          body: "Automate savings and emergency-fund deposits so you pay yourself first. Use separate accounts or \"pots\" for specific goals (vacation, repairs). Monitor weekly, not just monthly — small check-ins catch drift early.\n\nRecognise and plan for your personal triggers: if you overspend when stressed, plan \"stress buffer\" money or alternative activity."
        },
        {
          title: "Step 6: Make the budget a living tool, not a fixed prison",
          body: "The best budgets evolve. Life changes: income shifts, cost of living rises, priorities change. Review and reshape.\n\n\"Budgets don't inherently get you to stop spending money… The problem is that restrictions are the ultimate fun-killer.\"\n\nSo aim for consistency over perfection. Adjust rather than abandon."
        },
        {
          title: "Behaviour change mindset – the key to lasting success",
          body: "Building the right budget structure is only part of the solution. The other part: adopting a mindset of behaviour change. Here are some mindset switches that matter:"
        },
        {
          title: "From \"must cut\" to \"choose better\"",
          body: "Rather than seeing budget as deprivation, view it as empowerment: choosing where you want your money to go."
        },
        {
          title: "From \"one perfect month\" to \"progress over time\"",
          body: "Rarely does one month change everything; incremental adjustments lead to lasting change."
        },
        {
          title: "From \"I blew it – I quit\" to \"I drifted – I adjust\"",
          body: "If you overspend, don't abandon the budget; recognise and correct."
        },
        {
          title: "From \"spending equals fun\" to \"spending aligned with mission\"",
          body: "When you link spending to your values (what you truly care about), you make decisions more consciously."
        },
        {
          title: "Quick checklist for your next budget",
          body: "Use this as your pre-launch checklist:\n\n• Did I track actual spending for 1–3 months before budgeting?\n• Did I build in a \"fun\" spending category that suits my lifestyle?\n• Did I include irregular/seasonal expenses (gifts, repairs)?\n• Are my targets realistic (based on past behaviour) rather than idealistic?\n• Have I aligned major categories with what I value most?\n• Is there an \"escape valve\" for when life happens (buffer fund)?\n• Will I review weekly? monthly? adjust as needed?\n• Do I automate savings and treat budget as a tool, not a punishment?"
        },
        {
          title: "Conclusion",
          body: "Budgeting isn't about strict rules or eliminating every treat. It's about designing a system that fits you — your lifestyle, your goals, your impulses — and then using that system to gradually shift your behaviour. The statistics show that most people who budget still fail — not because budgets are broken, but because the budgets don't match reality or adapt as life happens. By tracking real spending, building flexibility, aligning with values, and treating your budget as a living tool, you'll move from budgeting frustration to budgeting that works. Your next budget can be the one you stick with. Let it reflect who you are and where you're going — not just what you think you should do."
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
              {article.sections.map((s, i) => (
                <section key={i} id={`section-${i + 1}`} className="mb-10 scroll-mt-24 sm:scroll-mt-28 md:scroll-mt-32">
                  <div className="relative pl-4 sm:pl-6">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-amber-400 rounded-full"></div>
                    <h2 className="text-lg sm:text-2xl font-bold text-slate-900 mb-4">{s.title}</h2>
                  </div>
                  <div className="text-slate-700 leading-relaxed text-base sm:text-lg space-y-4">
                    {s.body.split('\n\n').map((paragraph, idx) => (
                      paragraph.trim() && (
                        <p key={idx} className={paragraph.startsWith('•') ? 'pl-4' : ''}>
                          {paragraph.trim()}
                        </p>
                      )
                    ))}
                  </div>
                </section>
              ))}
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


