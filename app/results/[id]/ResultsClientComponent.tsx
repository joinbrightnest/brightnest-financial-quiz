"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Result {
  id: string;
  archetype: string;
  scores: {
    debt: number;
    savings: number;
    spending: number;
    investing: number;
    totalPoints?: number;
    qualifiesForCall?: boolean;
  };
}

export default function ResultsClientComponent({ result }: { result: Result }) {
  const [personalizedCopy, setPersonalizedCopy] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate qualification if not already stored (for existing results)
  const totalPoints = result.scores.totalPoints || 
    (result.scores.debt + result.scores.savings + result.scores.spending + result.scores.investing);
  const qualifiesForCall = result.scores.qualifiesForCall !== undefined 
    ? result.scores.qualifiesForCall 
    : totalPoints >= 17;

  useEffect(() => {
    // Get pre-generated AI copy from localStorage
    const storedCopy = localStorage.getItem('personalizedCopy');
    if (storedCopy) {
      try {
        const copy = JSON.parse(storedCopy);
        setPersonalizedCopy(copy);
        console.log('Using pre-generated AI copy from localStorage');
        // Clean up localStorage
        localStorage.removeItem('personalizedCopy');
      } catch (parseError) {
        console.log('Error parsing stored copy:', parseError);
      }
    }
    setIsLoading(false);
  }, []);

  // Use AI-generated copy if available, otherwise fallback
  const copy = personalizedCopy || {
    header: {
      title: "Your Financial Archetype",
      subtitle: `You're a ${result.archetype} — based on your answers, this is your financial personality type.`
    },
    validation: "You have unique financial strengths and opportunities for growth.",
    reflection: "Your financial patterns reveal important insights about your money mindset.",
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Bar with BrightNest Logo */}
      <div className="w-full bg-[#28303B] px-6 py-6 relative">
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <div className="inline-flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-white font-serif">BrightNest</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="mb-8">
              <div className="text-sm text-gray-500 font-medium mb-4">Your Financial Archetype</div>
              <h2 className="text-4xl font-bold text-blue-600 mb-4">
                {result.archetype}
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

            {/* Functional Reflection Section */}
            <div className="opacity-0 translate-y-4 animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Your Financial Patterns</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                {copy.reflection}
              </p>
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
                {qualifiesForCall ? (
                  // User qualifies for call - show book call button
                  <Link
                    href="/book-call"
                    className="inline-block w-full md:w-auto bg-blue-600 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    {copy.cta.button}
                  </Link>
                ) : (
                  // User doesn't qualify - show checkout button
                  <Link
                    href="/checkout"
                    className="inline-block w-full md:w-auto bg-blue-600 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Complete Your Financial Assessment
                  </Link>
                )}
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
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
