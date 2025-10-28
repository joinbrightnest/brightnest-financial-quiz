"use client";

import Link from "next/link";
import { useState } from "react";

export default function CareersPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const testimonials = [
    {
      name: "Sarah Johnson",
      title: "Financial Coach",
      quote: "Working at BrightNest has been transformational. Every day, I help women break free from financial stress and build real wealth. The culture here is supportive, growth-oriented, and genuinely committed to making a difference in people's lives."
    },
    {
      name: "Emily Chen",
      title: "Client Success Manager",
      quote: "BrightNest is more than a workplace—it's a community. I've grown both professionally and personally, learning from brilliant colleagues while helping clients achieve financial freedom. The remote culture feels close-knit, and leadership truly cares about our development."
    },
    {
      name: "Lisa Martinez",
      title: "Senior Financial Advisor",
      quote: "I love what I do at BrightNest because I see the real impact every single day. When a client tells me they paid off their debt or built their first emergency fund, that's everything. This team celebrates those wins together, and it's incredibly fulfilling."
    },
    {
      name: "Amanda Brooks",
      title: "Enrollment Advisor",
      quote: "Joining BrightNest was one of the best career decisions I've made. The training is world-class, the team is supportive, and the mission is clear: empower women to take control of their financial futures. I wake up excited to come to work every day."
    }
  ];

  const coreValues = [
    {
      icon: "🎯",
      title: "Future-Focused",
      description: "Long-term financial freedom instead of short-term quick fixes."
    },
    {
      icon: "💪",
      title: "Extreme Ownership",
      description: "We own our results. There's no one else to blame for our success or failure."
    },
    {
      icon: "💎",
      title: "Radical Transparency",
      description: "Honesty, especially when difficult, builds trust and informed decision-making."
    },
    {
      icon: "⭐",
      title: "World-Class Standards",
      description: "Excellence is our standard in everything we do and offer."
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

  const benefits = [
    "Generous & flexible time off",
    "Four paid holidays",
    "Medical, dental, & vision benefits",
    "401k & Company match",
    "Fully remote work environment"
  ];

  return (
    <div className="min-h-screen bg-[#faf8f0]">
      {/* Navigation - Same as other pages */}
      <nav className="bg-[#F8F7F0] border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo - Left Side */}
            <div className="flex items-center">
              <Link href="/" className="text-xl sm:text-2xl font-bold text-gray-900">
                BrightNest
              </Link>
            </div>
            
            {/* Desktop Menu Items */}
            <div className="hidden lg:flex items-center flex-1 justify-center space-x-8">
              <Link href="/about" className="text-gray-900 font-medium text-sm uppercase tracking-wide hover:text-gray-700 transition-colors">
                ABOUT US
              </Link>
              <Link href="/blog" className="text-gray-900 font-medium text-sm uppercase tracking-wide hover:text-gray-700 transition-colors">
                BLOG
              </Link>
              <Link href="/careers" className="text-gray-900 font-medium text-sm uppercase tracking-wide hover:text-gray-700 transition-colors">
                CAREERS
              </Link>
            </div>
            
            {/* Right Side Items */}
            <div className="hidden lg:flex items-center">
              <Link href="/quiz/financial-profile" className="bg-[#1ABC9C] text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-[#16a085] transition-colors">
                Learn More
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-900 hover:text-gray-700 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden bg-[#F8F7F0] border-t border-gray-300">
              <div className="px-4 py-4 space-y-4">
                <Link href="/about" className="block text-gray-900 font-medium text-sm uppercase" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
                <Link href="/blog" className="block text-gray-900 font-medium text-sm uppercase" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
                <Link href="/careers" className="block text-gray-900 font-medium text-sm uppercase" onClick={() => setIsMobileMenuOpen(false)}>Careers</Link>
                <div className="pt-4 border-t border-gray-300">
                  <Link href="/quiz/financial-profile" className="block w-full bg-[#1ABC9C] text-white px-4 py-3 rounded-md font-medium text-sm text-center" onClick={() => setIsMobileMenuOpen(false)}>
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gray-900 text-white py-16 sm:py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black uppercase mb-6 sm:mb-8 leading-tight">
            Join Our Team.<br />
            <span className="text-pink-500">Empower Women.</span><br />
            Transform Lives.
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed">
            At BrightNest, we're on a mission to inspire and empower women to achieve their financial, wealth, and life goals. Join a passionate, driven team that's changing lives every day—one transformation at a time.
          </p>

          <p className="text-lg sm:text-xl font-semibold mb-6 sm:mb-8">Ready to make an impact?</p>

          <Link
            href="#positions"
            className="inline-block bg-pink-500 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-md font-bold text-base sm:text-lg uppercase hover:bg-pink-600 transition-colors"
          >
            Apply Now
          </Link>

          {/* Headshots */}
          <div className="flex justify-center items-center space-x-4 sm:space-x-6 mt-12 sm:mt-16">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-blue-400 to-teal-400"></div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"></div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-green-400 to-teal-400"></div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-orange-400 to-red-400"></div>
          </div>
        </div>
      </section>

      {/* Your Next Big Career Shift */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-sm sm:text-base text-gray-500 uppercase tracking-wide mb-3">Are you Ready?</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Your Next Big Career Shift
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Join BrightNest, where passionate innovators transform women's financial lives. We foster a supportive, inclusive environment, pushing boundaries and empowering women worldwide.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 sm:p-8 border border-gray-200">
                <div className="mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-pink-500 font-medium">{testimonial.title}</p>
                </div>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[#faf8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-sm sm:text-base text-gray-500 uppercase tracking-wide mb-3">The Values That Guide Us</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              BrightNest Core Values
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {coreValues.map((value, index) => (
              <div key={index} className="bg-white rounded-xl p-6 sm:p-8 text-center border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="text-4xl sm:text-5xl mb-4">{value.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perks Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-sm sm:text-base text-gray-500 uppercase tracking-wide mb-3">Just A Few Perks of Working With BrightNest</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Your BrightNest Journey Starts Here
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {perks.map((perk, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 sm:p-8 border border-gray-200">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{perk.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{perk.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What It's Like To Work With Us */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[#faf8f0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-sm sm:text-base text-gray-500 uppercase tracking-wide mb-3">What It's Like To</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 lowercase">
              work with us
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-8 sm:p-12 border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-base sm:text-lg text-gray-900 font-medium">{benefit}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="#positions"
                className="inline-block bg-pink-500 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-md font-bold text-base sm:text-lg uppercase hover:bg-pink-600 transition-colors"
              >
                See Positions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="positions" className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Ready to Join Our Team?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            We're always looking for talented individuals who are passionate about empowering women and making a real difference. Send us your resume and let's start a conversation.
          </p>
          <a
            href="mailto:careers@joinbrightnest.com"
            className="inline-block bg-gradient-to-r from-blue-600 to-teal-500 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-md font-bold text-base sm:text-lg hover:from-blue-700 hover:to-teal-600 transition-colors"
          >
            Apply Now
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
            {/* Logo and Social */}
            <div>
              <Link href="/" className="text-2xl font-bold text-white mb-6 block">
                BrightNest
              </Link>
              <div className="flex space-x-4">
                <a href="https://twitter.com/brightnest" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="https://facebook.com/brightnest" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://instagram.com/brightnest" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
                <a href="https://youtube.com/@brightnest" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-gray-300 hover:text-white">Home</Link></li>
                <li><Link href="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
                <li><Link href="/blog" className="text-gray-300 hover:text-white">Blog</Link></li>
                <li><Link href="/careers" className="text-gray-300 hover:text-white">Careers</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/quiz/financial-profile" className="text-gray-300 hover:text-white">Take the Quiz</Link></li>
                <li><Link href="/affiliates/signup" className="text-gray-300 hover:text-white">Become a Partner</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="text-gray-300 hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} BrightNest Technologies LLC. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

