'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function CookieBanner() {
  const [isHidden, setIsHidden] = useState(true); // Start hidden
  const [isDismissed, setIsDismissed] = useState(false);
  const [isAppDomain, setIsAppDomain] = useState(false);

  useEffect(() => {
    // Check if we're on the app subdomain
    const hostname = window.location.hostname;
    const isApp = hostname.includes('app.') || hostname.includes('app.localhost');
    setIsAppDomain(isApp);
    
    // Don't show on app domain at all
    if (isApp) {
      setIsDismissed(true);
      return;
    }
    
    // Check if user already dismissed it permanently
    const dismissed = localStorage.getItem('cookie_banner_accepted');
    if (!dismissed) {
      // Show banner after a tiny delay for smooth animation
      setTimeout(() => setIsHidden(false), 100);
    } else {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsHidden(true);
    // Remember forever
    localStorage.setItem('cookie_banner_accepted', 'true');
    // Remove from DOM after animation completes
    setTimeout(() => setIsDismissed(true), 400);
  };

  // Don't render at all if permanently dismissed or on app domain
  if (isDismissed || isAppDomain) return null;

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 sm:bottom-6 sm:right-6 sm:left-auto z-50 transition-all duration-500 ease-out sm:max-w-md ${
        isHidden ? 'translate-y-[120%] sm:translate-y-0 sm:translate-x-[120%] opacity-0' : 'translate-y-0 sm:translate-x-0 opacity-100'
      }`}
    >
      <div className="bg-white sm:rounded-2xl shadow-2xl border-t sm:border border-slate-200 overflow-hidden">
        {/* Main content */}
        <div className="p-3 sm:p-5">
          <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                We Value Your Privacy
              </h3>
            </div>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="p-1 sm:p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-2.5 sm:mb-4">
            We use cookies to enhance your experience and track referrals. 
            <a 
              href="/privacy" 
              className="text-teal-600 hover:text-teal-700 font-medium ml-1 underline underline-offset-2"
            >
              Learn more
            </a>
          </p>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleDismiss}
              className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 sm:hover:scale-[1.02]"
            >
              Accept
            </button>
            
            <button
              onClick={handleDismiss}
              className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 border-2 border-slate-200 hover:border-slate-300 active:scale-95"
            >
              Decline
            </button>
          </div>
        </div>

        {/* Bottom gradient accent */}
        <div className="h-1 bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700" />
      </div>
    </div>
  );
}
