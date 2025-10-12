"use client";

import Link from "next/link";

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F5]">
      {/* Section 1: Dark Charcoal Background */}
      <div className="bg-gradient-to-br from-[#333333] via-[#2a2a2a] to-[#333333] py-10 px-4 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#4CAF50] rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-[#4CAF50] rounded-full blur-2xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Logo */}
          <div className="mb-4">
            <h1 className="text-white text-3xl font-bold tracking-wide drop-shadow-lg">
              <span className="font-sans">BRIGHT</span>
              <span className="font-serif italic ml-2">Nest</span>
            </h1>
          </div>

          {/* Main Headline */}
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            <span className="text-[#4CAF50] drop-shadow-2xl text-shadow-lg bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] bg-clip-text text-transparent">
              CONGRATULATIONS!
            </span>
          </h2>

          {/* Confirmation Banner */}
          <div className="bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] rounded-xl py-4 px-6 max-w-2xl mx-auto mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <p className="text-white text-xl font-semibold drop-shadow-md">
              Confirmed: Your Financial Transformation Assessment Has Been Booked
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Green Banner - Wider */}
      <div className="relative -mt-8 z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] rounded-t-3xl py-6 px-8 shadow-2xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full blur-xl"></div>
            </div>
            
            <div className="text-center relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                ✨ IMPORTANT NEXT STEPS:
              </h3>
              <p className="text-white text-lg drop-shadow-md">
                Watch The Short 3 Minute Video & Complete Pre-Call Checklist To Confirm Your Appointment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: White Card with Video */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-b-lg shadow-2xl overflow-hidden">
          {/* Video Section */}
          <div className="p-6">
            <div className="relative bg-gradient-to-br from-[#2a2a2a] via-[#333333] to-[#2a2a2a] rounded-lg overflow-hidden aspect-video shadow-2xl">
              {/* Video Thumbnail */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] via-[#333333] to-[#2a2a2a] flex items-center justify-center relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#4CAF50] rounded-full blur-3xl"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-[#4CAF50] rounded-full blur-2xl"></div>
                </div>
                
                {/* Video Content Placeholder */}
                <div className="text-center text-white relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl transform hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold mb-2 drop-shadow-lg">Pre-Call Preparation Video</h4>
                  <p className="text-gray-300 text-sm drop-shadow-md">
                    Learn what to expect and how to prepare for your Financial Transformation Assessment
                  </p>
                </div>
              </div>
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-20 h-20 bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 hover:shadow-3xl transition-all duration-300 transform">
                  <svg className="w-8 h-8 ml-1 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Video Description */}
            <div className="mt-6 text-center">
              <h5 className="text-lg font-semibold text-[#333333] mb-2">
                What You'll Learn:
              </h5>
              <ul className="text-[#333333] text-sm space-y-1">
                <li>• How to prepare your financial documents</li>
                <li>• What to expect during your assessment</li>
                <li>• Key questions we'll discuss</li>
                <li>• Next steps after your call</li>
              </ul>
            </div>

            {/* Checklist Section */}
            <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg border border-gray-200">
              <h6 className="font-semibold text-[#333333] mb-4 text-lg drop-shadow-sm">Pre-Call Checklist:</h6>
              <div className="space-y-3">
                {[
                  "Gather recent bank statements",
                  "List your current financial goals",
                  "Note any specific money challenges",
                  "Prepare questions about our Money Behavior System™"
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200">
                    <div className="w-5 h-5 border-2 border-[#4CAF50] rounded-full bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] flex items-center justify-center shadow-sm">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </div>
                    <span className="text-[#333333] text-sm font-medium">{item}</span>
                  </div>
                ))}
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

      {/* Pre-Call Checklist Section */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          <div className="p-8">
            {/* Reviews Section */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-2">
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
            </div>

            {/* Main Title */}
            <h2 className="text-3xl font-bold text-[#333333] text-center mb-8 leading-tight">
              Complete This Quick 3 Step<br />
              Pre-Call Checklist:
            </h2>

            {/* Step 1 */}
            <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-2xl font-bold text-[#333333] mb-4">Step 1:</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#4CAF50] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                  </div>
                  <span className="text-[#333333]">We are going to call you soon to confirm your call (during work hours)</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#4CAF50] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                    </svg>
                  </div>
                  <span className="text-[#333333]">Your Financial Transformation Call is via Video on Zoom.</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#4CAF50] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                    </svg>
                  </div>
                  <span className="text-[#333333]">You'll receive Zoom details via email and text.</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#4CAF50] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                  </div>
                  <span className="text-[#333333]">Click the Zoom link on your smart phone or computer 5 minutes before your call time!</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-2xl font-bold text-[#333333] mb-2">Step 2:</h3>
              <h4 className="text-2xl font-bold text-[#333333] mb-4">Communication</h4>
              <p className="text-[#333333] mb-6">
                Please check your email. We sent you an email confirming the date/time. Please mark this in your calendar now. Please ensure you confirm "I Know The Sender" from the email we sent you for your 1-1 session.
              </p>

              {/* Calendar Invite Warning Box */}
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-4">
                <div className="text-[#333333] space-y-2">
                  <p className="font-semibold">Unknown sender: not added to Calendar yet</p>
                  <p className="text-sm">It looks like you've never been in contact with this sender so this event hasn't been added to your calendar. It won't appear there unless you say you know the sender.</p>
                  <p className="text-sm">Avoid clicking links, downloading attachments, or replying with personal information unless you trust the sender.</p>
                </div>
                <div className="flex items-center space-x-4 mt-4">
                  <button className="bg-gray-200 border border-gray-400 text-[#333333] px-4 py-2 rounded text-sm">
                    I know the sender
                  </button>
                  <a href="#" className="text-[#4CAF50] text-sm hover:underline">Report spam</a>
                </div>
              </div>

              {/* Yellow Highlight Box */}
              <div className="bg-yellow-300 border-2 border-yellow-400 rounded-lg p-4 mb-4 relative">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="text-[#333333] font-semibold">
                    Press this "I know the sender" button in your calendar invite email you just received from us
                  </span>
                </div>
              </div>

              {/* Important Warning */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-bold text-lg uppercase">
                  Otherwise the event you just scheduled with us will not show up in your calendar and you will likely miss the call
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-2xl font-bold text-[#333333] mb-4">Step 3: Punctuality</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#4CAF50] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <span className="text-[#333333]">Please be ready 5 minutes before your scheduled call time</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#4CAF50] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <span className="text-[#333333]">Test your internet connection and camera beforehand</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#4CAF50] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <span className="text-[#333333]">Have a quiet, well-lit space for the call</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#4CAF50] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <span className="text-[#333333]">Keep your financial documents ready for reference</span>
                </div>
              </div>
            </div>

            {/* Final Contact Info */}
            <div className="text-center mt-8 p-6 bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] rounded-lg">
              <h4 className="text-xl font-bold text-white mb-2">Ready for Your Financial Transformation?</h4>
              <p className="text-white mb-4">
                If you have any questions or need to reschedule, contact us immediately
              </p>
              <a href="mailto:support@brightnest.com" className="text-white font-semibold hover:underline">
                support@brightnest.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
