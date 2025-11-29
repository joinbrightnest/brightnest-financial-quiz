"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CloserSignup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/closer/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to login page with success message
        router.push('/closers/login?message=Registration successful! Please wait for admin approval.');
      } else {
        setError(data.error || 'Registration failed');
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

      {/* Right Section - Signup Form */}
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

        {/* Signup Form Container */}
        <div className="flex-1 flex items-start justify-center pt-8 lg:pt-0 lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">Join as a Closer</h2>
            <p className="text-sm sm:text-base text-stone-600">Sign up to start closing deals and earning commissions</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-stone-900 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-9 sm:pl-10 pr-3 py-3 bg-white border border-stone-300 rounded-lg text-sm sm:text-base text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-900 mb-2">
                Email Address *
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
                  className="block w-full pl-9 sm:pl-10 pr-3 py-3 bg-white border border-stone-300 rounded-lg text-sm sm:text-base text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-stone-900 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full pl-9 sm:pl-10 pr-3 py-3 bg-white border border-stone-300 rounded-lg text-sm sm:text-base text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your phone number (optional)"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-900 mb-2">
                Password *
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
                  placeholder="Create a password (min 6 characters)"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-900 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-9 sm:pl-10 pr-12 py-3 bg-white border border-stone-300 rounded-lg text-sm sm:text-base text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-stone-700 transition-colors p-2"
                >
                  {showConfirmPassword ? (
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
                  Creating Account...
                </div>
              ) : (
                "Create Closer Account"
              )}
            </button>

            <div className="text-center">
              <p className="text-sm sm:text-base text-stone-600">
                Already have an account?{" "}
                <Link href="/closers/login" className="text-purple-600 hover:text-purple-500 font-medium">
                  Sign In Here
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
