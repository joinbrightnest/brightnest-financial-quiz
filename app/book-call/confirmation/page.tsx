"use client";

import Link from "next/link";

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F5]">
      {/* Section 1: Dark Charcoal Background */}
      <div className="bg-gradient-to-br from-[#333333] via-[#2a2a2a] to-[#333333] py-10 px-4 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#4CAF50] rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-[#4CAF50] rounded-full blur-2xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Logo */}
          <div className="mb-4">
            <h1 className="text-white text-3xl font-bold tracking-wide drop-shadow-lg">
              <span className="font-sans">BRIGHT</span>
              <span className="font-serif italic ml-2">Nest</span>
            </h1>
          </div>

          {/* Main Headline */}
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            <span className="text-[#4CAF50] drop-shadow-2xl text-shadow-lg bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] bg-clip-text text-transparent">
              CONGRATULATIONS!
            </span>
          </h2>

          {/* Confirmation Banner */}
          <div className="bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] rounded-xl py-4 px-6 max-w-2xl mx-auto mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <p className="text-white text-xl font-semibold drop-shadow-md">
              Confirmed: Your Financial Transformation Assessment Has Been Booked
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Green Banner - Wider */}
      <div className="relative -mt-8 z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] rounded-t-3xl py-6 px-8 shadow-2xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full blur-xl"></div>
            </div>
            
            <div className="text-center relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                ✨ IMPORTANT NEXT STEPS:
              </h3>
              <p className="text-white text-lg drop-shadow-md">
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
            <div className="relative bg-gradient-to-br from-[#2a2a2a] via-[#333333] to-[#2a2a2a] rounded-lg overflow-hidden aspect-video shadow-2xl">
              {/* Video Thumbnail */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] via-[#333333] to-[#2a2a2a] flex items-center justify-center relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#4CAF50] rounded-full blur-3xl"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-[#4CAF50] rounded-full blur-2xl"></div>
                </div>
                
                {/* Video Content Placeholder */}
                <div className="text-center text-white relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl transform hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold mb-2 drop-shadow-lg">Pre-Call Preparation Video</h4>
                  <p className="text-gray-300 text-sm drop-shadow-md">
                    Learn what to expect and how to prepare for your Financial Transformation Assessment
                  </p>
                </div>
              </div>
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-20 h-20 bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 hover:shadow-3xl transition-all duration-300 transform">
                  <svg className="w-8 h-8 ml-1 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Video Description */}
            <div className="mt-6 text-center">
              <h5 className="text-lg font-semibold text-[#333333] mb-2">
                What You'll Learn:
              </h5>
              <ul className="text-[#333333] text-sm space-y-1">
                <li>• How to prepare your financial documents</li>
                <li>• What to expect during your assessment</li>
                <li>• Key questions we'll discuss</li>
                <li>• Next steps after your call</li>
              </ul>
            </div>

            {/* Checklist Section */}
            <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg border border-gray-200">
              <h6 className="font-semibold text-[#333333] mb-4 text-lg drop-shadow-sm">Pre-Call Checklist:</h6>
              <div className="space-y-3">
                {[
                  "Gather recent bank statements",
                  "List your current financial goals",
                  "Note any specific money challenges",
                  "Prepare questions about our Money Behavior System™"
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200">
                    <div className="w-5 h-5 border-2 border-[#4CAF50] rounded-full bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] flex items-center justify-center shadow-sm">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </div>
                    <span className="text-[#333333] text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="mt-6 text-center">
              <p className="text-[#333333] text-sm">
                Questions? Contact us at{" "}
                <a href="mailto:support@brightnest.com" className="text-[#4CAF50] hover:underline">
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
