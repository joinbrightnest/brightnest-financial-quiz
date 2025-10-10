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
        <div className="flex-1 bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center p-8">
          <div className="max-w-md">
            <h1 className="text-4xl font-serif text-gray-900 mb-4 leading-tight">
              Learn to spend mindfully.
            </h1>
            <p className="text-lg font-serif text-gray-700 mb-8 leading-relaxed">
              Psychology is the key to lasting financial change.
            </p>
            <Link 
              href="/quiz/financial-profile"
              className="inline-block bg-orange-500 text-white px-8 py-4 text-lg font-medium hover:bg-orange-600 transition-colors shadow-lg"
            >
              Continue
            </Link>
          </div>
        </div>

        {/* Right Image */}
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-8">
          <div className="relative w-full h-full max-w-2xl">
            {/* Financial Planning Image */}
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <div className="bg-gradient-to-br from-slate-800 via-blue-900 to-purple-900 h-[600px] flex items-center justify-center">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                    <defs>
                      <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#grid)" />
                  </svg>
                </div>
                
                {/* Main Content */}
                <div className="relative z-10 text-center text-white px-8">
                  {/* Financial Dashboard Mockup */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <div className="text-xs text-white/70">Financial Dashboard</div>
                    </div>
                    
                    {/* Chart Area */}
                    <div className="bg-white/5 rounded-lg p-4 mb-4">
                      <div className="flex items-end justify-center space-x-2 h-20">
                        <div className="bg-gradient-to-t from-blue-500 to-blue-300 w-4 h-8 rounded-t"></div>
                        <div className="bg-gradient-to-t from-green-500 to-green-300 w-4 h-12 rounded-t"></div>
                        <div className="bg-gradient-to-t from-purple-500 to-purple-300 w-4 h-16 rounded-t"></div>
                        <div className="bg-gradient-to-t from-orange-500 to-orange-300 w-4 h-10 rounded-t"></div>
                        <div className="bg-gradient-to-t from-pink-500 to-pink-300 w-4 h-14 rounded-t"></div>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">$12,450</div>
                        <div className="text-white/60">Savings</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">$2,100</div>
                        <div className="text-white/60">Invested</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">85%</div>
                        <div className="text-white/60">On Track</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute top-8 left-8 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  
                  <div className="absolute top-16 right-12 w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  
                  <div className="absolute bottom-20 left-16 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  
                  {/* Main Text */}
                  <div className="mt-8">
                    <h3 className="text-2xl font-bold mb-2">Financial Wellness</h3>
                    <p className="text-white/80 text-lg">Your path to financial freedom</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo and Social */}
            <div className="md:col-span-1">
              <Link href="/" className="text-3xl font-bold text-white mb-6 block">
                BrightNest
              </Link>
              <div className="flex space-x-4">
                <a href="#" className="text-white hover:text-orange-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-orange-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-orange-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-orange-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
                <li><Link href="/careers" className="text-gray-300 hover:text-white">Careers</Link></li>
                <li><Link href="/research" className="text-gray-300 hover:text-white">Research</Link></li>
                <li><Link href="/press" className="text-gray-300 hover:text-white">Press</Link></li>
                <li><Link href="/blog" className="text-gray-300 hover:text-white">Blog</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="text-gray-300 hover:text-white">Support</Link></li>
                <li><Link href="/quiz/financial-profile" className="text-gray-300 hover:text-white">Financial Profile</Link></li>
                <li><Link href="/quiz/health-finance" className="text-gray-300 hover:text-white">Health Finance</Link></li>
                <li><Link href="/quiz/marriage-finance" className="text-gray-300 hover:text-white">Marriage Finance</Link></li>
              </ul>
            </div>

            {/* Languages */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide mb-4">Languages</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-gray-300 hover:text-white">English</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Spanish</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">French</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">German</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              Copyright © 2025 BrightNest, Inc. All Rights Reserved
            </div>
            <div className="flex space-x-4 text-sm">
              <Link href="/login" className="text-gray-400 hover:text-white underline">Login</Link>
              <span className="text-gray-600">|</span>
              <Link href="/privacy" className="text-gray-400 hover:text-white underline">Privacy Policy</Link>
              <span className="text-gray-600">|</span>
              <Link href="/terms" className="text-gray-400 hover:text-white underline">Terms and Conditions</Link>
              <span className="text-gray-600">|</span>
              <Link href="/accessibility" className="text-gray-400 hover:text-white underline">Accessibility</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Disclaimer */}
      <div className="bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-gray-500">
            *Results vary depending on your starting point, goals and effort. People on the BrightNest plan typically improve their financial habits by 85%. 
            <a href="#" className="underline">Reference: Financial Psychology Research</a>
          </p>
        </div>
      </div>
    </div>
  );
}