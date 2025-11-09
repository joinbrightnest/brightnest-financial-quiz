"use client";

import Link from "next/link";
import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";

export default function CareersPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showPositions, setShowPositions] = useState(false);

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

      {/* Hero Section - Enhanced with Depth */}
      <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
        {/* Multi-layered background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.08),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(251,191,36,0.06),transparent_50%)]"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-100/20 rounded-full blur-3xl -translate-x-1/2"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-100/20 rounded-full blur-3xl translate-x-1/2"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-6">
            <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider bg-teal-50/80 backdrop-blur-sm px-5 py-2.5 rounded-full border border-teal-100 shadow-sm">
              Careers
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight text-slate-900">
            Join the BrightNest Team
          </h1>
          
          <p className="text-xl sm:text-2xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Change behaviour. Change lives. Build more than a job.
          </p>

          <button
            onClick={handleSeePositions}
            className="inline-block bg-gradient-to-r from-teal-600 to-teal-700 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10">Apply Now</span>
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
          </button>

          {/* Team Member Avatars */}
          <div className="mt-16">
            <p className="text-sm text-teal-600 uppercase tracking-wide mb-6 font-semibold">Are You Ready?</p>
            <div className="flex justify-center items-center space-x-[-12px]">
              {testimonials.slice(0, 4).map((testimonial, idx) => (
                <div
                  key={idx}
                  className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center text-white font-bold text-sm sm:text-base lg:text-lg border-4 border-white shadow-xl hover:scale-110 transition-transform duration-300"
                  style={{ zIndex: 10 + idx }}
                >
                  {testimonial.initials}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission - Enhanced Card */}
      <section className="relative py-20 sm:py-24 lg:py-28 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-white"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-50/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-semibold text-teal-600 uppercase tracking-wider bg-teal-50/80 backdrop-blur-sm px-5 py-2.5 rounded-full border border-teal-100 shadow-sm mb-6">
                Our Mission
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight tracking-tight">
                Our Mission
              </h2>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-amber-400/10 rounded-3xl blur-2xl transform scale-105"></div>
              <div className="relative bg-white rounded-3xl p-10 sm:p-14 lg:p-16 border border-slate-200/80 shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-amber-400 to-teal-500 rounded-t-3xl"></div>
                <div className="space-y-6 relative z-10">
                  <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed">
                    At BrightNest, we&apos;re not just helping people manage money — we&apos;re guiding them to transform how they think, feel, and act about their finances.
                  </p>
                  <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed font-semibold text-teal-700">
                    We believe lasting change happens when the habits beneath the numbers are rewired. And we&apos;re building the team to make that possible.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who We're Looking For - Enhanced */}
      <section className="relative py-20 sm:py-24 lg:py-28 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-50/50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-50/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight tracking-tight">
              Who We&apos;re Looking For
            </h2>
            <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl p-8 sm:p-10 border border-slate-200/80 shadow-lg space-y-6">
              <p className="text-lg sm:text-xl text-slate-700 leading-relaxed">
                We want people who care deeply about human behaviour, real results and genuine impact. If you&apos;re someone who:
              </p>
              <ul className="text-left space-y-3 list-none">
                <li className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-lg text-slate-700">believes in the power of clarity over confusion</span>
                </li>
                <li className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-lg text-slate-700">gets energy from helping others move from stuck → free</span>
                </li>
                <li className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-lg text-slate-700">wants to work in a team that values growth, integrity and transformation</span>
                </li>
              </ul>
              <p className="text-lg sm:text-xl text-slate-700 leading-relaxed font-semibold text-teal-700 pt-4 border-t border-slate-200">
                then you might be a perfect fit.
              </p>
              <p className="text-lg sm:text-xl text-slate-700 leading-relaxed">
                Whether your strength lies in coaching, operations, tech, content or client experience — there&apos;s an opportunity here to help build something meaningful.
              </p>
            </div>
          </div>

          {/* Enhanced Testimonials Carousel */}
          <div className="relative max-w-6xl mx-auto mt-16">
            <div className="relative bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-2xl min-h-[320px] flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-amber-400 to-teal-500 rounded-t-3xl"></div>
              
              <div className="flex items-start space-x-6 mb-6 pt-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-lg">
                  {testimonials[currentTestimonial].initials}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">{testimonials[currentTestimonial].name}</h3>
                  <p className="text-teal-600 font-semibold text-lg">{testimonials[currentTestimonial].title}</p>
                </div>
              </div>
              
              <p className="text-lg sm:text-xl text-slate-700 leading-relaxed italic mb-8 flex-1">
                &quot;{testimonials[currentTestimonial].quote}&quot;
              </p>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                <div className="flex justify-center items-center space-x-3 flex-1">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`transition-all duration-300 rounded-full ${
                        index === currentTestimonial 
                          ? 'w-8 h-3 bg-teal-600' 
                          : 'w-3 h-3 bg-slate-300 hover:bg-teal-400'
                      }`}
                      aria-label={`View testimonial ${index + 1}`}
                    />
                  ))}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                    className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-teal-50 hover:border-teal-300 border border-slate-200 transition-colors"
                    aria-label="Previous testimonial"
                  >
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                    className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-teal-50 hover:border-teal-300 border border-slate-200 transition-colors"
                    aria-label="Next testimonial"
                  >
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values - Enhanced Grid */}
      <section className="relative py-20 sm:py-24 lg:py-28 overflow-hidden bg-white">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-50/30 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold text-teal-600 uppercase tracking-wider bg-teal-50/80 backdrop-blur-sm px-5 py-2.5 rounded-full border border-teal-100 shadow-sm mb-6">
              Our Values
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight tracking-tight">
              Our Values
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((value, index) => (
              <div 
                key={index} 
                className="group relative bg-white rounded-2xl p-8 border border-slate-200/80 hover:border-teal-300 hover:shadow-xl transition-all duration-300 overflow-hidden text-center"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-50 to-transparent rounded-full -mr-12 -mt-12 opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 relative z-10">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={value.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-700 transition-colors relative z-10">{value.title}</h3>
                <p className="text-base text-slate-600 leading-relaxed relative z-10">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perks Section - Enhanced */}
      <section className="relative py-20 sm:py-24 lg:py-28 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-50/50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-50/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold text-teal-600 uppercase tracking-wider bg-teal-50/80 backdrop-blur-sm px-5 py-2.5 rounded-full border border-teal-100 shadow-sm mb-6">
              Just A Few Perks of Working With BrightNest
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight tracking-tight">
              Your BrightNest Journey <span className="bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">Starts Here</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {perks.map((perk, index) => (
              <div 
                key={index} 
                className="group relative bg-white rounded-2xl p-8 border border-slate-200/80 hover:border-teal-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-50 to-transparent rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-teal-700 transition-colors relative z-10">{perk.title}</h3>
                <p className="text-base text-slate-600 leading-relaxed relative z-10">{perk.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What It's Like To Work With Us - Enhanced Dark Section */}
      <section className="relative py-20 sm:py-24 lg:py-28 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-10 sm:p-14 lg:p-16 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-amber-400 to-teal-500"></div>
            
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, white 2px, transparent 2px),
                                  radial-gradient(circle at 60% 70%, white 2px, transparent 2px),
                                  radial-gradient(circle at 80% 20%, white 2px, transparent 2px)`,
                backgroundSize: '100px 100px, 80px 80px, 120px 120px'
              }}></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
              {/* Left Side - Visual */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] bg-gradient-to-br from-teal-600 via-teal-500 to-teal-700">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
                <div className="relative flex flex-col items-center justify-center h-full p-8">
                  <div className="relative w-48 h-48 mb-6">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <svg className="w-10 h-10 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                    {[0, 1, 2, 3, 4].map((i) => {
                      const angle = (i * 72 - 90) * (Math.PI / 180);
                      const x = Math.cos(angle) * 70;
                      const y = Math.sin(angle) * 70;
                      return (
                        <div
                          key={i}
                          className="absolute top-1/2 left-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg"
                          style={{
                            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                          }}
                        ></div>
                      );
                    })}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white text-center">Join Our Team</h3>
                  <p className="text-white/90 text-center mt-2 text-base">Empowering Women Together</p>
                </div>
              </div>

              {/* Right Side - Content */}
              <div>
                <p className="text-teal-400 italic text-base mb-3">What It&apos;s Like To</p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-8 uppercase italic leading-tight">
                  work with us
                </h2>

                <div className="space-y-5 mb-8">
                  {[
                    "Purpose over process: Every role connects back to helping someone live with more financial freedom.",
                    "Team of experts: You'll work alongside certified behaviour & finance coaches, tech builders and change-makers.",
                    "Supportive culture: We value accountability, transparency, continuous learning and the courage to try new things.",
                    "Growth mindset: We're growing rapidly, and with growth comes opportunity — for you and for our clients."
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <svg className="w-6 h-6 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-base text-white/90 font-light italic">
                        <strong className="font-semibold text-white">{item.split(':')[0]}:</strong> {item.split(':').slice(1).join(':')}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSeePositions}
                  className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-10 py-4 rounded-xl font-semibold text-lg uppercase hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 duration-300 relative overflow-hidden group"
                >
                  <span className="relative z-10">See Positions</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Positions Section */}
      {showPositions && (
        <section 
          id="positions" 
          className="relative py-20 sm:py-24 lg:py-28 overflow-hidden bg-gradient-to-b from-slate-50 to-white animate-fade-in"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-teal-50/20"></div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative bg-white rounded-3xl p-10 sm:p-14 border border-slate-200/80 shadow-2xl text-center">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-amber-400 to-teal-500 rounded-t-3xl"></div>
              
              <div className="mb-8">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                Roles & Opportunities
              </h2>
              
              <p className="text-lg sm:text-xl text-slate-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                We have openings (or will have openings) across:
              </p>

              <ul className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed space-y-3 text-left list-disc list-inside">
                <li>Client Coaching & Behaviour Change Specialists</li>
                <li>Marketing & Content Creators (focused on mindset & finance)</li>
                <li>Operations & Client Success</li>
                <li>Product & Technology (platforms, dashboards, data)</li>
                <li>Partnerships & Growth</li>
              </ul>

              <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed italic">
                (Even if you don&apos;t see your exact fit listed yet, we encourage you to apply — let&apos;s connect and find where your strengths meet our mission.)
              </p>

              <div className="mb-10 pt-8 border-t border-slate-200">
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
                  Why Join Now
                </h3>
                <div className="space-y-4 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed text-left">
                  <p>This is more than a job-board listing. This is an invitation to join at a critical moment in our journey.</p>
                  <p>You&apos;ll have the chance to help shape our systems, culture and impact.</p>
                  <p>And in doing so, you&apos;ll build experience, mastery and fulfilment.</p>
                </div>
              </div>

              <div className="mb-10 pt-8 border-t border-slate-200">
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
                  How to Apply
                </h3>
                <div className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto leading-relaxed space-y-4 text-left">
                  <p>Email your CV (or LinkedIn) and a short note: <strong>Why does financial behaviour change matter to you?</strong></p>
                  <p>Include which role(s) interest you and how your skills align.</p>
                  <p>We&apos;ll respond quickly and share next steps: a chat + a short task so we can see if we&apos;re a great match.</p>
                  <p className="font-semibold text-teal-700">
                    Send your application to <a href="mailto:careers@brightnest.com" className="underline hover:text-teal-800">careers@brightnest.com</a>
                  </p>
                  <p className="text-sm text-slate-500 italic">
                    (We&apos;ll treat every application personally and appreciate your time.)
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href="mailto:careers@brightnest.com"
                  className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-teal-700 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 duration-300 text-center relative overflow-hidden group"
                >
                  <span className="relative z-10">Apply Now</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                </a>
                <Link
                  href="/"
                  className="w-full sm:w-auto bg-slate-50 text-slate-700 px-10 py-4 rounded-xl font-semibold text-lg border-2 border-slate-300 hover:border-slate-400 transition-all text-center"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
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
