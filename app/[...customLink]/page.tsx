"use client";

import { useEffect, Suspense, useState } from "react";
import { useParams } from "next/navigation";
import SharedHomePage from "../../components/SharedHomePage";

function CustomLinkContent() {
  const params = useParams();
  const customLinkPath = params.customLink as string[];
  const customLink = "/" + customLinkPath.join("/");
  const [isValidLink, setIsValidLink] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (customLink && customLink !== "/") {
      console.log("🎯 Custom tracking link visit detected:", customLink);
      console.log("📊 Checking if custom link is valid...");
      
      // Check if this is a valid custom tracking link
      fetch("/api/track-custom-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          customLink: customLink,
          utm_source: new URLSearchParams(window.location.search).get("utm_source"),
          utm_medium: new URLSearchParams(window.location.search).get("utm_medium"),
          utm_campaign: new URLSearchParams(window.location.search).get("utm_campaign")
        }),
      })
      .then(response => {
        if (response.status === 404) {
          // Not a valid custom link, show 404
          console.error("❌ Invalid custom link - showing 404");
          setIsValidLink(false);
          setIsLoading(false);
          return;
        }
        return response.json();
      })
      .then(data => {
        if (data && data.success) {
          console.log("✅ Custom link click tracked successfully");
          // Set the affiliate cookie for the quiz system
          document.cookie = `affiliate_ref=${data.affiliate.referralCode}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
          setIsValidLink(true);
        } else {
          console.error("❌ Failed to track custom link click:", data?.error);
          setIsValidLink(false);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error("❌ Error tracking custom link click:", error);
        setIsValidLink(false);
        setIsLoading(false);
      });
    } else {
      setIsValidLink(false);
      setIsLoading(false);
    }
  }, [customLink]);

  // Show loading while checking link validity
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying link...</p>
        </div>
      </div>
    );
  }

  // If link is not valid, show 404
  if (!isValidLink) {
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

  // Use the shared homepage component for valid custom links
  return <SharedHomePage />;
}

export default function CustomLinkPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CustomLinkContent />
    </Suspense>
  );
}
