"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getArchetypeInsights } from "@/lib/scoring";

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

  const insights = getArchetypeInsights(result.archetype);

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
                {result.archetype}
              </h2>
              <p className="text-gray-600">
                Based on your answers, this is your financial personality type
              </p>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Personalized Insights
            </h3>
            <div className="space-y-4">
              {insights.map((insight, index) => (
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


          {/* CTA */}
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Ready to Take Action?
              </h3>
              <p className="text-gray-600 mb-6">
                Get personalized financial advice and start building your brighter future today.
              </p>
              <div className="space-y-3">
                <button className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Join Our Waitlist
                </button>
                <div className="text-sm text-gray-500">
                  or
                </div>
                <button className="w-full md:w-auto bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                  Book a Free Consultation
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
