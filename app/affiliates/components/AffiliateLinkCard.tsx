"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface AffiliateData {
  id: string;
  name: string;
  email: string;
  tier: string;
  referralCode: string;
  customLink: string;
  commissionRate: number;
  totalClicks: number;
  totalLeads: number;
  totalBookings: number;
  totalSales: number;
  totalCommission: number;
  isApproved: boolean;
}

interface AffiliateLinkCardProps {
  affiliate: AffiliateData;
  loading: boolean;
}

export default function AffiliateLinkCard({ affiliate, loading }: AffiliateLinkCardProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(affiliate.customLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Your Affiliate Link
        </h3>
        <div className="text-sm text-gray-500">
          Referral Code: {affiliate.referralCode}
        </div>
      </div>

      <div className="space-y-4">
        {/* Main Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Tracking Link
          </label>
          <div className="flex">
            <input
              type="text"
              value={affiliate.customLink}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm font-mono text-gray-900"
            />
            <button
              onClick={copyToClipboard}
              className={`px-4 py-2 border border-l-0 border-gray-300 rounded-r-md text-sm font-medium transition-colors ${
                copied
                  ? "bg-green-50 text-green-700 border-green-300"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* UTM Builder */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom UTM Parameters
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="utm_source (e.g., youtube)"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
            />
            <input
              type="text"
              placeholder="utm_medium (e.g., video)"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
            />
            <input
              type="text"
              placeholder="utm_campaign (e.g., jan2024)"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
            />
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
              Generate Link
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Link Performance</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-lg font-bold text-blue-600">
                {affiliate.totalClicks.toLocaleString()}
              </p>
              <p className="text-xs text-blue-500">Total Clicks</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-lg font-bold text-green-600">
                {affiliate.totalLeads.toLocaleString()}
              </p>
              <p className="text-xs text-green-500">Leads Generated</p>
            </div>
          </div>
        </div>

        {/* Commission Info */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Commission Rate</p>
              <p className="text-lg font-bold text-green-600">
                {(affiliate.commissionRate * 100).toFixed(0)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">Total Earned</p>
              <p className="text-lg font-bold text-green-600">
                ${affiliate.totalCommission.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
