"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface LeadData {
  id: string;
  sessionId: string;
  quizType: string;
  startedAt: string;
  completedAt: string;
  status: string;
  durationMs: number;
  result?: {
    archetype: string;
    score: number;
    insights: string[];
  };
  answers: Array<{
    questionId: string;
    questionText: string;
    answer: string;
    answerValue: number;
  }>;
  user?: {
    email: string;
    name: string;
    role: string;
  };
  affiliate?: {
    name: string;
    referralCode: string;
  };
}

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetchLeadData();
    }
  }, [sessionId]);

  const fetchLeadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch lead data from the dedicated API endpoint
      const response = await fetch(`/api/admin/leads/${sessionId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Lead not found");
        }
        throw new Error("Failed to fetch lead data");
      }
      
      const leadData = await response.json();
      setLeadData(leadData);
    } catch (err) {
      console.error("Error fetching lead data:", err);
      setError(err instanceof Error ? err.message : "Failed to load lead data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !leadData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Data</h3>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-semibold hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Lead Details
                  </h1>
                  <p className="text-slate-600 font-medium">
                    Session ID: {leadData.sessionId}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to CRM
              </button>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Session Information Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
            <h4 className="text-xl font-bold text-slate-900 mb-6">Session Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-2">Quiz Type</p>
                <p className="text-lg font-semibold text-slate-900">{leadData.quizType}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Status</p>
                <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                  leadData.status === "completed" 
                    ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg" 
                    : "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg"
                }`}>
                  {leadData.status === "completed" ? "Completed" : "In Progress"}
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Duration</p>
                <p className="text-lg font-semibold text-slate-900">
                  {leadData.durationMs ? `${Math.round(leadData.durationMs / 60000)} minutes` : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Started</p>
                <p className="text-lg font-semibold text-slate-900">{new Date(leadData.startedAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Completed</p>
                <p className="text-lg font-semibold text-slate-900">
                  {leadData.completedAt ? new Date(leadData.completedAt).toLocaleString() : "Incomplete"}
                </p>
              </div>
              {leadData.affiliate && (
                <div>
                  <p className="text-sm text-slate-600 mb-2">Affiliate</p>
                  <p className="text-lg font-semibold text-slate-900">{leadData.affiliate.name}</p>
                  <p className="text-sm text-slate-500">Code: {leadData.affiliate.referralCode}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
            <h4 className="text-xl font-bold text-slate-900 mb-6">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-2">Name</p>
                <p className="text-lg font-semibold text-slate-900">{leadData.user?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Email</p>
                <p className="text-lg font-semibold text-slate-900">{leadData.user?.email || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Quiz Result Card */}
          {leadData.result && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <h4 className="text-xl font-bold text-slate-900 mb-6">Quiz Result</h4>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-slate-600 mb-2">Archetype</p>
                  <p className="text-2xl font-bold text-slate-900">{leadData.result.archetype}</p>
                </div>
                {leadData.result.score && (
                  <div>
                    <p className="text-sm text-slate-600 mb-3">Scores</p>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                      <pre className="text-sm font-mono text-slate-900 whitespace-pre-wrap">
                        {typeof leadData.result.score === 'string' 
                          ? leadData.result.score 
                          : JSON.stringify(leadData.result.score, null, 2)
                        }
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quiz Answers Card */}
          {leadData.answers.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <h4 className="text-xl font-bold text-slate-900 mb-6">
                Quiz Answers ({leadData.answers.length} answers)
              </h4>
              <div className="space-y-4">
                {leadData.answers.map((answer, index) => (
                  <div key={index} className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h5 className="text-lg font-bold text-slate-900">Question {index + 1}</h5>
                      <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded-lg">
                        {new Date(leadData.startedAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-900 mb-3 text-base">{answer.questionText}</p>
                    <p className="text-slate-700 mb-2">
                      <span className="font-semibold">Answer:</span> "{answer.answer}"
                    </p>
                    <p className="text-sm text-slate-600">
                      <span className="font-semibold">Type:</span> single
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}