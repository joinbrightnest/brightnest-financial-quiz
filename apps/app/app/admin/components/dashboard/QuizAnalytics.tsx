"use client";

import React from 'react';
import { Line } from 'react-chartjs-2';
import { AdminStats, QuizAnalyticsFilters } from '../../types';
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

// Register ChartJS components locally to ensure they work if not registered globally
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

interface QuizAnalyticsProps {
    filters: QuizAnalyticsFilters;
    onFilterChange: (filters: QuizAnalyticsFilters) => void;
    stats: AdminStats | null;
    loading: boolean;
    error: string | null;
    onRetry: () => void;
    affiliates: Array<{ id: string; name: string; referralCode: string }>;
    retentionChartData: any;
    dailyActivityData: any;
    clicksActivityData: any;
    hasInitiallyLoaded: boolean;
    onRefreshData?: () => void; // Optional refresh function to bypass cache
}

export default function QuizAnalytics({
    filters,
    onFilterChange,
    stats,
    loading,
    error,
    onRetry,
    affiliates,
    retentionChartData,
    dailyActivityData,
    clicksActivityData,
    hasInitiallyLoaded,
    onRefreshData
}: QuizAnalyticsProps) {

    const formatDuration = (ms: number): string => {
        if (ms < 1000) return `${ms}ms`;
        const seconds = Math.floor(ms / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    return (
        <>
            {/* Quiz Analytics Header with Icon and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Quiz Analytics</h2>
                                <p className="text-gray-600 font-medium">Comprehensive quiz performance and engagement metrics</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Quiz Type Filter */}
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Quiz Type:</label>
                            <select
                                value={filters.quizType}
                                onChange={(e) => onFilterChange({ ...filters, quizType: e.target.value })}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Types</option>
                                {stats?.quizTypes && stats.quizTypes.length > 0 ? (
                                    stats.quizTypes.map((quizType) => (
                                        <option key={quizType.name} value={quizType.name}>
                                            {quizType.displayName}
                                        </option>
                                    ))
                                ) : (
                                    <>
                                        <option value="financial-profile">Financial Profile</option>
                                        <option value="health-finance">Health Finance</option>
                                        <option value="marriage-finance">Marriage Finance</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Duration Filter */}
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Duration:</label>
                            <select
                                value={filters.duration}
                                onChange={(e) => onFilterChange({ ...filters, duration: e.target.value })}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Time</option>
                                <option value="24h">Last 24 hours</option>
                                <option value="7d">Last 7 days</option>
                                <option value="30d">Last 30 days</option>
                                <option value="90d">Last 90 days</option>
                                <option value="1y">Last year</option>
                            </select>
                        </div>

                        {/* Affiliate Filter */}
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Affiliate:</label>
                            <select
                                value={filters.affiliateCode}
                                onChange={(e) => onFilterChange({ ...filters, affiliateCode: e.target.value })}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Affiliates</option>
                                {affiliates.map(affiliate => (
                                    <option key={affiliate.id} value={affiliate.referralCode}>
                                        {affiliate.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Refresh Button - Bypass Cache */}
                        {onRefreshData && (
                            <button
                                onClick={onRefreshData}
                                disabled={loading}
                                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Refresh data (bypasses cache for real-time stats)"
                            >
                                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span className="text-sm font-medium">Refresh</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            {loading && !hasInitiallyLoaded ? (
                <div className="text-center py-8 opacity-50 transition-opacity duration-300">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Loading stats...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={onRetry}
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
                                        <h3 className="text-sm font-semibold text-gray-700">Clicks</h3>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900 mb-1">
                                        {stats.clicks}
                                    </p>
                                    <p className="text-xs text-gray-500">Total clicks</p>
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
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stats.completionRate >= 70 ? 'bg-green-50' :
                                            stats.completionRate >= 40 ? 'bg-yellow-50' : 'bg-red-50'
                                            }`}>
                                            <svg className={`w-5 h-5 ${stats.completionRate >= 70 ? 'text-green-600' :
                                                stats.completionRate >= 40 ? 'text-yellow-600' : 'text-red-600'
                                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                        </div>
                                        <h3 className="text-sm font-semibold text-gray-700">Completion Rate</h3>
                                    </div>
                                    <p className={`text-3xl font-bold mb-1 ${stats.completionRate >= 70 ? 'text-green-600' :
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
                            {retentionChartData && stats && stats.questionAnalytics.length > 0 ? (
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
                                                        title: function (context) {
                                                            if (stats && stats.questionAnalytics[context[0].dataIndex]) {
                                                                return `Question ${stats.questionAnalytics[context[0].dataIndex].questionNumber}`;
                                                            }
                                                            return `Question ${context[0].dataIndex + 1}`;
                                                        },
                                                        label: function (context) {
                                                            const questionNum = stats && stats.questionAnalytics[context.dataIndex]
                                                                ? stats.questionAnalytics[context.dataIndex].questionNumber
                                                                : context.dataIndex + 1;
                                                            const retention = Math.min(context.parsed.y ?? 0, 100).toFixed(1); // Cap at 100%, handle null
                                                            const answeredCount = stats && stats.questionAnalytics[context.dataIndex]
                                                                ? stats.questionAnalytics[context.dataIndex].answeredCount
                                                                : 0;
                                                            const totalSessions = stats?.totalSessions || 0;
                                                            const dropOff = Math.max(100 - (context.parsed.y ?? 0), 0).toFixed(1); // Ensure non-negative, handle null
                                                            return [
                                                                `Retention: ${retention}% (${answeredCount}/${totalSessions} users)`,
                                                                `${dropOff}% dropped off before reaching this question`
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
                                                        callback: function (value: string | number) {
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
                            ) : (
                                <div className="h-80 flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <p className="text-sm font-medium">No quiz data available</p>
                                        <p className="text-xs text-gray-400 mt-1">Quiz retention data will appear here once users start taking quizzes</p>
                                    </div>
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
                                    Quiz Started
                                </h3>
                            </div>
                            {dailyActivityData && dailyActivityData.labels && dailyActivityData.labels.length > 0 ? (
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
                                                        label: function (context) {
                                                            return `${context.parsed.y} quiz started`;
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
                                                        text: 'Quiz Started',
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
                                                        text: filters.duration === '24h' ? 'Hour' : 'Date',
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
                            ) : (
                                <div className="h-80 flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <p className="text-sm font-medium">No activity data available</p>
                                        <p className="text-xs text-gray-400 mt-1">Quiz activity data will appear here once users start taking quizzes</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Clicks Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                </svg>
                                Clicks
                            </h3>
                        </div>
                        {clicksActivityData && clicksActivityData.labels && clicksActivityData.labels.length > 0 ? (
                            <div className="h-80">
                                <Line
                                    data={clicksActivityData}
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
                                                borderColor: 'rgba(16, 185, 129, 1)',
                                                borderWidth: 1,
                                                cornerRadius: 8,
                                                callbacks: {
                                                    label: function (context) {
                                                        return `${context.parsed.y} clicks`;
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
                                                    text: 'Clicks',
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
                                                    text: filters.duration === '24h' ? 'Hour' : 'Date',
                                                    color: 'rgba(0, 0, 0, 0.7)',
                                                    font: {
                                                        size: 12,
                                                        weight: 'bold'
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="h-80 flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                    </svg>
                                    <p className="text-sm font-medium">No clicks data available</p>
                                    <p className="text-xs text-gray-400 mt-1">Click data will appear here once users visit the website</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Top Funnel Drop-offs */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg ${stats.topDropOffQuestions.length > 0
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
                                            ? 'Questions that most users never reached (from quiz start)'
                                            : 'No significant drop-offs detected'
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-xl font-bold ${stats.topDropOffQuestions.length > 0 ? 'text-red-600' : 'text-green-600'
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
                                                                {(question.retentionRate || 0).toFixed(1)}% retention
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
                                                                <span>Previous: {(question.previousRetentionRate || 0).toFixed(1)}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right ml-4 flex-shrink-0">
                                                    <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                                                        <div className="text-lg font-bold text-red-600 mb-1">
                                                            {(question.dropFromPrevious || 0).toFixed(1)}%
                                                        </div>
                                                        <div className="text-xs text-red-500 font-medium uppercase tracking-wide">
                                                            Never Reached
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
                </>
            ) : null}
        </>
    );
}
