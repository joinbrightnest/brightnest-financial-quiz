"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AffiliateOverview from "./AffiliateOverview";

interface CEOAnalyticsData {
  totalLeads: number;
  totalCompletions: number;
  conversionRate: number;
  avgCompletionTime: number;
  distinctArchetypes: number;
  assessmentCategories: number;
  dropOffRate: number;
  quizTypeDistribution: any[];
  archetypeDistribution: any[];
  leadsGrowth: any[];
  funnelData: any[];
  topPerformingQuiz: any;
  topArchetype: any;
  growthRate: number;
  averageSessionValue: number;
  totalRevenue: number;
}

export default function CEOAnalytics() {
  const [data, setData] = useState<CEOAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("30d");
  const [activeSection, setActiveSection] = useState<"overview" | "affiliates">("overview");

  useEffect(() => {
    fetchCEOAnalytics();
  }, [dateRange]);

  const fetchCEOAnalytics = async () => {
    try {
      setLoading(true);
      // Use the existing admin API for now, we'll enhance it with CEO-specific data
      const response = await fetch(`/api/admin/basic-stats?activity=daily`);
      if (!response.ok) {
        throw new Error("Failed to fetch CEO analytics");
      }
      const result = await response.json();
      
      // Transform the data to match CEO analytics format
      const ceoData = {
        totalLeads: result.visitors || 0,
        totalCompletions: result.leadsCollected || 0,
        conversionRate: result.completionRate || 0,
        avgCompletionTime: result.averageTimeMs ? Math.floor(result.averageTimeMs / 1000 / 60) : 0,
        distinctArchetypes: result.archetypeStats?.length || 0,
        assessmentCategories: result.quizTypes?.length || 0,
        dropOffRate: 100 - (result.completionRate || 0),
        quizTypeDistribution: result.quizTypes?.map((qt: any) => ({
          quizType: qt.name,
          count: Math.floor(Math.random() * 100) + 50, // Mock data
          conversionRate: 75
        })) || [],
        archetypeDistribution: result.archetypeStats?.map((as: any) => ({
          archetype: as.archetype,
          count: as._count.archetype,
          percentage: (as._count.archetype / (result.leadsCollected || 1)) * 100
        })) || [],
        leadsGrowth: [], // Mock data
        funnelData: [
          { stage: "Visitors", count: result.visitors || 0, percentage: 100 },
          { stage: "Quiz Starts", count: result.visitors || 0, percentage: 100 },
          { stage: "Completed", count: result.leadsCollected || 0, percentage: result.completionRate || 0 },
          { stage: "Booked Call", count: Math.floor((result.leadsCollected || 0) * 0.1), percentage: 10 },
          { stage: "Sale", count: Math.floor((result.leadsCollected || 0) * 0.05), percentage: 5 },
        ],
        topPerformingQuiz: null,
        topArchetype: null,
        growthRate: 12.5,
        averageSessionValue: 150,
        totalRevenue: Math.floor((result.leadsCollected || 0) * 0.05 * 150),
      };
      
      setData(ceoData);
      setError(null);
    } catch (err) {
      console.error("Error fetching CEO data:", err);
      setError(err instanceof Error ? err.message : "Failed to load CEO analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json' | 'crm') => {
    try {
      const response = await fetch('/api/export-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          dateRange,
          exportType: 'ceo-global'
        })
      });

      if (format === 'crm') {
        const result = await response.json();
        alert(`Data sent to CRM successfully! ${result.message || ''}`);
      } else {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ceo-analytics-${dateRange}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Export failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            {[...Array(5)].map((_, i) => (
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
            onClick={fetchCEOAnalytics}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const topQuizType = data.quizTypeDistribution.reduce((prev, current) => 
    prev.count > current.count ? prev : current
  );

  const topArchetype = data.archetypeDistribution.reduce((prev, current) => 
    prev.count > current.count ? prev : current
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">CEO Analytics</h2>
          <p className="text-gray-600 mt-1">
            Executive overview of all quiz performance and lead generation
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="all">All time</option>
          </select>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Export CSV
            </button>
            <button
              onClick={() => handleExport('crm')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              Send to CRM
            </button>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveSection("overview")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSection === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            📊 Global Overview
          </button>
          <button
            onClick={() => setActiveSection("affiliates")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSection === "affiliates"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            💼 Affiliate Performance
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeSection === "overview" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Global KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">🧍‍♂️</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Leads</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.totalLeads.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Completions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.totalCompletions.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.conversionRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Top Quiz by Volume</p>
                  <p className="text-lg font-bold text-gray-900 truncate">
                    {topQuizType.quizType.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <p className="text-xs text-gray-500">{topQuizType.count} completions</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <span className="text-2xl">🎭</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Top Archetype</p>
                  <p className="text-lg font-bold text-gray-900 truncate">
                    {topArchetype.archetype}
                  </p>
                  <p className="text-xs text-gray-500">{topArchetype.percentage.toFixed(1)}% of leads</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Leads Growth Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Leads Growth Over Time
              </h3>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl text-gray-400 mb-2">📈</div>
                  <p className="text-gray-500">Chart visualization would go here</p>
                  <p className="text-sm text-gray-400">
                    {data.leadsGrowth.length} data points available
                  </p>
                </div>
              </div>
            </div>

            {/* Funnel Conversion */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Funnel Conversion (Start → Sale)
              </h3>
              <div className="space-y-3">
                {data.funnelData.map((stage, index) => (
                  <div key={stage.stage} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {stage.stage}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {stage.count.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {stage.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
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
          <AffiliateOverview />
        </motion.div>
      )}
    </div>
  );
}
