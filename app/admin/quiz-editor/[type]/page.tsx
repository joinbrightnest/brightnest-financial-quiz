"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ArticleDisplayStandardized from "../../../../components/ArticleDisplayStandardized";

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
  skipButton?: boolean;
  continueButton?: boolean;
  continueButtonColor?: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  order: number;
  triggerQuestionId?: string;
  triggerAnswerValue?: string;
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
}

interface LoadingScreen {
  id: string;
  quizType: string;
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
  triggerQuestionId?: string;
  isActive: boolean;
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
  const [loadingScreens, setLoadingScreens] = useState<LoadingScreen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const hasInitiallyLoaded = useRef(false);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [quizLink, setQuizLink] = useState<string>('');
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showArticlePopup, setShowArticlePopup] = useState(false);
  const [expandedMappings, setExpandedMappings] = useState<{ [key: string]: boolean }>({});
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

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
      fetchLoadingScreens();
      // Generate the quiz link
      setQuizLink(`https://joinbrightnest.com/quiz/${quizType}`);
    }
  }, [quizType]);

  // Refresh articles and loading screens when window gains focus (when user comes back from creation)
  useEffect(() => {
    const handleFocus = () => {
      if (quizType) {
        fetchArticles();
        fetchLoadingScreens();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [quizType]);

  // Update localStorage whenever questions change
  useEffect(() => {
    if (quizType && questions.length > 0) {
      localStorage.setItem(`quiz-questions-${quizType}`, JSON.stringify(questions));
    }
  }, [questions, quizType]);

  const fetchQuestions = async () => {
    try {
      // Only show loading state on initial load, not on window switches
      if (!hasInitiallyLoaded.current) {
        setIsLoading(true);
      }
      const response = await fetch(`/api/admin/quiz-questions?quizType=${quizType}`, {
        credentials: 'include'
      });
      const data = await response.json();
      const questionsData = data.questions || [];
      setQuestions(questionsData);
      
      // Store current questions in localStorage for other pages to access
      localStorage.setItem(`quiz-questions-${quizType}`, JSON.stringify(questionsData));
      
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
      console.log('🔄 Loading articles from database for quiz type:', quizType);
      
      // Load articles from database
      const response = await fetch(`/api/admin/articles?quizType=${quizType}`, {
        credentials: 'include'
      });
      
      console.log('📡 Articles API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📄 Raw articles data from API:', data);
        console.log('📊 Articles array:', data.articles);
        console.log('🔢 Number of articles found:', data.articles?.length || 0);
        
        if (data.articles && data.articles.length > 0) {
          const articlesList = data.articles.map((article: any, index: number) => ({
            id: article.id,
            title: article.title,
            content: article.content,
            category: article.category,
            order: questions.length + index + 1, // Place after questions
            triggerQuestionId: article.triggers?.[0]?.questionId,
            triggerAnswerValue: article.triggers?.[0]?.optionValue,
            // Customization fields
            subtitle: article.subtitle,
            personalizedText: article.personalizedText,
            backgroundColor: article.backgroundColor,
            textColor: article.textColor,
            iconColor: article.iconColor,
            accentColor: article.accentColor,
            iconType: article.iconType,
            showIcon: article.showIcon,
            showStatistic: article.showStatistic,
            statisticText: article.statisticText,
            statisticValue: article.statisticValue,
            ctaText: article.ctaText,
            showCta: article.showCta,
            // Layout and positioning fields
            textAlignment: article.textAlignment,
            contentPosition: article.contentPosition,
            backgroundStyle: article.backgroundStyle,
            backgroundGradient: article.backgroundGradient,
            contentPadding: article.contentPadding,
            showTopBar: article.showTopBar,
            topBarColor: article.topBarColor,
            // Text formatting fields
            titleFontSize: article.titleFontSize,
            titleFontWeight: article.titleFontWeight,
            contentFontSize: article.contentFontSize,
            contentFontWeight: article.contentFontWeight,
            lineHeight: article.lineHeight
          }));
          
          console.log('✅ Processed articles list:', articlesList);
          setArticles(articlesList);
        } else {
          console.log('⚠️ No articles found in response');
          setArticles([]);
        }
      } else {
        const errorData = await response.text();
        console.log('❌ Failed to load articles from database:', response.status, errorData);
        setArticles([]);
      }
    } catch (error) {
      console.error("💥 Error fetching articles:", error);
      setArticles([]);
    }
  };

  const fetchLoadingScreens = async () => {
    try {
      console.log('Loading loading screens from database for quiz type:', quizType);
      
      const response = await fetch(`/api/admin/loading-screens?quizType=${quizType}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Loading screens from database:', data.loadingScreens);
        setLoadingScreens(data.loadingScreens || []);
      } else {
        console.log('Failed to load loading screens from database');
        setLoadingScreens([]);
      }
    } catch (error) {
      console.error("Error fetching loading screens:", error);
      setLoadingScreens([]);
    }
  };

  const handleDeleteLoadingScreen = async (loadingScreenId: string) => {
    if (!confirm('Are you sure you want to delete this loading screen?')) return;
    
    try {
      const response = await fetch(`/api/admin/loading-screens/${loadingScreenId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        alert('Loading screen deleted successfully!');
        // Refresh the loading screens list
        fetchLoadingScreens();
      } else {
        const error = await response.json();
        alert(`Failed to delete: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting loading screen:", error);
      alert('Failed to delete loading screen. Please try again.');
    }
  };


  const handleDragStart = (e: React.DragEvent, questionId: string) => {
    setDraggedItem(questionId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetQuestionId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetQuestionId) {
      setDraggedItem(null);
      return;
    }

    const draggedIndex = questions.findIndex(q => q.id === draggedItem);
    const targetIndex = questions.findIndex(q => q.id === targetQuestionId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      return;
    }

    // Reorder questions
    const newQuestions = [...questions];
    const [draggedQuestionObj] = newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(targetIndex, 0, draggedQuestionObj);

    // Update order numbers
    const updatedQuestions = newQuestions.map((question, index) => ({
      ...question,
      order: index + 1
    }));

    setQuestions(updatedQuestions);
    setDraggedItem(null);
  };

  const handleQuestionEdit = (questionId: string, field: string, value: string | number | boolean) => {
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
      active: true,
      skipButton: false,
      continueButton: false,
      continueButtonColor: '#09727c'
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const removeQuestion = (questionId: string) => {
    if (confirm("Are you sure you want to remove this question?")) {
      setQuestions(prev => prev.filter(q => q.id !== questionId));
    }
  };

  const saveChanges = async () => {
    try {
      setIsSaving(true);
      
      // Save questions
      const response = await fetch("/api/admin/save-quiz-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          quizType,
          questions
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        alert("Questions and articles saved successfully!");
        await fetchQuestions(); // Refresh to get updated data
        await fetchArticles(); // Refresh articles from database
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

  const handleEditArticle = (article: Article) => {
    // Store article data in localStorage for the create-article page to load
    localStorage.setItem('editingArticle', JSON.stringify(article));
    // Navigate to create-article page
    router.push(`/admin/quiz-editor/${quizType}/create-article`);
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (confirm("Are you sure you want to delete this article?")) {
      try {
        const response = await fetch(`/api/admin/articles/${articleId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          // Remove article from local state
          setArticles(prev => prev.filter(a => a.id !== articleId));
          alert('Article deleted successfully!');
        } else {
          alert('Failed to delete article. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting article:', error);
        alert('Failed to delete article. Please try again.');
      }
    }
  };

  const handleDeleteAllArticlesForQuestion = async (questionId: string) => {
    const articlesForQuestion = articles.filter(a => a.triggerQuestionId === questionId);
    
    if (articlesForQuestion.length === 0) {
      alert('No articles to delete for this question.');
      return;
    }

    if (confirm(`Are you sure you want to delete all ${articlesForQuestion.length} articles for this question?`)) {
      try {
        // Delete all articles for this question
        const deletePromises = articlesForQuestion.map(article => 
          fetch(`/api/admin/articles/${article.id}`, { 
            method: 'DELETE',
            credentials: 'include'
          })
        );

        const results = await Promise.all(deletePromises);
        const allSuccessful = results.every(response => response.ok);

        if (allSuccessful) {
          // Remove articles from local state
          setArticles(prev => prev.filter(a => a.triggerQuestionId !== questionId));
          alert(`Successfully deleted ${articlesForQuestion.length} articles!`);
        } else {
          alert('Some articles could not be deleted. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting articles:', error);
        alert('Failed to delete articles. Please try again.');
      }
    }
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
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Left Sidebar - Fixed Position */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 h-full z-10">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={() => window.open('/admin/quiz-management', '_self')}
            className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-xs font-medium">Back</span>
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900">
              {getQuizTypeDisplayName(quizType)}
            </h1>
            <p className="text-xs text-gray-500 mt-1">Quiz Editor</p>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">Actions</h3>
            <button
              onClick={addNewQuestion}
              className="w-full flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm font-medium">Add Question</span>
            </button>
            <button
              onClick={() => router.push(`/admin/quiz-editor/${quizType}/create-article`)}
              className="w-full flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium">Add Article</span>
            </button>
            <button
              onClick={() => router.push(`/admin/quiz-editor/${quizType}/loading-screens`)}
              className="w-full flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Loading Screens</span>
            </button>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={saveChanges}
              disabled={isSaving}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <svg className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-semibold">{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">Overview</h3>
            <div className="space-y-3 px-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Questions</span>
                <span className="text-sm font-semibold text-gray-900">{questions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Articles</span>
                <span className="text-sm font-semibold text-gray-900">{articles.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Loading Screens</span>
                <span className="text-sm font-semibold text-gray-900">{loadingScreens.filter(ls => ls.triggerQuestionId).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 ml-80 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
        
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

        {/* Questions List */}
        <div className="space-y-6">
          {questions.map((question, index) => {
            const displayQuestionNumber = index + 1; // Sequential display number (1, 2, 3, 4...)
            return (
            <div key={question.id} className="space-y-4">
              {/* Question */}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, question.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, question.id)}
                className={`group relative bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                  draggedItem === question.id
                    ? "border-blue-500 opacity-50 scale-95"
                    : "border-white/20 hover:border-blue-200/50 hover:scale-[1.02]"
                }`}
              >
                {/* Question Header */}
                <div className="p-6 border-b border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl text-lg font-bold shadow-lg">
                        {displayQuestionNumber}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Question {displayQuestionNumber}</h3>
                        <p className="text-sm text-gray-500 flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            question.type === 'single' ? 'bg-blue-100 text-blue-800' :
                            question.type === 'text' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {question.type === 'single' ? 'Multiple Choice' : 
                             question.type === 'text' ? 'Text Input' : 'Email Input'}
                          </span>
                          <span>•</span>
                          <span>{question.options.length} options</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setEditingQuestion(editingQuestion === question.id ? null : question.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          editingQuestion === question.id
                            ? "bg-blue-600 text-white shadow-lg"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>{editingQuestion === question.id ? "Done Editing" : "Edit"}</span>
                      </button>
                      <button
                        onClick={() => removeQuestion(question.id)}
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

                {/* Question Content */}
                <div className="p-6">
                  {editingQuestion === question.id ? (
                    <div className="space-y-6">
                      {/* Question Prompt */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-semibold text-gray-700">
                            Question Prompt
                          </label>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                const cursorPos = (document.getElementById(`prompt-${question.id}`) as HTMLTextAreaElement)?.selectionStart || question.prompt.length;
                                const newPrompt = question.prompt.slice(0, cursorPos) + '{{name}}' + question.prompt.slice(cursorPos);
                                handleQuestionEdit(question.id, "prompt", newPrompt);
                              }}
                              className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                              title="Insert name variable"
                            >
                              + {`{{name}}`}
                            </button>
                            <button
                              onClick={() => {
                                const cursorPos = (document.getElementById(`prompt-${question.id}`) as HTMLTextAreaElement)?.selectionStart || question.prompt.length;
                                const newPrompt = question.prompt.slice(0, cursorPos) + '{{email}}' + question.prompt.slice(cursorPos);
                                handleQuestionEdit(question.id, "prompt", newPrompt);
                              }}
                              className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
                              title="Insert email variable"
                            >
                              + {`{{email}}`}
                            </button>
                          </div>
                        </div>
                        <textarea
                          id={`prompt-${question.id}`}
                          value={question.prompt}
                          onChange={(e) => handleQuestionEdit(question.id, "prompt", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm"
                          rows={3}
                          placeholder="Type your question here. Use double curly braces with name or email to personalize..."
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          💡 <strong>Tip:</strong> Use <code className="px-1 py-0.5 bg-gray-100 rounded text-blue-600">{`{{name}}`}</code> or <code className="px-1 py-0.5 bg-gray-100 rounded text-purple-600">{`{{email}}`}</code> to personalize questions with user data from previous answers.
                        </p>
                      </div>

                      {/* Question Type */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Question Type
                        </label>
                        <select
                          value={question.type}
                          onChange={(e) => handleQuestionEdit(question.id, "type", e.target.value)}
                          className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm"
                        >
                          <option value="single">Multiple Choice</option>
                          <option value="text">Text Input</option>
                          <option value="email">Email Input</option>
                        </select>
                      </div>

                      {/* Skip and Continue Options */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={`skip-${question.id}`}
                            checked={question.skipButton || false}
                            onChange={(e) => handleQuestionEdit(question.id, "skipButton", e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`skip-${question.id}`} className="text-sm font-medium text-gray-700">
                            Show Skip Option
                          </label>
                          <span className="text-xs text-gray-500">(Users can skip this question)</span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={`continue-${question.id}`}
                            checked={question.continueButton || false}
                            onChange={(e) => handleQuestionEdit(question.id, "continueButton", e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`continue-${question.id}`} className="text-sm font-medium text-gray-700">
                            Show Continue Button
                          </label>
                          <span className="text-xs text-gray-500">(Requires answer selection before proceeding)</span>
                        </div>

                        {/* Continue Button Color (only show if continue button is enabled) */}
                        {(question.continueButton || false) && (
                          <div className="ml-7">
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                              Continue Button Color
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={question.continueButtonColor || "#09727c"}
                                onChange={(e) => handleQuestionEdit(question.id, "continueButtonColor", e.target.value)}
                                className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                              />
                              <input
                                type="text"
                                value={question.continueButtonColor || "#09727c"}
                                onChange={(e) => handleQuestionEdit(question.id, "continueButtonColor", e.target.value)}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded text-gray-900"
                                placeholder="#09727c"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Options (only for single type) */}
                      {question.type === "single" && (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-semibold text-gray-700">
                              Answer Options
                            </label>
                            <button
                              onClick={() => addNewOption(question.id)}
                              className="flex items-center space-x-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-all duration-200 text-sm font-semibold"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              <span>Add Option</span>
                            </button>
                          </div>
                          <div className="space-y-3">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="bg-gray-50/50 rounded-xl p-4 border border-gray-200/50">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                                  <input
                                    type="text"
                                    value={option.label}
                                    onChange={(e) => handleOptionEdit(question.id, optIndex, "label", e.target.value)}
                                    placeholder="Option label"
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm"
                                  />
                                  <input
                                    type="text"
                                    value={option.value}
                                    onChange={(e) => handleOptionEdit(question.id, optIndex, "value", e.target.value)}
                                    placeholder="Option value"
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm"
                                  />
                                  <select
                                    value={option.weightCategory}
                                    onChange={(e) => handleOptionEdit(question.id, optIndex, "weightCategory", e.target.value)}
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
                                      onChange={(e) => handleOptionEdit(question.id, optIndex, "weightValue", parseInt(e.target.value))}
                                      className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm"
                                      min="0"
                                      max="5"
                                    />
                                    {question.options.length > 1 && (
                                      <button
                                        onClick={() => removeOption(question.id, optIndex)}
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
                    <div>
                      <p className="text-gray-900 font-semibold text-lg mb-4 leading-relaxed">{question.prompt}</p>
                      {question.type === "single" && (
                        <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200/50">
                          <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            Answer Options ({question.options.length})
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {question.options.map((option, optIndex) => (
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
                      {question.type === "text" && (
                        <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-200/50">
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="text-sm font-semibold text-emerald-700">Text Input Field</span>
                          </div>
                        </div>
                      )}
                      {question.type === "email" && (
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
                  )}
                </div>
              </div>

              {/* Answer → Article Mapping - Only show if articles exist */}
              {(() => {
                // Find articles for this question by matching answer values
                const articlesForQuestion = articles.filter(a => {
                  // Check if any of this question's options match the article's trigger
                  return question.options?.some(option => option.value === a.triggerAnswerValue) || false;
                });
                
                console.log('Articles for question:', question.id, 'found:', articlesForQuestion);
                
                // Only show if there's at least one article for this question
                if (articlesForQuestion.length === 0) return null;
                
                const isExpanded = expandedMappings[question.id] || false;
                
                return (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <span className="text-sm font-medium text-gray-900">Answer → Article Mapping</span>
                          <span className="ml-2 text-xs text-gray-500">({articlesForQuestion.length}/{question.options.length})</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/admin/quiz-editor/${quizType}/create-article`)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                          + Add
                        </button>
                        <button
                          onClick={() => handleDeleteAllArticlesForQuestion(question.id)}
                          className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                          title="Delete all articles for this question"
                        >
                          Delete All
                        </button>
                        <button
                          onClick={() => setExpandedMappings(prev => ({
                            ...prev,
                            [question.id]: !isExpanded
                          }))}
                          className="px-2 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="mt-3 space-y-1">
                        {question.options.map((option, optIndex) => {
                          // Find article for this answer
                          const articleForAnswer = articles.find(a => 
                            a.triggerAnswerValue === option.value
                          );
                          
                          return (
                            <div key={optIndex} className="flex items-center justify-between bg-white rounded p-2 border border-green-200">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-semibold text-blue-800">{optIndex + 1}</span>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-900">
                                    {option.label}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {articleForAnswer ? `→ ${articleForAnswer.title}` : 'No article assigned'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {articleForAnswer ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        // Open article popup
                                        setSelectedArticle(articleForAnswer);
                                        setShowArticlePopup(true);
                                      }}
                                      className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                    >
                                      View
                                    </button>
                                    <button
                                      onClick={() => handleEditArticle(articleForAnswer)}
                                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                      title="Edit article"
                                    >
                                      ✏️ Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteArticle(articleForAnswer.id)}
                                      className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                      title="Delete article"
                                    >
                                      🗑️
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => router.push(`/admin/quiz-editor/${quizType}/create-article`)}
                                    className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                                  >
                                    Add Article
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Loading Screens - Show loading screens for this question */}
              {(() => {
                const loadingScreensForQuestion = loadingScreens.filter(ls => ls.triggerQuestionId === question.id);
                
                if (loadingScreensForQuestion.length === 0) return null;
                
                return (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <span className="text-sm font-medium text-gray-900">Loading Screens</span>
                          <span className="ml-2 text-xs text-gray-500">({loadingScreensForQuestion.length})</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/admin/quiz-editor/${quizType}/loading-screens`)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      {loadingScreensForQuestion.map((screen) => (
                        <div key={screen.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{screen.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {(screen.duration / 1000).toFixed(1)}s • {screen.iconType} • {screen.animationStyle}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => router.push(`/admin/quiz-editor/${quizType}/loading-screens?id=${screen.id}`)}
                              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-100 rounded-md border border-gray-200 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteLoadingScreen(screen.id)}
                              className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md border border-red-200 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

            </div>
            );
          })}
        </div>

        {questions.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No questions yet</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first question to this quiz.</p>
            <button
              onClick={addNewQuestion}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-semibold">Add Your First Question</span>
            </button>
          </div>
        )}
      </div>

      {/* Article Popup - Customized Version */}
      {showArticlePopup && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setShowArticlePopup(false)}
                className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Article Display */}
            <div className="h-[600px] overflow-y-auto">
              <ArticleDisplayStandardized
                article={selectedArticle}
                userVariables={{
                  name: 'John',
                  email: 'john@example.com',
                  answer: 'Sample Answer'
                }}
                onContinue={() => setShowArticlePopup(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Article Edit Popup */}
      {editingArticle && (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">Edit Article</h2>
              <button
                onClick={() => setEditingArticle(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Edit Form */}
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Article Title
                </label>
                <input
                  type="text"
                  value={editingArticle.title}
                  onChange={(e) => setEditingArticle({...editingArticle, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Article Content
                </label>
                <textarea
                  value={editingArticle.content}
                  onChange={(e) => setEditingArticle({...editingArticle, content: e.target.value})}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>


              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/admin/articles/${editingArticle.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                          title: editingArticle.title,
                          content: editingArticle.content
                        })
                      });

                      if (response.ok) {
                        // Update local state
                        setArticles(prev => prev.map(a => 
                          a.id === editingArticle.id ? editingArticle : a
                        ));
                        setEditingArticle(null);
                        alert('Article updated successfully!');
                      } else {
                        alert('Failed to update article. Please try again.');
                      }
                    } catch (error) {
                      console.error('Error updating article:', error);
                      alert('Failed to update article. Please try again.');
                    }
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingArticle(null)}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}