"use client";

import { useState } from "react";

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  // Customization fields
  subtitle?: string;
  personalizedText?: string;
  backgroundColor?: string;
  textColor?: string;
  iconColor?: string;
  accentColor?: string;
  iconType?: string;
  showIcon?: boolean;
  showStatistic?: boolean;
  statisticText?: string;
  statisticValue?: string;
  ctaText?: string;
  showCta?: boolean;
}

interface ArticleDisplayStandardizedProps {
  article: Article;
  userVariables?: {
    name?: string;
    email?: string;
    [key: string]: any;
  };
  onContinue?: () => void;
}

export default function ArticleDisplayStandardized({ 
  article, 
  userVariables = {}, 
  onContinue 
}: ArticleDisplayStandardizedProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const getIconComponent = () => {
    const baseClass = "w-16 h-16";
    const iconColor = article.iconColor || '#3b82f6';
    
    switch (article.iconType) {
      case 'document':
        return (
          <svg className={baseClass} fill="currentColor" viewBox="0 0 24 24" style={{ color: iconColor }}>
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        );
      case 'chart':
        return (
          <svg className={baseClass} fill="currentColor" viewBox="0 0 24 24" style={{ color: iconColor }}>
            <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21M16,8H18V15H16V8M12,10H14V15H12V10M8,5H10V15H8V5M4,12H6V15H4V12Z" />
          </svg>
        );
      case 'heart':
        return (
          <svg className={baseClass} fill="currentColor" viewBox="0 0 24 24" style={{ color: iconColor }}>
            <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
          </svg>
        );
      case 'star':
        return (
          <svg className={baseClass} fill="currentColor" viewBox="0 0 24 24" style={{ color: iconColor }}>
            <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
          </svg>
        );
      case 'lightbulb':
        return (
          <svg className={baseClass} fill="currentColor" viewBox="0 0 24 24" style={{ color: iconColor }}>
            <path d="M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21Z" />
          </svg>
        );
      case 'target':
        return (
          <svg className={baseClass} fill="currentColor" viewBox="0 0 24 24" style={{ color: iconColor }}>
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z" />
          </svg>
        );
      default:
        return (
          <svg className={baseClass} fill="currentColor" viewBox="0 0 24 24" style={{ color: iconColor }}>
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        );
    }
  };

  const replaceVariables = (text: string) => {
    return text
      .replace(/\{\{name\}\}/g, userVariables.name || 'there')
      .replace(/\{\{email\}\}/g, userVariables.email || '')
      .replace(/\{\{answer\}\}/g, userVariables.answer || 'your response');
  };

  const backgroundColor = article.backgroundColor || '#ffffff';
  const textColor = article.textColor || '#000000';
  const accentColor = article.accentColor || '#ef4444';
  const showIcon = article.showIcon !== false;
  const showStatistic = article.showStatistic !== false;
  const showCta = article.showCta !== false;

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ backgroundColor }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button 
          onClick={() => setIsVisible(false)}
          className="flex items-center space-x-2"
          style={{ color: textColor }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-lg font-bold" style={{ color: textColor }}>
          BRIGHTNEST
        </div>
        <div 
          className="px-3 py-1 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: accentColor }}
        >
          {article.category?.toUpperCase() || 'FINANCIAL'}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {/* Icon */}
        {showIcon && (
          <div className="mb-6">
            {getIconComponent()}
          </div>
        )}

        {/* Title */}
        <h1 
          className="text-2xl font-bold mb-3 leading-tight max-w-md"
          style={{ color: textColor }}
        >
          {article.title}
        </h1>

        {/* Subtitle */}
        {article.subtitle && (
          <p 
            className="text-sm mb-6 opacity-80"
            style={{ color: textColor }}
          >
            {article.subtitle}
          </p>
        )}

        {/* Content */}
        <div className="max-w-md mb-6">
          <p 
            className="text-sm leading-relaxed mb-4"
            style={{ color: textColor }}
          >
            {article.content}
          </p>
          
          {article.personalizedText && (
            <p 
              className="text-sm opacity-80"
              style={{ color: textColor }}
            >
              {replaceVariables(article.personalizedText)}
            </p>
          )}
        </div>

        {/* Statistic */}
        {showStatistic && article.statisticValue && (
          <div className="mb-6">
            <div 
              className="text-4xl font-bold mb-2"
              style={{ color: accentColor }}
            >
              {article.statisticValue}
            </div>
            {article.statisticText && (
              <div 
                className="text-sm"
                style={{ color: textColor }}
              >
                {article.statisticText}
              </div>
            )}
          </div>
        )}

        {/* CTA Button */}
        {showCta && (
          <button 
            onClick={onContinue}
            className="w-full max-w-sm py-4 rounded-lg font-bold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: accentColor }}
          >
            {article.ctaText || 'CONTINUE'}
          </button>
        )}
      </div>
    </div>
  );
}
