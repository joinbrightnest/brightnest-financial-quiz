"use client";

import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* Hero Section - BetterHelp Style (Compact) */}
      <section className="relative overflow-hidden bg-[#faf9f6]">
        {/* Upper Light Section - More Compact */}
        <div className="relative pt-16 sm:pt-20 lg:pt-24 pb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
                About us
              </h1>
            </div>
          </div>
        </div>

        {/* Curved Wave Separator - Matching BetterHelp's Exact Curve */}
        <div className="relative w-full overflow-hidden" style={{ height: '65px', marginBottom: '-1px' }}>
          <svg 
            className="absolute bottom-0 w-full h-full" 
            viewBox="0 0 1440 110" 
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M0,0 L0,8 C200,8 400,12 600,35 C720,88 840,88 960,35 C1160,12 1360,8 1440,8 L1440,110 L0,110 Z" 
              fill="#0f766e"
            />
          </svg>
        </div>

        {/* Lower Dark Teal Section - Tighter Padding */}
        <div className="relative bg-teal-800 pt-8 sm:pt-10 lg:pt-12 pb-12 sm:pb-16 lg:pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Main Content - Compact Spacing */}
            <div className="space-y-4 text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-teal-300 leading-tight">
                Rebuild your relationship with money
              </h2>
              
              <div className="space-y-4 text-base sm:text-lg text-white/90 leading-relaxed text-left">
                <p>
                  BrightNest was founded to remove the traditional barriers to financial wellness and make behavior-based money management accessible to everyone.
                </p>
                <p>
                  Money isn&apos;t just numbers. It&apos;s emotion, habit, and identity — all tangled together.
                </p>
                <p>
                  Most people don&apos;t struggle because they don&apos;t know what to do. They struggle because they can&apos;t make themselves do it consistently.
                </p>
                <p className="font-medium text-white">
                  That&apos;s where BrightNest comes in. We combine psychology, structure, and guidance from certified experts to help you take back control of your money — step by step, without guilt or overwhelm.
                </p>
                <p>
                  As the need for accessible financial behavior change continues to grow, BrightNest is committed to expanding access to proven financial wellness systems globally.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section - Enhanced Card Design */}
      <section className="relative py-20 sm:py-24 lg:py-28 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-white"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-50/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-semibold text-teal-600 uppercase tracking-wider bg-teal-50/80 backdrop-blur-sm px-5 py-2.5 rounded-full border border-teal-100 shadow-sm mb-6">
                Our Mission
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mt-6 mb-8 leading-tight tracking-tight">
                Our Mission
              </h2>
            </div>
            
            {/* Enhanced Mission Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-amber-400/10 rounded-3xl blur-2xl transform scale-105"></div>
              <div className="relative bg-white rounded-3xl p-10 sm:p-14 lg:p-16 border border-slate-200/80 shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-amber-400 to-teal-500 rounded-t-3xl"></div>
                <div className="space-y-6 relative z-10">
                  <p className="text-2xl sm:text-3xl text-slate-900 leading-relaxed font-medium">
                    At BrightNest, our mission is simple:
                  </p>
                  <p className="text-2xl sm:text-3xl text-teal-700 leading-relaxed font-bold">
                    to help people change their financial behaviour for good.
                  </p>
                  <div className="pt-6 border-t border-slate-200 space-y-5">
                    <p className="text-lg sm:text-xl text-slate-700 leading-relaxed">
                      We combine psychology, structure, and guidance from certified experts to help you take back control of your money — step by step, without guilt or overwhelm.
                    </p>
                    <p className="text-lg sm:text-xl text-slate-700 leading-relaxed">
                      We don&apos;t just teach budgeting.
                    </p>
                    <p className="text-lg sm:text-xl text-slate-700 leading-relaxed">
                      We help you understand why you spend, how to change your habits, and what systems actually keep you consistent.
                    </p>
                    <p className="text-lg sm:text-xl text-slate-700 leading-relaxed">
                      The goal isn&apos;t perfection.
                    </p>
                    <p className="text-lg sm:text-xl text-slate-700 leading-relaxed font-semibold text-teal-700">
                      It&apos;s progress — and freedom.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes BrightNest Different - Enhanced Grid */}
      <section className="relative py-20 sm:py-24 lg:py-28 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-50/50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-50/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold text-teal-600 uppercase tracking-wider bg-teal-50/80 backdrop-blur-sm px-5 py-2.5 rounded-full border border-teal-100 shadow-sm mb-6">
              What Makes Us Different
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mt-6 mb-6 max-w-4xl mx-auto leading-tight tracking-tight">
              What Makes BrightNest Different
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Most financial advice focuses on spreadsheets, apps, or tips. We focus on human behaviour.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
            {[
              {
                title: "Behavioural Science",
                description: "Because lasting change starts with mindset.",
                icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              },
              {
                title: "Proven Frameworks",
                description: "To simplify decisions and remove guesswork.",
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              },
              {
                title: "Accountability & Coaching",
                description: "To help you follow through, not just plan.",
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              },
              {
                title: "Clear Tracking Dashboards",
                description: "So you can see your progress in real time.",
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="group relative bg-white rounded-2xl p-8 border border-slate-200/80 hover:border-teal-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-50 to-transparent rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="flex items-start space-x-5 relative z-10">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors">{item.title}</h3>
                    <p className="text-base text-slate-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="max-w-4xl mx-auto text-center bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 shadow-lg">
            <p className="text-xl text-slate-700 leading-relaxed mb-3">
              You don&apos;t need to become a finance expert.
            </p>
            <p className="text-xl text-slate-700 leading-relaxed font-semibold text-teal-700">
              You just need the right environment, habits, and support — that&apos;s what BrightNest gives you.
            </p>
          </div>
        </div>
      </section>

      {/* Why We Exist - Storytelling Section */}
      <section className="relative py-20 sm:py-24 lg:py-28 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/20 to-white"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight tracking-tight">
                Why We Exist
              </h2>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-10 sm:p-14 border border-slate-200/80 shadow-xl space-y-6">
              <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed">
                Because money stress is one of the biggest causes of anxiety, conflict, and lost potential in people&apos;s lives.
              </p>
              <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed">
                We&apos;ve seen what happens when people live paycheck to paycheck, avoid their bank apps, or feel trapped by debt.
              </p>
              <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed">
                It&apos;s not about lacking discipline — it&apos;s about lacking a system that works with your behaviour, not against it.
              </p>
              <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed font-semibold text-teal-700 pt-4 border-t border-slate-200">
                BrightNest was built to change that — to make personal finance feel clear, actionable, and empowering again.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Believe - Enhanced Grid */}
      <section className="relative py-20 sm:py-24 lg:py-28 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight tracking-tight">
                What We Believe
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Behaviour beats motivation.",
                  description: "You don't need more willpower — you need better systems."
                },
                {
                  title: "Small wins create momentum.",
                  description: "Big financial change starts with tiny daily habits."
                },
                {
                  title: "Clarity brings confidence.",
                  description: "When you see where your money goes, you can finally steer it with intention."
                },
                {
                  title: "Freedom is the goal.",
                  description: "Financial control isn't about restriction — it's about choice."
                }
              ].map((belief, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 border border-slate-200/80 hover:border-teal-300 hover:shadow-lg transition-all duration-300">
                  <p className="text-xl font-bold text-slate-900 mb-3 text-teal-700">
                    {belief.title}
                  </p>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    {belief.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The BrightNest Approach - Process Section */}
      <section className="relative py-20 sm:py-24 lg:py-28 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-teal-50/10 to-white"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-amber-100/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight tracking-tight">
                The BrightNest Approach
              </h2>
            </div>
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-10 sm:p-14 border border-slate-200/80 shadow-xl space-y-8">
              <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed">
                We guide you through a clear, step-by-step process:
              </p>
              <div className="space-y-6 pt-6 border-t border-slate-200">
                {[
                  {
                    step: "Awareness",
                    description: "Understand your patterns and uncover what's really driving your financial behaviour."
                  },
                  {
                    step: "Control",
                    description: "Learn practical systems for budgeting, spending, saving, and paying off debt without friction."
                  },
                  {
                    step: "Momentum",
                    description: "Build habits that last — and create a lifestyle that aligns with your goals and values."
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-xl font-bold text-slate-900 mb-2 text-teal-700">
                        {item.step}
                      </p>
                      <p className="text-lg text-slate-700 leading-relaxed">
                        — {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t border-slate-200 space-y-4">
                <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed">
                  This isn&apos;t a crash course. It&apos;s a transformation.
                </p>
                <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed font-semibold text-teal-700">
                  Our clients don&apos;t just fix their finances — they reshape how they think, act, and feel about money.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Vision - Final CTA Section */}
      <section className="relative py-20 sm:py-24 lg:py-28 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-50/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-50/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block text-xs font-semibold text-teal-600 uppercase tracking-wider bg-teal-50/80 backdrop-blur-sm px-5 py-2.5 rounded-full border border-teal-100 shadow-sm mb-6">
              Our Vision
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight tracking-tight">
              Our Vision
            </h2>
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 sm:p-14 border border-slate-200/80 shadow-xl space-y-6">
              <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed">
                To make behaviour change in personal finance as accessible and natural as fitness coaching.
              </p>
              <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed font-semibold text-teal-700">
                Because when people feel in control of their money, everything else gets better — confidence, relationships, freedom, and peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join the Movement - Final CTA */}
      <section className="relative py-20 sm:py-24 lg:py-28 overflow-hidden bg-gradient-to-br from-teal-50 via-white to-amber-50/30">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-teal-100/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-100/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-10 leading-tight tracking-tight">
              Join the Movement
            </h2>
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 sm:p-14 border border-slate-200/80 shadow-2xl space-y-6">
              <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed">
                BrightNest isn&apos;t about quick fixes.
              </p>
              <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed font-semibold text-teal-700">
                It&apos;s about rewriting your story with money — for good.
              </p>
              <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed">
                If you&apos;re ready to break the cycle of stress, guilt, and confusion…
              </p>
              <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed">
                and finally build a financial system that fits you —
              </p>
              <div className="pt-6">
                <p className="text-2xl sm:text-3xl text-slate-900 leading-relaxed font-bold">
                  Welcome to BrightNest.
                </p>
              </div>
              <div className="pt-8">
                <Link
                  href="/quiz/financial-profile"
                  className="inline-block bg-gradient-to-r from-teal-600 to-teal-700 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:from-teal-700 hover:to-teal-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 relative overflow-hidden group"
                >
                  <span className="relative z-10">Get Started</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                </Link>
              </div>
            </div>
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
