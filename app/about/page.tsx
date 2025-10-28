"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function AboutPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTimelineIndex, setCurrentTimelineIndex] = useState(0);

  const stats = [
    { number: "10,000+", label: "Women Empowered" },
    { number: "15+", label: "Financial Coaches" },
    { number: "50+", label: "Team Members" }
  ];

  const visionFeatures = [
    "Customized Financial Plans",
    "Tailored Coaching",
    "Supportive Community",
    "Lifelong Education"
  ];

  const timeline = [
    {
      year: "2020",
      title: "The Beginning",
      description: "A bold vision started. While working in corporate finance and witnessing countless women struggle with money stress, our founder began coaching colleagues one-on-one. This early hands-on experience laid the foundation for what would become a transformative approach to women's financial wellness — rooted in behavior change, empathy, and empowerment.",
      icon: "💡",
      color: "from-blue-500 to-teal-500"
    },
    {
      year: "2021",
      title: "Going Digital",
      description: "As demand grew, we evolved into a hybrid model, combining personalized coaching with online resources. This marked the start of delivering expert-level financial strategies on a larger scale, helping more women achieve their goals with proven results and compassionate support.",
      icon: "💻",
      color: "from-purple-500 to-pink-500"
    },
    {
      year: "2022",
      title: "The Birth of BrightNest",
      description: "BrightNest was officially born, setting a new standard in financial education for women. Our signature program empowered women with the tools and knowledge to transform their relationship with money for life. The launch of BrightNest signaled the start of a movement, establishing expertise in personalized financial solutions for women.",
      icon: "🚀",
      color: "from-green-500 to-teal-500"
    },
    {
      year: "2023",
      title: "Innovation and Growth",
      description: "BrightNest solidified its position as a leader in women's financial education, testing and refining new programs to ensure the best client outcomes. Through strategic innovation, we expanded our reach and impact while maintaining our core commitment to delivering unmatched expertise and support.",
      icon: "📈",
      color: "from-orange-500 to-red-500"
    },
    {
      year: "2024",
      title: "Scaling Impact",
      description: "This year saw record-breaking growth as we helped thousands of women transform their financial lives. We launched new programs, expanded our coaching team, and introduced cutting-edge tools to make financial wellness accessible to every woman, regardless of her starting point.",
      icon: "🌟",
      color: "from-pink-500 to-rose-500"
    },
    {
      year: "2025",
      title: "The Future of Financial Wellness",
      description: "BrightNest continues to revolutionize women's financial health with innovative approaches and personalized solutions. We're building the ultimate platform for women seeking financial confidence, security, and lasting transformation. The best is yet to come.",
      icon: "🔮",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  const nextTimeline = () => {
    setCurrentTimelineIndex((prev) => (prev === timeline.length - 1 ? 0 : prev + 1));
  };

  const prevTimeline = () => {
    setCurrentTimelineIndex((prev) => (prev === 0 ? timeline.length - 1 : prev - 1));
  };

  // Keyboard navigation for timeline
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevTimeline();
      } else if (e.key === 'ArrowRight') {
        nextTimeline();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTimelineIndex]);

  const leadership = [
    { name: "Sarah Mitchell", title: "Co-Founder & CEO", initials: "SM", color: "from-blue-400 to-teal-400" },
    { name: "Emily Chen", title: "Co-Founder & CFO", initials: "EC", color: "from-purple-400 to-pink-400" },
    { name: "David Thompson", title: "Chief Strategy Officer", initials: "DT", color: "from-green-400 to-teal-400" },
    { name: "Rachel Williams", title: "Head of Coaching", initials: "RW", color: "from-orange-400 to-red-400" },
    { name: "Lisa Martinez", title: "Senior Financial Coach", initials: "LM", color: "from-pink-400 to-rose-400" },
    { name: "Amanda Brooks", title: "Community Manager", initials: "AB", color: "from-indigo-400 to-purple-400" },
    { name: "Jessica Taylor", title: "Marketing Director", initials: "JT", color: "from-blue-400 to-teal-400" },
    { name: "Michael Rodriguez", title: "Head of Technology", initials: "MR", color: "from-purple-400 to-pink-400" },
    { name: "Sophia Anderson", title: "Customer Success Lead", initials: "SA", color: "from-green-400 to-teal-400" },
    { name: "Daniel Kim", title: "Content Director", initials: "DK", color: "from-orange-400 to-red-400" },
    { name: "Olivia Parker", title: "Financial Analyst", initials: "OP", color: "from-pink-400 to-rose-400" },
    { name: "James Wilson", title: "Operations Manager", initials: "JW", color: "from-indigo-400 to-purple-400" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-900/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center">
              <Link href="/" className="text-xl sm:text-2xl font-bold text-white">
                BrightNest
              </Link>
            </div>
            
            <div className="hidden lg:flex items-center flex-1 justify-center space-x-8">
              <Link href="/about" className="text-white font-medium text-sm uppercase tracking-wide hover:text-pink-400 transition-colors">
                ABOUT US
              </Link>
              <Link href="/blog" className="text-white font-medium text-sm uppercase tracking-wide hover:text-pink-400 transition-colors">
                BLOG
              </Link>
              <Link href="/careers" className="text-white font-medium text-sm uppercase tracking-wide hover:text-pink-400 transition-colors">
                CAREERS
              </Link>
            </div>
            
            <div className="hidden lg:flex items-center">
              <Link href="/quiz/financial-profile" className="bg-gradient-to-r from-pink-500 to-teal-500 text-white px-4 py-2 rounded-md font-medium text-sm hover:from-pink-600 hover:to-teal-600 transition-colors">
                Learn More
              </Link>
            </div>

            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:text-pink-400 focus:outline-none"
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

          {isMobileMenuOpen && (
            <div className="lg:hidden bg-gray-900/95 backdrop-blur-md border-t border-white/10">
              <div className="px-4 py-4 space-y-4">
                <Link href="/about" className="block text-white font-medium text-sm uppercase" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
                <Link href="/blog" className="block text-white font-medium text-sm uppercase" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
                <Link href="/careers" className="block text-white font-medium text-sm uppercase" onClick={() => setIsMobileMenuOpen(false)}>Careers</Link>
                <div className="pt-4 border-t border-white/10">
                  <Link href="/quiz/financial-profile" className="block w-full bg-gradient-to-r from-pink-500 to-teal-500 text-white px-4 py-3 rounded-md font-medium text-sm text-center" onClick={() => setIsMobileMenuOpen(false)}>
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 sm:py-20 lg:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              About BrightNest
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-6">
                BrightNest is a results-driven company empowering women through personalized financial coaching, education, and community support. With online programs, world-class advisors, and a supportive network, we help women take control of their finances and achieve life-changing transformations.
              </p>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                Founded by a team of passionate financial experts, BrightNest has grown into a movement trusted by thousands of women worldwide. We are on a mission to help women regain their financial power and feel confident in their financial future.
              </p>
            </div>
            <div className="relative h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-blue-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-6xl mb-4">💰</div>
                <p className="text-gray-300 font-medium">Your Financial Journey</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-teal-500 mb-2">
                  {stat.number}
                </div>
                <p className="text-base sm:text-lg text-gray-600 font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 sm:py-20 lg:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1 relative h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-gray-300 font-medium">Our Mission</p>
              </div>
            </div>
            <div className="order-1 lg:order-2 bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
              <p className="text-base sm:text-lg text-gray-400 mb-6 leading-relaxed">
                Since we started in 2020, our mission has been to transform lives.
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Our goal is to <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-teal-400">empower women</span> to build wealth, confidence, and a financial future they love at any stage of life.
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* Our Vision */}
      <section className="py-16 sm:py-20 lg:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-sm sm:text-base text-pink-400 uppercase tracking-wide mb-4 font-semibold">Our Vision</h2>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white max-w-4xl mx-auto leading-tight">
              to become the ultimate solution for women seeking financial strength, confidence, and lasting transformation.
            </p>
            <p className="mt-6 text-base sm:text-lg text-gray-300 max-w-3xl mx-auto">
              Imagine everything you need — financial planning, coaching, education, and support — under one roof, tailored just for you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mt-16">
            <div className="grid grid-cols-2 gap-6">
              {visionFeatures.map((feature, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-pink-400/50 hover:shadow-lg transition-all text-center">
                  <div className="text-3xl mb-3">✓</div>
                  <h3 className="text-base sm:text-lg font-bold text-white">{feature}</h3>
                </div>
              ))}
            </div>
            <div className="relative h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-6xl mb-4">📈</div>
                <p className="text-gray-300 font-medium">Growth & Success</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline - Modern Carousel Design */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-sm sm:text-base text-pink-400 uppercase tracking-wide mb-4 font-semibold">Our Journey</h2>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              The BrightNest Story
            </p>
          </div>

          {/* Timeline Progress Bar */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="relative">
              {/* Progress line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-700 -translate-y-1/2"></div>
              <div 
                className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-pink-500 to-teal-500 -translate-y-1/2 transition-all duration-500"
                style={{ width: `${((currentTimelineIndex + 1) / timeline.length) * 100}%` }}
              ></div>
              
              {/* Timeline dots */}
              <div className="relative flex justify-between">
                {timeline.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTimelineIndex(index)}
                    className="group flex flex-col items-center"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                      index <= currentTimelineIndex 
                        ? 'bg-gradient-to-br from-pink-500 to-teal-500 border-white scale-110' 
                        : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                    }`}>
                      <span className="text-2xl">{index <= currentTimelineIndex ? '✓' : item.icon}</span>
                    </div>
                    <span className={`mt-3 text-xs sm:text-sm font-bold transition-colors ${
                      index === currentTimelineIndex ? 'text-pink-400' : 'text-gray-500'
                    }`}>
                      {item.year}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Carousel Content */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl min-h-[400px] flex flex-col justify-between">
              {/* Year Badge */}
              <div className="mb-6">
                <div className={`inline-block bg-gradient-to-r ${timeline[currentTimelineIndex].color} text-white px-8 py-3 rounded-full font-bold text-2xl shadow-lg`}>
                  {timeline[currentTimelineIndex].year}
                </div>
              </div>

              {/* Icon */}
              <div className="text-8xl mb-6 text-center">
                {timeline[currentTimelineIndex].icon}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                  {timeline[currentTimelineIndex].title}
                </h3>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  {timeline[currentTimelineIndex].description}
                </p>
              </div>

              {/* Navigation Arrows */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={prevTimeline}
                  className="flex items-center space-x-2 text-gray-600 hover:text-pink-500 transition-colors group"
                >
                  <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="font-semibold">Previous</span>
                </button>

                <div className="flex space-x-2">
                  {timeline.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTimelineIndex(index)}
                      className={`transition-all duration-300 rounded-full ${
                        index === currentTimelineIndex 
                          ? 'w-8 h-3 bg-pink-500' 
                          : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to ${timeline[index].year}`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextTimeline}
                  className="flex items-center space-x-2 text-gray-600 hover:text-pink-500 transition-colors group"
                >
                  <span className="font-semibold">Next</span>
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Keyboard Navigation Hint */}
            <div className="text-center mt-6 text-gray-400 text-sm">
              Use arrow keys or click dots to navigate
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-16 sm:py-20 lg:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-sm sm:text-base text-pink-400 uppercase tracking-wide mb-4 font-semibold">Our Leadership</h2>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              meet the team
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {leadership.map((member, index) => (
              <div key={index} className="group text-center">
                <div className={`w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-bold text-3xl sm:text-4xl shadow-lg group-hover:scale-105 transition-transform`}>
                  {member.initials}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1">{member.name}</h3>
                <p className="text-sm text-pink-400 font-medium">{member.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            join the team
          </h2>
          <p className="text-base sm:text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
            View our open positions and become part of something special
          </p>
          <Link
            href="/careers"
            className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 text-white px-10 sm:px-14 py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg uppercase hover:from-pink-600 hover:to-rose-600 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl"
          >
            Let's Go
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
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

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-gray-300 hover:text-white">Home</Link></li>
                <li><Link href="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
                <li><Link href="/blog" className="text-gray-300 hover:text-white">Blog</Link></li>
                <li><Link href="/careers" className="text-gray-300 hover:text-white">Careers</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/quiz/financial-profile" className="text-gray-300 hover:text-white">Take the Quiz</Link></li>
                <li><Link href="/affiliates/signup" className="text-gray-300 hover:text-white">Become a Partner</Link></li>
              </ul>
            </div>

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

