"use client";

import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* Hero Section - Exact BetterHelp Structure */}
      <section className="relative">
        {/* Light Section with Title */}
        <div className="relative pt-12 sm:pt-16 lg:pt-20 pb-12 sm:pb-16 bg-[#faf9f6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-slate-900 leading-tight tracking-tight">
                About us
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
              fill="#0f766e"
            />
          </svg>
        </div>

        {/* Dark Teal Section - Main Content */}
        <div className="relative overflow-hidden" style={{ backgroundColor: '#0f766e' }}>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-14 pb-16 sm:pb-20">
            {/* Sub-navigation Tabs - Centered like BetterHelp */}
            <div className="flex flex-wrap justify-center gap-6 mb-8 sm:mb-10">
              <Link href="/about" className="text-sm text-teal-300 border-b-2 border-teal-300 pb-1.5 font-light">
                About
              </Link>
              <Link href="/careers" className="text-sm text-white/70 hover:text-white pb-1.5 border-b-2 border-transparent hover:border-white/30 transition-colors font-light">
                Careers
              </Link>
              <Link href="/about" className="text-sm text-white/70 hover:text-white pb-1.5 border-b-2 border-transparent hover:border-white/30 transition-colors font-light">
                Social impact
              </Link>
              <Link href="/about" className="text-sm text-white/70 hover:text-white pb-1.5 border-b-2 border-transparent hover:border-white/30 transition-colors font-light">
                Client outcomes
              </Link>
              <Link href="/about" className="text-sm text-white/70 hover:text-white pb-1.5 border-b-2 border-transparent hover:border-white/30 transition-colors font-light">
                Responsible AI
              </Link>
            </div>

            {/* Main Heading - Thin and stylish like BetterHelp */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-teal-300 text-center mb-6 sm:mb-8 leading-tight tracking-tight">
              Rebuild your relationship with money
            </h2>
            
            {/* Body Text - Light weight, stylish */}
            <div className="max-w-3xl mx-auto">
              <p className="text-base sm:text-lg text-white/90 leading-relaxed font-light">
                BrightNest was founded to remove the traditional barriers to financial wellness and make behavior-based money management accessible to everyone. Today, it is the world&apos;s leading financial behavior change platform — providing professional, affordable, and personalized financial guidance in a convenient online format. BrightNest&apos;s network of certified financial coaches has helped thousands of people take ownership of their financial health and work towards their personal goals. As the unmet need for accessible financial behavior change continues to grow, BrightNest is committed to expanding access to proven financial wellness systems globally.
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
              <path 
                d="M0,70 L0,65 C360,65 720,20 1080,20 C1320,20 1440,65 1440,65 L1440,70 Z" 
                fill="#faf9f6"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Our Coaches/Experts Section - Matching BetterHelp's "Our therapists" */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-[#faf9f6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <h2 className="text-3xl sm:text-4xl font-light text-slate-900 text-center mb-6 tracking-tight">
            Our coaches
          </h2>
          <p className="text-base sm:text-lg text-slate-700 text-center leading-relaxed font-light">
            BrightNest offers access to licensed, trained, experienced, and accredited financial coaches, certified financial planners (CFP), behavioral finance specialists, and certified financial counselors who help you build lasting financial habits.
          </p>
          <div className="text-center mt-8">
            <Link
              href="/quiz/financial-profile"
              className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg font-light text-base hover:bg-teal-700 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-light text-slate-900 text-center mb-6 tracking-tight">
            Our Mission
          </h2>
          <div className="space-y-4 text-base sm:text-lg text-slate-700 leading-relaxed font-light">
            <p className="font-normal text-slate-900">
              At BrightNest, our mission is simple: to help people change their financial behaviour for good.
            </p>
            <p>
              We combine psychology, structure, and guidance from certified experts to help you take back control of your money — step by step, without guilt or overwhelm.
            </p>
            <p>
              We don&apos;t just teach budgeting. We help you understand why you spend, how to change your habits, and what systems actually keep you consistent.
            </p>
            <p className="font-normal text-slate-900">
              The goal isn&apos;t perfection. It&apos;s progress — and freedom.
            </p>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-light text-slate-900 text-center mb-4 tracking-tight">
            What Makes BrightNest Different
          </h2>
          <p className="text-base sm:text-lg text-slate-600 text-center mb-8 leading-relaxed font-light">
            Most financial advice focuses on spreadsheets, apps, or tips. We focus on human behaviour.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {[
              {
                title: "Behavioural Science",
                description: "Because lasting change starts with mindset."
              },
              {
                title: "Proven Frameworks",
                description: "To simplify decisions and remove guesswork."
              },
              {
                title: "Accountability & Coaching",
                description: "To help you follow through, not just plan."
              },
              {
                title: "Clear Tracking Dashboards",
                description: "So you can see your progress in real time."
              }
            ].map((item, index) => (
              <div key={index} className="bg-white p-5 rounded-lg border border-slate-200">
                <h3 className="text-lg font-light text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 font-light">{item.description}</p>
              </div>
            ))}
          </div>

          <p className="text-base sm:text-lg text-slate-700 text-center leading-relaxed font-light">
            You don&apos;t need to become a finance expert. You just need the right environment, habits, and support — that&apos;s what BrightNest gives you.
          </p>
        </div>
      </section>

      {/* Why We Exist */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-light text-slate-900 text-center mb-6 tracking-tight">
            Why We Exist
          </h2>
          <div className="space-y-4 text-base sm:text-lg text-slate-700 leading-relaxed font-light">
            <p>
              Because money stress is one of the biggest causes of anxiety, conflict, and lost potential in people&apos;s lives.
            </p>
            <p>
              We&apos;ve seen what happens when people live paycheck to paycheck, avoid their bank apps, or feel trapped by debt.
            </p>
            <p>
              It&apos;s not about lacking discipline — it&apos;s about lacking a system that works with your behaviour, not against it.
            </p>
            <p className="font-normal text-slate-900">
              BrightNest was built to change that — to make personal finance feel clear, actionable, and empowering again.
            </p>
          </div>
        </div>
      </section>

      {/* What We Believe */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-light text-slate-900 text-center mb-6 tracking-tight">
            What We Believe
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div key={index} className="bg-white p-5 rounded-lg border border-slate-200">
                <p className="text-lg font-light text-slate-900 mb-2">{belief.title}</p>
                <p className="text-sm text-slate-600 font-light">{belief.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The BrightNest Approach */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-light text-slate-900 text-center mb-6 tracking-tight">
            The BrightNest Approach
          </h2>
          <div className="space-y-4 text-base sm:text-lg text-slate-700 leading-relaxed font-light">
            <p>
              We guide you through a clear, step-by-step process:
            </p>
            <div className="space-y-3">
              <div>
                <p className="font-normal text-slate-900 mb-1">Awareness</p>
                <p className="text-slate-600">— Understand your patterns and uncover what&apos;s really driving your financial behaviour.</p>
              </div>
              <div>
                <p className="font-normal text-slate-900 mb-1">Control</p>
                <p className="text-slate-600">— Learn practical systems for budgeting, spending, saving, and paying off debt without friction.</p>
              </div>
              <div>
                <p className="font-normal text-slate-900 mb-1">Momentum</p>
                <p className="text-slate-600">— Build habits that last — and create a lifestyle that aligns with your goals and values.</p>
              </div>
            </div>
            <p className="mt-4">
              This isn&apos;t a crash course. It&apos;s a transformation.
            </p>
            <p className="font-normal text-slate-900">
              Our clients don&apos;t just fix their finances — they reshape how they think, act, and feel about money.
            </p>
          </div>
        </div>
      </section>

      {/* Our Vision */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-light text-slate-900 text-center mb-6 tracking-tight">
            Our Vision
          </h2>
          <div className="space-y-4 text-base sm:text-lg text-slate-700 leading-relaxed font-light">
            <p>
              To make behaviour change in personal finance as accessible and natural as fitness coaching.
            </p>
            <p className="font-normal text-slate-900">
              Because when people feel in control of their money, everything else gets better — confidence, relationships, freedom, and peace of mind.
            </p>
          </div>
        </div>
      </section>

      {/* Join the Movement */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-light text-slate-900 text-center mb-6 tracking-tight">
            Join the Movement
          </h2>
          <div className="space-y-4 text-base sm:text-lg text-slate-700 leading-relaxed font-light">
            <p>
              BrightNest isn&apos;t about quick fixes. It&apos;s about rewriting your story with money — for good.
            </p>
            <p>
              If you&apos;re ready to break the cycle of stress, guilt, and confusion and finally build a financial system that fits you —
            </p>
            <p className="font-normal text-slate-900 text-lg">
              Welcome to BrightNest.
            </p>
            <div className="text-center pt-4">
              <Link
                href="/quiz/financial-profile"
                className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg font-light text-base hover:bg-teal-700 transition-colors"
              >
                Get Started
              </Link>
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
