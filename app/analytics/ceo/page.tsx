"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AnalyticsData } from "../types";

export default function CEODashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("30d");

  useEffect(() => {
    fetchCEOData();
  }, [dateRange]);

  const fetchCEOData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/ceo?dateRange=${dateRange}`);
      if (!response.ok) {
        throw new Error("Failed to fetch CEO analytics");
      }
      const result = await response.json();
      setData(result);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CEO dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchCEOData}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                CEO Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Global overview of all quiz performance and lead generation
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global KPIs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
        >
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
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Leads Growth Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
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
          </motion.div>

          {/* Funnel Conversion */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
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
          </motion.div>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performing Quiz Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Performing Quiz Types
            </h3>
            <div className="space-y-3">
              {data.quizTypeDistribution.slice(0, 5).map((quiz, index) => (
                <div key={quiz.quizType} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-xs font-medium text-blue-600">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {quiz.quizType.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {quiz.count.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {quiz.conversionRate.toFixed(1)}% conversion
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Archetype Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Archetype Distribution
            </h3>
            <div className="space-y-3">
              {data.archetypeDistribution.slice(0, 5).map((archetype, index) => (
                <div key={archetype.archetype} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-gray-700">
                      {archetype.archetype}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {archetype.percentage.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {archetype.count} leads
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Affiliate Performance Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Affiliate Performance
            </h3>
            <button
              onClick={() => window.open('/analytics?tab=affiliates', '_blank')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View Full Affiliate Analytics →
            </button>
          </div>

          {/* Top 5 Affiliates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[
              { name: "FinanceGuru Agency", revenue: 5600, leads: 156, roi: 3.2 },
              { name: "Sarah Johnson", revenue: 2400, leads: 89, roi: 2.8 },
              { name: "QuizMaster Pro", revenue: 1320, leads: 78, roi: 2.1 },
              { name: "Mike Chen", revenue: 1200, leads: 67, roi: 1.9 },
              { name: "Emma Davis", revenue: 900, leads: 45, roi: 1.6 },
            ].map((affiliate, index) => (
              <div key={affiliate.name} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {affiliate.name}
                  </h4>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    ROI: {affiliate.roi}x
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Revenue:</span>
                    <span className="font-medium">${affiliate.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Leads:</span>
                    <span className="font-medium">{affiliate.leads}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Affiliate vs Organic Revenue */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Revenue Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Affiliate Revenue</span>
                  <span className="text-sm font-medium">$11,420 (68%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Organic Revenue</span>
                  <span className="text-sm font-medium">$5,380 (32%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Funnel Performance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Affiliate Clicks → Quiz Starts</span>
                  <span className="font-medium">5,090 → 435 (8.5%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quiz Starts → Completed</span>
                  <span className="font-medium">435 → 312 (71.7%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed → Booked</span>
                  <span className="font-medium">312 → 120 (38.5%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Booked → Closed</span>
                  <span className="font-medium text-green-600">120 → 65 (54.2%)</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.open('/analytics', '_blank')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="text-blue-600 text-lg mb-2">📊</div>
              <h4 className="font-medium text-gray-900">Detailed Analytics</h4>
              <p className="text-sm text-gray-500">View comprehensive analytics dashboard</p>
            </button>
            
            <button
              onClick={() => handleExport('json')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="text-green-600 text-lg mb-2">📥</div>
              <h4 className="font-medium text-gray-900">Export Data</h4>
              <p className="text-sm text-gray-500">Download all analytics data</p>
            </button>
            
            <button
              onClick={() => handleExport('crm')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="text-purple-600 text-lg mb-2">🔄</div>
              <h4 className="font-medium text-gray-900">Sync to CRM</h4>
              <p className="text-sm text-gray-500">Push data to main CRM system</p>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
