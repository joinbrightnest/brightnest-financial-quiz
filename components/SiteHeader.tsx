"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFreeToolsOpen, setIsFreeToolsOpen] = useState(false);
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
            
            {/* Free Tools Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsFreeToolsOpen(true)}
              onMouseLeave={() => setIsFreeToolsOpen(false)}
            >
              <button
                className={`px-3 py-2 font-medium text-sm transition-colors duration-200 relative group ${
                  pathname?.startsWith("/tools")
                    ? "text-slate-900" 
                    : "text-slate-600 hover:text-teal-600"
                }`}
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
                {pathname?.startsWith("/tools") && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600"></span>
                )}
              </button>
              
              {/* Dropdown Menu */}
              {isFreeToolsOpen && (
                <div className="absolute left-0 top-full mt-2 w-[600px] bg-white rounded-lg shadow-xl border border-slate-200 py-6 z-50">
                  <div className="grid grid-cols-4 gap-6 px-6">
                    {/* Column 1 */}
                    <div>
                      <h3 className="font-bold text-slate-900 mb-3 text-sm">Getting Started</h3>
                      <ul className="space-y-2 text-sm">
                        <li><Link href="/quiz/financial-profile" className="text-slate-600 hover:text-teal-600 transition-colors">Get Started Assessment</Link></li>
                      </ul>
                      
                      <h3 className="font-bold text-slate-900 mt-6 mb-3 text-sm">Budgeting</h3>
                      <ul className="space-y-2 text-sm">
                        <li><Link href="/tools/budget-calculator" className="text-teal-600 hover:text-teal-700 font-medium">Budget Calculator</Link></li>
                        <li><Link href="/tools/budget-calculator" className="text-slate-600 hover:text-teal-600 transition-colors">Budgeting Guide</Link></li>
                        <li><Link href="/tools/budget-calculator" className="text-slate-600 hover:text-teal-600 transition-colors">Budgeting Forms</Link></li>
                      </ul>
                      
                      <h3 className="font-bold text-slate-900 mt-6 mb-3 text-sm">Saving</h3>
                      <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="text-slate-400 cursor-not-allowed">Money Finder Challenge</Link></li>
                        <li><Link href="#" className="text-slate-400 cursor-not-allowed">College Savings Calculator</Link></li>
                      </ul>
                    </div>
                    
                    {/* Column 2 */}
                    <div>
                      <h3 className="font-bold text-slate-900 mb-3 text-sm">Debt</h3>
                      <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="text-slate-400 cursor-not-allowed">Debt Snowball Calculator</Link></li>
                        <li><Link href="#" className="text-slate-400 cursor-not-allowed">Student Loan Payoff Calculator</Link></li>
                      </ul>
                      
                      <h3 className="font-bold text-slate-900 mt-6 mb-3 text-sm">Retirement</h3>
                      <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="text-slate-400 cursor-not-allowed">Retirement Calculator</Link></li>
                        <li><Link href="#" className="text-slate-400 cursor-not-allowed">Investment Calculator</Link></li>
                        <li><Link href="#" className="text-slate-400 cursor-not-allowed">Net Worth Calculator</Link></li>
                        <li><Link href="#" className="text-slate-400 cursor-not-allowed">Compound Interest Calculator</Link></li>
                      </ul>
                      
                      <h3 className="font-bold text-slate-900 mt-6 mb-3 text-sm">Investing</h3>
                      <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="text-slate-400 cursor-not-allowed">Investing Guide</Link></li>
                        <li><Link href="#" className="text-slate-400 cursor-not-allowed">Estate Planning Guide</Link></li>
                      </ul>
                    </div>
                    
                    {/* Column 3 */}
                    <div>
                      <h3 className="font-bold text-slate-900 mb-3 text-sm">Insurance</h3>
                      <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="text-slate-400 cursor-not-allowed">Coverage Checkup</Link></li>
                        <li><Link href="#" className="text-slate-400 cursor-not-allowed">Term Life Insurance Calculator</Link></li>
                      </ul>
                      
                      <h3 className="font-bold text-slate-900 mt-6 mb-3 text-sm">Real Estate</h3>
                      <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="text-slate-400 cursor-not-allowed">Mortgage Calculator</Link></li>
                        <li><Link href="#" className="text-slate-400 cursor-not-allowed">Mortgage Payoff Calculator</Link></li>
                        <li><Link href="#" className="text-slate-400 cursor-not-allowed">Cost of Living Calculator</Link></li>
                        <li><Link href="#" className="text-slate-400 cursor-not-allowed">Home Sellers Guide</Link></li>
                        <li><Link href="#" className="text-slate-400 cursor-not-allowed">Home Buyers Guide</Link></li>
                      </ul>
                      
                      <h3 className="font-bold text-slate-900 mt-6 mb-3 text-sm">Wills</h3>
                      <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="text-slate-400 cursor-not-allowed">Online Will vs. Lawyer? Quiz</Link></li>
                      </ul>
                    </div>
                    
                    {/* Column 4 */}
                    <div>
                      <h3 className="font-bold text-slate-900 mb-3 text-sm">Taxes</h3>
                      <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="text-slate-400 cursor-not-allowed">Tax Pro or Self-File? Quiz</Link></li>
                        <li><Link href="#" className="text-slate-400 cursor-not-allowed">Tax Guide</Link></li>
                      </ul>
                      
                      <h3 className="font-bold text-slate-900 mt-6 mb-3 text-sm">Career</h3>
                      <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="text-slate-400 cursor-not-allowed">Career Clarity Guide</Link></li>
                        <li><Link href="#" className="text-slate-400 cursor-not-allowed">Resumé Guide</Link></li>
                        <li><Link href="#" className="text-slate-400 cursor-not-allowed">Interview Guide</Link></li>
                      </ul>
                      
                      <h3 className="font-bold text-slate-900 mt-6 mb-3 text-sm">Business</h3>
                      <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="text-slate-400 cursor-not-allowed">Business Assessment</Link></li>
                      </ul>
                      
                      <h3 className="font-bold text-slate-900 mt-6 mb-3 text-sm">Mental Health</h3>
                      <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="text-slate-400 cursor-not-allowed">Anxiety Test</Link></li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-slate-200 px-6">
                    <Link href="/tools" className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center gap-2">
                      See All Free Tools
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              )}
            </div>
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
                
                {/* Free Tools in Mobile */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="px-4 py-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Free Tools</p>
                  </div>
                  <Link 
                    href="/tools/budget-calculator" 
                    className={`block px-4 py-3 font-medium text-sm rounded-md transition-all duration-200 ${
                      pathname === "/tools/budget-calculator" 
                        ? "text-teal-700 font-semibold bg-teal-50" 
                        : "text-slate-600 hover:bg-gray-50 hover:text-teal-600"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Budget Calculator
                  </Link>
                  <Link 
                    href="/tools" 
                    className="block px-4 py-3 font-medium text-sm rounded-md transition-all duration-200 text-slate-600 hover:bg-gray-50 hover:text-teal-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    See All Tools
                  </Link>
                </div>
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


