"use client";

import Link from "next/link";
import { useState } from "react";

interface SharedHomePageProps {
  affiliateCode?: string;
}

export default function SharedHomePage({ affiliateCode }: SharedHomePageProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Helper function to generate affiliate-aware links
  const getLink = (path: string) => {
    if (affiliateCode) {
      return `/${affiliateCode}${path}`;
    }
    return path;
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#faf8f0'}}>
      {/* Navigation - Professional with Depth */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
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
            </div>
            
            {/* Right Side Items */}
            <div className="flex items-center">
              <Link href={getLink("/quiz/financial-profile")} className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:from-teal-700 hover:to-teal-800 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02]">
                Learn More
              </Link>
            </div>
          </div>

          {/* Mobile Layout: Menu Icon | Logo | Button */}
          <div className="lg:hidden flex items-center h-16 relative">
            {/* Menu Icon - Left */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 focus:outline-none transition-all duration-200 z-10"
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

            {/* Logo - Center (absolute positioning for perfect centering) */}
            <Link href={getLink("/")} className="absolute left-1/2 transform -translate-x-1/2 group z-10">
              <div className="text-xl font-bold bg-gradient-to-r from-slate-900 to-teal-700 bg-clip-text text-transparent group-hover:from-teal-600 group-hover:to-slate-700 transition-all duration-300 whitespace-nowrap">
                BrightNest
              </div>
            </Link>

            {/* Button - Right */}
            <Link 
              href={getLink("/quiz/financial-profile")} 
              className="ml-auto bg-gradient-to-r from-teal-600 to-teal-700 text-white px-4 py-2 rounded-full font-semibold text-xs hover:from-teal-700 hover:to-teal-800 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap z-10"
            >
              APPLY NOW
            </Link>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 bg-white">
              <div className="px-4 py-4 space-y-1">
                <Link href="/about" className="block px-4 py-3 text-slate-600 font-medium text-sm hover:bg-gray-50 hover:text-teal-600 rounded-md transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
                <Link href="/blog" className="block px-4 py-3 text-slate-600 font-medium text-sm hover:bg-gray-50 hover:text-teal-600 rounded-md transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
                <Link href="/careers" className="block px-4 py-3 text-slate-600 font-medium text-sm hover:bg-gray-50 hover:text-teal-600 rounded-md transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>Careers</Link>
                <div className="pt-2">
                  <Link href={getLink("/quiz/financial-profile")} className="block w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white px-4 py-3 rounded-lg font-semibold text-sm text-center shadow-md hover:from-teal-700 hover:to-teal-800 transition-all duration-300" onClick={() => setIsMobileMenuOpen(false)}>
                    Start Your Quiz
                  </Link>
                </div>
              </div>
            </div>
          )}
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
                        <span className="text-sm sm:text-lg">🌱</span>
                        <span className="text-xs sm:text-sm font-medium text-gray-700">I save automatically</span>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-purple-600">+65%</span>
              </div>
            </div>
            
                  {/* Bottom Message */}
                  <div className="text-center pt-1 sm:pt-2">
                    <div className="text-xs sm:text-sm font-medium text-gray-700">Small wins, lasting change.</div>
                </div>
                </div>
              </div>
              
              {/* Subtle Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-2xl sm:rounded-3xl blur-xl -z-10 animate-pulse"></div>
                </div>
              </div>
              
          
          {/* 6️⃣ Primary CTA */}
          <div className="mb-6 sm:mb-8">
            <Link
              href={getLink("/quiz/financial-profile")}
              className="inline-block bg-[#FF5C41] text-white px-8 py-4 sm:px-12 sm:py-5 lg:px-16 lg:py-6 text-base sm:text-lg font-semibold hover:bg-[#e54a2f] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 rounded-lg w-full sm:w-auto"
            >
              Start My Money Reset
            </Link>
            <p className="text-xs text-gray-500 mt-4 sm:mt-8 px-4 sm:px-0">
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
                <li><Link href="/affiliates/signup" className="text-gray-300 hover:text-white">Become a Partner</Link></li>
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
