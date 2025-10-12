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
    header: `You're a ${result.archetype} — based on your answers, this is your financial personality type.`,
    insights: getArchetypeInsights(result.archetype),
    challenge: "Your financial journey has unique opportunities for growth.",
    good_news: "With the right guidance, you can achieve your financial goals and build lasting wealth.",
    cta: "Ready to take the next step? Book your Free Financial Assessment now and get personalized guidance."
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Your Financial Archetype
            </h1>
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <h2 className="text-3xl font-bold text-blue-600 mb-2">
                {copy.archetype}
              </h2>
              <p className="text-gray-600 text-lg">
                {copy.header}
              </p>
            </div>
          </div>

          {/* Personalized Insights */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Personalized Insights
            </h3>
            <div className="space-y-4">
              {copy.insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-bold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hidden Challenge */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              The Hidden Challenge
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              {copy.challenge}
            </p>
          </div>

          {/* Good News */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              The Good News
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              {copy.good_news}
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Ready to Take Action?
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                {copy.cta}
              </p>
              <div className="space-y-3">
                <Link
                  href="/book-call"
                  className="inline-block w-full md:w-auto bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Book My Free Financial Assessment
                </Link>
                <div className="text-sm text-gray-500">
                  or
                </div>
                <button className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Join Waitlist
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <Link
              href="/quiz"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Take the quiz again
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
