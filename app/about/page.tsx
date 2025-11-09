"use client";

import { useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

type TabType = 'about' | 'social-impact' | 'client-outcomes';

interface TabContent {
  title: string;
  heading: string;
  body: string;
}

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<TabType>('about');

  const tabContents: Record<TabType, TabContent> = {
    'about': {
      title: 'About us',
      heading: 'Rebuild your relationship with money',
      body: 'BrightNest was founded to remove the traditional barriers to financial wellness and make behavior-based money management accessible to everyone. Today, it is the world\'s leading financial behavior change platform — providing professional, affordable, and personalized financial guidance in a convenient online format. BrightNest\'s network of certified financial coaches has helped thousands of people take ownership of their financial health and work towards their personal goals. As the unmet need for accessible financial behavior change continues to grow, BrightNest is committed to expanding access to proven financial wellness systems globally.'
    },
    'social-impact': {
      title: 'Social impact',
      heading: 'Making financial wellness accessible to everyone',
      body: 'Financial stress affects millions of people, regardless of income level. At BrightNest, we believe that everyone deserves access to the tools and support needed to build a healthier relationship with money. We partner with nonprofit organizations, community groups, and employers to bring our proven financial behavior change programs to underserved communities. Through our financial aid programs, we\'ve provided discounted and free access to thousands of individuals who otherwise couldn\'t afford professional financial coaching. We\'re committed to breaking down barriers and making financial wellness a reality for all.'
    },
    'client-outcomes': {
      title: 'Client outcomes',
      heading: 'Real results from real people',
      body: 'Our approach works. Thousands of BrightNest clients have transformed their financial lives through our behavior-based coaching and support systems. On average, clients see significant improvements in their financial confidence, debt reduction, and savings habits within the first 90 days. But more importantly, they report feeling less stressed about money, more in control of their financial decisions, and better equipped to build lasting financial habits. We measure our success not just by numbers, but by the profound impact on our clients\' lives — from reduced financial anxiety to improved relationships and greater peace of mind.'
    }
  };

  const currentContent = tabContents[activeTab];

  const tabs: { id: TabType; label: string }[] = [
    { id: 'about', label: 'About' },
    { id: 'social-impact', label: 'Social impact' },
    { id: 'client-outcomes', label: 'Client outcomes' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* Hero Section - Exact BetterHelp Structure */}
      <section className="relative">
        {/* Light Section with Title - Fine fade gradient like BetterHelp */}
        <div 
          className="relative pt-12 sm:pt-16 lg:pt-20 pb-12 sm:pb-16" 
          style={{ 
            background: 'linear-gradient(to right, #FDFDFB 0%, #FCFCF9 50%, #FDFBF7 100%)'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 leading-tight tracking-tight">
                {currentContent.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Curved Wave - Single color, single curve */}
        <div className="relative w-full" style={{ height: '70px', marginTop: '-70px' }}>
          <svg 
            className="absolute top-0 left-0 w-full h-full" 
            viewBox="0 0 1440 70" 
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M0,0 L0,6 C360,6 720,50 1080,50 C1320,50 1440,6 1440,6 L1440,70 L0,70 Z" 
              fill="#335343"
            />
          </svg>
        </div>

        {/* Dark Green Section - Main Content */}
        <div className="relative overflow-hidden" style={{ backgroundColor: '#335343' }}>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-14 pb-16 sm:pb-20">
            {/* Sub-navigation Tabs - Centered */}
            <div className="flex flex-wrap justify-center gap-6 mb-8 sm:mb-10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-base pb-1.5 font-light transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-[#a6e09a]'
                      : 'border-transparent hover:border-[#a6e09a]'
                  }`}
                  style={{
                    color: activeTab === tab.id ? '#a6e09a' : 'white'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Main Heading - Light green color */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-center mb-6 sm:mb-8 leading-tight tracking-tight" style={{ color: '#a6e09a' }}>
              {currentContent.heading}
            </h2>
            
            {/* Body Text - Centered, pure white */}
            <div className="max-w-3xl mx-auto">
              <p className="text-base sm:text-lg text-white leading-relaxed font-light text-center">
                {currentContent.body}
              </p>
            </div>
          </div>

          {/* Curved Bottom Edge - Creates upward curve at bottom of dark section */}
          <div className="absolute bottom-0 left-0 w-full" style={{ height: '70px' }}>
            <svg 
              className="w-full h-full" 
              viewBox="0 0 1440 70" 
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="fadeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FDFDFB" />
                  <stop offset="50%" stopColor="#FCFCF9" />
                  <stop offset="100%" stopColor="#FDFBF7" />
                </linearGradient>
              </defs>
              <path 
                d="M0,70 L0,65 C360,65 720,20 1080,20 C1320,20 1440,65 1440,65 L1440,70 Z" 
                fill="url(#fadeGradient)"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Our Coaches/Experts Section - Matching BetterHelp's "Our therapists" - Only show for About tab */}
      {activeTab === 'about' && (
        <section 
          className="relative py-12 sm:py-16 lg:py-20" 
          style={{ 
            background: 'linear-gradient(to right, #FDFDFB 0%, #FCFCF9 50%, #FDFBF7 100%)'
          }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-light text-slate-900 text-center mb-6 tracking-tight">
              Our coaches
            </h2>
            <p className="text-base sm:text-lg text-slate-700 text-center leading-relaxed font-light">
              BrightNest offers access to licensed, trained, experienced, and accredited financial coaches, certified financial planners (CFP), behavioral finance specialists, and certified financial counselors who help you build lasting financial habits.
            </p>
            <div className="text-center mt-8">
              <Link
                href="/quiz/financial-profile"
                className="inline-block px-6 py-3 rounded-lg font-light text-base text-white hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
                style={{ backgroundColor: '#3D6B54' }}
              >
                Get started
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Conditional Content Based on Active Tab */}
      {activeTab === 'about' && (
        <>
          {/* Our Mission Section - Redesigned */}
      <section className="relative py-16 sm:py-20 lg:py-24" style={{ background: 'linear-gradient(to right, #FDFDFB 0%, #FCFCF9 50%, #FDFBF7 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-6 tracking-tight">
              Our Mission
            </h2>
            <div className="w-20 h-0.5 bg-[#3D6B54] mx-auto mb-8"></div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 lg:p-16 max-w-3xl mx-auto">
            <div className="space-y-6 text-base sm:text-lg text-slate-700 leading-relaxed font-light">
              <p className="text-xl sm:text-2xl font-light text-slate-900 text-center" style={{ color: '#3D6B54' }}>
                At BrightNest, our mission is simple: to help people change their financial behaviour for good.
              </p>
              
              <div className="pt-6 space-y-5">
                <p>
                  We combine psychology, structure, and guidance from certified experts to help you take back control of your money — step by step, without guilt or overwhelm.
                </p>
                <p>
                  We don&apos;t just teach budgeting. We help you understand why you spend, how to change your habits, and what systems actually keep you consistent.
                </p>
                <p className="text-center pt-4 font-normal text-slate-900 text-lg">
                  The goal isn&apos;t perfection. It&apos;s progress — and freedom.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different - Redesigned */}
      <section className="relative py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-4 tracking-tight">
              What Makes BrightNest Different
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
              Most financial advice focuses on spreadsheets, apps, or tips. We focus on human behaviour.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
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
              <div key={index} className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-8 border border-slate-200 hover:border-[#3D6B54] hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3D6B54', opacity: 0.1 }}>
                      <svg className="w-6 h-6" style={{ color: '#3D6B54' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-light text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-600 font-light leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-center text-lg sm:text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed font-light">
            You don&apos;t need to become a finance expert. You just need the right environment, habits, and support — that&apos;s what BrightNest gives you.
          </p>
        </div>
      </section>

      {/* Why We Exist - Redesigned */}
      <section className="relative py-16 sm:py-20 lg:py-24" style={{ background: 'linear-gradient(to right, #FDFDFB 0%, #FCFCF9 50%, #FDFBF7 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-6 tracking-tight">
              Why We Exist
            </h2>
            <div className="w-20 h-0.5 bg-[#3D6B54] mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 text-base sm:text-lg text-slate-700 leading-relaxed font-light">
              <p>
                Because money stress is one of the biggest causes of anxiety, conflict, and lost potential in people&apos;s lives.
              </p>
              <p>
                We&apos;ve seen what happens when people live paycheck to paycheck, avoid their bank apps, or feel trapped by debt.
              </p>
              <p>
                It&apos;s not about lacking discipline — it&apos;s about lacking a system that works with your behaviour, not against it.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10">
              <p className="text-xl sm:text-2xl font-light leading-relaxed" style={{ color: '#3D6B54' }}>
                BrightNest was built to change that — to make personal finance feel clear, actionable, and empowering again.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Believe - Redesigned */}
      <section className="relative py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-6 tracking-tight">
              What We Believe
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Behaviour beats motivation.",
                description: "You don't need more willpower — you need better systems.",
                number: "01"
              },
              {
                title: "Small wins create momentum.",
                description: "Big financial change starts with tiny daily habits.",
                number: "02"
              },
              {
                title: "Clarity brings confidence.",
                description: "When you see where your money goes, you can finally steer it with intention.",
                number: "03"
              },
              {
                title: "Freedom is the goal.",
                description: "Financial control isn't about restriction — it's about choice.",
                number: "04"
              }
            ].map((belief, index) => (
              <div key={index} className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-8 border border-slate-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-light text-lg" style={{ backgroundColor: '#3D6B54' }}>
                      {belief.number}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xl font-light text-slate-900 mb-3">{belief.title}</p>
                    <p className="text-slate-600 font-light leading-relaxed">{belief.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The BrightNest Approach - Redesigned */}
      <section className="relative py-16 sm:py-20 lg:py-24" style={{ background: 'linear-gradient(to right, #FDFDFB 0%, #FCFCF9 50%, #FDFBF7 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-6 tracking-tight">
              The BrightNest Approach
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
              We guide you through a clear, step-by-step process:
            </p>
          </div>

          <div className="space-y-8 mb-12">
            {[
              {
                step: "Awareness",
                description: "Understand your patterns and uncover what's really driving your financial behaviour.",
                number: "1"
              },
              {
                step: "Control",
                description: "Learn practical systems for budgeting, spending, saving, and paying off debt without friction.",
                number: "2"
              },
              {
                step: "Momentum",
                description: "Build habits that last — and create a lifestyle that aligns with your goals and values.",
                number: "3"
              }
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-6 bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-light" style={{ backgroundColor: '#3D6B54' }}>
                    {item.number}
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-light text-slate-900 mb-3">{item.step}</h3>
                  <p className="text-slate-600 font-light leading-relaxed text-lg">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <p className="text-xl sm:text-2xl font-light text-slate-900 mb-4">
              This isn&apos;t a crash course. It&apos;s a transformation.
            </p>
            <p className="text-lg text-slate-600 font-light">
              Our clients don&apos;t just fix their finances — they reshape how they think, act, and feel about money.
            </p>
          </div>
        </div>
      </section>

      {/* Our Vision - Redesigned */}
      <section className="relative py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-6 tracking-tight">
              Our Vision
            </h2>
          </div>
          
          <div className="bg-gradient-to-br from-[#3D6B54] to-[#2d5a47] rounded-2xl shadow-2xl p-10 sm:p-12 lg:p-16 text-center">
            <p className="text-xl sm:text-2xl lg:text-3xl font-light text-white mb-6 leading-relaxed">
              To make behaviour change in personal finance as accessible and natural as fitness coaching.
            </p>
            <div className="w-24 h-0.5 bg-white/30 mx-auto mb-6"></div>
            <p className="text-lg sm:text-xl text-white/90 font-light leading-relaxed max-w-2xl mx-auto">
              Because when people feel in control of their money, everything else gets better — confidence, relationships, freedom, and peace of mind.
            </p>
          </div>
        </div>
      </section>

      {/* Join the Movement - Redesigned */}
      <section className="relative py-16 sm:py-20 lg:py-24" style={{ background: 'linear-gradient(to right, #FDFDFB 0%, #FCFCF9 50%, #FDFBF7 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-8 tracking-tight">
            Join the Movement
          </h2>
          
          <div className="bg-white rounded-2xl shadow-xl p-10 sm:p-12 lg:p-16 mb-8">
            <div className="space-y-6 text-base sm:text-lg text-slate-700 leading-relaxed font-light max-w-2xl mx-auto">
              <p className="text-xl sm:text-2xl font-light text-slate-900">
                BrightNest isn&apos;t about quick fixes. It&apos;s about rewriting your story with money — for good.
              </p>
              <p>
                If you&apos;re ready to break the cycle of stress, guilt, and confusion and finally build a financial system that fits you —
              </p>
              <p className="text-2xl sm:text-3xl font-light pt-4" style={{ color: '#3D6B54' }}>
                Welcome to BrightNest.
              </p>
            </div>
          </div>
          
          <Link
            href="/quiz/financial-profile"
            className="inline-block text-white px-8 py-4 rounded-xl font-light text-lg hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
            style={{ backgroundColor: '#3D6B54' }}
          >
            Get Started
          </Link>
        </div>
      </section>
        </>
      )}

      {/* Social Impact Tab Content */}
      {activeTab === 'social-impact' && (
        <>
          {/* Impact Stats Section */}
          <section className="relative py-16 sm:py-20 lg:py-24" style={{ background: 'linear-gradient(to right, #FDFDFB 0%, #FCFCF9 50%, #FDFBF7 100%)' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-6 tracking-tight">
                  Our Impact
                </h2>
                <div className="w-20 h-0.5 bg-[#3D6B54] mx-auto"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {[
                  {
                    value: "$500K+",
                    label: "Given in discounts and financial aid",
                    description: "To cover coaching costs for low-income individuals"
                  },
                  {
                    value: "2,000+",
                    label: "Free months of coaching",
                    description: "Donated to communities in need"
                  },
                  {
                    value: "50+",
                    label: "Partnership organizations",
                    description: "Working together to expand access"
                  }
                ].map((stat, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="text-4xl sm:text-5xl font-light mb-3" style={{ color: '#3D6B54' }}>
                      {stat.value}
                    </div>
                    <h3 className="text-lg font-light text-slate-900 mb-2">{stat.label}</h3>
                    <p className="text-sm text-slate-600 font-light">{stat.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Partnership Section */}
          <section className="relative py-16 sm:py-20 lg:py-24 bg-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-6 tracking-tight">
                  Our Partners
                </h2>
                <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
                  We partner with impactful organizations to bring financial wellness to underserved communities
                </p>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-lg p-10 sm:p-12">
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-light mb-8">
                  We partner with 100+ impactful non-profit organizations, community groups, and employers to donate free financial coaching to under-resourced communities and break down barriers to accessing financial wellness support.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    'Financial Wellness Alliance',
                    'Community Credit Union',
                    'Local Food Bank',
                    'Housing Assistance Network'
                  ].map((org, index) => (
                    <div key={index} className="bg-white rounded-lg p-6 border border-slate-200 text-center hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#3D6B54', opacity: 0.1 }}>
                        <svg className="w-6 h-6" style={{ color: '#3D6B54' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <p className="text-sm font-light text-slate-700">{org}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Commitment Section */}
          <section className="relative py-16 sm:py-20 lg:py-24" style={{ background: 'linear-gradient(to right, #FDFDFB 0%, #FCFCF9 50%, #FDFBF7 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-2xl shadow-xl p-10 sm:p-12 lg:p-16 text-center">
                <h2 className="text-2xl sm:text-3xl font-light text-slate-900 mb-6">
                  Our Commitment
                </h2>
                <p className="text-lg sm:text-xl text-slate-700 leading-relaxed font-light max-w-2xl mx-auto">
                  Financial stress doesn&apos;t discriminate, and neither should access to financial wellness. We&apos;re committed to making our programs accessible to everyone, regardless of their financial situation, and to partnering with organizations that share our mission of breaking down barriers to financial health.
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Client Outcomes Tab Content */}
      {activeTab === 'client-outcomes' && (
        <>
          {/* Results Overview Section */}
          <section className="relative py-16 sm:py-20 lg:py-24" style={{ background: 'linear-gradient(to right, #FDFDFB 0%, #FCFCF9 50%, #FDFBF7 100%)' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-6 tracking-tight">
                  Real Results
                </h2>
                <div className="w-20 h-0.5 bg-[#3D6B54] mx-auto"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {[
                  {
                    value: "85%",
                    label: "Report reduced financial stress",
                    description: "Within the first 90 days"
                  },
                  {
                    value: "70%",
                    label: "Increase savings",
                    description: "Average improvement in savings habits"
                  },
                  {
                    value: "90%",
                    label: "Feel more in control",
                    description: "Of their financial decisions"
                  }
                ].map((stat, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="text-4xl sm:text-5xl font-light mb-3" style={{ color: '#3D6B54' }}>
                      {stat.value}
                    </div>
                    <h3 className="text-lg font-light text-slate-900 mb-2">{stat.label}</h3>
                    <p className="text-sm text-slate-600 font-light">{stat.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Transformation Stories Section */}
          <section className="relative py-16 sm:py-20 lg:py-24 bg-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-6 tracking-tight">
                  Client Transformations
                </h2>
                <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
                  Real stories from real people who transformed their relationship with money
                </p>
              </div>

              <div className="space-y-8">
                {[
                  {
                    title: "From Overwhelm to Confidence",
                    description: "Sarah went from avoiding her bank account to confidently managing her finances and building an emergency fund for the first time in her life.",
                    metric: "Built $5,000 emergency fund in 6 months"
                  },
                  {
                    title: "Breaking the Paycheck-to-Paycheck Cycle",
                    description: "Michael eliminated $15,000 in credit card debt and learned to budget in a way that worked with his lifestyle, not against it.",
                    metric: "Debt-free in 18 months"
                  },
                  {
                    title: "From Anxiety to Peace of Mind",
                    description: "Jessica transformed her relationship with money from a source of constant stress to a tool for achieving her goals and creating security.",
                    metric: "Reduced financial anxiety by 90%"
                  }
                ].map((story, index) => (
                  <div key={index} className="bg-gradient-to-br from-slate-50 to-white rounded-xl shadow-md p-8 border border-slate-200">
                    <h3 className="text-xl sm:text-2xl font-light text-slate-900 mb-4">{story.title}</h3>
                    <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-light mb-4">
                      {story.description}
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3D6B54' }}></div>
                      <p className="text-sm font-light" style={{ color: '#3D6B54' }}>{story.metric}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Key Metrics Section */}
          <section className="relative py-16 sm:py-20 lg:py-24" style={{ background: 'linear-gradient(to right, #FDFDFB 0%, #FCFCF9 50%, #FDFBF7 100%)' }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-2xl shadow-xl p-10 sm:p-12 lg:p-16">
                <h2 className="text-2xl sm:text-3xl font-light text-slate-900 mb-8 text-center">
                  What Our Clients Achieve
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    {
                      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                      title: "Debt Reduction",
                      description: "Average debt reduction of 40% within the first year"
                    },
                    {
                      icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
                      title: "Savings Growth",
                      description: "Clients increase their savings by an average of 200%"
                    },
                    {
                      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                      title: "Financial Confidence",
                      description: "90% report feeling more confident about their financial future"
                    },
                    {
                      icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
                      title: "Relationship Impact",
                      description: "75% report improved relationships due to reduced money stress"
                    }
                  ].map((metric, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3D6B54', opacity: 0.1 }}>
                          <svg className="w-6 h-6" style={{ color: '#3D6B54' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={metric.icon} />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-light text-slate-900 mb-2">{metric.title}</h3>
                        <p className="text-slate-600 font-light leading-relaxed">{metric.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

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
