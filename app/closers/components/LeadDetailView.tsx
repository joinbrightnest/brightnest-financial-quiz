"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Simplified interface, as the component fetches its own data
interface LeadDetailViewProps {
  sessionId: string;
  onClose: () => void;
}

type TabType = 'activity' | 'notes' | 'tasks';

export default function LeadDetailView({ sessionId, onClose }: LeadDetailViewProps) {
  const [leadData, setLeadData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('activity');
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchLeadData();
      fetchActivities();
    }
  }, [sessionId]);

  const fetchLeadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('closerToken');

      // Fetch lead data from the dedicated API endpoint
      const response = await fetch(`/api/closer/lead-details/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
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
      const token = localStorage.getItem('closerToken');
      const response = await fetch(`/api/closer/lead-details/${sessionId}/activities`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }
      
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setLoadingActivities(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  if (error || !leadData) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center p-4">
        <div className="text-center bg-slate-50 p-8 rounded-lg border border-red-200">
          <h3 className="text-xl font-bold text-red-600">Error Loading Data</h3>
          <p className="text-slate-600 mt-2 mb-6">{error}</p>
          <button onClick={onClose} className="px-6 py-2 bg-slate-800 text-white rounded-md">Go Back</button>
        </div>
      </div>
    );
  }
  
  const getLeadName = () => leadData.answers.find((a: any) => a.questionText?.toLowerCase().includes('name'))?.answer || 'Lead Profile';
  const getLeadEmail = () => leadData.answers.find((a: any) => a.questionText?.toLowerCase().includes('email'))?.answer || 'N/A';
  
  return (
    <div className="fixed inset-0 bg-slate-50 z-[9999] overflow-hidden">
      <div className="h-screen flex flex-col">
        {/* Header with back button */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onClose}
              className="text-slate-600 hover:text-slate-900 transition-colors"
              title="Back to leads"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                <span className="text-slate-700 font-semibold text-sm">
                  {getLeadName().charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">{getLeadName()}</h1>
                <p className="text-xs text-slate-500">{getLeadEmail()}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Two-column layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar - Contact Information */}
          <div className="w-96 bg-white border-r border-slate-200 overflow-y-auto flex-shrink-0">
            <div className="p-6">
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <div className="flex items-center mb-4">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h3 className="text-sm font-semibold text-slate-900">Personal Information</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-wide">Full Name</label>
                      <p className="text-sm text-slate-900 mt-1 font-medium">{getLeadName()}</p>
                    </div>
                    
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-wide">Email Address</label>
                      <p className="text-sm text-slate-900 mt-1">{getLeadEmail()}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <div className="flex items-center mb-4">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <h3 className="text-sm font-semibold text-slate-900">Deal Information</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-wide">Stage</label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          leadData.status === 'Completed' || leadData.status === 'completed' || leadData.status === 'Booked'
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {leadData.status || '--'}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-wide">Deal Owner</label>
                      <p className="text-sm text-slate-900 mt-1">{leadData.closer?.name || 'Unassigned'}</p>
                    </div>
                    
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-wide">Lead Added</label>
                      <p className="text-sm text-slate-900 mt-1">
                        {leadData.completedAt ? new Date(leadData.completedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : '--'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-wide">Deal Closed</label>
                      <p className="text-sm text-slate-900 mt-1">
                        {leadData.dealClosedAt ? new Date(leadData.dealClosedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : '--'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-wide">Deal Amount</label>
                      <p className="text-sm text-slate-900 mt-1">
                        {leadData.appointment?.saleValue ? `$${Number(leadData.appointment.saleValue).toFixed(2)}` : '--'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-wide">Lead Source</label>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {leadData.source || 'Website'}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-wide">Quiz Type</label>
                      <p className="text-sm text-slate-900 mt-1">{leadData.quizType || '--'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Tabs Content */}
          <div className="flex-1 overflow-y-auto bg-slate-50">
            <div className="p-6">
              <div className="bg-white rounded-lg border border-slate-200">
                {/* Tab Navigation */}
                <div className="border-b border-slate-200">
                  <div className="flex px-6">
                    {(['activity', 'notes', 'tasks'] as TabType[]).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-3 px-4 border-b-2 font-medium text-sm capitalize transition-colors ${
                          activeTab === tab
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'activity' && (
                    <div>
                  {loadingActivities ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-slate-600 mt-4">Loading activities...</p>
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm text-slate-600">No activity recorded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {[...activities].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((activity: any) => (
                        <div key={activity.id} className="flex items-start space-x-4">
                          {/* Icon */}
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.type === 'quiz_completed' ? 'bg-purple-100' :
                            activity.type === 'call_booked' ? 'bg-blue-100' :
                            activity.type === 'deal_closed' ? 'bg-green-100' :
                            activity.type === 'note_added' ? 'bg-amber-100' :
                            (activity.type === 'task_created' || activity.type === 'task_started' || activity.type === 'task_completed') ? 'bg-indigo-100' :
                            (activity.type === 'outcome_updated' || activity.type === 'outcome_marked') ? 'bg-orange-100' :
                            'bg-amber-100'
                          }`}>
                            {activity.type === 'quiz_completed' && (
                              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            {activity.type === 'call_booked' && (
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            )}
                            {activity.type === 'deal_closed' && (
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            {activity.type === 'note_added' && (
                              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            )}
                            {(activity.type === 'task_created' || activity.type === 'task_started' || activity.type === 'task_completed') && (
                              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                              </svg>
                            )}
                            {(activity.type === 'outcome_updated' || activity.type === 'outcome_marked') && (
                              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div>
                              <p className="text-sm text-slate-900">
                                {activity.type === 'quiz_completed' && (
                                  <span><span className="font-semibold text-blue-600">{activity.leadName}</span> completed the quiz</span>
                                )}
                                {activity.type === 'call_booked' && (
                                  <span><span className="font-semibold text-blue-600">{activity.leadName}</span> booked a call</span>
                                )}
                                {activity.type === 'deal_closed' && (
                                  <span><span className="font-semibold text-green-600">{activity.actor}</span> marked <span className="font-semibold text-blue-600">{activity.leadName}</span> as closed</span>
                                )}
                                {activity.type === 'note_added' && (
                                  <span><span className="font-semibold text-green-600">{activity.actor}</span> added a note</span>
                                )}
                                {activity.type === 'task_created' && (
                                  <span><span className="font-semibold text-indigo-600">{activity.actor}</span> created a task</span>
                                )}
                                {activity.type === 'task_started' && (
                                  <span><span className="font-semibold text-blue-600">{activity.actor}</span> started the task</span>
                                )}
                                {activity.type === 'task_completed' && (
                                  <span><span className="font-semibold text-green-600">{activity.actor}</span> finished the task</span>
                                )}
                                {(activity.type === 'outcome_updated' || activity.type === 'outcome_marked') && (
                                  <span><span className="font-semibold text-green-600">{activity.actor}</span> marked <span className="font-semibold text-blue-600">{activity.leadName}</span> as <span className="font-bold text-orange-600">{activity.details?.outcome?.replace(/_/g, ' ')}</span></span>
                                )}
                              </p>
                              
                              {activity.type === 'note_added' && activity.details?.content && (
                                <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{activity.details.content}</p>
                              )}
                              
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
                              
                              {(activity.type === 'task_created' || activity.type === 'task_started' || activity.type === 'task_completed') && activity.details?.title && (
                                <div className="mt-2">
                                  <button
                                    onClick={() => setExpandedActivity(expandedActivity === activity.id ? null : activity.id)}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
                                  >
                                    {expandedActivity === activity.id ? 'Hide task details' : 'View task details'}
                                    <svg className={`w-4 h-4 ml-1 transition-transform ${expandedActivity === activity.id ? '-rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                  {expandedActivity === activity.id && (
                                    <div className="mt-3">
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
                                        <div className="mt-2 p-3 bg-slate-50 rounded border border-slate-200">
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
                              
                              {activity.type === 'quiz_completed' && (
                                <div className="mt-3">
                                  <button 
                                    onClick={() => setExpandedActivity(expandedActivity === activity.id ? null : activity.id)} 
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
                                  >
                                    {expandedActivity === activity.id ? 'Hide quiz answers' : 'View quiz answers'}
                                    <svg className={`w-4 h-4 ml-1 transition-transform ${expandedActivity === activity.id ? '-rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                  {expandedActivity === activity.id && leadData && (
                                    <div className="mt-4 grid grid-cols-1 gap-3">
                                      {leadData.answers.map((answer: any, idx: number) => (
                                        <div key={idx} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                          <p className="text-xs font-semibold text-slate-900 mb-1">{answer.questionText || `Question ${idx + 1}`}</p>
                                          <p className="text-sm text-slate-700">{answer.answer || 'No answer'}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {activity.type === 'call_booked' && activity.details?.closerName && (
                                <p className="text-xs text-slate-500 mt-1">Assigned to: {activity.details.closerName}</p>
                              )}
                              
                              {(activity.type === 'outcome_updated' || activity.type === 'outcome_marked' || activity.type === 'deal_closed') && (
                                <div className="mt-3">
                                  <button 
                                    onClick={() => setExpandedActivity(expandedActivity === activity.id ? null : activity.id)} 
                                    className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
                                  >
                                    {expandedActivity === activity.id ? 'Hide call details' : 'View call details'}
                                    <svg className={`w-4 h-4 ml-1 transition-transform ${expandedActivity === activity.id ? '-rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                  {expandedActivity === activity.id && (
                                    <div className="mt-4 space-y-3">
                                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                        <p className="text-xs font-semibold text-slate-900 mb-1">Recording Link</p>
                                        {activity.details?.recordingLink ? (
                                          <a href={activity.details.recordingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 underline break-all">
                                            {activity.details.recordingLink}
                                          </a>
                                        ) : (
                                          <p className="text-sm text-slate-400 italic">No recording</p>
                                        )}
                                      </div>
                                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                        <p className="text-xs font-semibold text-slate-900 mb-1">Call Notes</p>
                                        {activity.details?.notes ? (
                                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{activity.details.notes}</p>
                                        ) : (
                                          <p className="text-sm text-slate-400 italic">No notes</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div>
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <p className="text-slate-600 text-sm">Notes functionality coming soon</p>
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && (
                <div>
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <p className="text-slate-600 text-sm">Tasks functionality coming soon</p>
                  </div>
                </div>
              )}
            </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
