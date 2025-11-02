import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FAQAccordion from "./FAQAccordion";

export default function BecomePartnerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 text-white py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Build a Business That Changes Lives — Without Building Anything
              </h1>
              <p className="text-xl sm:text-2xl text-teal-100 mb-8 leading-relaxed max-w-3xl mx-auto">
                Join the BrightNest Partner Program and earn 10–30% commissions by promoting a proven financial behavior change system — we handle delivery, coaching, and customer success.
              </p>
              <Link 
                href="/affiliates/signup"
                className="inline-block bg-white text-teal-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-teal-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] mb-4"
              >
                Apply to Become a Partner
              </Link>
              <p className="text-sm text-teal-200 mb-6">
                Limited partner spots available — we only accept aligned creators and educators.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-teal-100">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Certified financial behavior experts</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>100K+ data points analyzed</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Partner with BrightNest */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                Turn Your Audience into a Meaningful Income Stream
              </h2>
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                BrightNest empowers creators, educators, and influencers to help their audience take control of their money — while you earn from every sale you inspire.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                You don't need to manage fulfillment, create programs, or offer support.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed mb-8">
                We do it all. You simply share a proven system that helps people finally change their financial habits — and get rewarded for the impact you create.
              </p>
              
              {/* Expert Authority & Numbers */}
              <div className="bg-teal-50 rounded-lg p-6 border border-teal-200">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Built by Experts</h3>
                    <p className="text-slate-700 leading-relaxed mb-4">
                      Our certified financial behavior experts have helped thousands of people change their financial habits through proven frameworks.
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                      Our coaches are certified professionals with 5+ years in personal finance and behavioral science.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Proven System</h3>
                    <p className="text-slate-700 leading-relaxed mb-4">
                      Over 100,000 data points analyzed to design our financial behavior system — backed by psychology and real results.
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                      Average partner earns $300–$1,000 per referral, depending on client package.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works - 3-Step Visual Section */}
        <section className="py-16 sm:py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-12 text-center">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12 items-start">
              {/* Step 1 */}
              <div className="text-center relative">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  1. Apply & Get Approved
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  Tell us about your audience and why you'd like to partner with BrightNest.
                </p>
                {/* Arrow - Desktop only */}
                <div className="hidden md:block absolute top-10 right-0 transform translate-x-1/2">
                  <svg className="w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>

              {/* Step 2 */}
              <div className="text-center relative">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  2. Get Your Dashboard & Affiliate Link
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  Once accepted, you'll get access to your own real-time CRM and dashboard — track every click, lead, and sale in one place.
                </p>
                {/* Arrow - Desktop only */}
                <div className="hidden md:block absolute top-10 right-0 transform translate-x-1/2">
                  <svg className="w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  3. Earn Passive Income on Every Sale
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  Earn 10–30% commission from every client who joins through your link. You focus on sharing — we handle delivery, customer support, and results.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What You Get as a Partner */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-12 text-center">
              What You Get as a Partner
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left font-bold">Benefit</th>
                        <th className="px-6 py-4 text-left font-bold">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">Personal CRM & Dashboard</td>
                        <td className="px-6 py-4 text-slate-700">See real-time data on clicks, traffic, and revenue.</td>
                      </tr>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">High-Ticket Commission</td>
                        <td className="px-6 py-4 text-slate-700">Earn 10–30% per sale — with average deals between $1,000–$5,000.</td>
                      </tr>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">Full Delivery by Certified Experts</td>
                        <td className="px-6 py-4 text-slate-700">We coach, support, and fulfill — you stay hands-free.</td>
                      </tr>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">Authority Positioning</td>
                        <td className="px-6 py-4 text-slate-700">You'll be portrayed as an expert helping people take control of their finances.</td>
                      </tr>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">Education & Templates</td>
                        <td className="px-6 py-4 text-slate-700">You'll learn how to communicate, grow your audience, and improve conversions.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why BrightNest */}
        <section className="py-16 sm:py-20 bg-gradient-to-br from-teal-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                A Mission Bigger Than Just Money
              </h2>
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                At BrightNest, we believe real wealth starts with behavior change.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                BrightNest was built by educators, marketers, and behavioral experts obsessed with helping people master their finances through psychology, not hype.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                Our certified coaches help people rewire their financial habits, gain control, and build long-term stability.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                As a partner, you're not just earning commissions — you're spreading a movement.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                You'll help people make lasting financial transformations through a system backed by psychology and proven results.
              </p>
              
              {/* Market Validation */}
              <div className="bg-white rounded-lg p-6 border-l-4 border-teal-600 shadow-sm">
                <p className="text-slate-700 leading-relaxed mb-3">
                  <span className="font-bold text-slate-900">The behavior-change market is projected to exceed $100B globally by 2030</span> — and we're building the financial branch of it.
                </p>
                <p className="text-slate-600 text-sm italic">
                  As seen in our latest research on financial behavior change — BrightNest applies evidence-based methods that actually work.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Commission Structure */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-12 text-center">
              Commission Structure
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left font-bold">Tier</th>
                        <th className="px-6 py-4 text-left font-bold">Commission</th>
                        <th className="px-6 py-4 text-left font-bold">Example</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">Starter Partner</td>
                        <td className="px-6 py-4 text-teal-600 font-bold text-lg">10%</td>
                        <td className="px-6 py-4 text-slate-700">You promote occasionally or test new traffic sources.</td>
                      </tr>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">Growth Partner</td>
                        <td className="px-6 py-4 text-teal-600 font-bold text-lg">20%</td>
                        <td className="px-6 py-4 text-slate-700">You integrate BrightNest into your content regularly.</td>
                      </tr>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">Elite Partner</td>
                        <td className="px-6 py-4 text-teal-600 font-bold text-lg">30%</td>
                        <td className="px-6 py-4 text-slate-700">You consistently drive qualified leads and scale impact.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-center text-slate-600 mt-6 text-lg">
                You'll always see transparent, real-time revenue and payouts inside your dashboard.
              </p>
            </div>
          </div>
        </section>

        {/* Become a Founding Partner Section */}
        <section className="py-16 sm:py-20 bg-gradient-to-br from-teal-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full mb-6">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="font-semibold text-sm">Founding Partner Opportunity</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                Become a Founding Partner
              </h2>
              <p className="text-xl text-slate-700 leading-relaxed mb-6">
                Join the first generation of BrightNest partners shaping the future of financial education.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed mb-8">
                We're accepting only 30 founding partners in 2025 to grow with us. Founding partners receive higher commission tiers, early access to updates, and lifetime status inside the network.
              </p>
              <div className="bg-white rounded-lg p-8 shadow-lg border border-slate-200 max-w-2xl mx-auto">
                <p className="text-lg text-slate-800 leading-relaxed italic mb-4">
                  "We're not just building another affiliate program — we're building a movement to help people live financially free lives."
                </p>
                <p className="text-slate-600">
                  The earlier you join, the bigger your impact (and your upside).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Early Partners Love BrightNest */}
        <section className="py-16 sm:py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-12 text-center">
              Why Early Partners Love BrightNest
            </h2>
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-700 leading-relaxed mb-3 italic">
                      "BrightNest handles everything — from client delivery to retention — while I focus on sharing their message."
                    </p>
                    <p className="text-sm text-slate-500">— Early Partner Feedback</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-700 leading-relaxed mb-3 italic">
                      "Finally a program that lets creators earn from impact, not just clicks."
                    </p>
                    <p className="text-sm text-slate-500">— Founding Partner Insight</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Let's Build Something That Creates Both Income and Impact
              </h2>
              <p className="text-xl text-teal-100 mb-8 leading-relaxed">
                Be part of the movement helping people change the way they think, spend, and grow wealth — and earn a share of every transformation you inspire.
              </p>
              <Link 
                href="/affiliates/signup"
                className="inline-block bg-white text-teal-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-teal-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02]"
              >
                Apply to Become a Partner
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 sm:py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <FAQAccordion />
          </div>
        </section>

        {/* Partner Success Stories Coming Soon */}
        <section className="py-12 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-slate-50 rounded-lg p-8 border-2 border-dashed border-slate-300">
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Partner Success Stories Coming Soon
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  We're currently onboarding our first wave of partners — their results will be featured here.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

