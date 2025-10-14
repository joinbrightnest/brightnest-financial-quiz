"use client";

import Link from "next/link";

export default function HomePageContent() {
  return (
    <div className="min-h-screen" style={{backgroundColor: '#faf8f0'}}>
      {/* Top Purple Bar */}
      <div className="w-full h-1 bg-[#5C4F6B]"></div>
      
      {/* Navigation */}
      <nav className="bg-[#F8F7F0] border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo - Left Side */}
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                BrightNest
              </Link>
            </div>
            
            {/* Menu Items - Right Side with Equal Spacing */}
            <div className="flex items-center space-x-8">
              <Link href="/quiz/financial-profile" className="text-gray-900 font-medium text-sm uppercase tracking-wide hover:text-gray-700 transition-colors"> 
                FINANCIAL PROFILE
              </Link>
              <Link href="/quiz/health-finance" className="text-gray-900 font-medium text-sm uppercase tracking-wide hover:text-gray-700 transition-colors">    
                HEALTH FINANCE
              </Link>
              <Link href="/quiz/marriage-finance" className="text-gray-900 font-medium text-sm uppercase tracking-wide hover:text-gray-700 transition-colors">  
                MARRIAGE FINANCE
              </Link>
              <Link href="/book-call" className="text-gray-900 font-medium text-sm uppercase tracking-wide hover:text-gray-700 transition-colors">              
                BOOK CALL
              </Link>
              
              {/* Language Selector */}
              <div className="flex items-center space-x-1 text-gray-900 font-medium text-sm uppercase tracking-wide">                                           
                <span>EN</span>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">                                                                               
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />                                                         
                </svg>
              </div>
              
              {/* CTA Button */}
              <Link href="/quiz/financial-profile" className="bg-[#1ABC9C] text-white px-6 py-2 rounded-md font-medium text-sm hover:bg-[#16a085] transition-colors">                                                                           
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8" style={{backgroundColor: '#FAF8F4'}}>                                                    
        <div className="max-w-4xl mx-auto text-center">
          {/* 1️⃣ Microline */}
          <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-0 font-medium">                                                                             
            The behavior-based system for lasting financial peace.
          </p>
          
          {/* 2️⃣ Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif text-gray-900 mb-4 sm:mb-6 leading-tight">                                     
            <div>Real results.</div>
            <div>Built one habit at a time.</div>
          </h1>
          
          {/* 3️⃣ Subheadline */}
          <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">                                         
            Because wealth isn't about math — it's about behavior.
          </p>
          
          {/* 4️⃣ Visual Element */}
          <div className="mb-8 sm:mb-12">
            <div className="relative inline-block w-full max-w-sm sm:max-w-lg mx-auto">                                                                         
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-12 shadow-xl border border-gray-100 w-full">
                {/* Behavior Progress Card */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Header */}
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-gray-800 mb-1">Behavior Progress Report</div>                                            
                    <div className="text-xs sm:text-sm text-gray-600">Your habit transformation</div>                                                           
                  </div>
                  
                  {/* Behavior Items */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-white/60 rounded-lg sm:rounded-xl">                                         
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-sm sm:text-lg">💬</span>
                        <span className="text-xs sm:text-sm font-medium text-gray-700">I check my accounts weekly</span>                                        
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-green-600">+80%</span>                                                                 
                    </div>
                    
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-white/60 rounded-lg sm:rounded-xl">                                         
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-sm sm:text-lg">💡</span>
                        <span className="text-xs sm:text-sm font-medium text-gray-700">I plan my spending ahead</span>                                          
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-blue-600">+70%</span>                                                                  
                    </div>
                    
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-white/60 rounded-lg sm:rounded-xl">                                         
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-sm sm:text-lg">🎯</span>
                        <span className="text-xs sm:text-sm font-medium text-gray-700">I stick to my budget</span>                                              
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-purple-600">+65%</span>                                                                 
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="pt-2 sm:pt-4">
                    <div className="bg-white/40 rounded-full h-2 sm:h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-green-400 to-blue-500 h-full w-3/4 rounded-full"></div>                                      
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">75% Complete</div>                                                         
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 5️⃣ CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-8 sm:mb-12">
            <Link href="/quiz/financial-profile" className="w-full sm:w-auto bg-[#1ABC9C] text-white px-8 sm:px-12 py-4 sm:py-5 rounded-lg sm:rounded-xl font-bold text-lg sm:text-xl hover:bg-[#16a085] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
              Start Your Financial Profile Quiz
            </Link>
            <Link href="/book-call" className="w-full sm:w-auto bg-white text-[#1ABC9C] px-8 sm:px-12 py-4 sm:py-5 rounded-lg sm:rounded-xl font-bold text-lg sm:text-xl border-2 border-[#1ABC9C] hover:bg-[#1ABC9C] hover:text-white transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
              Book a Free Consultation
            </Link>
          </div>
          
          {/* 6️⃣ Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Free & Confidential</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>5-Minute Assessment</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Personalized Results</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional sections would go here */}
    </div>
  );
}
