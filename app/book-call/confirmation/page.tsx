"use client";

import Link from "next/link";

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F5]">
      {/* Section 1: Dark Charcoal Background */}
      <div className="bg-gradient-to-br from-[#333333] via-[#2a2a2a] to-[#333333] py-4 sm:py-5 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-2 sm:mb-3">
            <h1 className="text-white text-xl sm:text-2xl font-bold font-serif text-center">
              BrightNest
            </h1>
          </div>

          {/* Main Headline */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-3 sm:mb-4 leading-tight px-2">
            <span className="text-[#4CAF50]">
              CONGRATULATIONS!
            </span>
          </h2>

          {/* Confirmation Banner */}
          <div className="bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] rounded-xl py-3 sm:py-4 px-4 sm:px-6 max-w-3xl mx-auto shadow-lg border-2 border-white/20">
            <p className="text-white text-sm sm:text-base lg:text-lg font-black">
              Confirmed: Your Financial Transformation Assessment Has Been Booked
            </p>
          </div>
        </div>
      </div>

      {/* Spacing section */}
      <div className="h-12 sm:h-16 bg-[#F8F7F5]"></div>

      {/* Section 2: Green Banner - Wider */}
      <div className="relative -mt-8 sm:-mt-10 z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] rounded-t-3xl py-3 sm:py-4 px-4 sm:px-6 shadow-lg relative overflow-hidden">
            <div className="text-center relative z-10">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-white mb-2">
                ✨ IMPORTANT NEXT STEPS:
              </h3>
              <p className="text-white text-xs sm:text-sm lg:text-base font-bold">
                Watch The Short 3 Minute Video & Complete Pre-Call Checklist To Confirm Your Appointment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: White Card with Video */}
      <div className="max-w-5xl mx-auto px-4 pb-20 sm:pb-8">
        <div className="bg-white rounded-b-lg shadow-lg overflow-hidden">
          {/* Video Section */}
          <div className="p-4 sm:p-6">
            <div className="relative bg-gradient-to-br from-[#2a2a2a] via-[#333333] to-[#2a2a2a] rounded-lg overflow-hidden aspect-video shadow-lg">
              {/* Video Thumbnail */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] via-[#333333] to-[#2a2a2a] flex items-center justify-center relative overflow-hidden">
                {/* Video Content Placeholder */}
                <div className="text-center text-white relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg transition-transform duration-300">
                    <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold mb-2">Pre-Call Preparation Video</h4>
                  <p className="text-gray-300 text-sm">
                    Learn what to expect and how to prepare for your Financial Transformation Assessment
                  </p>
                </div>
              </div>
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-20 h-20 bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform">
                  <svg className="w-8 h-8 ml-1 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Reviews Section */}
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
            </div>

            {/* Main Title */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#333333] text-center mb-4 sm:mb-6 lg:mb-8 leading-tight drop-shadow-lg px-2" style={{textShadow: '0 0 15px rgba(51,51,51,0.3), 0 0 30px rgba(51,51,51,0.1)'}}>
              Complete This Quick 3 Step<br />
              <span className="bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] bg-clip-text text-transparent">Pre-Call Checklist:</span>
            </h2>

            {/* Step 1 */}
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#333333] mb-4 sm:mb-6 drop-shadow-md" style={{textShadow: '0 0 10px rgba(51,51,51,0.2)'}}>Step 1:</h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#4CAF50] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base text-[#333333]">We are going to call you soon to confirm your call (during work hours)</span>
                </div>
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#4CAF50] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base text-[#333333]">Your Financial Transformation Call is via Video on Zoom.</span>
                </div>
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#4CAF50] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base text-[#333333]">You'll receive Zoom details via email and text.</span>
                </div>
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#4CAF50] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base text-[#333333]">Click the Zoom link on your smart phone or computer 5 minutes before your call time!</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#333333] mb-2 drop-shadow-md" style={{textShadow: '0 0 10px rgba(51,51,51,0.2)'}}>Step 2:</h3>
              <h4 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#333333] mb-4 sm:mb-6 drop-shadow-md" style={{textShadow: '0 0 10px rgba(51,51,51,0.2)'}}>Communication</h4>
              <p className="text-sm sm:text-base text-[#333333] mb-4 sm:mb-6">
                Please check your email. We sent you an email confirming the date/time. Please mark this in your calendar now. Please ensure you confirm "I Know The Sender" from the email we sent you for your 1-1 session.
              </p>

              {/* Calendar Invite Warning Box */}
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                <div className="text-sm sm:text-base text-[#333333] space-y-2">
                  <p className="font-semibold text-xs sm:text-sm">Unknown sender: not added to Calendar yet</p>
                  <p className="text-xs sm:text-sm">It looks like you've never been in contact with this sender so this event hasn't been added to your calendar. It won't appear there unless you say you know the sender.</p>
                  <p className="text-xs sm:text-sm">Avoid clicking links, downloading attachments, or replying with personal information unless you trust the sender.</p>
                </div>
                <div className="flex items-center space-x-3 sm:space-x-4 mt-3 sm:mt-4">
                  <button className="bg-gray-200 border border-gray-400 text-[#333333] px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm">
                    I know the sender
                  </button>
                  <a href="#" className="text-[#4CAF50] text-xs sm:text-sm hover:underline">Report spam</a>
                </div>
              </div>

              {/* Yellow Highlight Box */}
              <div className="bg-yellow-300 border-2 border-yellow-400 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 relative">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="text-xs sm:text-sm text-[#333333] font-semibold">
                    Press this "I know the sender" button in your calendar invite email you just received from us
                  </span>
                </div>
              </div>

              {/* Important Warning */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                <p className="text-red-800 font-bold text-xs sm:text-sm lg:text-base uppercase">
                  Otherwise the event you just scheduled with us will not show up in your calendar and you will likely miss the call
                </p>
              </div>
            </div>

            {/* Combined Step 3 and Information Section */}
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#333333] mb-4 sm:mb-6 drop-shadow-md" style={{textShadow: '0 0 10px rgba(51,51,51,0.2)'}}>Step 3: Punctuality</h3>
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#4CAF50] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base text-[#333333]">Please be ready 5 minutes before your scheduled call time</span>
                </div>
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#4CAF50] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base text-[#333333]">Test your internet connection and camera beforehand</span>
                </div>
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#4CAF50] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base text-[#333333]">Have a quiet, well-lit space for the call</span>
                </div>
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#4CAF50] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base text-[#333333]">Keep your financial documents ready for reference</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 sm:pt-6">
                <h4 className="text-xl sm:text-2xl font-black text-[#333333] mb-3 sm:mb-4 drop-shadow-md" style={{textShadow: '0 0 10px rgba(51,51,51,0.2)'}}>Information:</h4>
                <p className="text-sm sm:text-base text-[#333333] leading-relaxed">
                  Come with whatever questions you have. We want you to be able to make an informed decision, regardless if you choose us or not.
                </p>
              </div>
              
              <div className="border-t border-gray-200 pt-6 sm:pt-8 mt-6 sm:mt-8">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#333333] text-center mb-4 sm:mb-6 lg:mb-8 leading-tight drop-shadow-lg px-2" style={{textShadow: '0 0 15px rgba(51,51,51,0.3), 0 0 30px rgba(51,51,51,0.1)'}}>
                  Step 3: Review Our Most Frequently Asked Questions
                </h2>

                {/* Video Modules Grid */}
                <div className="grid md:grid-cols-3 gap-6">
              {/* Video Module 1 */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#333333] to-[#2a2a2a] py-4 px-4">
                  <h3 className="text-white font-bold text-lg text-center">
                    What's Included In The Program?
                  </h3>
                </div>
                
                {/* Video Thumbnail */}
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 aspect-video">
                  {/* Video Content Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-16 h-16 bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <p className="text-sm opacity-80">and tap into our exclusive</p>
                    </div>
                  </div>
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="w-16 h-16 bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 transform">
                      <svg className="w-6 h-6 ml-1 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="bg-gray-100 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#333333] font-medium">0:38</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-[#4CAF50] rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <div className="bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] h-1 rounded-full w-1/3"></div>
                  </div>
                </div>
              </div>

              {/* Video Module 2 */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#333333] to-[#2a2a2a] py-4 px-4">
                  <h3 className="text-white font-bold text-lg text-center">
                    How Is This Program Different?
                  </h3>
                </div>
                
                {/* Video Thumbnail */}
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 aspect-video">
                  {/* Video Content Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-16 h-16 bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <p className="text-sm opacity-80">get a random diet</p>
                    </div>
                  </div>
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="w-16 h-16 bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 transform">
                      <svg className="w-6 h-6 ml-1 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="bg-gray-100 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#333333] font-medium">0:40</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-[#4CAF50] rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <div className="bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] h-1 rounded-full w-1/3"></div>
                  </div>
                </div>
              </div>

              {/* Video Module 3 */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#333333] to-[#2a2a2a] py-4 px-4">
                  <h3 className="text-white font-bold text-lg text-center">
                    How Soon Can I See Results?
                  </h3>
                </div>
                
                {/* Video Thumbnail */}
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 aspect-video">
                  {/* Video Content Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-16 h-16 bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <p className="text-sm opacity-80">you'll witness a real transformation in the mirror</p>
                    </div>
                  </div>
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="w-16 h-16 bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 transform">
                      <svg className="w-6 h-6 ml-1 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="bg-gray-100 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#333333] font-medium">0:33</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-[#4CAF50] rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <div className="bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] h-1 rounded-full w-1/3"></div>
                  </div>
                </div>
              </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#333333] py-6 sm:py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-3 sm:mb-4">
            <h1 className="text-white text-xl sm:text-2xl font-bold font-serif text-center">
              BrightNest
            </h1>
          </div>
          <div className="text-white text-xs sm:text-sm text-center">
            <Link href="/privacy" className="hover:text-[#4CAF50]">Privacy Policy</Link>
            <span className="mx-2">|</span>
            <Link href="/terms" className="hover:text-[#4CAF50]">Terms and Conditions</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
