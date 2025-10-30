import Link from "next/link";
import PostContents from "@/components/PostContents";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Simple in-file map so list cards can route somewhere meaningful today.
// Replace with real CMS/data source later.
const FALLBACK_ARTICLE = {
  category: "Mindset",
  title: "Why The Weight Keeps Coming Back",
  heroImages: [
    { color: "from-blue-300 to-blue-400" },
    { color: "from-pink-300 to-pink-400" },
    { color: "from-amber-300 to-amber-400" }
  ],
  sections: [
    {
      title: "1. Habits",
      body:
        "We all carry around the habits we’ve ingrained over the course of years — and it takes time and concerted effort to entrain new ones. If you slip back into your old habits for a moment, that’s normal; if you don’t pull yourself back out of them, that’s where you’ll run into trouble."
    },
    {
      title: "2. The pull of the ‘old you’",
      body:
        "As habits become ingrained, they start to define the way we see ourselves. If you have no proof yet of the person you want to be, it’s easy to think this is simply who you are. Intentional choices, consistently, create the new you."
    },
    {
      title: "3. Discipline as freedom vs. punishment",
      body:
        "You can white‑knuckle discipline for a bit; to sustain it for years, you have to associate it with freedom and your deeper ‘why’."
    }
  ]
};

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;

  // In the absence of a data layer, use a single article template.
  // The structure matches the reference page, with BrightNest styling.
  const article = FALLBACK_ARTICLE;

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-7 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
          {/* Left rail: post contents + promo card */}
          <aside className="lg:col-span-3">
            <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-28">
              {/* Post contents dropdown */}
              <PostContents
                sections={article.sections.map((s, i) => ({ id: `section-${i + 1}`, title: s.title }))}
              />

              {/* Promo card (hide on mobile to match reference; show only on desktop) */}
              <div className="hidden lg:block rounded-2xl p-6 text-white shadow-md text-center" style={{
                background: "radial-gradient(120% 120% at 10% 0%, #2dd4bf 0%, #0ea5e9 45%, #ef4444 100%)"
              }}>
                <div className="text-xs font-bold uppercase tracking-wider opacity-90 mb-2">Limited time</div>
                <h3 className="text-2xl font-black leading-tight mb-3">
                  Feel Like Your Body's Betraying You After 40?
                </h3>
                <p className="text-sm text-white/90 leading-relaxed mb-5">
                  1‑on‑1 coaching. Personalized macros & workouts designed for your changing body. Join thousands proving it's never too late to become your strongest self.
                </p>
                <Link
                  href="/quiz/financial-profile"
                  className="inline-flex items-center justify-center w-full bg-[#FF6B6B] hover:bg-[#ff5670] text-white font-extrabold rounded-lg py-3 transition-colors"
                >
                  APPLY NOW
                </Link>
              </div>
            </div>
          </aside>

          {/* Main article */}
          <main className="lg:col-span-9">
            <div className="mb-3 sm:mb-5">
              <div className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#16a085]">{article.category}</div>
              <h1 className="mt-1 sm:mt-2 text-2xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                {article.title}
              </h1>
            </div>

            {/* Hero media strip (always 3-panel landscape; scaled heights per breakpoint) */}
            <div className="rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-200 mb-4 sm:mb-8 lg:mb-10">
              <div className="grid grid-cols-3">
                {article.heroImages.map((h, i) => (
                  <div key={i} className={`h-32 sm:h-48 md:h-64 lg:h-72 bg-gradient-to-br ${h.color}`} />
                ))}
              </div>
              <div className="px-5 sm:px-8 pb-5 sm:pb-7">
                <div className="inline-flex items-center justify-center mt-4 bg-black text-white text-xs sm:text-sm font-black px-4 sm:px-6 py-2 rounded-md">
                  3 HABITS THAT BRING THE WEIGHT BACK
                </div>
              </div>
            </div>

            {/* Body */}
            <article className="prose max-w-none">
              {article.sections.map((s, i) => (
                <section key={i} id={`section-${i + 1}`} className="mb-10 scroll-mt-24 sm:scroll-mt-28 md:scroll-mt-32">
                  <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900 mb-4">{s.title}</h2>
                  <p className="text-gray-800 leading-relaxed text-base sm:text-lg">{s.body}</p>
                </section>
              ))}
            </article>

            {/* End of article content */}
          </main>
        </div>

        {/* Mid-page CTA (before Top Read Content) */}
        <div className="mt-8 sm:mt-10">
          <div className="rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center text-white bg-gradient-to-r from-[#1d1b52] via-[#7a1f6e] to-[#ff2f68]">
            <div className="text-xs font-bold uppercase tracking-wider opacity-90 mb-2">Limited Time</div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">Begin Your Journey To A Stronger, Healthier You</h3>
            <p className="text-sm text-white/90 mb-5 max-w-2xl mx-auto">Uncover what’s holding you back from getting toned & feeling confident in your skin!</p>
            <Link href="/quiz/financial-profile" className="inline-block bg-[#FF6B6B] hover:bg-[#ff5670] text-white font-extrabold px-6 py-3 rounded-lg">APPLY NOW</Link>
          </div>
        </div>

        {/* Top Read Content - full width below the grid */}
        <section className="mt-8 sm:mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900">Top Read Content</h2>
            <Link href="/blog" className="text-[#FF6B6B] font-semibold">View More</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/blog/why-your-budget-keeps-failing" className="group block">
              <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200">
                <div className="h-44 bg-gradient-to-br from-blue-300 to-blue-400 group-hover:opacity-95 transition-opacity" />
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#FF6B6B] transition-colors">How To Balance Your Macros For Sustained Energy</h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">Macronutrients aren’t just about what & how much you eat in a day — there’s an art to supporting your body’s natural rhythms, giving you sustained energy and lasting results. Let’s look at how to do it!</p>
                  <div className="text-xs text-gray-500">3 min read</div>
                </div>
              </div>
            </Link>

            <Link href="/blog/hidden-cost-of-bnpl" className="group block">
              <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200">
                <div className="h-44 bg-gradient-to-br from-fuchsia-300 to-pink-400 group-hover:opacity-95 transition-opacity" />
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#FF6B6B] transition-colors">How To *Guarantee* You’ll Never Change Your Body Composition</h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">We talk a lot about what you can do to transform your body composition — this time, here are 3 things that will ensure you never build the body you want, so you can avoid them completely.</p>
                  <div className="text-xs text-gray-500">3 min read</div>
                </div>
              </div>
            </Link>

            <Link href="/blog/three-account-system" className="group block">
              <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200">
                <div className="h-44 bg-gradient-to-br from-amber-300 to-orange-400 group-hover:opacity-95 transition-opacity" />
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#FF6B6B] transition-colors">Why You Need Carbs To Tone</h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">If you’re serious about building a body composition you love, carbs aren’t just helpful — they’re essential. Here’s why they drive performance and results.</p>
                  <div className="text-xs text-gray-500">3 min read</div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* CTA strip - full width below Top Read Content */}
        <div className="mt-12 rounded-xl p-6 sm:p-8 text-center text-white bg-gradient-to-r from-blue-600 to-teal-500">
          <h3 className="text-2xl font-bold mb-2">Begin Your Journey To A Stronger, Healthier You</h3>
          <p className="text-white/90 mb-5">Uncover what’s holding you back from getting toned & feeling confident in your skin!</p>
          <Link href="/quiz/financial-profile" className="inline-block bg-[#FF6B6B] hover:bg-[#ff5670] text-white font-extrabold px-6 py-3 rounded-lg">
            APPLY NOW
          </Link>
        </div>
      </div>
      {/* Footer must be OUTSIDE the constrained container to span full width */}
      <SiteFooter />
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const title = `Read • ${slug.replace(/-/g, " ")}`;
  return {
    title,
    description: "Article • BrightNest",
  };
}


