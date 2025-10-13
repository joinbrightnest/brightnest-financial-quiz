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
  const [visualWidth, setVisualWidth] = useState(0);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
    }
  }, [isActive]);

  useEffect(() => {
    if (isActive && isVisible) {
      // Create realistic variable speed animation within each bar
      const startTime = Date.now();
      
      // Add random duration variation to simulate different processing complexity
      const baseDuration = 3000; // Base 3 seconds
      const complexityVariation = (Math.random() - 0.5) * 1000; // ±500ms variation
      const duration = baseDuration + complexityVariation;
      
      // Create fluid progress curve with variable speeds (no pauses)
      const animatePercentage = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Create realistic variable speed progress with dramatic speed changes
        let currentPercentage;
        
        if (progress < 0.1) {
          // Very fast initial burst (0-10% of time = 0-25% progress)
          currentPercentage = progress * 250;
        } else if (progress < 0.25) {
          // Slow crawl (10-25% of time = 25-30% progress)
          currentPercentage = 25 + (progress - 0.1) * 33.33;
        } else if (progress < 0.4) {
          // Medium speed (25-40% of time = 30-50% progress)
          currentPercentage = 30 + (progress - 0.25) * 133.33;
        } else if (progress < 0.6) {
          // Very slow section (40-60% of time = 50-60% progress)
          currentPercentage = 50 + (progress - 0.4) * 50;
        } else if (progress < 0.75) {
          // Fast acceleration (60-75% of time = 60-80% progress)
          currentPercentage = 60 + (progress - 0.6) * 133.33;
        } else if (progress < 0.9) {
          // Slow down again (75-90% of time = 80-85% progress)
          currentPercentage = 80 + (progress - 0.75) * 33.33;
        } else {
          // Final burst to finish (90-100% of time = 85-100% progress)
          currentPercentage = 85 + (progress - 0.9) * 150;
        }
        
        // Add more randomness to make it feel more organic and realistic
        const randomJitter = (Math.random() - 0.5) * 3; // ±1.5% jitter
        currentPercentage = Math.max(0, Math.min(100, currentPercentage + randomJitter));
        
        setPercentage(Math.floor(currentPercentage));
        
        // Update visual width with variable speed animation
        setVisualWidth(currentPercentage);
        
        if (progress < 1) {
          requestAnimationFrame(animatePercentage);
        } else {
          setPercentage(100);
          setVisualWidth(100);
        }
      };
      
      requestAnimationFrame(animatePercentage);
    } else if (isCompleted) {
      setPercentage(100);
      setVisualWidth(100);
    } else {
      setPercentage(0);
      setVisualWidth(0);
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
        <div
          className={`h-full rounded-full ${color} transition-all duration-50 ease-out`}
          style={{ width: `${visualWidth}%` }}
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

    // Sequential progress bar animation - one at a time with variable timing
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
    }, 3000 + Math.random() * 1000); // Variable timing: 3-4 seconds per bar

    // Show intro sequence after all bars complete + 2 seconds
    const introTimer = setTimeout(() => {
      setShowIntroSequence(true);
    }, (progressBars.length * 3000) + 2000); // Total time: bars * 3s + 2s buffer

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
          clearInterval(progressInterval);
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
