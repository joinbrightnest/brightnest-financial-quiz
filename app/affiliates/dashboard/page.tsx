"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AffiliateHeader from "../components/AffiliateHeader";
import AffiliatePerformanceChart from "../components/AffiliatePerformanceChart";

interface AffiliateData {
  id: string;
  name: string;
  email: string;
  tier: string;
  referralCode: string;
  customLink: string;
  customTrackingLink?: string;
  commissionRate: number;
  totalClicks: number;
  totalLeads: number;
  totalBookings: number;
  totalSales: number;
  totalCommission: number;
  isApproved: boolean;
}

interface AffiliateStats {
  totalClicks: number;
  totalLeads: number;
  totalBookings: number;
  totalSales: number;
  totalCommission: number;
  conversionRate: number;
  averageSaleValue: number;
  pendingCommission: number;
  paidCommission: number;
  dailyStats: Array<{
    date: string;
    clicks: number;
    leads: number;
    sales: number;
    commission: number;
  }>;
}

export default function AffiliateDashboard() {
  const router = useRouter();
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("30d");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (affiliate) {
      fetchStats();
    }
  }, [affiliate, dateRange]);

  const checkAuth = async () => {
    const token = localStorage.getItem("affiliate_token");
    const affiliateId = localStorage.getItem("affiliate_id");
    
    if (!token || !affiliateId) {
      router.push("/affiliates/login");
      return;
    }

    // For now, use the affiliate profile API to get basic affiliate data
    try {
      const response = await fetch("/api/affiliate/profile", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const affiliateData = await response.json();
        setAffiliate(affiliateData);
      } else {
        // If profile API fails, redirect to login
        console.log("Profile API failed, redirecting to login");
        localStorage.removeItem("affiliate_token");
        localStorage.removeItem("affiliate_id");
        router.push("/affiliates/login");
        return;
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Redirect to login on auth failure
      localStorage.removeItem("affiliate_token");
      localStorage.removeItem("affiliate_id");
      router.push("/affiliates/login");
      return;
    }
  };

  const fetchStats = async (forceRefresh = false) => {
    if (!affiliate) return;

    try {
      setLoading(true);
      
      // Fetch affiliate stats using the simplified API
      console.log("Fetching affiliate stats...");
      
      // Use the new simplified affiliate stats API
      // Use custom tracking link if it exists, otherwise use referral code
      const affiliateCode = affiliate.customTrackingLink 
        ? affiliate.customTrackingLink.replace('/', '') 
        : affiliate.referralCode;
      
      console.log("Fetching affiliate data for:", affiliateCode);
      
      // Add cache-busting parameter to ensure fresh data
      const cacheBuster = forceRefresh ? `&_t=${Date.now()}` : '';
      const response = await fetch(`/api/admin/affiliate-stats?affiliateCode=${affiliateCode}&dateRange=${dateRange}${cacheBuster}`);

      if (response.ok) {
        const data = await response.json();
        console.log("Full API response:", data);
        
        if (data.stats) {
          console.log("Using real affiliate data:", data.stats);
          setStats(data.stats);
          setError(null);
        } else {
          console.log("No affiliate data found in response");
          setError("No affiliate data available");
        }
      } else {
        console.log("API failed with status:", response.status);
        const errorText = await response.text();
        console.log("API error response:", errorText);
        setError("Failed to fetch affiliate data");
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to load affiliate statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("affiliate_token");
    localStorage.removeItem("affiliate_id");
    router.push("/affiliates/login");
  };

  if (loading && !affiliate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading affiliate dashboard...</p>
        </div>
      </div>
    );
  }

  if (!affiliate) {
    return null;
  }

  if (!affiliate.isApproved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">Account Pending Approval</h2>
            <p className="text-yellow-600 mb-4">
              Your affiliate account is pending approval. You'll receive an email once it's approved.
            </p>
            <button
              onClick={handleLogout}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AffiliateHeader 
        affiliate={affiliate} 
        onLogout={handleLogout}
      />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Welcome back, {affiliate.name}!
          </h1>
                  <p className="text-slate-600 font-medium">
            Track your performance and earnings as a {affiliate.tier} affiliate
          </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm hover:shadow-md transition-all duration-200"
          >
                  <option value="1d">24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
                  <option value="custom">Custom</option>
          </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <button
                onClick={() => fetchStats(true)}
                disabled={loading}
                className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg 
                  className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Premium Tracking Link Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-all duration-300 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Your Affiliate Link</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full text-xs font-semibold">
                Active
              </span>
            </div>
        </div>

          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6">
            <h3 className="text-sm font-bold text-emerald-900 mb-4">Your Tracking Link</h3>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={affiliate.customTrackingLink || `https://joinbrightnest.com/${affiliate.referralCode}`}
                readOnly
                className="flex-1 px-4 py-3 border border-emerald-300 rounded-xl bg-white text-sm font-mono text-black shadow-sm"
              />
              <button
                onClick={() => navigator.clipboard.writeText(affiliate.customTrackingLink || `https://joinbrightnest.com/${affiliate.referralCode}`)}
                className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl text-sm font-semibold hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </div>
            <div className="flex items-center mt-4 p-3 bg-white rounded-lg border border-emerald-200">
              <div className="w-5 h-5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-emerald-800 font-medium">
                Share this link to start earning commissions from your referrals
              </p>
            </div>
          </div>
        </motion.div>

        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-8"
          >
            {/* Premium Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Clicks</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalClicks.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Leads</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalLeads.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Booked Calls</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalBookings.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Commission</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">${stats.totalCommission.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Chart */}
            <AffiliatePerformanceChart 
              dailyStats={stats.dailyStats}
              loading={loading}
            />

              {/* Conversion Funnel */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">Conversion Funnel</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        1
                      </div>
                      <span className="text-sm font-semibold text-slate-900">Clicks</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">{stats.totalClicks.toLocaleString()}</p>
                      <p className="text-xs text-slate-600 font-medium">100.0%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        2
                      </div>
                      <span className="text-sm font-semibold text-slate-900">Quiz Starts</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">{stats.totalClicks.toLocaleString()}</p>
                      <p className="text-xs text-slate-600 font-medium">100.0%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        3
                      </div>
                      <span className="text-sm font-semibold text-slate-900">Quiz Completions</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">{stats.totalLeads.toLocaleString()}</p>
                      <p className="text-xs text-slate-600 font-medium">{stats.totalClicks > 0 ? ((stats.totalLeads / stats.totalClicks) * 100).toFixed(1) : 0}%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        4
                      </div>
                      <span className="text-sm font-semibold text-slate-900">Booked Calls</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">{stats.totalBookings.toLocaleString()}</p>
                      <p className="text-xs text-slate-600 font-medium">{stats.totalClicks > 0 ? ((stats.totalBookings / stats.totalClicks) * 100).toFixed(1) : 0}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
          </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
