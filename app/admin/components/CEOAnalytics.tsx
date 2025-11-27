"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AffiliateOverview from "./AffiliateOverview";
import CommissionPayoutManager from "./CommissionPayoutManager";

interface AffiliatePerformance {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  customLink: string;
  tier: string;
  commissionRate: number;
  visitors: number;
  quizStarts: number;
  completed: number;
  bookedCall: number;
  sales: number;
  clickToQuizRate: number;
  quizToCompletionRate: number;
  clickToCompletionRate: number;
  totalRevenue: number;
  totalCommission: number;
  createdAt: string;
  updatedAt: string;
}

interface CEOAnalyticsData {
  // Overall affiliate stats
  totalAffiliates: number;
  totalVisitors: number;
  totalQuizStarts: number;
  totalCompleted: number;
  totalBookedCalls: number;
  totalSales: number;
  totalRevenue: number;
  totalCommission: number; // Total earned (all time)
  totalPaidCommission: number; // Actually paid out
  overallClickToQuizRate: number;
  overallQuizToCompletionRate: number;
  overallClickToCompletionRate: number;
  overallClickToSalesRate: number;
  // Individual affiliate data
  affiliatePerformance: AffiliatePerformance[];
  topAffiliates: AffiliatePerformance[];
}

interface PendingAffiliate {
  id: string;
  name: string;
  email: string;
  tier: string;
  commissionRate: number;
  createdAt: string;
  referralCode: string;
}

interface CEOAnalyticsProps {
  initialData?: CEOAnalyticsData | null;
}

export default function CEOAnalytics({ initialData }: CEOAnalyticsProps) {
  const [data, setData] = useState<CEOAnalyticsData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("all");
  const [activeSection, setActiveSection] = useState<"overview" | "affiliates" | "pending" | "payouts">("overview");
  const [pendingAffiliates, setPendingAffiliates] = useState<PendingAffiliate[]>([]);
  const [editingTrackingLink, setEditingTrackingLink] = useState<string | null>(null);
  const [trackingLinkInput, setTrackingLinkInput] = useState<string>("");
  const [approvingAffiliate, setApprovingAffiliate] = useState<string | null>(null);

  // Set initial data only on first mount (ignore if dateRange changes)
  useEffect(() => {
    if (initialData && dateRange === "all" && !data) {
      setData(initialData);
      setLoading(false);
    }
  }, [initialData]);

  useEffect(() => {
    // Always fetch when dateRange changes (don't rely on cached initialData)
    fetchCEOAnalytics();
    fetchPendingAffiliates();
  }, [dateRange]);

  const fetchCEOAnalytics = async (bypassCache = false) => {
    try {
      setLoading(true);
      // Fetch affiliate performance data with date range
      const params = new URLSearchParams({ dateRange });
      if (bypassCache) {
        params.append('nocache', 'true');
      }
      const response = await fetch(`/api/admin/affiliate-performance?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch affiliate performance data");
      }
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        throw new Error(result.error || "Failed to load affiliate performance data");
      }
    } catch (err) {
      console.error("Error fetching affiliate performance data:", err);
      setError(err instanceof Error ? err.message : "Failed to load affiliate performance data");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingAffiliates = async () => {
    try {
      const response = await fetch("/api/admin/affiliates/pending");
      if (response.ok) {
        const result = await response.json();
        setPendingAffiliates(result.pendingAffiliates || []);
      }
    } catch (error) {
      console.error("Failed to fetch pending affiliates:", error);
    }
  };

  const handleApproveAffiliate = async (affiliateId: string, approved: boolean, customTrackingLink?: string) => {
    try {
      setApprovingAffiliate(affiliateId);

      const response = await fetch("/api/admin/affiliates/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affiliateId,
          approved,
          customTrackingLink: approved ? customTrackingLink : undefined
        }),
      });

      if (response.ok) {
        // Reset editing state
        setEditingTrackingLink(null);
        setTrackingLinkInput("");

        // Refresh pending affiliates list
        fetchPendingAffiliates();
        // Refresh affiliate overview
        if (activeSection === "affiliates") {
          // Trigger refresh of affiliate data
          fetchCEOAnalytics(true);
        }
      } else {
        const errorData = await response.json();
        alert(`Failed to update affiliate status: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Failed to approve affiliate:", error);
      alert("Failed to update affiliate status");
    } finally {
      setApprovingAffiliate(null);
    }
  };

  const startEditingTrackingLink = (affiliateId: string) => {
    setEditingTrackingLink(affiliateId);
    setTrackingLinkInput("");
  };

  const cancelEditingTrackingLink = () => {
    setEditingTrackingLink(null);
    setTrackingLinkInput("");
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
              ))}
            </div>
            <div className="h-96 bg-slate-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Data</h3>
              <p className="text-slate-600 mb-6">{error}</p>
              <button
                onClick={() => fetchCEOAnalytics(false)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-semibold hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Premium Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Affiliate Analytics
                  </h1>
                  <p className="text-slate-600 font-medium">
                    Advanced performance tracking and revenue attribution
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Refresh Button */}
              <button
                onClick={() => fetchCEOAnalytics(true)}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
              </button>

              {/* Date Range Filter - Always visible, only applies to Affiliate Performance tab */}
              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <option value="all">All Time</option>
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 inline-flex">
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveSection("overview")}
                className={`relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${activeSection === "overview"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Global Overview</span>
                </div>
              </button>
              <button
                onClick={() => setActiveSection("affiliates")}
                className={`relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${activeSection === "affiliates"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Affiliate Performance</span>
                </div>
              </button>
              <button
                onClick={() => setActiveSection("pending")}
                className={`relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${activeSection === "pending"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Pending Approval</span>
                  {pendingAffiliates.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-bold">
                      {pendingAffiliates.length}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveSection("payouts")}
                className={`relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${activeSection === "payouts"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span>Commission Payouts</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeSection === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Premium KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Active Affiliates</p>
                      <p className="text-3xl font-bold text-slate-900 mt-1">
                        {data.totalAffiliates}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Visitors</p>
                      <p className="text-3xl font-bold text-slate-900 mt-1">
                        {data.totalVisitors.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Revenue</p>
                      <p className="text-3xl font-bold text-slate-900 mt-1">
                        ${data.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Conversion Rate</p>
                      <p className="text-3xl font-bold text-slate-900 mt-1">
                        {data.overallClickToCompletionRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Top Affiliate</p>
                      <p className="text-3xl font-bold text-slate-900 mt-1 truncate">
                        {data.topAffiliates[0]?.name || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Program Health & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Program Performance Funnel */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Program Performance Funnel</h3>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        1
                      </div>
                      <span className="text-sm font-semibold text-slate-700">Total Visitors</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {data.totalVisitors.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">100.0%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        2
                      </div>
                      <span className="text-sm font-semibold text-slate-700">Quiz Starts</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {data.totalQuizStarts.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        {data.overallClickToQuizRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        3
                      </div>
                      <span className="text-sm font-semibold text-slate-700">Completed</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {data.totalCompleted.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        {data.overallQuizToCompletionRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        4
                      </div>
                      <span className="text-sm font-semibold text-slate-700">Booked Calls</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {data.totalBookedCalls.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        {data.totalCompleted > 0 ? ((data.totalBookedCalls / data.totalCompleted) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        5
                      </div>
                      <span className="text-sm font-semibold text-slate-700">Sales</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {data.totalSales.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        {data.totalBookedCalls > 0 ? ((data.totalSales / data.totalBookedCalls) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Program Health Metrics */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Program Health Metrics</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Total Commissions</p>
                        <p className="text-xs text-slate-500 font-medium">Earned by affiliates</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        ${data.totalCommission.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Avg Revenue per Affiliate</p>
                        <p className="text-xs text-slate-500 font-medium">Program efficiency</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        ${data.totalAffiliates > 0 ? Math.round(data.totalRevenue / data.totalAffiliates) : 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Active Affiliate Rate</p>
                        <p className="text-xs text-slate-500 font-medium">Generating traffic</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {data.totalAffiliates > 0 ? Math.round((data.affiliatePerformance.filter(a => a.visitors > 0).length / data.totalAffiliates) * 100) : 0}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Top Performer Share</p>
                        <p className="text-xs text-slate-500 font-medium">Revenue concentration</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {data.totalRevenue > 0 && data.topAffiliates[0] ? Math.round((data.topAffiliates[0].totalRevenue / data.totalRevenue) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === "affiliates" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AffiliateOverview externalDateRange={dateRange} />
          </motion.div>
        )}

        {activeSection === "pending" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Pending Affiliate Approvals
                </h3>
                {pendingAffiliates.length > 0 && (
                  <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-semibold">
                    {pendingAffiliates.length} pending
                  </span>
                )}
              </div>

              {pendingAffiliates.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">All Caught Up!</h4>
                  <p className="text-slate-600">No pending affiliate approvals at the moment.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingAffiliates.map((affiliate) => (
                    <div key={affiliate.id} className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-6">
                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-xl">
                                {affiliate.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-xl mb-1">{affiliate.name}</h4>
                              <p className="text-slate-600 font-medium">{affiliate.email}</p>
                              <div className="flex items-center space-x-3 mt-3">
                                <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-xs font-semibold">
                                  {affiliate.tier} tier
                                </span>
                                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                                  {(affiliate.commissionRate * 100).toFixed(0)}% commission
                                </span>
                                <span className="text-xs text-slate-500 font-medium">
                                  Applied: {new Date(affiliate.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Premium Tracking Link Customization */}
                          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-6 mb-6 border border-slate-200">
                            <div className="flex items-center space-x-2 mb-4">
                              <div className="p-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                              </div>
                              <h5 className="text-sm font-bold text-slate-900">Custom Tracking Link</h5>
                            </div>
                            {editingTrackingLink === affiliate.id ? (
                              <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm text-slate-600 font-medium bg-white px-3 py-2 rounded-lg border border-slate-200">https://joinbrightnest.com/</span>
                                  <input
                                    type="text"
                                    value={trackingLinkInput}
                                    onChange={(e) => setTrackingLinkInput(e.target.value)}
                                    placeholder="e.g., special-offer, john-doe, exclusive-deal"
                                    className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm font-medium text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                  />
                                </div>
                                <div className="flex items-center space-x-3">
                                  <button
                                    onClick={() => handleApproveAffiliate(affiliate.id, true, trackingLinkInput)}
                                    disabled={approvingAffiliate === affiliate.id}
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl text-sm font-semibold hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {approvingAffiliate === affiliate.id ? "Approving..." : "Approve & Activate"}
                                  </button>
                                  <button
                                    onClick={cancelEditingTrackingLink}
                                    className="inline-flex items-center px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 shadow-sm hover:shadow-md transition-all duration-200"
                                  >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cancel
                                  </button>
                                </div>
                                <p className="text-xs text-slate-600 font-medium">
                                  Leave empty to keep the auto-generated link, or enter a custom one. This will be the permanent tracking link for this affiliate.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="text"
                                    value={`Auto-generated: ${affiliate.referralCode}`}
                                    readOnly
                                    className="flex-1 px-4 py-3 border border-slate-300 rounded-xl bg-slate-100 text-sm text-slate-600 font-medium"
                                  />
                                  <button
                                    onClick={() => startEditingTrackingLink(affiliate.id)}
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200"
                                  >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Customize Link
                                  </button>
                                </div>
                                <p className="text-xs text-slate-600 font-medium">
                                  Click &quot;Customize Link&quot; to set a custom tracking link, or approve with the auto-generated one.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-3 ml-6">
                          {editingTrackingLink !== affiliate.id && (
                            <>
                              <button
                                onClick={() => handleApproveAffiliate(affiliate.id, true)}
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl text-sm font-semibold hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Approve (Auto Link)
                              </button>
                              <button
                                onClick={() => startEditingTrackingLink(affiliate.id)}
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Customize Link
                              </button>
                              <button
                                onClick={() => handleApproveAffiliate(affiliate.id, false)}
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-semibold hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeSection === "payouts" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CommissionPayoutManager dateRange={dateRange} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
