"use client";

import Link from "next/link";

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F5]">
      {/* Section 1: Clean Header */}
      <div className="bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-8">
            <div className="inline-flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="text-3xl font-bold text-gray-800 font-serif">BrightNest</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6 leading-tight">
            You're All Set!
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Your Financial Transformation Assessment has been successfully booked. Here's what happens next:
          </p>

          {/* Confirmation Card */}
          <div className="bg-green-50 border border-green-200 rounded-lg py-6 px-8 max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-800">
                Appointment Confirmed
              </h2>
            </div>
            <p className="text-green-700 text-lg">
              We'll send you a calendar invite and meeting details shortly.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Next Steps */}
      <div className="bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 py-8 px-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Important Next Steps
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                To ensure you get the most out of your assessment, please complete these steps:
              </p>
              
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">
                  Watch the 3-minute preparation video below
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Video Section */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Video Section */}
          <div className="p-6">
            <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
              {/* Video Thumbnail */}
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                {/* Video Content Placeholder */}
                <div className="text-center text-white">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-blue-700 transition-colors duration-200">
                    <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Pre-Call Preparation Video</h4>
                  <p className="text-gray-300 text-sm">
                    Learn what to expect and how to prepare for your Financial Transformation Assessment
                  </p>
                </div>
              </div>
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-200">
                  <svg className="w-6 h-6 ml-1 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Reviews Section */}
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
            </div>

            {/* Main Title */}
            <h2 className="text-4xl font-black text-[#333333] text-center mb-8 leading-tight drop-shadow-lg" style={{textShadow: '0 0 15px rgba(51,51,51,0.3), 0 0 30px rgba(51,51,51,0.1)'}}>
              Complete This Quick 3 Step<br />
              <span className="bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] bg-clip-text text-transparent">Pre-Call Checklist:</span>
            </h2>

            {/* Step 1 */}
            <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-3xl font-black text-[#333333] mb-6 drop-shadow-md" style={{textShadow: '0 0 10px rgba(51,51,51,0.2)'}}>Step 1:</h3>
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
              <h3 className="text-3xl font-black text-[#333333] mb-2 drop-shadow-md" style={{textShadow: '0 0 10px rgba(51,51,51,0.2)'}}>Step 2:</h3>
              <h4 className="text-3xl font-black text-[#333333] mb-6 drop-shadow-md" style={{textShadow: '0 0 10px rgba(51,51,51,0.2)'}}>Communication</h4>
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

            {/* Combined Step 3 and Information Section */}
            <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-3xl font-black text-[#333333] mb-6 drop-shadow-md" style={{textShadow: '0 0 10px rgba(51,51,51,0.2)'}}>Step 3: Punctuality</h3>
              <div className="space-y-3 mb-6">
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
              
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-2xl font-black text-[#333333] mb-4 drop-shadow-md" style={{textShadow: '0 0 10px rgba(51,51,51,0.2)'}}>Information:</h4>
                <p className="text-[#333333] leading-relaxed">
                  Come with whatever questions you have. We want you to be able to make an informed decision, regardless if you choose us or not.
                </p>
              </div>
              
              <div className="border-t border-gray-200 pt-8 mt-8">
                <h2 className="text-4xl font-black text-[#333333] text-center mb-8 leading-tight drop-shadow-lg" style={{textShadow: '0 0 15px rgba(51,51,51,0.3), 0 0 30px rgba(51,51,51,0.1)'}}>
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
  );
}
