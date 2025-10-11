"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [leads, setLeads] = useState<QuizSession[]>([]);
  const [quizTypes, setQuizTypes] = useState<QuizType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<QuizSession | null>(null);
  const [showAnswersModal, setShowAnswersModal] = useState(false);
  const [filters, setFilters] = useState({
    quizType: 'all',
    status: 'all',
    dateRange: 'all',
    archetype: 'all'
  });

  useEffect(() => {
    fetchLeads();
    fetchQuizTypes();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/admin/basic-stats');
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
        body: JSON.stringify({ filters }),
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
      }
    } catch (error) {
      console.error('Error exporting leads:', error);
    }
  };

  const getFilteredLeads = () => {
    return leads.filter(lead => {
      if (filters.quizType !== 'all' && lead.quizType !== filters.quizType) return false;
      if (filters.status !== 'all' && lead.status !== filters.status) return false;
      if (filters.archetype !== 'all' && lead.result?.archetype !== filters.archetype) return false;
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalLeads}</div>
            <div className="text-sm text-black">Total Leads</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{completedLeads}</div>
            <div className="text-sm text-black">Completed</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{completionRate}%</div>
            <div className="text-sm text-black">Completion Rate</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{Object.keys(archetypeStats).length}</div>
            <div className="text-sm text-black">Archetypes</div>
          </div>
        </div>

        {/* Quiz Type Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-black">Quiz Type Distribution</h3>
          <div className="space-y-2">
            {Object.entries(quizTypeStats).map(([quizType, count]) => (
              <div key={quizType} className="flex justify-between items-center">
                <span className="text-sm text-black">{getQuizTypeDisplayName(quizType)}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(count / totalLeads) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8 text-right text-black">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Archetype Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-black">Archetype Distribution</h3>
          <div className="space-y-2">
            {Object.entries(archetypeStats).map(([archetype, count]) => (
              <div key={archetype} className="flex justify-between items-center">
                <span className="text-sm text-black">{archetype}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(count / completedLeads) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8 text-right text-black">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderQuizTypeTab = (quizType: string) => {
    const filteredLeads = leads.filter(lead => lead.quizType === quizType);
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-black">{getQuizTypeDisplayName(quizType)} Leads</h3>
          <span className="text-sm text-black">{filteredLeads.length} leads</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Session ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Archetype</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => {
                const nameAnswer = lead.answers.find(a => a.question.type === "text");
                const emailAnswer = lead.answers.find(a => a.question.type === "email");
                return (
                  <tr key={lead.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-black">
                      {lead.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-black">
                      {nameAnswer?.value || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-black">
                      {emailAnswer?.value || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-black">
                      {new Date(lead.createdAt).toLocaleDateString()}
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
                      {lead.result?.archetype || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-black">
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowAnswersModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        View Answers
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

  const renderAnswersTab = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-black">All Quiz Answers</h3>
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
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                const nameAnswer = lead.answers.find(a => a.question.type === "text");
                const emailAnswer = lead.answers.find(a => a.question.type === "email");
                return (
                  <tr key={lead.id}>
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
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowAnswersModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        View Answers
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

        {/* Custom Segments */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-black">Custom Segments</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="font-medium text-sm mb-2 text-black">High Completion Rate</div>
              <div className="text-xs text-black mb-2">Leads who completed the quiz</div>
              <div className="text-lg font-bold text-green-600">
                {leads.filter(l => l.status === 'completed').length}
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="font-medium text-sm mb-2 text-black">Recent Leads</div>
              <div className="text-xs text-black mb-2">Last 7 days</div>
              <div className="text-lg font-bold text-blue-600">
                {leads.filter(l => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(l.createdAt) > weekAgo;
                }).length}
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="font-medium text-sm mb-2 text-black">Email Collected</div>
              <div className="text-xs text-black mb-2">Leads with email addresses</div>
              <div className="text-lg font-bold text-purple-600">
                {leads.filter(l => l.answers.some(a => a.question.type === 'email' && a.value)).length}
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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-black">Lead Management</h1>
              <p className="text-sm text-black">CRM system for managing quiz leads and segmentation</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={exportLeads}
                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export Leads</span>
              </button>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Back to Dashboard
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
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-black hover:text-blue-600 hover:border-gray-300'
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

      {/* Answers Modal */}
      {showAnswersModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-black">
                Quiz Answers - {selectedLead.id.slice(0, 8)}...
              </h3>
              <button
                onClick={() => setShowAnswersModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm text-black">
                  <div>
                    <span className="font-medium">Quiz Type:</span> {getQuizTypeDisplayName(selectedLead.quizType)}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {selectedLead.status}
                  </div>
                  <div>
                    <span className="font-medium">Started:</span> {new Date(selectedLead.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Completed:</span> {selectedLead.completedAt ? new Date(selectedLead.completedAt).toLocaleString() : 'N/A'}
                  </div>
                </div>
                
                {selectedLead.result && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 text-black">Result</h4>
                    <div className="text-sm text-black">
                      <div><span className="font-medium">Archetype:</span> {selectedLead.result.archetype}</div>
                      <div><span className="font-medium">Scores:</span> {JSON.stringify(selectedLead.result.scores)}</div>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-3 text-black">Answers</h4>
                  <div className="space-y-3">
                    {selectedLead.answers
                      .sort((a, b) => a.question.order - b.question.order)
                      .map((answer) => (
                        <div key={answer.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="font-medium text-sm mb-1 text-black">
                            Q{answer.question.order}: {answer.question.prompt}
                          </div>
                          <div className="text-sm text-black">
                            <span className="font-medium">Answer:</span> {JSON.stringify(answer.value)}
                          </div>
                          <div className="text-xs text-black mt-1">
                            Type: {answer.question.type}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
