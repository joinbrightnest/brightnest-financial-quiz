"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
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
import ArticleTestingPanel from '@/components/ArticleTestingPanel';

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
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitiallyLoaded = useRef(false);
  const [dateRange, setDateRange] = useState('7d');
  const [activityTimeframe, setActivityTimeframe] = useState('daily');
  const [selectedQuizType, setSelectedQuizType] = useState<string>('all');
  // const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [showComparison, setShowComparison] = useState(false);

  const fetchStats = useCallback(async (isTimeframeChange = false) => {
    // Only show loading state on initial load, not on window switches or timeframe changes
    if (!isTimeframeChange && !hasInitiallyLoaded.current) {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const quizTypeParam = selectedQuizType === 'all' ? '' : `&quizType=${selectedQuizType}`;
      const response = await fetch(`/api/admin/basic-stats?activity=${activityTimeframe}${quizTypeParam}`, {
        headers: {
          "x-admin-code": "brightnest2025"
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
  }, [activityTimeframe, selectedQuizType]);

  useEffect(() => {
    fetchStats(true); // Pass true to indicate this is a timeframe change
  }, [fetchStats]);

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
        const nameAnswer = lead.answers.find(a => a.question.type === "text");
        const emailAnswer = lead.answers.find(a => a.question.type === "email");
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

  const logout = () => {
    localStorage.removeItem("admin_authenticated");
    router.push("/admin");
  };

  const resetAllData = async () => {
    if (!confirm("Are you sure you want to delete ALL quiz data? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch("/api/admin/basic-stats", {
        method: "DELETE",
      });

      if (response.ok) {
        alert("All data has been reset successfully!");
        fetchStats(); // Refresh the dashboard
      } else {
        alert("Failed to reset data. Please try again.");
      }
    } catch (error) {
      console.error("Error resetting data:", error);
      alert("Failed to reset data. Please try again.");
    }
  };

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

    const formatLabel = (dateStr: string, timeframe: string) => {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      switch (timeframe) {
        case 'hourly':
          return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        case 'daily':
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        case 'weekly':
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        case 'monthly':
          return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        default:
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    };

    return {
      labels: stats.dailyActivity.map(day => formatLabel(day.createdAt, activityTimeframe)),
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
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">BrightNest Quiz Analytics</p>
            </div>
            
            {/* Filters and Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Quiz Type Filter */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Quiz Type:</label>
                <select
                  value={selectedQuizType}
                  onChange={(e) => setSelectedQuizType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Quizzes</option>
                  {stats?.quizTypes?.map((quizType: {name: string, displayName: string, description: string, questionCount: number}) => (
                    <option key={quizType.name} value={quizType.name}>
                      {quizType.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Period:</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="custom">Custom range</option>
                </select>
              </div>


              {/* Comparison Toggle */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Compare:</label>
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    showComparison 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  {showComparison ? 'Hide' : 'Show'} Previous Period
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.open('/admin/quiz-management', '_self')}
                  className="bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 text-sm shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Quiz Management</span>
                </button>
                <button
                  onClick={resetAllData}
                  className="bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 text-sm shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Reset All</span>
                </button>
                <button
                  onClick={logout}
                  className="bg-gray-600 text-white py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors text-sm shadow-sm hover:shadow-md"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

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
                      {showComparison && (
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                            ▲ +12%
                          </span>
                        </div>
                      )}
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
                      {showComparison && (
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full font-medium">
                            ▼ +8%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-700">Completed Submissions</h3>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">
                        {stats.completedSessions}
                      </p>
                      <p className="text-xs text-gray-500">Finished the full quiz</p>
                      {showComparison && (
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                            ▲ +5%
                          </span>
                        </div>
                      )}
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
                      <p className="text-xs text-gray-500">Name & email provided</p>
                      {showComparison && (
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                            ▲ +15%
                          </span>
                        </div>
                      )}
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
                      {showComparison && (
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full font-medium">
                            ▼ -8%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quiz Management Section */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Quiz Management
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats?.quizTypes?.map((quizType: {name: string, displayName: string, description: string, questionCount: number}, index: number) => (
                    <div key={quizType.name} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{quizType.displayName}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          index === 0 ? 'bg-blue-100 text-blue-800' :
                          index === 1 ? 'bg-green-100 text-green-800' :
                          'bg-pink-100 text-pink-800'
                        }`}>
                          {quizType.questionCount} questions
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{quizType.description}</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(`/admin/quiz-editor/${quizType.name}`, '_self')}
                          className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          Customize
                        </button>
                        <button
                          onClick={() => window.open(`/quiz/${quizType.name}`, '_blank')}
                          className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          Preview
                        </button>
                      </div>
                    </div>
                  )) || (
                    // Fallback to static quiz types if API fails
                    <>
                      <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Financial Profile</h4>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">10 questions</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">General financial personality assessment</p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open('/admin/quiz-editor/financial-profile', '_self')}
                            className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
                          >
                            Customize
                          </button>
                          <button
                            onClick={() => window.open('/quiz/financial-profile', '_blank')}
                            className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                          >
                            Preview
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Quiz Retention Chart */}
                <div className="bg-white rounded-lg shadow-lg p-6">
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
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Activity
                    </h3>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Timeframe:</label>
                      <select
                        value={activityTimeframe}
                        onChange={(e) => setActivityTimeframe(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="hourly">Last 24 Hours</option>
                        <option value="daily">Last 7 Days</option>
                        <option value="weekly">Last 30 Days</option>
                        <option value="monthly">Last 12 Months</option>
                      </select>
                    </div>
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

              {/* Top Drop-off Questions */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                  Top Funnel Drop-offs
                </h3>
                <div className="space-y-3">
                  {stats.topDropOffQuestions.map((question, index) => (
                    <div key={question.questionNumber} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-red-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Q{question.questionNumber}</p>
                          <p className="text-sm text-gray-600 truncate max-w-md">{question.questionText}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">{question.dropFromPrevious}%</p>
                        <p className="text-xs text-gray-500">drop-off</p>
                      </div>
                    </div>
                  ))}
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

              {/* Article Testing Panel */}
              <div className="mb-6">
                <ArticleTestingPanel />
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
                          Archetype
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.allLeads.map((lead) => {
                        const nameAnswer = lead.answers.find(a => a.question.type === "text");
                        const emailAnswer = lead.answers.find(a => a.question.type === "email");
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
                              {lead.result?.archetype || "N/A"}
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
        </div>
      </div>
    </div>
  );
}
