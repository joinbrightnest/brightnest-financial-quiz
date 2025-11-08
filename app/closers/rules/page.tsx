"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CloserSidebar from '../components/CloserSidebar';
import ContentLoader from '../components/ContentLoader';

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
  const [activeSection, setActiveSection] = useState<string>('onboarding');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeTaskCount, setActiveTaskCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('closerToken');
    
    if (!token) {
      router.push('/closers/login');
      return;
    }

    Promise.all([
      fetchCloserStats(token),
      fetchActiveTaskCount(token)
    ]);
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

  const fetchActiveTaskCount = async (token: string) => {
    try {
      const response = await fetch('/api/closer/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const tasks = await response.json();
        // Handle both response formats: array directly or { tasks: [...] }
        const tasksArray = Array.isArray(tasks) ? tasks : (tasks.tasks || []);
        // Count all non-completed tasks (exclude cancelled)
        const activeCount = tasksArray.filter((t: any) => 
          (t.status === 'pending' || t.status === 'in_progress')
        ).length;
        setActiveTaskCount(activeCount);
      }
    } catch (error) {
      console.error('Error fetching active task count:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('closerToken');
    localStorage.removeItem('closerData');
    router.push('/closers/login');
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const isSectionExpanded = (sectionKey: string) => {
    // Only expanded if explicitly in the set
    return expandedSections.has(sectionKey);
  };

  // Icon component helper
  const Icon = ({ name, className = "w-5 h-5" }: { name: string; className?: string }) => {
    const icons: Record<string, React.ReactElement> = {
      book: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      rocket: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      phone: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      shield: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      star: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      check: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      money: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      x: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      clipboard: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      phoneCall: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      refresh: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      phoneOff: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M1 10.5a17.49 17.49 0 005 2.75M1 10.5a17.49 17.49 0 018 2.75m-8-2.75v1.5m8-2.75v1.5m-8 2.75h8m-8 0H3m5 5.5a17.49 17.49 0 005-2.75m0 0v-1.5m0 1.5h-5m5 0h5" />
        </svg>
      ),
      document: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      sun: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      pencil: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      chat: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      scale: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
      chart: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    };
    return icons[name] || <span className={className}>?</span>;
  };

  // Organized content structure
  const sections = {
    training: {
      title: 'Training & Development',
      icon: 'book',
      color: 'from-slate-600 to-slate-700',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      items: [
        {
          id: 'onboarding',
          title: 'Onboarding & Orientation',
          icon: 'rocket',
          content: {
            intro: 'Welcome to BrightNest! This section covers everything you need to know to get started as a closer.',
            sections: [
              {
                title: 'Basic Responsibilities',
                items: [
                  'Make outbound calls to leads who completed the financial profile quiz',
                  'Understand customer needs and present BrightNest solutions',
                  'Update appointment status and outcome after each call',
                  'Document call notes and recording links',
                  'Follow up with leads as needed'
                ]
              },
              {
                title: 'Key Tools',
                items: [
                  'Dashboard: View your uncontacted appointments',
                  'Database: Access all contacted leads and their history',
                  'Scripts: Reference call scripts and email templates',
                  'Tasks: Manage follow-up tasks and reminders',
                  'Rules: This page - internal procedures and guidelines'
                ]
              },
              {
                title: 'Getting Started',
                items: [
                  'Review your assigned script in the Scripts section',
                  'Familiarize yourself with the BrightNest program details',
                  'Review status explanations to understand when to use each outcome',
                  'Practice the call script before your first call',
                  'Start with your first appointment from the Dashboard'
                ]
              }
            ]
          }
        },
        {
          id: 'call-techniques',
          title: 'Effective Call Techniques',
          icon: 'phone',
          content: {
            intro: 'Master the art of effective phone communication to maximize your success.',
            sections: [
              {
                title: 'Opening the Call',
                items: [
                  'Always identify yourself and BrightNest clearly',
                  'Reference the quiz they completed to establish context',
                  'Ask permission before proceeding ("Does now work for you?")',
                  'Be warm, professional, and genuinely interested'
                ]
              },
              {
                title: 'Active Listening',
                items: [
                  'Take notes during the call - capture key pain points',
                  'Repeat back what you heard to confirm understanding',
                  'Ask follow-up questions to dig deeper',
                  'Let the customer finish speaking before responding'
                ]
              },
              {
                title: 'Discovery Questions',
                items: [
                  'Focus on understanding their financial goals',
                  'Identify their biggest challenges',
                  'Understand what\'s preventing them from reaching goals',
                  'Determine if they\'ve worked with advisors before'
                ]
              },
              {
                title: 'Presenting Solutions',
                items: [
                  'Match BrightNest solutions to their specific needs',
                  'Use their quiz results to personalize the conversation',
                  'Address objections with empathy and understanding',
                  'Focus on benefits, not just features'
                ]
              },
              {
                title: 'Closing',
                items: [
                  'Use assumptive language when appropriate',
                  'Offer choices rather than yes/no questions',
                  'Create urgency when genuine (limited spots, etc.)',
                  'Always ask for the sale if they\'re interested'
                ]
              }
            ]
          }
        },
        {
          id: 'objection-handling',
          title: 'Objection Handling',
          icon: 'shield',
          content: {
            intro: 'Learn how to handle common objections and turn them into opportunities.',
            sections: [
              {
                title: '"I need to think about it"',
                items: [
                  'Dig deeper: "What specifically would you like to think about? Is there something I haven\'t addressed yet?"',
                  'Create urgency: "What would need to happen for you to feel confident moving forward today?"'
                ]
              },
              {
                title: '"I can\'t afford it right now"',
                items: [
                  'Understand their situation: "I appreciate your honesty. What would make this affordable for you?"',
                  'Reframe value: "What would it cost you NOT to address [their challenge]?"',
                  'Explore options: "What\'s your budget range? Let\'s see what we can work with."'
                ]
              },
              {
                title: '"I\'m not sure if this is right for me"',
                items: [
                  'Address concerns: "Let\'s talk about that. What concerns you most?"',
                  'Provide clarity: "What would need to happen for you to feel confident this is the right fit?"',
                  'Social proof: "Many people with similar situations have found success with BrightNest."'
                ]
              },
              {
                title: '"I need to talk to my spouse/partner"',
                items: [
                  'Validate: "Absolutely, that\'s important. Financial decisions should be made together."',
                  'Schedule: "When would be a good time for both of you to review this together?"',
                  'Provide materials: "I can send you some information to review together."'
                ]
              }
            ]
          }
        },
        {
          id: 'best-practices',
          title: 'Best Practices',
          icon: 'star',
          content: {
            intro: 'Essential practices to maintain high performance and customer satisfaction.',
            sections: [
              {
                title: 'Pre-Call Preparation',
                items: [
                  'Review the lead\'s quiz answers before calling',
                  'Understand their financial archetype',
                  'Prepare relevant talking points based on their answers',
                  'Have your script and program details ready'
                ]
              },
              {
                title: 'During the Call',
                items: [
                  'Be present and focused - eliminate distractions',
                  'Take detailed notes - you\'ll need them for follow-up',
                  'Be authentic - don\'t sound scripted',
                  'Show genuine interest in helping them'
                ]
              },
              {
                title: 'Post-Call',
                items: [
                  'Update the outcome immediately after the call',
                  'Add detailed notes while the conversation is fresh',
                  'Upload recording link if available',
                  'Set follow-up tasks if needed',
                  'Send appropriate email template if applicable'
                ]
              }
            ]
          }
        }
      ]
    },
    status: {
      title: 'Status Guide',
      icon: 'check',
      color: 'from-emerald-600 to-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      items: [
        {
          id: 'converted',
          title: 'Converted',
          subtitle: 'Purchase Made',
          icon: 'money',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          content: {
            whenToUse: [
              'Customer agrees to purchase a BrightNest plan during the call',
              'Payment has been processed or scheduled',
              'Customer has committed to signing up',
              'Sale is confirmed and documented'
            ],
            actions: [
              'Record the sale value in the system',
              'Upload call recording link (if available)',
              'Add detailed notes about what they purchased',
              'Send "Purchase Confirmation" email template',
              'Ensure all commission and affiliate tracking is accurate'
            ],
            notes: [
              'Always confirm the exact amount of the sale',
              'Document which plan they selected',
              'Note any special terms or arrangements',
              'Record customer enthusiasm level and key decision factors'
            ]
          }
        },
        {
          id: 'not-interested',
          title: 'Not Interested',
          subtitle: '',
          icon: 'x',
          color: 'bg-rose-100 text-rose-800 border-rose-300',
          content: {
            whenToUse: [
              'Customer explicitly states they\'re not interested',
              'They\'ve heard the pitch and declined',
              'They don\'t see value in BrightNest at this time',
              'Timing is not right and they\'re firm about it'
            ],
            actions: [
              'Add notes explaining why they weren\'t interested',
              'Upload call recording link (if available)',
              'Send "Not Interested - Follow Up" email template',
              'Note any specific objections for training purposes'
            ],
            notes: [
              'Be respectful - they may become interested later',
              'Document their objections for product improvement',
              'Leave the door open for future contact',
              'Some "not interested" can become "needs follow up" with nurturing'
            ]
          }
        },
        {
          id: 'needs-follow-up',
          title: 'Needs Follow Up',
          subtitle: '',
          icon: 'clipboard',
          color: 'bg-amber-100 text-amber-800 border-amber-300',
          content: {
            whenToUse: [
              'Customer is interested but needs more information',
              'They want to review materials before deciding',
              'They have specific questions that need research',
              'They\'re comparing options and need time',
              'They want to discuss with spouse/partner'
            ],
            actions: [
              'Create a follow-up task with a specific date',
              'Add detailed notes about what they need',
              'Upload call recording link (if available)',
              'Send "Needs Follow Up" email template with relevant info',
              'Schedule next contact in your calendar'
            ],
            notes: [
              'This is often the most convertible status',
              'Prompt follow-up is critical (within 24-48 hours)',
              'Personalize follow-up based on their specific needs',
              'Provide exactly what they asked for (materials, answers, etc.)'
            ]
          }
        },
        {
          id: 'callback-requested',
          title: 'Callback Requested',
          subtitle: '',
          icon: 'phoneCall',
          color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
          content: {
            whenToUse: [
              'Customer explicitly asks you to call them back',
              'They need to check their schedule for a better time',
              'They want to prepare before the conversation',
              'Initial contact was not ideal timing for them'
            ],
            actions: [
              'Schedule the callback in your calendar',
              'Create a task reminder for the callback',
              'Add notes about best time to call',
              'Send "Callback Requested" email confirming the callback',
              'Note any specific topics to cover in callback'
            ],
            notes: [
              'Honor their requested callback time',
              'Be prepared when you call back',
              'Reference previous conversation to show you remember',
              'This shows respect for their time and schedule'
            ]
          }
        },
        {
          id: 'rescheduled',
          title: 'Rescheduled',
          subtitle: '',
          icon: 'refresh',
          color: 'bg-violet-100 text-violet-800 border-violet-300',
          content: {
            whenToUse: [
              'Customer needs to move their scheduled appointment',
              'They can\'t make the originally scheduled time',
              'They request a different time that works better',
              'Appointment time was changed at their request'
            ],
            actions: [
              'Update the appointment time in the system',
              'Confirm the new time with the customer',
              'Send "Rescheduled Appointment" email template',
              'Add notes about the reason for rescheduling',
              'Update your calendar with the new time'
            ],
            notes: [
              'Rescheduling is normal - don\'t take it personally',
              'Confirm the new time clearly',
              'Send confirmation to avoid confusion',
              'Be flexible but also set boundaries'
            ]
          }
        },
        {
          id: 'no-answer',
          title: 'No Answer',
          subtitle: '',
          icon: 'phoneOff',
          color: 'bg-slate-100 text-slate-800 border-slate-300',
          content: {
            whenToUse: [
              'You called but the customer didn\'t answer',
              'No voicemail was left or they didn\'t return call',
              'Multiple attempts to reach them were unsuccessful',
              'Customer\'s phone went straight to voicemail'
            ],
            actions: [
              'Add notes about call attempts (time, result)',
              'Send "No Answer - Follow Up" email template',
              'Create a task to try again later',
              'Try alternative contact methods if available',
              'Note if voicemail was left'
            ],
            notes: [
              'Don\'t give up after one attempt',
              'Try different times of day',
              'Email can be more effective if calls aren\'t working',
              'Some customers prefer email communication',
              'Document all contact attempts'
            ]
          }
        },
        {
          id: 'wrong-number',
          title: 'Wrong Number',
          subtitle: '',
          icon: 'phone',
          color: 'bg-amber-100 text-amber-800 border-amber-300',
          content: {
            whenToUse: [
              'The phone number is incorrect or disconnected',
              'You reached someone who isn\'t the customer',
              'The number belongs to someone else entirely',
              'Customer\'s contact information is invalid'
            ],
            actions: [
              'Add notes explaining what happened',
              'Try to find alternative contact information',
              'Send email to customer (if email is valid)',
              'Note that contact information needs updating',
              'Flag for admin review if information is consistently wrong'
            ],
            notes: [
              'Verify you dialed the correct number',
              'Some customers may have multiple numbers',
              'Try email contact if phone fails',
              'Wrong numbers should be rare - flag patterns to admin'
            ]
          }
        }
      ]
    },
    procedures: {
      title: 'Procedures',
      icon: 'document',
      color: 'from-violet-600 to-violet-700',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
      items: [
        {
          id: 'daily-workflow',
          title: 'Daily Workflow',
          icon: 'sun',
          content: {
            sections: [
              {
                title: 'Start of Day',
                items: [
                  'Log in to your BrightNest dashboard',
                  'Review your appointments for the day',
                  'Check for any pending tasks or follow-ups',
                  'Review any new leads assigned to you',
                  'Prepare your workspace and materials'
                ]
              },
              {
                title: 'Before Each Call',
                items: [
                  'Review the lead\'s quiz answers and profile',
                  'Understand their financial archetype',
                  'Review their stated goals and challenges',
                  'Prepare relevant talking points',
                  'Have your script and program details ready',
                  'Ensure you have a quiet environment'
                ]
              },
              {
                title: 'During the Call',
                items: [
                  'Introduce yourself and BrightNest clearly',
                  'Reference their quiz completion',
                  'Ask permission to proceed',
                  'Conduct discovery questions',
                  'Present relevant solutions',
                  'Handle objections professionally',
                  'Attempt to close or schedule follow-up',
                  'Take detailed notes throughout'
                ]
              },
              {
                title: 'After Each Call',
                items: [
                  'Update appointment outcome immediately',
                  'Enter sale value if converted',
                  'Add comprehensive call notes',
                  'Upload recording link if available',
                  'Send appropriate email template',
                  'Create follow-up tasks if needed',
                  'Update your calendar with next steps'
                ]
              },
              {
                title: 'End of Day',
                items: [
                  'Complete all call documentation',
                  'Review tasks for tomorrow',
                  'Prepare for next day\'s appointments',
                  'Update any pending items',
                  'Log out securely'
                ]
              }
            ]
          }
        },
        {
          id: 'updating-status',
          title: 'Updating Status',
          icon: 'pencil',
          content: {
            sections: [
              {
                title: 'Step 1: Access the Appointment',
                items: [
                  'Go to Dashboard or Database',
                  'Find the appointment you just completed',
                  'Click "Update Status" button'
                ]
              },
              {
                title: 'Step 2: Select Outcome',
                items: [
                  'Choose the appropriate outcome from the dropdown',
                  'Refer to Status Guide section if unsure',
                  'Select the outcome that best matches the call result'
                ]
              },
              {
                title: 'Step 3: Enter Details',
                items: [
                  'Sale Value: Enter amount if customer converted (required for "converted")',
                  'Call Notes: Add detailed notes about the conversation',
                  'Recording Link: Paste the call recording URL if available'
                ]
              },
              {
                title: 'Step 4: Save and Follow Up',
                items: [
                  'Click "Save" to update the appointment',
                  'System will automatically send appropriate email template',
                  'Create follow-up tasks if needed',
                  'Update your calendar with next steps'
                ]
              }
            ]
          }
        },
        {
          id: 'task-management',
          title: 'Task Management',
          icon: 'check',
          content: {
            sections: [
              {
                title: 'Creating Tasks',
                items: [
                  'Tasks help you track follow-ups and reminders',
                  'Create a task for any lead that needs follow-up',
                  'Set specific due dates based on urgency',
                  'Add detailed descriptions of what needs to be done'
                ]
              },
              {
                title: 'Task Types',
                items: [
                  'Follow-up calls: Customer needs more time or information',
                  'Email follow-ups: Send specific materials or answers',
                  'Research tasks: Look up information for customer',
                  'Appointment reminders: Don\'t forget scheduled calls'
                ]
              },
              {
                title: 'Priority Levels',
                items: [
                  'Urgent: Requires immediate attention (same day)',
                  'High: Important, complete within 24-48 hours',
                  'Medium: Standard priority, complete within 3-5 days',
                  'Low: Can be completed when time permits'
                ]
              }
            ]
          }
        }
      ]
    },
    guidelines: {
      title: 'Guidelines',
      icon: 'document',
      color: 'from-indigo-600 to-indigo-700',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      items: [
        {
          id: 'communication',
          title: 'Communication Guidelines',
          icon: 'chat',
          content: {
            sections: [
              {
                title: 'Tone and Manner',
                items: [
                  'Professional but approachable',
                  'Warm and genuine',
                  'Confident but not pushy',
                  'Respectful of their time',
                  'Empathetic to their situation'
                ]
              },
              {
                title: 'Language',
                items: [
                  'Use clear, simple language',
                  'Avoid financial jargon unless explaining',
                  'Speak at an appropriate pace',
                  'Pause to allow response',
                  'Confirm understanding'
                ]
              },
              {
                title: 'Listening',
                items: [
                  'Give full attention to the customer',
                  'Don\'t interrupt or rush them',
                  'Take notes while they speak',
                  'Ask clarifying questions',
                  'Show you understand their situation'
                ]
              }
            ]
          }
        },
        {
          id: 'compliance',
          title: 'Compliance & Legal',
          icon: 'scale',
          content: {
            sections: [
              {
                title: 'Required Disclosures',
                items: [
                  'Always identify yourself and BrightNest',
                  'Be transparent about services and pricing',
                  'Don\'t make guarantees or promises',
                  'Disclose any relevant terms or conditions',
                  'Follow all financial services regulations'
                ]
              },
              {
                title: 'Do Not',
                items: [
                  'Misrepresent BrightNest services',
                  'Make false claims about results',
                  'Pressure customers into decisions',
                  'Share customer information inappropriately',
                  'Violate any privacy regulations'
                ]
              }
            ]
          }
        },
        {
          id: 'performance',
          title: 'Performance Expectations',
          icon: 'chart',
          content: {
            sections: [
              {
                title: 'Metrics',
                items: [
                  'Conversion rate (target: varies)',
                  'Average call duration',
                  'Follow-up completion rate',
                  'Task completion rate',
                  'Customer satisfaction'
                ]
              },
              {
                title: 'Goals',
                items: [
                  'Make consistent calls per day',
                  'Convert at target percentage',
                  'Follow up within 24 hours',
                  'Complete all tasks on time',
                  'Maintain high quality standards'
                ]
              }
            ]
          }
        }
      ]
    }
  };

  // Get current section data
  const getCurrentSection = () => {
    for (const [categoryKey, category] of Object.entries(sections)) {
      const item = category.items.find(i => i.id === activeSection);
      if (item) {
        return { category, item, categoryKey };
      }
    }
    return null;
  };

  const current = getCurrentSection();
  const currentCategory = current?.category;
  const currentItem = current?.item;

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
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
          <div className="flex items-center">
            <div className={`w-12 h-12 bg-gradient-to-br ${currentCategory?.color || 'from-indigo-600 to-indigo-700'} rounded-xl flex items-center justify-center mr-4 shadow-md`}>
              <Icon name={currentCategory?.icon || 'book'} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Internal Rules & Guidelines</h2>
              <p className="text-sm text-gray-600 mt-1">Training materials, procedures, and best practices</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-4">
              <nav className="space-y-2">
                {Object.entries(sections).map(([categoryKey, category]) => (
                  <div key={categoryKey} className="mb-4">
                    <div className={`flex items-center px-3 py-2.5 mb-2 rounded-lg bg-gradient-to-r ${category.color} text-white text-sm font-semibold shadow-sm`}>
                      <Icon name={category.icon} className="w-4 h-4 mr-2 text-white" />
                      {category.title}
                    </div>
                    <div className="space-y-1 pl-2">
                      {category.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center ${
                            activeSection === item.id
                              ? 'bg-slate-100 text-gray-900 border-l-4 border-slate-600 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon name={item.icon} className={`w-4 h-4 mr-2 ${activeSection === item.id ? 'text-slate-700' : 'text-gray-500'}`} />
                          <span className="flex-1">{item.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {currentItem && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Content Header */}
                <div className={`bg-gradient-to-r ${currentCategory?.color} px-6 py-5 shadow-sm`}>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                      <Icon name={currentItem.icon} className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{currentItem.title}</h2>
                      {'subtitle' in currentItem && currentItem.subtitle && (
                        <p className="text-white/90 text-sm mt-1">{currentItem.subtitle}</p>
                      )}
                      {'intro' in currentItem.content && currentItem.content.intro && (
                        <p className="text-white/90 text-sm mt-2">{currentItem.content.intro}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6">
                  {/* Status-specific content */}
                  {'whenToUse' in currentItem.content && currentItem.content.whenToUse && (
                    <div className="space-y-5">
                      <div className="bg-slate-50 rounded-lg p-5 border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <Icon name="check" className="w-5 h-5 mr-2 text-slate-600" />
                          When to Use
                        </h3>
                        <ul className="space-y-2.5">
                          {currentItem.content.whenToUse.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-slate-500 mr-3 mt-1.5">•</span>
                              <span className="text-gray-700 leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-emerald-50 rounded-lg p-5 border border-emerald-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <Icon name="check" className="w-5 h-5 mr-2 text-emerald-600" />
                          What to Do
                        </h3>
                        <ul className="space-y-2.5">
                          {'actions' in currentItem.content && currentItem.content.actions.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-emerald-600 mr-3 mt-1.5">•</span>
                              <span className="text-gray-700 leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-amber-50 rounded-lg p-5 border border-amber-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <Icon name="star" className="w-5 h-5 mr-2 text-amber-600" />
                          Important Notes
                        </h3>
                        <ul className="space-y-2.5">
                          {'notes' in currentItem.content && currentItem.content.notes.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-amber-600 mr-3 mt-1.5">•</span>
                              <span className="text-gray-700 leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Training/Procedures content */}
                  {'sections' in currentItem.content && currentItem.content.sections && (
                    <div className="space-y-6">
                      {currentItem.content.sections.map((section: { title: string; items: string[] }, sectionIdx: number) => (
                        <div
                          key={sectionIdx}
                          className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <button
                            onClick={() => toggleSection(`${currentItem.id}-${sectionIdx}`)}
                            className="w-full px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 transition-all flex items-center justify-between border-b border-slate-200"
                          >
                            <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                            <svg
                              className={`w-5 h-5 text-gray-600 transition-transform ${
                                isSectionExpanded(`${currentItem.id}-${sectionIdx}`) ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {isSectionExpanded(`${currentItem.id}-${sectionIdx}`) && (
                            <div className="p-5 bg-white">
                              <ul className="space-y-3">
                                {section.items.map((item, itemIdx) => (
                                  <li key={itemIdx} className="flex items-start">
                                    <span className={`flex-shrink-0 w-7 h-7 rounded-full ${currentCategory?.bgColor} ${currentCategory?.borderColor} border-2 flex items-center justify-center mr-3 mt-0.5`}>
                                      <span className="text-xs font-semibold text-gray-700">{itemIdx + 1}</span>
                                    </span>
                                    <span className="text-gray-700 leading-relaxed">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
