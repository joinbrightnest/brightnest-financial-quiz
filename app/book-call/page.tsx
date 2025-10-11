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
        <div className="bg-[#5C004D] py-6 px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <div className="mb-4">
              <h1 className="text-white text-2xl font-bold tracking-wide">
                <span className="font-sans">WARRIOR</span>
                <span className="font-serif italic ml-2 text-lg">Babe</span>
              </h1>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3 leading-tight">
              <span className="text-[#FF007F]">Final Step:</span> Required To Complete Your Application
            </h2>

            {/* Sub-headline */}
            <p className="text-white text-sm lg:text-base max-w-2xl mx-auto leading-relaxed mb-4">
              Congratulations On Taking The First Step! To Finalize Your Application And Determine If Our WB4 Method™ Is Right For You Please Select A Time Below For Your FREE Body Transformation Assessment
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
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pink Banner - Overlapping with dark section */}
        <div className="relative -mt-8 z-10">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-[#FF007F] rounded-t-3xl py-4 px-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">
                  Schedule Your FREE Body Transformation Assessment
                </h3>
                
                <div className="flex items-center justify-center space-x-2 text-white">
                  <span className="text-lg">⭐</span>
                  <span className="text-sm">
                    + 157 Women Have Booked Their Assessment In The Past 24 Hours
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Background - Full Width */}
        <div className="max-w-4xl mx-auto px-4 pb-8">
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            {/* White Card with Calendar Header */}
            <div className="bg-white rounded-lg shadow-sm max-w-2xl mx-auto p-6 mb-6">
              <h4 className="text-xl font-bold text-gray-900 mb-6">
                Select a Date & Time
              </h4>
            </div>
            
            {/* Calendar Interface */}
            <div className="bg-white rounded-lg shadow-sm max-w-2xl mx-auto p-6">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-center mb-4">
                    <button className="text-gray-600 hover:text-gray-800 mr-4">
                      ←
                    </button>
                    <h5 className="text-lg font-semibold text-gray-900">October 2025</h5>
                    <button className="text-gray-600 hover:text-gray-800 ml-4">
                      →
                    </button>
                  </div>
                  
                  {/* Days of Week */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
                      <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: 1 }, (_, i) => (
                      <div key={`empty-${i}`} className="h-10"></div>
                    ))}
                    
                    {/* Calendar days */}
                    {Array.from({ length: 31 }, (_, i) => {
                      const day = i + 1;
                      const isAvailable = day >= 12 && day <= 14;
                      const isSelected = day === 12;
                      
                      return (
                        <div key={day} className="h-10 flex items-center justify-center">
                          <div className={`
                            w-8 h-8 flex items-center justify-center text-sm font-medium rounded-full
                            ${isAvailable 
                              ? 'bg-pink-100 text-gray-900 hover:bg-pink-200 cursor-pointer' 
                              : 'text-gray-600'
                            }
                            ${isSelected ? 'bg-pink-200' : ''}
                          `}>
                            {day}
                            {isSelected && (
                              <div className="absolute w-1 h-1 bg-pink-500 rounded-full mt-4"></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Time Zone */}
                  <div className="text-left text-sm text-gray-600 mt-4">
                    Time zone
                  </div>
            </div>
            
            {/* Calendly Inline Widget */}
            <div 
              className="calendly-inline-widget" 
              data-url="https://calendly.com/brightnest-assessment"
              style={{ minWidth: '320px', height: '600px' }}
            ></div>
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
