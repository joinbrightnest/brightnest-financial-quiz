"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";

export default function BookCallPage() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 0, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Calendly Script */}
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
      />
      
      <div className="min-h-screen bg-white">
        {/* Section 1: Dark Purple Background */}
        <div className="bg-[#4A006F] py-6 px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <div className="mb-4">
              <h1 className="text-white text-2xl font-bold tracking-wide">
                <span className="font-sans">BRIGHT</span>
                <span className="font-serif italic ml-2">Nest</span>
              </h1>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3 leading-tight">
              <span className="text-[#D81B60]">Final Step:</span> Required To Complete Your Application
            </h2>

            {/* Sub-headline */}
            <p className="text-white text-sm lg:text-base max-w-2xl mx-auto leading-relaxed mb-4">
              Congratulations On Taking The First Step! To Finalize Your Application And Determine If Our Money Behavior System™ Is Right For You Please Select A Time Below For Your FREE Financial Transformation Assessment
            </p>

            {/* Countdown Timer */}
            <div className="mb-6">
              <div className="flex justify-center space-x-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <div className="text-white text-xs mt-1">Hours</div>
                </div>
                <div className="text-3xl font-bold text-white">:</div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-white text-xs mt-1">Minutes</div>
                </div>
                <div className="text-3xl font-bold text-white">:</div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-white text-xs mt-1">Seconds</div>
                </div>
              </div>
            </div>

            {/* Social Proof Images */}
            <div className="flex justify-center space-x-3 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#6A1B9A] to-[#F06292] rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pink Banner - Overlapping with dark section */}
        <div className="relative -mt-8 z-10">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-[#D81B60] rounded-t-3xl py-4 px-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">
                  Schedule Your FREE Financial Transformation Assessment
                </h3>
                
                <div className="flex items-center justify-center space-x-2 text-white">
                  <span className="text-lg">⭐</span>
                  <span className="text-sm">
                    + 157 People Have Booked Their Assessment In The Past 24 Hours
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Background - Full Width */}
        <div className="max-w-4xl mx-auto px-4 pb-8">
          <div className="bg-gray-50 rounded-lg p-6 mb-6 relative">
            {/* Powered by Calendly Ribbon */}
            <div className="absolute top-0 right-0 bg-gray-800 text-white text-xs px-3 py-1 transform rotate-45 translate-x-6 -translate-y-2 z-10">
              POWERED BY Calendly
            </div>
            
            {/* White Card with Calendar Header */}
            <div className="bg-white rounded-lg shadow-sm max-w-2xl mx-auto p-6 mb-6">
              <h4 className="text-xl font-bold text-gray-900 text-center">
                Select a Date & Time
              </h4>
            </div>
            
            {/* White Card with Calendar Interface */}
            <div className="bg-white rounded-lg shadow-sm max-w-2xl mx-auto p-0">
              {/* Calendly Inline Widget */}
              <div 
                className="calendly-inline-widget" 
                data-url="https://calendly.com/privatepublish/30min?hide_event_type_details=1"
                style={{ minWidth: '320px', height: '700px' }}
              ></div>
            </div>
          </div>
        </div>

        {/* Back to Results */}
        <div className="text-center mt-6">
          <Link
            href="/results"
            className="text-gray-600 hover:text-gray-800 underline"
          >
            ← Back to Your Results
          </Link>
        </div>
      </div>
    </>
  );
}
