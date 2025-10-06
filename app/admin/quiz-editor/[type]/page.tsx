"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Question {
  id: string;
  quizType: string;
  order: number;
  prompt: string;
  type: string;
  options: Array<{
    label: string;
    value: string;
    weightCategory: string;
    weightValue: number;
  }>;
  active: boolean;
}

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  order: number;
  triggerQuestionId?: string;
  triggerAnswerValue?: string;
}

interface QuizEditorProps {
  params: Promise<{
    type: string;
  }>;
}

export default function QuizEditor({ params }: QuizEditorProps) {
  const router = useRouter();
  const [quizType, setQuizType] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const hasInitiallyLoaded = useRef(false);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [editingArticle, setEditingArticle] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [quizLink, setQuizLink] = useState<string>('');
  const [isEditingLink, setIsEditingLink] = useState(false);

  // Handle async params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setQuizType(resolvedParams.type);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (quizType) {
      fetchQuestions();
      fetchArticles();
      // Generate the quiz link
      setQuizLink(`https://joinbrightnest.com/quiz/${quizType}`);
    }
  }, [quizType]);

  const fetchQuestions = async () => {
    try {
      // Only show loading state on initial load, not on window switches
      if (!hasInitiallyLoaded.current) {
        setIsLoading(true);
      }
      const response = await fetch(`/api/admin/quiz-questions?quizType=${quizType}`);
      const data = await response.json();
      setQuestions(data.questions || []);
      hasInitiallyLoaded.current = true;
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      // Only hide loading state if we were actually showing it
      if (!hasInitiallyLoaded.current) {
        setIsLoading(false);
      }
    }
  };

  const fetchArticles = async () => {
    try {
      // Load articles from localStorage (simple article system)
      const storedArticles = localStorage.getItem('brightnest_articles');
      if (storedArticles) {
        const articlesData = JSON.parse(storedArticles);
        const articlesList = Object.values(articlesData).map((article: any, index: number) => ({
          id: article.id,
          title: article.title,
          content: article.content,
          category: article.category,
          order: questions.length + index + 1, // Place after questions
          triggerQuestionId: undefined,
          triggerAnswerValue: undefined
        }));
        setArticles(articlesList);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };

  // Combine questions and articles for unified drag and drop
  const getAllItems = () => {
    return [...questions, ...articles].sort((a, b) => a.order - b.order);
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetItemId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetItemId) {
      setDraggedItem(null);
      return;
    }

    const allItems = getAllItems();
    const draggedIndex = allItems.findIndex(item => item.id === draggedItem);
    const targetIndex = allItems.findIndex(item => item.id === targetItemId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      return;
    }

    // Reorder items
    const newItems = [...allItems];
    const [draggedItemObj] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItemObj);

    // Update order numbers and separate back into questions and articles
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    // Auto-detect context for articles
    const updatedQuestions: Question[] = [];
    const updatedArticles: Article[] = [];

    updatedItems.forEach((item, index) => {
      if ('prompt' in item) {
        // It's a question
        updatedQuestions.push(item as Question);
      } else {
        // It's an article - auto-detect context
        const article = item as Article;
        const previousQuestion = updatedQuestions[updatedQuestions.length - 1];
        
        if (previousQuestion && previousQuestion.options && previousQuestion.options.length > 0) {
          // Auto-assign to the last question's first option
          updatedArticles.push({
            ...article,
            triggerQuestionId: previousQuestion.id,
            triggerAnswerValue: previousQuestion.options[0].value
          });
        } else {
          updatedArticles.push(article);
        }
      }
    });

    setQuestions(updatedQuestions);
    setArticles(updatedArticles);
    setDraggedItem(null);
  };

  const handleQuestionEdit = (questionId: string, field: string, value: string | number) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  const handleOptionEdit = (questionId: string, optionIndex: number, field: string, value: string | number) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? {
            ...q,
            options: q.options.map((opt, idx) => 
              idx === optionIndex ? { ...opt, [field]: value } : opt
            )
          }
        : q
    ));
  };

  const addNewOption = (questionId: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? {
            ...q,
            options: [
              ...q.options,
              {
                label: "New Option",
                value: "new_option",
                weightCategory: "spending",
                weightValue: 1
              }
            ]
          }
        : q
    ));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? {
            ...q,
            options: q.options.filter((_, idx) => idx !== optionIndex)
          }
        : q
    ));
  };

  const addNewQuestion = () => {
    const newQuestion: Question = {
      id: `new-${Date.now()}`,
      quizType,
      order: questions.length + 1,
      prompt: "New Question",
      type: "single",
      options: [
        {
          label: "Option 1",
          value: "option_1",
          weightCategory: "spending",
          weightValue: 1
        },
        {
          label: "Option 2",
          value: "option_2",
          weightCategory: "savings",
          weightValue: 2
        }
      ],
      active: true
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const removeQuestion = (questionId: string) => {
    if (confirm("Are you sure you want to remove this question?")) {
      setQuestions(prev => prev.filter(q => q.id !== questionId));
    }
  };


  const removeArticle = (articleId: string) => {
    if (confirm("Are you sure you want to remove this article?")) {
      setArticles(prev => prev.filter(a => a.id !== articleId));
    }
  };

  const handleArticleEdit = (articleId: string, field: string, value: string) => {
    setArticles(prev => prev.map(a => 
      a.id === articleId ? { ...a, [field]: value } : a
    ));
  };

  const saveChanges = async () => {
    try {
      setIsSaving(true);
      
      console.log("Saving questions:", { quizType, questionsCount: questions.length });
      
      const response = await fetch("/api/admin/save-quiz-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizType,
          questions
        }),
      });

      const responseData = await response.json();
      console.log("Save response:", responseData);

      if (response.ok) {
        alert("Questions saved successfully!");
        await fetchQuestions(); // Refresh to get updated data
      } else {
        console.error("Save failed:", responseData);
        alert(`Failed to save questions: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error saving questions:", error);
      alert(`Error saving questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const getQuizTypeDisplayName = (type: string) => {
    const displayNames: { [key: string]: string } = {
      "financial-profile": "Financial Profile",
      "health-finance": "Health Finance",
      "marriage-finance": "Marriage Finance"
    };
    return displayNames[type] || type;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(quizLink);
      alert('Quiz link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
      alert('Failed to copy link. Please copy manually.');
    }
  };

  const handleOpenQuiz = () => {
    window.open(quizLink, '_blank');
  };

  const handleSaveLink = () => {
    setIsEditingLink(false);
    // Here you could save the custom link to the database if needed
    // For now, we'll just update the local state
  };

  if (isLoading && !hasInitiallyLoaded.current) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.open('/admin/quiz-management', '_self')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Back to Quiz Management</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Quiz Editor: {getQuizTypeDisplayName(quizType)}
                </h1>
                <p className="text-sm text-gray-500">Drag and drop to reorder questions. Click to edit content.</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={addNewQuestion}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-semibold">Add Question</span>
              </button>
              <button
                onClick={() => window.open(`/admin/quiz-editor/${quizType}/create-article`, '_blank')}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-semibold">Add Article</span>
              </button>
              <button
                onClick={saveChanges}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold">{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Quiz Link Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Quiz Link</h3>
                <p className="text-sm text-gray-600">Share this link to let users take your quiz</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleOpenQuiz}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="font-semibold">Preview Quiz</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold">Copy Link</span>
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                {isEditingLink ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={quizLink}
                      onChange={(e) => setQuizLink(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm"
                      placeholder="Enter custom quiz link..."
                    />
                    <button
                      onClick={handleSaveLink}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingLink(false);
                        setQuizLink(`https://joinbrightnest.com/quiz/${quizType}`);
                      }}
                      className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-sm font-mono text-gray-900 break-all">{quizLink}</p>
                    </div>
                    <button
                      onClick={() => setIsEditingLink(true)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Questions and Articles List */}
        <div className="space-y-6">
          {getAllItems().map((item, index) => {
            const isQuestion = 'prompt' in item;
            const question = isQuestion ? item as Question : null;
            const article = !isQuestion ? item as Article : null;
            
            return (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, item.id)}
              className={`group relative bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                draggedItem === item.id
                  ? "border-blue-500 opacity-50 scale-95"
                  : "border-white/20 hover:border-blue-200/50 hover:scale-[1.02]"
              }`}
            >
              {/* Item Header */}
              <div className="p-6 border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl text-lg font-bold shadow-lg ${
                      isQuestion 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                        : 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                    }`}>
                      {item.order}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {isQuestion ? `Question ${item.order}` : `Article ${item.order}`}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center space-x-2">
                        {isQuestion ? (
                          <>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              question!.type === 'single' ? 'bg-blue-100 text-blue-800' :
                              question!.type === 'text' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {question!.type === 'single' ? 'Multiple Choice' : 
                               question!.type === 'text' ? 'Text Input' : 'Email Input'}
                            </span>
                            <span>•</span>
                            <span>{question!.options.length} options</span>
                          </>
                        ) : (
                          <>
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              Article
                            </span>
                            <span>•</span>
                            <span>{article!.category}</span>
                            {article!.triggerQuestionId && (
                              <>
                                <span>•</span>
                                <span className="text-xs text-blue-600">Auto-triggered</span>
                              </>
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        if (isQuestion) {
                          setEditingQuestion(editingQuestion === item.id ? null : item.id);
                        } else {
                          setEditingArticle(editingArticle === item.id ? null : item.id);
                        }
                      }}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        (isQuestion && editingQuestion === item.id) || (!isQuestion && editingArticle === item.id)
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>{(isQuestion && editingQuestion === item.id) || (!isQuestion && editingArticle === item.id) ? "Done Editing" : "Edit"}</span>
                    </button>
                    <button
                      onClick={() => {
                        if (isQuestion) {
                          removeQuestion(item.id);
                        } else {
                          removeArticle(item.id);
                        }
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-all duration-200 text-sm font-semibold"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Item Content */}
              <div className="p-6">
                {isQuestion ? (
                  // Question Content
                  editingQuestion === item.id ? (
                  <div className="space-y-6">
                    {/* Question Prompt */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Question Prompt
                      </label>
                      <textarea
                        value={question!.prompt}
                        onChange={(e) => handleQuestionEdit(item.id, "prompt", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm"
                        rows={3}
                      />
                    </div>

                    {/* Question Type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Question Type
                      </label>
                      <select
                        value={question!.type}
                        onChange={(e) => handleQuestionEdit(item.id, "type", e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm"
                      >
                        <option value="single">Multiple Choice</option>
                        <option value="text">Text Input</option>
                        <option value="email">Email Input</option>
                      </select>
                    </div>

                    {/* Options (only for single type) */}
                    {question!.type === "single" && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <label className="block text-sm font-semibold text-gray-700">
                            Answer Options
                          </label>
                          <button
                            onClick={() => addNewOption(item.id)}
                            className="flex items-center space-x-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-all duration-200 text-sm font-semibold"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Add Option</span>
                          </button>
                        </div>
                        <div className="space-y-3">
                          {question!.options.map((option, optIndex) => (
                            <div key={optIndex} className="bg-gray-50/50 rounded-xl p-4 border border-gray-200/50">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                                <input
                                  type="text"
                                  value={option.label}
                                  onChange={(e) => handleOptionEdit(item.id, optIndex, "label", e.target.value)}
                                  placeholder="Option label"
                                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm"
                                />
                                <input
                                  type="text"
                                  value={option.value}
                                  onChange={(e) => handleOptionEdit(item.id, optIndex, "value", e.target.value)}
                                  placeholder="Option value"
                                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm"
                                />
                                <select
                                  value={option.weightCategory}
                                  onChange={(e) => handleOptionEdit(item.id, optIndex, "weightCategory", e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm"
                                >
                                  <option value="debt">Debt</option>
                                  <option value="savings">Savings</option>
                                  <option value="spending">Spending</option>
                                  <option value="investing">Investing</option>
                                  <option value="contact">Contact</option>
                                </select>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="number"
                                    value={option.weightValue}
                                    onChange={(e) => handleOptionEdit(item.id, optIndex, "weightValue", parseInt(e.target.value))}
                                    className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm"
                                    min="0"
                                    max="5"
                                  />
                                  {question!.options.length > 1 && (
                                    <button
                                      onClick={() => removeOption(item.id, optIndex)}
                                      className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-all duration-200"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                  ) : (
                    // Question Display Mode
                    <div>
                      <p className="text-gray-900 font-semibold text-lg mb-4 leading-relaxed">{question!.prompt}</p>
                      {question!.type === "single" && (
                      <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200/50">
                        <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          Answer Options ({question!.options.length})
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {question!.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center space-x-3 bg-white/70 rounded-lg p-3 border border-gray-200/50">
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                              <span className="text-sm text-gray-700 font-medium">{option.label}</span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {option.weightCategory}: {option.weightValue}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                      {question!.type === "text" && (
                      <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-200/50">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span className="text-sm font-semibold text-emerald-700">Text Input Field</span>
                        </div>
                      </div>
                    )}
                      {question!.type === "email" && (
                      <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-200/50">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-semibold text-purple-700">Email Input Field</span>
                        </div>
                      </div>
                    )}
                    </div>
                  )
                ) : (
                  // Article Content
                  editingArticle === item.id ? (
                    <div className="space-y-6">
                      {/* Article Title */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Article Title
                        </label>
                        <input
                          type="text"
                          value={article!.title}
                          onChange={(e) => handleArticleEdit(item.id, "title", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white shadow-sm"
                        />
                      </div>

                      {/* Article Content */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Article Content
                        </label>
                        <textarea
                          value={article!.content}
                          onChange={(e) => handleArticleEdit(item.id, "content", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white shadow-sm"
                          rows={6}
                        />
                      </div>

                      {/* Article Category */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Category
                        </label>
                        <select
                          value={article!.category}
                          onChange={(e) => handleArticleEdit(item.id, "category", e.target.value)}
                          className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white shadow-sm"
                        >
                          <option value="marriage">Marriage</option>
                          <option value="health">Health</option>
                          <option value="career">Career</option>
                          <option value="savings">Savings</option>
                          <option value="debt">Debt</option>
                          <option value="investing">Investing</option>
                          <option value="general">General</option>
                        </select>
                      </div>

                      {/* Auto-trigger Info */}
                      {article!.triggerQuestionId && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-semibold text-blue-800">Auto-triggered</span>
                          </div>
                          <p className="text-sm text-blue-700">
                            This article will automatically appear after the question above based on the user's answer.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Article Display Mode
                    <div>
                      <h3 className="text-gray-900 font-semibold text-lg mb-4 leading-relaxed">{article!.title}</h3>
                      <div className="bg-green-50/50 rounded-xl p-4 border border-green-200/50">
                        <div className="flex items-center space-x-2 mb-3">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm font-semibold text-green-700">Article Content</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {article!.content.length > 200 ? `${article!.content.substring(0, 200)}...` : article!.content}
                        </p>
                        {article!.triggerQuestionId && (
                          <div className="mt-3 p-2 bg-blue-100 rounded-lg">
                            <p className="text-xs text-blue-700">
                              <strong>Auto-triggered:</strong> Shows after question above
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
            );
          })}
        </div>

        {getAllItems().length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No questions or articles yet</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first question or article to this quiz.</p>
            <button
              onClick={addNewQuestion}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-semibold">Add Your First Question</span>
            </button>
            <button
              onClick={() => window.open(`/admin/quiz-editor/${quizType}/create-article`, '_blank')}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl mx-auto mt-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-semibold">Add Your First Article</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
