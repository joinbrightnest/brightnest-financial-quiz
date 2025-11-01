"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Activity,
    CreditCard,
    MessageSquare,
    Phone,
    PlusCircle,
    Trash2,
    TrendingUp,
    User,
    Users,
    Video
} from 'lucide-react';

// Simplified interface, as the component fetches its own data
interface LeadDetailViewProps {
  sessionId: string;
  onClose: () => void;
}

// Define the Note type based on your Prisma schema
interface Note {
  id: string;
  content: string;
  createdBy: string | null;
  createdAt: string;
}

const getIcon = (type: string) => {
    switch (type) {
        case 'quiz_completed':
            return <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'call_booked':
            return <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
        case 'deal_closed':
            return <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'outcome_updated':
        case 'outcome_marked':
            return <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'note_added':
            return <MessageSquare className="w-5 h-5 text-gray-500" />;
        case 'outcome_marked_as_paid':
            return <CreditCard className="w-5 h-5 text-green-500" />;
        default:
            return <Activity className="w-5 h-5 text-gray-500" />;
    }
};

export default function LeadDetailView({ sessionId, onClose }: LeadDetailViewProps) {
  const [leadData, setLeadData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'activity' | 'notes' | 'tasks'>('activity');
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);

  // States for note creation
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);


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

  const handleCreateNote = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newNoteContent.trim() || !sessionId) return;
      
      setIsSubmittingNote(true);
      try {
          const token = localStorage.getItem('closerToken');
          const response = await fetch('/api/closer/notes', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                  sessionId: sessionId, // Use sessionId
                  content: newNoteContent,
              }),
          });

          if (response.ok) {
              const newNote = await response.json();
              // To reflect the new note and the new activity log entry, we should refetch all data.
              const detailsResponse = await fetch(`/api/closer/lead-details/${sessionId}`, {
                  headers: { 'Authorization': `Bearer ${token}` }
              });
              if (detailsResponse.ok) {
                  const updatedData = await detailsResponse.json();
                  setLeadData(updatedData);
              }
              
              // Reset form
              setNewNoteContent('');
              setShowNoteForm(false);
          } else {
              const errorData = await response.json();
              setError(errorData.error || 'Failed to create note.');
          }
      } catch (error) {
          setError('An unexpected error occurred while creating the note.');
      } finally {
          setIsSubmittingNote(false);
      }
  };

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
          {/* Combined Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Full Name</label>
                <p className="mt-1 text-sm font-semibold text-slate-900">{getLeadName()}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email Address</label>
                <p className="mt-1 text-sm font-semibold text-slate-900">{getLeadEmail()}</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              Deal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${leadData.status === 'Completed' || leadData.status === 'completed' || leadData.status === 'Booked' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {leadData.status || 'N/A'}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Deal Owner</label>
                <p className="mt-1 text-sm font-semibold text-slate-900">{leadData.closer?.name || 'Unassigned'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Lead Added</label>
                <p className="mt-1 text-sm font-semibold text-slate-900">{leadData.completedAt ? new Date(leadData.completedAt).toLocaleDateString('en-GB') : 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Deal Closed</label>
                <p className="mt-1 text-sm font-semibold text-slate-900">{leadData.dealClosedAt ? new Date(leadData.dealClosedAt).toLocaleDateString('en-GB') : '--'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Deal Amount</label>
                <p className="mt-1 text-sm font-semibold text-slate-900">{leadData.appointment?.saleValue ? `$${Number(leadData.appointment.saleValue).toFixed(2)}` : '--'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Lead Source</label>
                 <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {leadData.source || 'Website'}
                  </span>
                </div>
              </div>
               <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Quiz Type</label>
                <p className="mt-1 text-sm font-semibold text-slate-900">{leadData.quizType}</p>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200">
             <div className="flex space-x-8">
                {(['activity', 'notes', 'tasks'] as const).map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab ? 'border-slate-800 text-slate-800' : 'border-transparent text-gray-600 hover:text-slate-700 hover:border-gray-300'}`}>
                    {tab}
                    </button>
                ))}
            </div>
          </div>

          {activeTab === 'activity' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Activity Timeline
              </h3>
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                <div className="space-y-6">
                  {leadData.activities.map((activity: any) => (
                    <div key={activity.id} className="relative flex items-start space-x-4">
                       <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center z-10 ${
                            activity.type === 'quiz_completed' ? 'bg-purple-100' :
                            activity.type === 'call_booked' ? 'bg-blue-100' :
                            activity.type === 'deal_closed' ? 'bg-green-100' :
                            (activity.type === 'outcome_updated' || activity.type === 'outcome_marked') ? 'bg-orange-100' :
                            'bg-amber-100'
                        }`}>
                            {activity.type === 'quiz_completed' && (<svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>)}
                            {activity.type === 'call_booked' && (<svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>)}
                            {activity.type === 'deal_closed' && (<svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>)}
                            {(activity.type === 'outcome_updated' || activity.type === 'outcome_marked') && (<svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>)}
                        </div>
                      <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <p className="text-sm font-semibold text-slate-900">
                          {activity.type === 'quiz_completed' && (<span><span className="text-blue-600">{activity.leadName}</span> completed the quiz</span>)}
                          {activity.type === 'call_booked' && (<span><span className="text-blue-600">{activity.leadName}</span> booked a call</span>)}
                          {activity.type === 'deal_closed' && (<span><span className="text-green-600">{activity.actor}</span> marked <span className="text-blue-600">{activity.leadName}</span> as closed</span>)}
                          {(activity.type === 'outcome_updated' || activity.type === 'outcome_marked') && (<span><span className="text-green-600">{activity.actor}</span> marked <span className="text-blue-600">{activity.leadName}</span> as <span className="font-bold text-orange-600">{activity.details?.outcome?.replace(/_/g, ' ')}</span></span>)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{new Date(activity.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                        {activity.type === 'quiz_completed' && (
                            <div className="mt-3">
                                <button onClick={() => setExpandedActivity(expandedActivity === activity.id ? null : activity.id)} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center">
                                {expandedActivity === activity.id ? 'Hide quiz answers' : 'View quiz answers'}
                                <svg className={`w-4 h-4 ml-1 transition-transform ${expandedActivity === activity.id ? '-rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {expandedActivity === activity.id && leadData && (
                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {leadData.answers.map((answer: any, idx: number) => (
                                        <div key={idx} className="bg-white rounded-lg p-3 border border-slate-300">
                                        <p className="text-xs font-semibold text-slate-900 mb-1">{answer.questionText || `Question ${idx + 1}`}</p>
                                        <p className="text-sm text-slate-700">{answer.answer || 'No answer'}</p>
                                        </div>
                                    ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {activity.type === 'call_booked' && activity.details.closerName && (<p className="text-xs text-slate-500 mt-1">Assigned to: {activity.details.closerName}</p>)}
                        {(activity.type === 'outcome_updated' || activity.type === 'outcome_marked' || activity.type === 'deal_closed') && (
                            <div className="mt-3">
                                <button onClick={() => setExpandedActivity(expandedActivity === activity.id ? null : activity.id)} className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center">
                                {expandedActivity === activity.id ? 'Hide call details' : 'View call details'}
                                <svg className={`w-4 h-4 ml-1 transition-transform ${expandedActivity === activity.id ? '-rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {expandedActivity === activity.id && (
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="bg-white rounded-lg p-3 border border-slate-300">
                                    <p className="text-xs font-semibold text-slate-900 mb-1">Recording Link</p>
                                    {activity.details?.recordingLink ? (<a href={activity.details.recordingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 underline break-all">{activity.details.recordingLink}</a>) : (<p className="text-sm text-slate-400 italic">No recording</p>)}
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-slate-300">
                                    <p className="text-xs font-semibold text-slate-900 mb-1">Call Notes</p>
                                    {activity.details?.notes ? (<p className="text-sm text-slate-700 whitespace-pre-wrap">{activity.details.notes}</p>) : (<p className="text-sm text-slate-400 italic">No notes</p>)}
                                    </div>
                                </div>
                                )}
                            </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              {/* Call Details */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center mb-6">
                  <Phone className="w-6 h-6 text-slate-500 mr-3" />
                  <h3 className="text-lg font-semibold text-slate-900">Call Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recording Link</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      {leadData.appointment?.recordingLink || 'No recording available'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Call Notes</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      {leadData.appointment?.closerNotes || 'No notes available'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <MessageSquare className="w-6 h-6 text-slate-500 mr-3" />
                    <h3 className="text-lg font-semibold text-slate-900">Notes ({leadData.notes?.length || 0})</h3>
                  </div>
                  <button
                    onClick={() => setShowNoteForm(!showNoteForm)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-700"
                  >
                    <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                    {showNoteForm ? 'Cancel' : 'Create Note'}
                  </button>
                </div>

                {showNoteForm && (
                  <form onSubmit={handleCreateNote} className="mb-6">
                    <textarea
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      rows={4}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500"
                      placeholder="Add a new note..."
                      disabled={isSubmittingNote}
                    />
                    <div className="mt-2 text-right">
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400"
                        disabled={isSubmittingNote || !newNoteContent.trim()}
                      >
                        {isSubmittingNote ? 'Saving...' : 'Save Note'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {leadData.notes && leadData.notes.length > 0 ? (
                    leadData.notes.map((note: Note) => (
                      <div key={note.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm text-slate-800 whitespace-pre-wrap">{note.content}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          - {note.createdBy || 'System'} on {new Date(note.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-600">No notes have been added for this lead.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Tasks
              </h3>
              <div className="space-y-4">
                {/* Placeholder for tasks */}
                <div className="bg-slate-100 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">No tasks have been assigned to this lead yet.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
