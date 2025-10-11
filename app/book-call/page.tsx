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
      
      <div className="min-h-screen bg-white">
      {/* Top Section - Dark Background */}
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-white text-3xl font-bold tracking-wide">
              <span className="font-sans">BRIGHT</span>
              <span className="font-serif italic ml-2">Nest</span>
            </h1>
          </div>

          {/* Main Title */}
          <h2 className="text-4xl lg:text-5xl font-bold text-pink-300 mb-6">
            Final Step: Required To Complete Your Application
          </h2>

          {/* Subtitle */}
          <p className="text-white text-lg lg:text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Congratulations On Taking The First Step! To Finalize Your Application And Determine If Our Money Behavior System™ Is Right For You Please Select A Time Below For Your FREE Financial Transformation Assessment
          </p>

          {/* Countdown Timer */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
            <div className="flex justify-center space-x-4 mb-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-white">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-white text-sm">Hours</div>
              </div>
              <div className="text-4xl font-bold text-white">:</div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-white text-sm">Minutes</div>
              </div>
              <div className="text-4xl font-bold text-white">:</div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-white text-sm">Seconds</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mid-Section - Hot Pink Bar */}
      <div className="bg-gradient-to-r from-pink-500 to-pink-600 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Social Proof Images */}
          <div className="flex justify-center space-x-4 mb-6 -mt-8">
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

      {/* Bottom Section - Booking Calendar */}
      <div className="bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h4 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Select a Date & Time
          </h4>

          {/* Calendar Widget Placeholder */}
          <div className="bg-gray-50 rounded-xl p-8 mb-8">
            <div className="text-center">
              <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <button className="text-gray-500 hover:text-gray-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h5 className="text-lg font-semibold text-gray-900">October 2025</h5>
                  <button className="text-gray-500 hover:text-gray-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Days of Week */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                    <div key={day} className="text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <div
                      key={day}
                      className={`text-sm py-2 px-3 rounded-lg cursor-pointer ${
                        day === 12 
                          ? 'bg-pink-500 text-white font-bold' 
                          : day === 13 || day === 14
                          ? 'bg-pink-100 text-pink-700 font-semibold'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Time Zone Selector */}
          <div className="text-center mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time zone
            </label>
            <select className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
              <option>Select your timezone</option>
              <option>Eastern Time (ET)</option>
              <option>Central Time (CT)</option>
              <option>Mountain Time (MT)</option>
              <option>Pacific Time (PT)</option>
            </select>
          </div>

          {/* Calendly Integration */}
          <div className="bg-gray-50 rounded-xl p-8">
            <div className="text-center mb-6">
              <h5 className="text-xl font-semibold text-gray-900 mb-2">
                Ready to Book Your Assessment?
              </h5>
              <p className="text-gray-600">
                Click below to open our booking calendar and select your preferred time slot.
              </p>
            </div>

            {/* Calendly Widget */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center mb-6">
                <div 
                  className="inline-block bg-pink-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-pink-600 transition-colors cursor-pointer shadow-lg"
                  onClick={() => {
                    // @ts-ignore
                    if (window.Calendly) {
                      // @ts-ignore
                      window.Calendly.initPopupWidget({
                        url: 'https://calendly.com/brightnest-assessment'
                      });
                    }
                  }}
                >
                  Open Booking Calendar
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Powered by Calendly • Secure & Private
                </p>
              </div>
              
              {/* Calendly Inline Widget */}
              <div 
                className="calendly-inline-widget" 
                data-url="https://calendly.com/brightnest-assessment"
                style={{ minWidth: '320px', height: '700px' }}
              ></div>
            </div>
          </div>

          {/* Back to Results */}
          <div className="text-center mt-8">
            <Link
              href="/results"
              className="text-pink-600 hover:text-pink-700 underline"
            >
              ← Back to Your Results
            </Link>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
