"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Link from "next/link";

interface FAQItem {
  question: string;
  answer: string | ReactNode;
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "What is BrightNest?",
      answer: "BrightNest is a behavior-based financial wellness platform that helps you discover your financial personality and build lasting money habits. Through our personalized quiz system and coaching approach, we help you understand your relationship with money and provide tools, guidance, and support to transform your financial behavior."
    },
    {
      question: "Who will be helping me?",
      answer: "After you complete your financial profile quiz, you'll be matched with certified financial coaches and behavioral finance specialists who understand your unique financial personality and goals. Our coaches are trained, experienced, and certified professionals who help you build practical systems for budgeting, saving, debt management, and financial planning."
    },
    {
      question: "Who are the financial coaches?",
      answer: "We work with licensed, trained, and experienced financial professionals including Certified Financial Planners (CFP), Certified Financial Counselors, behavioral finance specialists, and certified financial coaches. All coaches have relevant academic degrees, at least 3 years of experience, and are qualified and licensed by their respective professional boards. They must complete our rigorous training process and ongoing professional development requirements."
    },
    {
      question: "How are the coaches verified?",
      answer: "Our team ensures that every coach we bring to the platform is licensed and in good standing. Coaches who apply are required to provide valid licenses and proof of identity. We cross-check their licensure information with their respective professional licensing boards. Coaches must also undergo background checks and complete our comprehensive training program. We show full credential information for each coach to make it easy for you to verify their qualifications."
    },
    {
      question: "Is BrightNest right for me?",
      answer: (
        <>
          BrightNest may be right for you if you're looking to improve your relationship with money and build lasting financial habits. We help with issues such as budgeting, debt management, savings goals, financial stress, spending habits, financial planning, and building financial confidence.
          <br /><br />
          BrightNest is <strong>not</strong> the right solution for you if any of the following is true:
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>You need immediate financial crisis intervention or emergency assistance</li>
            <li>You require legal or tax advice (we recommend consulting with licensed professionals)</li>
            <li>You need investment advisory services (we focus on behavior and budgeting, not investment management)</li>
            <li>You do not have a device that can connect to the Internet or you do not have a reliable Internet connection</li>
          </ul>
        </>
      )
    },
    {
      question: "How much does it cost?",
      answer: "BrightNest offers flexible pricing options to make financial coaching accessible. Our membership includes access to your financial profile results, personalized coaching sessions, budgeting tools, progress tracking, and ongoing support. Pricing varies based on your selected plan and can range from affordable monthly memberships to more comprehensive programs. We also offer free resources including our financial personality quiz and budget calculators. Contact us to learn more about pricing options that fit your needs and budget."
    },
    {
      question: "Can BrightNest substitute for traditional financial planning?",
      answer: "BrightNest coaches are licensed and credentialed professionals who provide behavior-based financial coaching and guidance. However, while our service may complement traditional financial planning, it's not designed to substitute for comprehensive financial planning in every case. Please note that your coach may not be able to provide specific investment advice, tax planning, or legal financial guidance. For complex financial situations, we recommend working alongside certified financial planners, tax professionals, or legal advisors as needed."
    },
    {
      question: "I completed the quiz. How long until I'm matched with a coach?",
      answer: "After you complete your financial profile quiz, you'll receive your personalized results immediately. If you choose to work with a coach, the matching process typically takes a few hours to a few days, depending on coach availability and your specific needs and preferences."
    },
    {
      question: "How will I communicate with my coach?",
      answer: "You can connect with your coach in several ways: through secure messaging in your BrightNest account, scheduled video coaching sessions, phone calls, or email communication. You can use different communication methods at different times based on your needs, availability, and convenience. All communications are secure and confidential."
    },
    {
      question: "How does the financial quiz work?",
      answer: "Our financial personality quiz is a behavior-based assessment that helps you discover your financial archetype. You'll answer questions about your money habits, attitudes, goals, and behaviors. The quiz typically takes 5-10 minutes to complete. After you finish, you'll receive immediate results showing your financial personality type (such as Debt Crusher, Savings Builder, Stability Seeker, or Optimizer) along with personalized insights, recommendations, and action steps tailored to your unique profile."
    },
    {
      question: "Can I retake the quiz?",
      answer: "Yes! You can retake the quiz at any time. Your financial personality and behaviors may change over time as you develop new habits and gain financial confidence. Retaking the quiz can help you see how your relationship with money has evolved and get updated recommendations."
    },
    {
      question: "How long can I use BrightNest?",
      answer: "This depends on your needs and varies from one person to another. Some people feel they get most of the value after a few months of coaching and habit-building, while others prefer to stick with the program for an extended period of time. Many clients use BrightNest as an ongoing resource for accountability, support, and continued financial growth. This is completely up to you and your goals."
    },
    {
      question: "How do I pay for BrightNest?",
      answer: "BrightNest accepts credit cards, debit cards, and most major payment methods. If you achieve your goals or no longer find BrightNest beneficial, you can cancel your membership at any time. We offer flexible billing options including monthly and annual plans."
    },
    {
      question: "Does BrightNest accept insurance?",
      answer: "Currently, BrightNest operates on a direct-pay model. We don't work directly with insurance providers, but our services may be eligible for reimbursement through Health Savings Accounts (HSA) or Flexible Spending Accounts (FSA) depending on your plan. We recommend checking with your HSA/FSA provider to confirm eligibility. We've designed our pricing to be affordable and transparent, often comparable to or lower than traditional financial coaching services."
    },
    {
      question: "What is the role of BrightNest.com?",
      answer: "BrightNest provides a platform that connects you with certified financial coaches and provides tools, resources, and systems to help you transform your financial behavior. The coaches are independent professionals who work directly with you. These coaches are not employees of BrightNest, and the site doesn't oversee them professionally in their coaching practice. Our mission is to build, maintain, and support a platform that lets users and coaches communicate effectively, and to facilitate this channel so you can get the most out of your financial transformation journey."
    },
    {
      question: "How can I be sure this is an effective form of financial coaching?",
      answer: "There are many studies that confirm the effectiveness of behavior-based approaches to financial wellness. Our methodology is based on proven behavioral finance principles and psychological research on habit formation. Our confidence in the platform comes primarily from the feedback and testimonials we receive from users. Every day we hear from people about the way this service helped them make tremendous changes in their financial lives, reduce stress, build savings, pay off debt, and gain confidence with their money."
    },
    {
      question: "Will my coach treat what I say as confidential?",
      answer: "All coaches are licensed and credentialed professionals who are subject to professional standards of confidentiality. This means that when you talk to a licensed financial coach, they are subject to confidentiality requirements similar to other professional services. Generally, your coach will keep what you tell them confidential, but there are limited exceptions required by law (such as situations involving harm to yourself or others). Before starting coaching, please discuss with your coach their confidentiality obligations if you have any concerns or questions."
    },
    {
      question: "How is my privacy and security protected?",
      answer: (
        <>
          Your privacy and security are our top priorities. Here are some things that might be helpful to know:
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>We have built state-of-the-art technology, operations, and infrastructure with the goal of protecting your privacy and safeguarding the information you provide</li>
            <li>All communications between you and your coach are secured and encrypted by banking-grade 256-bit encryption</li>
            <li>Our servers are distributed across multiple Tier 4 data centers for optimal security and protection</li>
            <li>Our browsing encryption system (SSL) follows modern best practices</li>
            <li>Our databases are encrypted and scrambled so they essentially become useless in the unlikely event that they are stolen or compromised</li>
          </ul>
          <br />
          For more information about how BrightNest protects your information, please review our <Link href="/privacy" className="text-teal-600 hover:text-teal-700 underline">Privacy Policy</Link>.
        </>
      )
    },
    {
      question: "Can I stay anonymous?",
      answer: "When you sign up, we ask for basic information to create your account and provide personalized coaching. However, you can choose how much personal financial information you share with your coach. For coaching purposes, your coach may need some information about your financial situation to provide effective guidance, but you control what you share. All of this data is protected by professional confidentiality standards. For additional information about how BrightNest helps protect your privacy, please review our Privacy Policy."
    },
    {
      question: "How can I get started with BrightNest?",
      answer: (
        <>
          Getting started is easy! Simply <Link href="/quiz/financial-profile" className="text-teal-600 hover:text-teal-700 underline font-semibold">take our free financial personality quiz</Link> to discover your financial archetype and receive personalized insights. After completing the quiz, you'll have the option to connect with a certified financial coach who can help you build lasting financial habits. You can also explore our free tools and resources to get started on your financial journey today.
        </>
      )
    },
    {
      question: "I'm a licensed financial professional. How can I provide services using BrightNest?",
      answer: "We're always looking for qualified financial coaches to join our platform. If you're a licensed financial professional (CFP, Certified Financial Counselor, or equivalent) with at least 3 years of experience and a passion for helping people transform their relationship with money, we'd love to hear from you. Please contact us at coaches@brightnest.com to learn more about joining our network of financial coaches."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* Hero Section with Dark Green Background */}
      <section className="relative overflow-hidden" style={{ backgroundColor: '#335343' }}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-12 sm:pb-16">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white leading-tight tracking-tight">
              Frequently asked questions
            </h1>
          </div>
        </div>

        {/* Curved Bottom Edge - Creates upward curve at bottom transitioning to white */}
        <div className="absolute bottom-0 left-0 w-full" style={{ height: '70px' }}>
          <svg 
            className="w-full h-full" 
            viewBox="0 0 1440 70" 
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M0,70 L0,65 C360,65 720,20 1080,20 C1320,20 1440,65 1440,65 L1440,70 Z" 
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">

        {/* FAQ List */}
        <div className="space-y-0 border-b border-slate-200">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border-t border-slate-200"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full py-6 px-4 sm:px-6 text-left flex items-center justify-between hover:bg-slate-50 transition-colors duration-200 group"
                aria-expanded={openIndex === index}
              >
                <span className="text-base sm:text-lg font-medium text-slate-900 pr-8 group-hover:text-teal-700 transition-colors">
                  {faq.question}
                </span>
                <svg
                  className={`flex-shrink-0 w-5 h-5 text-slate-500 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-4 sm:px-6 pb-6 text-slate-700 leading-relaxed">
                  <div className="text-sm sm:text-base">
                    {typeof faq.answer === 'string' ? (
                      <p>{faq.answer}</p>
                    ) : (
                      faq.answer
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <p className="text-lg text-slate-700 mb-6">
            Ready to get started?
          </p>
          <Link
            href="/quiz/financial-profile"
            className="inline-block bg-gradient-to-r from-teal-600 to-teal-700 text-white px-8 py-3 rounded-xl font-semibold text-base hover:from-teal-700 hover:to-teal-800 transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            Take the Financial Profile Quiz
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

