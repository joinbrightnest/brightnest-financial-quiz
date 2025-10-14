"use client";

import { useEffect, Suspense } from "react";
import { useParams } from "next/navigation";

function AffiliateRedirectContent() {
  const params = useParams();
  const affiliateCode = params.affiliateCode as string;

  useEffect(() => {
    if (affiliateCode) {
      console.log("Tracking affiliate visit:", affiliateCode);
      
      // Set the affiliate cookie for the quiz system
      document.cookie = `affiliate_ref=${affiliateCode}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      
      // Track the affiliate click using the existing quiz start API
      fetch("/api/quiz/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          quizType: "financial-profile",
          affiliateCode: affiliateCode
        }),
      }).then(() => {
        // Redirect to homepage after tracking
        window.location.href = "/";
      }).catch(console.error);
    }
  }, [affiliateCode]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to BrightNest...</p>
      </div>
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
