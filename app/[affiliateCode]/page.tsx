"use client";

import { useEffect, Suspense } from "react";
import { useParams } from "next/navigation";

function AffiliateRedirectContent() {
  const params = useParams();
  const affiliateCode = params.affiliateCode as string;

  useEffect(() => {
    if (affiliateCode) {
      console.log("Affiliate visit detected:", affiliateCode);
      
      // Set the affiliate cookie for the quiz system (don't track click yet)
      document.cookie = `affiliate_ref=${affiliateCode}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      
      // Just redirect to homepage without tracking click
      window.location.href = "/";
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
