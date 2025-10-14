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
  const [selectedLead, setSelectedLead] = useState<LeadData | null>(null);
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !affiliateData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Lead Analytics Dashboard
              </h1>
              <p className="text-gray-900 mt-1">
                Comprehensive CRM system for {affiliateData.name} • {affiliateData.tier} tier
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportLeads}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                Export All
              </button>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
              >
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
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">🧍‍♂️</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
                    <p className="text-sm text-gray-900">Total Qualified Leads</p>
                    <p className="text-xs text-gray-900">Quiz completions</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{stats.distinctArchetypes}</p>
                    <p className="text-sm text-gray-900">Unique Archetypes</p>
                    <p className="text-xs text-gray-900">Personality types</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">📄</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{stats.quizTypeDistribution.length}</p>
                    <p className="text-sm text-gray-900">Active Quiz Types</p>
                    <p className="text-xs text-gray-900">Assessment categories</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quiz Type Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Type Distribution</h3>
                <div className="space-y-3">
                  {stats.quizTypeDistribution.map((item) => (
                    <div key={item.quizType} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{item.quizType}</span>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{item.count} ({item.percentage.toFixed(1)}%)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personality Archetypes */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personality Archetypes</h3>
                <div className="space-y-3">
                  {stats.archetypeDistribution.map((item) => (
                    <div key={item.archetype} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{item.archetype}</span>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{item.count} ({item.percentage.toFixed(1)}%)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by email, quiz type, or archetype..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <select
                  value={filterArchetype}
                  onChange={(e) => setFilterArchetype(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="all">All Archetypes</option>
                  {stats.archetypeDistribution.map((item) => (
                    <option key={item.archetype} value={item.archetype}>
                      {item.archetype}
                    </option>
                  ))}
                </select>
                <select
                  value={filterQuizType}
                  onChange={(e) => setFilterQuizType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="all">All Quiz Types</option>
                  {stats.quizTypeDistribution.map((item) => (
                    <option key={item.quizType} value={item.quizType}>
                      {item.quizType}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Lead Details ({filteredLeads.length} leads)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Session ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Quiz Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Archetype
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Completed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {lead.sessionId.slice(-8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lead.user?.email || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lead.quizType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lead.result?.archetype || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lead.completedAt ? new Date(lead.completedAt).toLocaleDateString() : "Incomplete"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lead.durationMs ? `${Math.round(lead.durationMs / 60000)}min` : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-900">
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLeads.length)} of {filteredLeads.length} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-900">
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
          </motion.div>
        )}

        {/* Lead Detail Modal */}
        {selectedLead && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Lead Details
                  </h3>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Session Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Session ID:</span> {selectedLead.sessionId}</p>
                      <p><span className="font-medium">Quiz Type:</span> {selectedLead.quizType}</p>
                      <p><span className="font-medium">Started:</span> {new Date(selectedLead.startedAt).toLocaleString()}</p>
                      <p><span className="font-medium">Completed:</span> {selectedLead.completedAt ? new Date(selectedLead.completedAt).toLocaleString() : "Incomplete"}</p>
                      <p><span className="font-medium">Status:</span> {selectedLead.status}</p>
                      <p><span className="font-medium">Duration:</span> {selectedLead.durationMs ? `${Math.round(selectedLead.durationMs / 60000)} minutes` : "N/A"}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">User Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Email:</span> {selectedLead.user?.email || "N/A"}</p>
                      <p><span className="font-medium">Role:</span> {selectedLead.user?.role || "N/A"}</p>
                    </div>
                    {selectedLead.result && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Quiz Results</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Archetype:</span> {selectedLead.result.archetype}</p>
                          <p><span className="font-medium">Score:</span> {selectedLead.result.score}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {selectedLead.answers.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Quiz Answers</h4>
                    <div className="space-y-3">
                      {selectedLead.answers.map((answer, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <p className="font-medium text-gray-900 mb-2">{answer.questionText}</p>
                          <p className="text-gray-900">Answer: {answer.answer}</p>
                          <p className="text-sm text-gray-900">Value: {answer.answerValue}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
