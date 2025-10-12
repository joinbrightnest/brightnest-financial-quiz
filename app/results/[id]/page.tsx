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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">BrightNest</h1>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 mb-8">
              <div className="text-sm text-gray-500 font-medium mb-4">Your Financial Archetype</div>
              <h2 className="text-4xl font-bold text-blue-600 mb-4">
                {copy.archetype}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                {copy.header.subtitle}
              </p>
            </div>
          </div>

          {/* Recognition Section */}
          <div className="mb-20">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Recognition</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {copy.validation}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Personalized Insights Section */}
          <div className="mb-20">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Personalized Insights</h3>
              </div>
              <div className="space-y-6">
                {copy.personalized_insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-lg text-gray-600 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hidden Challenge Section */}
          <div className="mb-20">
            <div className="bg-orange-50 rounded-xl border border-orange-100 p-8">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">The Hidden Challenge</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {copy.problem_realization}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transformation Section */}
          <div className="mb-20">
            <div className="bg-green-50 rounded-xl border border-green-100 p-8">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Your Opportunity</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {copy.hope_and_solution}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mb-16">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
              <h3 className="text-3xl font-bold text-gray-800 mb-6">
                {copy.cta.headline}
              </h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                {copy.cta.body}
              </p>
              <div className="space-y-4">
                <Link
                  href="/book-call"
                  className="inline-block w-full md:w-auto bg-gradient-to-r from-blue-600 to-teal-600 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  {copy.cta.button}
                </Link>
                <div className="text-gray-500 font-medium">
                  or
                </div>
                <button className="w-full md:w-auto bg-gray-100 text-gray-700 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-gray-200 transition-all duration-300">
                  {copy.cta.secondary}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-6">
                No pressure — just clarity and guidance.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-6 text-gray-500">
              <Link
                href="/quiz"
                className="hover:text-gray-700 transition-colors duration-300 font-medium"
              >
                Take the quiz again
              </Link>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <Link
                href="/"
                className="hover:text-gray-700 transition-colors duration-300 font-medium"
              >
                Back to Home
              </Link>
            </div>
            <div className="mt-8 text-gray-400 text-sm">
              © 2024 BrightNest. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
