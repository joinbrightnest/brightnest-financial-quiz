"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

function CloserLoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(message);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/closer/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the closer token and redirect to dashboard
        localStorage.setItem('closerToken', data.token);
        localStorage.setItem('closerData', JSON.stringify(data.closer));
        router.push('/closers/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col lg:flex-row">
      {/* Left Section - Closer marketing panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-indigo-50 to-stone-100" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-stone-800">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold">BRIGHTNEST</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <div>
              <p className="text-sm text-stone-500 uppercase tracking-wider mb-2">Join the team</p>
              <h1 className="text-4xl font-bold leading-tight text-stone-900">
                Become a Closer
              </h1>
            </div>

            {/* Key Benefits */}
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                  ✓
                </span>
                <div>
                  <p className="font-semibold text-stone-900">High-Converting Leads</p>
                  <p className="text-sm text-stone-600">Pre-qualified prospects ready to buy</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                  ✓
                </span>
                <div>
                  <p className="font-semibold text-stone-900">Competitive Commissions</p>
                  <p className="text-sm text-stone-600">Earn top-tier rates on every sale</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                  ✓
                </span>
                <div>
                  <p className="font-semibold text-stone-900">Sales Support</p>
                  <p className="text-sm text-stone-600">Training, scripts, and ongoing coaching</p>
                </div>
              </li>
            </ul>

          </div>

          {/* Bottom CTA */}
          <div>
            <p className="text-lg font-bold text-stone-900 mb-2">Ready to close deals?</p>
            <p className="text-stone-700">Join our team of top-performing closers.</p>
          </div>
        </div>
      </div>

      {/* Stylish divider */}
      <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-purple-200 to-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.4)]" />

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 bg-stone-50 flex flex-col lg:flex-row lg:items-center lg:justify-center p-4 sm:p-6 lg:p-8 min-h-screen lg:min-h-0">
        {/* Mobile Header - Only on mobile */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 mb-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold text-stone-900">BRIGHTNEST</span>
            </div>
          </div>
        </div>

        {/* Login Form Container */}
        <div className="flex-1 flex items-start justify-center pt-8 lg:pt-0 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">Welcome Back</h2>
              <p className="text-sm sm:text-base text-stone-600">Sign in to your closer dashboard to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {successMessage && (
                <div className="p-3 bg-green-900/20 border border-green-500/50 rounded-lg">
                  <p className="text-sm text-green-400">{successMessage}</p>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-stone-900 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-9 sm:pl-10 pr-3 py-3 sm:py-3 bg-white border border-stone-300 rounded-lg text-sm sm:text-base text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-stone-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-9 sm:pl-10 pr-12 py-3 bg-white border border-stone-300 rounded-lg text-sm sm:text-base text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-stone-700 transition-colors p-2"
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>

              <div className="text-center">
                <p className="text-sm sm:text-base text-stone-600">
                  Don&apos;t have an account?{" "}
                  <Link href="/closers/signup" className="text-purple-600 hover:text-purple-500 font-medium">
                    Join Today
                  </Link>
                </p>
              </div>
            </form>

            <div className="mt-4 sm:mt-6 text-center">
              <div className="flex items-center justify-center space-x-2 text-gray-500">
                <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-xs sm:text-sm">Built for those who believe in impact</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function CloserLogin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <CloserLoginForm />
    </Suspense>
  );
}
