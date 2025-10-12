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
    <div className="w-screen h-screen flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="w-full h-full flex flex-col items-center justify-center relative"
          style={{ backgroundColor: current.bg }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          {/* Logo for first slide */}
          {index === 0 && (
            <motion.div
              className="flex items-center space-x-3 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-teal-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <h1 className="text-3xl font-bold" style={{ color: current.color }}>
                BrightNest
              </h1>
            </motion.div>
          )}

          {/* Main text */}
          <motion.div
            className="text-center px-8 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index === 0 ? 1 : 0.5, duration: 0.8 }}
          >
            <motion.h1 
              className="text-2xl md:text-3xl font-medium leading-relaxed"
              style={{ color: current.color }}
            >
              {text}
            </motion.h1>
            
            {/* Subtitle for first slide */}
            {current.subtitle && (
              <motion.p
                className="text-lg mt-4 opacity-80"
                style={{ color: current.color }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: 1.5, duration: 0.6 }}
              >
                {current.subtitle}
              </motion.p>
            )}
          </motion.div>

          {/* Progress indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            {slides.map((_, i) => (
              <motion.div
                key={i}
                className={`w-2 h-2 rounded-full ${
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
