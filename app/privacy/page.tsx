"use client";

import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function PrivacyPage() {
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
            BrightNest Privacy Policy
          </h1>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
              <div className="space-y-10 sm:space-y-12">
            {/* Introduction */}
            <section className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
              <p className="text-slate-600 leading-relaxed mb-6 text-sm">
                <strong className="text-slate-900">Effective Date:</strong> 03/12/2024<br />
                <strong className="text-slate-900">Last Updated:</strong> 06/03/2025
              </p>
              
              <p className="text-slate-700 leading-relaxed mb-4">
                BrightNest Technologies LLC ("BrightNest," "we," "us," or "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit or use joinbrightnest.com and any associated services (the "Service").
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                By using the Service, you agree to the collection and use of your information in accordance with this policy. If you disagree, please do not use the Service.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
              <div className="relative pl-4 mb-6">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-amber-400 rounded-full"></div>
                <h2 className="text-2xl font-bold text-slate-900">1. Information We Collect</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                We collect several types of information from and about users of our Service, including:
              </p>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-3">1.1 Information You Provide Directly</h3>
              <ul className="list-disc list-inside text-slate-700 leading-relaxed mb-4 space-y-2 ml-4">
                <li><strong>Account and Profile Information:</strong> name, email address, username, password (hashed), and other registration details.</li>
                <li><strong>User Responses & Input:</strong> answers you provide in quizzes, assessments, surveys, behavioral logs, goals, preferences, and other content you submit.</li>
                <li><strong>Communications:</strong> when you contact us via email, support forms, chat, or otherwise, we collect the content of your communication and any attachments.</li>
                <li><strong>Payment and Transaction Data:</strong> if you purchase a paid product or service, we may collect billing address, credit/debit card information, transaction details, or other payment method data (processed via Stripe, PayPal, or other payment processors).</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3">1.2 Automatically Collected Information</h3>
              <ul className="list-disc list-inside text-slate-700 leading-relaxed mb-4 space-y-2 ml-4">
                <li><strong className="text-slate-900">Usage & Analytics Data:</strong> pages or features you access, click behavior, timestamps, referring URLs, session durations, and other activity metrics.</li>
                <li><strong className="text-slate-900">Device & System Data:</strong> information about your device and system environment (device type, operating system, browser, IP address, device identifiers).</li>
                <li><strong className="text-slate-900">Cookies & Tracking Technologies:</strong> we and our partners use cookies, web beacons, pixel tags, local storage, analytic SDKs, and similar technologies to collect information about your interactions with the Service (for example, site navigation, features used, preferences).</li>
                <li><strong className="text-slate-900">Inferred / Derived Information:</strong> we may infer additional characteristics or preferences from your behavior, engagement patterns, or other data (e.g., "user prefers short-form content").</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3">1.3 Information from Third Parties</h3>
              <ul className="list-disc list-inside text-slate-700 leading-relaxed mb-4 space-y-2 ml-4">
                <li><strong>Service Providers & Partners:</strong> we may obtain data from third-party services we use (for example, identity verification, email services, analytics, advertising partners).</li>
                <li><strong>Marketing & Advertising Data:</strong> for example, demographic or interest data from third-party sources to better tailor your experience or offers.</li>
                <li><strong>Integrations & Linked Accounts:</strong> if you choose to connect external services (e.g. social login), we may collect information from those external services as allowed by your settings and consent.</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
              <div className="relative pl-4 mb-6">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-amber-400 rounded-full"></div>
                <h2 className="text-2xl font-bold text-slate-900">2. How We Use Your Information</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                We use the information we collect for the following purposes:
              </p>
              
              <div className="overflow-x-auto mb-4 rounded-lg border border-slate-200/60">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-teal-50 to-amber-50">
                    <tr>
                      <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-900">Purpose</th>
                      <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-900">Data Types Involved</th>
                      <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-900">Description</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-700 font-medium">Provisioning & Operation</td>
                      <td className="px-4 py-3 text-sm text-slate-700">Account info, usage data, device data</td>
                      <td className="px-4 py-3 text-sm text-slate-700">To deliver the Service, authenticate you, maintain your account, and ensure service functionality.</td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-700 font-medium">Personalization & Insights</td>
                      <td className="px-4 py-3 text-sm text-slate-700">Behavior logs, user input, inferred data</td>
                      <td className="px-4 py-3 text-sm text-slate-700">To tailor your experience, suggest content, generate insights, and adapt to your progress.</td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-700 font-medium">Improvement & Development</td>
                      <td className="px-4 py-3 text-sm text-slate-700">Usage data, feedback, crash logs</td>
                      <td className="px-4 py-3 text-sm text-slate-700">To assess performance, troubleshoot issues, test new features, and improve the Service.</td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-700 font-medium">Customer Support</td>
                      <td className="px-4 py-3 text-sm text-slate-700">Contact communications, account info</td>
                      <td className="px-4 py-3 text-sm text-slate-700">To respond to your inquiries, troubleshoot, and assist with support requests.</td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-700 font-medium">Payment & Billing</td>
                      <td className="px-4 py-3 text-sm text-slate-700">Payment data, transaction records</td>
                      <td className="px-4 py-3 text-sm text-slate-700">To process transactions, prevent fraud, enforce payment terms, and manage financial operations.</td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-700 font-medium">Marketing & Communications</td>
                      <td className="px-4 py-3 text-sm text-slate-700">Email, preferences, usage data</td>
                      <td className="px-4 py-3 text-sm text-slate-700">To send updates, promotional offers, newsletters, surveys, and to inform you about new features (you may opt out).</td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-700 font-medium">Legal & Compliance</td>
                      <td className="px-4 py-3 text-sm text-slate-700">Account info, logs, communications</td>
                      <td className="px-4 py-3 text-sm text-slate-700">To comply with legal obligations, enforce our Terms, or protect rights, safety, or property.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Sharing & Disclosure */}
            <section className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
              <div className="relative pl-4 mb-6">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-amber-400 rounded-full"></div>
                <h2 className="text-2xl font-bold text-slate-900">3. Sharing & Disclosure of Information</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may share your data in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-slate-700 leading-relaxed mb-4 space-y-2 ml-4">
                <li><strong>Service Providers & Contractors:</strong> third parties who perform services on our behalf (e.g. analytics, customer support, payment processing) under confidentiality obligations.</li>
                <li><strong>Legal Obligations & Safety:</strong> when required by law, court order, or to protect rights, safety, or property (yours or others).</li>
                <li><strong>Business Transfers:</strong> in connection with a merger, acquisition, or sale of assets, your data may be transferred (with notice).</li>
                <li><strong>Aggregated / Anonymized Data:</strong> we may share data that's de-identified or aggregated which cannot reasonably be used to identify you.</li>
                <li><strong>User-Controlled Sharing:</strong> when you choose to link or share data with third-party services, the information shared will be bound by your choices and their policies.</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mb-4">
                <strong>We do not sell your personal information for commercial marketing purposes.</strong>
              </p>
            </section>

            {/* Data Retention */}
            <section className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
              <div className="relative pl-4 mb-6">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-amber-400 rounded-full"></div>
                <h2 className="text-2xl font-bold text-slate-900">4. Data Retention</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                We retain your personal information only as long as necessary to fulfill the purposes laid out in this Privacy Policy, unless a longer retention period is required or permitted by law.
                When we no longer need your data, we will delete it or anonymize it (i.e., remove personally identifiable attributes).
              </p>
            </section>

            {/* Privacy Rights */}
            <section className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
              <div className="relative pl-4 mb-6">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-amber-400 rounded-full"></div>
                <h2 className="text-2xl font-bold text-slate-900">5. Your Privacy Rights & Choices</h2>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Account Controls & Preferences</h3>
              <ul className="list-disc list-inside text-slate-700 leading-relaxed mb-4 space-y-2">
                <li>You can review, edit, or delete profile information associated with your account (subject to certain data retention obligations).</li>
                <li>You may unsubscribe from marketing emails or promotional communications via settings or by contacting us.</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 Deletion & Erasure</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You may request the deletion of your personal data (to the extent permitted by law). After deletion, you may lose access to certain parts of the Service. Some data may remain in backup or legal archives for purposes such as fraud prevention or compliance.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.3 Data Access & Portability</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Upon request, we may provide a copy of your personal data in a structured, commonly used, machine-readable format (where applicable).
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.4 Opt-Out of Tracking & Cookies</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You can disable or restrict certain cookies or tracking technologies via browser settings or device preferences. However, this may impact your ability to fully use or benefit from the Service.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.5 Do-Not-Track Signals & Similar Mechanisms</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We currently do not honor browser "Do Not Track" signals as a standard, but we provide alternative options for limiting tracking through preferences or settings.
              </p>
            </section>

            {/* International Data Transfers */}
            <section className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
              <div className="relative pl-4 mb-6">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-amber-400 rounded-full"></div>
                <h2 className="text-2xl font-bold text-slate-900">6. International Data Transfers</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                Your information may be stored or processed in the U.S. or other countries where our servers or service providers are located.
                When transferring data across borders, we will use contractual safeguards (e.g. standard contractual clauses) or other legally recognized mechanisms to ensure adequate protection.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
              <div className="relative pl-4 mb-6">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-amber-400 rounded-full"></div>
                <h2 className="text-2xl font-bold text-slate-900">7. Children's Privacy</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                Our Service is not intended for individuals under 18. We do not knowingly collect personal information from minors. If we become aware that a minor has provided personal information, we will delete it as soon as practicable.
              </p>
            </section>

            {/* Security Measures */}
            <section className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
              <div className="relative pl-4 mb-6">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-amber-400 rounded-full"></div>
                <h2 className="text-2xl font-bold text-slate-900">8. Security Measures</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                We implement reasonable administrative, technical, and physical controls to protect your personal data from unauthorized access, loss, or misuse. These include encryption, access controls, network monitoring, and secure development practices.
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                However, no security measure is perfect or impenetrable, and we cannot guarantee absolute security of your data.
              </p>
            </section>

            {/* Changes to Policy */}
            <section className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
              <div className="relative pl-4 mb-6">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-amber-400 rounded-full"></div>
                <h2 className="text-2xl font-bold text-slate-900">9. Changes to This Policy</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may update or revise this Privacy Policy from time to time. If we make material changes, we will post the updated policy on joinbrightnest.com with a new "Last Updated" date.
                Your continued use of the Service after such changes constitutes your acceptance of the revised policy.
              </p>
            </section>

            {/* Contact Information */}
            <section className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
              <div className="relative pl-4 mb-6">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-amber-400 rounded-full"></div>
                <h2 className="text-2xl font-bold text-slate-900">10. Contact Information</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                For privacy-related questions, access requests, or concerns, please contact:
              </p>
              <div className="bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-lg p-6 mt-4">
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
            Please print or save a copy of this Privacy Policy for your records.
          </p>
        </div>
      </div>
      
      <SiteFooter />
    </div>
  );
}
