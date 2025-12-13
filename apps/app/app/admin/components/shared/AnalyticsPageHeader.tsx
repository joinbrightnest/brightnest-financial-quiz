"use client";

import React from "react";

interface Tab {
    id: string;
    label: string;
    icon?: React.ReactNode;
    badge?: number;
}

interface AnalyticsPageHeaderProps {
    icon: React.ReactNode;
    iconGradient: string;
    title: string;
    subtitle: string;
    children?: React.ReactNode;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    tabs?: Tab[];
    activeTab?: string;
    onTabChange?: (tabId: string) => void;
}

export default function AnalyticsPageHeader({
    icon,
    iconGradient,
    title,
    subtitle,
    children,
    onRefresh,
    isRefreshing = false,
    tabs,
    activeTab,
    onTabChange,
}: AnalyticsPageHeaderProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between">
                {/* Left side: Icon, Title, Subtitle */}
                <div className="flex items-center space-x-3">
                    <div
                        className={`w-10 h-10 bg-gradient-to-r ${iconGradient} rounded-xl flex items-center justify-center shadow-lg`}
                    >
                        {icon}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                        <p className="text-sm text-gray-600">{subtitle}</p>
                    </div>
                </div>

                {/* Right side: Filters and Refresh */}
                <div className="flex items-center space-x-3">
                    {children}

                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            disabled={isRefreshing}
                            className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg
                                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            <span>Refresh</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs - if provided */}
            {tabs && tabs.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex space-x-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange?.(tab.id)}
                                className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${activeTab === tab.id
                                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
                                <span>{tab.label}</span>
                                {tab.badge !== undefined && tab.badge > 0 && (
                                    <span
                                        className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.id
                                                ? "bg-white/20 text-white"
                                                : "bg-red-100 text-red-600"
                                            }`}
                                    >
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
