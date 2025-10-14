"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import HomePageContent from "../components/HomePageContent";

function HomePageContentWrapper() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle affiliate tracking from URL path
    const pathname = window.location.pathname;
    const affiliateCode = pathname.substring(1); // Remove leading slash
    
    // Check if this looks like an affiliate code (not a regular page)
    // Exclude known page routes
    const knownRoutes = ['affiliates', 'admin', 'quiz', 'results', 'analyzing', 'book-call'];
    if (affiliateCode && 
        !affiliateCode.includes('/') && 
        !affiliateCode.includes('.') && 
        affiliateCode.length > 3 &&
        !knownRoutes.includes(affiliateCode)) {
      
      console.log("Tracking affiliate visit:", affiliateCode);
      
      // Set the affiliate cookie for the quiz system
      document.cookie = `affiliate_ref=${affiliateCode}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      
      // Track the affiliate click using the track-affiliate API
      fetch("/api/track-affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ref: affiliateCode,
          utm_source: new URLSearchParams(window.location.search).get("utm_source"),
          utm_medium: new URLSearchParams(window.location.search).get("utm_medium"),
          utm_campaign: new URLSearchParams(window.location.search).get("utm_campaign")
        }),
      }).then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log("✅ Affiliate click tracked successfully");
        } else {
          console.error("❌ Failed to track affiliate click:", data.error);
        }
      }).catch(error => {
        console.error("❌ Error tracking affiliate click:", error);
      });
      
      // Don't redirect - stay on the affiliate URL
    }
  }, []);

  return <HomePageContent />;
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <HomePageContentWrapper />
    </Suspense>
  );
}