"use client";

import Link from "next/link";
import { useState } from "react";

interface SharedHomePageProps {
  affiliateCode?: string;
}

export default function SharedHomePage({ affiliateCode }: SharedHomePageProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFreeToolsOpen, setIsFreeToolsOpen] = useState(false);
  // Helper function to generate affiliate-aware links
  const getLink = (path: string) => {
    if (affiliateCode) {
      return `/${affiliateCode}${path}`;
    }
    return path;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{backgroundColor: '#faf8f0'}}>
      {/* Navigation - Professional with Depth */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-[60] shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Layout */}
          <div className="hidden lg:flex justify-between items-center h-20">
            {/* Logo - Left Side */}
            <div className="flex items-center">
              <Link href={getLink("/")} className="group flex items-center space-x-2">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-teal-700 bg-clip-text text-transparent group-hover:from-teal-600 group-hover:to-slate-700 transition-all duration-300">
                  BrightNest
                </div>
              </Link>
            </div>
            
            {/* Desktop Menu Items */}
            <div className="flex items-center space-x-8">
              <Link href="/about" className="px-3 py-2 text-slate-600 font-medium text-sm hover:text-teal-600 transition-colors duration-200 relative group">
                About Us
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link href="/blog" className="px-3 py-2 text-slate-600 font-medium text-sm hover:text-teal-600 transition-colors duration-200 relative group">
                Blog
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link href="/careers" className="px-3 py-2 text-slate-600 font-medium text-sm hover:text-teal-600 transition-colors duration-200 relative group">
                Careers
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              
              {/* Free Tools Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setIsFreeToolsOpen(true)}
                onMouseLeave={() => setIsFreeToolsOpen(false)}
              >
                <button
                  className="px-3 py-2 text-slate-600 font-medium text-sm hover:text-teal-600 transition-colors duration-200 relative group"
                  onClick={() => setIsFreeToolsOpen(!isFreeToolsOpen)}
                >
                  Free Tools
                  <svg 
                    className={`inline-block ml-1 w-4 h-4 transition-transform duration-200 ${isFreeToolsOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 transition-all duration-200 group-hover:w-full"></span>
                </button>
                
                {/* Dropdown Menu */}
                {isFreeToolsOpen && (
                  <div className="absolute left-0 top-full mt-2 w-[300px] bg-white rounded-lg shadow-xl border border-slate-200 py-6 z-50">
                    <div className="px-6">
                      <h3 className="font-bold text-slate-900 mb-4 text-sm">Budgeting</h3>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <Link href="/tools/budget-calculator" className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-2 group">
                            <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Budget Calculator
                            <svg className="w-3 h-3 ml-auto text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </li>
                      </ul>
                      
                      <div className="mt-6 pt-6 border-t border-slate-200">
                        <h3 className="font-bold text-slate-900 mb-4 text-sm">Debt</h3>
                        <ul className="space-y-2 text-sm">
                          <li>
                            <Link href="/tools/debt-snowball-calculator" className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-2 group">
                              <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              Debt Snowball Calculator
                              <svg className="w-3 h-3 ml-auto text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Side Items */}
            <div className="flex items-center">
              <Link href={getLink("/quiz/financial-profile")} className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:from-teal-700 hover:to-teal-800 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02]">
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
              <Link href={getLink("/")} className="group">
                <div className="text-xl font-bold bg-gradient-to-r from-slate-900 to-teal-700 bg-clip-text text-transparent group-hover:from-teal-600 group-hover:to-slate-700 transition-all duration-300 whitespace-nowrap">
                  BrightNest
                </div>
              </Link>
            </div>

            {/* Button - Right */}
            <Link 
              href={getLink("/quiz/financial-profile")} 
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
                  <Link href="/about" className="block px-4 py-3 text-slate-600 font-medium text-sm hover:bg-gray-50 hover:text-teal-600 rounded-md transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
                  <Link href="/blog" className="block px-4 py-3 text-slate-600 font-medium text-sm hover:bg-gray-50 hover:text-teal-600 rounded-md transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
                  <Link href="/careers" className="block px-4 py-3 text-slate-600 font-medium text-sm hover:bg-gray-50 hover:text-teal-600 rounded-md transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>Careers</Link>
                  
                  {/* Free Tools in Mobile */}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="px-4 py-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Free Tools</p>
                    </div>
                    <Link 
                      href="/tools/budget-calculator" 
                      className="block px-4 py-3 font-medium text-sm rounded-md transition-all duration-200 text-slate-600 hover:bg-gray-50 hover:text-teal-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Budget Calculator
                    </Link>
                    <Link 
                      href="/tools/debt-snowball-calculator" 
                      className="block px-4 py-3 font-medium text-sm rounded-md transition-all duration-200 text-slate-600 hover:bg-gray-50 hover:text-teal-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Debt Snowball Calculator
                    </Link>
                  </div>
                  
                  <div className="pt-2">
                    <Link href={getLink("/quiz/financial-profile")} className="block w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white px-4 py-3 rounded-lg font-semibold text-sm text-center shadow-md hover:from-teal-700 hover:to-teal-800 transition-all duration-300" onClick={() => setIsMobileMenuOpen(false)}>
                      Start Your Quiz
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-20 sm:pb-20 lg:pb-24 min-h-[calc(100vh-80px)] justify-center" style={{backgroundColor: '#FAF8F4'}}>
        <div className="max-w-4xl mx-auto text-center">
          {/* 1️⃣ Microline */}
          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-2 font-medium">
            The behavior-based system for lasting financial peace.
          </p>
          
          {/* 2️⃣ Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif text-gray-900 mb-4 sm:mb-5 lg:mb-6 leading-tight">
            <div>Real results.</div>
            <div>Built one habit at a time.</div>
          </h1>
          
          {/* 3️⃣ Subheadline */}
          <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-6 sm:mb-8 lg:mb-10 max-w-2xl mx-auto leading-relaxed">
            Because wealth isn&apos;t about math — it&apos;s about behavior.
          </p>
          
          {/* 4️⃣ Visual Element - Family-Friendly Illustration */}
          <div className="mb-6 sm:mb-8 lg:mb-10">
            <div className="relative inline-block w-full max-w-sm sm:max-w-lg mx-auto">
              <div className="bg-gradient-to-br from-teal-50 via-white to-amber-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-slate-200/60 w-full overflow-hidden relative">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-200/20 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-200/20 rounded-full blur-2xl"></div>
                
                {/* Illustration Content */}
                <div className="relative z-10">
                  {/* Centered Illustration */}
                  <div className="flex justify-center items-center mb-4 sm:mb-5">
                    <svg className="w-full max-w-[240px] sm:max-w-[280px] lg:max-w-[320px] h-auto" viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* House Base */}
                      <rect x="80" y="100" width="160" height="120" rx="8" fill="#14b8a6" opacity="0.15" stroke="#14b8a6" strokeWidth="2"/>
                      <rect x="100" y="140" width="120" height="80" rx="4" fill="#14b8a6" opacity="0.2"/>
                      
                      {/* Roof */}
                      <path d="M60 100 L160 40 L260 100 Z" fill="#0f766e" opacity="0.2" stroke="#0f766e" strokeWidth="2"/>
                      
                      {/* Door */}
                      <rect x="130" y="160" width="40" height="60" rx="4" fill="#f59e0b" opacity="0.3" stroke="#f59e0b" strokeWidth="1.5"/>
                      <circle cx="155" cy="190" r="3" fill="#0f766e"/>
                      
                      {/* Windows */}
                      <rect x="110" y="120" width="30" height="30" rx="4" fill="#fef3c7" opacity="0.4" stroke="#f59e0b" strokeWidth="1.5"/>
                      <rect x="180" y="120" width="30" height="30" rx="4" fill="#fef3c7" opacity="0.4" stroke="#f59e0b" strokeWidth="1.5"/>
                      
                      {/* Window Cross */}
                      <line x1="125" y1="120" x2="125" y2="150" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6"/>
                      <line x1="110" y1="135" x2="140" y2="135" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6"/>
                      <line x1="195" y1="120" x2="195" y2="150" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6"/>
                      <line x1="180" y1="135" x2="210" y2="135" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6"/>
                      
                      {/* Sun */}
                      <circle cx="260" cy="60" r="25" fill="#fef3c7" opacity="0.4"/>
                      <circle cx="260" cy="60" r="20" fill="#fef3c7" opacity="0.3"/>
                      
                      {/* Trees/Greenery */}
                      <ellipse cx="50" cy="200" rx="15" ry="25" fill="#10b981" opacity="0.3"/>
                      <ellipse cx="50" cy="200" rx="20" ry="15" fill="#10b981" opacity="0.25"/>
                      <ellipse cx="270" cy="200" rx="15" ry="25" fill="#10b981" opacity="0.3"/>
                      <ellipse cx="270" cy="200" rx="20" ry="15" fill="#10b981" opacity="0.25"/>
                      
                      {/* Ground */}
                      <ellipse cx="160" cy="220" rx="140" ry="15" fill="#10b981" opacity="0.15"/>
                    </svg>
                  </div>
                  
                  {/* Inspirational Message */}
                  <div className="text-center space-y-1.5 sm:space-y-2">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 leading-tight">
                      Financial Peace for Your Family
                    </h3>
                    <p className="text-xs sm:text-sm lg:text-base text-slate-600 leading-relaxed max-w-xs mx-auto">
                      Build lasting habits that protect what matters most
                    </p>
                  </div>
                </div>
                
                {/* Accent Gradient Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-amber-400 to-teal-400"></div>
              </div>
              
              {/* Subtle Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400/10 to-amber-400/10 rounded-2xl sm:rounded-3xl blur-xl -z-10"></div>
            </div>
          </div>
              
          
          {/* 6️⃣ Primary CTA */}
          <div className="mb-4 sm:mb-6">
            <Link
              href={getLink("/quiz/financial-profile")}
              className="inline-block bg-[#FF5C41] text-white px-8 py-4 sm:px-12 sm:py-5 lg:px-16 lg:py-6 text-base sm:text-lg font-semibold hover:bg-[#e54a2f] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 rounded-lg w-full sm:w-auto"
            >
              Start My Money Reset
            </Link>
            <p className="text-xs text-gray-500 mt-3 sm:mt-4 px-4 sm:px-0">
              Based on results from real BrightNest members. Your data stays 100% private and secure.
            </p>
                </div>
          
                </div>
              </div>
              
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-6">
            {/* Logo and Social */}
            <div className="sm:col-span-2 md:col-span-1">
              <Link href={getLink("/")} className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 block">
                BrightNest
              </Link>
              <div className="flex space-x-4">
                {/* Twitter */}
                <a href="https://twitter.com/brightnest" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-400 transition-colors" aria-label="Twitter">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                
                {/* Facebook */}
                <a href="https://facebook.com/brightnest" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-400 transition-colors" aria-label="Facebook">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                
                {/* Instagram */}
                <a href="https://instagram.com/brightnest" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-400 transition-colors" aria-label="Instagram">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
                
                {/* YouTube */}
                <a href="https://youtube.com/@brightnest" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-400 transition-colors" aria-label="YouTube">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/blog" className="text-gray-300 hover:text-white">Blog</Link></li>
                <li><Link href="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
                <li><Link href="/careers" className="text-gray-300 hover:text-white">Careers</Link></li>
                <li><Link href="/partners/become-partner" className="text-gray-300 hover:text-white">Become a Partner</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="text-gray-300 hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
                <li><a href="mailto:support@joinbrightnest.com" className="text-gray-300 hover:text-white">Customer Support</a></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="text-sm text-gray-400 text-center">
              Copyright © 2025 BrightNest, Inc. All Rights Reserved
            </div>
          </div>
        </div>
      </footer>

      {/* Disclaimer */}
      <div className="bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-gray-500">
            *Results vary depending on your starting point, goals and effort. People on the BrightNest plan typically improve their financial habits by 85%. 
            <a href="#" className="underline">Reference: Financial Psychology Research</a>
          </p>
        </div>
      </div>
    </div>
  );
}
