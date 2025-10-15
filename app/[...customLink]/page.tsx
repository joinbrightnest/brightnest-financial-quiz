"use client";

import { useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import SharedHomePage from "../../components/SharedHomePage";

function CustomLinkContent() {
  const params = useParams();
  const customLinkPath = params.customLink as string[];
  const customLink = "/" + customLinkPath.join("/");

  useEffect(() => {
    if (customLink && customLink !== "/") {
      console.log("🎯 Custom tracking link visit detected:", customLink);
      console.log("🍪 Setting affiliate cookie...");
      
      // Track the custom link click
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
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log("✅ Custom link click tracked successfully");
          // Set the affiliate cookie for the quiz system
          document.cookie = `affiliate_ref=${data.affiliate.referralCode}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
        } else {
          console.error("❌ Failed to track custom link click:", data.error);
        }
      })
      .catch(error => {
        console.error("❌ Error tracking custom link click:", error);
      });
    }
  }, [customLink]);

  // Use the shared homepage component (no affiliate code since we're using custom link)
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
