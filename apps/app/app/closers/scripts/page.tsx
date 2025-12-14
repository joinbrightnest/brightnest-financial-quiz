"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CloserSidebar from '../components/CloserSidebar';
import ContentLoader from '../components/ContentLoader';
import { useCloserAuth, useActiveTaskCount } from '../hooks';

export default function CloserScripts() {
  const { closer, isLoading: isAuthLoading, isAuthenticated, handleLogout } = useCloserAuth();
  const { activeTaskCount } = useActiveTaskCount();

  const [activeTab, setActiveTab] = useState<'call' | 'email'>('call');
  const [activeEmailCategory, setActiveEmailCategory] = useState<string>('initial');
  const [activeCallCategory, setActiveCallCategory] = useState<'script' | 'program'>('script');
  const [script, setScript] = useState<{ callScript?: string; programDetails?: Record<string, string>; emailTemplates?: Record<string, { title: string; subject: string; content: string }> } | null>(null);
  const [scriptLoading, setScriptLoading] = useState(true);

  // Fetch scripts when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchScript();
    }
  }, [isAuthenticated]);

  const isLoading = isAuthLoading || scriptLoading;

  const fetchScript = async () => {
    try {
      const response = await fetch('/api/closer/scripts', {
        // 🔒 SECURITY: Use httpOnly cookie for authentication
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.script) {
          setScript(data.script);
        }
      }
    } catch (error) {
      console.error('Error fetching script:', error);
    } finally {
      setScriptLoading(false);
    }
  };

  // Get script data from API or use defaults
  const callScript = script?.callScript || `=== OPENING & INTRODUCTION ===

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

  // Program Details - Get from API or use defaults
  const programDetails = script?.programDetails || {
    companyOverview: `=== COMPANY OVERVIEW ===

BrightNest is a financial advisory firm dedicated to helping individuals achieve their financial goals through personalized guidance and comprehensive financial planning.

Our mission is to simplify complex financial concepts and make wealth-building accessible to everyone, regardless of their current financial situation.

We combine expert financial advice with modern technology to provide our clients with the tools and support they need to build lasting financial security.`,

    programBenefits: `=== PROGRAM BENEFITS & FEATURES ===

What clients receive with BrightNest:

• Personalized Financial Plan
  - Custom roadmap tailored to individual goals and risk tolerance
  - Comprehensive analysis of current financial situation
  - Clear action steps for achieving financial objectives

• Expert Financial Guidance
  - One-on-one consultations with certified financial advisors
  - Ongoing support and accountability
  - Regular check-ins to track progress and adjust strategies

• Financial Education & Resources
  - Educational materials and workshops
  - Access to financial planning tools and calculators
  - Stay informed about financial best practices

• Investment Strategy & Management
  - Diversified portfolio recommendations
  - Risk management strategies
  - Long-term wealth building approaches

• Debt Management
  - Strategies for debt reduction and elimination
  - Budget planning and cash flow optimization
  - Credit improvement guidance

• Retirement Planning
  - Retirement savings strategies
  - 401(k) and IRA optimization
  - Planning for financial independence

• Tax Optimization
  - Strategies to minimize tax liabilities
  - Tax-efficient investment approaches
  - Year-end tax planning`,

    pricing: `=== PRICING INFORMATION ===

BrightNest offers flexible pricing options to fit different needs and budgets:

• Starter Plan - $[X]/month or $[Y]/annually (save 10%)
  - Basic financial plan
  - Access to core tools and resources
  - Monthly group webinars
  - Email support

• Growth Plan - $[A]/month or $[B]/annually (save 15%)
  - All Starter Plan features, plus:
  - Dedicated advisor check-ins (quarterly)
  - Personalized investment recommendations
  - Advanced budgeting tools
  - Priority support

• Premium Plan - $[C]/month or $[D]/annually (save 20%)
  - All Growth Plan features, plus:
  - Monthly one-on-one advisor sessions
  - Advanced tax planning strategies
  - Estate planning guidance
  - Exclusive investment opportunities
  - 24/7 premium support

All plans include:
- 30-day money-back guarantee
- No long-term contracts required
- Easy plan upgrades or downgrades
- Cancel anytime

[Note: Update pricing amounts as needed]`,

    commonQuestions: `=== COMMON QUESTIONS & ANSWERS ===

Q: What makes BrightNest different from other financial advisors?
A: We combine personalized human guidance with cutting-edge technology. We focus on actionable plans, continuous support, and empowering our clients with financial literacy, rather than just managing assets.

Q: Is BrightNest suitable for beginners?
A: Absolutely! Our Starter Plan is specifically designed for individuals new to financial planning, providing foundational knowledge and tools to get started.

Q: How often will I meet with my financial advisor?
A: This depends on your plan. Starter Plan includes group webinars, Growth Plan offers quarterly one-on-one check-ins, and Premium Plan provides monthly one-on-one sessions. Additional sessions can be scheduled as needed.

Q: Is my financial data secure with BrightNest?
A: Yes, data security is our top priority. We use industry-leading encryption and security protocols to protect all client information. We are fully compliant with relevant financial data protection regulations.

Q: Can I upgrade or downgrade my plan?
A: Yes, you can easily upgrade or downgrade your plan at any time through your dashboard or by contacting your advisor. Changes will take effect at the start of your next billing cycle.

Q: What if I'm not satisfied with the service?
A: We offer a 30-day money-back guarantee. If you're not completely satisfied within the first 30 days, we'll provide a full refund.

Q: Do you work with people who have debt?
A: Yes! Debt management is one of our core services. We help clients create strategies to pay off debt efficiently while building wealth.

Q: What's the minimum investment required?
A: There's no minimum investment required to get started. We work with clients at all financial levels, from those just starting out to those with substantial assets.

Q: How quickly can I see results?
A: Results vary based on individual situations and goals. Most clients see immediate benefits from having a clear financial plan. Long-term wealth building typically shows results over months and years.

Q: Can I cancel anytime?
A: Yes, there are no long-term contracts. You can cancel your subscription at any time.`,

    process: `=== THE PROCESS ===

What happens after a client signs up:

1. Welcome & Onboarding (Week 1)
   - Welcome email with account setup instructions
   - Access to client dashboard and tools
   - Initial financial assessment questionnaire

2. First Consultation (Week 1-2)
   - Review of financial assessment
   - Discussion of goals and priorities
   - Initial recommendations and strategy

3. Custom Financial Plan Delivery (Week 2-3)
   - Comprehensive financial plan created
   - Detailed roadmap with action steps
   - Review session to go over the plan

4. Implementation & Support (Ongoing)
   - Regular check-ins based on plan level
   - Progress tracking and adjustments
   - Ongoing education and resources

5. Regular Reviews
   - Quarterly or monthly reviews (plan dependent)
   - Strategy adjustments as needed
   - Goal progress assessment`
  };

  // Email Templates - Get from API or use defaults
  const emailTemplates = script?.emailTemplates || {
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex overflow-hidden">
      {/* Left Sidebar - Always visible */}
      <CloserSidebar closer={closer} onLogout={handleLogout} activeTaskCount={activeTaskCount} />

      {/* Show loading or content */}
      {isLoading || !closer ? (
        <ContentLoader />
      ) : (
        <>
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Top Header Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Scripts & Templates</h2>
                <p className="text-sm text-gray-600 mt-1">Call scripts and email templates organized by stage</p>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="w-full px-4 sm:px-6 lg:px-8 py-8">

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                  <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                      <button
                        onClick={() => setActiveTab('call')}
                        className={`flex-1 py-4 px-6 text-center text-sm font-medium border-b-2 transition-colors ${activeTab === 'call'
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
                        className={`flex-1 py-4 px-6 text-center text-sm font-medium border-b-2 transition-colors ${activeTab === 'email'
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
                      {/* Sub-navigation for Call Scripts */}
                      <div className="mb-6 flex space-x-4 border-b border-gray-200 pb-4">
                        <button
                          onClick={() => setActiveCallCategory('script')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeCallCategory === 'script'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          Call Script
                        </button>
                        <button
                          onClick={() => setActiveCallCategory('program')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeCallCategory === 'program'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          Program Details
                        </button>
                      </div>

                      {/* Call Script View */}
                      {activeCallCategory === 'script' && (
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
                      )}

                      {/* Program Details View */}
                      {activeCallCategory === 'program' && (
                        <div className="space-y-6">
                          {Object.entries(programDetails).map(([key, content]) => {
                            const titles: { [key: string]: string } = {
                              companyOverview: 'Company Overview',
                              programBenefits: 'Program Benefits & Features',
                              pricing: 'Pricing Information',
                              commonQuestions: 'Common Questions & Answers',
                              process: 'The Process'
                            };
                            const contentStr = typeof content === 'string' ? content : String(content);

                            return (
                              <div key={key} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                <div className="flex items-start justify-between mb-4">
                                  <h3 className="text-xl font-bold text-gray-900">{titles[key]}</h3>
                                  <button
                                    onClick={() => copyToClipboard(contentStr)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <span>Copy Section</span>
                                  </button>
                                </div>
                                <div className="prose max-w-none">
                                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans bg-white p-6 rounded border border-gray-200 leading-relaxed">
                                    {contentStr}
                                  </pre>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Email Templates Content */}
                  {activeTab === 'email' && (
                    <div className="p-6">
                      {/* Email Category Selector */}
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Email Template by Stage:</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.entries(emailTemplates).map(([key, template]) => {
                            const templateObj = template as { title: string; subject: string; content: string };
                            return (
                              <button
                                key={key}
                                onClick={() => setActiveEmailCategory(key)}
                                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${activeEmailCategory === key
                                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                                  }`}
                              >
                                {templateObj.title}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Selected Email Template */}
                      {emailTemplates[activeEmailCategory as keyof typeof emailTemplates] && (() => {
                        const template = emailTemplates[activeEmailCategory as keyof typeof emailTemplates] as { title: string; subject: string; content: string };
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
          </div>
        </>
      )}
    </div>
  );
}

