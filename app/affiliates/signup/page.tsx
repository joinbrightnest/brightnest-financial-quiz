"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AffiliateSignup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    tier: "quiz" as "quiz" | "creator" | "agency",
    payoutMethod: "stripe" as "stripe" | "paypal" | "wise",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/affiliate/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          tier: formData.tier,
          payoutMethod: formData.payoutMethod,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/affiliates/login");
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Registration failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-black flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-xl p-8 text-center text-white">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
            <p className="text-gray-300 mb-4">
              Your affiliate account has been created and is pending approval.
            </p>
            <p className="text-sm text-gray-400">
              You'll receive an email once your account is approved. Redirecting to login...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Left Section - Brand/Marketing to mirror login page */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-amber-50 to-stone-100">
          <div className="absolute inset-0 opacity-30">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full animate-pulse"
                style={{
                  width: `${Math.random() * 3 + 1}px`,
                  height: `${Math.random() * 3 + 1}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${Math.random() * 2 + 2}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-stone-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold">BRIGHTNEST</span>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <p className="text-sm text-stone-500 uppercase tracking-wider mb-2">Join the community</p>
              <h1 className="text-4xl font-bold leading-tight text-stone-900">Become an Affiliate</h1>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
                <div className="text-2xl font-bold text-stone-900">10%</div>
                <div className="text-sm text-stone-500">Base Commission</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
                <div className="text-2xl font-bold text-stone-900">Tiered</div>
                <div className="text-sm text-stone-500">Up to 20%</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
                <div className="text-2xl font-bold text-stone-900">Fast</div>
                <div className="text-sm text-stone-500">Payouts</div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-lg font-bold text-stone-900 mb-2">Grow with BrightNest</p>
            <p className="text-stone-700">Earn commissions promoting a product that truly helps.</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-orange-200 to-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.4)]" />

      {/* Right Section - Signup Form */}
      <div className="w-full lg:w-1/2 bg-stone-50 flex items-center justify-center p-8">
        <motion.form
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-6"
          onSubmit={handleSubmit}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-stone-900 mb-2">Create Your Account</h2>
            <p className="text-stone-600">Join our affiliate program and start earning</p>
          </div>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-900 mb-2">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="block w-full px-3 py-3 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-900 mb-2">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="block w-full px-3 py-3 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-900 mb-2">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="block w-full px-3 py-3 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Create a password (min 8 characters)"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-900 mb-2">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="block w-full px-3 py-3 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Confirm your password"
            />
          </div>

          <div>
            <label htmlFor="tier" className="block text-sm font-medium text-stone-900 mb-2">Affiliate Tier</label>
            <select
              id="tier"
              name="tier"
              value={formData.tier}
              onChange={handleChange}
              className="block w-full px-3 py-3 bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="quiz">Quiz Affiliate (10% commission)</option>
              <option value="creator">Creator Partner (15% commission)</option>
              <option value="agency">Agency Partner (20% commission)</option>
            </select>
            <p className="mt-1 text-xs text-gray-400">Higher tiers require approval and have higher commission rates</p>
          </div>

          <div>
            <label htmlFor="payoutMethod" className="block text-sm font-medium text-stone-900 mb-2">Preferred Payout Method</label>
            <select
              id="payoutMethod"
              name="payoutMethod"
              value={formData.payoutMethod}
              onChange={handleChange}
              className="block w-full px-3 py-3 bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="stripe">Stripe (Recommended)</option>
              <option value="paypal">PayPal</option>
              <option value="wise">Wise</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-orange-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Account...
              </div>
            ) : (
              "Create Affiliate Account"
            )}
          </button>

          <div className="text-center">
            <p className="text-stone-600">
              Already have an account?{" "}
              <Link href="/affiliates/login" className="text-orange-600 hover:text-orange-500 font-medium">
                Sign in here
              </Link>
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-stone-500">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-orange-600 hover:text-orange-500">Terms of Service</Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-orange-600 hover:text-orange-500">Privacy Policy</Link>
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
