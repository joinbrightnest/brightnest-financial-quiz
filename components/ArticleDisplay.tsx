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

interface ArticleDisplayProps {
  sessionId: string;
  questionId: string;
  answerValue: string;
  answerLabel: string;
  onClose: () => void;
}

export default function ArticleDisplay({
  sessionId,
  questionId,
  answerValue,
  answerLabel,
  onClose
}: ArticleDisplayProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    loadRelevantArticles();
  }, [sessionId, questionId, answerValue]);

  const loadRelevantArticles = async () => {
    setIsLoading(true);
    try {
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
        setArticles(data.articles || []);
        
        // Auto-select the first article if available
        if (data.articles && data.articles.length > 0) {
          setSelectedArticle(data.articles[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArticleSelect = (article: Article) => {
    setSelectedArticle(article);
    // Record view
    recordArticleView(article.id);
  };

  const recordArticleView = async (articleId: string) => {
    try {
      await fetch('/api/quiz/articles/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          articleId
        })
      });
    } catch (error) {
      console.error('Failed to record article view:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-center">Loading personalized insights...</p>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Articles Available</h3>
            <p className="text-gray-600 mb-4">We don't have any personalized insights for this answer yet.</p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Continue Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Article List Sidebar */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Personalized Insights</h2>
            <p className="text-sm text-gray-600 mt-1">
              Based on your answer: "{answerLabel}"
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {articles.map((article) => (
              <div
                key={article.id}
                onClick={() => handleArticleSelect(article)}
                className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                  selectedArticle?.id === article.id
                    ? 'bg-blue-50 border-blue-200'
                    : 'hover:bg-gray-100'
                }`}
              >
                <h3 className="font-medium text-gray-900 text-sm mb-1">
                  {article.title}
                </h3>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {article.content.substring(0, 100)}...
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {article.category}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {article.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Article Content */}
        <div className="flex-1 flex flex-col">
          {selectedArticle ? (
            <>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedArticle.title}
                    </h1>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                        {selectedArticle.category}
                      </span>
                      <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                        {selectedArticle.type}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="prose max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedArticle.content}
                  </div>

                  {selectedArticle.keyPoints && selectedArticle.keyPoints.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Points</h3>
                      <ul className="space-y-2">
                        {selectedArticle.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedArticle.sources && selectedArticle.sources.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Sources</h3>
                      <ul className="space-y-1">
                        {selectedArticle.sources.map((source, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            • {source}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={onClose}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Continue Quiz
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Select an article to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
