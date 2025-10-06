"use client";

import { useState, useEffect } from "react";

interface Article {
  id: string;
  title: string;
  content: string;
  type: string;
  category: string;
  keyPoints?: string[];
  sources?: string[];
}

interface ArticleDisplayInlineProps {
  sessionId: string;
  questionId: string;
  answerValue: string;
  answerLabel: string;
  onContinue: () => void;
}

export default function ArticleDisplayInline({
  sessionId,
  questionId,
  answerValue,
  answerLabel,
  onContinue
}: ArticleDisplayInlineProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    loadRelevantArticles();
  }, [sessionId, questionId, answerValue]);

  const loadRelevantArticles = async () => {
    setIsLoading(true);
    try {
      console.log('Loading articles for:', { questionId, answerValue, answerLabel });
      
      // Load articles from database via API
      const response = await fetch('/api/quiz/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId,
          answerValue,
          answerLabel
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Articles from API:', data.articles);
        setArticles(data.articles || []);
        
        // Auto-select the first article if available
        if (data.articles && data.articles.length > 0) {
          setSelectedArticle(data.articles[0]);
        }
      } else {
        console.error('Failed to load articles from API');
        setArticles([]);
      }
    } catch (error) {
      console.error('Failed to load articles:', error);
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a quick stat from the article content
  const getQuickStat = (article: Article) => {
    // Check if article has stat and description (new simple format)
    if ((article as any).stat && (article as any).description) {
      return {
        stat: (article as any).stat,
        description: (article as any).description
      };
    }
    
    // Fallback to old format
    if (article.keyPoints && article.keyPoints.length > 0) {
      const firstPoint = article.keyPoints[0];
      const percentageMatch = firstPoint.match(/(\d+)%/);
      if (percentageMatch) {
        return {
          stat: percentageMatch[0],
          description: firstPoint.replace(percentageMatch[0], '').trim()
        };
      }
    }
    
    // Fallback stats based on category
    const fallbackStats = {
      marriage: { stat: "70%", description: "of divorces are caused by financial stress" },
      health: { stat: "65%", description: "of people report financial stress affects their health" },
      career: { stat: "80%", description: "of people say money impacts career decisions" },
      savings: { stat: "40%", description: "of Americans can't cover a $400 emergency" },
      debt: { stat: "77%", description: "of Americans have some form of debt" },
      investing: { stat: "55%", description: "of Americans don't invest in the stock market" }
    };
    
    return fallbackStats[article.category as keyof typeof fallbackStats] || 
           { stat: "75%", description: "of people face similar financial challenges" };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Top Header Bar */}
        <div className="bg-gray-800 w-full py-4">
          <div className="max-w-lg mx-auto px-6">
            <h1 className="text-white text-xl font-bold text-center tracking-wide">
              BrightNest
            </h1>
          </div>
        </div>
        
        <div className="max-w-lg mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading personalized insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        {/* Top Header Bar */}
        <div className="bg-gray-800 w-full py-4">
          <div className="max-w-lg mx-auto px-6">
            <h1 className="text-white text-xl font-bold text-center tracking-wide">
              BrightNest
            </h1>
          </div>
        </div>
        
        <div className="max-w-lg mx-auto px-6 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-wide">
              PERSONALIZED INSIGHT
            </h2>

            <p className="text-gray-600 mb-4">
              Financial Guidance
            </p>

            <p className="text-gray-700 mb-6 leading-relaxed">
              Thanks for sharing your answer! We're preparing personalized insights for you.
            </p>

            <button
              onClick={onContinue}
              className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors"
            >
              CONTINUE
            </button>
          </div>
        </div>
      </div>
    );
  }

  const quickStat = selectedArticle ? getQuickStat(selectedArticle) : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Top Header Bar */}
      <div className="bg-gray-800 w-full py-4">
        <div className="max-w-lg mx-auto px-6">
          <h1 className="text-white text-xl font-bold text-center tracking-wide">
            BrightNest
          </h1>
        </div>
      </div>
      
      <div className="max-w-lg mx-auto px-6 py-12">
        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-wide">
            {selectedArticle?.title || "PERSONALIZED INSIGHT"}
          </h2>

          {/* Subtitle */}
          <p className="text-gray-600 mb-4">
            {selectedArticle?.category || "Financial Guidance"}
          </p>

          {/* Main Message */}
          <p className="text-gray-700 mb-6 leading-relaxed">
            {selectedArticle?.content || "Thanks for sharing your answer! We've prepared a personalized insight based on your response."}
          </p>

          {/* Quick Stat */}
          {quickStat && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {quickStat.stat}
              </div>
              <p className="text-sm text-gray-600">
                {quickStat.description}
              </p>
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={onContinue}
            className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors"
          >
            CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
}
