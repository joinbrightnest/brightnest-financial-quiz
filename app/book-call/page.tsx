"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";

// Declare Calendly global
declare global {
  interface Window {
    Calendly: {
      initInlineWidget: (options: { url: string; parentElement: HTMLElement }) => void;
    };
  }
}

export default function BookCallPage() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [calendlyUrl, setCalendlyUrl] = useState("https://calendly.com/privatepublish/30min?hide_event_type_details=1&hide_gdpr_banner=1&hide_landing_page_details=1&embed_domain=joinbrightnest.com&embed_type=Inline");
  const [activeCloser, setActiveCloser] = useState<{id: string, name: string, calendlyLink: string} | null>(null);

  // Fetch active closer's Calendly link
  useEffect(() => {
    const fetchActiveCloser = async () => {
      try {
        const response = await fetch('/api/closer/active-calendly');
        const data = await response.json();
        
        if (data.success && data.closer) {
          console.log("🎯 Found active closer:", data.closer);
          setActiveCloser(data.closer);
          // Update Calendly URL to use closer's link - use exact same format as working default
          const closerCalendlyUrl = `${data.closer.calendlyLink}?hide_event_type_details=1&hide_gdpr_banner=1&hide_landing_page_details=1&embed_domain=joinbrightnest.com&embed_type=Inline`;
          setCalendlyUrl(closerCalendlyUrl);
          console.log("🔄 Using closer's Calendly:", closerCalendlyUrl);
          
          // Force Calendly widget to reload with new URL
          setTimeout(() => {
            const widget = document.querySelector('.calendly-inline-widget');
            if (widget) {
              // Remove the old widget
              widget.innerHTML = '';
              // Create new widget with updated URL
              const newWidget = document.createElement('div');
              newWidget.className = 'calendly-inline-widget';
              newWidget.setAttribute('data-url', closerCalendlyUrl);
              newWidget.style.minWidth = '320px';
              newWidget.style.height = '700px';
              widget.parentNode?.replaceChild(newWidget, widget);
              
              // Reinitialize Calendly
              if (window.Calendly) {
                window.Calendly.initInlineWidget({
                  url: closerCalendlyUrl,
                  parentElement: newWidget
                });
              }
              console.log("🔄 Calendly widget reloaded with new URL");
            }
          }, 100);
        } else {
          console.log("ℹ️ No active closer found, using default Calendly");
        }
      } catch (error) {
        console.error("❌ Error fetching active closer:", error);
      }
    };

    fetchActiveCloser();
  }, []);

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
    const handleCalendlyEvent = async (e: any) => {
      if (e.data.event === 'calendly.event_scheduled') {
        console.log("🎯 Calendly booking completed:", e.data);
        
        // Get affiliate code from cookie
        const affiliateCode = document.cookie
          .split('; ')
          .find(row => row.startsWith('affiliate_ref='))
          ?.split('=')[1];

        // Track the booking if there's an affiliate
        if (affiliateCode) {
          try {
            console.log("📞 Tracking booking for affiliate:", affiliateCode);
            await fetch('/api/track-booking', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                affiliateCode,
                bookingDetails: {
                  eventType: e.data.event,
                  scheduledAt: new Date().toISOString(),
                  calendlyEvent: e.data.payload?.event || null,
                  closerId: activeCloser?.id || null, // Include closer ID for auto-assignment
                }
              }),
            });
            console.log("✅ Booking tracked successfully");
          } catch (error) {
            console.error("❌ Error tracking booking:", error);
          }
        } else {
          console.log("ℹ️ No affiliate code found for booking");
        }

        // Also track the booking for closer assignment (even without affiliate)
        if (activeCloser) {
          try {
            console.log("🎯 Auto-assigning booking to closer:", activeCloser.name);
            await fetch('/api/track-closer-booking', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                closerId: activeCloser.id,
                calendlyEvent: e.data.payload?.event || null,
                affiliateCode: affiliateCode || null,
              }),
            });
            console.log("✅ Booking auto-assigned to closer successfully");
          } catch (error) {
            console.error("❌ Error auto-assigning booking to closer:", error);
          }
        }

        // Show loading screen before redirect
        const loadingDiv = document.createElement('div');
        loadingDiv.innerHTML = `
          <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #F8F7F5; z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="width: 50px; height: 50px; border: 4px solid #4CAF50; border-top: 4px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="margin-top: 20px; color: #333333; font-size: 18px;">Processing your booking...</p>
            <style>
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          </div>
        `;
        document.body.appendChild(loadingDiv);
        
        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = '/book-call/confirmation';
        }, 2000);
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
      
      {/* Custom CSS to hide Calendly logo/bio section */}
      <style jsx global>{`
        .calendly-inline-widget iframe {
          height: 700px !important;
        }
        /* Hide the event type details section */
        .calendly-inline-widget .calendly-event-type-details {
          display: none !important;
        }
        /* Hide the organizer info section */
        .calendly-inline-widget .calendly-organizer-info {
          display: none !important;
        }
        /* Hide any logo or branding */
        .calendly-inline-widget .calendly-logo {
          display: none !important;
        }
        /* Hide description section */
        .calendly-inline-widget .calendly-description {
          display: none !important;
        }
      `}</style>
      
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
                data-url={calendlyUrl}
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
