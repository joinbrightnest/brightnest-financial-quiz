"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(path);
  };

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const active = isActive(href);
    return (
      <Link 
        href={href} 
        className={`px-3 py-2 font-medium text-sm transition-colors duration-200 relative group ${
          active 
            ? "text-slate-900" 
            : "text-slate-600 hover:text-teal-600"
        }`}
      >
        {children}
        {active ? (
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600"></span>
        ) : (
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 transition-all duration-200 group-hover:w-full"></span>
        )}
      </Link>
    );
  };

  return (
    <nav aria-label="site-header" className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-[60] shadow-sm relative">
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
            <NavLink href="/about">About Us</NavLink>
            <NavLink href="/blog">Blog</NavLink>
            <NavLink href="/careers">Careers</NavLink>
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
                <Link 
                  href="/about" 
                  className={`block px-4 py-3 font-medium text-sm rounded-md transition-all duration-200 ${
                    isActive("/about") 
                      ? "text-teal-700 font-semibold bg-teal-50" 
                      : "text-slate-600 hover:bg-gray-50 hover:text-teal-600"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About Us
                </Link>
                <Link 
                  href="/blog" 
                  className={`block px-4 py-3 font-medium text-sm rounded-md transition-all duration-200 ${
                    isActive("/blog") 
                      ? "text-teal-700 font-semibold bg-teal-50" 
                      : "text-slate-600 hover:bg-gray-50 hover:text-teal-600"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Blog
                </Link>
                <Link 
                  href="/careers" 
                  className={`block px-4 py-3 font-medium text-sm rounded-md transition-all duration-200 ${
                    isActive("/careers") 
                      ? "text-teal-700 font-semibold bg-teal-50" 
                      : "text-slate-600 hover:bg-gray-50 hover:text-teal-600"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Careers
                </Link>
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
  );
}


