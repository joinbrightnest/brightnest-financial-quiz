"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const slides = [
  { 
    bg: "#0E2A33", 
    color: "#FFFFFF", 
    text: "Welcome to BrightNest",
    subtitle: "Analyzing your answers..."
  },
  { 
    bg: "#FAF9F6", 
    color: "#1E1E1E", 
    text: "Based on your answers, {{name}}...",
    subtitle: null
  },
  { 
    bg: "#FAF9F6", 
    color: "#1E1E1E", 
    text: "We've created your personalized financial plan...",
    subtitle: null
  },
  { 
    bg: "#FAF9F6", 
    color: "#1E1E1E", 
    text: "with a focus on clarity, growth, and confidence.",
    subtitle: null
  }
];

interface ResultIntroSequenceProps {
  name?: string;
  onComplete?: () => void;
}

export default function ResultIntroSequence({ name = "there", onComplete }: ResultIntroSequenceProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => {
        if (prev < slides.length - 1) {
          return prev + 1;
        } else {
          // Sequence complete
          clearInterval(timer);
          return prev;
        }
      });
    }, 3000);

    // Redirect after sequence completes
    const redirect = setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        // Fallback to router push if no onComplete callback
        router.push("/results");
      }
    }, slides.length * 3000 + 500);

    return () => { 
      clearInterval(timer); 
      clearTimeout(redirect); 
    };
  }, [router, onComplete]);

  const current = slides[index];
  const text = current.text.replace("{{name}}", name);

  return (
    <div className="w-screen h-screen flex overflow-hidden fixed inset-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="w-full h-full flex flex-col items-center justify-center relative px-4 pb-16 sm:pb-8"
          style={{ backgroundColor: current.bg }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          {/* Content wrapper - centered vertically */}
          <motion.div
            className="flex flex-col items-center justify-center text-center max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index === 0 ? 1 : 0.5, duration: 0.8 }}
          >
            {/* Logo for first slide - part of centered content */}
            {index === 0 && (
              <motion.div
                className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-400 to-teal-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg sm:text-xl">B</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: current.color }}>
                  BrightNest
                </h1>
              </motion.div>
            )}

            {/* Main text - centered and structured */}
            <motion.h1 
              className="text-2xl sm:text-2xl md:text-3xl font-medium leading-relaxed"
              style={{ color: current.color }}
            >
              {text}
            </motion.h1>
            
            {/* Subtitle for first slide */}
            {current.subtitle && (
              <motion.p
                className="text-base sm:text-lg mt-4 opacity-80"
                style={{ color: current.color }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: 1.5, duration: 0.6 }}
              >
                {current.subtitle}
              </motion.p>
            )}
          </motion.div>

          {/* Progress indicator - always at bottom, visible */}
          <motion.div
            className="absolute bottom-12 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            {slides.map((_, i) => (
              <motion.div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i <= index ? 'opacity-100' : 'opacity-30'
                }`}
                style={{ 
                  backgroundColor: current.color,
                  opacity: i <= index ? 1 : 0.3
                }}
                animate={{ 
                  scale: i === index ? 1.2 : 1,
                  opacity: i <= index ? 1 : 0.3
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
