"use client";

import { useState } from 'react';
import { Activity, LeadData } from './types';
import { getPriorityColor } from './utils';

interface ActivityTabProps {
    activities: Activity[];
    loading: boolean;
    leadData: LeadData | null;
}

export default function ActivityTab({ activities, loading, leadData }: ActivityTabProps) {
    const [expandedActivity, setExpandedActivity] = useState<string | null>(null);

    const getActivityIcon = (type: string) => {
        const iconClass = "w-5 h-5";

        switch (type) {
            case 'quiz_completed':
                return (
                    <svg className={`${iconClass} text-purple-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'call_booked':
                return (
                    <svg className={`${iconClass} text-blue-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                );
            case 'deal_closed':
                return (
                    <svg className={`${iconClass} text-green-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'note_added':
                return (
                    <svg className={`${iconClass} text-amber-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                );
            case 'task_created':
            case 'task_started':
            case 'task_completed':
                return (
                    <svg className={`${iconClass} text-indigo-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                );
            case 'outcome_updated':
            case 'outcome_marked':
                return (
                    <svg className={`${iconClass} text-orange-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className={`${iconClass} text-amber-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    const getActivityBgColor = (type: string) => {
        switch (type) {
            case 'quiz_completed': return 'bg-purple-100';
            case 'call_booked': return 'bg-blue-100';
            case 'deal_closed': return 'bg-green-100';
            case 'note_added': return 'bg-amber-100';
            case 'task_created':
            case 'task_started':
            case 'task_completed': return 'bg-indigo-100';
            case 'outcome_updated':
            case 'outcome_marked': return 'bg-orange-100';
            default: return 'bg-amber-100';
        }
    };

    const getActivityMessage = (activity: Activity) => {
        switch (activity.type) {
            case 'quiz_completed':
                return <span><span className="text-blue-600">{activity.leadName}</span> completed the quiz</span>;
            case 'call_booked':
                return <span><span className="text-blue-600">{activity.leadName}</span> booked a call</span>;
            case 'deal_closed':
                return <span><span className="text-green-600">{activity.actor}</span> marked <span className="text-blue-600">{activity.leadName}</span> as closed</span>;
            case 'note_added':
                return <span><span className="text-amber-600">{activity.actor}</span> added a note</span>;
            case 'task_created':
                return <span><span className="text-indigo-600">{activity.actor}</span> created a task</span>;
            case 'task_started':
                return <span><span className="text-blue-600">{activity.actor}</span> started the task</span>;
            case 'task_completed':
                return <span><span className="text-green-600">{activity.actor}</span> finished the task</span>;
            case 'outcome_updated':
            case 'outcome_marked':
                return <span><span className="text-green-600">{activity.actor}</span> marked <span className="text-blue-600">{activity.leadName}</span> as <span className="font-bold text-orange-600">{activity.details?.outcome?.replace(/_/g, ' ')}</span></span>;
            default:
                return <span>Activity recorded</span>;
        }
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-slate-600 mt-4">Loading activities...</p>
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="text-center py-8">
                <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-slate-600">No activity recorded yet</p>
            </div>
        );
    }

    const sortedActivities = [...activities].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return (
        <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200"></div>
            <div className="space-y-4">
                {sortedActivities.map((activity) => (
                    <div key={activity.id} className="relative flex items-start space-x-4">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10 ${getActivityBgColor(activity.type)}`}>
                            {getActivityIcon(activity.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <p className="text-sm font-semibold text-slate-900">
                                {getActivityMessage(activity)}
                            </p>

                            {/* Note content */}
                            {activity.type === 'note_added' && activity.details?.content && (
                                <div className="mt-2">
                                    <p className="text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-wrap">
                                        {activity.details.content}
                                    </p>
                                </div>
                            )}

                            {/* Timestamp */}
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

                            {/* Task details expansion */}
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
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(activity.details.priority)}`}>
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

                            {/* Quiz answers expansion */}
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
                                            {leadData.answers.map((answer, idx) => (
                                                <div key={idx} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                                    <p className="text-xs font-semibold text-slate-900 mb-1">
                                                        {answer.questionText || answer.question?.prompt || `Question ${idx + 1}`}
                                                    </p>
                                                    <p className="text-sm text-slate-700">{answer.answer || answer.value || 'No answer'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Call booked details */}
                            {activity.type === 'call_booked' && activity.details?.closerName && (
                                <p className="text-xs text-slate-500 mt-1">Assigned to: {activity.details.closerName}</p>
                            )}

                            {/* Outcome/call details expansion */}
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
                ))}
            </div>
        </div>
    );
}
