"use client";

import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <SiteHeader />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50/20 rounded-full blur-3xl"></div>
        
        {/* Title */}
        <div className="text-center mb-12 sm:mb-16 relative">
          <div className="inline-block mb-4">
            <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider bg-teal-50 px-4 py-2 rounded-full">Legal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
            Terms and Conditions of Use
          </h1>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none relative">
          <div className="space-y-10 sm:space-y-12">
              {/* Introduction */}
              <section className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
                <p className="text-slate-600 leading-relaxed mb-6 text-sm">
                  <strong className="text-slate-900">Effective Date:</strong> 03/12/2024<br />
                  <strong className="text-slate-900">Last Updated:</strong> 06/03/2025
                </p>
                
                <div className="relative pl-4 mb-6">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-amber-400 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-slate-900">1. Introduction</h2>
                </div>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Welcome to BrightNest Technologies LLC ("BrightNest," "we," "our," or "us").
                  These Terms and Conditions of Use ("Terms") govern your access to and use of our website, joinbrightnest.com, and all related content, products, software, and services (collectively, the "Service").
                </p>
                <p className="text-slate-700 leading-relaxed mb-4">
                  By accessing or using the Service, you agree to be bound by these Terms.
                  If you do not agree, you must not access or use the Service.
                </p>
              </section>

              {/* Description of Service */}
              <section className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
                <div className="relative pl-4 mb-6">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-amber-400 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-slate-900">2. Description of the Service</h2>
                </div>
                <p className="text-slate-700 leading-relaxed mb-4">
                  BrightNest provides a digital behavior-change platform that helps individuals improve their financial habits, decision-making, and overall relationship with money.
                  Through interactive assessments, educational modules, and AI-driven insights, BrightNest aims to enhance users' financial awareness and behavioral patterns.
                </p>
                <p className="text-slate-700 leading-relaxed mb-4">
                  <strong className="text-slate-900">BrightNest does not provide personalized financial, investment, tax, or legal advice.</strong>
                  All materials, data, and insights made available through the Service are provided solely for informational and educational purposes and should not be interpreted as professional financial recommendations.
                </p>
              </section>

              {/* Eligibility */}
              <section className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
                <div className="relative pl-4 mb-6">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-amber-400 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-slate-900">3. Eligibility and Account Responsibilities</h2>
                </div>
                
                <h3 className="text-xl font-semibold text-slate-900 mb-3">3.1 Eligibility.</h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                  You must be at least 18 years of age (or the age of legal majority in your jurisdiction) to access or use the Service. By using the Service, you represent and warrant that you meet these eligibility requirements.
                </p>

                <h3 className="text-xl font-semibold text-slate-900 mb-3">3.2 Account Creation.</h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Some features may require you to create an account. You agree to provide accurate and complete information during registration and to maintain the confidentiality of your login credentials.
                </p>

                <h3 className="text-xl font-semibold text-slate-900 mb-3">3.3 User Conduct.</h3>
                <p className="text-slate-700 leading-relaxed mb-4">You agree not to:</p>
                <ul className="list-disc list-inside text-slate-700 leading-relaxed mb-4 space-y-2 ml-4">
                  <li>Use the Service for any unlawful purpose;</li>
                  <li>Upload or transmit any harmful, defamatory, infringing, or misleading content;</li>
                  <li>Interfere with, disrupt, or compromise the integrity or security of the Service;</li>
                  <li>Attempt to gain unauthorized access to any part of the Service or its systems;</li>
                  <li>Use automated systems (bots, crawlers, scrapers) to access or collect data without authorization.</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-900 mb-3">3.4 Suspension or Termination.</h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                  We reserve the right to suspend or terminate access to the Service, in whole or in part, at our discretion, if we believe you have violated these Terms or engaged in conduct harmful to BrightNest or its users.
                </p>
              </section>

              {/* Intellectual Property */}
              <section className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
                <div className="relative pl-4 mb-6">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-amber-400 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-slate-900">4. Intellectual Property Rights</h2>
                </div>
                
                <h3 className="text-xl font-semibold text-slate-900 mb-3">4.1 Ownership.</h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                  All content, design, software, features, graphics, trademarks, and other intellectual property available through the Service are the exclusive property of BrightNest Technologies LLC or its licensors.
                  All rights are reserved.
                </p>

                <h3 className="text-xl font-semibold text-slate-900 mb-3">4.2 Limited License.</h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                  BrightNest grants you a limited, non-exclusive, non-transferable, revocable license to access and use the Service solely for personal, non-commercial purposes in accordance with these Terms.
                </p>

                <h3 className="text-xl font-semibold text-slate-900 mb-3">4.3 User Submissions.</h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                  If you submit content, feedback, or suggestions ("User Content"), you grant BrightNest a worldwide, perpetual, irrevocable, royalty-free license to use, reproduce, adapt, and display such content in connection with the operation and improvement of the Service.
                </p>

                <h3 className="text-xl font-semibold text-slate-900 mb-3">4.4 Trademarks.</h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                  The BrightNest name, logo, and all related designs are trademarks of BrightNest Technologies LLC. Unauthorized use is strictly prohibited.
                </p>
              </section>

              {/* Payments */}
              <section className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
                <div className="relative pl-4 mb-6">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-amber-400 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-slate-900">5. Payments</h2>
                </div>
                
                <h3 className="text-xl font-semibold text-slate-900 mb-3">5.1 General.</h3>
                <p className="text-slate-800 leading-relaxed mb-4">
                  From time to time, BrightNest may offer paid programs, premium tools, or one-time digital products. All payments are processed securely through Stripe, PayPal, or authorized credit/debit card processors.
                </p>

                <h3 className="text-xl font-semibold text-slate-900 mb-3">5.2 Currency.</h3>
                <p className="text-slate-800 leading-relaxed mb-4">
                  All transactions are denominated in United States Dollars (USD).
                </p>

                <h3 className="text-xl font-semibold text-slate-900 mb-3">5.3 No Refunds.</h3>
                <p className="text-slate-800 leading-relaxed mb-4">
                  <strong>All payments made to BrightNest are final and non-refundable, except where otherwise required by applicable law.</strong>
                  Please review all product details carefully before making a purchase.
                </p>

                <h3 className="text-xl font-semibold text-slate-900 mb-3">5.4 Taxes.</h3>
                <p className="text-slate-800 leading-relaxed mb-4">
                  You are solely responsible for any applicable taxes, duties, or fees arising from your use or purchase of any paid Service.
                </p>
              </section>

              {/* Disclaimers */}
              <section className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
                <div className="relative pl-4 mb-6">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-amber-400 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-slate-900">6. Disclaimers</h2>
                </div>
                
                <h3 className="text-xl font-semibold text-slate-900 mb-3">6.1 Educational Purpose Only.</h3>
                <p className="text-slate-800 leading-relaxed mb-4">
                  The Service is intended solely to promote awareness and self-improvement in personal finance. BrightNest is not a financial institution, broker, investment advisor, or tax professional.
                  Nothing on the Service constitutes financial, legal, or investment advice.
                </p>

                <h3 className="text-xl font-semibold text-slate-900 mb-3">6.2 No Guarantee of Results.</h3>
                <p className="text-slate-800 leading-relaxed mb-4">
                  Your success or outcomes depend on individual effort, discipline, and external factors. BrightNest makes no guarantees or representations regarding financial performance, behavioral improvement, or specific results.
                </p>

                <h3 className="text-xl font-semibold text-slate-900 mb-3">6.3 Accuracy of Information.</h3>
                <p className="text-slate-800 leading-relaxed mb-4">
                  While BrightNest strives for accuracy and reliability, the Service may contain errors or omissions.
                  We do not warrant that any information provided will be accurate, complete, or up to date.
                </p>

                <h3 className="text-xl font-semibold text-slate-900 mb-3">6.4 Third-Party Links and Integrations.</h3>
                <p className="text-slate-800 leading-relaxed mb-4">
                  The Service may contain links to third-party websites or tools. These are provided for convenience only. BrightNest does not control, endorse, or assume responsibility for third-party content or privacy practices.
                </p>

                <h3 className="text-xl font-semibold text-slate-900 mb-3">6.5 "As Is" Provision.</h3>
                <p className="text-slate-800 leading-relaxed mb-4">
                  The Service is provided on an "AS IS" and "AS AVAILABLE" basis, without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, or non-infringement.
                </p>
              </section>

              {/* Limitation of Liability */}
              <section className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
                <div className="relative pl-4 mb-6">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-amber-400 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-slate-900">7. Limitation of Liability</h2>
                </div>
                <p className="text-slate-800 leading-relaxed mb-4">
                  To the maximum extent permitted by applicable law:
                </p>
                <p className="text-slate-800 leading-relaxed mb-4">
                  BrightNest, its affiliates, officers, employees, contractors, and agents shall not be liable for any indirect, incidental, consequential, punitive, or exemplary damages, including loss of profits, data, or goodwill, arising from your use of or inability to use the Service.
                </p>
                <p className="text-slate-800 leading-relaxed mb-4">
                  In no event shall BrightNest's total aggregate liability exceed the greater of (a) one hundred U.S. dollars (USD $100) or (b) the total amount you paid to BrightNest in the twelve (12) months preceding the claim.
                </p>
                <p className="text-slate-800 leading-relaxed mb-4">
                  Some jurisdictions do not allow the exclusion of certain damages; in such cases, the above limitations shall apply to the fullest extent permitted by law.
                </p>
              </section>

              {/* Indemnification */}
              <section className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
                <div className="relative pl-4 mb-6">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-amber-400 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-slate-900">8. Indemnification</h2>
                </div>
                <p className="text-slate-700 leading-relaxed mb-4">
                  You agree to indemnify, defend, and hold harmless BrightNest Technologies LLC and its officers, directors, employees, and agents from any and all claims, damages, liabilities, costs, or expenses (including attorneys' fees) arising from:
                </p>
                <ul className="list-disc list-inside text-slate-700 leading-relaxed mb-4 space-y-2 ml-4">
                  <li>(a) your use or misuse of the Service,</li>
                  <li>(b) your violation of these Terms, or</li>
                  <li>(c) your infringement of any rights of a third party.</li>
                </ul>
              </section>

              {/* Dispute Resolution */}
              <section className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
                <div className="relative pl-4 mb-6">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-amber-400 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-slate-900">9. Dispute Resolution and Governing Law</h2>
                </div>
                
                <h3 className="text-xl font-semibold text-slate-900 mb-3">9.1 Good Faith Resolution.</h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Before initiating any formal proceeding, you agree to first contact us at{" "}
                  <a href="mailto:support@brightnest.com" className="text-teal-600 underline hover:text-teal-700 transition-colors">
                    support@brightnest.com
                  </a>{" "}
                  and attempt to resolve the dispute informally within thirty (30) days.
                </p>

                <h3 className="text-xl font-semibold text-slate-900 mb-3">9.2 Binding Arbitration.</h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Any dispute, claim, or controversy arising out of or relating to these Terms or the Service shall be resolved by binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules.
                </p>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Arbitration will take place in the United States. The language of arbitration shall be English.
                  <strong className="text-slate-900">Class actions and class arbitrations are not permitted.</strong>
                </p>

                <h3 className="text-xl font-semibold text-slate-900 mb-3">9.3 Governing Law.</h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                  These Terms and any disputes arising hereunder shall be governed by and construed in accordance with the laws of the United States, without regard to conflict-of-law principles.
                </p>
              </section>

              {/* Termination */}
              <section className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
                <div className="relative pl-4 mb-6">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-amber-400 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-slate-900">10. Termination</h2>
                </div>
                <p className="text-slate-700 leading-relaxed mb-4">
                  BrightNest reserves the right to suspend or terminate access to the Service at any time, with or without notice, if you violate these Terms or engage in conduct that may harm BrightNest or its users.
                </p>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Upon termination, all rights granted to you under these Terms will immediately cease.
                  Sections that by their nature should survive termination (including Intellectual Property, Disclaimers, Limitation of Liability, Indemnification, and Dispute Resolution) shall remain in full force and effect.
                </p>
              </section>

              {/* Modifications */}
              <section className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
                <div className="relative pl-4 mb-6">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-amber-400 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-slate-900">11. Modifications to the Terms</h2>
                </div>
                <p className="text-slate-700 leading-relaxed mb-4">
                  We may revise or update these Terms from time to time.
                  Any changes will be effective upon posting the updated Terms on joinbrightnest.com with a new "Last Updated" date.
                  Your continued use of the Service after the effective date constitutes your acceptance of the revised Terms.
                </p>
              </section>

              {/* Contact Information */}
              <section className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
                <div className="relative pl-4 mb-6">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-amber-400 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-slate-900">12. Contact Information</h2>
                </div>
                <p className="text-slate-700 leading-relaxed mb-4">
                  For any questions, feedback, or legal notices regarding these Terms, please contact:
                </p>
                <div className="bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-xl p-6 mt-4 border border-slate-200/60">
                  <p className="text-slate-700 leading-relaxed mb-2">
                    <strong className="text-slate-900">BrightNest Technologies LLC</strong><br />
                    Email:{" "}
                    <a href="mailto:support@brightnest.com" className="text-teal-600 underline hover:text-teal-700 transition-colors">
                      support@brightnest.com
                    </a>
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    Website:{" "}
                    <a href="https://joinbrightnest.com" className="text-teal-600 underline hover:text-teal-700 transition-colors">
                      https://joinbrightnest.com
                    </a>
                  </p>
                </div>
              </section>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm">
            Please print or save a copy of these Terms for your records.
          </p>
        </div>
      </div>
      
      <SiteFooter />
    </div>
  );
}
