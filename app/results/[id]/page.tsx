"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getArchetypeInsights } from "@/lib/scoring";
import { ArchetypeCopy } from "@/lib/ai-content";

interface Result {
  id: string;
  archetype: string;
  scores: {
    debt: number;
    savings: number;
    spending: number;
    investing: number;
  };
}

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const [result, setResult] = useState<Result | null>(null);
  const [personalizedCopy, setPersonalizedCopy] = useState<ArchetypeCopy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasInitiallyLoaded = useRef(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const { id } = await params;
        const response = await fetch(`/api/results/${id}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch result");
        }
        
        const data = await response.json();
        setResult(data);
        
        // Get session ID from result to fetch personalized copy
        if (data.sessionId) {
          try {
            const copyResponse = await fetch('/api/quiz/archetype-copy', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId: data.sessionId })
            });
            
            if (copyResponse.ok) {
              const copyData = await copyResponse.json();
              setPersonalizedCopy(copyData.copy);
            }
          } catch (copyError) {
            console.error('Failed to fetch personalized copy:', copyError);
            // Continue without personalized copy - will use fallback
          }
        }
        
        hasInitiallyLoaded.current = true;
        setIsLoading(false);
      } catch (_err) {
        setError("Failed to load results. Please try again.");
        hasInitiallyLoaded.current = true;
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [params]);

  if (isLoading && !hasInitiallyLoaded.current) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error || "Result not found"}</p>
            <Link
              href="/quiz"
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Take Quiz Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Use personalized copy if available, otherwise fallback to static insights
  const copy = personalizedCopy || {
    archetype: result.archetype,
    header: {
      title: "Your Financial Archetype",
      subtitle: `You're a ${result.archetype} — based on your answers, this is your financial personality type.`
    },
    validation: "You have unique financial strengths and opportunities for growth.",
    personalized_insights: getArchetypeInsights(result.archetype),
    problem_realization: "Your financial journey has unique challenges to overcome.",
    hope_and_solution: "With the right guidance, you can achieve your financial goals and build lasting wealth.",
    cta: {
      headline: "Ready to Take Action?",
      body: "Let's turn your financial insights into actionable results.",
      button: "Book My Free Financial Assessment",
      secondary: "Join Waitlist"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-20 blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full opacity-20 blur-xl animate-pulse delay-500"></div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Brand Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                BrightNest
              </h1>
            </div>
            <div className="text-sm text-purple-300 font-medium tracking-wider uppercase mb-8">
              Financial Intelligence Platform
            </div>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-30"></div>
              <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-12 shadow-2xl">
                <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-semibold text-sm mb-6">
                  Your Financial Archetype
                </div>
                <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
                  {copy.archetype}
                </h2>
                <p className="text-xl text-purple-100 leading-relaxed max-w-3xl mx-auto">
                  {copy.header.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Validation Section */}
          <div className="mb-16">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">Recognition</h3>
                  <p className="text-lg text-purple-100 leading-relaxed">
                    {copy.validation}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Insights Section */}
          <div className="mb-16">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">Personalized Insights</h3>
              </div>
              <div className="space-y-6">
                {copy.personalized_insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-lg text-purple-100 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Challenge Section */}
          <div className="mb-16">
            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-lg border border-red-500/30 rounded-2xl p-8 shadow-xl">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">The Hidden Challenge</h3>
                  <p className="text-lg text-red-100 leading-relaxed">
                    {copy.problem_realization}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Solution Section */}
          <div className="mb-16">
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg border border-green-500/30 rounded-2xl p-8 shadow-xl">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">The Transformation</h3>
                  <p className="text-lg text-green-100 leading-relaxed">
                    {copy.hope_and_solution}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mb-16">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-40"></div>
              <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-12 shadow-2xl">
                <h3 className="text-4xl font-bold text-white mb-6">
                  {copy.cta.headline}
                </h3>
                <p className="text-xl text-purple-100 mb-8 leading-relaxed max-w-2xl mx-auto">
                  {copy.cta.body}
                </p>
                <div className="space-y-4">
                  <Link
                    href="/book-call"
                    className="inline-block w-full md:w-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white px-12 py-4 rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-2"
                  >
                    {copy.cta.button}
                  </Link>
                  <div className="text-purple-300 font-medium">
                    or
                  </div>
                  <button className="w-full md:w-auto bg-white/20 backdrop-blur-lg border border-white/30 text-white px-12 py-4 rounded-2xl font-bold text-lg hover:bg-white/30 transition-all duration-300">
                    {copy.cta.secondary}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-6 text-purple-300">
              <Link
                href="/quiz"
                className="hover:text-white transition-colors duration-300 font-medium"
              >
                Take the quiz again
              </Link>
              <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
              <Link
                href="/"
                className="hover:text-white transition-colors duration-300 font-medium"
              >
                Back to Home
              </Link>
            </div>
            <div className="mt-8 text-purple-400 text-sm">
              © 2024 BrightNest. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
