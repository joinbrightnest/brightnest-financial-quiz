"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Do I need to sell or coach anyone?",
    answer: "No. You simply refer people through your unique link. We handle onboarding, delivery, and customer support."
  },
  {
    question: "How do I get paid?",
    answer: "You'll receive automatic monthly payouts for all confirmed sales through your affiliate dashboard."
  },
  {
    question: "Is there a cost to join?",
    answer: "No, it's free. We only accept partners aligned with our mission."
  },
  {
    question: "How do I know my referrals are tracked?",
    answer: "Every partner has a unique link and their own dashboard to track traffic, leads, and sales in real time."
  }
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {faqs.map((faq, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
          <button
            onClick={() => toggleFAQ(index)}
            className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset"
            aria-expanded={openIndex === index}
            aria-controls={`faq-answer-${index}`}
          >
            <h3 className="text-xl font-bold text-slate-900 pr-4">
              {faq.question}
            </h3>
            <svg
              className={`w-6 h-6 text-teal-600 flex-shrink-0 transition-transform duration-300 ${
                openIndex === index ? "transform rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            id={`faq-answer-${index}`}
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="px-6 pb-5 pt-2">
              <p className="text-slate-700 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

