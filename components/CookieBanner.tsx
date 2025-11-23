'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function CookieBanner() {
  const [shouldShow, setShouldShow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Don't show on app subdomain
    if (window.location.hostname.includes('app.')) {
      console.log('🍪 Cookie banner: Skipping app subdomain');
      return;
    }

    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie_consent');
    console.log('🍪 Cookie banner: Consent status:', consent);
    
    if (!consent) {
      console.log('🍪 Cookie banner: No consent found, showing banner in 1 second');
      // Small delay for better UX
      const timer = setTimeout(() => {
        console.log('🍪 Cookie banner: Displaying now');
        setShouldShow(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      console.log('🍪 Cookie banner: Consent already given, not showing');
    }
  }, []);

  const handleAccept = () => {
    console.log('🍪 Cookie banner: User accepted');
    localStorage.setItem('cookie_consent', 'accepted');
    setShouldShow(false);
  };

  const handleDecline = () => {
    console.log('🍪 Cookie banner: User declined');
    localStorage.setItem('cookie_consent', 'declined');
    setShouldShow(false);
    // Note: Even if declined, affiliate cookies are already set server-side
    // This is for transparency and user preference tracking
  };

  const handleClose = () => {
    console.log('🍪 Cookie banner: User dismissed');
    // Treat close (X button) as implicit acceptance
    localStorage.setItem('cookie_consent', 'dismissed');
    setShouldShow(false);
  };

  // Don't render anything if shouldn't show
  if (!shouldShow) return null;

  return (
    <>
      {/* Backdrop overlay - non-clickable to prevent accidental dismissal */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[9998] transition-opacity duration-300"
      />

      {/* Cookie banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] animate-slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Main content */}
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                      We Value Your Privacy
                    </h3>
                  </div>
                  
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-4">
                    We use cookies to enhance your browsing experience, analyze site traffic, and track referrals from our partners. 
                    {!showDetails && (
                      <button
                        onClick={() => setShowDetails(true)}
                        className="text-teal-600 hover:text-teal-700 font-medium ml-1 underline underline-offset-2"
                      >
                        Learn more
                      </button>
                    )}
                  </p>

                  {/* Details section */}
                  {showDetails && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 mb-1">Essential Cookies</h4>
                        <p className="text-xs text-slate-600">Required for site functionality, authentication, and quiz sessions.</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 mb-1">Analytics & Tracking</h4>
                        <p className="text-xs text-slate-600">Help us understand how you use our site and track affiliate referrals.</p>
                      </div>
                      <div className="pt-2 border-t border-slate-200">
                        <a 
                          href="/privacy" 
                          className="text-xs text-teal-600 hover:text-teal-700 font-medium underline underline-offset-2"
                        >
                          Read our full Privacy Policy →
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Close button (desktop) */}
                <button
                  onClick={handleClose}
                  className="hidden sm:block p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={handleAccept}
                  className="flex-1 sm:flex-none px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-teal-600/30 hover:shadow-xl hover:shadow-teal-600/40 hover:scale-[1.02]"
                >
                  Accept All Cookies
                </button>
                
                <button
                  onClick={handleDecline}
                  className="flex-1 sm:flex-none px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all duration-200 border-2 border-slate-200 hover:border-slate-300"
                >
                  Decline Non-Essential
                </button>

                {!showDetails && (
                  <button
                    onClick={() => setShowDetails(true)}
                    className="hidden sm:block px-6 py-3 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                  >
                    Manage Preferences
                  </button>
                )}
              </div>
            </div>

            {/* Bottom gradient accent */}
            <div className="h-1 bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
}

