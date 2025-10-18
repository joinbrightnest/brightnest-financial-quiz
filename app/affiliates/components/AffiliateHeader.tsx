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
      quiz: { color: "bg-blue-100 text-blue-800", label: "Quiz Affiliate" },
      creator: { color: "bg-green-100 text-green-800", label: "Creator Partner" },
      agency: { color: "bg-purple-100 text-purple-800", label: "Agency Partner" },
    };
    
    const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.quiz;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900">
                BrightNest
              </h1>
            </Link>
          </div>

          {/* Navigation - Centered */}
          <nav className="hidden md:flex space-x-8 flex-1 justify-center">
            <Link
              href="/affiliates/links"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              Links & Assets
            </Link>
            <Link
              href="/affiliates/payouts"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              Payouts
            </Link>
            <Link
              href="/affiliates/profile"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              Profile
            </Link>
          </nav>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {affiliate.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {affiliate.name}
                  </p>
                  <div className="flex items-center space-x-2">
                    {getTierBadge(affiliate.tier)}
                    <span className="text-xs text-gray-500">
                      {(affiliate.commissionRate * 100).toFixed(0)}% commission
                    </span>
                  </div>
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <Link
                    href="/affiliates/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowMenu(false)}
                  >
                    Profile Settings
                  </Link>
                  <Link
                    href="/affiliates/payouts"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowMenu(false)}
                  >
                    Payouts
                  </Link>
                  <div className="border-t border-gray-100"></div>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
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
