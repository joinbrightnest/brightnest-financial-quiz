"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Simplified interface, as the component fetches its own data
interface LeadDetailViewProps {
  sessionId: string;
  onClose: () => void;
}

export default function LeadDetailView({ sessionId, onClose }: LeadDetailViewProps) {
  const [leadData, setLeadData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'activity' | 'notes' | 'tasks'>('activity');
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('closerToken');
    if (!token || !sessionId) return;

    const fetchLeadDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/closer/lead-details/${sessionId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch lead details');
        }

        const data = await response.json();
        setLeadData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLeadDetails();
  }, [sessionId]);

   if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  if (error || !leadData) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-4">
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
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center"><svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>
              <div>
                <h1 className="text-xl font-semibold text-white">{getLeadName()}</h1>
                <p className="text-slate-300 text-sm">Session ID: {leadData.sessionId}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center"><svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><p><strong>Full Name:</strong> {getLeadName()}</p><p><strong>Email:</strong> {getLeadEmail()}</p></div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center"><svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>Deal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <p><strong>Status:</strong> {leadData.status}</p>
                    <p><strong>Deal Owner:</strong> {leadData.closer?.name || 'N/A'}</p>
                    <p><strong>Lead Added:</strong> {new Date(leadData.completedAt).toLocaleDateString()}</p>
                    <p><strong>Deal Closed:</strong> {leadData.dealClosedAt ? new Date(leadData.dealClosedAt).toLocaleDateString() : '--'}</p>
                    <p><strong>Deal Amount:</strong> {leadData.appointment?.saleValue ? `$${leadData.appointment.saleValue}` : '--'}</p>
                    <p><strong>Lead Source:</strong> {leadData.source || 'Website'}</p>
                </div>
            </div>

            <div className="border-b border-gray-200">
                <div className="flex space-x-8">
                    <button onClick={() => setActiveTab('activity')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'activity' ? 'border-slate-800 text-slate-800' : 'border-transparent text-gray-600'}`}>Activity</button>
                    <button onClick={() => setActiveTab('notes')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'notes' ? 'border-slate-800 text-slate-800' : 'border-transparent text-gray-600'}`}>Notes</button>
                    <button onClick={() => setActiveTab('tasks')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'tasks' ? 'border-slate-800 text-slate-800' : 'border-transparent text-gray-600'}`}>Tasks</button>
                </div>
            </div>

            {activeTab === 'activity' && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6">Activity Timeline</h3>
                    <div className="relative">
                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                        <div className="space-y-6">
                            {leadData.activities.map((act: any) => (
                                <div key={act.id} className="relative flex items-start space-x-4">
                                   {/* Icon can go here */}
                                   <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-200">
                                       <p className="font-semibold">{act.type.replace(/_/g, ' ')}</p>
                                       <p className="text-xs text-slate-500">{new Date(act.timestamp).toLocaleString()}</p>
                                       {/* Details can be expanded here */}
                                   </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {/* Notes and Tasks tabs can be implemented here */}
        </div>
      </div>
    </div>
  );
}
