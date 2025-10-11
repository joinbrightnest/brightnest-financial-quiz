"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ConfirmationPage() {
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
    <div className="min-h-screen bg-[#F8F7F5]">
      {/* Section 1: Dark Charcoal Background */}
      <div className="bg-[#333333] py-6 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Countdown Timer */}
          <div className="mb-6">
            <div className="flex justify-center space-x-3">
              <div className="text-center">
                <div className="text-4xl font-bold text-white">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-white text-sm mt-1">Hours</div>
              </div>
              <div className="text-4xl font-bold text-white">:</div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-white text-sm mt-1">Minutes</div>
              </div>
              <div className="text-4xl font-bold text-white">:</div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-white text-sm mt-1">Seconds</div>
              </div>
            </div>
          </div>

          {/* Social Proof Images */}
          <div className="flex justify-center space-x-3 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <div className="w-10 h-10 bg-gradient-to-br from-[#A5D6A7] to-[#C8E6C9] rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Green Banner - Overlapping */}
      <div className="relative -mt-8 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-[#4CAF50] rounded-t-3xl py-6 px-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">
                Schedule Your FREE Financial Transformation Assessment
              </h3>
              
              <div className="flex items-center justify-center space-x-2 text-white">
                <span className="text-xl">⭐</span>
                <span className="text-base">
                  + 157 People Have Booked Their Assessment In The Past 24 Hours
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: White Card with Confirmation Details */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-b-lg shadow-2xl max-w-2xl mx-auto overflow-hidden relative">
          {/* Powered by Calendly Ribbon */}
          <div className="absolute top-0 right-0 bg-gray-800 text-white text-xs px-3 py-1 transform rotate-45 translate-x-6 -translate-y-2 z-10">
            POWERED BY Calendly
          </div>

          <div className="p-6 pt-12">
            {/* Confirmation Status */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-[#333333] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-[#4CAF50]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span className="text-[#333333] font-semibold">You are scheduled</span>
              </div>
            </div>

            {/* Open Invitation Button */}
            <button className="bg-[#4CAF50] text-white px-4 py-2 rounded-lg flex items-center space-x-2 mb-4 hover:bg-[#45a049] transition-colors">
              <span>Open Invitation</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>

            <p className="text-[#333333] text-sm mb-6">
              A calendar invitation has been sent to your email address.
            </p>

            {/* Meeting Details */}
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-[#333333]">Financial Transformation Assessment</h4>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-[#333333]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <span className="text-[#333333]">BRIGHT Nest</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-[#333333]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                  <span className="text-[#333333]">19:00 - 19:30, Thursday, October 16, 2025</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-[#333333]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span className="text-[#333333]">Eastern European Time</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-[#333333]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                  </svg>
                  <span className="text-[#333333]">Web conferencing details to follow.</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h5 className="font-semibold text-[#333333] mb-3">What happens next?</h5>
              <div className="space-y-2 text-sm text-[#333333]">
                <p>• You'll receive a calendar invitation via email</p>
                <p>• We'll send you a pre-call preparation guide</p>
                <p>• Join the call at your scheduled time</p>
                <p>• Get your personalized financial transformation plan</p>
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
