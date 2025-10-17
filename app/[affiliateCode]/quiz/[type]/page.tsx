"use client";

import { useParams } from "next/navigation";

function AffiliateQuizContent() {
  const params = useParams();
  const affiliateCode = params.affiliateCode as string;
  const quizType = params.type as string;

  // Immediate redirect without waiting for React to render
  if (affiliateCode && quizType) {
    console.log("🎯 Affiliate quiz visit detected:", { affiliateCode, quizType });
    
    // Set the affiliate cookie for the quiz system
    document.cookie = `affiliate_ref=${affiliateCode}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
    
    console.log("✅ Affiliate cookie set for quiz");
    
    // IMMEDIATE redirect using window.location.replace (no React delay)
    const newUrl = `/quiz/${quizType}?affiliate=${affiliateCode}`;
    window.location.replace(newUrl);
    
    // Track the affiliate click for quiz start (async, don't wait for it)
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
        console.log("✅ Affiliate quiz click tracked successfully");
      } else {
        console.error("❌ Failed to track affiliate quiz click:", data.error);
      }
    })
    .catch(error => {
      console.error("❌ Error tracking affiliate quiz click:", error);
    });
  }

  // Return null to avoid showing any loading screen
  return null;
}

export default function AffiliateQuiz() {
  return <AffiliateQuizContent />;
}
