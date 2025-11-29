"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";

// All blog articles - Only the 5 featured posts
const allArticles = [
  {
    id: 1,
    title: "Why Your Budget Keeps Failing (And How to Fix It)",
    category: "HABITS",
    readTime: "4 min read",
    description: "Budgets aren't about restriction — they're about freedom. Discover the 3 behavior shifts that make budgeting actually work.",
    slug: "why-your-budget-keeps-failing",
    gradient: "from-teal-500 to-teal-600"
  },
  {
    id: 2,
    title: "The Hidden Cost of 'Buy Now, Pay Later'",
    category: "MINDSET",
    readTime: "3 min read",
    description: "That innocent payment plan could be costing you more than money. Let's talk about the psychological trap of deferred payments.",
    slug: "hidden-cost-of-bnpl",
    gradient: "from-teal-400 to-teal-500"
  },
  {
    id: 3,
    title: "How to Talk About Money With Your Partner",
    category: "RELATIONSHIPS",
    readTime: "5 min read",
    description: "Money conversations don't have to be awkward. Here's how to build financial trust and alignment in your relationship.",
    slug: "talk-about-money-with-your-partner",
    gradient: "from-teal-600 to-teal-700"
  },
  {
    id: 4,
    title: "The 3-Account System That Changed Everything",
    category: "PLANNING",
    readTime: "4 min read",
    description: "Stop juggling everything in one account. This simple system makes managing money effortless and automatic.",
    slug: "three-account-system",
    gradient: "from-teal-500 to-teal-600"
  },
  {
    id: 5,
    title: "Building Wealth on a Variable Income",
    category: "PLANNING",
    readTime: "6 min read",
    description: "Freelancer? Commission-based? Entrepreneur? Here's how to build financial stability when your income fluctuates.",
    slug: "build-wealth-on-variable-income",
    gradient: "from-teal-400 to-teal-500"
  }
];

const ITEMS_PER_PAGE = 9; // Will show all 5 articles on one page

function BlogReadContent() {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get category from URL or default to 'all'
  useEffect(() => {
    const category = searchParams?.get('category') || 'all';
    setActiveCategory(category);
    setCurrentPage(1); // Reset to first page when category changes
  }, [searchParams]);

  // Filter articles by category
  const filteredArticles = activeCategory === 'all' 
    ? allArticles 
    : allArticles.filter(article => article.category.toLowerCase() === activeCategory);

  // Calculate pagination
  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

  const categories = ['ALL', 'MINDSET', 'HABITS', 'PLANNING', 'RELATIONSHIPS'];

  const handleCategoryChange = (category: string) => {
    const categoryLower = category.toLowerCase();
    setActiveCategory(categoryLower);
    setCurrentPage(1);
    // Update URL without page reload
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (categoryLower === 'all') {
      params.delete('category');
    } else {
      params.set('category', categoryLower);
    }
    window.history.pushState({}, '', `/blog/read${params.toString() ? '?' + params.toString() : ''}`);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-[60] shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden lg:flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/" className="group flex items-center space-x-2">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-teal-700 bg-clip-text text-transparent group-hover:from-teal-600 group-hover:to-slate-700 transition-all duration-300">
                  BrightNest
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-8">
              <Link href="/about" className="px-3 py-2 text-slate-600 font-medium text-sm hover:text-teal-600 transition-colors duration-200 relative group">
                About Us
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link href="/blog" className="px-3 py-2 text-slate-900 font-medium text-sm border-b-2 border-teal-600">
                Blog
              </Link>
              <Link href="/careers" className="px-3 py-2 text-slate-600 font-medium text-sm hover:text-teal-600 transition-colors duration-200 relative group">
                Careers
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
            </div>
            
            <div className="flex items-center">
              <Link href="/quiz/financial-profile" className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:from-teal-700 hover:to-teal-800 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02]">
                Learn More
              </Link>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-700 hover:text-slate-900 focus:outline-none transition-all duration-200"
                aria-label="Toggle mobile menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              <Link href="/" className="group">
                <div className="text-xl font-bold bg-gradient-to-r from-slate-900 to-teal-700 bg-clip-text text-transparent group-hover:from-teal-600 group-hover:to-slate-700 transition-all duration-300 whitespace-nowrap">
                  BrightNest
                </div>
              </Link>
            </div>

            <Link 
              href="/quiz/financial-profile" 
              className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-4 py-2 rounded-full font-semibold text-xs hover:from-teal-700 hover:to-teal-800 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap"
            >
              APPLY NOW
            </Link>
          </div>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <>
              <div 
                className="fixed top-16 left-0 right-0 bottom-0 bg-black/50 z-50 lg:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <div className="lg:hidden absolute left-0 right-0 top-full bg-white border-b border-gray-200 shadow-lg z-[60]" style={{ animation: 'slideDown 0.3s ease-out' }}>
                <div className="px-4 py-4 space-y-1">
                  <Link href="/about" className="block px-4 py-3 text-slate-600 font-medium text-sm hover:bg-gray-50 hover:text-teal-600 rounded-md transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
                  <Link href="/blog" className="block px-4 py-3 text-teal-700 font-semibold text-sm bg-teal-50 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
                  <Link href="/careers" className="block px-4 py-3 text-slate-600 font-medium text-sm hover:bg-gray-50 hover:text-teal-600 rounded-md transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>Careers</Link>
                  <div className="pt-2">
                    <Link href="/quiz/financial-profile" className="block w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white px-4 py-3 rounded-lg font-semibold text-sm text-center shadow-md hover:from-teal-700 hover:to-teal-800 transition-all duration-300" onClick={() => setIsMobileMenuOpen(false)}>
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50/20 rounded-full blur-3xl"></div>
        
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/blog" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">
            ← Back to Blog
          </Link>
        </div>

        {/* Tabs - READ, WATCH, LISTEN */}
        <div className="mb-6 sm:mb-8">
          <div className="flex gap-4 sm:gap-6 border-b border-slate-200">
            <Link 
              href="/blog/read" 
              className="px-2 sm:px-4 py-3 text-lg sm:text-xl font-bold text-teal-600 border-b-2 border-teal-600"
            >
              READ
            </Link>
            <Link 
              href="/blog/watch" 
              className="px-2 sm:px-4 py-3 text-lg sm:text-xl font-bold text-slate-900 hover:text-teal-600 transition-colors"
            >
              WATCH
            </Link>
            <Link 
              href="/blog/listen" 
              className="px-2 sm:px-4 py-3 text-lg sm:text-xl font-bold text-slate-900 hover:text-teal-600 transition-colors"
            >
              LISTEN
            </Link>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">read</h1>
        </div>

        {/* Filter by Category */}
        <div className="mb-6 sm:mb-10 relative">
          <h3 className="text-base sm:text-lg text-slate-600 mb-3 sm:mb-5 font-medium">Filter by Category</h3>
          <div className="flex flex-wrap gap-2 sm:gap-4">
            {categories.map((category) => {
              const categoryLower = category.toLowerCase();
              const isActive = activeCategory === (categoryLower === 'all' ? 'all' : categoryLower);
              return (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(categoryLower)}
                  className={`px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-xl font-semibold uppercase rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-teal-300'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {paginatedArticles.map((article) => (
            <Link 
              key={article.id} 
              href={`/blog/${article.slug}`} 
              className="block bg-white rounded-xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-teal-300 transition-all duration-300 group"
            >
              <div className={`h-48 bg-gradient-to-br ${article.gradient} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  {article.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{article.readTime}</span>
                  <span className="text-xs text-teal-600 uppercase font-semibold bg-teal-50 px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages && (
              <button
                onClick={handleNextPage}
                className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:from-teal-700 hover:to-teal-800 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02]"
              >
                Next
              </button>
            )}
          </div>
        )}

        {/* CTA Section */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl mt-12 sm:mt-16">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-teal-700 to-teal-600"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-800/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="relative p-6 sm:p-12 text-center text-white">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
              Begin Your Journey To Financial Peace
            </h2>
            <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto opacity-95">
              Uncover what's holding you back from building lasting wealth and feeling confident with your money!
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

export default function BlogReadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading articles...</p>
        </div>
      </div>
    }>
      <BlogReadContent />
    </Suspense>
  );
}

