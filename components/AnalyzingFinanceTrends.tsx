"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import ResultIntroSequence from "./ResultIntroSequence";

interface ProgressBarProps {
  label: string;
  color: string;
  isActive: boolean;
  isCompleted: boolean;
  index: number; // Add index for unique behavior
}


const ProgressBar = ({ label, color, isActive, isCompleted, index }: ProgressBarProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
    }
  }, [isActive]);

  useEffect(() => {
    if (isActive && isVisible) {
      // Create realistic variable speed animation
      const startTime = Date.now();
      
      // Much more dramatic speed variations based on index
      const speedMultipliers = [1.2, 0.8, 1.5, 0.6, 1.3, 0.9, 1.1]; // Different speeds per bar
      const baseDuration = 3000; // Base 3 seconds
      const speedMultiplier = speedMultipliers[index] || 1;
      const duration = baseDuration * speedMultiplier;
      
      // Add micro-pauses based on index for more realistic feel
      const pausePoints = [
        { time: 0.3, duration: 200 + Math.random() * 300 }, // Pause at 30%
        { time: 0.6, duration: 150 + Math.random() * 250 }, // Pause at 60%
        { time: 0.85, duration: 100 + Math.random() * 200 }  // Pause at 85%
      ];
      
      // Create realistic progress curve with variable speeds and pauses
      let pauseOffset = 0;
      const animatePercentage = () => {
        const elapsed = Date.now() - startTime;
        let adjustedElapsed = elapsed - pauseOffset;
        
        // Check for pause points
        const currentProgress = Math.min(adjustedElapsed / duration, 1);
        const pausePoint = pausePoints.find(p => 
          currentProgress >= p.time && 
          currentProgress < p.time + (p.duration / duration)
        );
        
        if (pausePoint) {
          // We're in a pause, don't update progress
          requestAnimationFrame(animatePercentage);
          return;
        }
        
        const progress = Math.min(adjustedElapsed / duration, 1);
        
        // Create much more dramatic progress curves based on index
        let currentPercentage;
        const curveType = index % 4; // 4 different curve types
        
        if (curveType === 0) {
          // Fast start, slow finish
          currentPercentage = progress < 0.3 ? progress * 80 : 24 + (progress - 0.3) * 95;
        } else if (curveType === 1) {
          // Slow start, fast middle, slow finish
          currentPercentage = progress < 0.2 ? progress * 20 : 
                            progress < 0.6 ? 4 + (progress - 0.2) * 90 : 
                            40 + (progress - 0.6) * 150;
        } else if (curveType === 2) {
          // Steady progress with occasional jumps
          currentPercentage = progress < 0.5 ? progress * 60 : 
                            progress < 0.7 ? 30 + (progress - 0.5) * 200 : 
                            70 + (progress - 0.7) * 100;
        } else {
          // Erratic progress
          currentPercentage = progress < 0.4 ? progress * 30 : 
                            progress < 0.8 ? 12 + (progress - 0.4) * 110 : 
                            56 + (progress - 0.8) * 110;
        }
        
        // Add some randomness to make it feel more organic
        const randomJitter = (Math.random() - 0.5) * 1.5; // ±0.75% jitter
        currentPercentage = Math.max(0, Math.min(100, currentPercentage + randomJitter));
        
        setPercentage(Math.floor(currentPercentage));
        
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
          transition={{ delay: 0.5 }}
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
            duration: 3, 
            ease: "easeInOut",
            delay: index * 0.1 // Stagger the visual animation too
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
  const [showIntroSequence, setShowIntroSequence] = useState(false); // Control intro sequence

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
    // Clean up localStorage on page load to prevent stale session issues
    const cleanupLocalStorage = async () => {
      const sessionId = localStorage.getItem('quizSessionId');
      if (sessionId && !sessionId.match(/^c[a-z0-9]{24}$/)) {
        console.log('Cleaning up invalid sessionId from localStorage');
        localStorage.removeItem('quizSessionId');
        localStorage.removeItem('userName');
        return;
      }
      
      // Check if sessionId exists in database
      if (sessionId) {
        try {
          const response = await fetch('/api/quiz/session-exists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
          
          if (!response.ok || !(await response.json()).exists) {
            console.log('Cleaning up stale sessionId from localStorage');
            localStorage.removeItem('quizSessionId');
            localStorage.removeItem('userName');
          }
        } catch (error) {
          console.log('Error checking session, cleaning up localStorage');
          localStorage.removeItem('quizSessionId');
          localStorage.removeItem('userName');
        }
      }
    };
    
    cleanupLocalStorage();
    
    // Start AI copy generation early (during progress bars) - non-blocking
    const startAICopyGeneration = async () => {
      const sessionId = localStorage.getItem('quizSessionId');
      if (sessionId && sessionId.match(/^c[a-z0-9]{24}$/)) {
        try {
          console.log('Starting AI copy generation during progress bars...');
          const copyResponse = await fetch("/api/quiz/archetype-copy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });
          
          if (copyResponse.ok) {
            const copyData = await copyResponse.json();
            console.log('AI copy generated successfully during progress bars:', copyData);
            // Store AI copy in localStorage for results page
            localStorage.setItem('personalizedCopy', JSON.stringify(copyData.copy));
          } else {
            console.log('AI copy generation failed during progress bars');
          }
        } catch (copyError) {
          console.log('AI copy generation error during progress bars:', copyError);
        }
      }
    };
    
    // Start AI copy generation after a short delay (let progress bars start first)
    const aiCopyTimer = setTimeout(startAICopyGeneration, 2000);
    
    // Sequential text changes - each text appears once in order
    const textTotalDuration = progressBars.length * 2500; // Total time for all bars
    const textInterval = textTotalDuration / loadingTexts.length; // Equal spacing
    
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

    // Start all bars with staggered delays for more realistic effect
    progressBars.forEach((bar, index) => {
      const delay = index * (800 + Math.random() * 1200); // 0.8-2s between each bar
      setTimeout(() => {
        setActiveBarIndex(index);
        // Mark previous bars as completed
        setCompletedBars(prev => [...prev, ...Array.from({length: index}, (_, i) => i)]);
      }, delay);
    });

    // Complete all bars after total duration
    const totalDuration = progressBars.length * 2000 + 3000; // Extra buffer
    setTimeout(() => {
      setCompletedBars(Array.from({length: progressBars.length}, (_, i) => i));
    }, totalDuration);

    // Show intro sequence after all bars complete + 2 seconds
    const introTimer = setTimeout(() => {
      setShowIntroSequence(true);
    }, totalDuration + 2000); // Use the calculated total duration

    // Try to get user's name from localStorage first, then API as fallback
    const fetchUserName = async () => {
      // First try to get name from localStorage (stored during quiz)
      const storedName = localStorage.getItem('userName');
      if (storedName) {
        setUserName(storedName);
        setUserNameInitial(storedName.charAt(0).toUpperCase());
        return;
      }

      // Fallback to API if not in localStorage
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
              // Store in localStorage for future use
              localStorage.setItem('userName', data.name);
            }
          }
        } catch (error) {
          console.error('Error fetching user name:', error);
        }
      }
    };

    fetchUserName();

        return () => {
          clearTimeout(textTimer);
          clearTimeout(textTimer2);
          clearTimeout(textTimer3);
          clearTimeout(textTimer4);
          clearTimeout(introTimer);
          clearTimeout(aiCopyTimer);
        };
  }, [router, progressBars.length]);

  // Handle intro sequence completion
  const handleIntroComplete = async () => {
    try {
      // Get the session ID from localStorage (set during quiz)
      const sessionId = localStorage.getItem('quizSessionId');
      console.log('Session ID from localStorage:', sessionId);
      console.log('All localStorage keys:', Object.keys(localStorage));
      
      // Validate sessionId format (should be a cuid)
      if (sessionId && !sessionId.match(/^c[a-z0-9]{24}$/)) {
        console.log('Invalid sessionId format, clearing localStorage');
        localStorage.removeItem('quizSessionId');
        localStorage.removeItem('userName');
        router.push('/quiz/financial-profile');
        return;
      }
      
      if (sessionId) {
        console.log('Generating result for session:', sessionId);
        // Generate the result
        const resultResponse = await fetch("/api/quiz/result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        console.log('Result generation response status:', resultResponse.status);

        if (resultResponse.ok) {
          const resultData = await resultResponse.json();
          console.log('Generated result data:', resultData);
          
          // AI copy should already be generated during progress bars
          const existingCopy = localStorage.getItem('personalizedCopy');
          if (existingCopy) {
            console.log('AI copy already generated during progress bars');
          } else {
            console.log('AI copy not found, results page will use fallback');
          }
          
          // Add a small delay to ensure database consistency
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          router.push(`/results/${resultData.resultId}`);
        } else {
          const errorData = await resultResponse.json();
          console.error('Result generation failed:', errorData);
          
          // If session not found, redirect to quiz to start fresh
          if (resultResponse.status === 404 && errorData.error === 'Session not found') {
            console.log('Session not found, redirecting to quiz');
            localStorage.removeItem('quizSessionId');
            localStorage.removeItem('userName');
            router.push('/quiz/financial-profile');
            return;
          }
          
          // Fallback to existing result for other errors
          router.push('/results/cmgo3qxdt00364dgc9k8i1olv');
        }
      } else {
        console.log('No session ID found, using fallback');
        // Fallback to existing result
        router.push('/results/cmgo3qxdt00364dgc9k8i1olv');
      }
    } catch (error) {
      console.error('Error generating result:', error);
      // Fallback navigation to existing result
      router.push('/results/cmgo3qxdt00364dgc9k8i1olv');
    }
  };

  // Show intro sequence if ready
  if (showIntroSequence) {
    return (
      <ResultIntroSequence 
        name={userName || 'there'} 
        onComplete={handleIntroComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Bar with BrightNest Logo and User Info */}
      <div className="w-full bg-[#28303B] px-6 py-6 relative">
        {/* BrightNest text - centered horizontally within the full width */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <span className="text-xl font-bold text-white font-serif">BrightNest</span>
        </div>
        {/* User Info - positioned closer to center */}
        <div className="absolute right-24 top-1/2 -translate-y-1/2 flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">{userNameInitial}</span>
          </div>
          <span className="text-white font-medium text-sm">{userName}</span>
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
              isActive={index === activeBarIndex}
              isCompleted={index < activeBarIndex}
              index={index}
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
