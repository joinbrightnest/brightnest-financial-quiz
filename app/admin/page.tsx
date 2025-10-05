"use client";

import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

interface AdminStats {
  totalSessions: number;
  completedSessions: number;
  completionRate: number;
  avgDurationMs: number;
  recentSessions: Array<{
    id: string;
    completedAt: string;
    result: {
      archetype: string;
    } | null;
  }>;
  archetypeStats: Array<{
    archetype: string;
    _count: { archetype: number };
  }>;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/admin/stats");
      
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      
      const data = await response.json();
      setStats(data);
    } catch (_err) {
      setError("Failed to load admin stats");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const exportCSV = () => {
    if (!stats) return;
    
    const csvContent = [
      ["Session ID", "Completed At", "Archetype"],
      ...stats.recentSessions.map(session => [
        session.id,
        new Date(session.completedAt).toLocaleString(),
        session.result?.archetype || "N/A"
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quiz-sessions.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Admin Login
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            Sign in with your admin email to access the dashboard
          </p>
          <button
            onClick={() => signIn("email")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In with Email
          </button>
        </div>
      </div>
    );
  }

  if (session.user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You don&apos;t have admin privileges to access this page.
          </p>
          <button
            onClick={() => signOut()}
            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {session.user.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Stats Cards */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading stats...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchStats}
                className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Total Sessions
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.totalSessions}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Completed Sessions
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.completedSessions}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Completion Rate
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.completionRate}%
                  </p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Avg Duration
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {formatDuration(stats.avgDurationMs)}
                  </p>
                </div>
              </div>

              {/* Archetype Distribution */}
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Archetype Distribution
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.archetypeStats.map((stat) => (
                    <div key={stat.archetype} className="text-center">
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

              {/* Recent Sessions */}
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Sessions
                  </h3>
                  <button
                    onClick={exportCSV}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Export CSV
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
                          Completed At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Archetype
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.recentSessions.map((session) => (
                        <tr key={session.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            {session.id.slice(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(session.completedAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {session.result?.archetype || "N/A"}
                          </td>
                        </tr>
                      ))}
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
