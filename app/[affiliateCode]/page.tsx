"use client";

import { useEffect, Suspense } from "react";
import { useParams } from "next/navigation";

function AffiliateRedirectContent() {
  const params = useParams();
  const affiliateCode = params.affiliateCode as string;

  useEffect(() => {
    if (affiliateCode) {
      console.log("🎯 Affiliate visit detected:", affiliateCode);
      console.log("🍪 Setting affiliate cookie...");
      
      // Set the affiliate cookie for the quiz system
      document.cookie = `affiliate_ref=${affiliateCode}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      
      console.log("✅ Affiliate cookie set successfully");
      console.log("📊 Tracking affiliate click...");
      
      // Track the affiliate click immediately
      fetch("/api/track-affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ref: affiliateCode,
          utm_source: new URLSearchParams(window.location.search).get("utm_source"),
          utm_medium: new URLSearchParams(window.location.search).get("utm_medium"),
          utm_campaign: new URLSearchParams(window.location.search).get("utm_campaign")
        }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log("✅ Affiliate click tracked successfully");
        } else {
          console.error("❌ Failed to track affiliate click:", data.error);
        }
      })
      .catch(error => {
        console.error("❌ Error tracking affiliate click:", error);
      });
    }
  }, [affiliateCode]);

  // Show the actual homepage content while maintaining affiliate URL
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">BrightNest</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Discover Your Financial Personality
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Take our comprehensive quiz to understand your financial habits, goals, and personality type.
            </p>
            
            <div className="space-y-4">
              <a
                href="/quiz/financial-profile"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Start Your Financial Profile Quiz
              </a>
              
              <div className="text-sm text-gray-500">
                <p>✅ Affiliate tracking active: {affiliateCode}</p>
                <p>🍪 Cookie set for 30 days</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AffiliateRedirect() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AffiliateRedirectContent />
    </Suspense>
  );
}
