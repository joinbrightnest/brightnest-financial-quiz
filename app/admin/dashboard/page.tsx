"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin-auth";
import CEOAnalytics from "../components/CEOAnalytics";
import CloserManagement from "../components/CloserManagement";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface AdminStats {
  totalSessions: number;
  completedSessions: number;
  completionRate: number;
  avgDurationMs: number;
  allLeads: Array<{
    id: string;
    status: string;
    completedAt: string | null;
    createdAt: string;
    result: {
      archetype: string;
    } | null;
    answers: Array<{
      questionId: string;
      value: string;
      question: {
        prompt: string;
        type: string;
      };
    }>;
    source?: string;
  }>;
  quizTypes?: Array<{
    name: string;
    displayName: string;
    description: string;
    questionCount: number;
  }>;
  archetypeStats: Array<{
    archetype: string;
    _count: { archetype: number };
  }>;
  questionAnalytics: Array<{
    questionNumber: number;
    questionText: string;
    answeredCount: number;
    retentionRate: number;
  }>;
  dailyActivity: Array<{
    createdAt: string;
    _count: { id: number };
  }>;
  visitors: number;
  partialSubmissions: number;
  leadsCollected: number;
  averageTimeMs: number;
  topDropOffQuestions: Array<{
    questionNumber: number;
    questionText: string;
    dropFromPrevious: number;
    retentionRate: number;
    previousRetentionRate: number;
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, logout } = useAdminAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitiallyLoaded = useRef(false);
  const [dateRange, setDateRange] = useState('7d');
  const [selectedQuizType, setSelectedQuizType] = useState<string>('financial-profile');
  const [showQuickLinks, setShowQuickLinks] = useState(false);
  const [showResetDropdown, setShowResetDropdown] = useState(false);
  const [showCEOAnalytics, setShowCEOAnalytics] = useState(false);
  const [showMainDashboard, setShowMainDashboard] = useState(true);
  const [showCloserManagement, setShowCloserManagement] = useState(false);
  const [showPipeline, setShowPipeline] = useState(false);
  const [pipelineView, setPipelineView] = useState<'kanban' | 'appointments'>('kanban');
  const [showSettings, setShowSettings] = useState(false);
  const [qualificationThreshold, setQualificationThreshold] = useState(17);
  const [isUpdatingThreshold, setIsUpdatingThreshold] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);

  // Helper functions for appointments
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'no_show': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOutcomeColor = (outcome: string | null) => {
    switch (outcome) {
      case 'converted': return 'bg-green-100 text-green-800';
      case 'not_interested': return 'bg-red-100 text-red-800';
      case 'needs_follow_up': return 'bg-yellow-100 text-yellow-800';
      case 'callback_requested': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecordingLink = (appointment: any) => {
    if (!appointment.outcome) return null;
    
    switch (appointment.outcome) {
      case 'converted':
        return appointment.recordingLinkConverted;
      case 'not_interested':
        return appointment.recordingLinkNotInterested;
      case 'needs_follow_up':
        return appointment.recordingLinkNeedsFollowUp;
      case 'wrong_number':
        return appointment.recordingLinkWrongNumber;
      case 'no_answer':
        return appointment.recordingLinkNoAnswer;
      case 'callback_requested':
        return appointment.recordingLinkCallbackRequested;
      case 'rescheduled':
        return appointment.recordingLinkRescheduled;
      default:
        return null;
    }
  };

  // Fetch appointments data
  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/admin/appointments');
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  // Format duration from milliseconds to human readable format
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    if (ms < 3600000) return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
    return `${Math.round(ms / 3600000)}h ${Math.round((ms % 3600000) / 60000)}m`;
  };

  // Fetch settings
  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      if (data.success && data.settings) {
        setQualificationThreshold(parseInt(data.settings.value));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  // Update qualification threshold
  const updateQualificationThreshold = async (newThreshold: number) => {
    setIsUpdatingThreshold(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qualificationThreshold: newThreshold
        }),
      });

      const data = await response.json();
      if (data.success) {
        setQualificationThreshold(newThreshold);
        alert('Qualification threshold updated successfully!');
      } else {
        alert('Failed to update threshold: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating threshold:', error);
      alert('Failed to update threshold. Please try again.');
    } finally {
      setIsUpdatingThreshold(false);
    }
  };

  const fetchStats = useCallback(async (isTimeframeChange = false) => {
    // Only show loading state on initial load, not on window switches or timeframe changes
    if (!isTimeframeChange && !hasInitiallyLoaded.current) {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const quizTypeParam = selectedQuizType === 'all' ? '' : `&quizType=${selectedQuizType}`;
      const response = await fetch(`/api/admin/basic-stats?dateRange=${dateRange}${quizTypeParam}`, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      
      const data = await response.json();
      setStats(data);
      hasInitiallyLoaded.current = true;
        } catch {
          setError("Failed to load admin stats");
        } finally {
      // Only hide loading state if we were actually showing it
      if (!isTimeframeChange && !hasInitiallyLoaded.current) {
        setIsLoading(false);
      }
    }
  }, [dateRange, selectedQuizType]);

  useEffect(() => {
    fetchStats(true); // Pass true to indicate this is a timeframe change
    fetchSettings();
  }, [fetchStats]);

  useEffect(() => {
    if (showPipeline) {
      fetchAppointments();
    }
  }, [showPipeline]);

  // Handle page visibility and focus changes to prevent unnecessary re-fetching
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Don't refetch when switching between windows - only on initial load
      if (!document.hidden && !hasInitiallyLoaded.current) {
        fetchStats(true);
      }
    };

    const handleWindowFocus = () => {
      // Don't refetch when window regains focus - this prevents the loading flash
      // The data is already there, no need to reload
    };

    const handleWindowBlur = () => {
      // Don't do anything when window loses focus
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [stats, fetchStats]);


  const exportLeads = () => {
    if (!stats) return;
    
    const csvContent = [
      ["Session ID", "Name", "Email", "Date", "Status", "Completed At", "Archetype"],
      ...stats.allLeads.map(lead => {
        const nameAnswer = lead.answers.find(a => 
          a.question?.prompt?.toLowerCase().includes('name') ||
          a.question?.text?.toLowerCase().includes('name')
        );
        const emailAnswer = lead.answers.find(a => 
          a.question?.prompt?.toLowerCase().includes('email') ||
          a.question?.text?.toLowerCase().includes('email')
        );
        
        return [
          lead.id,
          nameAnswer?.value || "N/A",
          emailAnswer?.value || "N/A",
          new Date(lead.createdAt).toLocaleDateString(),
          lead.status === "completed" ? "Completed" : "Partial",
          lead.completedAt ? new Date(lead.completedAt).toLocaleString() : "N/A",
          lead.result?.archetype || "N/A"
        ];
      })
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "brightnest-leads.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    logout();
  };

  const resetData = async (resetType: string) => {
    const messages = {
      quiz: "Are you sure you want to delete ALL quiz data (sessions, answers, results)? This action cannot be undone.",
      affiliate: "Are you sure you want to delete ALL affiliate data (clicks, conversions, payouts)? This action cannot be undone.",
      closer: "Are you sure you want to delete ALL closer data (appointments, performance)? This action cannot be undone.",
      all: "Are you sure you want to delete ALL data from the entire system? This will reset everything including quiz, affiliate, and closer data. This action cannot be undone."
    };

    if (!confirm(messages[resetType as keyof typeof messages])) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/basic-stats?type=${resetType}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        alert(`${data.message}`);
        fetchStats(); // Refresh the dashboard
      } else {
        alert("Failed to reset data. Please try again.");
      }
    } catch (error) {
      console.error("Error resetting data:", error);
      alert("Failed to reset data. Please try again.");
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  // Chart data for retention rates (showing downward trend)
  const retentionChartData = stats ? {
    labels: stats.questionAnalytics.map(q => `Q${q.questionNumber}`),
    datasets: [
      {
        label: 'Retention Rate (%)',
        data: stats.questionAnalytics.map((q, index) => {
          // Q1 should always be 100% (all users start the quiz)
          if (index === 0) return 100;
          // For other questions, cap at 100% and ensure it's not higher than previous
          const cappedRate = Math.min(q.retentionRate, 100);
          const previousRate = index > 0 ? Math.min(stats.questionAnalytics[index - 1].retentionRate, 100) : 100;
          return Math.min(cappedRate, previousRate); // Never exceed previous question's rate
        }),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.2, // Reduced tension to prevent overshoot
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  } : null;

  // Chart data for activity based on timeframe
  const getActivityChartData = () => {
    if (!stats) return null;

    const formatLabel = (dateStr: string, dateRange: string) => {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      switch (dateRange) {
        case '1d':
          return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        case '7d':
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        case '30d':
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        case '90d':
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        case '1y':
          return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        case 'custom':
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        default:
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    };

    return {
      labels: stats.dailyActivity.map(day => formatLabel(day.createdAt, dateRange)),
      datasets: [
        {
          label: 'Sessions',
          data: stats.dailyActivity.map(day => day._count.id),
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0, // No curvature - straight segmented lines
        },
      ],
    };
  };

  const dailyActivityData = getActivityChartData();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Fixed */}
      <div className="w-64 bg-white border-r border-gray-200 shadow-sm fixed h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">BrightNest</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>

          <nav className="space-y-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Analytics
            </div>
            <button 
              onClick={() => {
                setShowMainDashboard(true);
                setShowCEOAnalytics(false);
                setShowCloserManagement(false);
                setShowSettings(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group ${
                showMainDashboard 
                  ? 'text-blue-700 bg-blue-50 border-r-2 border-blue-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className={`w-5 h-5 group-hover:text-gray-600 ${showMainDashboard ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium">Dashboard</span>
            </button>
            <button
              onClick={() => window.open('/admin/quiz-management', '_self')}
              className="w-full flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-sm font-medium">Quiz Management</span>
            </button>
            <button
              onClick={() => {
                setShowCEOAnalytics(true);
                setShowMainDashboard(false);
                setShowCloserManagement(false);
                setShowSettings(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group ${
                showCEOAnalytics 
                  ? 'text-blue-700 bg-blue-50 border-r-2 border-blue-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className={`w-5 h-5 group-hover:text-gray-600 ${showCEOAnalytics ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="text-sm font-medium">Affiliate Analytics</span>
            </button>
          </nav>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Management
            </div>
            <button
              onClick={() => {
                setShowCloserManagement(true);
                setShowMainDashboard(false);
                setShowCEOAnalytics(false);
                setShowPipeline(false);
                setShowSettings(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group ${
                showCloserManagement 
                  ? 'text-blue-700 bg-blue-50 border-r-2 border-blue-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className={`w-5 h-5 group-hover:text-gray-600 ${showCloserManagement ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm font-medium">Closer Management</span>
            </button>
            <button
              onClick={() => {
                setShowPipeline(true);
                setShowMainDashboard(false);
                setShowCEOAnalytics(false);
                setShowCloserManagement(false);
                setShowSettings(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group ${
                showPipeline 
                  ? 'text-blue-700 bg-blue-50 border-r-2 border-blue-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className={`w-5 h-5 group-hover:text-gray-600 ${showPipeline ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span className="text-sm font-medium">Pipeline Management</span>
            </button>
            <button
              onClick={() => {
                setShowSettings(true);
                setShowMainDashboard(false);
                setShowCEOAnalytics(false);
                setShowCloserManagement(false);
                setShowPipeline(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group ${
                showSettings 
                  ? 'text-blue-700 bg-blue-50 border-r-2 border-blue-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className={`w-5 h-5 group-hover:text-gray-600 ${showSettings ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">Settings</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="px-3">
              <button
                onClick={() => setShowQuickLinks(!showQuickLinks)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Quick Links
                </div>
                <svg 
                  className={`w-4 h-4 text-gray-400 transition-transform ${showQuickLinks ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showQuickLinks && (
                <div className="mt-2 space-y-1">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-600 px-3 py-1">Login Pages</div>
                    <a
                      href="/affiliates/login"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Affiliate Login
                    </a>
                    <a
                      href="/closers/login"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Closer Login
                    </a>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-600 px-3 py-1">Signup Pages</div>
                    <a
                      href="/affiliates/signup"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Affiliate Signup
                    </a>
                    <a
                      href="/closers/signup"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Closer Signup
                    </a>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-600 px-3 py-1">Public Pages</div>
                    <a
                      href="/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Homepage
                    </a>
                    <a
                      href="/book-call"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Book Call
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Filters
            </div>
            
            <div className="space-y-4 px-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Quiz Type</label>
                <select
                  value={selectedQuizType}
                  onChange={(e) => setSelectedQuizType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Quizzes</option>
                  {stats?.quizTypes?.map((quizType: {name: string, displayName: string, description: string, questionCount: number}) => (
                    <option key={quizType.name} value={quizType.name}>
                      {quizType.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Period</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="1d">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="custom">Custom range</option>
                </select>
                
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Actions
            </div>
            
            <div className="space-y-2 px-3">
              <div className="relative">
                <button
                  onClick={() => setShowResetDropdown(!showResetDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-red-700 hover:bg-red-50 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-red-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="text-sm font-medium">Reset Data</span>
                  </div>
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showResetDropdown && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          resetData('quiz');
                          setShowResetDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                      >
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div>
                            <div className="font-medium">Quiz Data</div>
                            <div className="text-xs text-gray-500">Sessions, answers, results</div>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          resetData('affiliate');
                          setShowResetDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                      >
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <div>
                            <div className="font-medium">Affiliate Data</div>
                            <div className="text-xs text-gray-500">Clicks, conversions, payouts</div>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          resetData('closer');
                          setShowResetDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                      >
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <div>
                            <div className="font-medium">Closer Data</div>
                            <div className="text-xs text-gray-500">Appointments, performance</div>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          resetData('all');
                          setShowResetDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                      >
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <div>
                            <div className="font-medium">Everything</div>
                            <div className="text-xs text-red-500">Complete system reset</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 ml-64 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">BrightNest Quiz Analytics</p>
          </div>

          {/* CEO Analytics Section */}
          {showCEOAnalytics && (
            <div className="mb-8">
              <CEOAnalytics />
            </div>
          )}

          {/* Closer Management Section */}
          {showCloserManagement && (
            <div className="mb-8">
              <CloserManagement />
            </div>
          )}

          {/* Pipeline Management Section */}
          {showPipeline && (
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Pipeline Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Lead Pipeline</h2>
                      <p className="mt-1 text-sm text-gray-500">Track and manage leads through your sales pipeline</p>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          ${appointments.reduce((sum, a) => sum + (Number(a.saleValue) || 0), 0).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">Total Value</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{appointments.length}</div>
                        <div className="text-sm text-gray-500">Total Appointments</div>
                      </div>
                      <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                        + Add Lead
                      </button>
                    </div>
                  </div>
                  
                  {/* View Toggle */}
                  <div className="mt-4 flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                    <button
                      onClick={() => setPipelineView('kanban')}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        pipelineView === 'kanban'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Pipeline View
                    </button>
                    <button
                      onClick={() => setPipelineView('appointments')}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        pipelineView === 'appointments'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      All Appointments ({appointments.length})
                    </button>
                  </div>
                </div>
                
                {/* Pipeline Content */}
                {pipelineView === 'kanban' && (
                  <div className="p-6">
                    <div className="flex space-x-6 overflow-x-auto pb-6">
                      {/* New Leads Column */}
                      <div className="flex-shrink-0 w-80">
                        <div className="bg-gray-50 rounded-lg border border-gray-200">
                          <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-900">New Leads</h3>
                            <span className="text-xs text-gray-500">{appointments.filter(a => a.status === 'scheduled').length}</span>
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              ${appointments.filter(a => a.status === 'scheduled').reduce((sum, a) => sum + (Number(a.saleValue) || 0), 0).toFixed(2)}
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            {appointments.filter(a => a.status === 'scheduled').length === 0 ? (
                              <div className="text-center py-8 text-gray-500">
                                <div className="text-sm">No leads in this stage</div>
                              </div>
                            ) : (
                              appointments.filter(a => a.status === 'scheduled').map((appointment) => (
                                <div key={appointment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h4 className="text-sm font-medium text-gray-900">{appointment.customerName}</h4>
                                      <p className="text-xs text-gray-500">{appointment.customerEmail}</p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-bold text-gray-900">
                                        {appointment.saleValue ? `$${Number(appointment.saleValue).toFixed(2)}` : '$0'}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {new Date(appointment.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <span className="text-xs font-medium text-indigo-600">
                                          {appointment.customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </span>
                                      </div>
                                      <span className="text-xs text-gray-600">{appointment.customerPhone}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                      <span className="text-xs text-gray-500">
                                        {new Date(appointment.scheduledAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  </div>
                                  {appointment.notes && (
                                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
                                      {appointment.notes}
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Booked Call Column */}
                      <div className="flex-shrink-0 w-80">
                        <div className="bg-gray-50 rounded-lg border border-gray-200">
                          <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-medium text-gray-900">Booked Call</h3>
                              <span className="text-xs text-gray-500">{appointments.filter(a => a.status === 'completed' && !a.outcome).length}</span>
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              ${appointments.filter(a => a.status === 'completed' && !a.outcome).reduce((sum, a) => sum + (Number(a.saleValue) || 0), 0).toFixed(2)}
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            {appointments.filter(a => a.status === 'completed' && !a.outcome).length === 0 ? (
                              <div className="text-center py-8 text-gray-500">
                                <div className="text-sm">No leads in this stage</div>
                              </div>
                            ) : (
                              appointments.filter(a => a.status === 'completed' && !a.outcome).map((appointment) => (
                                <div key={appointment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h4 className="text-sm font-medium text-gray-900">{appointment.customerName}</h4>
                                      <p className="text-xs text-gray-500">{appointment.customerEmail}</p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-bold text-gray-900">
                                        {appointment.saleValue ? `$${Number(appointment.saleValue).toFixed(2)}` : '$0'}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {new Date(appointment.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                                        <span className="text-xs font-medium text-green-600">
                                          {appointment.customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </span>
                                      </div>
                                      <span className="text-xs text-gray-600">{appointment.customerPhone}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                      <span className="text-xs text-gray-500">
                                        {new Date(appointment.scheduledAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  </div>
                                  {appointment.notes && (
                                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
                                      {appointment.notes}
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Follow Up Column */}
                      <div className="flex-shrink-0 w-80">
                        <div className="bg-gray-50 rounded-lg border border-gray-200">
                          <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-medium text-gray-900">Follow Up</h3>
                              <span className="text-xs text-gray-500">{appointments.filter(a => a.outcome === 'needs_follow_up').length}</span>
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              ${appointments.filter(a => a.outcome === 'needs_follow_up').reduce((sum, a) => sum + (Number(a.saleValue) || 0), 0).toFixed(2)}
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            {appointments.filter(a => a.outcome === 'needs_follow_up').length === 0 ? (
                              <div className="text-center py-8 text-gray-500">
                                <div className="text-sm">No leads in this stage</div>
                              </div>
                            ) : (
                              appointments.filter(a => a.outcome === 'needs_follow_up').map((appointment) => (
                                <div key={appointment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h4 className="text-sm font-medium text-gray-900">{appointment.customerName}</h4>
                                      <p className="text-xs text-gray-500">{appointment.customerEmail}</p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-bold text-gray-900">
                                        {appointment.saleValue ? `$${Number(appointment.saleValue).toFixed(2)}` : '$0'}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {new Date(appointment.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center">
                                        <span className="text-xs font-medium text-yellow-600">
                                          {appointment.customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </span>
                                      </div>
                                      <span className="text-xs text-gray-600">{appointment.customerPhone}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                      <span className="text-xs text-gray-500">
                                        {new Date(appointment.scheduledAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  </div>
                                  {appointment.notes && (
                                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
                                      {appointment.notes}
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Callback Requested Column */}
                      <div className="flex-shrink-0 w-80">
                        <div className="bg-gray-50 rounded-lg border border-gray-200">
                          <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-medium text-gray-900">Callback Requested</h3>
                              <span className="text-xs text-gray-500">{appointments.filter(a => a.outcome === 'callback_requested').length}</span>
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              ${appointments.filter(a => a.outcome === 'callback_requested').reduce((sum, a) => sum + (Number(a.saleValue) || 0), 0).toFixed(2)}
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            {appointments.filter(a => a.outcome === 'callback_requested').length === 0 ? (
                              <div className="text-center py-8 text-gray-500">
                                <div className="text-sm">No leads in this stage</div>
                              </div>
                            ) : (
                              appointments.filter(a => a.outcome === 'callback_requested').map((appointment) => (
                                <div key={appointment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h4 className="text-sm font-medium text-gray-900">{appointment.customerName}</h4>
                                      <p className="text-xs text-gray-500">{appointment.customerEmail}</p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-bold text-gray-900">
                                        {appointment.saleValue ? `$${Number(appointment.saleValue).toFixed(2)}` : '$0'}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {new Date(appointment.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center">
                                        <span className="text-xs font-medium text-purple-600">
                                          {appointment.customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </span>
                                      </div>
                                      <span className="text-xs text-gray-600">{appointment.customerPhone}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                      <span className="text-xs text-gray-500">
                                        {new Date(appointment.scheduledAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  </div>
                                  {appointment.notes && (
                                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
                                      {appointment.notes}
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Converted Column */}
                      <div className="flex-shrink-0 w-80">
                        <div className="bg-gray-50 rounded-lg border border-gray-200">
                          <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-medium text-gray-900">Converted</h3>
                              <span className="text-xs text-gray-500">{appointments.filter(a => a.outcome === 'converted').length}</span>
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              ${appointments.filter(a => a.outcome === 'converted').reduce((sum, a) => sum + (Number(a.saleValue) || 0), 0).toFixed(2)}
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            {appointments.filter(a => a.outcome === 'converted').length === 0 ? (
                              <div className="text-center py-8 text-gray-500">
                                <div className="text-sm">No leads in this stage</div>
                              </div>
                            ) : (
                              appointments.filter(a => a.outcome === 'converted').map((appointment) => (
                                <div key={appointment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h4 className="text-sm font-medium text-gray-900">{appointment.customerName}</h4>
                                      <p className="text-xs text-gray-500">{appointment.customerEmail}</p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-bold text-gray-900">
                                        {appointment.saleValue ? `$${Number(appointment.saleValue).toFixed(2)}` : '$0'}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {new Date(appointment.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <span className="text-xs font-medium text-emerald-600">
                                          {appointment.customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </span>
                                      </div>
                                      <span className="text-xs text-gray-600">{appointment.customerPhone}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                      <span className="text-xs text-gray-500">
                                        {new Date(appointment.scheduledAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  </div>
                                  {appointment.notes && (
                                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
                                      {appointment.notes}
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Not Interested Column */}
                      <div className="flex-shrink-0 w-80">
                        <div className="bg-gray-50 rounded-lg border border-gray-200">
                          <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-medium text-gray-900">Not Interested</h3>
                              <span className="text-xs text-gray-500">{appointments.filter(a => a.outcome === 'not_interested').length}</span>
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              ${appointments.filter(a => a.outcome === 'not_interested').reduce((sum, a) => sum + (Number(a.saleValue) || 0), 0).toFixed(2)}
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            {appointments.filter(a => a.outcome === 'not_interested').length === 0 ? (
                              <div className="text-center py-8 text-gray-500">
                                <div className="text-sm">No leads in this stage</div>
                              </div>
                            ) : (
                              appointments.filter(a => a.outcome === 'not_interested').map((appointment) => (
                                <div key={appointment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h4 className="text-sm font-medium text-gray-900">{appointment.customerName}</h4>
                                      <p className="text-xs text-gray-500">{appointment.customerEmail}</p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-bold text-gray-900">
                                        {appointment.saleValue ? `$${Number(appointment.saleValue).toFixed(2)}` : '$0'}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {new Date(appointment.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                                        <span className="text-xs font-medium text-red-600">
                                          {appointment.customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </span>
                                      </div>
                                      <span className="text-xs text-gray-600">{appointment.customerPhone}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                      <span className="text-xs text-gray-500">
                                        {new Date(appointment.scheduledAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  </div>
                                  {appointment.notes && (
                                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
                                      {appointment.notes}
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Rescheduled Column */}
                      <div className="flex-shrink-0 w-80">
                        <div className="bg-gray-50 rounded-lg border border-gray-200">
                          <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-medium text-gray-900">Rescheduled</h3>
                              <span className="text-xs text-gray-500">{appointments.filter(a => a.outcome === 'rescheduled').length}</span>
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              ${appointments.filter(a => a.outcome === 'rescheduled').reduce((sum, a) => sum + (Number(a.saleValue) || 0), 0).toFixed(2)}
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            {appointments.filter(a => a.outcome === 'rescheduled').length === 0 ? (
                              <div className="text-center py-8 text-gray-500">
                                <div className="text-sm">No leads in this stage</div>
                              </div>
                            ) : (
                              appointments.filter(a => a.outcome === 'rescheduled').map((appointment) => (
                                <div key={appointment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h4 className="text-sm font-medium text-gray-900">{appointment.customerName}</h4>
                                      <p className="text-xs text-gray-500">{appointment.customerEmail}</p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-bold text-gray-900">
                                        {appointment.saleValue ? `$${Number(appointment.saleValue).toFixed(2)}` : '$0'}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {new Date(appointment.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                                        <span className="text-xs font-medium text-gray-600">
                                          {appointment.customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </span>
                                      </div>
                                      <span className="text-xs text-gray-600">{appointment.customerPhone}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                      <span className="text-xs text-gray-500">
                                        {new Date(appointment.scheduledAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  </div>
                                  {appointment.notes && (
                                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
                                      {appointment.notes}
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Appointments Table View */}
                {pipelineView === 'appointments' && (
                  <div className="p-6">
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                      <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">All Appointments</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">View and manage all scheduled appointments</p>
                      </div>
                      <div className="border-t border-gray-200">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Scheduled
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Assigned Closer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Outcome
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Sale Value
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Notes
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Recording
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {appointments.map((appointment) => (
                                <tr key={appointment.id}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">{appointment.customerName}</div>
                                      <div className="text-sm text-gray-500">{appointment.customerEmail}</div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatDate(appointment.scheduledAt)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {appointment.closer ? appointment.closer.name : 'Unassigned'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                                      {appointment.status.replace('_', ' ')}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {appointment.outcome ? (
                                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOutcomeColor(appointment.outcome)}`}>
                                        {appointment.outcome.replace('_', ' ')}
                                      </span>
                                    ) : (
                                      <span className="text-sm text-gray-500">Not set</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {appointment.saleValue ? `$${Number(appointment.saleValue).toFixed(2)}` : '-'}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                    {appointment.notes ? (
                                      <div className="truncate" title={appointment.notes}>
                                        {appointment.notes}
                                      </div>
                                    ) : (
                                      <span className="text-gray-500">-</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {getRecordingLink(appointment) ? (
                                      <a
                                        href={getRecordingLink(appointment)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:text-indigo-900 underline"
                                      >
                                        View Recording
                                      </a>
                                    ) : (
                                      <span className="text-gray-500">-</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Section */}
          {showSettings && (
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Quiz Settings</h2>
                
                <div className="space-y-6">
                  {/* Qualification Threshold */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Qualification Threshold</h3>
                    <p className="text-gray-600 mb-4">
                      Set the minimum points required for users to qualify for a consultation call. 
                      Users below this threshold will be directed to the checkout page instead.
                    </p>
                    
                    <div className="flex items-center space-x-4">
                      <label htmlFor="threshold" className="text-sm font-medium text-gray-700">
                        Minimum Points:
                      </label>
                      <input
                        type="number"
                        id="threshold"
                        min="1"
                        max="20"
                        value={qualificationThreshold}
                        onChange={(e) => setQualificationThreshold(parseInt(e.target.value))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-sm text-gray-500">out of 20</span>
                    </div>
                    
                    <div className="mt-4">
                      <button 
                        onClick={() => updateQualificationThreshold(qualificationThreshold)}
                        disabled={isUpdatingThreshold}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdatingThreshold ? 'Updating...' : 'Update Threshold'}
                      </button>
                    </div>
                  </div>

                  {/* Current Settings Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Current Settings</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• Qualification Threshold: <span className="font-medium">{qualificationThreshold} points</span></p>
                      <p>• Users with {qualificationThreshold}+ points → Book consultation call</p>
                      <p>• Users with &lt;{qualificationThreshold} points → Checkout page</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Dashboard Content */}
          {showMainDashboard && (
            <>
              {/* Stats Cards */}
              {isLoading && !hasInitiallyLoaded.current ? (
            <div className="text-center py-8 opacity-50 transition-opacity duration-300">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading stats...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => fetchStats()}
                className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-700">Visitors</h3>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">
                        {stats.visitors}
                      </p>
                      <p className="text-xs text-gray-500">Total quiz starters</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-700">Partial Submissions</h3>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">
                        {stats.partialSubmissions}
                      </p>
                      <p className="text-xs text-gray-500">Started but didn&apos;t complete</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-700">Average Time</h3>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">
                        {stats.averageTimeMs > 0 ? formatDuration(stats.averageTimeMs) : '0s'}
                      </p>
                      <p className="text-xs text-gray-500">Time to complete quiz</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-700">Leads Collected</h3>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">
                        {stats.leadsCollected}
                      </p>
                      <p className="text-xs text-gray-500">Completed the full quiz</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          stats.completionRate >= 70 ? 'bg-green-50' : 
                          stats.completionRate >= 40 ? 'bg-yellow-50' : 'bg-red-50'
                        }`}>
                          <svg className={`w-5 h-5 ${
                            stats.completionRate >= 70 ? 'text-green-600' : 
                            stats.completionRate >= 40 ? 'text-yellow-600' : 'text-red-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-700">Completion Rate</h3>
                      </div>
                      <p className={`text-3xl font-bold mb-1 ${
                        stats.completionRate >= 70 ? 'text-green-600' : 
                        stats.completionRate >= 40 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {stats.completionRate}%
                      </p>
                      <p className="text-xs text-gray-500">Quiz completion rate</p>
                    </div>
                  </div>
                </div>
              </div>


          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Quiz Retention Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Quiz Retention Rate
                  </h3>
                  {retentionChartData && (
                    <div className="h-80">
                      <Line 
                        data={retentionChartData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          interaction: {
                            intersect: false,
                            mode: 'index',
                          },
                          plugins: {
                            legend: {
                              display: false,
                            },
                            tooltip: {
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              titleColor: 'white',
                              bodyColor: 'white',
                              borderColor: 'rgba(59, 130, 246, 1)',
                              borderWidth: 1,
                              cornerRadius: 8,
                              callbacks: {
                                label: function(context) {
                                  const questionNum = context.dataIndex + 1;
                                  const retention = Math.min(context.parsed.y, 100).toFixed(1); // Cap at 100%
                                  const dropOff = Math.max(100 - context.parsed.y, 0).toFixed(1); // Ensure non-negative
                                  return [
                                    `Q${questionNum}: ${retention}% retention`,
                                    `${dropOff}% dropped off`
                                  ];
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 110, // Add 10% buffer above 100% line
                              min: 0, // Start at 0%
                              grid: {
                                color: 'rgba(0, 0, 0, 0.1)',
                              },
                              ticks: {
                                callback: function(value: string | number) {
                                  // Don't show labels above 100%
                                  if (typeof value === 'number' && value > 100) return '';
                                  return value + '%';
                                },
                                color: 'rgba(0, 0, 0, 0.7)',
                                stepSize: 10, // Show every 10%
                              },
                              title: {
                                display: true,
                                text: 'Users Still in Quiz',
                                color: 'rgba(0, 0, 0, 0.7)',
                                font: {
                                  size: 12,
                                  weight: 'bold'
                                }
                              }
                            },
                            x: {
                              grid: {
                                display: false,
                              },
                              ticks: {
                                color: 'rgba(0, 0, 0, 0.7)',
                              },
                              title: {
                                display: true,
                                text: 'Question Number',
                                color: 'rgba(0, 0, 0, 0.7)',
                                font: {
                                  size: 12,
                                  weight: 'bold'
                                }
                              }
                            }
                          },
                          elements: {
                            line: {
                              borderWidth: 3,
                              tension: 0, // No curvature - straight segmented lines
                            },
                            point: {
                              radius: 6,
                              hoverRadius: 8,
                              borderWidth: 2,
                              borderColor: '#fff',
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

            {/* Activity Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Activity
                    </h3>
                  </div>
                  {dailyActivityData && (
                    <div className="h-80">
                      <Line 
                        data={dailyActivityData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          interaction: {
                            intersect: false,
                            mode: 'index',
                          },
                          plugins: {
                            legend: {
                              display: false,
                            },
                            tooltip: {
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              titleColor: 'white',
                              bodyColor: 'white',
                              borderColor: 'rgba(59, 130, 246, 1)',
                              borderWidth: 1,
                              cornerRadius: 8,
                              callbacks: {
                                label: function(context) {
                                  return `${context.parsed.y} sessions`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: {
                                color: 'rgba(0, 0, 0, 0.1)',
                              },
                              ticks: {
                                stepSize: 1,
                                color: 'rgba(0, 0, 0, 0.7)',
                              },
                              title: {
                                display: true,
                                text: 'Number of Sessions',
                                color: 'rgba(0, 0, 0, 0.7)',
                                font: {
                                  size: 12,
                                  weight: 'bold'
                                }
                              }
                            },
                            x: {
                              grid: {
                                display: false,
                              },
                              ticks: {
                                color: 'rgba(0, 0, 0, 0.7)',
                              },
                              title: {
                                display: true,
                                text: 'Date',
                                color: 'rgba(0, 0, 0, 0.7)',
                                font: {
                                  size: 12,
                                  weight: 'bold'
                                }
                              }
                            }
                          },
                          elements: {
                            line: {
                              borderWidth: 3,
                              tension: 0, // No curvature - straight segmented lines
                            },
                            point: {
                              radius: 6,
                              hoverRadius: 8,
                              borderWidth: 2,
                              borderColor: '#fff',
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

          {/* Top Funnel Drop-offs */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg ${
                  stats.topDropOffQuestions.length > 0 
                    ? 'bg-gradient-to-br from-red-500 to-red-600' 
                    : 'bg-gradient-to-br from-green-500 to-green-600'
                }`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {stats.topDropOffQuestions.length > 0 ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Top Funnel Drop-offs</h3>
                  <p className="text-xs text-gray-500">
                    {stats.topDropOffQuestions.length > 0 
                      ? 'Questions causing the highest user abandonment' 
                      : 'No significant drop-offs detected'
                    }
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xl font-bold ${
                  stats.topDropOffQuestions.length > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {stats.topDropOffQuestions.length}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  {stats.topDropOffQuestions.length > 0 ? 'Critical Issues' : 'Issues Found'}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {stats.topDropOffQuestions.length > 0 ? (
                stats.topDropOffQuestions.map((question, index) => (
                  <div key={question.questionNumber} className="group relative overflow-hidden bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-200 hover:border-red-200 transition-all duration-300 hover:shadow-md">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                              <span className="text-xs font-bold text-white">#{index + 1}</span>
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Q{question.questionNumber}
                              </span>
                              <span className="text-xs text-gray-500 font-medium">
                                {question.retentionRate.toFixed(1)}% retention
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-1 leading-tight truncate">
                              {question.questionText}
                            </h4>
                            <div className="flex items-center space-x-3 text-xs text-gray-600">
                              <div className="flex items-center space-x-1">
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Previous: {question.previousRetentionRate.toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                            <div className="text-lg font-bold text-red-600 mb-1">
                              {question.dropFromPrevious.toFixed(1)}%
                            </div>
                            <div className="text-xs text-red-500 font-medium uppercase tracking-wide">
                              Drop-off
                            </div>
                            <div className="mt-1 w-12 h-1 bg-red-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(question.dropFromPrevious, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Excellent Retention!</h4>
                  <p className="text-gray-600 max-w-sm mx-auto text-sm leading-relaxed">
                    No significant drop-offs detected. Users are completing the quiz successfully.
                  </p>
                  <div className="mt-4 inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                    <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Quiz Flow Optimized
                  </div>
                </div>
              )}
            </div>
          </div>

              {/* Archetype Distribution */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Archetype Distribution
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.archetypeStats.map((stat) => (
                    <div key={stat.archetype} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {stat._count.archetype}
                      </div>
                      <div className="text-sm text-gray-600">
                        {stat.archetype}
                      </div>
                    </div>
                  ))}
                </div>
              </div>


              {/* Lead List */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Lead List
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push('/admin/leads')}
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>CRM View</span>
                    </button>
                    <button
                      onClick={exportLeads}
                      className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Export Leads</span>
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Session ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Completed At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Source
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.allLeads.map((lead) => {
                        const nameAnswer = lead.answers.find(a => 
                          a.question?.prompt?.toLowerCase().includes('name') ||
                          a.question?.text?.toLowerCase().includes('name')
                        );
                        const emailAnswer = lead.answers.find(a => 
                          a.question?.prompt?.toLowerCase().includes('email') ||
                          a.question?.text?.toLowerCase().includes('email')
                        );
                        
                        return (
                          <tr key={lead.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                              {lead.id.slice(0, 8)}...
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {nameAnswer?.value || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {emailAnswer?.value || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(lead.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                lead.status === "completed" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-orange-100 text-orange-800"
                              }`}>
                                {lead.status === "completed" ? "Completed" : "Partial"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {lead.completedAt ? new Date(lead.completedAt).toLocaleString() : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                lead.source?.includes('Affiliate') 
                                  ? "bg-blue-100 text-blue-800" 
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                                {lead.source || 'Website'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
