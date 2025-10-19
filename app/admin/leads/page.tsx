"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from "@/lib/admin-auth";

interface QuizSession {
  id: string;
  quizType: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  answers: QuizAnswer[];
  result?: {
    archetype: string;
    scores: any;
  };
}

interface QuizAnswer {
  id: string;
  questionId: string;
  value: any;
  question: {
    id: string;
    prompt: string;
    type: string;
    order: number;
  };
}

interface QuizType {
  name: string;
  displayName: string;
}

type TabType = 'overview' | 'financial-profile' | 'health-finance' | 'marriage-finance' | 'answers' | 'segments';

export default function LeadsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [leads, setLeads] = useState<QuizSession[]>([]);
  const [quizTypes, setQuizTypes] = useState<QuizType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    quizType: 'all',
    status: 'all',
    dateRange: 'all',
    archetype: 'all',
    startDate: '',
    endDate: ''
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeAnswers: true,
    includeContactInfo: true,
    includeResults: true,
    includeTimestamps: true,
    selectedFields: ['sessionId', 'quizType', 'name', 'email', 'status', 'archetype', 'answers', 'createdAt', 'completedAt']
  });
  const [showLeadCheckboxes, setShowLeadCheckboxes] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads();
      fetchQuizTypes();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads();
    }
  }, [filters]);

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.dateRange !== 'all') {
        params.append('dateRange', filters.dateRange);
      }
      if (filters.startDate && filters.endDate) {
        params.append('startDate', filters.startDate);
        params.append('endDate', filters.endDate);
      }
      if (filters.quizType !== 'all') {
        params.append('quizType', filters.quizType);
      }
      
      const queryString = params.toString();
      const url = queryString ? `/api/admin/basic-stats?${queryString}` : '/api/admin/basic-stats';
      
      const response = await fetch(url);
      const data = await response.json();
      setLeads(data.allLeads || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuizTypes = async () => {
    try {
      const response = await fetch('/api/admin/all-quiz-types');
      const data = await response.json();
      setQuizTypes(data.quizTypes || []);
    } catch (error) {
      console.error('Error fetching quiz types:', error);
    }
  };

  const exportLeads = async () => {
    try {
      const response = await fetch('/api/admin/export-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          filters,
          exportOptions 
        }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setShowExportModal(false);
      }
    } catch (error) {
      console.error('Error exporting leads:', error);
    }
  };

  const handleDateRangeChange = (range: string) => {
    const now = new Date();
    let startDate = '';
    let endDate = '';
    
    if (range === '7days') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startDate = weekAgo.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
    } else if (range === '30days') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDate = monthAgo.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
    } else if (range === '90days') {
      const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      startDate = quarterAgo.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
    }
    
    setFilters(prev => ({
      ...prev,
      dateRange: range,
      startDate,
      endDate
    }));
  };

  const toggleLeadSelection = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const selectAllLeads = () => {
    const filteredLeads = getFilteredLeads();
    setSelectedLeads(new Set(filteredLeads.map(lead => lead.id)));
  };

  const deselectAllLeads = () => {
    setSelectedLeads(new Set());
  };

  const exportSelectedLeads = async () => {
    if (selectedLeads.size === 0) return;

    try {
      const response = await fetch('/api/admin/export-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          filters: {
            ...filters,
            selectedLeadIds: Array.from(selectedLeads)
          },
          exportOptions 
        }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `selected-leads-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setShowLeadCheckboxes(false);
        setSelectedLeads(new Set());
      }
    } catch (error) {
      console.error('Error exporting selected leads:', error);
    }
  };

  const getFilteredLeads = () => {
    return leads.filter(lead => {
      if (filters.quizType !== 'all' && lead.quizType !== filters.quizType) return false;
      if (filters.status !== 'all' && lead.status !== filters.status) return false;
      if (filters.archetype !== 'all' && lead.result?.archetype !== filters.archetype) return false;
      
      // Date filtering
      if (filters.dateRange !== 'all' || filters.startDate || filters.endDate) {
        const leadDate = new Date(lead.createdAt);
        const now = new Date();
        
        if (filters.dateRange === '7days') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (leadDate < weekAgo) return false;
        } else if (filters.dateRange === '30days') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (leadDate < monthAgo) return false;
        } else if (filters.dateRange === '90days') {
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          if (leadDate < quarterAgo) return false;
        }
        
        if (filters.startDate) {
          const startDate = new Date(filters.startDate);
          if (leadDate < startDate) return false;
        }
        
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setHours(23, 59, 59, 999); // End of day
          if (leadDate > endDate) return false;
        }
      }
      
      return true;
    });
  };

  const getQuizTypeDisplayName = (quizType: string) => {
    const quizTypeData = quizTypes.find(qt => qt.name === quizType);
    return quizTypeData?.displayName || quizType;
  };

  const getArchetypeStats = () => {
    const archetypes: { [key: string]: number } = {};
    leads.forEach(lead => {
      if (lead.result?.archetype) {
        archetypes[lead.result.archetype] = (archetypes[lead.result.archetype] || 0) + 1;
      }
    });
    return archetypes;
  };

  const getQuizTypeStats = () => {
    const stats: { [key: string]: number } = {};
    leads.forEach(lead => {
      stats[lead.quizType] = (stats[lead.quizType] || 0) + 1;
    });
    return stats;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'financial-profile', label: 'Financial Profile', icon: '💰' },
    { id: 'health-finance', label: 'Health Finance', icon: '🏥' },
    { id: 'marriage-finance', label: 'Marriage Finance', icon: '💕' },
    { id: 'answers', label: 'Answers', icon: '📝' },
    { id: 'segments', label: 'Segments', icon: '🎯' },
  ];

  const renderOverviewTab = () => {
    const archetypeStats = getArchetypeStats();
    const quizTypeStats = getQuizTypeStats();
    const totalLeads = leads.length;
    const completedLeads = leads.filter(l => l.status === 'completed').length;
    const completionRate = totalLeads > 0 ? Math.round((completedLeads / totalLeads) * 100) : 0;

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{totalLeads}</div>
                <div className="text-sm font-medium text-gray-600 mt-1">Total Qualified Leads</div>
                <div className="text-xs text-gray-500 mt-1">Quiz completions</div>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{Object.keys(archetypeStats).length}</div>
                <div className="text-sm font-medium text-gray-600 mt-1">Unique Archetypes</div>
                <div className="text-xs text-gray-500 mt-1">Personality types</div>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{quizTypes.length}</div>
                <div className="text-sm font-medium text-gray-600 mt-1">Active Quiz Types</div>
                <div className="text-xs text-gray-500 mt-1">Assessment categories</div>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Data Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quiz Type Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Quiz Type Distribution</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Lead Sources</span>
              </div>
            </div>
            <div className="space-y-4">
              {Object.entries(quizTypeStats).map(([quizType, count]) => {
                const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
                return (
                  <div key={quizType} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{getQuizTypeDisplayName(quizType)}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900">{count}</span>
                        <span className="text-xs text-gray-500">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Archetype Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Personality Archetypes</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Behavioral Patterns</span>
              </div>
            </div>
            <div className="space-y-4">
              {Object.entries(archetypeStats).map(([archetype, count]) => {
                const percentage = completedLeads > 0 ? Math.round((count / completedLeads) * 100) : 0;
                return (
                  <div key={archetype} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{archetype}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900">{count}</span>
                        <span className="text-xs text-gray-500">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs text-gray-500">Analytics</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{totalLeads}</div>
              <div className="text-sm text-gray-600 mt-1">Total Assessments</div>
              <div className="text-xs text-gray-500 mt-1">All quiz completions</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{Object.keys(archetypeStats).length}</div>
              <div className="text-sm text-gray-600 mt-1">Personality Types</div>
              <div className="text-xs text-gray-500 mt-1">Unique behavioral patterns</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{quizTypes.length}</div>
              <div className="text-sm text-gray-600 mt-1">Assessment Categories</div>
              <div className="text-xs text-gray-500 mt-1">Different quiz types</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderQuizTypeTab = (quizType: string) => {
    const filteredLeads = leads.filter(lead => lead.quizType === quizType);
    const archetypeStats = getArchetypeStats();
    const quizArchetypeStats = filteredLeads.reduce((acc, lead) => {
      if (lead.result?.archetype) {
        acc[lead.result.archetype] = (acc[lead.result.archetype] || 0) + 1;
      }
      return acc;
    }, {} as { [key: string]: number });
    
    return (
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{getQuizTypeDisplayName(quizType)} Assessment</h3>
              <p className="text-sm text-gray-600 mt-1">Detailed analysis of {quizType} quiz completions</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{filteredLeads.length}</div>
              <div className="text-sm text-gray-600">Total Completions</div>
            </div>
          </div>
        </div>

        {/* Archetype Breakdown for this Quiz Type */}
        {Object.keys(quizArchetypeStats).length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-gray-900">Personality Distribution</h4>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Behavioral Analysis</span>
              </div>
            </div>
            <div className="space-y-4">
              {Object.entries(quizArchetypeStats).map(([archetype, count]) => {
                const percentage = filteredLeads.length > 0 ? Math.round((count / filteredLeads.length) * 100) : 0;
                return (
                  <div key={archetype} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{archetype}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900">{count}</span>
                        <span className="text-xs text-gray-500">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Leads Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900">Individual Assessments</h4>
            <p className="text-sm text-gray-600 mt-1">Detailed view of each quiz completion</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Session ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assessment Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => {
                const nameAnswer = lead.answers.find(a => 
                  a.question?.prompt?.toLowerCase().includes('name') ||
                  a.question?.text?.toLowerCase().includes('name')
                );
                const emailAnswer = lead.answers.find(a => 
                  a.question?.prompt?.toLowerCase().includes('email') ||
                  a.question?.text?.toLowerCase().includes('email')
                );
                
                return (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">{lead.id.slice(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{nameAnswer?.value || "N/A"}</div>
                      <div className="text-xs text-gray-500">{emailAnswer?.value || "No email"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(lead.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{new Date(lead.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        lead.status === "completed" 
                          ? "bg-green-100 text-green-800 border border-green-200" 
                          : "bg-orange-100 text-orange-800 border border-orange-200"
                      }`}>
                        {lead.status === "completed" ? "Completed" : "In Progress"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        lead.source?.includes('Affiliate') 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {lead.source || 'Website'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => router.push(`/admin/leads/${lead.id}`)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    );
  };

  const renderAnswersTab = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-black">All Quiz Answers</h3>
            {showLeadCheckboxes && (
              <div className="text-sm text-gray-600">
                {selectedLeads.size} of {getFilteredLeads().length} selected
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <select
              value={filters.quizType}
              onChange={(e) => setFilters({...filters, quizType: e.target.value})}
              className="text-sm border border-gray-300 rounded px-2 py-1 text-black"
            >
              <option value="all">All Quiz Types</option>
              {quizTypes.map(qt => (
                <option key={qt.name} value={qt.name}>{qt.displayName}</option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="text-sm border border-gray-300 rounded px-2 py-1 text-black"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
            </select>
            <select
              value={filters.dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 text-black"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
            {filters.dateRange === 'custom' && (
              <>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  className="text-sm border border-gray-300 rounded px-2 py-1 text-black"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  className="text-sm border border-gray-300 rounded px-2 py-1 text-black"
                  placeholder="End Date"
                />
              </>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {showLeadCheckboxes && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedLeads.size === getFilteredLeads().length && getFilteredLeads().length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            selectAllLeads();
                          } else {
                            deselectAllLeads();
                          }
                        }}
                        className="w-4 h-4 text-slate-700 bg-white border-gray-300 rounded focus:ring-slate-500 focus:ring-2"
                      />
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Session ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Quiz Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Answers Count</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredLeads().map((lead) => {
                const nameAnswer = lead.answers.find(a => 
                  a.question?.prompt?.toLowerCase().includes('name') ||
                  a.question?.text?.toLowerCase().includes('name')
                );
                const emailAnswer = lead.answers.find(a => 
                  a.question?.prompt?.toLowerCase().includes('email') ||
                  a.question?.text?.toLowerCase().includes('email')
                );
                
                return (
                  <tr 
                    key={lead.id} 
                    className={`transition-all duration-200 ${
                      showLeadCheckboxes && selectedLeads.has(lead.id)
                        ? 'bg-slate-50 border-l-4 border-slate-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {showLeadCheckboxes && (
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedLeads.has(lead.id)}
                          onChange={() => toggleLeadSelection(lead.id)}
                          className="w-4 h-4 text-slate-700 bg-white border-gray-300 rounded focus:ring-slate-500 focus:ring-2"
                        />
                      </td>
                    )}
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-black">
                      {lead.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-black">
                      {getQuizTypeDisplayName(lead.quizType)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-black">
                      {nameAnswer?.value || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-black">
                      {emailAnswer?.value || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-black">
                      {lead.answers.length}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        lead.status === "completed" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-orange-100 text-orange-800"
                      }`}>
                        {lead.status === "completed" ? "Completed" : "Partial"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-black">
                      <button
                        onClick={() => router.push(`/admin/leads/${lead.id}`)}
                        className="text-slate-700 hover:text-slate-900 text-xs font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSegmentsTab = () => {
    const archetypeStats = getArchetypeStats();
    const quizTypeStats = getQuizTypeStats();
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Archetype Segments */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-black">Archetype Segments</h3>
            <div className="space-y-3">
              {Object.entries(archetypeStats).map(([archetype, count]) => (
                <div key={archetype} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-black">{archetype}</div>
                    <div className="text-xs text-black">{count} leads</div>
                  </div>
                  <button
                    onClick={() => {
                      setFilters({...filters, archetype});
                      setActiveTab('answers');
                    }}
                    className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-300 rounded"
                  >
                    View Leads
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quiz Type Segments */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-black">Quiz Type Segments</h3>
            <div className="space-y-3">
              {Object.entries(quizTypeStats).map(([quizType, count]) => (
                <div key={quizType} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-black">{getQuizTypeDisplayName(quizType)}</div>
                    <div className="text-xs text-black">{count} leads</div>
                  </div>
                  <button
                    onClick={() => setActiveTab(quizType as TabType)}
                    className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-300 rounded"
                  >
                    View Leads
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Analytics */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Analytics</h3>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs text-gray-500">Performance Insights</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-green-800 mb-1">Qualified Leads</div>
                  <div className="text-xs text-green-600 mb-3">Completed assessments</div>
                  <div className="text-2xl font-bold text-green-700">
                    {leads.filter(l => l.status === 'completed').length}
                  </div>
                </div>
                <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-blue-800 mb-1">Recent Activity</div>
                  <div className="text-xs text-blue-600 mb-3">Last 7 days</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {leads.filter(l => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(l.createdAt) > weekAgo;
                    }).length}
                  </div>
                </div>
                <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-purple-800 mb-1">Contact Rate</div>
                  <div className="text-xs text-purple-600 mb-3">Email addresses collected</div>
                  <div className="text-2xl font-bold text-purple-700">
                    {leads.filter(l => l.answers.some(a => a.question.type === 'email' && a.value)).length}
                  </div>
                </div>
                <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'financial-profile':
      case 'health-finance':
      case 'marriage-finance':
        return renderQuizTypeTab(activeTab);
      case 'answers':
        return renderAnswersTab();
      case 'segments':
        return renderSegmentsTab();
      default:
        return renderOverviewTab();
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-black">Loading leads...</p>
            </div>
          </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lead Analytics Dashboard</h1>
              <p className="text-sm text-gray-600 mt-2">Comprehensive CRM system for behavioral assessment data and lead segmentation</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLeadCheckboxes(!showLeadCheckboxes)}
                className={`py-2.5 px-4 rounded-md transition-all duration-200 text-sm font-medium border ${
                  showLeadCheckboxes 
                    ? 'bg-slate-700 text-white border-slate-700 hover:bg-slate-800' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
                }`}
              >
                {showLeadCheckboxes ? 'Hide Selection' : 'Select Leads'}
              </button>
              {showLeadCheckboxes && (
                <>
                  <button
                    onClick={selectAllLeads}
                    className="bg-white text-slate-700 border border-slate-300 py-2.5 px-4 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 text-sm font-medium"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAllLeads}
                    className="bg-white text-slate-700 border border-slate-300 py-2.5 px-4 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 text-sm font-medium"
                  >
                    Deselect All
                  </button>
                  <button
                    onClick={exportSelectedLeads}
                    disabled={selectedLeads.size === 0}
                    className={`py-2.5 px-4 rounded-md transition-all duration-200 text-sm font-medium border ${
                      selectedLeads.size === 0
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-slate-700 text-white border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    Export Selected ({selectedLeads.size})
                  </button>
                </>
              )}
              <button
                onClick={() => setShowExportModal(true)}
                className="bg-slate-700 text-white py-2.5 px-4 rounded-md hover:bg-slate-800 transition-all duration-200 flex items-center space-x-2 text-sm font-medium border border-slate-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export All</span>
              </button>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="bg-white text-slate-700 border border-slate-300 py-2.5 px-4 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 text-sm font-medium"
              >
                Back to Dashboard
              </button>
              <button
                onClick={logout}
                className="bg-red-600 text-white py-2.5 px-4 rounded-md hover:bg-red-700 transition-all duration-200 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="overflow-x-auto">
            <div className="flex space-x-8 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-slate-700 text-slate-700'
                      : 'border-transparent text-gray-600 hover:text-slate-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Export Configuration</h3>
              <p className="text-sm text-gray-600 mt-1">Choose what data to include in your export</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Export Options */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Data Categories</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeContactInfo}
                      onChange={(e) => setExportOptions({...exportOptions, includeContactInfo: e.target.checked})}
                      className="rounded border-gray-300 text-slate-700 focus:ring-slate-500"
                    />
                    <span className="text-sm text-gray-700">Contact Information (Name, Email)</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeAnswers}
                      onChange={(e) => setExportOptions({...exportOptions, includeAnswers: e.target.checked})}
                      className="rounded border-gray-300 text-slate-700 focus:ring-slate-500"
                    />
                    <span className="text-sm text-gray-700">Quiz Answers</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeResults}
                      onChange={(e) => setExportOptions({...exportOptions, includeResults: e.target.checked})}
                      className="rounded border-gray-300 text-slate-700 focus:ring-slate-500"
                    />
                    <span className="text-sm text-gray-700">Assessment Results (Archetype, Scores)</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeTimestamps}
                      onChange={(e) => setExportOptions({...exportOptions, includeTimestamps: e.target.checked})}
                      className="rounded border-gray-300 text-slate-700 focus:ring-slate-500"
                    />
                    <span className="text-sm text-gray-700">Timestamps (Created, Completed)</span>
                  </label>
                </div>
              </div>

              {/* Field Selection */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Specific Fields</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'sessionId', label: 'Session ID' },
                    { key: 'quizType', label: 'Quiz Type' },
                    { key: 'name', label: 'Name' },
                    { key: 'email', label: 'Email' },
                    { key: 'status', label: 'Status' },
                    { key: 'archetype', label: 'Archetype' },
                    { key: 'answers', label: 'Answers' },
                    { key: 'createdAt', label: 'Created Date' },
                    { key: 'completedAt', label: 'Completed Date' }
                  ].map(field => (
                    <label key={field.key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.selectedFields.includes(field.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setExportOptions({
                              ...exportOptions,
                              selectedFields: [...exportOptions.selectedFields, field.key]
                            });
                          } else {
                            setExportOptions({
                              ...exportOptions,
                              selectedFields: exportOptions.selectedFields.filter(f => f !== field.key)
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-slate-700 focus:ring-slate-500"
                      />
                      <span className="text-xs text-gray-700">{field.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Export Summary</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Records: {getFilteredLeads().length} leads</div>
                  <div>Quiz Type: {filters.quizType === 'all' ? 'All' : getQuizTypeDisplayName(filters.quizType)}</div>
                  <div>Status: {filters.status === 'all' ? 'All' : filters.status}</div>
                  <div>Date Range: {
                    filters.dateRange === 'all' ? 'All Time' :
                    filters.dateRange === 'custom' ? `${filters.startDate} to ${filters.endDate}` :
                    filters.dateRange === '7days' ? 'Last 7 Days' :
                    filters.dateRange === '30days' ? 'Last 30 Days' :
                    filters.dateRange === '90days' ? 'Last 90 Days' : 'All Time'
                  }</div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={exportLeads}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-700 border border-slate-700 rounded-md hover:bg-slate-800 transition-colors"
              >
                Export Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
