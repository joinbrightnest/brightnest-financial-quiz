"use client";

import Link from "next/link";
import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

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

      <SiteFooter />
    </div>
  );
}

