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
      {/* Top Purple Bar */}
      <div className="w-full h-1 bg-[#5C4F6B]"></div>
      
      {/* Navigation */}
      <nav className="bg-[#F8F7F0] border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo - Left Side */}
            <div className="flex items-center">
              <Link href={getLink("/")} className="text-xl sm:text-2xl font-bold text-gray-900">
                BrightNest
              </Link>
            </div>
            
            {/* Desktop Menu Items - Hidden on Mobile */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link href={getLink("/quiz/financial-profile")} className="text-gray-900 font-medium text-sm uppercase tracking-wide hover:text-gray-700 transition-colors">
                FINANCIAL PROFILE
              </Link>
              <Link href={getLink("/quiz/health-finance")} className="text-gray-900 font-medium text-sm uppercase tracking-wide hover:text-gray-700 transition-colors">
                HEALTH FINANCE
              </Link>
              <Link href={getLink("/quiz/marriage-finance")} className="text-gray-900 font-medium text-sm uppercase tracking-wide hover:text-gray-700 transition-colors">
                MARRIAGE FINANCE
              </Link>
              <Link href={getLink("/book-call")} className="text-gray-900 font-medium text-sm uppercase tracking-wide hover:text-gray-700 transition-colors">
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
              <Link href={getLink("/quiz/financial-profile")} className="bg-[#1ABC9C] text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-[#16a085] transition-colors">
                Learn More
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-900 hover:text-gray-700 focus:outline-none focus:text-gray-700"
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
            </div>
          </div>

          {/* Mobile Menu - Dropdown */}
          {isMobileMenuOpen && (
            <div className="lg:hidden bg-[#F8F7F0] border-t border-gray-300">
              <div className="px-4 py-4 space-y-4">
                <Link 
                  href={getLink("/quiz/financial-profile")} 
                  className="block text-gray-900 font-medium text-sm uppercase tracking-wide hover:text-gray-700 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Financial Profile
                </Link>
                <Link 
                  href={getLink("/quiz/health-finance")} 
                  className="block text-gray-900 font-medium text-sm uppercase tracking-wide hover:text-gray-700 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Health Finance
                </Link>
                <Link 
                  href={getLink("/quiz/marriage-finance")} 
                  className="block text-gray-900 font-medium text-sm uppercase tracking-wide hover:text-gray-700 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Marriage Finance
                </Link>
                <Link 
                  href={getLink("/book-call")} 
                  className="block text-gray-900 font-medium text-sm uppercase tracking-wide hover:text-gray-700 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Book Call
                </Link>
                
                {/* Mobile CTA Button */}
                <div className="pt-4 border-t border-gray-300">
                  <Link 
                    href={getLink("/quiz/financial-profile")} 
                    className="block w-full bg-[#1ABC9C] text-white px-4 py-3 rounded-md font-medium text-sm text-center hover:bg-[#16a085] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-6">
            {/* Logo and Social */}
            <div className="sm:col-span-2 md:col-span-1">
              <Link href={getLink("/")} className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 block">
                BrightNest
              </Link>
              <div className="flex space-x-4">
                <a href="#" className="text-white hover:text-orange-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-orange-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-orange-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-orange-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href={getLink("/book-call")} className="text-gray-300 hover:text-white">Contact Us</Link></li>
                <li><Link href="/affiliates/signup" className="text-gray-300 hover:text-white">Become a Partner</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href={getLink("/book-call")} className="text-gray-300 hover:text-white">Book a Call</Link></li>
                <li><Link href={getLink("/quiz/financial-profile")} className="text-gray-300 hover:text-white">Financial Profile Quiz</Link></li>
                <li><Link href={getLink("/quiz/health-finance")} className="text-gray-300 hover:text-white">Health Finance Quiz</Link></li>
                <li><Link href={getLink("/quiz/marriage-finance")} className="text-gray-300 hover:text-white">Marriage Finance Quiz</Link></li>
              </ul>
            </div>

            {/* Languages */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide mb-4">Languages</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-gray-300 hover:text-white">English</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Spanish</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">French</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">German</Link></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              Copyright © 2025 BrightNest, Inc. All Rights Reserved
            </div>
            <div className="flex space-x-4 text-sm">
              <Link href={getLink("/book-call")} className="text-gray-400 hover:text-white underline">Contact Us</Link>
              <span className="text-gray-600">|</span>
              <Link href="/terms" className="text-gray-400 hover:text-white underline">Terms and Conditions</Link>
              <span className="text-gray-600">|</span>
              <Link href="/privacy" className="text-gray-400 hover:text-white underline">Privacy Policy</Link>
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
