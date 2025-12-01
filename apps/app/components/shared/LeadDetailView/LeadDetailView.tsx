"use client";

import { useState, useEffect } from "react";
import { LeadDetailViewProps, TabType, Activity, Note, Task, LeadData } from './types';
import { getApiEndpoint, getLeadName, getLeadEmail } from './utils';
import LeadSidebar from './LeadSidebar';
import ActivityTab from './ActivityTab';
import NotesTab from './NotesTab';
import TasksTab from './TasksTab';

export default function LeadDetailView({ sessionId, onClose, userRole, leadData: preloadedLeadData }: LeadDetailViewProps) {
    const [leadData, setLeadData] = useState<LeadData | null>(preloadedLeadData || null);
    const [loading, setLoading] = useState(!preloadedLeadData);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('activity');

    // Activities state
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(false);

    // Notes state
    const [notes, setNotes] = useState<Note[]>([]);
    const [loadingNotes, setLoadingNotes] = useState(false);

    // Tasks state
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(false);

    // Get auth headers for API calls
    const getAuthHeaders = () => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (userRole === 'closer') {
            const token = localStorage.getItem('closerToken');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    };

    // Fetch lead data
    useEffect(() => {
        if (sessionId && !preloadedLeadData) {
            fetchLeadData();
        }
    }, [sessionId, preloadedLeadData]);

    // Fetch activities on mount
    useEffect(() => {
        if (sessionId) {
            fetchActivities();
        }
    }, [sessionId]);

    // Lazy load notes when tab is selected
    useEffect(() => {
        if (activeTab === 'notes' && leadData) {
            const email = getLeadEmail(leadData);
            if (email && email !== 'N/A') {
                fetchNotes(email);
            }
        }
    }, [activeTab, leadData]);

    // Lazy load tasks when tab is selected
    useEffect(() => {
        if (activeTab === 'tasks' && leadData) {
            const email = getLeadEmail(leadData);
            if (email && email !== 'N/A') {
                fetchTasks(email);
            }
        }
    }, [activeTab, leadData]);

    const fetchLeadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const endpoint = getApiEndpoint(userRole, 'lead-details');
            const response = await fetch(`${endpoint}/${sessionId}`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Lead not found");
                }
                throw new Error("Failed to fetch lead data");
            }

            const data = await response.json();
            setLeadData(data);
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
            const endpoint = getApiEndpoint(userRole, 'activities');
            const response = await fetch(`${endpoint}/${sessionId}/activities`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch activities");
            }

            const data = await response.json();
            setActivities(data.activities || data || []);
        } catch (err) {
            console.error("Error fetching activities:", err);
        } finally {
            setLoadingActivities(false);
        }
    };

    const fetchNotes = async (email: string) => {
        if (!email) return;
        setLoadingNotes(true);
        try {
            const response = await fetch(`/api/notes?leadEmail=${encodeURIComponent(email)}`);
            if (response.ok) {
                const data = await response.json();
                setNotes(data);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setLoadingNotes(false);
        }
    };

    const fetchTasks = async (email: string) => {
        if (!email) return;
        setLoadingTasks(true);
        try {
            const endpoint = getApiEndpoint(userRole, 'tasks');
            const response = await fetch(`${endpoint}?leadEmail=${encodeURIComponent(email)}`, {
                headers: getAuthHeaders(),
            });
            if (response.ok) {
                const data = await response.json();
                setTasks(data.tasks || data || []);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoadingTasks(false);
        }
    };

    const refreshNotes = () => {
        if (leadData) {
            const email = getLeadEmail(leadData);
            if (email && email !== 'N/A') {
                fetchNotes(email);
                fetchActivities(); // Refresh activities to show new note activity
            }
        }
    };

    const refreshTasks = () => {
        if (leadData) {
            const email = getLeadEmail(leadData);
            if (email && email !== 'N/A') {
                fetchTasks(email);
                fetchActivities(); // Refresh activities to show task updates
            }
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

    const leadName = getLeadName(leadData);
    const leadEmail = getLeadEmail(leadData);

    return (
        <div className="fixed inset-0 bg-slate-50 z-[9999] overflow-hidden">
            <div className="h-screen flex flex-col">
                {/* Header with back button */}
                <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onClose}
                            className="text-slate-600 hover:text-slate-900 transition-colors"
                            title="Back to dashboard"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                                <span className="text-slate-700 font-semibold text-sm">
                                    {leadName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-slate-900">{leadName}</h1>
                                <p className="text-xs text-slate-500">{leadEmail}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Two-column layout */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left sidebar - Contact Information */}
                    <LeadSidebar leadData={leadData} />

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
                                                className={`py-3 px-4 border-b-2 font-medium text-sm capitalize transition-colors ${activeTab === tab
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
                                        <ActivityTab
                                            activities={activities}
                                            loading={loadingActivities}
                                            leadData={leadData}
                                        />
                                    )}

                                    {activeTab === 'notes' && (
                                        <NotesTab
                                            notes={notes}
                                            loading={loadingNotes}
                                            leadEmail={leadEmail}
                                            userRole={userRole}
                                            onRefresh={refreshNotes}
                                        />
                                    )}

                                    {activeTab === 'tasks' && (
                                        <TasksTab
                                            tasks={tasks}
                                            loading={loadingTasks}
                                            leadEmail={leadEmail}
                                            userRole={userRole}
                                            onRefresh={refreshTasks}
                                        />
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
