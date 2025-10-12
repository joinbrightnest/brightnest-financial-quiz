"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
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
  const [resultId, setResultId] = useState<string | null>(null);

  useEffect(() => {
    const initializeResult = async () => {
      try {
        const { id } = await params;
        setResultId(id);
        
        // Retry logic for database consistency
        for (let attempt = 1; attempt <= 10; attempt++) {
          console.log(`Fetch attempt ${attempt}/10 for result: ${id}`);
          
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
          
          const response = await fetch(`${baseUrl}/api/results/${id}`, {
            cache: 'no-store'
          });
          
          console.log('Result fetch response status:', response.status);
          
          if (response.ok) {
            const resultData = await response.json();
            console.log('Result fetched successfully:', resultData);
            setResult(resultData);
            setIsLoading(false);
            return;
          }
          
          if (attempt < 10) {
            console.log(`Attempt ${attempt} failed, retrying in 2 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('Result fetch failed after 10 attempts:', errorData);
            setError("Result not found");
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error('Error initializing result:', err);
        setError("Failed to load result");
        setIsLoading(false);
      }
    };

    initializeResult();
  }, [params]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Top Bar with BrightNest Logo */}
        <div className="w-full bg-[#28303B] px-6 py-6 relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
            <span className="text-xl font-bold text-white font-serif">BrightNest</span>
          </div>
        </div>

        {/* Loading Content */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Preparing Your Results</h2>
            <p className="text-gray-600 text-lg">
              Please wait while we finalize your personalized financial insights...
            </p>
            {resultId && (
              <p className="text-sm text-gray-500 mt-2">
                Loading result: {resultId}
              </p>
            )}
          </div>
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

  // Use fallback copy since personalized copy requires server-side API key
  const copy = {
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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">BrightNest</h1>
            </div>
            
            <div className="mb-8">
              <div className="text-sm text-gray-500 font-medium mb-4">Your Financial Archetype</div>
              <h2 className="text-4xl font-bold text-blue-600 mb-4">
                {copy.archetype}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                {copy.header.subtitle}
              </p>
            </div>
          </div>

          {/* Main Content Container */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 space-y-12">
            
            {/* Recognition Section */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Recognition</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                {copy.validation}
              </p>
            </div>

            <hr className="my-8 border-gray-200" />

            {/* Personalized Insights Section */}
            <div className="opacity-0 translate-y-4 animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Personalized Insights</h3>
              <div className="space-y-4">
                {copy.personalized_insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-xs">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-lg text-gray-600 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            <hr className="my-8 border-gray-200" />

            {/* Hidden Challenge Section */}
            <div className="opacity-0 translate-y-4 animate-fade-in">
              <div className="bg-yellow-50 rounded-lg p-6 -mx-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Hidden Challenge</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {copy.problem_realization}
                </p>
              </div>
            </div>

            <hr className="my-8 border-gray-200" />

            {/* Your Opportunity Section */}
            <div className="opacity-0 translate-y-4 animate-fade-in">
              <div className="bg-green-50 rounded-lg p-6 -mx-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Your Opportunity</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {copy.hope_and_solution}
                </p>
              </div>
            </div>

            <hr className="my-8 border-gray-200" />

            {/* CTA Section */}
            <div className="opacity-0 translate-y-4 animate-fade-in text-center">
              <h3 className="text-3xl font-bold text-gray-800 mb-6">
                {copy.cta.headline}
              </h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {copy.cta.body}
              </p>
              <div className="space-y-4">
                <Link
                  href="/book-call"
                  className="inline-block w-full md:w-auto bg-blue-600 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
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
          <div className="text-center mt-16">
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
