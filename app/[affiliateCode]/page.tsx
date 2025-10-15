"use client";

import { useEffect, Suspense, useState } from "react";
import { useParams } from "next/navigation";
import SharedHomePage from "../../components/SharedHomePage";

function AffiliatePageContent() {
  const params = useParams();
  const affiliateCode = params.affiliateCode as string;
  const [isValidAffiliate, setIsValidAffiliate] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (affiliateCode) {
      console.log("🎯 Checking if affiliate code is valid:", affiliateCode);
      
      // First validate that this is a legitimate affiliate before doing anything
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
        if (response.status === 404) {
          // Not a valid affiliate code, show 404
          console.error("❌ Invalid affiliate code - showing 404");
          setIsValidAffiliate(false);
          setIsLoading(false);
          return;
        }
        if (response.status === 410) {
          // Link has been permanently removed
          console.error("❌ This affiliate link has been permanently removed");
          setIsValidAffiliate(false);
          setIsLoading(false);
          return;
        }
        return response.json();
      })
      .then(data => {
        if (data && data.success) {
          console.log("✅ Valid affiliate code - setting cookie and tracking");
          // Set the affiliate cookie for the quiz system
          document.cookie = `affiliate_ref=${affiliateCode}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
          console.log("✅ Affiliate cookie set successfully");
          setIsValidAffiliate(true);
        } else {
          console.error("❌ Invalid affiliate code:", data?.error);
          setIsValidAffiliate(false);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error("❌ Error validating affiliate code:", error);
        setIsValidAffiliate(false);
        setIsLoading(false);
      });
    } else {
      setIsValidAffiliate(false);
      setIsLoading(false);
    }
  }, [affiliateCode]);

  // Show loading while checking affiliate validity
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying affiliate link...</p>
        </div>
      </div>
    );
  }

  // If not a valid affiliate, show 404
  if (!isValidAffiliate) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
          <a 
            href="/" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  // Use the shared homepage component with affiliate code for valid affiliates
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
