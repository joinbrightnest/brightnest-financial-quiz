"use client";

import { useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import SharedHomePage from "../../components/SharedHomePage";

function AffiliatePageContent() {
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
      .then(response => {
        if (response.status === 410) {
          // Link has been permanently removed
          console.error("❌ This affiliate link has been permanently removed");
          // Redirect to main page without affiliate tracking
          window.location.href = "/";
          return;
        }
        return response.json();
      })
      .then(data => {
        if (data && data.success) {
          console.log("✅ Affiliate click tracked successfully");
        } else if (data && data.error) {
          console.error("❌ Failed to track affiliate click:", data.error);
        }
      })
      .catch(error => {
        console.error("❌ Error tracking affiliate click:", error);
      });
    }
  }, [affiliateCode]);

  // Use the shared homepage component with affiliate code
  return <SharedHomePage affiliateCode={affiliateCode} />;
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
      <AffiliatePageContent />
    </Suspense>
  );
}
