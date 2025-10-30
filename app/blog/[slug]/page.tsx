import Link from "next/link";

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
    <div className="min-h-screen bg-[#faf8f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left rail: post contents + promo card */}
          <aside className="lg:col-span-3">
            <div className="sticky top-6 space-y-6">
              {/* Post contents dropdown */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <button className="w-full flex items-center justify-between px-5 py-4">
                  <span className="text-base font-semibold text-gray-900">Post Contents</span>
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <nav className="px-5 pb-4 space-y-3">
                  {article.sections.map((s, i) => (
                    <a key={i} href={`#section-${i + 1}`} className="block text-sm text-gray-700 hover:text-[#FF6B6B]">
                      {s.title}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Promo card (BrightNest colors) */}
              <div className="rounded-2xl p-6 text-white shadow-md" style={{
                background: "radial-gradient(120% 120% at 10% 0%, #2dd4bf 0%, #0ea5e9 45%, #ef4444 100%)"
              }}>
                <div className="text-xs font-bold uppercase tracking-wider opacity-90 mb-2">Limited time</div>
                <h3 className="text-2xl font-black leading-tight mb-3">
                  Feel Like Your Body’s Betraying You After 40?
                </h3>
                <p className="text-sm text-white/90 leading-relaxed mb-5">
                  1‑on‑1 coaching. Personalized macros & workouts designed for your changing body. Join thousands proving it’s never too late to become your strongest self.
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
            <div className="mb-6">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#16a085]">{article.category}</div>
              <h1 className="mt-2 text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                {article.title}
              </h1>
            </div>

            {/* Hero media strip (three panels) */}
            <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-200 mb-10">
              <div className="grid grid-cols-1 sm:grid-cols-3">
                {article.heroImages.map((h, i) => (
                  <div key={i} className={`h-56 sm:h-72 bg-gradient-to-br ${h.color}`} />
                ))}
              </div>
              <div className="px-5 sm:px-8 pb-5 sm:pb-7">
                <div className="inline-flex items-center justify-center mt-4 bg-black text-white text-xs sm:text-sm font-black px-4 sm:px-6 py-2 rounded-md">
                  3 HABITS THAT BRING THE WEIGHT BACK
                </div>
              </div>
            </div>

            {/* Body */}
            <article className="prose max-w-none prose-p:text-gray-700 prose-li:text-gray-700">
              {article.sections.map((s, i) => (
                <section key={i} id={`section-${i + 1}`} className="mb-10">
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-3">{s.title}</h2>
                  <p className="text-gray-700 leading-7">{s.body}</p>
                </section>
              ))}
            </article>

            {/* CTA strip at bottom */}
            <div className="mt-12 rounded-xl p-6 sm:p-8 text-center text-white bg-gradient-to-r from-blue-600 to-teal-500">
              <h3 className="text-2xl font-bold mb-2">Begin Your Journey To A Stronger, Healthier You</h3>
              <p className="text-white/90 mb-5">Uncover what’s holding you back from getting toned & feeling confident in your skin!</p>
              <Link href="/quiz/financial-profile" className="inline-block bg-[#FF6B6B] hover:bg-[#ff5670] text-white font-extrabold px-6 py-3 rounded-lg">
                APPLY NOW
              </Link>
            </div>
          </main>
        </div>
      </div>
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


