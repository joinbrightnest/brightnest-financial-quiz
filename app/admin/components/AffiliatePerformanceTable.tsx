"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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

interface AffiliatePerformanceTableProps {
  data: AffiliatePerformance[];
  loading: boolean;
  onRefresh: () => void;
}

export default function AffiliatePerformanceTable({ data, loading, onRefresh }: AffiliatePerformanceTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof AffiliatePerformance>("revenue");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showDetailModal, setShowDetailModal] = useState<string | null>(null);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const handleSort = (field: keyof AffiliatePerformance) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getTierBadge = (tier: string) => {
    const tierConfig = {
      quiz: { color: "bg-blue-100 text-blue-800", label: "Quiz" },
      creator: { color: "bg-green-100 text-green-800", label: "Creator" },
      agency: { color: "bg-purple-100 text-purple-800", label: "Agency" },
    };
    
    const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.quiz;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Affiliate Performance
            </h3>
            <p className="text-sm text-gray-500">
              {data.length} total affiliates
            </p>
          </div>
          <button
            onClick={onRefresh}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("name")}
              >
                Affiliate
                {sortField === "name" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tier
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("clicks")}
              >
                Clicks
                {sortField === "clicks" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("leads")}
              >
                Leads
                {sortField === "leads" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("bookedCalls")}
              >
                Booked Calls
                {sortField === "bookedCalls" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("sales")}
              >
                Sales
                {sortField === "sales" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("conversionRate")}
              >
                Conv. Rate
                {sortField === "conversionRate" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("revenue")}
              >
                Revenue
                {sortField === "revenue" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("commission")}
              >
                Commission
                {sortField === "commission" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("lastActive")}
              >
                Last Active
                {sortField === "lastActive" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((affiliate) => (
              <motion.tr
                key={affiliate.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {affiliate.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {affiliate.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {affiliate.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getTierBadge(affiliate.tier)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {affiliate.clicks.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {affiliate.leads.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {affiliate.bookedCalls.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {affiliate.sales.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {affiliate.conversionRate.toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${affiliate.revenue.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                  ${affiliate.commission.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(affiliate.lastActive)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setShowDetailModal(affiliate.id)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Details
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <AffiliateDetailModal
          affiliateId={showDetailModal}
          onClose={() => setShowDetailModal(null)}
        />
      )}
    </div>
  );
}

function AffiliateDetailModal({ affiliateId, onClose }: { affiliateId: string; onClose: () => void }) {
  const [affiliateData, setAffiliateData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30d");

  useEffect(() => {
    fetchAffiliateDetails();
  }, [affiliateId, dateRange]);

  const fetchAffiliateDetails = async () => {
    try {
      setLoading(true);
      // This would be a real API call to get detailed affiliate data
      // For now, we'll simulate the data structure
      const mockData = {
        id: affiliateId,
        name: "Sample Affiliate",
        email: "affiliate@example.com",
        tier: "quiz",
        referralCode: "sample123",
        totalClicks: 1250,
        totalLeads: 89,
        totalBookings: 23,
        totalSales: 12,
        totalCommission: 2400,
        conversionRate: 0.96,
        averageOrderValue: 200,
        dailyStats: generateMockDailyStats(),
        trafficSources: [
          { source: "YouTube", clicks: 450, percentage: 36 },
          { source: "TikTok", clicks: 320, percentage: 25.6 },
          { source: "Instagram", clicks: 280, percentage: 22.4 },
          { source: "Facebook", clicks: 150, percentage: 12 },
          { source: "Direct", clicks: 50, percentage: 4 },
        ],
        conversionFunnel: [
          { stage: "Clicks", count: 1250, percentage: 100 },
          { stage: "Quiz Starts", count: 450, percentage: 36 },
          { stage: "Quiz Completions", count: 89, percentage: 7.1 },
          { stage: "Booked Calls", count: 23, percentage: 1.8 },
          { stage: "Sales", count: 12, percentage: 0.96 },
        ],
        recentActivity: [
          { date: "2024-01-15", action: "Sale", amount: 200, commission: 20 },
          { date: "2024-01-14", action: "Lead", amount: 0, commission: 0 },
          { date: "2024-01-13", action: "Click", amount: 0, commission: 0 },
          { date: "2024-01-12", action: "Sale", amount: 200, commission: 20 },
          { date: "2024-01-11", action: "Booking", amount: 0, commission: 0 },
        ]
      };
      
      setTimeout(() => {
        setAffiliateData(mockData);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching affiliate details:", error);
      setLoading(false);
    }
  };

  const generateMockDailyStats = () => {
    const stats = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      stats.push({
        date: date.toISOString().split('T')[0],
        clicks: Math.floor(Math.random() * 50) + 10,
        leads: Math.floor(Math.random() * 5) + 1,
        sales: Math.floor(Math.random() * 2),
        commission: Math.floor(Math.random() * 40) + 10,
      });
    }
    return stats;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Affiliate Performance Details
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="px-6 py-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Affiliate Performance Details
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {affiliateData?.name} • {affiliateData?.tier} tier • Code: {affiliateData?.referralCode}
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
              </select>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-6">
          {affiliateData && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{affiliateData.totalClicks.toLocaleString()}</p>
                  <p className="text-sm text-gray-900">Total Clicks</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{affiliateData.totalLeads.toLocaleString()}</p>
                  <p className="text-sm text-gray-900">Total Leads</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{affiliateData.totalSales.toLocaleString()}</p>
                  <p className="text-sm text-gray-900">Total Sales</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">${affiliateData.totalCommission.toLocaleString()}</p>
                  <p className="text-sm text-gray-900">Total Commission</p>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Chart */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Over Time</h4>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                    <div className="text-center">
                      <div className="text-4xl text-gray-400 mb-2">📈</div>
                      <p className="text-gray-900">Performance chart</p>
                      <p className="text-sm text-gray-900">{affiliateData.dailyStats.length} data points</p>
                    </div>
                  </div>
                </div>

                {/* Conversion Funnel */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h4>
                  <div className="space-y-3">
                    {affiliateData.conversionFunnel.map((stage: any, index: number) => (
                      <div key={stage.stage} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{stage.stage}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{stage.count.toLocaleString()}</p>
                          <p className="text-xs text-gray-900">{stage.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Traffic Sources & Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Traffic Sources */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h4>
                  <div className="space-y-3">
                    {affiliateData.trafficSources.map((source: any) => (
                      <div key={source.source} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{source.source}</span>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{source.clicks.toLocaleString()}</p>
                          <p className="text-xs text-gray-900">{source.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
                  <div className="space-y-3">
                    {affiliateData.recentActivity.map((activity: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-900">{new Date(activity.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          {activity.amount > 0 && (
                            <p className="text-sm font-bold text-gray-900">${activity.amount}</p>
                          )}
                          {activity.commission > 0 && (
                            <p className="text-xs text-green-600">+${activity.commission}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
