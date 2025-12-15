"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import CloserSidebar from './components/CloserSidebar';
import { useCloserAuth, useActiveTaskCount } from './hooks';

export default function ClosersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { closer, isLoading, handleLogout } = useCloserAuth();
    const { activeTaskCount } = useActiveTaskCount();

    // Don't show sidebar on login/signup pages
    const isAuthPage = pathname?.includes('/login') || pathname?.includes('/signup');

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex overflow-hidden">
            {/* Sidebar persists across all closer pages - never remounts on navigation */}
            <CloserSidebar closer={closer} onLogout={handleLogout} activeTaskCount={activeTaskCount} />

            {/* Page content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {children}
            </div>
        </div>
    );
}
