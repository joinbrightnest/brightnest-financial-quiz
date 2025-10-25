"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth';

interface Lead {
  id: string;
  sessionId: string;
  name: string;
  email: string;
  date: string;
  completedAt: string;
  quizType: string;
  status: string;
  source: string;
  closerAssigned: {
    id: string;
    name: string;
    email: string;
  } | null;
  callOutcome: string | null;
  saleValue: number | null;
  notes: string | null;
  scheduledAt: string | null;
  callHistory: Array<{
    date: string;
    outcome: string;
    closer: string;
    notes: string;
    saleValue: number | null;
  }>;
  answers: Array<{
    questionId: string;
    questionText: string;
    answer: string;
  }>;
  result: {
    archetype: string;
    score: number;
    insights: string[];
  } | null;
  totalQuizzesCompleted: number;
  allQuizTypes: string[];
  durationMs: number | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
}

interface CRMStats {
  totalLeads: number;
  purchasedLeads: number;
  bookedLeads: number;
  completedLeads: number;
  totalRevenue: number;
  conversionRate: number;
  bookingRate: number;
}

export default function LeadCRM() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, logout } = useAdminAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<CRMStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadProfile, setShowLeadProfile] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [showMetrics, setShowMetrics] = useState(true);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [filters, setFilters] = useState({
    quizType: 'all',
    status: 'all',
    dateRange: 'all',
    search: '',
    dealOwner: 'all',
    createDate: 'all',
    lastActivity: 'all',
    closeDate: 'all'
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads();
    }
  }, [isAuthenticated, filters, sortField, sortDirection, currentPage, itemsPerPage]);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.quizType !== 'all') queryParams.append('quizType', filters.quizType);
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.dateRange !== 'all') queryParams.append('dateRange', filters.dateRange);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.dealOwner !== 'all') queryParams.append('dealOwner', filters.dealOwner);
      if (filters.createDate !== 'all') queryParams.append('createDate', filters.createDate);
      if (filters.lastActivity !== 'all') queryParams.append('lastActivity', filters.lastActivity);
      if (filters.closeDate !== 'all') queryParams.append('closeDate', filters.closeDate);
      
      queryParams.append('sortField', sortField);
      queryParams.append('sortDirection', sortDirection);
      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', itemsPerPage.toString());

      const response = await fetch(`/api/admin/leads-crm?${queryParams}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads);
        setStats(data.stats);
      } else {
        console.error('Failed to fetch leads');
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setShowLeadProfile(true);
  };

  const handleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedLeads.size === leads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(leads.map(lead => lead.id)));
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Purchased (Call)':
        return 'bg-emerald-100 text-emerald-800';
      case 'Booked':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Not Interested':
        return 'bg-red-100 text-red-800';
      case 'Needs Follow Up':
        return 'bg-yellow-100 text-yellow-800';
      case 'Wrong Number':
        return 'bg-gray-100 text-gray-800';
      case 'No Answer':
        return 'bg-orange-100 text-orange-800';
      case 'Callback Requested':
        return 'bg-purple-100 text-purple-800';
      case 'Rescheduled':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '--';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return (
      <svg className={`w-4 h-4 ${sortDirection === 'asc' ? 'text-blue-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
      </svg>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/admin');
    return null;
  }

  const totalPages = Math.ceil(leads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeads = leads.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Lead Pipeline</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Back to Dashboard
              </button>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={filters.quizType}
                onChange={(e) => setFilters({ ...filters, quizType: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All pipelines</option>
                <option value="financial-profile">Financial Profile</option>
                <option value="health-finance">Health Finance</option>
                <option value="marriage-finance">Marriage Finance</option>
              </select>

              <select
                value={filters.dealOwner}
                onChange={(e) => setFilters({ ...filters, dealOwner: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Deal owner</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>

              <select
                value={filters.createDate}
                onChange={(e) => setFilters({ ...filters, createDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Create date</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this_week">This week</option>
                <option value="this_month">This month</option>
              </select>

              <select
                value={filters.lastActivity}
                onChange={(e) => setFilters({ ...filters, lastActivity: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Last activity date</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this_week">This week</option>
                <option value="this_month">This month</option>
              </select>

              <select
                value={filters.closeDate}
                onChange={(e) => setFilters({ ...filters, closeDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Close date</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="this_week">This week</option>
                <option value="this_month">This month</option>
              </select>

              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                + More
              </button>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Advanced filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      {showMetrics && stats && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">${(stats.totalRevenue / 1000000).toFixed(2)}M</div>
                  <div className="text-sm text-gray-500">TOTAL DEAL AMOUNT</div>
                  <div className="text-xs text-gray-400 mt-1">Average per deal: ${(stats.totalRevenue / stats.totalLeads).toFixed(2)}</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">${(stats.totalRevenue * 0.3 / 1000000).toFixed(2)}M</div>
                  <div className="text-sm text-gray-500">WEIGHTED DEAL AMOUNT</div>
                  <div className="text-xs text-gray-400 mt-1">Average per deal: ${(stats.totalRevenue * 0.3 / stats.totalLeads).toFixed(2)}</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">${(stats.totalRevenue * 0.2 / 1000000).toFixed(2)}M</div>
                  <div className="text-sm text-gray-500">OPEN DEAL AMOUNT</div>
                  <div className="text-xs text-gray-400 mt-1">Average per deal: ${(stats.totalRevenue * 0.2 / stats.bookedLeads).toFixed(2)}</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">${(stats.totalRevenue * 0.8 / 1000000).toFixed(2)}M</div>
                  <div className="text-sm text-gray-500">CLOSED DEAL AMOUNT</div>
                  <div className="text-xs text-gray-400 mt-1">Average per deal: ${(stats.totalRevenue * 0.8 / stats.purchasedLeads).toFixed(2)}</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">${(stats.totalRevenue * 0.1 / 1000).toFixed(2)}K</div>
                  <div className="text-sm text-gray-500">NEW DEAL AMOUNT</div>
                  <div className="text-xs text-gray-400 mt-1">Average per deal: ${(stats.totalRevenue * 0.1 / stats.completedLeads).toFixed(2)}</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">86.6 days</div>
                  <div className="text-sm text-gray-500">AVERAGE DEAL AGE</div>
                  <div className="flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Actions */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search name or description"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowMetrics(!showMetrics)}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                {showMetrics ? 'Hide Metrics' : 'Show Metrics'}
              </button>
              <button className="text-gray-600 hover:text-gray-900">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                Export
              </button>
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium">
                Edit columns
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedLeads.size === leads.length && leads.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>LEAD NAME</span>
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>LEAD STAGE</span>
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('scheduledAt')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>CLOSE DATE (GMT+3)</span>
                      {getSortIcon('scheduledAt')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('closerAssigned')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>DEAL OWNER</span>
                      {getSortIcon('closerAssigned')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('saleValue')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>AMOUNT</span>
                      {getSortIcon('saleValue')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>ACTIONS</span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : currentLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No leads found
                    </td>
                  </tr>
                ) : (
                  currentLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedLeads.has(lead.id)}
                          onChange={() => handleSelectLead(lead.id)}
                          className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {lead.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.scheduledAt ? formatShortDate(lead.scheduledAt) : '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.closerAssigned ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {lead.closerAssigned.name}
                          </span>
                        ) : (
                          <span className="text-gray-400">No owner</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(lead.saleValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleLeadClick(lead)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(endIndex, leads.length)}</span> of{' '}
                  <span className="font-medium">{leads.length}</span> results
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Items per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    &lt; Prev
                  </button>
                  {Array.from({ length: Math.min(11, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 text-sm border rounded ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  {totalPages > 11 && (
                    <>
                      <span className="px-2 text-gray-500">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={`px-3 py-1 text-sm border rounded ${
                          currentPage === totalPages
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Profile Modal - Same as before */}
      {showLeadProfile && selectedLead && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Lead Profile</h3>
                <button
                  onClick={() => setShowLeadProfile(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-6 py-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Name</label>
                      <p className="text-sm text-gray-900">{selectedLead.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm text-gray-900">{selectedLead.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Source</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedLead.source.includes('Affiliate') 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedLead.source}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Quiz Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Quiz Type</label>
                      <p className="text-sm text-gray-900">{selectedLead.quizType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Completed At</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedLead.completedAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Total Quizzes</label>
                      <p className="text-sm text-gray-900">{selectedLead.totalQuizzesCompleted}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">All Quiz Types</label>
                      <div className="flex flex-wrap gap-1">
                        {selectedLead.allQuizTypes.map((type, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call Information */}
              {selectedLead.closerAssigned && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Call Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Closer Assigned</label>
                      <p className="text-sm text-gray-900">{selectedLead.closerAssigned.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedLead.status)}`}>
                        {selectedLead.status}
                      </span>
                    </div>
                    {selectedLead.scheduledAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Scheduled At</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedLead.scheduledAt)}</p>
                      </div>
                    )}
                    {selectedLead.saleValue && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Sale Value</label>
                        <p className="text-sm text-gray-900 font-semibold">{formatCurrency(selectedLead.saleValue)}</p>
                      </div>
                    )}
                  </div>
                  {selectedLead.notes && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-500">Notes</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{selectedLead.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Call History */}
              {selectedLead.callHistory.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Call History</h4>
                  <div className="space-y-3">
                    {selectedLead.callHistory.map((call, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{formatDate(call.date)}</p>
                            <p className="text-sm text-gray-600">Closer: {call.closer}</p>
                            <p className="text-sm text-gray-600">Outcome: {call.outcome}</p>
                            {call.saleValue && (
                              <p className="text-sm text-gray-600">Sale: {formatCurrency(call.saleValue)}</p>
                            )}
                          </div>
                        </div>
                        {call.notes && (
                          <p className="text-sm text-gray-700 mt-2">{call.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quiz Answers */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Quiz Answers</h4>
                <div className="space-y-3">
                  {selectedLead.answers.map((answer, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm font-medium text-gray-900 mb-2">{answer.questionText}</p>
                      <p className="text-sm text-gray-700">{answer.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Result */}
              {selectedLead.result && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Quiz Result</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Archetype</label>
                        <p className="text-sm text-gray-900">{selectedLead.result.archetype}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Score</label>
                        <p className="text-sm text-gray-900">{selectedLead.result.score}</p>
                      </div>
                    </div>
                    {selectedLead.result.insights.length > 0 && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-500">Insights</label>
                        <ul className="text-sm text-gray-700 list-disc list-inside">
                          {selectedLead.result.insights.map((insight, index) => (
                            <li key={index}>{insight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
