"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface CloserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalCalls: number;
  totalConversions: number;
  totalRevenue: number;
  conversionRate: number;
}

interface CloserHeaderProps {
  closer: CloserData;
  onLogout: () => void;
  taskCount?: number;
}

export default function CloserHeader({ closer, onLogout, taskCount = 0 }: CloserHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="bg-gradient-to-r from-white via-gray-50 to-white shadow-lg border-b border-gray-200/50 backdrop-blur-sm relative z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center py-5">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/closers/dashboard" className="flex-shrink-0 group">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  BrightNest
                </h1>
              </div>
            </Link>
          </div>

          {/* Navigation - Centered */}
          <nav className="hidden md:flex space-x-1 flex-1 justify-center">
            <Link
              href="/closers/dashboard"
              className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                isActive('/closers/dashboard')
                  ? 'text-indigo-600 bg-indigo-50 border border-indigo-200'
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <span className="relative z-10">Dashboard</span>
              {!isActive('/closers/dashboard') && (
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              )}
            </Link>
            <Link
              href="/closers/tasks"
              className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                isActive('/closers/tasks')
                  ? 'text-indigo-600 bg-indigo-50 border border-indigo-200'
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <span className="relative z-10 flex items-center">
                Tasks
                {taskCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full min-w-[20px] text-center">
                    {taskCount}
                  </span>
                )}
              </span>
              {!isActive('/closers/tasks') && (
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              )}
            </Link>
          </nav>

          {/* User Menu */}
          <div className="relative ml-auto">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center space-x-3 text-sm rounded-xl bg-white/80 hover:bg-white border border-gray-200/50 hover:border-gray-300 px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                    <span className="text-sm font-bold text-white">
                      {closer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    {closer.name}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200 shadow-sm">
                      <span className="mr-1">📞</span>
                      Closer
                    </span>
                  </div>
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl ring-1 ring-gray-200/50 border border-gray-100/50 z-[9999] overflow-hidden">
                <div className="py-2">
                  <div className="px-4 py-3 border-b border-gray-100/50">
                    <p className="text-sm font-semibold text-gray-900">{closer.name}</p>
                    <p className="text-xs text-gray-600">{closer.email}</p>
                  </div>
                  <Link
                    href="/closers/dashboard"
                    className={`flex items-center px-4 py-3 text-sm transition-all duration-200 group ${
                      isActive('/closers/dashboard')
                        ? 'text-indigo-600 bg-indigo-50 border-l-4 border-indigo-500'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50'
                    }`}
                    onClick={() => setShowMenu(false)}
                  >
                    <svg className={`w-4 h-4 mr-3 ${isActive('/closers/dashboard') ? 'text-indigo-600' : 'text-gray-500 group-hover:text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                    </svg>
                    Dashboard
                  </Link>
                  <Link
                    href="/closers/tasks"
                    className={`flex items-center justify-between px-4 py-3 text-sm transition-all duration-200 group ${
                      isActive('/closers/tasks')
                        ? 'text-indigo-600 bg-indigo-50 border-l-4 border-indigo-500'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50'
                    }`}
                    onClick={() => setShowMenu(false)}
                  >
                    <div className="flex items-center">
                      <svg className={`w-4 h-4 mr-3 ${isActive('/closers/tasks') ? 'text-indigo-600' : 'text-gray-500 group-hover:text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      Tasks
                    </div>
                    {taskCount > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full min-w-[20px] text-center">
                        {taskCount}
                      </span>
                    )}
                  </Link>
                  <div className="border-t border-gray-100/50 my-1"></div>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onLogout();
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 group"
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-500 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

