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

export default function CloserRules() {
  const [closer, setCloser] = useState<Closer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'training' | 'status' | 'procedures' | 'guidelines'>('training');
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

  // Training content outline
  const trainingContent = {
    onboarding: `=== ONBOARDING & ORIENTATION ===

Welcome to BrightNest! This section covers everything you need to know to get started as a closer.

BASIC RESPONSIBILITIES:
• Make outbound calls to leads who completed the financial profile quiz
• Understand customer needs and present BrightNest solutions
• Update appointment status and outcome after each call
• Document call notes and recording links
• Follow up with leads as needed

KEY TOOLS:
• Dashboard: View your uncontacted appointments
• Database: Access all contacted leads and their history
• Scripts: Reference call scripts and email templates
• Tasks: Manage follow-up tasks and reminders
• Rules: This page - internal procedures and guidelines

GETTING STARTED:
1. Review your assigned script in the Scripts section
2. Familiarize yourself with the BrightNest program details
3. Review status explanations below to understand when to use each outcome
4. Practice the call script before your first call
5. Start with your first appointment from the Dashboard`,

    callTechniques: `=== EFFECTIVE CALL TECHNIQUES ===

OPENING THE CALL:
• Always identify yourself and BrightNest clearly
• Reference the quiz they completed to establish context
• Ask permission before proceeding ("Does now work for you?")
• Be warm, professional, and genuinely interested

ACTIVE LISTENING:
• Take notes during the call - capture key pain points
• Repeat back what you heard to confirm understanding
• Ask follow-up questions to dig deeper
• Let the customer finish speaking before responding

DISCOVERY QUESTIONS:
• Focus on understanding their financial goals
• Identify their biggest challenges
• Understand what's preventing them from reaching goals
• Determine if they've worked with advisors before

PRESENTING SOLUTIONS:
• Match BrightNest solutions to their specific needs
• Use their quiz results to personalize the conversation
• Address objections with empathy and understanding
• Focus on benefits, not just features

CLOSING:
• Use assumptive language when appropriate
• Offer choices rather than yes/no questions
• Create urgency when genuine (limited spots, etc.)
• Always ask for the sale if they're interested`,

    objectionHandling: `=== OBJECTION HANDLING STRATEGIES ===

"I need to think about it"
→ Dig deeper: "What specifically would you like to think about? Is there something I haven't addressed yet?"
→ Create urgency: "What would need to happen for you to feel confident moving forward today?"

"I can't afford it right now"
→ Understand their situation: "I appreciate your honesty. What would make this affordable for you?"
→ Reframe value: "What would it cost you NOT to address [their challenge]?"
→ Explore options: "What's your budget range? Let's see what we can work with."

"I'm not sure if this is right for me"
→ Address concerns: "Let's talk about that. What concerns you most?"
→ Provide clarity: "What would need to happen for you to feel confident this is the right fit?"
→ Social proof: "Many people with similar situations have found success with BrightNest."

"I need to talk to my spouse/partner"
→ Validate: "Absolutely, that's important. Financial decisions should be made together."
→ Schedule: "When would be a good time for both of you to review this together?"
→ Provide materials: "I can send you some information to review together."

"It's too expensive"
→ Break down value: "Let's think about this in terms of monthly investment. For [price]/month, you get..."
→ Compare costs: "What are you currently spending on [related expenses]? This replaces/improves that."
→ ROI perspective: "If this helps you [achieve goal], what's that worth to you?"`,

    bestPractices: `=== BEST PRACTICES ===

PRE-CALL PREPARATION:
• Review the lead's quiz answers before calling
• Understand their financial archetype
• Prepare relevant talking points based on their answers
• Have your script and program details ready

DURING THE CALL:
• Be present and focused - eliminate distractions
• Take detailed notes - you'll need them for follow-up
• Be authentic - don't sound scripted
• Show genuine interest in helping them

POST-CALL:
• Update the outcome immediately after the call
• Add detailed notes while the conversation is fresh
• Upload recording link if available
• Set follow-up tasks if needed
• Send appropriate email template if applicable

COMMUNICATION:
• Always be professional and courteous
• Respect their time - keep calls focused
• Follow up in a timely manner
• Be responsive to questions and concerns

SELF-CARE:
• Take breaks between calls
• Stay organized with tasks and follow-ups
• Track your performance and celebrate wins
• Learn from each call to improve`,

    roleplayScenarios: `=== ROLEPLAY SCENARIOS ===

SCENARIO 1: Budget-Conscious Customer
Situation: Customer completed quiz focused on "emergency savings" but mentions they're on a tight budget.

Approach:
• Acknowledge their financial responsibility
• Emphasize how BrightNest can help them build savings faster
• Highlight the Starter Plan as an affordable entry point
• Focus on ROI and long-term savings

SCENARIO 2: Debt-Focused Customer
Situation: Customer's primary goal is paying off debt.

Approach:
• Validate their priority (debt elimination is important)
• Explain how BrightNest includes debt management strategies
• Show how proper financial planning prevents future debt
• Connect debt payoff to their long-term goals

SCENARIO 3: Investment-Interested Customer
Situation: Customer wants to start investing but feels overwhelmed.

Approach:
• Educate without overwhelming
• Highlight BrightNest's investment guidance
• Show how we simplify complex concepts
• Emphasize personalized approach vs. DIY

SCENARIO 4: Skeptical Customer
Situation: Customer has tried advisors before with poor results.

Approach:
• Acknowledge their previous experience
• Explain what makes BrightNest different
• Focus on our personalized, educational approach
• Offer testimonials or case studies if available
• Suggest starting with a smaller commitment`
  };

  // Status explanations
  const statusExplanations = {
    converted: {
      title: 'Converted (Purchase Made)',
      whenToUse: `Use this status when:
• Customer agrees to purchase a BrightNest plan during the call
• Payment has been processed or scheduled
• Customer has committed to signing up
• Sale is confirmed and documented`,
      whatToDo: `Actions required:
1. Record the sale value in the system
2. Upload call recording link (if available)
3. Add detailed notes about what they purchased
4. Send "Purchase Confirmation" email template
5. Ensure all commission and affiliate tracking is accurate`,
      notes: `Important notes:
• Always confirm the exact amount of the sale
• Document which plan they selected
• Note any special terms or arrangements
• Record customer enthusiasm level and key decision factors`
    },

    not_interested: {
      title: 'Not Interested',
      whenToUse: `Use this status when:
• Customer explicitly states they're not interested
• They've heard the pitch and declined
• They don't see value in BrightNest at this time
• Timing is not right and they're firm about it`,
      whatToDo: `Actions required:
1. Add notes explaining why they weren't interested
2. Upload call recording link (if available)
3. Send "Not Interested - Follow Up" email template
4. Note any specific objections for training purposes`,
      notes: `Important notes:
• Be respectful - they may become interested later
• Document their objections for product improvement
• Leave the door open for future contact
• Some "not interested" can become "needs follow up" with nurturing`
    },

    needs_follow_up: {
      title: 'Needs Follow Up',
      whenToUse: `Use this status when:
• Customer is interested but needs more information
• They want to review materials before deciding
• They have specific questions that need research
• They're comparing options and need time
• They want to discuss with spouse/partner`,
      whatToDo: `Actions required:
1. Create a follow-up task with a specific date
2. Add detailed notes about what they need
3. Upload call recording link (if available)
4. Send "Needs Follow Up" email template with relevant info
5. Schedule next contact in your calendar`,
      notes: `Important notes:
• This is often the most convertible status
• Prompt follow-up is critical (within 24-48 hours)
• Personalize follow-up based on their specific needs
• Provide exactly what they asked for (materials, answers, etc.)`
    },

    callback_requested: {
      title: 'Callback Requested',
      whenToUse: `Use this status when:
• Customer explicitly asks you to call them back
• They need to check their schedule for a better time
• They want to prepare before the conversation
• Initial contact was not ideal timing for them`,
      whatToDo: `Actions required:
1. Schedule the callback in your calendar
2. Create a task reminder for the callback
3. Add notes about best time to call
4. Send "Callback Requested" email confirming the callback
5. Note any specific topics to cover in callback`,
      notes: `Important notes:
• Honor their requested callback time
• Be prepared when you call back
• Reference previous conversation to show you remember
• This shows respect for their time and schedule`
    },

    rescheduled: {
      title: 'Rescheduled',
      whenToUse: `Use this status when:
• Customer needs to move their scheduled appointment
• They can't make the originally scheduled time
• They request a different time that works better
• Appointment time was changed at their request`,
      whatToDo: `Actions required:
1. Update the appointment time in the system
2. Confirm the new time with the customer
3. Send "Rescheduled Appointment" email template
4. Add notes about the reason for rescheduling
5. Update your calendar with the new time`,
      notes: `Important notes:
• Rescheduling is normal - don't take it personally
• Confirm the new time clearly
• Send confirmation to avoid confusion
• Be flexible but also set boundaries`
    },

    no_answer: {
      title: 'No Answer',
      whenToUse: `Use this status when:
• You called but the customer didn't answer
• No voicemail was left or they didn't return call
• Multiple attempts to reach them were unsuccessful
• Customer's phone went straight to voicemail`,
      whatToDo: `Actions required:
1. Add notes about call attempts (time, result)
2. Send "No Answer - Follow Up" email template
3. Create a task to try again later
4. Try alternative contact methods if available
5. Note if voicemail was left`,
      notes: `Important notes:
• Don't give up after one attempt
• Try different times of day
• Email can be more effective if calls aren't working
• Some customers prefer email communication
• Document all contact attempts`
    },

    wrong_number: {
      title: 'Wrong Number',
      whenToUse: `Use this status when:
• The phone number is incorrect or disconnected
• You reached someone who isn't the customer
• The number belongs to someone else entirely
• Customer's contact information is invalid`,
      whatToDo: `Actions required:
1. Add notes explaining what happened
2. Try to find alternative contact information
3. Send email to customer (if email is valid)
4. Note that contact information needs updating
5. Flag for admin review if information is consistently wrong`,
      notes: `Important notes:
• Verify you dialed the correct number
• Some customers may have multiple numbers
• Try email contact if phone fails
• Wrong numbers should be rare - flag patterns to admin`
    }
  };

  // Procedures
  const procedures = {
    dailyWorkflow: `=== DAILY WORKFLOW PROCEDURES ===

START OF DAY:
1. Log in to your BrightNest dashboard
2. Review your appointments for the day
3. Check for any pending tasks or follow-ups
4. Review any new leads assigned to you
5. Prepare your workspace and materials

BEFORE EACH CALL:
1. Review the lead's quiz answers and profile
2. Understand their financial archetype
3. Review their stated goals and challenges
4. Prepare relevant talking points
5. Have your script and program details ready
6. Ensure you have a quiet environment

DURING THE CALL:
1. Introduce yourself and BrightNest clearly
2. Reference their quiz completion
3. Ask permission to proceed
4. Conduct discovery questions
5. Present relevant solutions
6. Handle objections professionally
7. Attempt to close or schedule follow-up
8. Take detailed notes throughout

AFTER EACH CALL:
1. Update appointment outcome immediately
2. Enter sale value if converted
3. Add comprehensive call notes
4. Upload recording link if available
5. Send appropriate email template
6. Create follow-up tasks if needed
7. Update your calendar with next steps

END OF DAY:
1. Complete all call documentation
2. Review tasks for tomorrow
3. Prepare for next day's appointments
4. Update any pending items
5. Log out securely`,

    updatingStatus: `=== UPDATING APPOINTMENT STATUS ===

STEP 1: ACCESS THE APPOINTMENT
• Go to Dashboard or Database
• Find the appointment you just completed
• Click "Update Status" button

STEP 2: SELECT OUTCOME
• Choose the appropriate outcome from the dropdown
• Refer to Status Explanations section if unsure
• Select the outcome that best matches the call result

STEP 3: ENTER DETAILS
• Sale Value: Enter amount if customer converted (required for "converted")
• Call Notes: Add detailed notes about the conversation
• Recording Link: Paste the call recording URL if available

STEP 4: SAVE AND FOLLOW UP
• Click "Save" to update the appointment
• System will automatically send appropriate email template
• Create follow-up tasks if needed
• Update your calendar with next steps

IMPORTANT REMINDERS:
• Always update status immediately after the call
• Detailed notes help with follow-up and training
• Recording links are valuable for review and quality
• Accurate sale values ensure proper commission tracking`,

    taskManagement: `=== TASK MANAGEMENT PROCEDURES ===

CREATING TASKS:
• Tasks help you track follow-ups and reminders
• Create a task for any lead that needs follow-up
• Set specific due dates based on urgency
• Add detailed descriptions of what needs to be done

TASK TYPES:
• Follow-up calls: Customer needs more time or information
• Email follow-ups: Send specific materials or answers
• Research tasks: Look up information for customer
• Appointment reminders: Don't forget scheduled calls

PRIORITY LEVELS:
• Urgent: Requires immediate attention (same day)
• High: Important, complete within 24-48 hours
• Medium: Standard priority, complete within 3-5 days
• Low: Can be completed when time permits

MANAGING TASKS:
• Review your task list daily
• Complete tasks in priority order
• Update task status as you work
• Mark tasks complete when finished
• Delete tasks that are no longer needed`,

    emailTemplates: `=== USING EMAIL TEMPLATES ===

WHEN TO SEND EMAILS:
• Initial Contact: Before the scheduled call
• Purchase Confirmation: After successful conversion
• Not Interested: After customer declines
• Needs Follow Up: When follow-up is required
• Callback Requested: When customer asks for callback
• Rescheduled: When appointment time changes
• No Answer: After unsuccessful call attempts

HOW TO USE:
1. Go to Scripts section
2. Click on "Email Templates" tab
3. Select the appropriate template
4. Copy the template content
5. Personalize with customer's name and details
6. Send via your email system

PERSONALIZATION:
• Always use the customer's name
• Reference specific details from your conversation
• Customize based on their situation
• Add relevant information they requested
• Keep the tone professional but warm

BEST PRACTICES:
• Send emails promptly after the call
• Personalize beyond just the template
• Include next steps clearly
• Make it easy for them to respond
• Follow up if no response within 48 hours`,

    qualityStandards: `=== QUALITY STANDARDS ===

CALL QUALITY:
• Professional and courteous at all times
• Clear communication and articulation
• Active listening and engagement
• Appropriate pace and tone
• Genuine interest in helping the customer

DOCUMENTATION:
• All calls must be documented within 24 hours
• Notes should be comprehensive and detailed
• Include key objections and responses
• Document customer's goals and challenges
• Record outcomes accurately

FOLLOW-UP:
• Follow up within 24-48 hours when required
• Personalize follow-up communications
• Provide requested information promptly
• Maintain consistent communication
• Respect customer's time and preferences

ETHICS:
• Always be honest and transparent
• Don't make false promises
• Respect customer's decisions
• Maintain confidentiality
• Follow all compliance requirements`
  };

  // Guidelines
  const guidelines = {
    communication: `=== COMMUNICATION GUIDELINES ===

TONE AND MANNER:
• Professional but approachable
• Warm and genuine
• Confident but not pushy
• Respectful of their time
• Empathetic to their situation

LANGUAGE:
• Use clear, simple language
• Avoid financial jargon unless explaining
• Speak at an appropriate pace
• Pause to allow response
• Confirm understanding

LISTENING:
• Give full attention to the customer
• Don't interrupt or rush them
• Take notes while they speak
• Ask clarifying questions
• Show you understand their situation

QUESTIONING:
• Ask open-ended questions
• Dig deeper into their answers
• Understand their motivations
• Identify pain points
• Discover decision-making factors`,

    compliance: `=== COMPLIANCE & LEGAL ===

REQUIRED DISCLOSURES:
• Always identify yourself and BrightNest
• Be transparent about services and pricing
• Don't make guarantees or promises
• Disclose any relevant terms or conditions
• Follow all financial services regulations

DO NOT:
• Misrepresent BrightNest services
• Make false claims about results
• Pressure customers into decisions
• Share customer information inappropriately
• Violate any privacy regulations

RECORDING:
• Inform customers if calls are recorded
• Follow local recording consent laws
• Store recordings securely
• Only share recordings with authorized personnel
• Delete recordings per retention policy

DATA PROTECTION:
• Keep customer information confidential
• Use secure systems for all data
• Don't share customer details inappropriately
• Follow data protection regulations
• Report any data breaches immediately`,

    performance: `=== PERFORMANCE EXPECTATIONS ===

METRICS:
• Conversion rate (target: [X]%)
• Average call duration
• Follow-up completion rate
• Task completion rate
• Customer satisfaction

GOALS:
• Make [X] calls per day
• Convert [Y]% of calls
• Follow up within 24 hours
• Complete all tasks on time
• Maintain high quality standards

IMPROVEMENT:
• Review call recordings regularly
• Seek feedback from supervisors
• Participate in training sessions
• Learn from successful calls
• Continuously improve your skills

TRACKING:
• Monitor your dashboard metrics
• Review your conversion rates
• Track your follow-up success
• Measure task completion
• Identify areas for improvement`,

    escalation: `=== ESCALATION PROCEDURES ===

WHEN TO ESCALATE:
• Customer has complex financial situation beyond your expertise
• Customer requests to speak with a supervisor
• Technical issues preventing call completion
• Customer complaints or concerns
• Situations requiring specialized knowledge

HOW TO ESCALATE:
1. Document the situation in call notes
2. Contact your supervisor immediately
3. Provide all relevant details
4. Follow supervisor's guidance
5. Update the customer on next steps

CONTACTS:
• Supervisor: [Name] - [Email] - [Phone]
• Technical Support: [Email] - [Phone]
• Compliance: [Email]
• Emergency: [Phone]

DOCUMENTATION:
• Always document escalations
• Include reason for escalation
• Note who was contacted
• Record resolution or next steps
• Follow up as needed`
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
          <p className="text-gray-600">Please log in to access internal rules.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#faf8f0'}}>
      <CloserHeader closer={closer} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Internal Rules & Guidelines</h1>
              <p className="text-gray-600 mt-1">Training materials, status explanations, procedures, and best practices</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('training')}
                className={`flex-1 py-4 px-6 text-center text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'training'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Training
                </div>
              </button>
              <button
                onClick={() => setActiveTab('status')}
                className={`flex-1 py-4 px-6 text-center text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'status'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Status Guide
                </div>
              </button>
              <button
                onClick={() => setActiveTab('procedures')}
                className={`flex-1 py-4 px-6 text-center text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'procedures'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Procedures
                </div>
              </button>
              <button
                onClick={() => setActiveTab('guidelines')}
                className={`flex-1 py-4 px-6 text-center text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'guidelines'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Guidelines
                </div>
              </button>
            </nav>
          </div>

          {/* Training Content */}
          {activeTab === 'training' && (
            <div className="p-6">
              <div className="space-y-6">
                {Object.entries(trainingContent).map(([key, content]) => {
                  const titles: { [key: string]: string } = {
                    onboarding: 'Onboarding & Orientation',
                    callTechniques: 'Effective Call Techniques',
                    objectionHandling: 'Objection Handling Strategies',
                    bestPractices: 'Best Practices',
                    roleplayScenarios: 'Roleplay Scenarios'
                  };
                  
                  return (
                    <div key={key} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{titles[key]}</h3>
                      <div className="prose max-w-none">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans bg-white p-6 rounded border border-gray-200 leading-relaxed">
                          {content}
                        </pre>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status Guide Content */}
          {activeTab === 'status' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Status Guide</h2>
                <p className="text-gray-600">Learn when and how to use each appointment outcome status</p>
              </div>
              <div className="space-y-6">
                {Object.entries(statusExplanations).map(([key, status]) => {
                  const statusColors: { [key: string]: string } = {
                    converted: 'bg-green-100 text-green-800 border-green-200',
                    not_interested: 'bg-red-100 text-red-800 border-red-200',
                    needs_follow_up: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    callback_requested: 'bg-blue-100 text-blue-800 border-blue-200',
                    rescheduled: 'bg-purple-100 text-purple-800 border-purple-200',
                    no_answer: 'bg-gray-100 text-gray-800 border-gray-200',
                    wrong_number: 'bg-orange-100 text-orange-800 border-orange-200'
                  };
                  
                  return (
                    <div key={key} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="flex items-center mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusColors[key] || 'bg-gray-100 text-gray-800'}`}>
                          {status.title}
                        </span>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">When to Use:</h4>
                          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans bg-white p-4 rounded border border-gray-200">
                            {status.whenToUse}
                          </pre>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">What to Do:</h4>
                          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans bg-white p-4 rounded border border-gray-200">
                            {status.whatToDo}
                          </pre>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Important Notes:</h4>
                          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans bg-white p-4 rounded border border-gray-200">
                            {status.notes}
                          </pre>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Procedures Content */}
          {activeTab === 'procedures' && (
            <div className="p-6">
              <div className="space-y-6">
                {Object.entries(procedures).map(([key, content]) => {
                  const titles: { [key: string]: string } = {
                    dailyWorkflow: 'Daily Workflow Procedures',
                    updatingStatus: 'Updating Appointment Status',
                    taskManagement: 'Task Management Procedures',
                    emailTemplates: 'Using Email Templates',
                    qualityStandards: 'Quality Standards'
                  };
                  
                  return (
                    <div key={key} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{titles[key]}</h3>
                      <div className="prose max-w-none">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans bg-white p-6 rounded border border-gray-200 leading-relaxed">
                          {content}
                        </pre>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Guidelines Content */}
          {activeTab === 'guidelines' && (
            <div className="p-6">
              <div className="space-y-6">
                {Object.entries(guidelines).map(([key, content]) => {
                  const titles: { [key: string]: string } = {
                    communication: 'Communication Guidelines',
                    compliance: 'Compliance & Legal',
                    performance: 'Performance Expectations',
                    escalation: 'Escalation Procedures'
                  };
                  
                  return (
                    <div key={key} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{titles[key]}</h3>
                      <div className="prose max-w-none">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans bg-white p-6 rounded border border-gray-200 leading-relaxed">
                          {content}
                        </pre>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

