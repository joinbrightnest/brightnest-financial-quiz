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
  appointment?: {
    id: string;
    outcome: string;
    saleValue: number | null;
    scheduledAt: string;
    createdAt: string;
    updatedAt: string;
  };
  dealClosedAt?: string | null;
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
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetchLeadData();
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId && activeTab === 'activity') {
      fetchActivities();
    }
  }, [sessionId, activeTab]);

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

  const fetchActivities = async () => {
    try {
      setLoadingActivities(true);
      const response = await fetch(`/api/admin/leads/${sessionId}/activities`);
      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (err) {
      console.error("❌ Error fetching activities:", err);
    } finally {
      setLoadingActivities(false);
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
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Lead Added</label>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {leadData.completedAt ? new Date(leadData.completedAt).toLocaleDateString('en-GB') : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Deal Closed</label>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {leadData.dealClosedAt ? new Date(leadData.dealClosedAt).toLocaleDateString('en-GB') : '--'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Deal Amount</label>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {leadData.appointment?.saleValue ? `$${leadData.appointment.saleValue.toFixed(2)}` : '--'}
                </p>
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
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Activity Timeline
              </h3>
              
              {loadingActivities ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-slate-600 mt-4">Loading activity...</p>
                  </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm text-slate-600">No activity recorded yet</p>
                  </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                  
                  {/* Activity items */}
                  <div className="space-y-6">
                    {activities.map((activity, index) => (
                      <div key={activity.id} className="relative flex items-start space-x-4">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center z-10 ${
                          activity.type === 'quiz_completed' ? 'bg-purple-100' :
                          activity.type === 'call_booked' ? 'bg-blue-100' :
                          activity.type === 'deal_closed' ? 'bg-green-100' :
                          (activity.type === 'outcome_updated' || activity.type === 'outcome_marked') ? 'bg-orange-100' :
                          activity.type === 'task_created' ? 'bg-indigo-100' :
                          activity.type === 'task_started' ? 'bg-cyan-100' :
                          activity.type === 'task_finished' ? 'bg-teal-100' :
                          'bg-amber-100'
                        }`}>
                          {activity.type === 'quiz_completed' && (
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          {activity.type === 'call_booked' && (
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                          {activity.type === 'deal_closed' && (
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          {activity.type === 'note_added' && (
                            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          )}
                          {(activity.type === 'outcome_updated' || activity.type === 'outcome_marked') && (
                            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          {(activity.type === 'task_created' || activity.type === 'task_started' || activity.type === 'task_finished') && (
                            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-900">
                                {activity.type === 'quiz_completed' && (
                                  <span><span className="text-blue-600">{activity.leadName}</span> completed the quiz</span>
                                )}
                                {activity.type === 'call_booked' && (
                                  <span><span className="text-blue-600">{activity.leadName}</span> booked a call</span>
                                )}
                                {activity.type === 'deal_closed' && (
                                  <span><span className="text-green-600">{activity.actor}</span> marked <span className="text-blue-600">{activity.leadName}</span> as closed</span>
                                )}
                                {activity.type === 'note_added' && (
                                  <span><span className="text-green-600">{activity.actor}</span> added a note to <span className="text-blue-600">{activity.leadName}</span></span>
                                )}
                                {(activity.type === 'outcome_updated' || activity.type === 'outcome_marked') && (
                                  <span><span className="text-green-600">{activity.actor}</span> marked <span className="text-blue-600">{activity.leadName}</span> as <span className="font-bold text-orange-600">{activity.details?.outcome?.replace(/_/g, ' ')}</span></span>
                                )}
                                {activity.type === 'task_created' && (
                                  <span><span className="text-green-600">{activity.actor}</span> created a task</span>
                                )}
                                {activity.type === 'task_started' && (
                                  <span><span className="text-green-600">{activity.actor}</span> started the task</span>
                                )}
                                {activity.type === 'task_finished' && (
                                  <span><span className="text-green-600">{activity.actor}</span> finished the task</span>
                                )}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {new Date(activity.timestamp).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </p>
                              
                              {/* Outcome activities - Always show button, even if details are missing */}
                              {(activity.type === 'outcome_updated' || activity.type === 'outcome_marked' || activity.type === 'deal_closed') && (
                                <div className="mt-3">
                                  {/* Outcome Badges */}
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    {activity.details?.outcome && (
                                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-300">
                                        {activity.details.outcome.replace(/_/g, ' ').toUpperCase()}
                                      </span>
                                    )}
                                    {activity.details?.previousOutcome && (
                                      <span className="text-xs text-slate-500">
                                        (was: {activity.details.previousOutcome.replace(/_/g, ' ')})
                                      </span>
                                    )}
                                    {activity.details?.saleValue && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        ${Number(activity.details.saleValue).toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* TEST: Always visible div to confirm rendering */}
                                  <div className="mt-2 p-2 bg-red-500 text-white text-xs font-bold">
                                    TEST: Button should appear below this
                                  </div>
                                  
                                  {/* View call details button - MUST APPEAR FOR ALL OUTCOME ACTIVITIES */}
                                  <button
                                    onClick={() => {
                                      setExpandedActivity(expandedActivity === activity.id ? null : activity.id);
                                    }}
                                    className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center bg-yellow-200 border-2 border-blue-500 px-3 py-2 rounded"
                                  >
                                    {expandedActivity === activity.id ? (
                                      <>
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                        Hide call details
                                      </>
                                    ) : (
                                      <>
                                        View call details
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                      </>
                                    )}
                                  </button>
                                  
                                  {/* Expanded Call Details */}
                                  {expandedActivity === activity.id && (
                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {/* Recording Link */}
                                      <div className="bg-white rounded-lg p-3 border border-slate-300">
                                        <p className="text-xs font-semibold text-slate-900 mb-1">Recording Link</p>
                                        {activity.details?.recordingLink ? (
                                          <a 
                                            href={activity.details.recordingLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                                          >
                                            {activity.details.recordingLink}
                                          </a>
                                        ) : (
                                          <p className="text-sm text-slate-400 italic">No recording available</p>
                                        )}
                                      </div>
                                      
                                      {/* Call Notes */}
                                      <div className="bg-white rounded-lg p-3 border border-slate-300">
                                        <p className="text-xs font-semibold text-slate-900 mb-1">Call Notes</p>
                                        {activity.details?.notes ? (
                                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{activity.details.notes}</p>
                                        ) : (
                                          <p className="text-sm text-slate-400 italic">No notes available</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Activity details - EXCLUDE outcome activities (they're handled above) */}
                              {activity.details && !(activity.type === 'outcome_updated' || activity.type === 'outcome_marked' || activity.type === 'deal_closed') && (
                                <div className="mt-3 text-sm text-slate-600">
                                  {activity.type === 'quiz_completed' && (
                                    <div>
                                      <div className="flex items-center space-x-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                          {activity.details.quizType?.replace('-', ' ')}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                          {activity.details.answersCount} questions answered
                                        </span>
                                        <button
                                          onClick={() => setExpandedActivity(expandedActivity === activity.id ? null : activity.id)}
                                          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
                                        >
                                          {expandedActivity === activity.id ? (
                                            <>
                                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                              </svg>
                                              Hide answers
                                            </>
                                          ) : (
                                            <>
                                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                              </svg>
                                              View answers
                                            </>
                                          )}
                                        </button>
                                      </div>
                                      {expandedActivity === activity.id && leadData && (
                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                          {leadData.answers.map((answer, idx) => (
                                            <div key={idx} className="bg-white rounded-lg p-3 border border-slate-300">
                                              <p className="text-xs font-semibold text-slate-900 mb-1">
                                                {answer.questionText || `Question ${idx + 1}`}
                                              </p>
                                              <p className="text-sm text-slate-700">{answer.answer || 'No answer provided'}</p>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {activity.type === 'call_booked' && activity.details.scheduledAt && (
                                    <div className="text-xs text-slate-600">
                                      <div>
                                        Scheduled for: {new Date(activity.details.scheduledAt).toLocaleString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: 'numeric',
                                          minute: '2-digit'
                                        })}
                                        {activity.details.closerName && (
                                          <span className="ml-2 text-slate-500">
                                            Assigned to: {activity.details.closerName}
                                          </span>
                                        )}
                                      </div>
                                      {/* Note: Call details (recording link & notes) are shown in outcome_marked/outcome_updated activities, not here */}
                                    </div>
                                  )}
                                  {activity.type === 'note_added' && activity.details.content && (
                                    <div className="mt-2 p-3 bg-white rounded border border-slate-200">
                                      <p className="text-sm text-slate-700">{activity.details.content}</p>
                                    </div>
                                  )}
                                  {(activity.type === 'task_created' || activity.type === 'task_started' || activity.type === 'task_finished') && activity.details.title && (
                                    <div className="mt-2">
                                      <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                          {activity.details.title}
                                        </span>
                                        {activity.details.priority && activity.type === 'task_created' && (
                                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                            activity.details.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                            activity.details.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                            activity.details.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                          }`}>
                                            {activity.details.priority}
                                          </span>
                                        )}
                                      </div>
                                      {activity.details.description && activity.type === 'task_created' && (
                                        <div className="mt-2 p-3 bg-white rounded border border-slate-200">
                                          <p className="text-sm text-slate-600">{activity.details.description}</p>
                                        </div>
                                      )}
                                      {activity.details.dueDate && activity.type === 'task_created' && (
                                        <p className="text-xs text-slate-500 mt-2">
                                          Due: {new Date(activity.details.dueDate).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit'
                                          })}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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