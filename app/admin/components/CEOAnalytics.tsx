"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AffiliateOverview from "./AffiliateOverview";

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
  totalSales: number;
  totalRevenue: number;
  totalCommission: number;
  overallClickToQuizRate: number;
  overallQuizToCompletionRate: number;
  overallClickToCompletionRate: number;
  // Individual affiliate data
  affiliatePerformance: AffiliatePerformance[];
  topAffiliates: AffiliatePerformance[];
}

export default function CEOAnalytics() {
  const [data, setData] = useState<CEOAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("30d");
  const [activeSection, setActiveSection] = useState<"overview" | "affiliates" | "pending">("overview");
  const [pendingAffiliates, setPendingAffiliates] = useState<any[]>([]);
  const [editingTrackingLink, setEditingTrackingLink] = useState<string | null>(null);
  const [trackingLinkInput, setTrackingLinkInput] = useState<string>("");
  const [approvingAffiliate, setApprovingAffiliate] = useState<string | null>(null);

  useEffect(() => {
    fetchCEOAnalytics();
    fetchPendingAffiliates();
  }, [dateRange]);

  const fetchCEOAnalytics = async () => {
    try {
      setLoading(true);
      // Fetch affiliate performance data
      const response = await fetch(`/api/admin/affiliate-performance`);
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
          window.location.reload();
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

  const handleExport = async (format: 'csv' | 'json' | 'crm') => {
    // Simple export functionality - generate CSV/JSON from current data
    if (!data) return;
    
    try {
      if (format === 'csv') {
        const csvContent = [
          "Metric,Value",
          `Total Leads,${data.totalLeads}`,
          `Total Completions,${data.totalCompletions}`,
          `Conversion Rate,${data.conversionRate}%`,
          `Average Completion Time,${data.avgCompletionTime}min`,
          `Distinct Archetypes,${data.distinctArchetypes}`,
          `Assessment Categories,${data.assessmentCategories}`,
          `Total Revenue,$${data.totalRevenue}`,
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `affiliate-analytics-${dateRange}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else if (format === 'json') {
        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `affiliate-analytics-${dateRange}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else if (format === 'crm') {
        // Mock CRM integration
        alert('Data would be sent to CRM system. This is a demo feature.');
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
          <button
            onClick={() => setActiveSection("pending")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSection === "pending"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            ⏳ Pending Approval {pendingAffiliates.length > 0 && `(${pendingAffiliates.length})`}
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
          {/* Affiliate Performance KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Affiliates</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.totalAffiliates}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">👀</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Visitors</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.totalVisitors.toLocaleString()}
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
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${data.totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <span className="text-2xl">📈</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.overallClickToCompletionRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <span className="text-2xl">🏆</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Top Affiliate</p>
                  <p className="text-lg font-bold text-gray-900 truncate">
                    {data.topAffiliates[0]?.name || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">${data.topAffiliates[0]?.totalRevenue || 0} revenue</p>
                </div>
              </div>
            </div>
          </div>

          {/* Affiliate Performance Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Overall Affiliate Funnel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Overall Affiliate Funnel (Visitors → Sales)
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                      1
                    </div>
                    <span className="text-sm font-medium text-gray-700">Visitors</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {data.totalVisitors.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">100.0%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-medium text-green-600">
                      2
                    </div>
                    <span className="text-sm font-medium text-gray-700">Quiz Starts</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {data.totalQuizStarts.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {data.overallClickToQuizRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-medium text-purple-600">
                      3
                    </div>
                    <span className="text-sm font-medium text-gray-700">Completed</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {data.totalCompleted.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {data.overallQuizToCompletionRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-medium text-orange-600">
                      4
                    </div>
                    <span className="text-sm font-medium text-gray-700">Sales</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {data.totalSales.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {data.overallClickToCompletionRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Affiliates List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Performing Affiliates
              </h3>
              <div className="space-y-3">
                {data.topAffiliates.slice(0, 5).map((affiliate, index) => (
                  <div key={affiliate.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{affiliate.name}</p>
                        <p className="text-xs text-gray-500">{affiliate.tier} tier</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        ${affiliate.totalRevenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {affiliate.visitors} visitors
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Individual Affiliate Performance Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Individual Affiliate Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Affiliate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visitors
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quiz Starts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversion Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.affiliatePerformance.map((affiliate) => (
                    <tr key={affiliate.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{affiliate.name}</div>
                          <div className="text-sm text-gray-500">{affiliate.tier} tier</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {affiliate.visitors}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {affiliate.quizStarts}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {affiliate.completed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {affiliate.sales}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${affiliate.totalRevenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {affiliate.clickToCompletionRate.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      {activeSection === "pending" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Pending Affiliate Approvals ({pendingAffiliates.length})
            </h3>
            
            {pendingAffiliates.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">✅</div>
                <p className="text-gray-500">No pending affiliate approvals</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingAffiliates.map((affiliate) => (
                  <div key={affiliate.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-lg">
                              {affiliate.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">{affiliate.name}</h4>
                            <p className="text-sm text-gray-500">{affiliate.email}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                                {affiliate.tier} tier
                              </span>
                              <span className="text-xs text-gray-500">
                                {(affiliate.commissionRate * 100).toFixed(0)}% commission
                              </span>
                              <span className="text-xs text-gray-500">
                                Applied: {new Date(affiliate.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Tracking Link Customization */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-3">Custom Tracking Link</h5>
                          {editingTrackingLink === affiliate.id ? (
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">https://joinbrightnest.com/</span>
                                <input
                                  type="text"
                                  value={trackingLinkInput}
                                  onChange={(e) => setTrackingLinkInput(e.target.value)}
                                  placeholder="e.g., special-offer, john-doe, exclusive-deal"
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleApproveAffiliate(affiliate.id, true, trackingLinkInput)}
                                  disabled={approvingAffiliate === affiliate.id}
                                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {approvingAffiliate === affiliate.id ? "Approving..." : "✅ Approve & Activate"}
                                </button>
                                <button
                                  onClick={cancelEditingTrackingLink}
                                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm font-medium"
                                >
                                  Cancel
                                </button>
                              </div>
                              <p className="text-xs text-gray-500">
                                Leave empty to keep the auto-generated link, or enter a custom one. This will be the permanent tracking link for this affiliate.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={`Auto-generated: ${affiliate.referralCode}`}
                                  readOnly
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-500"
                                />
                                <button
                                  onClick={() => startEditingTrackingLink(affiliate.id)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                                >
                                  Customize Link
                                </button>
                              </div>
                              <p className="text-xs text-gray-500">
                                Click "Customize Link" to set a custom tracking link, or approve with the auto-generated one.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2 ml-4">
                        {editingTrackingLink !== affiliate.id && (
                          <>
                            <button
                              onClick={() => handleApproveAffiliate(affiliate.id, true)}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                            >
                              ✅ Approve (Auto Link)
                            </button>
                            <button
                              onClick={() => startEditingTrackingLink(affiliate.id)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                            >
                              ✏️ Customize Link
                            </button>
                            <button
                              onClick={() => handleApproveAffiliate(affiliate.id, false)}
                              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                            >
                              ❌ Reject
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
    </div>
  );
}
