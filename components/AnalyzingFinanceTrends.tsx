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
        <motion.span 
          className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}
          style={{
            color: color === 'bg-red-500' ? '#ef4444' : 
                   color === 'bg-green-500' ? '#22c55e' : 
                   color === 'bg-teal-500' ? '#14b8a6' : 
                   color === 'bg-pink-500' ? '#ec4899' : 
                   color === 'bg-yellow-500' ? '#eab308' : 
                   color === 'bg-blue-500' ? '#3b82f6' : 
                   color === 'bg-orange-500' ? '#f97316' : '#374151'
          }}
          animate={{ 
            fontWeight: isActive ? 'bold' : 'medium'
          }}
          transition={{ 
            duration: 0.3,
            ease: "easeInOut"
          }}
        >
          {label}
        </motion.span>
        <motion.span 
          className={`text-sm font-medium ${isCompleted ? 'text-gray-700' : 'text-gray-400'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ delay: delay + 0.5 }}
        >
          {percentage}%
        </motion.span>
      </div>
      <motion.div 
        className="w-full bg-gray-200 rounded-full overflow-hidden"
        animate={{ 
          height: isActive ? "12px" : "8px" // Make thicker when active
        }}
        transition={{ 
          duration: 0.3,
          ease: "easeInOut"
        }}
      >
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
      </motion.div>
    </div>
  );
};

const AnalyzingFinanceTrends = () => {
  const router = useRouter();
  const [activeBarIndex, setActiveBarIndex] = useState(0);
  const [completedBars, setCompletedBars] = useState<number[]>([]);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [userNameInitial, setUserNameInitial] = useState('U'); // Default to 'U'
  const [userName, setUserName] = useState(''); // Full user name

  const loadingTexts = [
    "Analyzing Financial Background",
    "Cross-checking with User Database",
    "Mapping Your Financial Behavior Trends",
    "Building Your Personalized Growth Plan",
    "Predicting Future Results"
  ];


  // Progress bars configuration - 7 bars like Noom
  const progressBars = [
    { label: "DEMOGRAPHIC PROFILE", color: "bg-red-500", dotColor: "text-red-500" },
    { label: "FINANCIAL GOALS", color: "bg-green-500", dotColor: "text-green-500" },
    { label: "SPENDING HISTORY", color: "bg-teal-500", dotColor: "text-teal-500" },
    { label: "SAVINGS & INVESTMENTS", color: "bg-pink-500", dotColor: "text-pink-500" },
    { label: "DEBT MANAGEMENT", color: "bg-yellow-500", dotColor: "text-yellow-500" },
    { label: "FINANCIAL CONFIDENCE", color: "bg-blue-500", dotColor: "text-blue-500" },
    { label: "DECISION-MAKING STYLE", color: "bg-orange-500", dotColor: "text-orange-500" },
  ];

  useEffect(() => {
    // Sequential text changes - each text appears once in order
    const totalDuration = progressBars.length * 2500; // Total time for all bars
    const textInterval = totalDuration / loadingTexts.length; // Equal spacing
    
    const textTimer = setTimeout(() => {
      setCurrentTextIndex(1);
    }, textInterval);
    
    const textTimer2 = setTimeout(() => {
      setCurrentTextIndex(2);
    }, textInterval * 2);
    
    const textTimer3 = setTimeout(() => {
      setCurrentTextIndex(3);
    }, textInterval * 3);
    
    const textTimer4 = setTimeout(() => {
      setCurrentTextIndex(4);
    }, textInterval * 4);

    // Sequential progress bar animation
    const progressInterval = setInterval(() => {
      setActiveBarIndex(prev => {
        if (prev < progressBars.length - 1) {
          // Mark current bar as completed
          setCompletedBars(completed => [...completed, prev]);
          return prev + 1;
        } else {
          // All bars completed
          setCompletedBars(completed => [...completed, prev]);
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

    // Try to get user's name from database using sessionId
    const fetchUserName = async () => {
      const sessionId = localStorage.getItem('quizSessionId');
      if (sessionId) {
        try {
          const response = await fetch('/api/quiz/user-name', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.name) {
              setUserName(data.name);
              setUserNameInitial(data.name.charAt(0).toUpperCase());
            }
          }
        } catch (error) {
          console.error('Error fetching user name:', error);
        }
      }
    };

    fetchUserName();

    return () => {
      clearInterval(progressInterval);
      clearTimeout(textTimer);
      clearTimeout(textTimer2);
      clearTimeout(textTimer3);
      clearTimeout(textTimer4);
      clearTimeout(navigationTimer);
    };
  }, [router, progressBars.length]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Bar with BrightNest Logo and User Info */}
      <div className="w-full bg-[#28303B] px-6 py-6 relative">
        {/* BrightNest text - centered horizontally within the full width */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <span className="text-xl font-bold text-white font-serif">BrightNest</span>
        </div>
        {/* User Info - positioned absolutely to the right */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center space-x-3">
          <span className="text-white font-medium text-sm">{userName}</span>
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">{userNameInitial}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-start justify-center px-4 pt-8">
        <div className="relative z-10 w-full max-w-none">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
              <h1 className="text-xl font-serif font-semibold text-gray-800 mb-2">
            {loadingTexts[currentTextIndex]}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 1, 1, 1, 0, 0, 0, 0]
              }}
              transition={{ 
                duration: 2.4, 
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 1]
              }}
            >
              .
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0, 1, 1, 1, 0, 0, 0]
              }}
              transition={{ 
                duration: 2.4, 
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 1]
              }}
            >
              .
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0, 0, 1, 1, 1, 0, 0]
              }}
              transition={{ 
                duration: 2.4, 
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 1]
              }}
            >
              .
            </motion.span>
          </h1>
        </motion.div>

        {/* Progress Bars */}
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 mb-6 mx-4">
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

        {/* Progress Dots with Checkmarks */}
        <motion.div
          className="flex justify-center space-x-3 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {progressBars.map((bar, index) => (
            <motion.div
              key={index}
              className="flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1,
                scale: 1
              }}
              transition={{
                duration: 0.5,
                delay: index * 0.1
              }}
            >
              {completedBars.includes(index) ? (
                // Show checkmark with bar color when bar is completed
                <motion.div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${bar.color}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    duration: 0.3,
                    delay: 0 // Show checkmark immediately for completed bars
                  }}
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </motion.div>
              ) : (
                // Show empty gray dot for current and future bars
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Text - Always visible under dots */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p className="text-sm text-gray-600">
            Sit tight! We're building your perfect plan based on millions of data points from successful BrightNest users.
          </p>
        </motion.div>

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
    </div>
  );
};

export default AnalyzingFinanceTrends;
