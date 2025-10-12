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

  // Calendly event listener for booking completion
  useEffect(() => {
    const handleCalendlyEvent = (e: any) => {
      if (e.data.event === 'calendly.event_scheduled') {
        // Redirect to confirmation page after successful booking
        window.location.href = '/book-call/confirmation';
      }
    };

    window.addEventListener('message', handleCalendlyEvent);
    
    return () => {
      window.removeEventListener('message', handleCalendlyEvent);
    };
  }, []);

  return (
    <>
      {/* Calendly Script */}
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
      />
      
      <div className="min-h-screen bg-[#F8F7F5]">
        {/* Section 1: Dark Purple Background */}
        <div className="bg-[#333333] py-6 px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <div className="mb-4">
              <h1 className="text-white text-3xl font-bold tracking-wide">
                <span className="font-sans">BRIGHT</span>
                <span className="font-serif italic ml-2">Nest</span>
              </h1>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
              <span className="text-[#4CAF50]">Final Step:</span> Required To Complete Your Application
            </h2>

            {/* Sub-headline */}
            <p className="text-white text-base lg:text-lg max-w-2xl mx-auto leading-relaxed mb-4">
              Congratulations On Taking The First Step! To Finalize Your Application And Determine If Our Money Behavior System™ Is Right For You Please Select A Time Below For Your FREE Financial Transformation Assessment
            </p>

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

        {/* Pink Banner - Overlapping with dark section */}
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

        {/* Calendar Background - Full Width */}
        <div className="max-w-4xl mx-auto px-4 pb-8">
          <div className="bg-white rounded-lg p-6 mb-6 shadow-lg">
            {/* White Card with Calendar Interface */}
            <div className="bg-white rounded-lg shadow-sm max-w-2xl mx-auto p-0">
              {/* Calendly Inline Widget */}
              <div 
                className="calendly-inline-widget" 
                data-url="https://calendly.com/privatepublish/30min?hide_event_type_details=1&embed_domain=joinbrightnest.com&embed_type=Inline"
                style={{ minWidth: '320px', height: '700px' }}
              ></div>
            </div>
            
            {/* Social Proof Section */}
            <div className="text-center mt-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="text-[#333333] font-semibold">Excellent</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className="text-[#4CAF50] text-lg">★</span>
                  ))}
                </div>
                <span className="text-[#333333]">4.9 out of 5 based on 543 reviews</span>
                <span className="text-[#4CAF50]">★</span>
                <span className="text-[#333333]">Trustpilot</span>
              </div>
              <p className="text-[#333333]">
                Can't Find A Time That Works? <span className="text-[#D81B60] cursor-pointer hover:underline">Click Here</span>
              </p>
            </div>
          </div>
        </div>

        {/* Booking Activity Banner */}
        <div className="bg-[#333333] py-6 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#A5D6A7] to-[#C8E6C9] rounded-full"></div>
                  </div>
                ))}
              </div>
              <span className="text-white text-lg font-semibold">
                157 People Have Booked In The Past 24 Hours
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#333333] py-8 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-4">
              <h1 className="text-white text-2xl font-bold tracking-wide">
                <span className="font-sans">BRIGHT</span>
                <span className="font-serif italic ml-2">Nest</span>
              </h1>
            </div>
            <div className="text-white">
              <Link href="/privacy" className="hover:text-[#4CAF50]">Privacy Policy</Link>
              <span className="mx-2">|</span>
              <Link href="/terms" className="hover:text-[#4CAF50]">Terms and Conditions</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
