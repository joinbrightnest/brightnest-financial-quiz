"use client";

import Link from "next/link";
import { useState } from "react";

export default function BlogListenPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-[60] shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden lg:flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/" className="group flex items-center space-x-2">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-teal-700 bg-clip-text text-transparent group-hover:from-teal-600 group-hover:to-slate-700 transition-all duration-300">
                  BrightNest
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-8">
              <Link href="/about" className="px-3 py-2 text-slate-600 font-medium text-sm hover:text-teal-600 transition-colors duration-200 relative group">
                About Us
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link href="/blog" className="px-3 py-2 text-slate-900 font-medium text-sm border-b-2 border-teal-600">
                Blog
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

          {/* Mobile Layout */}
          <div className="lg:hidden flex items-center justify-between h-16">
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
              <div 
                className="fixed top-16 left-0 right-0 bottom-0 bg-black/50 z-50 lg:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <div className="lg:hidden absolute left-0 right-0 top-full bg-white border-b border-gray-200 shadow-lg z-[60]" style={{ animation: 'slideDown 0.3s ease-out' }}>
                <div className="px-4 py-4 space-y-1">
                  <Link href="/about" className="block px-4 py-3 text-slate-600 font-medium text-sm hover:bg-gray-50 hover:text-teal-600 rounded-md transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
                  <Link href="/blog" className="block px-4 py-3 text-teal-700 font-semibold text-sm bg-teal-50 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50/20 rounded-full blur-3xl"></div>
        
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/blog" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">
            ← Back to Blog
          </Link>
        </div>

        {/* Tabs - READ, WATCH, LISTEN */}
        <div className="mb-6 sm:mb-8">
          <div className="flex gap-4 sm:gap-6 border-b border-slate-200">
            <Link 
              href="/blog/read" 
              className="px-2 sm:px-4 py-3 text-lg sm:text-xl font-bold text-slate-900 hover:text-teal-600 transition-colors"
            >
              READ
            </Link>
            <Link 
              href="/blog/watch" 
              className="px-2 sm:px-4 py-3 text-lg sm:text-xl font-bold text-slate-900 hover:text-teal-600 transition-colors"
            >
              WATCH
            </Link>
            <Link 
              href="/blog/listen" 
              className="px-2 sm:px-4 py-3 text-lg sm:text-xl font-bold text-teal-600 border-b-2 border-teal-600"
            >
              LISTEN
            </Link>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">listen</h1>
        </div>

        {/* Coming Soon Content */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-8 sm:p-12 md:p-16 mb-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
              Coming Soon
            </h3>
            <p className="text-base sm:text-lg text-slate-600 max-w-md leading-relaxed">
              Exciting podcast episodes are on the way! We&apos;re preparing engaging conversations about money, mindset, and building wealth.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl mt-12 sm:mt-16">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-teal-700 to-teal-600"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-800/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="relative p-6 sm:p-12 text-center text-white">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
              Begin Your Journey To Financial Peace
            </h2>
            <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto opacity-95">
              Uncover what&apos;s holding you back from building lasting wealth and feeling confident with your money!
            </p>
            <Link
              href="/quiz/financial-profile"
              className="inline-block bg-white text-teal-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 duration-300"
            >
              TAKE THE QUIZ
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 sm:py-16 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12">
            <div>
              <Link href="/" className="text-2xl font-bold text-white mb-6 block">
                BrightNest
              </Link>
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

