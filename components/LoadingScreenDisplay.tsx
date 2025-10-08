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
  onComplete,
  userName = "User",
  lastAnswer = "your response",
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(1);

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
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor }}
    >
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
        <div className="mb-6 flex justify-center">{getIconComponent()}</div>

        <h2 className="text-3xl font-bold mb-3" style={{ color: textColor }}>
          {title}
        </h2>

        {subtitle && (
          <p className="text-lg mb-4" style={{ color: textColor }}>
            {subtitle}
          </p>
        )}

        {personalizedText && (
          <p className="text-sm opacity-80 mb-6" style={{ color: textColor }}>
            {replaceVariables(personalizedText)}
          </p>
        )}

        {showProgressBar && (
          <div className="w-full max-w-md mx-auto mt-8">
            {progressText && (
              <p
                className="text-sm font-bold mb-4 tracking-wide"
                style={{ color: textColor }}
              >
                {progressText}
              </p>
            )}
            <div className="w-full bg-gray-200/50 rounded-full h-2 relative overflow-hidden shadow-inner">
              <div
                className="h-2 rounded-full relative"
                style={{
                  backgroundColor: progressBarColor,
                  width: `${progress}%`,
                  boxShadow: `0 0 10px ${progressBarColor}40`,
                  transition: "none",
                }}
              >
                {/* Shine effect */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                    animation: "shimmer 1s infinite",
                  }}
                ></div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span
                className="text-xs font-medium opacity-60"
                style={{ color: textColor }}
              >
                0%
              </span>
              <span className="text-sm font-bold" style={{ color: textColor }}>
                {Math.round(progress)}%
              </span>
              <span
                className="text-xs font-medium opacity-60"
                style={{ color: textColor }}
              >
                100%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

