"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from "@/lib/admin-auth";
import Sidebar from '../components/dashboard/Sidebar';

// Define the routes that map to sections
const ROUTE_TO_SECTION: Record<string, string> = {
    '/admin/quiz-analytics': 'quiz-analytics',
    '/admin/lead-analytics': 'crm',
    '/admin/affiliate-analytics': 'ceo-analytics',
    '/admin/closer-management': 'closer-management',
    '/admin/settings': 'settings',
};

type SectionType = 'quiz-analytics' | 'crm' | 'ceo-analytics' | 'closer-management' | 'settings';

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isLoading: authLoading, logout } = useAdminAuth();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showQuickLinks, setShowQuickLinks] = useState(false);
    const [showResetDropdown, setShowResetDropdown] = useState(false);

    // Determine active section from pathname
    const activeSection = (ROUTE_TO_SECTION[pathname] || 'quiz-analytics') as SectionType;

    // Handle section change via router
    const handleSectionChange = useCallback((section: SectionType) => {
        const routes: Record<SectionType, string> = {
            'quiz-analytics': '/admin/quiz-analytics',
            'crm': '/admin/lead-analytics',
            'ceo-analytics': '/admin/affiliate-analytics',
            'closer-management': '/admin/closer-management',
            'settings': '/admin/settings',
        };
        router.push(routes[section]);
    }, [router]);

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
                router.refresh();
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

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-hidden">
            <Sidebar
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                showQuickLinks={showQuickLinks}
                onToggleQuickLinks={() => setShowQuickLinks(!showQuickLinks)}
                handleLogout={handleLogout}
                resetData={resetData}
                showResetDropdown={showResetDropdown}
                setShowResetDropdown={setShowResetDropdown}
            />

            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 flex flex-col w-full px-4 sm:px-6 lg:px-8 py-4 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
