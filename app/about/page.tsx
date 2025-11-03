"use client";

import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export default function AboutPage() {

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <SiteHeader />

      {/* Hero Section */}
      <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/30 via-white to-amber-50/20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-100/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-amber-100/20 to-transparent rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
              About BrightNest
            </h1>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-8 leading-tight">
              Helping People Rebuild Their Relationship With Money
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-6 mb-16">
            <p className="text-lg sm:text-xl text-slate-700 leading-relaxed">
              Money isn't just numbers.
            </p>
            <p className="text-lg sm:text-xl text-slate-700 leading-relaxed">
              It's emotion, habit, and identity — all tangled together.
            </p>
            <p className="text-lg sm:text-xl text-slate-700 leading-relaxed">
              Most people don't struggle because they don't know what to do.
            </p>
            <p className="text-lg sm:text-xl text-slate-700 leading-relaxed">
              They struggle because they can't make themselves do it consistently.
            </p>
            <p className="text-lg sm:text-xl text-slate-700 leading-relaxed font-semibold">
              That's where BrightNest comes in.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-teal-50/20 to-slate-50"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-amber-100/30 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mt-4 mb-6 leading-tight">
                Our Mission
              </h2>
            </div>
            <div className="bg-white rounded-xl p-8 sm:p-12 border border-slate-200/60 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-amber-400 to-teal-500"></div>
              <div className="space-y-6 relative z-10">
                <p className="text-xl sm:text-2xl text-slate-900 leading-relaxed font-medium">
                  At BrightNest, our mission is simple:
                </p>
                <p className="text-xl sm:text-2xl text-slate-900 leading-relaxed font-semibold">
                  to help people change their financial behaviour for good.
                </p>
                <p className="text-lg text-slate-700 leading-relaxed">
                  We combine psychology, structure, and guidance from certified experts to help you take back control of your money — step by step, without guilt or overwhelm.
                </p>
                <p className="text-lg text-slate-700 leading-relaxed">
                  We don't just teach budgeting.
                </p>
                <p className="text-lg text-slate-700 leading-relaxed">
                  We help you understand why you spend, how to change your habits, and what systems actually keep you consistent.
                </p>
                <p className="text-lg text-slate-700 leading-relaxed">
                  The goal isn't perfection.
                </p>
                <p className="text-lg text-slate-700 leading-relaxed font-semibold">
                  It's progress — and freedom.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes BrightNest Different */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-50/30 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mt-4 mb-6 leading-tight">
                What Makes BrightNest Different
              </h2>
            </div>
            <div className="space-y-6">
              <p className="text-lg text-slate-700 leading-relaxed">
                Most financial advice focuses on spreadsheets, apps, or tips.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed font-semibold">
                We focus on human behaviour.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                Our system blends:
              </p>
              <ul className="space-y-4 text-lg text-slate-700 leading-relaxed list-disc list-inside ml-4">
                <li><strong>Behavioural science</strong> — because lasting change starts with mindset.</li>
                <li><strong>Proven frameworks</strong> — to simplify decisions and remove guesswork.</li>
                <li><strong>Accountability & coaching</strong> — to help you follow through, not just plan.</li>
                <li><strong>Clear tracking dashboards</strong> — so you can see your progress in real time.</li>
              </ul>
              <p className="text-lg text-slate-700 leading-relaxed">
                You don't need to become a finance expert.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed font-semibold">
                You just need the right environment, habits, and support — that's what BrightNest gives you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Exist */}
      <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-amber-50/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mt-4 mb-6 leading-tight">
                Why We Exist
              </h2>
            </div>
            <div className="space-y-6">
              <p className="text-lg text-slate-700 leading-relaxed">
                Because money stress is one of the biggest causes of anxiety, conflict, and lost potential in people's lives.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                We've seen what happens when people live paycheck to paycheck, avoid their bank apps, or feel trapped by debt.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                It's not about lacking discipline — it's about lacking a system that works with your behaviour, not against it.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed font-semibold">
                BrightNest was built to change that — to make personal finance feel clear, actionable, and empowering again.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Believe */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-50/30 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mt-4 mb-6 leading-tight">
                What We Believe
              </h2>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-lg text-slate-700 leading-relaxed font-semibold mb-2">
                  Behaviour beats motivation.
                </p>
                <p className="text-lg text-slate-700 leading-relaxed">
                  You don't need more willpower — you need better systems.
                </p>
              </div>
              <div>
                <p className="text-lg text-slate-700 leading-relaxed font-semibold mb-2">
                  Small wins create momentum.
                </p>
                <p className="text-lg text-slate-700 leading-relaxed">
                  Big financial change starts with tiny daily habits.
                </p>
              </div>
              <div>
                <p className="text-lg text-slate-700 leading-relaxed font-semibold mb-2">
                  Clarity brings confidence.
                </p>
                <p className="text-lg text-slate-700 leading-relaxed">
                  When you see where your money goes, you can finally steer it with intention.
                </p>
              </div>
              <div>
                <p className="text-lg text-slate-700 leading-relaxed font-semibold mb-2">
                  Freedom is the goal.
                </p>
                <p className="text-lg text-slate-700 leading-relaxed">
                  Financial control isn't about restriction — it's about choice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The BrightNest Approach */}
      <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-teal-50/20 to-slate-50"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-amber-100/30 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mt-4 mb-6 leading-tight">
                The BrightNest Approach
              </h2>
            </div>
            <div className="space-y-6">
              <p className="text-lg text-slate-700 leading-relaxed">
                We guide you through a clear, step-by-step process:
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-lg text-slate-700 leading-relaxed font-semibold mb-2">
                    Awareness
                  </p>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    — Understand your patterns and uncover what's really driving your financial behaviour.
                  </p>
                </div>
                <div>
                  <p className="text-lg text-slate-700 leading-relaxed font-semibold mb-2">
                    Control
                  </p>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    — Learn practical systems for budgeting, spending, saving, and paying off debt without friction.
                  </p>
                </div>
                <div>
                  <p className="text-lg text-slate-700 leading-relaxed font-semibold mb-2">
                    Momentum
                  </p>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    — Build habits that last — and create a lifestyle that aligns with your goals and values.
                  </p>
                </div>
              </div>
              <p className="text-lg text-slate-700 leading-relaxed">
                This isn't a crash course. It's a transformation.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed font-semibold">
                Our clients don't just fix their finances — they reshape how they think, act, and feel about money.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Vision */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mt-4 mb-6 leading-tight">
                Our Vision
              </h2>
            </div>
            <div className="space-y-6 text-center">
              <p className="text-lg text-slate-700 leading-relaxed">
                To make behaviour change in personal finance as accessible and natural as fitness coaching.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed font-semibold">
                Because when people feel in control of their money, everything else gets better — confidence, relationships, freedom, and peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join the Movement */}
      <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-amber-50/30"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-teal-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-100/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Join the Movement
            </h2>
          </div>
          <div className="space-y-6 text-center">
            <p className="text-lg text-slate-700 leading-relaxed">
              BrightNest isn't about quick fixes.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed font-semibold">
              It's about rewriting your story with money — for good.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              If you're ready to break the cycle of stress, guilt, and confusion…
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              and finally build a financial system that fits you —
            </p>
            <p className="text-xl sm:text-2xl text-slate-900 leading-relaxed font-semibold">
              Welcome to BrightNest.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12">
            <div>
              <Link href="/" className="text-2xl font-bold text-white mb-6 block">
                BrightNest
              </Link>
              <div className="flex space-x-4">
                <a href="https://twitter.com/brightnest" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="Twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="https://facebook.com/brightnest" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://instagram.com/brightnest" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
                <a href="https://youtube.com/@brightnest" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="YouTube">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide mb-4 text-white">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/" className="text-slate-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/about" className="text-slate-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/blog" className="text-slate-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="text-slate-400 hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide mb-4 text-white">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/quiz/financial-profile" className="text-slate-400 hover:text-white transition-colors">Take the Quiz</Link></li>
                <li><Link href="/affiliates/signup" className="text-slate-400 hover:text-white transition-colors">Become a Partner</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide mb-4 text-white">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-400">
            © {new Date().getFullYear()} BrightNest Technologies LLC. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}


