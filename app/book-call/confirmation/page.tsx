"use client";

import Link from "next/link";

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Section 1: Dark Purple Background */}
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-white text-3xl font-bold tracking-wide">
              <span className="font-sans">BRIGHT</span>
              <span className="font-serif italic ml-2">Nest</span>
            </h1>
          </div>

          {/* Main Headline */}
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8 leading-tight">
            CONGRATULATIONS!
          </h2>

          {/* Confirmation Banner */}
          <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg py-4 px-6 max-w-2xl mx-auto mb-8">
            <p className="text-white text-xl font-semibold">
              Confirmed: Your Financial Transformation Assessment Has Been Booked
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Pink Banner - Wider */}
      <div className="relative -mt-8 z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-t-3xl py-6 px-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">
                ✨ IMPORTANT NEXT STEPS:
              </h3>
              <p className="text-white text-lg">
                Watch The Short 3 Minute Video & Complete Pre-Call Checklist To Confirm Your Appointment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: White Card with Video */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-b-lg shadow-2xl overflow-hidden">
          {/* Video Section */}
          <div className="p-6">
            <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
              {/* Video Thumbnail */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                {/* Video Content Placeholder */}
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold mb-2">Pre-Call Preparation Video</h4>
                  <p className="text-gray-300 text-sm">
                    Learn what to expect and how to prepare for your Financial Transformation Assessment
                  </p>
                </div>
              </div>
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-pink-600 hover:to-pink-700 transition-colors">
                  <svg className="w-6 h-6 ml-1 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Video Description */}
            <div className="mt-6 text-center">
              <h5 className="text-lg font-semibold text-gray-900 mb-2">
                What You'll Learn:
              </h5>
              <ul className="text-gray-700 text-sm space-y-1">
                <li>• How to prepare your financial documents</li>
                <li>• What to expect during your assessment</li>
                <li>• Key questions we'll discuss</li>
                <li>• Next steps after your call</li>
              </ul>
            </div>

            {/* Checklist Section */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h6 className="font-semibold text-gray-900 mb-3">Pre-Call Checklist:</h6>
              <div className="space-y-2">
                {[
                  "Gather recent bank statements",
                  "List your current financial goals",
                  "Note any specific money challenges",
                  "Prepare questions about our Money Behavior System™"
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-pink-500 rounded"></div>
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="mt-6 text-center">
              <p className="text-gray-700 text-sm">
                Questions? Contact us at{" "}
                <a href="mailto:support@brightnest.com" className="text-pink-600 hover:underline">
                  support@brightnest.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
