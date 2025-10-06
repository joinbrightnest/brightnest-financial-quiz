"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { simpleArticleSystem, SimpleArticle } from "@/lib/simple-articles";

export default function ManageArticlesPage({ params }: { params: Promise<{ type: string }> }) {
  const router = useRouter();
  const [quizType, setQuizType] = useState<string>('');
  const [articles, setArticles] = useState<SimpleArticle[]>([]);
  const [editingArticle, setEditingArticle] = useState<SimpleArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setQuizType(resolvedParams.type);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setIsLoading(true);
    try {
      await simpleArticleSystem.loadArticles();
      const allArticles = simpleArticleSystem.getAllArticles();
      setArticles(allArticles);
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditArticle = (article: SimpleArticle) => {
    setEditingArticle(article);
  };

  const handleSaveArticle = async (updatedArticle: SimpleArticle) => {
    try {
      await simpleArticleSystem.updateArticle(updatedArticle.category, updatedArticle);
      await loadArticles();
      setEditingArticle(null);
      alert('Article updated successfully!');
    } catch (error) {
      console.error('Failed to save article:', error);
      alert('Failed to save article. Please try again.');
    }
  };

  const handleGenerateNewArticle = async (category: string) => {
    try {
      const newArticle = await simpleArticleSystem.generateOrGetArticle(category);
      await loadArticles();
      setEditingArticle(newArticle);
    } catch (error) {
      console.error('Failed to generate article:', error);
      alert('Failed to generate article. Please try again.');
    }
  };

  const handleDeleteArticle = async (category: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        await simpleArticleSystem.deleteArticle(category);
        await loadArticles();
        alert('Article deleted successfully!');
      } catch (error) {
        console.error('Failed to delete article:', error);
        alert('Failed to delete article. Please try again.');
      }
    }
  };

  const categories = ['marriage', 'health', 'career', 'savings', 'debt', 'investing', 'general'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <button
                onClick={() => router.push(`/admin/quiz-editor/${quizType}`)}
                className="text-blue-600 hover:text-blue-800 mb-2"
              >
                ← Back to Quiz Editor
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Manage Articles</h1>
              <p className="text-gray-600">Customize and manage your article library</p>
            </div>
          </div>

          {editingArticle ? (
            /* Edit Article View */
            <EditArticleView
              article={editingArticle}
              onSave={handleSaveArticle}
              onCancel={() => setEditingArticle(null)}
            />
          ) : (
            /* Article List View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => {
                const article = articles.find(a => a.category === category);
                return (
                  <div key={category} className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">
                        {category}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        article?.isCustomized 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {article?.isCustomized ? 'Customized' : 'Default'}
                      </span>
                    </div>

                    {article ? (
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{article.title}</h4>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{article.content}</p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-lg font-bold text-red-600">{article.stat}</div>
                          <p className="text-xs text-gray-600">{article.description}</p>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditArticle(article)}
                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(category)}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm mb-3">No article for this category</p>
                        <button
                          onClick={() => handleGenerateNewArticle(category)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                        >
                          Generate Article
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Edit Article Component
function EditArticleView({ 
  article, 
  onSave, 
  onCancel 
}: { 
  article: SimpleArticle; 
  onSave: (article: SimpleArticle) => void; 
  onCancel: () => void; 
}) {
  const [editedArticle, setEditedArticle] = useState<SimpleArticle>(article);

  const handleSave = () => {
    onSave(editedArticle);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Edit {article.category.charAt(0).toUpperCase() + article.category.slice(1)} Article
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={editedArticle.title}
            onChange={(e) => setEditedArticle({...editedArticle, title: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <textarea
            value={editedArticle.content}
            onChange={(e) => setEditedArticle({...editedArticle, content: e.target.value})}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stat (e.g., "70%")
            </label>
            <input
              type="text"
              value={editedArticle.stat}
              onChange={(e) => setEditedArticle({...editedArticle, stat: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (e.g., "of divorces are caused by financial stress")
            </label>
            <input
              type="text"
              value={editedArticle.description}
              onChange={(e) => setEditedArticle({...editedArticle, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Key Points (one per line)
          </label>
          <textarea
            value={editedArticle.keyPoints.join('\n')}
            onChange={(e) => setEditedArticle({...editedArticle, keyPoints: e.target.value.split('\n')})}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          />
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Preview:</h3>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">{editedArticle.stat}</div>
            <p className="text-sm text-gray-600">{editedArticle.description}</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-medium"
          >
            Save Article
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
