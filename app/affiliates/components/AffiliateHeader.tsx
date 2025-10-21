"use client";

import { useState } from "react";
import Link from "next/link";

interface AffiliateData {
  id: string;
  name: string;
  email: string;
  tier: string;
  referralCode: string;
  customLink: string;
  commissionRate: number;
  totalClicks: number;
  totalLeads: number;
  totalBookings: number;
  totalSales: number;
  totalCommission: number;
  isApproved: boolean;
}

interface AffiliateHeaderProps {
  affiliate: AffiliateData;
  onLogout: () => void;
}

export default function AffiliateHeader({ affiliate, onLogout }: AffiliateHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getTierBadge = (tier: string) => {
    const tierConfig = {
      quiz: { 
        color: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200", 
        label: "Quiz Affiliate",
        icon: "📊"
      },
      creator: { 
        color: "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-200", 
        label: "Creator Partner",
        icon: "✨"
      },
      agency: { 
        color: "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-200", 
        label: "Agency Partner",
        icon: "🏢"
      },
    };
    
    const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.quiz;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.color} shadow-sm`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  return (
    <header className="bg-gradient-to-r from-white via-gray-50 to-white shadow-lg border-b border-gray-200/50 backdrop-blur-sm relative z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center py-5">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 group">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  BrightNest
                </h1>
              </div>
            </Link>
          </div>

          {/* Navigation - Centered */}
          <nav className="hidden md:flex space-x-1 flex-1 justify-center">
            <Link
              href="/affiliates/links"
              className="relative text-gray-700 hover:text-indigo-600 px-4 py-2 text-sm font-medium rounded-lg hover:bg-indigo-50 transition-all duration-200 group"
            >
              <span className="relative z-10">Links & Assets</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </Link>
            <Link
              href="/affiliates/payouts"
              className="relative text-gray-700 hover:text-indigo-600 px-4 py-2 text-sm font-medium rounded-lg hover:bg-indigo-50 transition-all duration-200 group"
            >
              <span className="relative z-10">Payouts</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </Link>
            <Link
              href="/affiliates/profile"
              className="relative text-gray-700 hover:text-indigo-600 px-4 py-2 text-sm font-medium rounded-lg hover:bg-indigo-50 transition-all duration-200 group"
            >
              <span className="relative z-10">Profile</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </Link>
          </nav>

          {/* User Menu */}
          <div className="relative ml-auto">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center space-x-3 text-sm rounded-xl bg-white/80 hover:bg-white border border-gray-200/50 hover:border-gray-300 px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                    <span className="text-sm font-bold text-white">
                      {affiliate.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    {affiliate.name}
                  </p>
                  <div className="flex items-center space-x-2">
                    {getTierBadge(affiliate.tier)}
                    <span className="text-xs text-gray-600 font-medium">
                      {(affiliate.commissionRate * 100).toFixed(0)}% commission
                    </span>
                  </div>
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl ring-1 ring-gray-200/50 border border-gray-100/50 z-[9999] overflow-hidden">
                <div className="py-2">
                  <div className="px-4 py-3 border-b border-gray-100/50">
                    <p className="text-sm font-semibold text-gray-900">{affiliate.name}</p>
                    <p className="text-xs text-gray-600">{affiliate.email}</p>
                  </div>
                  <Link
                    href="/affiliates/profile"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 group"
                    onClick={() => setShowMenu(false)}
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-500 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile Settings
                  </Link>
                  <Link
                    href="/affiliates/payouts"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 group"
                    onClick={() => setShowMenu(false)}
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-500 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Payouts
                  </Link>
                  <div className="border-t border-gray-100/50 my-1"></div>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onLogout();
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 group"
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-500 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
