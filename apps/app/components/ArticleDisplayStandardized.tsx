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
  // Layout and positioning fields
  textAlignment?: string;
  contentPosition?: string;
  backgroundStyle?: string;
  backgroundGradient?: string;
  contentPadding?: string;
  showTopBar?: boolean;
  topBarColor?: string;
  // Text formatting fields
  titleFontSize?: string;
  titleFontWeight?: string;
  contentFontSize?: string;
  contentFontWeight?: string;
  lineHeight?: string;
  // Image fields
  imageUrl?: string;
  imageAlt?: string;
  showImage?: boolean;
}

interface ArticleDisplayStandardizedProps {
  article: Article;
  userVariables?: {
    name?: string;
    email?: string;
    [key: string]: string | undefined;
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

  // Helper functions for text formatting
  const getTitleSizeClass = (size: string) => {
    switch (size) {
      case 'small': return 'text-lg';
      case 'normal': return 'text-xl';
      case 'large': return 'text-2xl';
      case 'xlarge': return 'text-3xl';
      default: return 'text-2xl';
    }
  };

  const getTitleWeightClass = (weight: string) => {
    switch (weight) {
      case 'normal': return 'font-normal';
      case 'medium': return 'font-medium';
      case 'semibold': return 'font-semibold';
      case 'bold': return 'font-bold';
      case 'extrabold': return 'font-extrabold';
      default: return 'font-bold';
    }
  };

  const getContentSizeClass = (size: string) => {
    switch (size) {
      case 'small': return 'text-xs';
      case 'normal': return 'text-sm';
      case 'large': return 'text-base';
      default: return 'text-sm';
    }
  };

  const getContentWeightClass = (weight: string) => {
    switch (weight) {
      case 'light': return 'font-light';
      case 'normal': return 'font-normal';
      case 'medium': return 'font-medium';
      case 'semibold': return 'font-semibold';
      default: return 'font-normal';
    }
  };

  const getLineHeightClass = (height: string) => {
    switch (height) {
      case 'tight': return 'leading-tight';
      case 'normal': return 'leading-normal';
      case 'relaxed': return 'leading-relaxed';
      case 'loose': return 'leading-loose';
      default: return 'leading-normal';
    }
  };

  // Layout and positioning options
  const backgroundColor = article.backgroundColor || '#ffffff';
  const textColor = article.textColor || '#000000';
  const accentColor = article.accentColor || '#ef4444';
  const showIcon = article.showIcon !== false;
  const showStatistic = article.showStatistic !== false;
  const showCta = article.showCta !== false;
  const showTopBar = article.showTopBar !== false;
  const topBarColor = article.topBarColor || '#1f2937';

  // Layout options with better defaults
  const textAlignment = article.textAlignment || 'left';
  const contentPosition = article.contentPosition || 'center';
  const backgroundStyle = article.backgroundStyle || 'solid';
  const backgroundGradient = article.backgroundGradient;
  const contentPadding = article.contentPadding || 'normal';

  // Get background style
  const getBackgroundStyle = () => {
    if (backgroundStyle === 'gradient' && backgroundGradient) {
      return { background: backgroundGradient };
    }
    return { backgroundColor };
  };

  // Get content positioning classes
  const getContentPositionClasses = () => {
    const baseClasses = "flex-1 flex flex-col p-6";
    // Always center the content block, but text alignment is handled by individual elements
    const alignmentClasses = {
      left: 'items-center',
      center: 'items-center',
      right: 'items-center'
    };
    const positionClasses = {
      top: 'justify-start',
      center: 'justify-center',
      bottom: 'justify-end'
    };
    const paddingClasses = {
      compact: 'p-4',
      normal: 'p-6',
      spacious: 'p-8'
    };

    return `${baseClasses} ${alignmentClasses[textAlignment as keyof typeof alignmentClasses] || alignmentClasses.center} ${positionClasses[contentPosition as keyof typeof positionClasses] || positionClasses.center} ${paddingClasses[contentPadding as keyof typeof paddingClasses] || paddingClasses.normal}`;
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={getBackgroundStyle()}
    >
      {/* Header */}
      {showTopBar && (
        <div className="flex items-center justify-center p-4" style={{ backgroundColor: topBarColor }}>
          <div className="flex items-center space-x-3">
            <button
              onClick={onContinue}
              className="flex items-center space-x-2"
              style={{ color: '#ffffff' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-lg font-bold" style={{ color: '#ffffff' }}>
              BRIGHTNEST
            </div>
            <div
              className="px-3 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: accentColor }}
            >
              {article.category?.toUpperCase() || 'FINANCIAL'}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={getContentPositionClasses()}>
        {/* Content Block - All elements aligned together */}
        <div className="w-full max-w-md">
          {/* Uploaded Image */}
          {article.showImage && article.imageUrl && (
            <div className={`mb-6 ${textAlignment === 'left' ? 'flex justify-start' :
                textAlignment === 'right' ? 'flex justify-end' :
                  'flex justify-center'
              }`}>
              <img
                src={article.imageUrl}
                alt={article.imageAlt || ''}
                className="max-w-full h-auto rounded-lg shadow-sm"
                style={{ maxHeight: '200px' }}
              />
            </div>
          )}

          {/* Icon */}
          {showIcon && (
            <div className={`mb-6 ${textAlignment === 'left' ? 'flex justify-start' :
                textAlignment === 'right' ? 'flex justify-end' :
                  'flex justify-center'
              }`}>
              {getIconComponent()}
            </div>
          )}

          {/* Title */}
          <h1
            className={`${getTitleSizeClass(article.titleFontSize || 'large')} ${getTitleWeightClass(article.titleFontWeight || 'bold')} mb-3 ${getLineHeightClass(article.lineHeight || 'normal')} w-full ${textAlignment === 'left' ? 'text-left' :
                textAlignment === 'right' ? 'text-right' :
                  'text-center'
              }`}
            style={{ color: textColor }}
          >
            {article.title}
          </h1>

          {/* Subtitle */}
          {article.subtitle && (
            <p
              className={`${getContentSizeClass(article.contentFontSize || 'normal')} ${getContentWeightClass(article.contentFontWeight || 'normal')} mb-6 opacity-80 w-full ${getLineHeightClass(article.lineHeight || 'normal')} ${textAlignment === 'left' ? 'text-left' :
                  textAlignment === 'right' ? 'text-right' :
                    'text-center'
                }`}
              style={{ color: textColor }}
            >
              {article.subtitle}
            </p>
          )}

          {/* Content */}
          <div className="w-full mb-6">
            <p
              className={`${getContentSizeClass(article.contentFontSize || 'normal')} ${getContentWeightClass(article.contentFontWeight || 'normal')} ${getLineHeightClass(article.lineHeight || 'normal')} mb-4 w-full ${textAlignment === 'left' ? 'text-left' :
                  textAlignment === 'right' ? 'text-right' :
                    'text-center'
                }`}
              style={{ color: textColor }}
            >
              {article.content}
            </p>

            {article.personalizedText && (
              <p
                className={`${getContentSizeClass(article.contentFontSize || 'normal')} ${getContentWeightClass(article.contentFontWeight || 'normal')} opacity-80 w-full ${getLineHeightClass(article.lineHeight || 'normal')} ${textAlignment === 'left' ? 'text-left' :
                    textAlignment === 'right' ? 'text-right' :
                      'text-center'
                  }`}
                style={{ color: textColor }}
              >
                {replaceVariables(article.personalizedText)}
              </p>
            )}
          </div>

          {/* Statistic */}
          {showStatistic && article.statisticValue && (
            <div className={`w-full mb-6 ${textAlignment === 'left' ? 'text-left' :
                textAlignment === 'right' ? 'text-right' :
                  'text-center'
              }`}>
              <div
                className="text-4xl font-bold mb-2 w-full"
                style={{ color: accentColor }}
              >
                {article.statisticValue}
              </div>
              {article.statisticText && (
                <div
                  className="text-sm w-full"
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
              className="w-full py-4 rounded-lg font-bold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: accentColor }}
            >
              {article.ctaText || 'CONTINUE'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
