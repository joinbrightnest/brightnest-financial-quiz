"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AffiliateHeader from "../components/AffiliateHeader";

// Prevent prerendering since this page requires authentication
export const dynamic = 'force-dynamic';

interface AffiliateData {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  tier: string;
  commissionRate: number;
  isApproved: boolean;
  totalClicks: number;
  totalLeads: number;
  totalCommission: number;
  createdAt: string;
}

export default function AffiliateLinksPage() {
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
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

  const handleLogout = () => {
    localStorage.removeItem("affiliate_token");
    localStorage.removeItem("affiliate_id");
    router.push("/affiliates/login");
  };

  const generateCustomLink = () => {
    if (!affiliate) return "";
    const baseLink = `https://joinbrightnest.com/${affiliate.referralCode}`;
    const params = new URLSearchParams();
    if (utmSource) params.append("utm_source", utmSource);
    if (utmMedium) params.append("utm_medium", utmMedium);
    if (utmCampaign) params.append("utm_campaign", utmCampaign);
    
    return params.toString() ? `${baseLink}?${params.toString()}` : baseLink;
  };

  // Don't render anything until mounted to prevent SSR issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading links...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600">Please log in to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <AffiliateHeader affiliate={affiliate} onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg mr-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            Links & Assets
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage your affiliate links and marketing materials
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Your Affiliate Link */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 sm:p-8 hover:shadow-xl transition-all duration-300"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-2 sm:mr-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              Your Affiliate Link
            </h2>
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
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-l-xl bg-white/50 backdrop-blur-sm text-sm text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => affiliate && navigator.clipboard.writeText(`https://joinbrightnest.com/${affiliate.referralCode}`)}
                    className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-r-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 font-medium"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Custom UTM Parameters */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 sm:p-8 hover:shadow-xl transition-all duration-300"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg mr-2 sm:mr-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              Custom UTM Parameters
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UTM Source (e.g., youtube)
                </label>
                <input
                  type="text"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-black placeholder-gray-500 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-black placeholder-gray-500 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-black placeholder-gray-500 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="jan2024"
                />
              </div>
              
              <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg font-medium">
                Generate Link
              </button>
              
              {generateCustomLink() && generateCustomLink() !== `https://joinbrightnest.com/${affiliate?.referralCode}` && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 p-4 bg-gradient-to-r from-green-50 to-white rounded-xl border border-green-200/50"
                >
                  <div className="text-sm font-semibold text-green-700 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Generated Link:
                  </div>
                  <div className="text-sm text-gray-600 break-all bg-white/50 p-2 rounded-lg border border-gray-200">{generateCustomLink()}</div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
