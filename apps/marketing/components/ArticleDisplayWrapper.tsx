"use client";

import { useState, useEffect } from "react";
import ArticleDisplayStandardized from "./ArticleDisplayStandardized";

interface ArticleDisplayWrapperProps {
  sessionId: string;
  questionId: string;
  answerValue: string;
  answerLabel: string;
  onContinue?: () => void;
  articleData?: any; // Pre-loaded article data to avoid loading screen
}

export default function ArticleDisplayWrapper({
  sessionId,
  questionId,
  answerValue,
  answerLabel,
  onContinue,
  articleData
}: ArticleDisplayWrapperProps) {
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(!articleData); // Only show loading if no pre-loaded data
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we have pre-loaded article data, use it immediately
    if (articleData) {
      setArticle(articleData);
      setLoading(false);
      return;
    }

    // Otherwise, fetch the article
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/quiz/articles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            questionId,
            answerValue,
            answerLabel
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch article');
        }

        const data = await response.json();
                // Articles from API
        
        if (data.articles && data.articles.length > 0) {
          setArticle(data.articles[0]);
        } else {
          setError('No article found');
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [sessionId, questionId, answerValue, answerLabel, articleData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Article Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find an article for your response.</p>
          <button
            onClick={onContinue}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <ArticleDisplayStandardized
      article={article}
      userVariables={{
        answer: answerLabel
      }}
      onContinue={onContinue}
    />
  );
}
