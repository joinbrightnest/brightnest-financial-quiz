"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface AffiliateData {
  id: string;
  name: string;
  email: string;
  tier: string;
  referralCode: string;
  customLink: string;
  commissionRate: number;
  totalClicks: number;
  totalLeads: number;
  totalBookings: number;
  totalCommission: number;
  isApproved: boolean;
}

interface LeadData {
  id: string;
  sessionId: string;
  quizType: string;
  startedAt: string;
  completedAt: string;
  status: string;
  durationMs: number;
  result?: {
    archetype: string;
    score: number;
    insights: string[];
  };
  answers: Array<{
    questionId: string;
    questionText: string;
    answer: string;
    answerValue: number;
  }>;
  user?: {
    email: string;
    role: string;
  };
}

interface CRMStats {
  totalLeads: number;
  totalCompletions: number;
  completionRate: number;
  averageCompletionTime: number;
  distinctArchetypes: number;
  quizTypeDistribution: Array<{
    quizType: string;
    count: number;
    percentage: number;
  }>;
  archetypeDistribution: Array<{
    archetype: string;
    count: number;
    percentage: number;
  }>;
}

export default function AffiliateCRMView() {
  const params = useParams();
  const router = useRouter();
  const affiliateId = params.id as string;
  
  const [affiliateData, setAffiliateData] = useState<AffiliateData | null>(null);
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [stats, setStats] = useState<CRMStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterArchetype, setFilterArchetype] = useState("all");
  const [filterQuizType, setFilterQuizType] = useState("all");

  useEffect(() => {
    if (affiliateId) {
      fetchAffiliateCRMData();
    }
  }, [affiliateId]);

  const fetchAffiliateCRMData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch affiliate data
      const affiliateResponse = await fetch(`/api/admin/affiliates/${affiliateId}`);
      if (!affiliateResponse.ok) {
        throw new Error("Failed to fetch affiliate data");
      }
      const affiliate = await affiliateResponse.json();
      setAffiliateData(affiliate);

      // Fetch CRM data
      const crmResponse = await fetch(`/api/admin/affiliates/${affiliateId}/crm`);
      if (!crmResponse.ok) {
        throw new Error("Failed to fetch CRM data");
      }
      const crmData = await crmResponse.json();
      setLeads(crmData.leads || []);
      setStats(crmData.stats || null);

    } catch (err) {
      console.error("Error fetching affiliate CRM data:", err);
      setError(err instanceof Error ? err.message : "Failed to load CRM data");
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchTerm || 
      lead.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.quizType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.result?.archetype?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesArchetype = filterArchetype === "all" || lead.result?.archetype === filterArchetype;
    const matchesQuizType = filterQuizType === "all" || lead.quizType === filterQuizType;
    
    return matchesSearch && matchesArchetype && matchesQuizType;
  });

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

  const exportLeads = () => {
    const csvContent = [
      "Session ID,Quiz Type,Email,Archetype,Started At,Completed At,Status,Duration (min)",
      ...filteredLeads.map(lead => [
        lead.sessionId,
        lead.quizType,
        lead.user?.email || "N/A",
        lead.result?.archetype || "N/A",
        new Date(lead.startedAt).toLocaleDateString(),
        lead.completedAt ? new Date(lead.completedAt).toLocaleDateString() : "N/A",
        lead.status,
        lead.durationMs ? Math.round(lead.durationMs / 60000) : "N/A"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${affiliateData?.name}-leads-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
              ))}
            </div>
            <div className="h-96 bg-slate-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !affiliateData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Data</h3>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-semibold hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Lead Analytics Dashboard
                  </h1>
                  <p className="text-slate-600 font-medium">
                    Comprehensive CRM system for {affiliateData.name} • {affiliateData.tier} tier
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportLeads}
                className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl text-sm font-semibold hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export All
              </button>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Performance
              </button>
            </div>
          </div>
        </motion.div>

        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Premium Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalLeads.toLocaleString()}</p>
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Qualified Leads</p>
                    <p className="text-xs text-slate-500 font-medium">Quiz completions</p>
                  </div>
                </div>
              </div>

              <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-3xl font-bold text-slate-900 mt-1">{stats.distinctArchetypes.toLocaleString()}</p>
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Unique Archetypes</p>
                    <p className="text-xs text-slate-500 font-medium">Personality types</p>
                  </div>
                </div>
              </div>

              <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-3xl font-bold text-slate-900 mt-1">{stats.quizTypeDistribution.length.toLocaleString()}</p>
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Active Quiz Types</p>
                    <p className="text-xs text-slate-500 font-medium">Assessment categories</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Distribution Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quiz Type Distribution */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Quiz Type Distribution</h3>
                </div>
                <div className="space-y-4">
                  {stats.quizTypeDistribution.map((item) => (
                    <div key={item.quizType} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200">
                      <span className="text-sm font-semibold text-slate-900">{item.quizType}</span>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">{item.count.toLocaleString()}</p>
                        <p className="text-xs text-slate-600 font-medium">({item.percentage.toFixed(1)}%)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personality Archetypes */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Personality Archetypes</h3>
                </div>
                <div className="space-y-4">
                  {stats.archetypeDistribution.map((item) => (
                    <div key={item.archetype} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200">
                      <span className="text-sm font-semibold text-slate-900">{item.archetype}</span>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">{item.count.toLocaleString()}</p>
                        <p className="text-xs text-slate-600 font-medium">({item.percentage.toFixed(1)}%)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Premium Search and Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search by email, quiz type, or archetype..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm hover:shadow-md transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={filterArchetype}
                    onChange={(e) => setFilterArchetype(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <option value="all">All Archetypes</option>
                    {stats.archetypeDistribution.map((item) => (
                      <option key={item.archetype} value={item.archetype}>
                        {item.archetype}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={filterQuizType}
                    onChange={(e) => setFilterQuizType(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <option value="all">All Quiz Types</option>
                    {stats.quizTypeDistribution.map((item) => (
                      <option key={item.quizType} value={item.quizType}>
                        {item.quizType}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Leads Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Lead Details ({filteredLeads.length} leads)
                  </h3>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-gradient-to-r from-slate-50 to-white">
                    <tr>
                      <th className="px-8 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Session ID
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Quiz Type
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Answers Count
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {currentLeads.map((lead) => (
                      <motion.tr 
                        key={lead.id} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-white transition-all duration-200"
                      >
                        <td className="px-8 py-4 whitespace-nowrap text-sm font-mono text-slate-900 font-semibold">
                          {lead.sessionId.slice(-8)}
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                          {lead.quizType}
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                          {lead.name || "N/A"}
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                          {lead.email || "N/A"}
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                          {lead.answers?.length || 0}
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                            lead.status === "Stage" || lead.status === "stage"
                              ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg" 
                              : "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg"
                          }`}>
                            {lead.status === "Stage" || lead.status === "stage" ? "Stage" : "In Progress"}
                          </span>
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                          {lead.durationMs ? `${Math.round(lead.durationMs / 60000)}min` : "N/A"}
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap text-sm font-semibold">
                          <a
                            href={`/admin/leads/${lead.sessionId}`}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                          </a>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Premium Pagination */}
              {totalPages > 1 && (
                <div className="px-8 py-6 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-slate-600">
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLeads.length)} of {filteredLeads.length} results
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                      </button>
                      <span className="text-sm font-semibold text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200"
                      >
                        Next
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
