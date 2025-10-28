"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{backgroundColor: '#faf8f0'}}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-6">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900">
                BrightNest
              </h1>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
            BrightNest Privacy Policy
          </h1>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="space-y-8">
            {/* Introduction */}
            <section>
              <p className="text-gray-800 leading-relaxed mb-4">
                <strong>Effective Date:</strong> 03/12/2024<br />
                <strong>Last Updated:</strong> 06/03/2025
              </p>
              
              <p className="text-gray-800 leading-relaxed mb-4">
                BrightNest Technologies LLC ("BrightNest," "we," "us," or "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit or use joinbrightnest.com and any associated services (the "Service").
              </p>
              <p className="text-gray-800 leading-relaxed mb-4">
                By using the Service, you agree to the collection and use of your information in accordance with this policy. If you disagree, please do not use the Service.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-800 leading-relaxed mb-4">
                We collect several types of information from and about users of our Service, including:
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1.1 Information You Provide Directly</h3>
              <ul className="list-disc list-inside text-gray-800 leading-relaxed mb-4 space-y-2">
                <li><strong>Account and Profile Information:</strong> name, email address, username, password (hashed), and other registration details.</li>
                <li><strong>User Responses & Input:</strong> answers you provide in quizzes, assessments, surveys, behavioral logs, goals, preferences, and other content you submit.</li>
                <li><strong>Communications:</strong> when you contact us via email, support forms, chat, or otherwise, we collect the content of your communication and any attachments.</li>
                <li><strong>Payment and Transaction Data:</strong> if you purchase a paid product or service, we may collect billing address, credit/debit card information, transaction details, or other payment method data (processed via Stripe, PayPal, or other payment processors).</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">1.2 Automatically Collected Information</h3>
              <ul className="list-disc list-inside text-gray-800 leading-relaxed mb-4 space-y-2">
                <li><strong>Usage & Analytics Data:</strong> pages or features you access, click behavior, timestamps, referring URLs, session durations, and other activity metrics.</li>
                <li><strong>Device & System Data:</strong> information about your device and system environment (device type, operating system, browser, IP address, device identifiers).</li>
                <li><strong>Cookies & Tracking Technologies:</strong> we and our partners use cookies, web beacons, pixel tags, local storage, analytic SDKs, and similar technologies to collect information about your interactions with the Service (for example, site navigation, features used, preferences).</li>
                <li><strong>Inferred / Derived Information:</strong> we may infer additional characteristics or preferences from your behavior, engagement patterns, or other data (e.g., "user prefers short-form content").</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">1.3 Information from Third Parties</h3>
              <ul className="list-disc list-inside text-gray-800 leading-relaxed mb-4 space-y-2">
                <li><strong>Service Providers & Partners:</strong> we may obtain data from third-party services we use (for example, identity verification, email services, analytics, advertising partners).</li>
                <li><strong>Marketing & Advertising Data:</strong> for example, demographic or interest data from third-party sources to better tailor your experience or offers.</li>
                <li><strong>Integrations & Linked Accounts:</strong> if you choose to connect external services (e.g. social login), we may collect information from those external services as allowed by your settings and consent.</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-800 leading-relaxed mb-4">
                We use the information we collect for the following purposes:
              </p>
              
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Purpose</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Data Types Involved</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Description</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">Provisioning & Operation</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">Account info, usage data, device data</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">To deliver the Service, authenticate you, maintain your account, and ensure service functionality.</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">Personalization & Insights</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">Behavior logs, user input, inferred data</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">To tailor your experience, suggest content, generate insights, and adapt to your progress.</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">Improvement & Development</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">Usage data, feedback, crash logs</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">To assess performance, troubleshoot issues, test new features, and improve the Service.</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">Customer Support</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">Contact communications, account info</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">To respond to your inquiries, troubleshoot, and assist with support requests.</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">Payment & Billing</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">Payment data, transaction records</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">To process transactions, prevent fraud, enforce payment terms, and manage financial operations.</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">Marketing & Communications</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">Email, preferences, usage data</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">To send updates, promotional offers, newsletters, surveys, and to inform you about new features (you may opt out).</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">Legal & Compliance</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">Account info, logs, communications</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">To comply with legal obligations, enforce our Terms, or protect rights, safety, or property.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Sharing & Disclosure */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Sharing & Disclosure of Information</h2>
              <p className="text-gray-800 leading-relaxed mb-4">
                We may share your data in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-800 leading-relaxed mb-4 space-y-2">
                <li><strong>Service Providers & Contractors:</strong> third parties who perform services on our behalf (e.g. analytics, customer support, payment processing) under confidentiality obligations.</li>
                <li><strong>Legal Obligations & Safety:</strong> when required by law, court order, or to protect rights, safety, or property (yours or others).</li>
                <li><strong>Business Transfers:</strong> in connection with a merger, acquisition, or sale of assets, your data may be transferred (with notice).</li>
                <li><strong>Aggregated / Anonymized Data:</strong> we may share data that's de-identified or aggregated which cannot reasonably be used to identify you.</li>
                <li><strong>User-Controlled Sharing:</strong> when you choose to link or share data with third-party services, the information shared will be bound by your choices and their policies.</li>
              </ul>
              <p className="text-gray-800 leading-relaxed mb-4">
                <strong>We do not sell your personal information for commercial marketing purposes.</strong>
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Retention</h2>
              <p className="text-gray-800 leading-relaxed mb-4">
                We retain your personal information only as long as necessary to fulfill the purposes laid out in this Privacy Policy, unless a longer retention period is required or permitted by law.
                When we no longer need your data, we will delete it or anonymize it (i.e., remove personally identifiable attributes).
              </p>
            </section>

            {/* Privacy Rights */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Privacy Rights & Choices</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Account Controls & Preferences</h3>
              <ul className="list-disc list-inside text-gray-800 leading-relaxed mb-4 space-y-2">
                <li>You can review, edit, or delete profile information associated with your account (subject to certain data retention obligations).</li>
                <li>You may unsubscribe from marketing emails or promotional communications via settings or by contacting us.</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 Deletion & Erasure</h3>
              <p className="text-gray-800 leading-relaxed mb-4">
                You may request the deletion of your personal data (to the extent permitted by law). After deletion, you may lose access to certain parts of the Service. Some data may remain in backup or legal archives for purposes such as fraud prevention or compliance.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.3 Data Access & Portability</h3>
              <p className="text-gray-800 leading-relaxed mb-4">
                Upon request, we may provide a copy of your personal data in a structured, commonly used, machine-readable format (where applicable).
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.4 Opt-Out of Tracking & Cookies</h3>
              <p className="text-gray-800 leading-relaxed mb-4">
                You can disable or restrict certain cookies or tracking technologies via browser settings or device preferences. However, this may impact your ability to fully use or benefit from the Service.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.5 Do-Not-Track Signals & Similar Mechanisms</h3>
              <p className="text-gray-800 leading-relaxed mb-4">
                We currently do not honor browser "Do Not Track" signals as a standard, but we provide alternative options for limiting tracking through preferences or settings.
              </p>
            </section>

            {/* International Data Transfers */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. International Data Transfers</h2>
              <p className="text-gray-800 leading-relaxed mb-4">
                Your information may be stored or processed in the U.S. or other countries where our servers or service providers are located.
                When transferring data across borders, we will use contractual safeguards (e.g. standard contractual clauses) or other legally recognized mechanisms to ensure adequate protection.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Children's Privacy</h2>
              <p className="text-gray-800 leading-relaxed mb-4">
                Our Service is not intended for individuals under 18. We do not knowingly collect personal information from minors. If we become aware that a minor has provided personal information, we will delete it as soon as practicable.
              </p>
            </section>

            {/* Security Measures */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Security Measures</h2>
              <p className="text-gray-800 leading-relaxed mb-4">
                We implement reasonable administrative, technical, and physical controls to protect your personal data from unauthorized access, loss, or misuse. These include encryption, access controls, network monitoring, and secure development practices.
              </p>
              <p className="text-gray-800 leading-relaxed mb-4">
                However, no security measure is perfect or impenetrable, and we cannot guarantee absolute security of your data.
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to This Policy</h2>
              <p className="text-gray-800 leading-relaxed mb-4">
                We may update or revise this Privacy Policy from time to time. If we make material changes, we will post the updated policy on joinbrightnest.com with a new "Last Updated" date.
                Your continued use of the Service after such changes constitutes your acceptance of the revised policy.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-800 leading-relaxed mb-4">
                For privacy-related questions, access requests, or concerns, please contact:
              </p>
              <div className="bg-gray-50 rounded-lg p-6 mt-4">
                <p className="text-gray-800 leading-relaxed mb-2">
                  <strong>BrightNest Technologies LLC</strong><br />
                  Email:{" "}
                  <a href="mailto:support@brightnest.com" className="text-blue-600 underline hover:text-blue-800">
                    support@brightnest.com
                  </a>
                </p>
                <p className="text-gray-800 leading-relaxed">
                  Website:{" "}
                  <a href="https://joinbrightnest.com" className="text-blue-600 underline hover:text-blue-800">
                    https://joinbrightnest.com
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 text-sm">
            Please print or save a copy of this Privacy Policy for your records.
          </p>
        </div>
      </div>
    </div>
  );
}
