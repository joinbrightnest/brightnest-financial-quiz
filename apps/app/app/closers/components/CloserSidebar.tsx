"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Closer {
  id: string;
  name: string;
  email: string;
}

interface CloserSidebarProps {
  closer: Closer | null;
  onLogout: () => void;
  activeTaskCount?: number;
}

export default function CloserSidebar({ closer, onLogout, activeTaskCount = 0 }: CloserSidebarProps) {
  const pathname = usePathname();
  // Initialize state to false to match server-side rendering
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    // Mark as mounted for localStorage writes
    setMounted(true);

    // Read saved state from localStorage
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
    }
  }, [isCollapsed, mounted]);

  return (
    <div className={`${isCollapsed ? 'w-14' : 'w-56'} h-screen bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700 flex-shrink-0 flex flex-col transition-all duration-300 overflow-visible`}>
      {/* Sidebar Header */}
      <div className={`${isCollapsed ? 'p-3' : 'p-4'} border-b border-slate-700 flex items-center justify-between`}>
        <Link href="/closers/dashboard" className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-2.5'}`}>
          <div className={`w-7 h-7 bg-gradient-to-br from-indigo-600 to-purple-600 ${isCollapsed ? 'rounded' : 'rounded-lg'} flex items-center justify-center shadow-md`}>
            <span className="text-white font-bold text-xs">B</span>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-base font-bold text-white">BrightNest</h1>
              <p className="text-[10px] text-slate-300">Closer Portal</p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div className={`flex-1 overflow-y-auto overflow-x-visible ${isCollapsed ? 'p-2' : 'p-3'}`}>
        <nav className="space-y-2">
          <Link
            href="/closers/dashboard"
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} ${isCollapsed ? 'px-2 py-2' : 'px-2.5 py-2 rounded-lg'} transition-colors group relative ${isActive('/closers/dashboard')
              ? isCollapsed
                ? 'bg-slate-700 text-white'
                : 'bg-slate-700 text-white border-l-4 border-indigo-500'
              : isCollapsed
                ? 'text-slate-300 hover:bg-slate-700'
                : 'text-slate-300 hover:bg-slate-700'
              }`}
          >
            <svg className={`w-4 h-4 ${isActive('/closers/dashboard') ? 'text-white' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {!isCollapsed && <span className="text-sm font-medium">Dashboard</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[9999] transition-opacity shadow-lg" style={{ top: '50%', transform: 'translateY(-50%)' }}>
                Dashboard
              </div>
            )}
          </Link>
          <Link
            href="/closers/databased"
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} ${isCollapsed ? 'px-2 py-2' : 'px-2.5 py-2 rounded-lg'} transition-colors group relative ${isActive('/closers/databased')
              ? isCollapsed
                ? 'bg-slate-700 text-white'
                : 'bg-slate-700 text-white border-l-4 border-indigo-500'
              : isCollapsed
                ? 'text-slate-300 hover:bg-slate-700'
                : 'text-slate-300 hover:bg-slate-700'
              }`}
          >
            <svg className={`w-4 h-4 ${isActive('/closers/databased') ? 'text-white' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            {!isCollapsed && <span className="text-sm font-medium">Database</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[9999] transition-opacity shadow-lg" style={{ top: '50%', transform: 'translateY(-50%)' }}>
                Database
              </div>
            )}
          </Link>
          <Link
            href="/closers/scripts"
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} ${isCollapsed ? 'px-2 py-2' : 'px-2.5 py-2 rounded-lg'} transition-colors group relative ${isActive('/closers/scripts')
              ? isCollapsed
                ? 'bg-slate-700 text-white'
                : 'bg-slate-700 text-white border-l-4 border-indigo-500'
              : isCollapsed
                ? 'text-slate-300 hover:bg-slate-700'
                : 'text-slate-300 hover:bg-slate-700'
              }`}
          >
            <svg className={`w-4 h-4 ${isActive('/closers/scripts') ? 'text-white' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {!isCollapsed && <span className="text-sm font-medium">Scripts</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[9999] transition-opacity shadow-lg" style={{ top: '50%', transform: 'translateY(-50%)' }}>
                Scripts
              </div>
            )}
          </Link>
          <Link
            href="/closers/rules"
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} ${isCollapsed ? 'px-2 py-2' : 'px-2.5 py-2 rounded-lg'} transition-colors group relative ${isActive('/closers/rules')
              ? isCollapsed
                ? 'bg-slate-700 text-white'
                : 'bg-slate-700 text-white border-l-4 border-indigo-500'
              : isCollapsed
                ? 'text-slate-300 hover:bg-slate-700'
                : 'text-slate-300 hover:bg-slate-700'
              }`}
          >
            <svg className={`w-4 h-4 ${isActive('/closers/rules') ? 'text-white' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {!isCollapsed && <span className="text-sm font-medium">Rules</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[9999] transition-opacity shadow-lg" style={{ top: '50%', transform: 'translateY(-50%)' }}>
                Rules
              </div>
            )}
          </Link>
          <Link
            href="/closers/tasks"
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} ${isCollapsed ? 'px-2 py-2' : 'px-2.5 py-2 rounded-lg'} transition-colors group relative ${isActive('/closers/tasks')
              ? isCollapsed
                ? 'bg-slate-700 text-white'
                : 'bg-slate-700 text-white border-l-4 border-indigo-500'
              : isCollapsed
                ? 'text-slate-300 hover:bg-slate-700'
                : 'text-slate-300 hover:bg-slate-700'
              }`}
          >
            <svg className={`w-4 h-4 ${isActive('/closers/tasks') ? 'text-white' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            {!isCollapsed && (
              <>
                <span className="text-sm font-medium flex-1">Tasks</span>
                {activeTaskCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full min-w-[20px] text-center">
                    {activeTaskCount}
                  </span>
                )}
              </>
            )}
            {isCollapsed && activeTaskCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full border border-slate-900">
                {activeTaskCount > 9 ? '9+' : activeTaskCount}
              </span>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[9999] transition-opacity shadow-lg" style={{ top: '50%', transform: 'translateY(-50%)' }}>
                Tasks
              </div>
            )}
          </Link>
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className={`${isCollapsed ? 'p-2' : 'p-3'} border-t border-slate-700 flex-shrink-0`}>
        {/* Collapse/Expand Button - Always visible */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`${isCollapsed ? 'mx-auto mb-3' : 'w-full mb-4'} p-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors flex items-center ${isCollapsed ? 'justify-center' : 'justify-center space-x-2'}`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg className={`w-4 h-4 text-slate-300 ${isCollapsed ? 'rotate-180' : ''} transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          {!isCollapsed && <span className="text-sm font-medium">Collapse</span>}
        </button>

        {/* User Profile and Logout - Always render, use fallbacks if closer is null */}
        {!isCollapsed ? (
          <>
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                <span className="text-sm font-bold text-white">
                  {closer?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {closer?.name || 'User'}
                </p>
                <p className="text-xs text-slate-300 truncate">{closer?.email || ''}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
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
              <span className="text-sm font-bold text-white">
                {closer?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <button
              onClick={onLogout}
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

