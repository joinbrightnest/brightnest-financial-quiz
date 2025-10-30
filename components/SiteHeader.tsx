"use client";

import Link from "next/link";
import { useState } from "react";

export default function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav aria-label="site-header" className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 sm:h-20">
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-2">
              <div className="text-2xl sm:text-3xl font-black text-gray-900 group-hover:text-[#FF6B6B] transition-colors">
                BrightNest
              </div>
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-1">
            <Link href="/about" className="px-4 py-2 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-100 hover:text-[#FF6B6B] transition-all">
              About Us
            </Link>
            <Link href="/blog" className="px-4 py-2 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-100 hover:text-[#FF6B6B] transition-all">
              Blog
            </Link>
            <Link href="/careers" className="px-4 py-2 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-100 hover:text-[#FF6B6B] transition-all">
              Careers
            </Link>
          </div>

          <div className="hidden lg:flex items-center">
            <Link href="/quiz/financial-profile" className="bg-gradient-to-r from-[#1ABC9C] to-[#16a085] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all">
              Learn More
            </Link>
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-[#FF6B6B] hover:bg-gray-100 rounded-lg focus:outline-none transition-all"
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

        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200/50 backdrop-blur-md">
            <div className="px-4 py-4 space-y-2">
              <Link href="/about" className="block px-4 py-3 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-100 hover:text-[#FF6B6B] transition-all" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
              <Link href="/blog" className="block px-4 py-3 text-[#FF6B6B] font-semibold text-sm rounded-lg bg-[#FF6B6B]/10" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
              <Link href="/careers" className="block px-4 py-3 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-100 hover:text-[#FF6B6B] transition-all" onClick={() => setIsMobileMenuOpen(false)}>Careers</Link>
              <div className="pt-2">
                <Link href="/quiz/financial-profile" className="block w-full bg-gradient-to-r from-[#1ABC9C] to-[#16a085] text-white px-4 py-3 rounded-full font-semibold text-sm text-center shadow-md" onClick={() => setIsMobileMenuOpen(false)}>
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}


