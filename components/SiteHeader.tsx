"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFreeToolsOpen, setIsFreeToolsOpen] = useState(false);
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
        className={`px-4 py-2.5 font-medium text-sm transition-all duration-200 relative rounded-lg group ${
          active 
            ? "text-teal-700 bg-teal-50/80 shadow-sm" 
            : "text-slate-700 hover:text-teal-700 hover:bg-teal-50/50"
        }`}
      >
        {children}
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
            <NavLink href="/faq">FAQ</NavLink>
            
            {/* Free Tools Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => {
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                  timeoutRef.current = null;
                }
                setIsFreeToolsOpen(true);
              }}
              onMouseLeave={() => {
                timeoutRef.current = setTimeout(() => {
                  setIsFreeToolsOpen(false);
                }, 150); // Small delay to allow moving to dropdown
              }}
            >
              <button
                className={`px-4 py-2.5 font-medium text-sm transition-all duration-200 group ${
                  isFreeToolsOpen 
                    ? "rounded-t-lg rounded-b-none" 
                    : "rounded-lg"
                } ${
                  pathname?.startsWith("/tools") || isFreeToolsOpen
                    ? "text-teal-700 bg-teal-50/80 shadow-sm" 
                    : "text-slate-700 hover:text-teal-700 hover:bg-teal-50/50"
                }`}
                onClick={() => setIsFreeToolsOpen(!isFreeToolsOpen)}
              >
                Free Tools
                <svg 
                  className={`inline-block ml-1.5 w-4 h-4 transition-transform duration-200 ${isFreeToolsOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {isFreeToolsOpen && (
                <div 
                  className="absolute left-0 top-full w-[300px] bg-white rounded-b-xl shadow-xl border border-slate-200/60 border-t-0 py-6 z-50 backdrop-blur-sm"
                  onMouseEnter={() => {
                    if (timeoutRef.current) {
                      clearTimeout(timeoutRef.current);
                      timeoutRef.current = null;
                    }
                    setIsFreeToolsOpen(true);
                  }}
                  onMouseLeave={() => {
                    timeoutRef.current = setTimeout(() => {
                      setIsFreeToolsOpen(false);
                    }, 150);
                  }}
                >
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

          <div className="flex items-center">
            <Link 
              href="/quiz/financial-profile" 
              className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:from-teal-700 hover:to-teal-800 transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] relative overflow-hidden group"
            >
              <span className="relative z-10">Get Started</span>
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
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
            className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-4 py-2 rounded-xl font-semibold text-xs hover:from-teal-700 hover:to-teal-800 transition-all duration-300 shadow-md hover:shadow-xl active:scale-95 whitespace-nowrap relative overflow-hidden group"
          >
            <span className="relative z-10">APPLY NOW</span>
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
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
                  className={`block px-4 py-3 font-medium text-sm rounded-lg transition-all duration-200 ${
                    isActive("/about") 
                      ? "text-teal-700 font-semibold bg-teal-50/80 shadow-sm" 
                      : "text-slate-700 hover:bg-teal-50/50 hover:text-teal-700"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About Us
                </Link>
                <Link 
                  href="/blog" 
                  className={`block px-4 py-3 font-medium text-sm rounded-lg transition-all duration-200 ${
                    isActive("/blog") 
                      ? "text-teal-700 font-semibold bg-teal-50/80 shadow-sm" 
                      : "text-slate-700 hover:bg-teal-50/50 hover:text-teal-700"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Blog
                </Link>
                <Link 
                  href="/faq" 
                  className={`block px-4 py-3 font-medium text-sm rounded-lg transition-all duration-200 ${
                    isActive("/faq") 
                      ? "text-teal-700 font-semibold bg-teal-50/80 shadow-sm" 
                      : "text-slate-700 hover:bg-teal-50/50 hover:text-teal-700"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  FAQ
                </Link>
                
                {/* Free Tools in Mobile */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="px-4 py-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Free Tools</p>
                  </div>
                  <Link 
                    href="/tools/budget-calculator" 
                    className={`block px-4 py-3 font-medium text-sm rounded-lg transition-all duration-200 ${
                      pathname === "/tools/budget-calculator" 
                        ? "text-teal-700 font-semibold bg-teal-50/80 shadow-sm" 
                        : "text-slate-700 hover:bg-teal-50/50 hover:text-teal-700"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Budget Calculator
                  </Link>
                  <Link 
                    href="/tools/debt-snowball-calculator" 
                    className={`block px-4 py-3 font-medium text-sm rounded-lg transition-all duration-200 ${
                      pathname === "/tools/debt-snowball-calculator" 
                        ? "text-teal-700 font-semibold bg-teal-50/80 shadow-sm" 
                        : "text-slate-700 hover:bg-teal-50/50 hover:text-teal-700"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Debt Snowball Calculator
                  </Link>
                </div>
                <div className="pt-2">
                  <Link 
                    href="/quiz/financial-profile" 
                    className="block w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white px-4 py-3 rounded-xl font-semibold text-sm text-center shadow-md hover:from-teal-700 hover:to-teal-800 transition-all duration-300 hover:shadow-xl active:scale-[0.98] relative overflow-hidden group" 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="relative z-10">Get Started</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
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


