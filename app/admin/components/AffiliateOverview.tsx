"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AffiliateOverviewCards from "./AffiliateOverviewCards";
import AffiliatePerformanceTable from "./AffiliatePerformanceTable";
import AffiliateCharts from "./AffiliateCharts";

interface AffiliateData {
  totalActiveAffiliates: number;
  totalLeadsFromAffiliates: number;
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
  tier: string;
  clicks: number;
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

export default function AffiliateOverview() {
  const [data, setData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("30d");
  const [selectedTier, setSelectedTier] = useState("all");

  useEffect(() => {
    fetchAffiliateData();
  }, [dateRange, selectedTier]);

  const fetchAffiliateData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        dateRange,
        tier: selectedTier,
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAffiliateData}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Affiliate Analytics</h2>
          <p className="text-gray-600 mt-1">
            Track affiliate performance, conversions, and revenue attribution
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="all">All time</option>
          </select>
          
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="all">All Tiers</option>
            <option value="quiz">Quiz Affiliates</option>
            <option value="creator">Creator Partners</option>
            <option value="agency">Agency Partners</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <AffiliateOverviewCards data={data} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AffiliateCharts 
          topAffiliates={data.topAffiliates}
          trafficSources={data.trafficSourceBreakdown}
          conversionFunnel={data.conversionFunnelByTier}
        />
      </div>

      {/* Performance Table */}
      <AffiliatePerformanceTable 
        data={data.topAffiliates}
        loading={loading}
        onRefresh={fetchAffiliateData}
      />
    </div>
  );
}
