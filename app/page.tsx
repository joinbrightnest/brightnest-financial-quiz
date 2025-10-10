import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Purple Bar */}
      <div className="bg-purple-900 h-1"></div>
      
      {/* Navigation */}
      <nav className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                BrightNest
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/careers" className="text-gray-900 font-medium text-sm uppercase tracking-wide">
                Careers
              </Link>
              <Link href="/quiz/financial-profile" className="text-gray-900 font-medium text-sm uppercase tracking-wide">
                Financial Profile
              </Link>
              <Link href="/quiz/health-finance" className="text-gray-900 font-medium text-sm uppercase tracking-wide">
                Health Finance
              </Link>
              <Link href="/quiz/marriage-finance" className="text-gray-900 font-medium text-sm uppercase tracking-wide">
                Marriage Finance
              </Link>
              <Link href="/about" className="text-gray-900 font-medium text-sm uppercase tracking-wide">
                Company
              </Link>
              <Link href="/help" className="text-gray-900 font-medium text-sm uppercase tracking-wide">
                Support
              </Link>
              <Link href="/login" className="text-gray-900 font-medium text-sm uppercase tracking-wide">
                Login
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <select className="text-gray-900 bg-transparent border-none text-sm font-medium uppercase tracking-wide">
                <option>EN</option>
              </select>
              <Link 
                href="/quiz/financial-profile"
                className="bg-teal-600 text-white px-4 py-2 text-sm font-medium hover:bg-teal-700 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex min-h-screen">
        {/* Left Content */}
        <div className="flex-1 bg-gray-50 flex items-center justify-center p-8">
          <div className="max-w-md">
            <h1 className="text-4xl font-serif text-gray-900 mb-4 leading-tight">
              Learn to spend mindfully.
            </h1>
            <p className="text-lg font-serif text-gray-900 mb-8 leading-relaxed">
              Psychology is the key to lasting financial change.
            </p>
            <Link 
              href="/quiz/financial-profile"
              className="inline-block bg-orange-500 text-white px-8 py-4 text-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Continue
            </Link>
          </div>
        </div>

        {/* Right Image */}
        <div className="flex-1 bg-white flex items-center justify-center p-8">
          <div className="relative w-full h-full max-w-lg">
            {/* Financial Planning Image Placeholder */}
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Financial Planning</h3>
                <p className="text-gray-600 text-sm">Building wealth through mindful spending</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}