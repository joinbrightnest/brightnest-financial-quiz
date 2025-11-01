"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import { useParams } from "next/navigation";

export default function AffiliateBookCallPage() {
  const params = useParams();
  const affiliateCode = params.affiliateCode as string;
  
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [calendlyUrl, setCalendlyUrl] = useState("https://calendly.com/privatepublish/30min?hide_event_type_details=1&hide_gdpr_banner=1&hide_landing_page_details=1&embed_domain=joinbrightnest.com&embed_type=Inline");
  const [activeCloser, setActiveCloser] = useState<{id: string, name: string, calendlyLink: string} | null>(null);

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
        const response = await fetch('/api/closer/active-calendly');
        const data = await response.json();
        
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
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      }
    };

    fetchDataAndPreFillCalendly();
  }, []);

  // Set affiliate cookie when page loads
  useEffect(() => {
    if (affiliateCode) {
      console.log("🎯 Affiliate book-call page visit detected:", affiliateCode);
      console.log("🍪 Setting affiliate cookie...");
      
      // Set the affiliate cookie for the quiz system
      document.cookie = `affiliate_ref=${affiliateCode}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      
      console.log("✅ Affiliate cookie set successfully");
    }
  }, [affiliateCode]);

  // Calendly event listener for booking completion
  useEffect(() => {
    const handleCalendlyEvent = async (e: any) => {
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
        
        // Track the booking for this affiliate
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
                  calendlyEvent: e.data.payload || null,
                  affiliateCode: affiliateCode || null,
                  customerData: {
                    name: customerName,
                    email: customerEmail,
                  },
                  sessionId: sessionId || null, // Pass the session ID to link the appointment
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
  }, [affiliateCode]);

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

  // Helper function to generate affiliate-aware links
  const getAffiliateLink = (path: string) => {
    return `/${affiliateCode}${path}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href={getAffiliateLink("/")} className="text-2xl font-bold text-gray-900">
              BrightNest
            </Link>
            <div className="flex items-center space-x-6">
              <Link href={getAffiliateLink("/quiz/financial-profile")} className="text-gray-600 hover:text-gray-900">
                Take Quiz
              </Link>
              <Link href={getAffiliateLink("/")} className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Book Your Free Financial Consultation
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Get personalized financial advice from our experts
          </p>
          
        </div>

        {/* Calendly Widget */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Schedule Your Free 30-Minute Consultation
            </h2>
            <p className="text-gray-600">
              Choose a time that works best for you
            </p>
          </div>
          
          <div className="calendly-inline-widget" 
               data-url={calendlyUrl}
               style={{ minWidth: '320px', height: '700px' }}>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Consultation</h3>
            <p className="text-gray-600">No cost, no obligation. Just valuable insights into your financial situation.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized Plan</h3>
            <p className="text-gray-600">Get a customized financial strategy based on your unique goals and situation.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Results</h3>
            <p className="text-gray-600">Start implementing changes immediately with actionable advice from our experts.</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Not ready to book a call? Start with our free financial assessment:
          </p>
          <Link
            href={getAffiliateLink("/quiz/financial-profile")}
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Take Free Financial Assessment
          </Link>
        </div>
      </div>

      {/* Calendly Script */}
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />
    </div>
  );
}
