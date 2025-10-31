"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function AboutPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTimelineIndex, setCurrentTimelineIndex] = useState(0);

  const stats = [
    { number: "10,000+", label: "Women Empowered", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { number: "15+", label: "Financial Coaches", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { number: "50+", label: "Team Members", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" }
  ];

  const visionFeatures = [
    { title: "Customized Financial Plans", description: "Personalized strategies tailored to your unique financial situation and goals" },
    { title: "Tailored Coaching", description: "One-on-one guidance from certified financial professionals" },
    { title: "Supportive Community", description: "Connect with like-minded women on similar financial journeys" },
    { title: "Lifelong Education", description: "Ongoing learning resources to build lasting financial confidence" }
  ];

  const timeline = [
    {
      year: "2020",
      title: "The Beginning",
      description: "A bold vision started. While working in corporate finance and witnessing countless women struggle with money stress, our founder began coaching colleagues one-on-one. This early hands-on experience laid the foundation for what would become a transformative approach to women's financial wellness — rooted in behavior change, empathy, and empowerment.",
      icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    },
    {
      year: "2021",
      title: "Going Digital",
      description: "As demand grew, we evolved into a hybrid model, combining personalized coaching with online resources. This marked the start of delivering expert-level financial strategies on a larger scale, helping more women achieve their goals with proven results and compassionate support.",
      icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    },
    {
      year: "2022",
      title: "The Birth of BrightNest",
      description: "BrightNest was officially born, setting a new standard in financial education for women. Our signature program empowered women with the tools and knowledge to transform their relationship with money for life. The launch of BrightNest signaled the start of a movement, establishing expertise in personalized financial solutions for women.",
      icon: "M13 10V3L4 14h7v7l9-11h-7z"
    },
    {
      year: "2023",
      title: "Innovation and Growth",
      description: "BrightNest solidified its position as a leader in women's financial education, testing and refining new programs to ensure the best client outcomes. Through strategic innovation, we expanded our reach and impact while maintaining our core commitment to delivering unmatched expertise and support.",
      icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    },
    {
      year: "2024",
      title: "Scaling Impact",
      description: "This year saw record-breaking growth as we helped thousands of women transform their financial lives. We launched new programs, expanded our coaching team, and introduced cutting-edge tools to make financial wellness accessible to every woman, regardless of her starting point.",
      icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
    },
    {
      year: "2025",
      title: "The Future of Financial Wellness",
      description: "BrightNest continues to revolutionize women's financial health with innovative approaches and personalized solutions. We're building the ultimate platform for women seeking financial confidence, security, and lasting transformation. The best is yet to come.",
      icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
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
        setCurrentTimelineIndex((prev) => (prev === 0 ? timeline.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentTimelineIndex((prev) => (prev === timeline.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timeline.length]);

  const leadership = [
    { name: "Sarah Mitchell", title: "Co-Founder & CEO", initials: "SM" },
    { name: "Emily Chen", title: "Co-Founder & CFO", initials: "EC" },
    { name: "David Thompson", title: "Chief Strategy Officer", initials: "DT" },
    { name: "Rachel Williams", title: "Head of Coaching", initials: "RW" },
    { name: "Lisa Martinez", title: "Senior Financial Coach", initials: "LM" },
    { name: "Amanda Brooks", title: "Community Manager", initials: "AB" },
    { name: "Jessica Taylor", title: "Marketing Director", initials: "JT" },
    { name: "Michael Rodriguez", title: "Head of Technology", initials: "MR" },
    { name: "Sophia Anderson", title: "Customer Success Lead", initials: "SA" },
    { name: "Daniel Kim", title: "Content Director", initials: "DK" },
    { name: "Olivia Parker", title: "Financial Analyst", initials: "OP" },
    { name: "James Wilson", title: "Operations Manager", initials: "JW" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Navigation - Professional with Depth */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-[60] shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Layout */}
          <div className="hidden lg:flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/" className="group flex items-center space-x-2">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-teal-700 bg-clip-text text-transparent group-hover:from-teal-600 group-hover:to-slate-700 transition-all duration-300">
                  BrightNest
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-8">
              <Link href="/about" className="px-3 py-2 text-slate-900 font-medium text-sm border-b-2 border-teal-600">
                About Us
              </Link>
              <Link href="/blog" className="px-3 py-2 text-slate-600 font-medium text-sm hover:text-teal-600 transition-colors duration-200 relative group">
                Blog
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link href="/careers" className="px-3 py-2 text-slate-600 font-medium text-sm hover:text-teal-600 transition-colors duration-200 relative group">
                Careers
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
            </div>
            
            <div className="flex items-center">
              <Link href="/quiz/financial-profile" className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:from-teal-700 hover:to-teal-800 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02]">
                Learn More
              </Link>
            </div>
          </div>

          {/* Mobile Layout: Menu Icon + Logo (Left) | Button (Right) */}
          <div className="lg:hidden flex items-center justify-between h-16">
            {/* Menu Icon + Logo - Left */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-700 hover:text-slate-900 focus:outline-none transition-all duration-200"
                aria-label="Toggle mobile menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              <Link href="/" className="group">
                <div className="text-xl font-bold bg-gradient-to-r from-slate-900 to-teal-700 bg-clip-text text-transparent group-hover:from-teal-600 group-hover:to-slate-700 transition-all duration-300 whitespace-nowrap">
                  BrightNest
                </div>
              </Link>
            </div>

            {/* Button - Right */}
            <Link 
              href="/quiz/financial-profile" 
              className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-4 py-2 rounded-full font-semibold text-xs hover:from-teal-700 hover:to-teal-800 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap"
            >
              APPLY NOW
            </Link>
          </div>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <>
              {/* Backdrop - starts below header */}
              <div 
                className="fixed top-16 left-0 right-0 bottom-0 bg-black/50 z-50 lg:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              {/* Menu Dropdown */}
              <div className="lg:hidden absolute left-0 right-0 top-full bg-white border-b border-gray-200 shadow-lg z-[60]" style={{ animation: 'slideDown 0.3s ease-out' }}>
                <div className="px-4 py-4 space-y-1">
                  <Link href="/about" className="block px-4 py-3 text-teal-700 font-semibold text-sm bg-teal-50 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
                  <Link href="/blog" className="block px-4 py-3 text-slate-600 font-medium text-sm hover:bg-gray-50 hover:text-teal-600 rounded-md transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
                  <Link href="/careers" className="block px-4 py-3 text-slate-600 font-medium text-sm hover:bg-gray-50 hover:text-teal-600 rounded-md transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>Careers</Link>
                  <div className="pt-2">
                    <Link href="/quiz/financial-profile" className="block w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white px-4 py-3 rounded-lg font-semibold text-sm text-center shadow-md hover:from-teal-700 hover:to-teal-800 transition-all duration-300" onClick={() => setIsMobileMenuOpen(false)}>
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/30 via-white to-amber-50/20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-100/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-amber-100/20 to-transparent rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-block mb-6">
              <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider bg-teal-50 px-4 py-2 rounded-full">About Us</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Empowering Women Through <span className="bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">Financial Excellence</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              BrightNest is a results-driven financial services company empowering women through personalized financial coaching, education, and community support.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
            <div className="space-y-6 relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-amber-400 rounded-full"></div>
              <p className="text-base text-slate-700 leading-relaxed">
                With online programs, world-class advisors, and a supportive network, we help women take control of their finances and achieve life-changing transformations.
              </p>
              <p className="text-base text-slate-700 leading-relaxed">
                Founded by a team of passionate financial experts, BrightNest has grown into a trusted platform serving thousands of women worldwide. We are committed to helping women regain their financial power and build confidence in their financial future.
              </p>
            </div>
            <div className="relative h-64 sm:h-80 lg:h-96 group">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-teal-50 rounded-xl shadow-lg border border-teal-200/50 flex items-center justify-center transform group-hover:scale-[1.02] transition-transform duration-300">
                <div className="text-center p-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 mb-6 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-slate-700 font-semibold text-sm uppercase tracking-wider">Your Financial Journey</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12 border-t border-slate-200/60 pt-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 mb-4 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <p className="text-sm sm:text-base text-slate-600 font-medium">{stat.label}</p>
              </div>
            ))}
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
              <span className="inline-block text-xs font-semibold text-teal-600 uppercase tracking-wider bg-teal-50 px-4 py-2 rounded-full mb-4">Our Mission</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mt-4 mb-6 leading-tight">
                Transforming Lives Through <span className="bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">Financial Empowerment</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Since we started in 2020, our mission has been to transform lives.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 sm:p-12 border border-slate-200/60 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-amber-400 to-teal-500"></div>
              <p className="text-xl sm:text-2xl text-slate-900 leading-relaxed font-medium relative z-10">
                Our goal is to <span className="text-teal-600 font-semibold">empower women</span> to build <span className="text-teal-600 font-semibold">wealth, confidence,</span> and a financial future they love at any stage of life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Vision */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-50/30 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold text-teal-600 uppercase tracking-wider bg-teal-50 px-4 py-2 rounded-full mb-4">Our Vision</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mt-4 mb-6 max-w-4xl mx-auto leading-tight">
              The Ultimate Solution for Women Seeking <span className="bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">Financial Strength</span> and Lasting Transformation
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Everything you need — financial planning, coaching, education, and support — under one roof, tailored just for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {visionFeatures.map((feature, index) => (
              <div key={index} className="group bg-gradient-to-br from-white to-teal-50/30 rounded-xl p-8 border border-slate-200/60 hover:border-teal-300 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-100/20 rounded-full -mr-12 -mt-12"></div>
                <div className="flex items-start space-x-4 relative z-10">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline - Professional Design */}
      <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-amber-50/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold text-teal-600 uppercase tracking-wider bg-teal-50 px-4 py-2 rounded-full mb-4">Our Journey</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mt-4">
              The <span className="bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">BrightNest</span> Story
            </h2>
          </div>

          {/* Timeline Progress Bar */}
          <div className="max-w-6xl mx-auto mb-12">
            <div className="relative">
              <div className="relative flex justify-between items-center">
                {timeline.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTimelineIndex(index)}
                    className="group flex flex-col items-center gap-3 transition-all duration-300"
                  >
                    <div className="relative flex items-center">
                      {index > 0 && (
                        <div className="absolute right-full w-[calc((100%-24px)/5)] sm:w-32 md:w-40 lg:w-48 h-px">
                          <div className={`h-full transition-all duration-500 ${
                            index <= currentTimelineIndex 
                              ? 'bg-gradient-to-r from-teal-500 to-teal-600' 
                              : 'bg-slate-300'
                          }`}></div>
                        </div>
                      )}
                      
                      <div className={`relative w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentTimelineIndex 
                          ? 'bg-teal-600 scale-150 ring-4 ring-teal-100 shadow-lg' 
                          : index < currentTimelineIndex
                          ? 'bg-teal-500 scale-125'
                          : 'bg-slate-300 group-hover:bg-teal-400 group-hover:scale-125'
                      }`}>
                      </div>
                    </div>
                    
                    <span className={`text-xs font-semibold tracking-wider transition-all duration-300 ${
                      index === currentTimelineIndex 
                        ? 'text-teal-700' 
                        : index < currentTimelineIndex
                        ? 'text-teal-600'
                        : 'text-slate-400 group-hover:text-teal-600'
                    }`}>
                      {item.year}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline Content */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-white border border-slate-200/60 rounded-xl p-8 sm:p-12 lg:p-16 shadow-lg min-h-[400px] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-amber-400 to-teal-500"></div>
              <div className="mb-8">
                <div className="inline-flex items-center space-x-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={timeline[currentTimelineIndex].icon} />
                    </svg>
                  </div>
                  <div className="inline-block bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-2 rounded-lg font-semibold text-xl shadow-md">
                    {timeline[currentTimelineIndex].year}
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                  {timeline[currentTimelineIndex].title}
                </h3>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                  {timeline[currentTimelineIndex].description}
                </p>
              </div>

              <div className="flex justify-between items-center pt-8 border-t border-slate-200">
                <button
                  onClick={prevTimeline}
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors group"
                >
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="font-medium text-sm">Previous</span>
                </button>

                <div className="flex space-x-2">
                  {timeline.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTimelineIndex(index)}
                      className={`transition-all duration-300 rounded-full ${
                        index === currentTimelineIndex 
                          ? 'w-8 h-2 bg-teal-600' 
                          : 'w-2 h-2 bg-slate-300 hover:bg-teal-400'
                      }`}
                      aria-label={`Go to ${timeline[index].year}`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextTimeline}
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors group"
                >
                  <span className="font-medium text-sm">Next</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="text-center mt-6 text-slate-500 text-xs">
              Use arrow keys or click dots to navigate
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold text-teal-600 uppercase tracking-wider bg-teal-50 px-4 py-2 rounded-full mb-4">Our Leadership</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mt-4">
              Meet the <span className="bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">Team</span>
            </h2>
            <p className="text-lg text-slate-600 mt-4 max-w-2xl mx-auto">
              Experienced professionals dedicated to your financial success
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {leadership.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-4 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center text-white font-semibold text-xl sm:text-2xl group-hover:from-teal-700 group-hover:to-teal-800 transition-all shadow-lg group-hover:shadow-xl group-hover:scale-105 duration-300">
                  <span>{member.initials}</span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">{member.name}</h3>
                <p className="text-xs sm:text-sm text-slate-600">{member.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-amber-50/30"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-teal-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-100/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Join the Team
          </h2>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            View our open positions and become part of something special
          </p>
          <Link
            href="/careers"
            className="inline-block bg-gradient-to-r from-teal-600 to-teal-700 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-lg font-semibold text-base sm:text-lg hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 duration-300"
          >
            View Open Positions
          </Link>
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


