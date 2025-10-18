"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AffiliateLinksPage() {
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [affiliate, setAffiliate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("affiliate_token");
      const affiliateId = localStorage.getItem("affiliate_id");
      
      if (!token || !affiliateId) {
        router.push("/affiliates/login");
        return;
      }

      try {
        const response = await fetch("/api/affiliate/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const affiliateData = await response.json();
          setAffiliate(affiliateData);
        } else {
          router.push("/affiliates/login");
          return;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/affiliates/login");
        return;
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const generateCustomLink = () => {
    if (!affiliate) return "";
    const baseLink = `https://joinbrightnest.com/${affiliate.referralCode}`;
    const params = new URLSearchParams();
    if (utmSource) params.append("utm_source", utmSource);
    if (utmMedium) params.append("utm_medium", utmMedium);
    if (utmCampaign) params.append("utm_campaign", utmCampaign);
    
    return params.toString() ? `${baseLink}?${params.toString()}` : baseLink;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Links & Assets</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your affiliate links and marketing materials
              </p>
            </div>
            <Link
              href="/affiliates/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Your Affiliate Link */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Affiliate Link</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referral Code
                </label>
                <div className="text-sm text-gray-900">{affiliate?.referralCode || "Loading..."}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Tracking Link
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={affiliate ? `https://joinbrightnest.com/${affiliate.referralCode}` : "Loading..."}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm text-black"
                  />
                  <button
                    onClick={() => affiliate && navigator.clipboard.writeText(`https://joinbrightnest.com/${affiliate.referralCode}`)}
                    className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 text-black"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Custom UTM Parameters */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Custom UTM Parameters</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UTM Source (e.g., youtube)
                </label>
                <input
                  type="text"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black placeholder-gray-500"
                  placeholder="youtube"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UTM Medium (e.g., video)
                </label>
                <input
                  type="text"
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black placeholder-gray-500"
                  placeholder="video"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UTM Campaign (e.g., jan2024)
                </label>
                <input
                  type="text"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black placeholder-gray-500"
                  placeholder="jan2024"
                />
              </div>
              
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                Generate Link
              </button>
              
              {generateCustomLink() && generateCustomLink() !== `https://joinbrightnest.com/${affiliate?.referralCode}` && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <div className="text-sm font-medium text-gray-700 mb-1">Generated Link:</div>
                  <div className="text-sm text-gray-600 break-all">{generateCustomLink()}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
