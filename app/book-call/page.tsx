"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";

export default function BookCallPage() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 4,
    seconds: 27
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
      
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-white text-4xl font-bold tracking-wide">
              <span className="font-sans">BRIGHT</span>
              <span className="font-serif italic ml-2">Nest</span>
            </h1>
          </div>

          {/* Main Headline */}
          <div className="text-center mb-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Final Step: Required To Complete Your Application
            </h2>
            <p className="text-white text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
              Congratulations On Taking The First Step! To Finalize Your Application And Determine If Our Money Behavior System™ Is Right For You Please Select A Time Below For Your FREE Financial Transformation Assessment
            </p>
          </div>

          {/* Countdown Timer */}
          <div className="text-center mb-12">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
              <div className="flex justify-center space-x-4 mb-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-white">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <div className="text-white text-sm">Hours</div>
                </div>
                <div className="text-5xl font-bold text-white">:</div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-white">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-white text-sm">Minutes</div>
                </div>
                <div className="text-5xl font-bold text-white">:</div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-white">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-white text-sm">Seconds</div>
                </div>
              </div>
            </div>
          </div>

          {/* Hot Pink Section */}
          <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl p-8 mb-8">
            <div className="text-center">
              {/* Social Proof Images */}
              <div className="flex justify-center space-x-4 mb-6 -mt-16">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
                  </div>
                ))}
              </div>

              <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Schedule Your FREE Financial Transformation Assessment
              </h3>
              
              <div className="flex items-center justify-center space-x-2 text-white">
                <span className="text-2xl">⭐</span>
                <span className="text-lg">
                  +157 People Have Booked Their Assessment In The Past 24 Hours
                </span>
              </div>
            </div>
          </div>

          {/* Calendly Embed Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">
                Select a Date & Time
              </h4>
            </div>
            
            {/* Calendly Inline Widget */}
            <div 
              className="calendly-inline-widget" 
              data-url="https://calendly.com/brightnest-assessment"
              style={{ minWidth: '320px', height: '700px' }}
            ></div>
          </div>

          {/* Back to Results */}
          <div className="text-center mt-8">
            <Link
              href="/results"
              className="text-white hover:text-pink-300 underline"
            >
              ← Back to Your Results
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
