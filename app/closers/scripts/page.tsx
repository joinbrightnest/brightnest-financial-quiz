"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CloserHeader from '../components/CloserHeader';

interface Closer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalCalls: number;
  totalConversions: number;
  totalRevenue: number;
  conversionRate: number;
}

export default function CloserScripts() {
  const [closer, setCloser] = useState<Closer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'call' | 'email'>('call');
  const [activeEmailCategory, setActiveEmailCategory] = useState<string>('initial');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('closerToken');
    
    if (!token) {
      router.push('/closers/login');
      return;
    }

    fetchCloserStats(token);
  }, [router]);

  const fetchCloserStats = async (token: string) => {
    try {
      const response = await fetch('/api/closer/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCloser(data.closer);
      }
    } catch (error) {
      console.error('Error fetching closer stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('closerToken');
    localStorage.removeItem('closerData');
    router.push('/closers/login');
  };

  // Call Script - Single flowing script
  const callScript = `=== OPENING & INTRODUCTION ===

Hi [Customer Name], this is [Your Name] from BrightNest. 

I'm calling because you recently completed our financial profile quiz and scheduled a call with us. How are you doing today?

[Pause for response]

Great! I wanted to take a few minutes to discuss your results and see how we can help you achieve your financial goals. Does now work for you, or would you prefer to schedule a different time?


=== DISCOVERY QUESTIONS ===

Before we dive into your results, I'd love to understand your situation a bit better:

1. What's your biggest financial challenge right now?
2. What are you hoping to achieve in the next 6-12 months?
3. What's currently keeping you from reaching those goals?
4. Have you worked with a financial advisor before?

[Take notes and listen actively - these answers will guide your pitch]


=== PRESENTING THE SOLUTION ===

Based on your quiz results and what you've shared, I think we can really help you. 

Your financial profile shows you're a [archetype type], which means you typically [describe traits]. 

Here's how BrightNest can help:
- [Customized solution based on their needs]
- [Specific benefit relevant to their goals]
- [How it addresses their challenges]

Does this sound like something that could help you achieve [their stated goal]?


=== OBJECTION HANDLING ===

"I need to think about it"
→ I understand. What specifically would you like to think about? Is there something I haven't addressed yet?

"I can't afford it right now"
→ I appreciate your honesty. What would make this affordable for you? What's your budget range?

"I'm not sure if this is right for me"
→ Let's talk about that. What concerns you most? What would need to happen for you to feel confident this is the right fit?

"I need to talk to my spouse/partner"
→ Absolutely, that's important. When would be a good time for both of you to review this together?


=== CLOSING TECHNIQUES ===

Assumptive Close:
"Perfect! I'll get you set up today. What payment method works best for you?"

Alternative Choice Close:
"Would you prefer to start with the [Option A] or [Option B] package?"

Urgency Close:
"We have a limited number of spots available this month. Would you like to secure your spot today?"

Benefit Summary Close:
"Based on everything we discussed, this will help you [benefit 1], [benefit 2], and [benefit 3]. Let's get you started, shall we?"`;

  // Email Templates by Stage
  const emailTemplates = {
    initial: {
      title: "Initial Contact / Confirmation",
      subject: "Welcome to BrightNest - Your Financial Profile Results",
      content: `Hi [Customer Name],

Thank you for completing our financial profile quiz! I'm excited to review your results with you during our scheduled call on [Date] at [Time].

Before we speak, I wanted to send you a quick overview of what to expect:

• Review of your financial profile and archetype
• Personalized recommendations based on your goals
• Discussion of how BrightNest can help you achieve financial success

If you need to reschedule, please let me know as soon as possible.

Looking forward to speaking with you!

Best regards,
[Your Name]
BrightNest Financial Advisor`
    },
    converted: {
      title: "Purchase Confirmation / Thank You",
      subject: "Thank You for Choosing BrightNest!",
      content: `Hi [Customer Name],

Thank you for your purchase! I'm thrilled to be working with you on your financial journey.

Here's what happens next:

1. You'll receive your welcome package within 24 hours
2. We'll schedule your first strategy session
3. I'll be your dedicated advisor throughout this process

If you have any questions before we get started, don't hesitate to reach out.

Looking forward to helping you achieve your financial goals!

Best regards,
[Your Name]
BrightNest Financial Advisor`
    },
    not_interested: {
      title: "Not Interested - Follow Up",
      subject: "Keeping in Touch - BrightNest",
      content: `Hi [Customer Name],

I understand that now might not be the right time for you, and I completely respect that decision.

I wanted to let you know that I'm here if your situation changes. Financial planning is a journey, and sometimes timing is everything.

I'll keep you on our newsletter list so you can stay updated on financial tips and strategies. Of course, you can unsubscribe at any time.

If you have any questions in the future or want to revisit this conversation, please don't hesitate to reach out.

Best of luck with your financial goals!

Best regards,
[Your Name]
BrightNest Financial Advisor`
    },
    needs_follow_up: {
      title: "Needs Follow Up",
      subject: "Following Up on Our Conversation",
      content: `Hi [Customer Name],

I wanted to follow up on our conversation from [Date]. I know you mentioned [specific concern or question] and wanted to address that.

[Address their specific concern or provide additional information]

I'd love to continue our conversation and see how we can help you achieve your financial goals. Would you be available for a quick call this week?

If you have any questions in the meantime, feel free to reply to this email.

Best regards,
[Your Name]
BrightNest Financial Advisor`
    },
    callback_requested: {
      title: "Callback Requested",
      subject: "Re: Your Callback Request",
      content: `Hi [Customer Name],

Thank you for your interest! I received your request for a callback.

I'm available at the following times this week:
• [Day], [Date] at [Time]
• [Day], [Date] at [Time]
• [Day], [Date] at [Time]

Please let me know which time works best for you, or feel free to suggest another time that's more convenient.

I'm looking forward to speaking with you!

Best regards,
[Your Name]
BrightNest Financial Advisor`
    },
    rescheduled: {
      title: "Rescheduled Appointment",
      subject: "Appointment Rescheduled - Confirmation",
      content: `Hi [Customer Name],

I've confirmed the rescheduling of our appointment. Our new call is scheduled for:

Date: [New Date]
Time: [New Time]

If you need to make any changes, please let me know at least 24 hours in advance.

I'm looking forward to our conversation!

Best regards,
[Your Name]
BrightNest Financial Advisor`
    },
    no_answer: {
      title: "No Answer - Follow Up",
      subject: "Tried Reaching You - BrightNest",
      content: `Hi [Customer Name],

I tried reaching you today but wasn't able to connect. I wanted to follow up on your scheduled appointment.

I'm still excited to discuss your financial profile results with you. Would you be available for a call at one of these times?

• [Day], [Date] at [Time]
• [Day], [Date] at [Time]
• [Day], [Date] at [Time]

Alternatively, feel free to reply with a time that works better for you.

Looking forward to speaking with you soon!

Best regards,
[Your Name]
BrightNest Financial Advisor`
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!closer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access scripts.</p>
        </div>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#faf8f0'}}>
      <CloserHeader closer={closer} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Scripts & Templates</h1>
              <p className="text-gray-600 mt-1">Call scripts and email templates organized by stage</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('call')}
                className={`flex-1 py-4 px-6 text-center text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'call'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Scripts
                </div>
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`flex-1 py-4 px-6 text-center text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'email'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Templates
                </div>
              </button>
            </nav>
          </div>

          {/* Call Scripts Content */}
          {activeTab === 'call' && (
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Complete Call Script</h3>
                  <button
                    onClick={() => copyToClipboard(callScript)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy Script</span>
                  </button>
                </div>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans bg-white p-6 rounded border border-gray-200 leading-relaxed">
                    {callScript}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Email Templates Content */}
          {activeTab === 'email' && (
            <div className="p-6">
              {/* Email Category Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Email Template by Stage:</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(emailTemplates).map(([key, template]) => (
                    <button
                      key={key}
                      onClick={() => setActiveEmailCategory(key)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${
                        activeEmailCategory === key
                          ? 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      {template.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Email Template */}
              {emailTemplates[activeEmailCategory as keyof typeof emailTemplates] && (() => {
                const template = emailTemplates[activeEmailCategory as keyof typeof emailTemplates];
                return (
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{template.title}</h3>
                        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 inline-block">
                          <span className="text-sm text-gray-600">Subject: </span>
                          <span className="text-sm font-semibold text-gray-900">{template.subject}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(template.content)}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Copy Email</span>
                      </button>
                    </div>
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans bg-white p-4 rounded border border-gray-200">
                        {template.content}
                      </pre>
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>When to use:</strong> {template.title === 'Initial Contact / Confirmation' ? 'Send this before the scheduled call' :
                        template.title === 'Purchase Confirmation / Thank You' ? 'Send after a successful conversion (outcome: converted)' :
                        template.title === 'Not Interested - Follow Up' ? 'Send after marking lead as "Not Interested" (outcome: not_interested)' :
                        template.title === 'Needs Follow Up' ? 'Send after marking lead as "Needs Follow Up" (outcome: needs_follow_up)' :
                        template.title === 'Callback Requested' ? 'Send when lead requests a callback (outcome: callback_requested)' :
                        template.title === 'Rescheduled Appointment' ? 'Send after rescheduling an appointment (outcome: rescheduled)' :
                        template.title === 'No Answer - Follow Up' ? 'Send after marking lead as "No Answer" (outcome: no_answer)' : 'Use as appropriate for the situation'}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

