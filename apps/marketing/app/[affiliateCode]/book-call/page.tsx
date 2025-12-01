"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AffiliateBookCallPage() {
  const params = useParams();
  const router = useRouter();
  const affiliateCode = params.affiliateCode as string;

  useEffect(() => {
    if (affiliateCode) {
      console.log("🎯 Affiliate book-call page visit detected:", affiliateCode);
      console.log("🍪 Setting affiliate cookie...");

      // Set affiliate cookie with 30-day expiration
      const maxAge = 30 * 24 * 60 * 60; // 30 days in seconds
      document.cookie = `affiliate_ref=${affiliateCode}; path=/; max-age=${maxAge}; SameSite=Lax`;

      console.log("✅ Affiliate cookie set successfully");
      console.log("🔄 Redirecting to standard booking page...");

      // Preserve query parameters during redirect for tracking
      const queryString = window.location.search;
      const targetUrl = queryString ? `/book-call${queryString}` : "/book-call";

      router.replace(targetUrl);
    }
  }, [affiliateCode, router]);

  // Show loading state while redirecting
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "#F8F7F5",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999
    }}>
      <div style={{
        width: "50px",
        height: "50px",
        border: "4px solid #4CAF50",
        borderTop: "4px solid transparent",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
      }}></div>
      <p style={{
        marginTop: "20px",
        color: "#333333",
        fontSize: "18px",
        fontWeight: 500
      }}>Loading booking page...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
