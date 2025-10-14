"use client";

import { useEffect, Suspense } from "react";
import { useParams } from "next/navigation";

function AffiliatePageContent() {
  const params = useParams();
  const affiliateCode = params.affiliateCode as string;

  useEffect(() => {
    if (affiliateCode) {
      // Track the affiliate click
      fetch("/api/track-affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ref: affiliateCode,
        }),
      }).catch(console.error);
    }
  }, [affiliateCode]);

  return (
    <div className="min-h-screen bg-white">
      {/* Your existing homepage content */}
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          BrightNest
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          The behavior-based system for lasting financial peace.
        </p>
        <div className="space-x-4">
          <a
            href="/quiz/financial-profile"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Start Financial Profile Quiz
          </a>
          <a
            href="/quiz/health-finance"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Start Health Finance Quiz
          </a>
          <a
            href="/quiz/marriage-finance"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
          >
            Start Marriage Finance Quiz
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AffiliatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AffiliatePageContent />
    </Suspense>
  );
}
