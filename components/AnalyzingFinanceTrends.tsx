"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface ProgressBarProps {
  label: string;
  color: string;
  delay: number;
  targetPercentage: number;
}

const ProgressBar = ({ label, color, delay, targetPercentage }: ProgressBarProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="w-full mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <motion.span 
          className="text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ delay: delay + 0.5 }}
        >
          {targetPercentage}%
        </motion.span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: "0%" }}
          animate={{ width: isVisible ? `${targetPercentage}%` : "0%" }}
          transition={{ 
            duration: 1.2, 
            delay: delay + 0.2,
            ease: "easeOut"
          }}
        />
      </div>
    </div>
  );
};

const AnalyzingFinanceTrends = () => {
  const router = useRouter();
  const [showTrustText, setShowTrustText] = useState(false);
  const [showProgressDots, setShowProgressDots] = useState(false);


  // Generate random percentages for each progress bar
  const progressBars = [
    { label: "Spending Patterns", color: "bg-rose-500", delay: 0, targetPercentage: Math.floor(Math.random() * 41) + 60 },
    { label: "Saving Habits", color: "bg-green-500", delay: 0.3, targetPercentage: Math.floor(Math.random() * 41) + 60 },
    { label: "Financial Confidence", color: "bg-sky-500", delay: 0.6, targetPercentage: Math.floor(Math.random() * 41) + 60 },
    { label: "Emotional Triggers", color: "bg-violet-500", delay: 0.9, targetPercentage: Math.floor(Math.random() * 41) + 60 },
    { label: "Goal Alignment", color: "bg-amber-500", delay: 1.2, targetPercentage: Math.floor(Math.random() * 41) + 60 },
    { label: "Decision-Making Consistency", color: "bg-blue-500", delay: 1.5, targetPercentage: Math.floor(Math.random() * 41) + 60 },
  ];

  useEffect(() => {
    // Show trust text after progress bars start
    const trustTextTimer = setTimeout(() => setShowTrustText(true), 2000);
    
    // Show progress dots after trust text
    const dotsTimer = setTimeout(() => setShowProgressDots(true), 3000);
    
    // Navigate to results after 5 seconds (simple loading page)
    const navigationTimer = setTimeout(async () => {
      try {
        // Get the session ID from localStorage (set during quiz)
        const sessionId = localStorage.getItem('quizSessionId');
        
        if (sessionId) {
          // Generate the result
          const resultResponse = await fetch("/api/quiz/result", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });

          if (resultResponse.ok) {
            const resultData = await resultResponse.json();
            router.push(`/results/${resultData.resultId}`);
          } else {
            // Fallback if result generation fails
            router.push('/results/sample');
          }
        } else {
          // Fallback if no session ID
          router.push('/results/sample');
        }
      } catch (error) {
        console.error('Error generating result:', error);
        // Fallback navigation
        router.push('/results/sample');
      }
    }, 5000);

    return () => {
      clearTimeout(trustTextTimer);
      clearTimeout(dotsTimer);
      clearTimeout(navigationTimer);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4">
      {/* Subtle background animation */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#4CAF50]/10 to-transparent rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[#66BB6A]/10 to-transparent rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="relative z-10 max-w-md w-full">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Analyzing Your Financial Behavior Trends...
          </h1>
          <motion.div
            className="w-16 h-1 bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] rounded-full mx-auto"
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </motion.div>

        {/* Progress Bars */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-6">
          {progressBars.map((bar, index) => (
            <ProgressBar
              key={index}
              label={bar.label}
              color={bar.color}
              delay={bar.delay}
              targetPercentage={bar.targetPercentage}
            />
          ))}
        </div>

        {/* Trust Text */}
        <AnimatePresence>
          {showTrustText && (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm text-gray-600 mb-4">
                Sit tight — we're crafting your personalized Money Mindset Plan using data from thousands of successful BrightNest users.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Dots */}
        <AnimatePresence>
          {showProgressDots && (
            <motion.div
              className="flex justify-center space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {[0, 1, 2, 3, 4].map((index) => (
                <motion.div
                  key={index}
                  className="w-2 h-2 bg-[#4CAF50] rounded-full"
                  initial={{ opacity: 0.3, scale: 0.8 }}
                  animate={{ 
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading indicator */}
        <motion.div
          className="flex justify-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.div
            className="w-6 h-6 border-2 border-[#4CAF50] border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyzingFinanceTrends;
