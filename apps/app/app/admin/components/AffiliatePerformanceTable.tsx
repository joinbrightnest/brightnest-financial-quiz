"use client";

import { useState } from "react";
import { motion } from "framer-motion";

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
  const [deletingAffiliate, setDeletingAffiliate] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  // Sort the data before slicing
  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    // Handle different data types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' 
        ? aValue - bValue
        : bValue - aValue;
    }
    
    // Fallback for other types
    return 0;
  });
  
  const currentData = sortedData.slice(startIndex, endIndex);

  const handleSort = (field: keyof AffiliatePerformance) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    // Reset to first page when sorting changes
    setCurrentPage(1);
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

  const handleDeleteAffiliate = async (affiliateId: string, affiliateName: string) => {
    if (!confirm(`Are you sure you want to delete "${affiliateName}"? This will permanently remove the affiliate and ALL their data (clicks, conversions, payouts, etc.). This action cannot be undone.`)) {
      return;
    }

    setDeletingAffiliate(affiliateId);
    setShowDeleteConfirm(null);

    try {
      const response = await fetch(`/api/admin/affiliates/${affiliateId}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete affiliate');
      }

      const result = await response.json();
      console.log('Affiliate deleted successfully:', result);

      // Refresh the data
      onRefresh();

      // Show success message
      alert(`Successfully deleted affiliate "${affiliateName}" and all related data.`);
    } catch (error) {
      console.error('Error deleting affiliate:', error);
      alert(`Error deleting affiliate: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setDeletingAffiliate(null);
    }
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
                onClick={() => handleSort("quizStarts")}
              >
                Quiz Starts
                {sortField === "quizStarts" && (
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {affiliate.clicks.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {affiliate.quizStarts.toLocaleString()}
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
                  <div className="flex items-center space-x-3">
                    <a
                      href={`/admin/affiliates/${affiliate.id}`}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      View Details
                    </a>
                    <button
                      onClick={() => handleDeleteAffiliate(affiliate.id, affiliate.name)}
                      disabled={deletingAffiliate === affiliate.id}
                      className="text-red-600 hover:text-red-900 disabled:text-red-400 disabled:cursor-not-allowed transition-colors"
                      title="Delete affiliate and all related data"
                    >
                      {deletingAffiliate === affiliate.id ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-1"></div>
                          Deleting...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </div>
                      )}
                    </button>
                  </div>
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

    </div>
  );
}

