"use client";

import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';

type SectionType = 'quiz-analytics' | 'crm' | 'ceo-analytics' | 'closer-management' | 'settings';

interface DashboardLayoutProps {
    children: ReactNode;
    activeSection: SectionType;
    onSectionChange: (section: SectionType) => void;
    sidebarCollapsed: boolean;
    onToggleSidebar: () => void;
    showQuickLinks: boolean;
    onToggleQuickLinks: () => void;
    handleLogout: () => void;
    resetData: (type: 'quiz' | 'affiliate' | 'closer' | 'all') => void;
    showResetDropdown: boolean;
    setShowResetDropdown: (show: boolean) => void;
}

export default function DashboardLayout({
    children,
    activeSection,
    onSectionChange,
    sidebarCollapsed,
    onToggleSidebar,
    showQuickLinks,
    onToggleQuickLinks,
    handleLogout,
    resetData,
    showResetDropdown,
    setShowResetDropdown
}: DashboardLayoutProps) {
    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-hidden">
            <Sidebar
                activeSection={activeSection}
                onSectionChange={onSectionChange}
                collapsed={sidebarCollapsed}
                onToggleCollapse={onToggleSidebar}
                showQuickLinks={showQuickLinks}
                onToggleQuickLinks={onToggleQuickLinks}
                handleLogout={handleLogout}
                resetData={resetData}
                showResetDropdown={showResetDropdown}
                setShowResetDropdown={setShowResetDropdown}
            />

            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
