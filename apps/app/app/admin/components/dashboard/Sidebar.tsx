"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

type SectionType = 'quiz-analytics' | 'crm' | 'ceo-analytics' | 'closer-management' | 'settings';

interface SidebarProps {
    activeSection: SectionType;
    onSectionChange: (section: SectionType) => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
    showQuickLinks: boolean;
    onToggleQuickLinks: () => void;
    handleLogout: () => void;
    resetData: (type: 'quiz' | 'affiliate' | 'closer' | 'all') => void;
    showResetDropdown: boolean;
    setShowResetDropdown: (show: boolean) => void;
}

export default function Sidebar({
    activeSection,
    onSectionChange,
    collapsed,
    onToggleCollapse,
    showQuickLinks,
    onToggleQuickLinks,
    handleLogout,
    resetData,
    showResetDropdown,
    setShowResetDropdown
}: SidebarProps) {
    const router = useRouter();
    const getButtonClasses = (section: SectionType) => {
        const isActive = activeSection === section;
        return `w-full flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} ${collapsed ? 'px-2 py-2.5' : 'px-3 py-3 rounded-lg'
            } transition-colors group relative ${isActive
                ? collapsed
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-700 text-white border-l-4 border-indigo-500'
                : collapsed
                    ? 'text-slate-300 hover:bg-slate-700'
                    : 'text-slate-300 hover:bg-slate-700'
            }`;
    };

    const getIconClasses = (section: SectionType) => {
        return `w-5 h-5 ${activeSection === section ? 'text-white' : 'text-slate-300'}`;
    };

    const renderTooltip = (text: string) => {
        if (!collapsed) return null;
        return (
            <div
                className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[9999] transition-opacity shadow-lg"
                style={{ top: '50%', transform: 'translateY(-50%)' }}
            >
                {text}
            </div>
        );
    };

    return (
        <div className={`${collapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700 flex flex-col transition-all duration-300 ease-in-out`}>
            {/* Header */}
            <div className="flex-shrink-0 border-b border-slate-700">
                <div className={`${collapsed ? 'p-4' : 'p-6'} flex items-center justify-between`}>
                    <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 ${collapsed ? 'rounded' : 'rounded-lg'} flex items-center justify-center shadow-md`}>
                            <span className="text-white font-bold text-sm">B</span>
                        </div>
                        {!collapsed && (
                            <div>
                                <h1 className="text-lg font-bold text-white">BrightNest</h1>
                                <p className="text-xs text-slate-300">Admin Panel</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className={`flex-1 overflow-y-auto overflow-x-visible ${collapsed ? 'p-2' : 'p-4'}`}>
                <nav className="space-y-3">
                    {/* Analytics Section */}
                    {!collapsed && (
                        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Analytics
                        </div>
                    )}

                    <button onClick={() => onSectionChange('quiz-analytics')} className={getButtonClasses('quiz-analytics')}>
                        <svg className={getIconClasses('quiz-analytics')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        {!collapsed && <span className="text-sm font-medium">Quiz Analytics</span>}
                        {renderTooltip('Quiz Analytics')}
                    </button>

                    <button onClick={() => onSectionChange('crm')} className={getButtonClasses('crm')}>
                        <svg className={getIconClasses('crm')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {!collapsed && <span className="text-sm font-medium">Lead Analytics</span>}
                        {renderTooltip('Lead Analytics')}
                    </button>

                    <button onClick={() => onSectionChange('ceo-analytics')} className={getButtonClasses('ceo-analytics')}>
                        <svg className={getIconClasses('ceo-analytics')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        {!collapsed && <span className="text-sm font-medium">Affiliate Analytics</span>}
                        {renderTooltip('Affiliate Analytics')}
                    </button>
                </nav>

                {/* Management Section */}
                <div className="mt-8 pt-6 border-t border-slate-700">
                    {!collapsed && (
                        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Management
                        </div>
                    )}

                    <button
                        onClick={() => router.push('/admin/quiz-management')}
                        className={`w-full flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} ${collapsed ? 'px-2 py-2.5' : 'px-3 py-3 rounded-lg'} text-slate-300 hover:bg-slate-700 transition-colors group relative`}
                    >
                        <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {!collapsed && <span className="text-sm font-medium">Quiz Management</span>}
                        {renderTooltip('Quiz Management')}
                    </button>

                    <button onClick={() => onSectionChange('closer-management')} className={getButtonClasses('closer-management')}>
                        <svg className={getIconClasses('closer-management')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {!collapsed && <span className="text-sm font-medium">Closer Management</span>}
                        {renderTooltip('Closer Management')}
                    </button>

                    <button onClick={() => onSectionChange('settings')} className={getButtonClasses('settings')}>
                        <svg className={getIconClasses('settings')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {!collapsed && <span className="text-sm font-medium">Settings</span>}
                        {renderTooltip('Settings')}
                    </button>
                </div>

                {/* Quick Links */}
                {!collapsed && (
                    <div className="mt-8 pt-6 border-t border-slate-700">
                        <div className="px-3">
                            <button
                                onClick={onToggleQuickLinks}
                                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
                            >
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    Quick Links
                                </div>
                                <svg
                                    className={`w-4 h-4 text-slate-300 transition-transform ${showQuickLinks ? 'rotate-180' : ''}`}
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
                                        <div className="text-xs font-medium text-slate-400 px-3 py-1">Login Pages</div>
                                        <a
                                            href="/affiliates/login"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
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
                                            className="flex items-center px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
                                        >
                                            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Closer Login
                                        </a>
                                    </div>

                                    <div className="mt-4 space-y-1">
                                        <div className="text-xs font-medium text-slate-400 px-3 py-1">Admin Tools</div>
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowResetDropdown(!showResetDropdown)}
                                                className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
                                            >
                                                <div className="flex items-center">
                                                    <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    Reset Data
                                                </div>
                                                <svg
                                                    className={`w-4 h-4 text-slate-300 transition-transform ${showResetDropdown ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            {showResetDropdown && (
                                                <div className="absolute left-full top-0 ml-2 w-64 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-50">
                                                    <div className="py-2">
                                                        <button
                                                            onClick={() => {
                                                                resetData('affiliate');
                                                                setShowResetDropdown(false);
                                                            }}
                                                            className="block w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-600 border-b border-slate-600"
                                                        >
                                                            <div className="flex items-center">
                                                                <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                                </svg>
                                                                <div>
                                                                    <div className="font-medium">Affiliate Data</div>
                                                                    <div className="text-xs text-slate-400">Clicks, conversions, payouts</div>
                                                                </div>
                                                            </div>
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                resetData('closer');
                                                                setShowResetDropdown(false);
                                                            }}
                                                            className="block w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-600 border-b border-slate-600"
                                                        >
                                                            <div className="flex items-center">
                                                                <svg className="w-5 h-5 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                </svg>
                                                                <div>
                                                                    <div className="font-medium">Closer Data</div>
                                                                    <div className="text-xs text-slate-400">Appointments, performance</div>
                                                                </div>
                                                            </div>
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                resetData('all');
                                                                setShowResetDropdown(false);
                                                            }}
                                                            className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-600"
                                                        >
                                                            <div className="flex items-center">
                                                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                                <div>
                                                                    <div className="font-medium">Everything</div>
                                                                    <div className="text-xs text-red-400">Complete system reset</div>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer - Toggle Button & User Profile */}
            <div className="flex-shrink-0 border-t border-slate-700 p-4">
                <button
                    onClick={onToggleCollapse}
                    className={`${collapsed ? 'mx-auto mb-3' : 'w-full mb-4'} p-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors flex items-center ${collapsed ? 'justify-center' : 'justify-center space-x-2'}`}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <svg className={`w-4 h-4 text-slate-300 ${collapsed ? 'rotate-180' : ''} transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                    {!collapsed && <span className="text-sm font-medium">Collapse</span>}
                </button>

                {/* User Profile and Logout */}
                {!collapsed ? (
                    <>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                                <span className="text-sm font-bold text-white">A</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">Admin</p>
                                <p className="text-xs text-slate-300 truncate">admin@brightnest.com</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 rounded-lg transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Logout</span>
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center space-y-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                            <span className="text-sm font-bold text-white">A</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-slate-300 hover:bg-slate-700 transition-colors group relative"
                            title="Logout"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                                Logout
                            </div>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
