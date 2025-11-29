"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import SiteFooter from "@/components/SiteFooter";

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

  // Test function to simulate Calendly event
  const testCalendlyEvent = () => {
    console.log("🧪 Testing Calendly event simulation...");
    
    const testEvent = {
      data: {
        event: 'calendly.event_scheduled',
        payload: {
          invitee: {
            name: 'Test User',
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User'
          },
          event: {
            uuid: 'test-uuid-123',
            start_time: new Date().toISOString(),
            end_time: new Date(Date.now() + 30 * 60 * 1000).toISOString()
          }
        }
      }
    };
    
    // Simulate the event
    window.dispatchEvent(new MessageEvent('message', testEvent));
  };

  // Clear affiliate cookie on normal (non-affiliate) book-call page
  useEffect(() => {
    // Clear any existing affiliate cookie since this is the normal booking page (not an affiliate link)
    document.cookie = 'affiliate_ref=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    console.log('✅ Cleared affiliate cookie (normal booking page)');
  }, []);

  // Fetch active closer's Calendly link and quiz session data
  useEffect(() => {
    const fetchDataAndPreFillCalendly = async () => {
      try {
        // First, try to get name and email from localStorage (fastest)
        let quizName = localStorage.getItem('userName');
        let quizEmail = localStorage.getItem('userEmail');
        
        // If not in localStorage, fetch from quiz session API
        if (!quizName || !quizEmail) {
          const sessionId = localStorage.getItem('quizSessionId');
          
          if (sessionId) {
            try {
              const sessionResponse = await fetch(`/api/quiz/session?sessionId=${sessionId}`);
              if (sessionResponse.ok) {
                const sessionData = await sessionResponse.json();
                quizName = quizName || sessionData.name || null;
                quizEmail = quizEmail || sessionData.email || null;
                
                // Store in localStorage for future use
                if (sessionData.name) localStorage.setItem('userName', sessionData.name);
                if (sessionData.email) localStorage.setItem('userEmail', sessionData.email);
                
                console.log("✅ Found quiz data from API for pre-fill:", { quizName, quizEmail });
              }
            } catch (error) {
              console.error("❌ Error fetching quiz session:", error);
            }
          }
        } else {
          console.log("✅ Found quiz data from localStorage for pre-fill:", { quizName, quizEmail });
        }
        
        // Fetch active closer's Calendly link
        console.log("🔍 Fetching active closer...");
        const response = await fetch('/api/closer/active-calendly');
        console.log("📡 Active closer API response:", response.status, response.statusText);
        const data = await response.json();
        console.log("📊 Active closer API data:", data);
        
        // Build Calendly URL with pre-filled data
        let baseCalendlyUrl = "https://calendly.com/privatepublish/30min";
        
        if (data.success && data.closer) {
          console.log("🎯 Found active closer:", data.closer);
          setActiveCloser(data.closer);
          baseCalendlyUrl = data.closer.calendlyLink;
        }
        
        // Add URL parameters for pre-filling
        const urlParams = new URLSearchParams({
          'hide_event_type_details': '1',
          'hide_gdpr_banner': '1',
          'hide_landing_page_details': '1',
          'embed_domain': 'joinbrightnest.com',
          'embed_type': 'Inline'
        });
        
        // Add name and email if available (Calendly supports these URL params for pre-filling)
        if (quizName) {
          urlParams.append('name', quizName); // Pre-fills the name field
        }
        if (quizEmail) {
          urlParams.append('email', quizEmail); // Pre-fills the email field
        }
        
        const finalCalendlyUrl = `${baseCalendlyUrl}?${urlParams.toString()}`;
        setCalendlyUrl(finalCalendlyUrl);
        console.log("🔄 Using Calendly URL with pre-filled data:", finalCalendlyUrl);
        
        // Force Calendly widget to reload with new URL
        setTimeout(() => {
          const widget = document.querySelector('.calendly-inline-widget');
          if (widget) {
            // Remove the old widget
            widget.innerHTML = '';
            // Create new widget with updated URL
            const newWidget = document.createElement('div');
            newWidget.className = 'calendly-inline-widget';
            newWidget.setAttribute('data-url', finalCalendlyUrl);
            newWidget.style.minWidth = '320px';
            newWidget.style.height = '700px';
            widget.parentNode?.replaceChild(newWidget, widget);
            
            // Reinitialize Calendly
            if (window.Calendly) {
              window.Calendly.initInlineWidget({
                url: finalCalendlyUrl,
                parentElement: newWidget
              });
            }
            console.log("🔄 Calendly widget reloaded with pre-filled data");
          }
        }, 100);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      }
    };

    fetchDataAndPreFillCalendly();
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
      console.log("🔍 Calendly event received:", e.data);
      console.log("🔍 Event type:", e.data?.event);
      console.log("🔍 Full event object:", e);
      
      // Log all Calendly events, not just event_scheduled
      if (e.data?.event && e.data.event.includes('calendly')) {
        console.log("🎯 Calendly event detected:", e.data.event);
      }
      
      if (e.data.event === 'calendly.event_scheduled') {
        console.log("🎯 Calendly booking completed:", e.data);
        
        // Get customer data from quiz session instead of Calendly
        let customerName = 'Unknown';
        let customerEmail = 'unknown@example.com';
        
        // Get session ID from localStorage (set when quiz was completed)
        const sessionId = localStorage.getItem('quizSessionId');
        console.log("🔍 Session ID from localStorage:", sessionId);
        
        if (sessionId) {
          try {
            // Fetch customer data from the public session API
            const response = await fetch(`/api/quiz/session?sessionId=${sessionId}`);
            
            if (response.ok) {
              const session = await response.json();
              
              if (session.name) {
                customerName = session.name;
                console.log("✅ Found customer name from session:", customerName);
              }
              if (session.email) {
                customerEmail = session.email;
                console.log("✅ Found customer email from session:", customerEmail);
              }
            }
          } catch (error) {
            console.error("❌ Error fetching customer data from admin API:", error);
          }
        } else {
          console.log("⚠️ No session ID found in localStorage");
        }
        
        console.log("📝 Final customer data from quiz:", {
          customerName,
          customerEmail,
          sessionId
        });
        
        // Get affiliate code from cookie (should be null on normal booking page since we clear it)
        const affiliateCode = document.cookie
          .split('; ')
          .find(row => row.startsWith('affiliate_ref='))
          ?.split('=')[1];

        // Track the booking if there's an affiliate
        // Note: On normal booking page, this should be null since we clear the cookie
        if (affiliateCode) {
          console.log("⚠️ WARNING: Affiliate code found on normal booking page:", affiliateCode);
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
        console.log("🔍 Active closer check:", activeCloser);
        
        // If activeCloser is null, try to fetch it again
        let closerToUse = activeCloser;
        if (!closerToUse) {
          console.log("🔄 Active closer is null, fetching again...");
          try {
            const response = await fetch('/api/closer/active-calendly');
            const data = await response.json();
            if (data.success && data.closer) {
              closerToUse = data.closer;
              console.log("✅ Fetched closer for assignment:", closerToUse);
            }
          } catch (error) {
            console.error("❌ Error fetching closer for assignment:", error);
          }
        }
        
        if (closerToUse) {
          try {
            console.log("🎯 Auto-assigning booking to closer:", closerToUse.name);
              const response = await fetch('/api/track-closer-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  closerId: closerToUse.id,
                  calendlyEvent: e.data.payload || null, // Pass the full payload, not just the event
                  affiliateCode: affiliateCode || null,
                  customerData: {
                    name: customerName,
                    email: customerEmail,
                  },
                  sessionId: sessionId || null, // Pass the session ID to link the appointment
                }),
              });
            const result = await response.json();
            console.log("✅ Booking auto-assigned to closer successfully:", result);
          } catch (error) {
            console.error("❌ Error auto-assigning booking to closer:", error);
          }
        } else {
          console.log("❌ No active closer found for assignment");
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
        {/* Main Content Section */}
        <div className="bg-[#333333] py-4 sm:py-6 px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Headline */}
            <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 leading-tight px-2">
              <span className="text-[#4CAF50]">Final Step:</span> Required To Complete Your Application
            </h2>

            {/* Sub-headline */}
            <p className="text-white text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed mb-3 sm:mb-4 px-2">
              Congratulations On Taking The First Step! To Finalize Your Application And Determine If Our Money Behavior System™ Is Right For You Please Select A Time Below For Your FREE Financial Transformation Assessment
            </p>

            {/* Social Proof Images */}
            <div className="flex justify-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-[#A5D6A7] to-[#C8E6C9] rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pink Banner - Overlapping with dark section */}
        <div className="relative -mt-6 sm:-mt-8 z-10">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-[#4CAF50] rounded-t-3xl py-4 sm:py-6 px-4 sm:px-8">
              <div className="text-center">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2">
                  Schedule Your FREE Financial Transformation Assessment
                </h3>
                
                <div className="flex items-center justify-center space-x-1 sm:space-x-2 text-white">
                  <span className="text-base sm:text-xl">⭐</span>
                  <span className="text-xs sm:text-base">
                    + 157 People Have Booked Their Assessment In The Past 24 Hours
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Background - Full Width */}
        <div className="max-w-4xl mx-auto px-4 pb-20 sm:pb-8">
          <div className="bg-white rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg">
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
            <div className="text-center mt-4 sm:mt-6">
              <div className="flex flex-wrap items-center justify-center gap-x-1 sm:gap-x-2 gap-y-2 mb-3 sm:mb-4 text-xs sm:text-sm">
                <span className="text-[#333333] font-semibold">Excellent</span>
                <div className="flex space-x-0.5 sm:space-x-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className="text-[#4CAF50] text-base sm:text-lg">★</span>
                  ))}
                </div>
                <span className="text-[#333333]">4.9/5 (543 reviews)</span>
                <span className="text-[#4CAF50]">★</span>
                <span className="text-[#333333]">Trustpilot</span>
              </div>
              <p className="text-[#333333] text-xs sm:text-sm">
                Can't Find A Time That Works? <span className="text-[#D81B60] cursor-pointer hover:underline">Click Here</span>
              </p>
            </div>
          </div>
        </div>

        {/* Booking Activity Banner */}
        <div className="bg-[#333333] py-4 sm:py-6 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 space-x-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-[#A5D6A7] to-[#C8E6C9] rounded-full"></div>
                  </div>
                ))}
              </div>
              <span className="text-white text-sm sm:text-base lg:text-lg font-semibold text-center">
                157 People Have Booked In The Past 24 Hours
              </span>
            </div>
          </div>
        </div>

        <SiteFooter />
      </div>
    </>
  );
}
