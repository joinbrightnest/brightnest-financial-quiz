"use client";

import { useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

type TabType = 'about' | 'careers' | 'social-impact' | 'client-outcomes';

interface TabContent {
  title: string;
  heading: string;
  body: string;
}

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showPositions, setShowPositions] = useState(false);

  const tabContents: Record<TabType, TabContent> = {
    'about': {
      title: 'About us',
      heading: 'Rebuild your relationship with money',
      body: 'BrightNest was founded to remove the traditional barriers to financial wellness and make behavior-based money management accessible to everyone. Today, it is the world\'s leading financial behavior change platform — providing professional, affordable, and personalized financial guidance in a convenient online format. BrightNest\'s network of certified financial coaches has helped thousands of people take ownership of their financial health and work towards their personal goals. As the unmet need for accessible financial behavior change continues to grow, BrightNest is committed to expanding access to proven financial wellness systems globally.'
    },
    'careers': {
      title: 'Careers',
      heading: 'Join our mission to transform financial lives',
      body: 'At BrightNest, we\'re building a team of passionate professionals who believe that financial wellness should be accessible to everyone. We combine psychology, technology, and human-centered design to help people change their relationship with money. If you\'re driven by impact, value collaboration, and want to work on meaningful problems that change lives, we\'d love to hear from you. We\'re growing fast and always looking for talented individuals who share our vision of making financial behavior change as natural and accessible as fitness coaching.'
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
    { id: 'careers', label: 'Careers' },
    { id: 'social-impact', label: 'Social impact' },
    { id: 'client-outcomes', label: 'Client outcomes' }
  ];

  const handleSeePositions = () => {
    setShowPositions(true);
    setTimeout(() => {
      document.getElementById('positions')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const testimonials = [
    {
      name: "Sarah Johnson",
      title: "Financial Coach",
      quote: "Working at BrightNest has been transformational. Every day, I help women break free from financial stress and build real wealth. The culture here is supportive, growth-oriented, and genuinely committed to making a difference in people's lives.",
      initials: "SJ",
    },
    {
      name: "Emily Chen",
      title: "Client Success Manager",
      quote: "BrightNest is more than a workplace—it's a community. I've grown both professionally and personally, learning from brilliant colleagues while helping clients achieve financial freedom. The remote culture feels close-knit, and leadership truly cares about our development.",
      initials: "EC",
    },
    {
      name: "Lisa Martinez",
      title: "Senior Financial Advisor",
      quote: "I love what I do at BrightNest because I see the real impact every single day. When a client tells me they paid off their debt or built their first emergency fund, that's everything. This team celebrates those wins together, and it's incredibly fulfilling.",
      initials: "LM",
    },
    {
      name: "Amanda Brooks",
      title: "Enrollment Advisor",
      quote: "Joining BrightNest was one of the best career decisions I've made. The training is world-class, the team is supportive, and the mission is clear: empower women to take control of their financial futures. I wake up excited to come to work every day.",
      initials: "AB",
    },
    {
      name: "Rachel Williams",
      title: "Customer Success Coordinator",
      quote: "From the moment I joined BrightNest, I was immersed in an empowering community that truly believes in creating lasting change in women's lives. The environment here is not only supportive but also continually evolving, fostering both personal and professional growth.",
      initials: "RW",
    },
    {
      name: "Maria Rodriguez",
      title: "VIP Coach",
      quote: "I absolutely love my role at BrightNest, helping women fulfill their potential through sustainable financial practices. Being part of a team of like-minded women and having the support in place when I need it is a total game-changer.",
      initials: "MR",
    }
  ];

  const coreValues = [
    {
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      title: "Clarity",
      description: "Making the complex simple, actionable and human."
    },
    {
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      title: "Courage",
      description: "Facing money fears, shifting behaviour and changing lives."
    },
    {
      icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
      title: "Consistency",
      description: "Because transformation is built by small wins over time."
    },
    {
      icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
      title: "Impact",
      description: "We measure success not by transactions but by changed lives."
    }
  ];

  const perks = [
    {
      title: "Your Life, Your Schedule",
      description: "Set your hours and prioritize your well-being. At BrightNest, we focus on results, not clock-ins, giving you the flexibility to thrive."
    },
    {
      title: "Unlimited Growth",
      description: "We're an innovative, fast-growing company with incredible career growth opportunities. Ready to make a difference and enjoy the rewards? Join us."
    },
    {
      title: "Work From Anywhere",
      description: "Our remote-first culture empowers you to work wherever you feel most productive—whether that's your home office or somewhere around the world."
    },
    {
      title: "Create Real Impact",
      description: "Your voice matters. Many of our best initiatives come from team ideas, and we can't wait to hear yours. Together, we're transforming lives."
    },
    {
      title: "Wellness Matters",
      description: "We've got you covered with health, dental, and life insurance plans available to all eligible US employees."
    },
    {
      title: "World-Class Team",
      description: "Work alongside passionate, driven individuals who are committed to excellence. At BrightNest, you'll collaborate with the best to achieve extraordinary results."
    }
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

      {/* Careers Tab Content */}
      {activeTab === 'careers' && (
        <>
          {/* Hero Section with Team Avatars and Apply Button */}
          <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden" style={{ background: 'linear-gradient(to right, #FDFDFB 0%, #FCFCF9 50%, #FDFBF7 100%)' }}>
            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light mb-6 leading-tight tracking-tight text-slate-900">
                Join the BrightNest Team
              </h2>
              
              <p className="text-base sm:text-lg text-slate-700 max-w-3xl mx-auto mb-8 leading-relaxed font-light">
                Change behaviour. Change lives. Build more than a job.
              </p>

              <button
                onClick={handleSeePositions}
                className="inline-block text-white px-8 py-3 rounded-lg font-light text-base hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl mb-12"
                style={{ backgroundColor: '#3D6B54' }}
              >
                Apply Now
              </button>

              {/* Team Member Avatars */}
              <div className="mt-12">
                <p className="text-sm text-slate-600 uppercase tracking-wide mb-6 font-light">Are You Ready?</p>
                <div className="flex justify-center items-center space-x-[-12px]">
                  {testimonials.slice(0, 4).map((testimonial, idx) => (
                    <div
                      key={idx}
                      className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center text-white font-light text-xs sm:text-sm lg:text-base border-2 border-white shadow-md"
                      style={{ backgroundColor: '#3D6B54', zIndex: 10 + idx }}
                    >
                      {testimonial.initials}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Our Mission Section */}
          <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden bg-white">
            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-6 tracking-tight">
                  Our Mission
                </h2>
                <div className="w-20 h-0.5 bg-[#3D6B54] mx-auto"></div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-8 sm:p-10 lg:p-12">
                <div className="space-y-5 text-base sm:text-lg text-slate-700 leading-relaxed font-light text-center">
                  <p>
                    At BrightNest, we&apos;re not just helping people manage money — we&apos;re guiding them to transform how they think, feel, and act about their finances.
                  </p>
                  <p style={{ color: '#3D6B54' }}>
                    We believe lasting change happens when the habits beneath the numbers are rewired. And we&apos;re building the team to make that possible.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Who We're Looking For Section */}
          <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden" style={{ background: 'linear-gradient(to right, #FDFDFB 0%, #FCFCF9 50%, #FDFBF7 100%)' }}>
            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-6 tracking-tight">
                  Who We&apos;re Looking For
                </h2>
                <div className="w-20 h-0.5 bg-[#3D6B54] mx-auto"></div>
              </div>
              <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8 sm:p-10 space-y-5">
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-light">
                  We want people who care deeply about human behaviour, real results and genuine impact. If you&apos;re someone who:
                </p>
                <ul className="text-left space-y-3 list-none">
                  <li className="flex items-start space-x-3">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#3D6B54' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-base sm:text-lg text-slate-700 font-light">believes in the power of clarity over confusion</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#3D6B54' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-base sm:text-lg text-slate-700 font-light">gets energy from helping others move from stuck → free</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#3D6B54' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-base sm:text-lg text-slate-700 font-light">wants to work in a team that values growth, integrity and transformation</span>
                  </li>
                </ul>
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-light pt-4 border-t border-slate-200" style={{ color: '#3D6B54' }}>
                  then you might be a perfect fit.
                </p>
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-light">
                  Whether your strength lies in coaching, operations, tech, content or client experience — there&apos;s an opportunity here to help build something meaningful.
                </p>
              </div>
            </div>

            {/* Testimonials Carousel */}
            <div className="relative max-w-4xl mx-auto mt-12">
              <div className="relative bg-white rounded-xl shadow-md p-8 sm:p-10 border border-slate-200 min-h-[280px] flex flex-col justify-between">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-light text-lg flex-shrink-0 shadow-md" style={{ backgroundColor: '#3D6B54' }}>
                    {testimonials[currentTestimonial].initials}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-light text-slate-900 mb-1">{testimonials[currentTestimonial].name}</h3>
                    <p className="text-base font-light" style={{ color: '#3D6B54' }}>{testimonials[currentTestimonial].title}</p>
                  </div>
                </div>
                
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed italic mb-8 flex-1 font-light">
                  &quot;{testimonials[currentTestimonial].quote}&quot;
                </p>

                {/* Navigation */}
                <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                  <div className="flex justify-center items-center space-x-2 flex-1">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`transition-all duration-300 rounded-full ${
                        index === currentTestimonial 
                            ? 'w-6 h-2' 
                            : 'w-2 h-2 bg-slate-300 hover:opacity-70'
                      }`}
                      style={index === currentTestimonial ? { backgroundColor: '#3D6B54' } : {}}
                      aria-label={`View testimonial ${index + 1}`}
                    />
                  ))}
                </div>
                  <div className="flex space-x-2">
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                      className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 border border-slate-200 transition-colors"
                aria-label="Previous testimonial"
              >
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                      className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 border border-slate-200 transition-colors"
                aria-label="Next testimonial"
              >
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Core Values Section */}
          <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden bg-white">
            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-6 tracking-tight">
                  Our Values
                </h2>
                <div className="w-20 h-0.5 bg-[#3D6B54] mx-auto"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {coreValues.map((value, index) => (
                  <div 
                    key={index} 
                    className="group relative bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition-all duration-300 text-center"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 shadow-sm relative z-10" style={{ backgroundColor: '#3D6B54', opacity: 0.9 }}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={value.icon} />
                      </svg>
                    </div>
                    <h3 className="text-lg font-light text-slate-900 mb-2 transition-colors relative z-10">{value.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-light relative z-10">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Perks Section */}
          <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden" style={{ background: 'linear-gradient(to right, #FDFDFB 0%, #FCFCF9 50%, #FDFBF7 100%)' }}>
            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-6 tracking-tight">
                  Your BrightNest Journey
                </h2>
                <div className="w-20 h-0.5 bg-[#3D6B54] mx-auto"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {perks.map((perk, index) => (
                  <div 
                    key={index} 
                    className="group relative bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition-all duration-300"
                  >
                    <h3 className="text-lg font-light text-slate-900 mb-3 transition-colors">{perk.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-light">{perk.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* What It's Like To Work With Us Section */}
          <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden bg-white">
            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-6 tracking-tight">
                  What It&apos;s Like To Work With Us
                </h2>
                <div className="w-20 h-0.5 bg-[#3D6B54] mx-auto"></div>
              </div>

              <div className="space-y-5 mb-8 max-w-3xl mx-auto">
                {[
                  "Purpose over process: Every role connects back to helping someone live with more financial freedom.",
                  "Team of experts: You'll work alongside certified behaviour & finance coaches, tech builders and change-makers.",
                  "Supportive culture: We value accountability, transparency, continuous learning and the courage to try new things.",
                  "Growth mindset: We're growing rapidly, and with growth comes opportunity — for you and for our clients."
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5" style={{ color: '#3D6B54' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-base sm:text-lg text-slate-700 font-light leading-relaxed">
                      <span className="font-light" style={{ color: '#3D6B54' }}>{item.split(':')[0]}:</span> {item.split(':').slice(1).join(':')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <button
                  onClick={handleSeePositions}
                  className="inline-block text-white px-8 py-3 rounded-lg font-light text-base hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
                  style={{ backgroundColor: '#3D6B54' }}
                >
                  See Positions
                </button>
              </div>
            </div>
          </section>

          {/* Positions Section */}
          {showPositions && (
            <section 
              id="positions" 
              className="relative py-12 sm:py-16 lg:py-20 overflow-hidden" 
              style={{ background: 'linear-gradient(to right, #FDFDFB 0%, #FCFCF9 50%, #FDFBF7 100%)' }}
            >
              <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative bg-white rounded-xl p-8 sm:p-10 lg:p-12 border border-slate-200 shadow-md">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-6 tracking-tight">
                      Roles & Opportunities
                    </h2>
                    <div className="w-20 h-0.5 bg-[#3D6B54] mx-auto"></div>
                  </div>
                  
                  <p className="text-base sm:text-lg text-slate-700 mb-6 max-w-2xl mx-auto leading-relaxed font-light text-center">
                    We have openings (or will have openings) across:
                  </p>

                  <ul className="text-base sm:text-lg text-slate-700 mb-8 max-w-2xl mx-auto leading-relaxed space-y-3 text-left list-disc list-inside font-light">
                    <li>Client Coaching & Behaviour Change Specialists</li>
                    <li>Marketing & Content Creators (focused on mindset & finance)</li>
                    <li>Operations & Client Success</li>
                    <li>Product & Technology (platforms, dashboards, data)</li>
                    <li>Partnerships & Growth</li>
                  </ul>

                  <p className="text-base sm:text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed italic font-light text-center">
                    (Even if you don&apos;t see your exact fit listed yet, we encourage you to apply — let&apos;s connect and find where your strengths meet our mission.)
                  </p>

                  <div className="mb-10 pt-8 border-t border-slate-200">
                    <h3 className="text-2xl sm:text-3xl font-light text-slate-900 mb-6 text-center">
                      Why Join Now
                    </h3>
                    <div className="space-y-4 text-base sm:text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed text-left font-light">
                      <p>This is more than a job-board listing. This is an invitation to join at a critical moment in our journey.</p>
                      <p>You&apos;ll have the chance to help shape our systems, culture and impact.</p>
                      <p>And in doing so, you&apos;ll build experience, mastery and fulfilment.</p>
                    </div>
                  </div>

                  <div className="mb-10 pt-8 border-t border-slate-200">
                    <h3 className="text-2xl sm:text-3xl font-light text-slate-900 mb-6 text-center">
                      How to Apply
                    </h3>
                    <div className="text-base sm:text-lg text-slate-700 mb-6 max-w-2xl mx-auto leading-relaxed space-y-4 text-left font-light">
                      <p>Email your CV (or LinkedIn) and a short note: <strong className="font-light" style={{ color: '#3D6B54' }}>Why does financial behaviour change matter to you?</strong></p>
                      <p>Include which role(s) interest you and how your skills align.</p>
                      <p>We&apos;ll respond quickly and share next steps: a chat + a short task so we can see if we&apos;re a great match.</p>
                      <p className="font-light" style={{ color: '#3D6B54' }}>
                        Send your application to <a href="mailto:careers@brightnest.com" className="underline hover:opacity-80">careers@brightnest.com</a>
                      </p>
                      <p className="text-sm text-slate-500 italic">
                        (We&apos;ll treat every application personally and appreciate your time.)
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <a
                      href="mailto:careers@brightnest.com"
                      className="inline-block text-white px-8 py-3 rounded-lg font-light text-base hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
                      style={{ backgroundColor: '#3D6B54' }}
                    >
                      Apply Now
                    </a>
                  </div>
                </div>
              </div>
            </section>
          )}
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
