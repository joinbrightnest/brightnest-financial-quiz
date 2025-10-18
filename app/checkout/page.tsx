"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface UserData {
  email?: string;
  name?: string;
  archetype?: string;
  totalPoints?: number;
  qualifiesForCall?: boolean;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState<UserData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [personalizedCopy, setPersonalizedCopy] = useState<any>(null);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  // Load user data and prefilled information
  useEffect(() => {
    // Get email and name from URL params
    const email = searchParams.get('email');
    const name = searchParams.get('name');
    
    // Get quiz result from localStorage
    const storedResult = localStorage.getItem('quizResult');
    let quizData = {};
    
    if (storedResult) {
      try {
        quizData = JSON.parse(storedResult);
      } catch (error) {
        console.error('Error parsing quiz result:', error);
      }
    }

    // Get pre-generated AI copy from localStorage
    const storedCopy = localStorage.getItem('personalizedCopy');
    if (storedCopy) {
      try {
        const copy = JSON.parse(storedCopy);
        setPersonalizedCopy(copy);
      } catch (parseError) {
        console.log('Error parsing stored copy:', parseError);
      }
    }

    // Combine all user data
    const combinedData = {
      email: email || quizData.email || '',
      name: name || quizData.name || '',
      archetype: quizData.archetype || 'Financial Explorer',
      totalPoints: quizData.totalPoints || 0,
      qualifiesForCall: quizData.qualifiesForCall || false,
      ...quizData
    };

    setUserData(combinedData);

    // Save email to localStorage for persistence
    if (email) {
      localStorage.setItem('userEmail', email);
    }

    // Clean URL params after capturing them
    if (email || name) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('email');
      newUrl.searchParams.delete('name');
      window.history.replaceState({}, '', newUrl.toString());
    }

    setIsLoading(false);
  }, [searchParams]);

  // Toggle FAQ item
  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  // Use AI-generated copy if available, otherwise fallback
  const copy = personalizedCopy || {
    header: {
      title: "Your Financial Archetype",
      subtitle: `You're a ${userData.archetype} — based on your answers, this is your financial personality type.`
    },
    validation: "You have unique financial strengths and opportunities for growth.",
    reflection: "Your financial patterns reveal important insights about your money mindset.",
    problem_realization: "Your financial journey has unique challenges to overcome.",
    hope_and_solution: "With the right guidance, you can achieve your financial goals and build lasting wealth.",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{backgroundColor: '#faf8f0'}}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your personalized assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#faf8f0'}}>
        {/* Top Header Bar */}
        <div className="bg-gray-800 w-full py-4">
          <div className="max-w-md mx-auto px-6">
            <h1 className="text-white text-xl font-bold text-center tracking-wide">
              BrightNest
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            
            {/* Archetype Header */}
            <div className="text-center mb-16">
              <p className="text-gray-500 text-sm mb-2">{copy.header.title}</p>
              <h1 className="text-4xl md:text-5xl font-serif text-blue-600 mb-4">
                {userData.archetype}
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {copy.header.subtitle}
              </p>
            </div>

            {/* Main Content Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 space-y-12">
              
              {/* Recognition Section */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Recognition</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {copy.validation}
                </p>
              </div>

              <hr className="my-8 border-gray-200" />

              {/* Your Financial Patterns Section */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Your Financial Patterns</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {copy.reflection}
                </p>
              </div>

              <hr className="my-8 border-gray-200" />

              {/* Hidden Challenge Section */}
              <div>
                <div className="bg-yellow-50 rounded-lg p-6 -mx-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Hidden Challenge</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {copy.problem_realization}
                  </p>
                </div>
              </div>

              <hr className="my-8 border-gray-200" />

              {/* Hope and Solution Section */}
              <div>
                <div className="bg-green-50 rounded-lg p-6 -mx-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Your Opportunity</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {copy.hope_and_solution}
                  </p>
                </div>
              </div>

              <hr className="my-8 border-gray-200" />

              {/* Score Display */}
              {userData.totalPoints && (
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Your Assessment Score
                  </h3>
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                    <span className="text-3xl font-bold text-white">
                      {userData.totalPoints}
                    </span>
                  </div>
                  <p className="text-lg text-gray-600 mb-6">
                    You scored {userData.totalPoints} out of a possible 20 points
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-yellow-800">
                      <strong>Next Step:</strong> Complete your financial assessment to qualify for a personalized consultation call. (Requires 17+ points)
                    </p>
                  </div>
                </div>
              )}

              <hr className="my-8 border-gray-200" />

              {/* Checkout Section */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Complete Your Financial Assessment
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Get your personalized financial roadmap and start building lasting wealth today.
                </p>
              </div>

            {/* Package Options */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Basic Package */}
              <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Basic Assessment</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-blue-600">$100</span>
                    <span className="text-gray-500 ml-2">one-time</span>
                  </div>
                  <ul className="text-left space-y-3 mb-8">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-black">Personalized Financial Archetype Report</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-black">Detailed Financial Patterns Analysis</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-black">Customized Action Plan</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-black">Email Support</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => {
                      // Redirect to Whop checkout for basic plan
                      window.location.href = `https://whop.com/sahila/basic-plan-a5-ad15?email=${encodeURIComponent(userData.email || '')}&name=${encodeURIComponent(userData.name || '')}`;
                    }}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Get Basic Assessment
                  </button>
                </div>
              </div>

              {/* Premium Package */}
              <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-500 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Premium Assessment</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-blue-600">$200</span>
                    <span className="text-gray-500 ml-2">one-time</span>
                  </div>
                  <ul className="text-left space-y-3 mb-8">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-black">Everything in Basic Assessment</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-black">30-Minute Personal Consultation Call</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-black">Priority Support</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-black">Follow-up Resources</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => {
                      // Redirect to Whop checkout for premium plan
                      window.location.href = `https://whop.com/sahila/top-plan-dd?email=${encodeURIComponent(userData.email || '')}&name=${encodeURIComponent(userData.name || '')}`;
                    }}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Get Premium Assessment
                  </button>
                </div>
              </div>
            </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-4">
                {/* FAQ 1 */}
                <div className="border border-gray-200 rounded-lg">
                  <button 
                    onClick={() => toggleFAQ(0)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                  >
                    <span className="font-semibold text-gray-900">How does the Financial Assessment work?</span>
                    <svg 
                      className={`w-5 h-5 text-gray-500 transition-transform ${openFAQ === 0 ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFAQ === 0 && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600">
                        Our assessment analyzes your financial patterns, behaviors, and goals to create a personalized roadmap. 
                        You'll receive detailed insights and actionable steps tailored to your unique situation.
                      </p>
                    </div>
                  )}
                </div>

                {/* FAQ 2 */}
                <div className="border border-gray-200 rounded-lg">
                  <button 
                    onClick={() => toggleFAQ(1)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                  >
                    <span className="font-semibold text-gray-900">What happens after payment?</span>
                    <svg 
                      className={`w-5 h-5 text-gray-500 transition-transform ${openFAQ === 1 ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFAQ === 1 && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600">
                        Immediately after payment, you'll receive access to your personalized financial assessment report. 
                        If you added the follow-up call, we'll contact you within 24 hours to schedule your consultation.
                      </p>
                    </div>
                  )}
                </div>

                {/* FAQ 3 */}
                <div className="border border-gray-200 rounded-lg">
                  <button 
                    onClick={() => toggleFAQ(2)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                  >
                    <span className="font-semibold text-gray-900">Is my information secure?</span>
                    <svg 
                      className={`w-5 h-5 text-gray-500 transition-transform ${openFAQ === 2 ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFAQ === 2 && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600">
                        Yes, absolutely. We use bank-level encryption and never share your personal information. 
                        Your data is processed securely through Whop's PCI-compliant payment system.
                      </p>
                    </div>
                  )}
                </div>

                {/* FAQ 4 */}
                <div className="border border-gray-200 rounded-lg">
                  <button 
                    onClick={() => toggleFAQ(3)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                  >
                    <span className="font-semibold text-gray-900">Can I get a refund?</span>
                    <svg 
                      className={`w-5 h-5 text-gray-500 transition-transform ${openFAQ === 3 ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFAQ === 3 && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600">
                        We offer a 30-day money-back guarantee. If you're not completely satisfied with your assessment, 
                        contact us within 30 days for a full refund.
                      </p>
                    </div>
                  )}
                </div>

                {/* FAQ 5 */}
                <div className="border border-gray-200 rounded-lg">
                  <button 
                    onClick={() => toggleFAQ(4)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                  >
                    <span className="font-semibold text-gray-900">What if I have more questions?</span>
                    <svg 
                      className={`w-5 h-5 text-gray-500 transition-transform ${openFAQ === 4 ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFAQ === 4 && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600">
                        Our support team is here to help! You can reach us at support@brightnest.com or through our 
                        live chat. We typically respond within 2 hours during business hours.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen" style={{backgroundColor: '#faf8f0'}}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading checkout...</p>
          </div>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}