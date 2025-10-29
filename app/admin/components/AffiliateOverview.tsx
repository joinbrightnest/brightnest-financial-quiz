"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AffiliateOverviewCards from "./AffiliateOverviewCards";
import AffiliatePerformanceTable from "./AffiliatePerformanceTable";
import AffiliateCharts from "./AffiliateCharts";

interface AffiliateData {
  totalActiveAffiliates: number;
  totalLeadsFromAffiliates: number;
  totalBookedCalls: number;
  totalSalesValue: number;
  totalCommissionsPaid: number;
  totalCommissionsPending: number;
  topAffiliates: AffiliatePerformance[];
  trafficSourceBreakdown: TrafficSource[];
  conversionFunnelByTier: ConversionFunnel[];
}

interface AffiliatePerformance {
  id: string;
  name: string;
  email: string;
  tier: string;
  clicks: number;
  quizStarts: number;
  leads: number;
  bookedCalls: number;
  sales: number;
  conversionRate: number;
  revenue: number;
  commission: number;
  lastActive: string;
}

interface TrafficSource {
  source: string;
  count: number;
  percentage: number;
}

interface ConversionFunnel {
  tier: string;
  clicks: number;
  quizStarts: number;
  completed: number;
  booked: number;
  closed: number;
}

interface AffiliateOverviewProps {
  externalDateRange?: string;
  externalTier?: string;
}

export default function AffiliateOverview({ externalDateRange, externalTier }: AffiliateOverviewProps = {}) {
  const [data, setData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("all");
  const [selectedTier, setSelectedTier] = useState("all");

  // Use external filters if provided, otherwise use internal state
  const effectiveDateRange = externalDateRange || dateRange;
  const effectiveTier = externalTier || selectedTier;

  const fetchAffiliateData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        dateRange: effectiveDateRange,
        tier: effectiveTier,
      });

      const response = await fetch(`/api/affiliates/overview?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch affiliate data");
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error("Error fetching affiliate data:", err);
      setError(err instanceof Error ? err.message : "Failed to load affiliate data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliateData();
  }, [effectiveDateRange, effectiveTier]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-96 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
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
            onClick={fetchAffiliateData}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-semibold hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Affiliate Performance
              </h2>
              <p className="text-slate-600 font-medium">
                Detailed affiliate analytics and performance tracking
              </p>
            </div>
          </div>
        </div>
        
        {/* Premium Filters - Hide if external filters are provided (controlled by parent) */}
        {!externalDateRange && !externalTier && (
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={effectiveDateRange}
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
            
            <div className="relative">
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <option value="all">All Tiers</option>
                <option value="quiz">Quiz Affiliates</option>
                <option value="creator">Creator Partners</option>
                <option value="agency">Agency Partners</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overview Cards */}
      <AffiliateOverviewCards data={data} />

      {/* Charts Section */}
      <AffiliateCharts 
        topAffiliates={data.topAffiliates}
        trafficSources={data.trafficSourceBreakdown}
        conversionFunnel={data.conversionFunnelByTier}
      />

      {/* Performance Table */}
      <AffiliatePerformanceTable 
        data={data.topAffiliates}
        loading={loading}
        onRefresh={fetchAffiliateData}
      />
    </div>
  );
}
