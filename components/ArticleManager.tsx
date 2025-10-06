"use client";

import { useState, useEffect } from "react";

interface Article {
  id: string;
  title: string;
  content: string;
  type: "static" | "ai_generated" | "template";
  category: string;
  tags: string[];
  isActive: boolean;
  triggers: ArticleTrigger[];
}

interface ArticleTrigger {
  id: string;
  questionId?: string;
  optionValue?: string;
  condition?: any;
  priority: number;
  isActive: boolean;
}

interface ArticleManagerProps {
  questionId: string;
  questionPrompt: string;
  questionOptions: Array<{
    label: string;
    value: string;
    weightCategory: string;
    weightValue: number;
  }>;
  onArticleAdded?: (article: Article) => void;
}

export default function ArticleManager({
  questionId,
  questionPrompt,
  questionOptions,
  onArticleAdded
}: ArticleManagerProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [articleType, setArticleType] = useState<"static" | "ai_generated" | "template">("static");
  const [newArticle, setNewArticle] = useState({
    title: "",
    content: "",
    category: "general",
    tags: [] as string[]
  });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadArticles();
  }, [questionId]);

  const loadArticles = async () => {
    try {
      const response = await fetch(`/api/admin/articles?questionId=${questionId}`);
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Failed to load articles:', error);
    }
  };

  const handleGenerateAI = async () => {
    if (!selectedOption) return;

    setIsGenerating(true);
    try {
      const option = questionOptions.find(opt => opt.value === selectedOption);
      if (!option) return;

      const response = await fetch('/api/admin/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          questionPrompt,
          answerValue: selectedOption,
          answerLabel: option.label,
          category: newArticle.category
        })
      });

      if (response.ok) {
        const data = await response.json();
        setNewArticle({
          title: data.article.title,
          content: data.article.content,
          category: data.article.category,
          tags: data.article.tags || []
        });
      }
    } catch (error) {
      console.error('Failed to generate article:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveArticle = async () => {
    if (!newArticle.title || !newArticle.content) return;

    try {
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newArticle,
          type: articleType,
          triggers: [{
            questionId,
            optionValue: selectedOption,
            priority: 5,
            isActive: true
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        setArticles([...articles, data.article]);
        setNewArticle({ title: "", content: "", category: "general", tags: [] });
        setShowAddForm(false);
        onArticleAdded?.(data.article);
      }
    } catch (error) {
      console.error('Failed to save article:', error);
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    try {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setArticles(articles.filter(a => a.id !== articleId));
      }
    } catch (error) {
      console.error('Failed to delete article:', error);
    }
  };

  return (
    <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
          <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Related Articles ({articles.length})
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Article
        </button>
      </div>

      {/* Existing Articles */}
      {articles.length > 0 && (
        <div className="space-y-2 mb-4">
          {articles.map((article) => (
            <div key={article.id} className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">{article.title}</h4>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{article.content}</p>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {article.type}
                    </span>
                    <span className="text-xs bg-blue-100 px-2 py-1 rounded-full">
                      {article.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteArticle(article.id)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Article Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="space-y-4">
            {/* Article Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Type
              </label>
              <div className="flex space-x-2">
                {["static", "ai_generated", "template"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setArticleType(type as any)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      articleType === type
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {type.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Option Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trigger for Answer
              </label>
              <select
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an answer option</option>
                {questionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Generation Button */}
            {articleType === "ai_generated" && selectedOption && (
              <button
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? "Generating..." : "Generate AI Article"}
              </button>
            )}

            {/* Article Form */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newArticle.title}
                onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                placeholder="Article title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={newArticle.content}
                onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                placeholder="Article content"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={newArticle.category}
                onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General</option>
                <option value="marriage">Marriage & Relationships</option>
                <option value="health">Health & Wellness</option>
                <option value="career">Career & Professional</option>
                <option value="investing">Investing</option>
                <option value="savings">Savings</option>
                <option value="debt">Debt Management</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={handleSaveArticle}
                disabled={!newArticle.title || !newArticle.content}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Article
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewArticle({ title: "", content: "", category: "general", tags: [] });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
