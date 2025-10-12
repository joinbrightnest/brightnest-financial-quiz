"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface ProgressBarProps {
  label: string;
  color: string;
  delay: number;
  targetPercentage: number;
  isActive: boolean;
  isCompleted: boolean;
}

const ProgressBar = ({ label, color, delay, isActive, isCompleted }: ProgressBarProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [isActive, delay]);

  useEffect(() => {
    if (isActive && isVisible) {
      // Animate percentage from 0 to 100 over 2 seconds
      const startTime = Date.now();
      const duration = 2000; // 2 seconds
      
      const animatePercentage = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentPercentage = Math.floor(progress * 100);
        
        setPercentage(currentPercentage);
        
        if (progress < 1) {
          requestAnimationFrame(animatePercentage);
        } else {
          setPercentage(100);
        }
      };
      
      requestAnimationFrame(animatePercentage);
    } else if (isCompleted) {
      setPercentage(100);
    } else {
      setPercentage(0);
    }
  }, [isActive, isVisible, isCompleted]);

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <motion.span 
          className={`text-sm font-medium ${isCompleted ? 'text-gray-700' : 'text-gray-400'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ delay: delay + 0.5 }}
        >
          {percentage}%
        </motion.span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: "0%" }}
          animate={{ width: isVisible && isActive ? "100%" : isCompleted ? "100%" : "0%" }}
          transition={{ 
            duration: 2, 
            delay: delay,
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
  const [activeBarIndex, setActiveBarIndex] = useState(0);


  // Progress bars configuration
  const progressBars = [
    { label: "Spending Patterns", color: "bg-rose-500" },
    { label: "Saving Habits", color: "bg-green-500" },
    { label: "Financial Confidence", color: "bg-sky-500" },
    { label: "Emotional Triggers", color: "bg-violet-500" },
    { label: "Goal Alignment", color: "bg-amber-500" },
    { label: "Decision-Making Consistency", color: "bg-blue-500" },
  ];

  useEffect(() => {
    // Sequential progress bar animation
    const progressInterval = setInterval(() => {
      setActiveBarIndex(prev => {
        if (prev < progressBars.length - 1) {
          return prev + 1;
        } else {
          // All bars completed, show trust text and dots
          setShowTrustText(true);
          setShowProgressDots(true);
          clearInterval(progressInterval);
          return prev;
        }
      });
    }, 2500); // Each bar takes 2.5 seconds

    // Navigate to results after all bars complete + 2 seconds
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
    }, (progressBars.length * 2500) + 2000); // Total time: bars * 2.5s + 2s buffer

    return () => {
      clearInterval(progressInterval);
      clearTimeout(navigationTimer);
    };
  }, [router, progressBars.length]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="relative z-10 max-w-2xl w-full">
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
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 mb-6">
          {progressBars.map((bar, index) => (
            <ProgressBar
              key={index}
              label={bar.label}
              color={bar.color}
              delay={0}
              targetPercentage={100}
              isActive={index === activeBarIndex}
              isCompleted={index < activeBarIndex}
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
