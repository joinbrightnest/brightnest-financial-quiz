"use client";

import { useEffect, useState } from "react";

interface LoadingScreenProps {
  title: string;
  subtitle?: string;
  personalizedText?: string;
  duration: number;
  iconType: string;
  animationStyle: string;
  backgroundColor: string;
  textColor: string;
  iconColor: string;
  progressBarColor: string;
  showProgressBar: boolean;
  progressText?: string;
  showTopBar?: boolean;
  topBarColor?: string;
  // Image fields
  imageUrl?: string;
  imageAlt?: string;
  showImage?: boolean;
  onComplete: () => void;
  userName?: string;
  lastAnswer?: string;
}

export default function LoadingScreenDisplay({
  title,
  subtitle,
  personalizedText,
  duration,
  iconType,
  animationStyle,
  backgroundColor,
  textColor,
  iconColor,
  progressBarColor,
  showProgressBar,
  progressText,
  showTopBar = true,
  topBarColor = '#1f2937',
  // Image fields
  imageUrl,
  imageAlt,
  showImage = false,
  onComplete,
  userName = "User",
  lastAnswer = "your response",
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(1);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [dots, setDots] = useState("");
  
  const loadingTexts = [
    "Analyzing responses",
    "Processing your unique profile",
    "Preparing results"
  ];

  // Animate dots smoothly
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 300); // Faster animation for smoother feel

    return () => clearInterval(dotsInterval);
  }, []);

  // Update text based on progress
  useEffect(() => {
    if (progress <= 33) {
      setCurrentTextIndex(0);
    } else if (progress <= 66) {
      setCurrentTextIndex(1);
    } else {
      setCurrentTextIndex(2);
    }
  }, [progress]);

  useEffect(() => {
    const startTime = Date.now();
    let lastProgress = 0;
    let speed = 1;
    let nextSpeedChange = Math.random() * 500 + 300;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;

      // Randomly change speed
      if (elapsed > nextSpeedChange) {
        speed = 0.5 + Math.random() * 1.3;
        setCurrentSpeed(speed);
        nextSpeedChange = elapsed + (Math.random() * 600 + 400);
      }

      // Calculate progress
      const baseIncrement = (100 / duration) * 50;
      const increment = baseIncrement * speed;
      lastProgress += increment;

      const maxProgress = (elapsed / duration) * 100;
      lastProgress = Math.min(lastProgress, maxProgress);

      if (elapsed >= duration) {
        setProgress(100);
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 300);
      } else {
        setProgress(Math.min(lastProgress, 99));
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  const getIconComponent = () => {
    const baseClass = `w-20 h-20 ${
      animationStyle === "spin"
        ? "animate-spin"
        : animationStyle === "pulse"
        ? "animate-pulse"
        : animationStyle === "bounce"
        ? "animate-bounce"
        : ""
    }`;

    switch (iconType) {
      case "puzzle-4":
        return (
          <div className={`relative ${baseClass}`} style={{ color: iconColor }}>
            <div className="absolute inset-0 grid grid-cols-2 gap-1">
              <div
                className="border-2 border-current rounded-tl-lg bg-current opacity-80 animate-pulse"
                style={{ animationDelay: "0s" }}
              ></div>
              <div
                className="border-2 border-current rounded-tr-lg bg-current opacity-80 animate-pulse"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div
                className="border-2 border-current rounded-bl-lg bg-current opacity-80 animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="border-2 border-current rounded-br-lg bg-current opacity-80 animate-pulse"
                style={{ animationDelay: "1.5s" }}
              ></div>
            </div>
          </div>
        );
      case "emoji-brain":
        return (
          <div className={baseClass} style={{ fontSize: "4rem" }}>
            🧠
          </div>
        );
      case "emoji-heart":
        return (
          <div className={baseClass} style={{ fontSize: "4rem" }}>
            ❤️
          </div>
        );
      case "emoji-star":
        return (
          <div className={baseClass} style={{ fontSize: "4rem" }}>
            ⭐
          </div>
        );
      case "emoji-rocket":
        return (
          <div className={baseClass} style={{ fontSize: "4rem" }}>
            🚀
          </div>
        );
      default:
        return (
          <svg
            className={baseClass}
            fill="currentColor"
            viewBox="0 0 24 24"
            style={{ color: iconColor }}
          >
            <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
          </svg>
        );
    }
  };

  const replaceVariables = (text: string) => {
    return text
      .replace(/\{\{name\}\}/g, userName || 'User')
      .replace(/\{\{answer\}\}/g, lastAnswer || 'your response');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor }}
    >
      {showTopBar && (
        <div className="flex items-center justify-center p-4" style={{ backgroundColor: topBarColor }}>
          <h1 className="text-white text-xl font-bold tracking-wide">BrightNest</h1>
        </div>
      )}
      
      <div className="flex items-center justify-center flex-1">
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>

      <div className="max-w-2xl w-full px-8 text-center">
        {/* Main Title */}
        <h2 className="text-3xl font-bold mb-3" style={{ color: textColor }}>
          {title}
        </h2>

        {/* Subtitle and Personalized Text */}
        {subtitle && (
          <p className="text-lg mb-2" style={{ color: textColor }}>
            {subtitle}
          </p>
        )}

        {personalizedText && (
          <p className="text-sm opacity-80 mb-6" style={{ color: textColor }}>
            {replaceVariables(personalizedText)}
          </p>
        )}

        {showProgressBar && (
          <div className="mt-8">
            {/* Uploaded Image */}
            {showImage && imageUrl && (
              <div className="mb-6 flex justify-center">
                <img
                  src={imageUrl}
                  alt={imageAlt || ''}
                  className="max-w-full h-auto rounded-lg shadow-sm"
                  style={{ maxHeight: '200px' }}
                />
              </div>
            )}
            
            {/* Icon/Symbol */}
            <div className="mb-4 flex justify-center">{getIconComponent()}</div>
            
            {/* Loading Text */}
            <p
              className="text-sm font-medium mb-2 tracking-wide text-center transition-opacity duration-300"
              style={{ color: textColor }}
            >
              {loadingTexts[currentTextIndex]}{dots}
            </p>
            
            {/* Progress Bar */}
            <div className="flex justify-center">
              <div 
                className="relative overflow-hidden rounded-lg" 
                style={{ 
                  width: '300px', 
                  height: '32px',
                  backgroundColor: '#e4dece'
                }}
              >
                <div
                  className="h-full transition-all duration-300 ease-out rounded-lg"
                  style={{
                    backgroundColor: '#fb513d',
                    width: `${progress}%`,
                  }}
                />
                
                {/* Progress Percentage */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span 
                    className="text-base font-bold"
                    style={{ 
                      color: '#191717',
                      fontWeight: '600'
                    }}
                  >
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

