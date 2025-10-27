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
    <div className="min-h-screen flex flex-col" style={{backgroundColor: '#faf8f0'}}>
      {/* Header */}
      <div className="bg-[#333333] py-3 sm:py-4 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div>
            <Link href="/" className="flex-shrink-0 inline-block">
              <div className="inline-flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm sm:text-lg">B</span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-white font-serif">BrightNest</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-12 pb-20">
        <div className="max-w-4xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-16">
            <p className="text-gray-500 text-xs sm:text-sm mb-2">Your Financial Archetype</p>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif text-blue-600 mb-3 sm:mb-4">
              {result.archetype}
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
              {copy.header.subtitle}
            </p>
          </div>

          {/* Main Content Container */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-12 space-y-8 sm:space-y-12">
            
            {/* Recognition Section */}
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Recognition</h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                {copy.validation}
              </p>
            </div>

            <hr className="my-6 sm:my-8 border-gray-200" />

            {/* Functional Reflection Section */}
            <div className="opacity-0 translate-y-4 animate-fade-in">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Your Financial Patterns</h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                {copy.reflection}
              </p>
            </div>

            <hr className="my-6 sm:my-8 border-gray-200" />

            {/* Hidden Challenge Section */}
            <div className="opacity-0 translate-y-4 animate-fade-in">
              <div className="bg-yellow-50 rounded-lg p-4 sm:p-6 -mx-6 sm:-mx-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Hidden Challenge</h3>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  {copy.problem_realization}
                </p>
              </div>
            </div>

            <hr className="my-6 sm:my-8 border-gray-200" />

            {/* Your Opportunity Section */}
            <div className="opacity-0 translate-y-4 animate-fade-in">
              <div className="bg-green-50 rounded-lg p-4 sm:p-6 -mx-6 sm:-mx-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Your Opportunity</h3>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  {copy.hope_and_solution}
                </p>
              </div>
            </div>

            <hr className="my-6 sm:my-8 border-gray-200" />

            {/* CTA Section */}
            <div className="opacity-0 translate-y-4 animate-fade-in text-center">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">
                {copy.cta.headline}
              </h3>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                {copy.cta.body}
              </p>
              <div className="space-y-3 sm:space-y-4">
                {qualifiesForCall ? (
                  // User qualifies for call - show book call button
                  <Link
                    href="/book-call"
                    className="inline-block w-full md:w-auto bg-blue-600 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    {copy.cta.button}
                  </Link>
                ) : (
                  // User doesn't qualify - show checkout button
                  <Link
                    href="/checkout"
                    className="inline-block w-full md:w-auto bg-blue-600 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Complete Your Financial Assessment
                  </Link>
                )}
                <div className="text-gray-500 font-medium text-sm sm:text-base">
                  or
                </div>
                <button className="w-full md:w-auto bg-gray-100 text-gray-700 px-6 sm:px-10 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-200 transition-all duration-300">
                  {copy.cta.secondary}
                </button>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6">
                No pressure — just clarity and guidance.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
