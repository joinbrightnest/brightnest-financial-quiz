"use client";

import Link from "next/link";
import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  // Sample blog posts data
  const featuredPosts = [
    {
      id: 1,
      title: "Why Your Budget Keeps Failing (And How to Fix It)",
      category: "HABITS",
      readTime: "4 min read",
      description: "Budgets aren't about restriction — they're about freedom. Discover the 3 behavior shifts that make budgeting actually work.",
      image: "/blog/budget-failing.jpg",
      slug: "why-your-budget-keeps-failing"
    },
    {
      id: 2,
      title: "The Hidden Cost of 'Buy Now, Pay Later'",
      category: "MINDSET",
      readTime: "3 min read",
      description: "That innocent payment plan could be costing you more than money. Let's talk about the psychological trap of deferred payments.",
      image: "/blog/bnpl.jpg",
      slug: "hidden-cost-of-bnpl"
    },
    {
      id: 3,
      title: "How to Talk About Money With Your Partner",
      category: "RELATIONSHIPS",
      readTime: "5 min read",
      description: "Money conversations don't have to be awkward. Here's how to build financial trust and alignment in your relationship.",
      image: "/blog/money-talk.jpg",
      slug: "talk-about-money-with-your-partner"
    },
    {
      id: 4,
      title: "The 3-Account System That Changed Everything",
      category: "PLANNING",
      readTime: "4 min read",
      description: "Stop juggling everything in one account. This simple system makes managing money effortless and automatic.",
      image: "/blog/account-system.jpg",
      slug: "three-account-system"
    },
    {
      id: 5,
      title: "Building Wealth on a Variable Income",
      category: "PLANNING",
      readTime: "6 min read",
      description: "Freelancer? Commission-based? Entrepreneur? Here's how to build financial stability when your income fluctuates.",
      image: "/blog/variable-income.jpg",
      slug: "build-wealth-on-variable-income"
    }
  ];

  const categories = ['ALL', 'MINDSET', 'HABITS', 'PLANNING', 'RELATIONSHIPS'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <SiteHeader />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50/20 rounded-full blur-3xl"></div>
        
        {/* Featured Post Section - Left: Main Post, Right: Featured Posts List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12 relative">
          {/* Main Featured Post - Left (50% width) */}
          <div className="relative">
            {/* Image with overlay text */}
            <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden mb-4 shadow-lg group">
              {/* Background Image */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700"></div>
              
              {/* Text Banner Overlay - Positioned over image */}
              <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 right-4 sm:right-8">
                <div className="inline-block bg-gradient-to-r from-teal-700 to-teal-800 px-3 sm:px-6 py-2 sm:py-3 rounded-lg shadow-xl">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                    A Behaviour-Change Approach to Personal Finances
                  </h2>
                </div>
              </div>
              
              {/* Featured Post Badge */}
              <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
                <div className="inline-block bg-white text-teal-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold shadow-md">
                  FEATURED POST
                </div>
              </div>
            </div>
            
            {/* Title and Description Below Image */}
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">
                <Link href={`/blog/${featuredPosts[0].slug}`} className="hover:text-teal-600 transition-colors">
                  Why Your Budget Keeps Failing (And How to Fix It)
                </Link>
              </h3>
              <p className="text-slate-600 text-sm mb-3 sm:mb-4 leading-relaxed">
                Budgets aren&apos;t about restriction — they&apos;re about freedom. Discover the 3 behavior shifts that make budgeting actually work.
              </p>
              <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm">
                <span className="text-teal-600 uppercase font-semibold bg-teal-50 px-3 py-1 rounded-full">HABITS</span>
                <span className="text-slate-400">4 min read</span>
              </div>
            </div>
          </div>

          {/* Featured Posts List - Right (50% width) */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/60 shadow-sm">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">FEATURED POSTS</h2>
              <div className="h-1 bg-gradient-to-r from-teal-500 via-amber-400 to-teal-500 w-20 sm:w-24 rounded-full"></div>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {featuredPosts.slice(0, 5).map((post) => (
                <div key={post.id} className="border-b border-slate-200/60 pb-3 sm:pb-4 last:border-0">
                  <Link href={`/blog/${post.slug}`} className="block group">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1 hover:text-teal-600 transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-500">{post.readTime}</p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter by Category */}
        <div className="mb-6 sm:mb-10 relative">
          <h3 className="text-base sm:text-lg text-slate-600 mb-3 sm:mb-5 font-medium">Filter by Category</h3>
          <div className="flex flex-wrap gap-2 sm:gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category.toLowerCase())}
                className={`px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-xl font-semibold uppercase rounded-lg transition-all duration-300 ${
                  activeCategory === category.toLowerCase()
                    ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-teal-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Read Section */}
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">read</h2>
            <Link href="/blog/read" className="text-sm sm:text-base text-teal-600 font-semibold hover:text-teal-700 transition-colors">
              view more
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Link href={`/blog/${featuredPosts[1].slug}`} className="block bg-white rounded-xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-teal-300 transition-all duration-300 group">
              <div className="h-48 bg-gradient-to-br from-teal-400 to-teal-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors">
                  {featuredPosts[1].title}
                </h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  {featuredPosts[1].description}
                </p>
                <div className="text-xs text-slate-500">{featuredPosts[1].readTime}</div>
              </div>
            </Link>

            <Link href={`/blog/${featuredPosts[2].slug}`} className="block bg-white rounded-xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-teal-300 transition-all duration-300 group">
              <div className="h-48 bg-gradient-to-br from-teal-600 to-teal-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors">
                  {featuredPosts[2].title}
                </h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  {featuredPosts[2].description}
                </p>
                <div className="text-xs text-slate-500">{featuredPosts[2].readTime}</div>
              </div>
            </Link>

            <Link href={`/blog/${featuredPosts[3].slug}`} className="block bg-white rounded-xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-teal-300 transition-all duration-300 group">
              <div className="h-48 bg-gradient-to-br from-teal-500 to-teal-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors">
                  {featuredPosts[3].title}
                </h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  {featuredPosts[3].description}
                </p>
                <div className="text-xs text-slate-500">{featuredPosts[3].readTime}</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Watch Section */}
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">watch</h2>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-8 sm:p-12 md:p-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                Coming Soon
              </h3>
              <p className="text-base sm:text-lg text-slate-600 max-w-md leading-relaxed">
                We&apos;re working on bringing you valuable video content to help you build lasting wealth. Check back soon!
              </p>
            </div>
          </div>
        </div>

        {/* Listen Section */}
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">listen</h2>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-8 sm:p-12 md:p-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                Coming Soon
              </h3>
              <p className="text-base sm:text-lg text-slate-600 max-w-md leading-relaxed">
                Exciting podcast episodes are on the way! We&apos;re preparing engaging conversations about money, mindset, and building wealth.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-teal-700 to-teal-600"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-800/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="relative p-6 sm:p-12 text-center text-white">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
              Begin Your Journey To Financial Peace
            </h2>
            <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto opacity-95">
              Uncover what&apos;s holding you back from building lasting wealth and feeling confident with your money!
            </p>
            <Link
              href="/quiz/financial-profile"
              className="inline-block bg-white text-teal-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 duration-300"
            >
              TAKE THE QUIZ
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 sm:py-16 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12">
            {/* Logo and Social */}
            <div>
              <Link href="/" className="text-2xl font-bold text-white mb-6 block">
                BrightNest
              </Link>
              <div className="flex space-x-4">
                <a href="https://twitter.com/brightnest" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="Twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="https://facebook.com/brightnest" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://instagram.com/brightnest" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
                <a href="https://youtube.com/@brightnest" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="YouTube">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide mb-4 text-white">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/" className="text-slate-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/about" className="text-slate-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/blog" className="text-slate-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="text-slate-400 hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide mb-4 text-white">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/quiz/financial-profile" className="text-slate-400 hover:text-white transition-colors">Take the Quiz</Link></li>
                <li><Link href="/affiliates/signup" className="text-slate-400 hover:text-white transition-colors">Become a Partner</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide mb-4 text-white">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-400">
            © {new Date().getFullYear()} BrightNest Technologies LLC. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

