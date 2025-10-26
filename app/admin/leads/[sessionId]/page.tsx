"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
    name: string;
    role: string;
  };
  affiliate?: {
    name: string;
    referralCode: string;
  };
}

type TabType = 'activity' | 'notes' | 'tasks';

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('activity');

  useEffect(() => {
    if (sessionId) {
      fetchLeadData();
    }
  }, [sessionId]);

  const fetchLeadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch lead data from the dedicated API endpoint
      const response = await fetch(`/api/admin/leads/${sessionId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Lead not found");
        }
        throw new Error("Failed to fetch lead data");
      }
      
      const leadData = await response.json();
      setLeadData(leadData);
    } catch (err) {
      console.error("Error fetching lead data:", err);
      setError(err instanceof Error ? err.message : "Failed to load lead data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !leadData) {
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

  const getLeadName = () => {
    // Try to find name in answers
    const nameAnswer = leadData.answers.find(a => 
      a.questionText?.toLowerCase().includes('name') || 
      a.questionText?.toLowerCase().includes('first name')
    );
    return nameAnswer?.answer || leadData.user?.name || 'Lead Profile';
  };

  const getLeadEmail = () => {
    const emailAnswer = leadData.answers.find(a => 
      a.questionText?.toLowerCase().includes('email')
    );
    return emailAnswer?.answer || leadData.user?.email || 'N/A';
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="min-h-screen bg-white">
        {/* Header - Dark Blue Bar */}
        <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  {getLeadName()}
                </h1>
                <p className="text-slate-300 text-sm">
                  Session ID: {leadData.sessionId}
                </p>
              </div>
            </div>
            <button 
              onClick={() => router.back()}
              className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Full Name</label>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {getLeadName()}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email Address</label>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {getLeadEmail()}
                </p>
              </div>
            </div>
          </div>

          {/* Deal Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Deal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    leadData.status === 'Completed' || leadData.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : leadData.status === 'Booked'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {leadData.status || 'N/A'}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Deal Owner</label>
                <p className="mt-1 text-sm font-semibold text-slate-900">{leadData.affiliate?.name || 'Admin'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Close Date</label>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {leadData.completedAt ? new Date(leadData.completedAt).toLocaleDateString('en-GB') : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Deal Amount</label>
                <p className="mt-1 text-sm font-semibold text-slate-900">--</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Lead Source</label>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {leadData.affiliate?.referralCode ? 'Affiliate' : 'Website'}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Quiz Type</label>
                <p className="mt-1 text-sm font-semibold text-slate-900">{leadData.quizType || 'N/A'}</p>
              </div>
            </div>
            
            {/* Call Details */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h4 className="text-sm font-semibold text-slate-700 mb-4">Call Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Recording Link</label>
                  <div className="mt-1">
                    <p className="text-sm text-slate-400 italic">No recording available</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Call Notes</label>
                  <div className="mt-1">
                    <p className="text-sm text-slate-400 italic">No notes available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quiz Responses */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Quiz Responses
              <span className="ml-2 text-sm text-slate-500 font-normal">({leadData.answers.length} Questions)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leadData.answers.map((answer, index) => (
                <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-sm font-semibold text-slate-900 mb-2">{answer.questionText || `Question ${index + 1}`}</p>
                  <p className="text-sm text-slate-700">{answer.answer || 'No answer provided'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8">
              {(['activity', 'notes', 'tasks'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-slate-800 text-slate-800'
                      : 'border-transparent text-gray-600 hover:text-slate-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'activity' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Lead Information</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Full Name</p>
                    <p className="text-lg font-semibold text-slate-900">{getLeadName()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Email Address</p>
                    <p className="text-lg font-semibold text-slate-900">{getLeadEmail()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Status</p>
                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                      leadData.status === "Completed" || leadData.status === "completed" || leadData.status === "Booked"
                        ? "bg-green-100 text-green-800" 
                        : "bg-orange-100 text-orange-800"
                    }`}>
                      {leadData.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Deal Owner</p>
                    <p className="text-lg font-semibold text-slate-900">{leadData.affiliate?.name || 'Admin'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Close Date</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {leadData.completedAt ? new Date(leadData.completedAt).toLocaleDateString('en-GB') : '--'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Lead Source</p>
                    <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
                      {leadData.affiliate?.referralCode ? 'Affiliate' : 'Website'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Notes</h3>
              <p className="text-sm text-slate-600">No notes have been added for this lead.</p>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Tasks</h3>
              <p className="text-sm text-slate-600">No tasks have been assigned for this lead.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}