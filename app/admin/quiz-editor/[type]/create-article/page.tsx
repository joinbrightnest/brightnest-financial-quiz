"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Question {
  id: string;
  order: number;
  prompt: string;
  type: string;
  options: Array<{
    label: string;
    value: string;
    weightValue: number;
  }>;
}

interface CreateArticlePageProps {
  params: Promise<{
    type: string;
  }>;
}

export default function CreateArticlePage({ params }: CreateArticlePageProps) {
  const router = useRouter();
  const [quizType, setQuizType] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Generated article data
  const [generatedArticle, setGeneratedArticle] = useState<{
    title: string;
    content: string;
    category: string;
    tags: string[];
    keyPoints?: string[];
  } | null>(null);

  // Customization fields
  const [title, setTitle] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('Financial Guidance');
  const [personalizedText, setPersonalizedText] = useState<string>('');
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [textColor, setTextColor] = useState<string>('#000000');
  const [iconColor, setIconColor] = useState<string>('#3b82f6');
  const [accentColor, setAccentColor] = useState<string>('#ef4444');
  const [iconType, setIconType] = useState<string>('document');
  const [showIcon, setShowIcon] = useState<boolean>(true);
  const [showStatistic, setShowStatistic] = useState<boolean>(true);
  const [statisticText, setStatisticText] = useState<string>('of people face similar financial challenges');
  const [statisticValue, setStatisticValue] = useState<string>('75%');
  const [ctaText, setCtaText] = useState<string>('CONTINUE');
  const [showCta, setShowCta] = useState<boolean>(true);
  
  // Layout and positioning options
  const [textAlignment, setTextAlignment] = useState<string>('left');
  const [contentPosition, setContentPosition] = useState<string>('center');
  const [backgroundStyle, setBackgroundStyle] = useState<string>('solid');
  const [backgroundGradient, setBackgroundGradient] = useState<string>('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
  const [contentPadding, setContentPadding] = useState<string>('normal');
  const [showTopBar, setShowTopBar] = useState<boolean>(true);
  const [topBarColor, setTopBarColor] = useState<string>('#1f2937');
  
  // Text formatting options
  const [titleFontSize, setTitleFontSize] = useState<string>('large');
  const [titleFontWeight, setTitleFontWeight] = useState<string>('bold');
  const [contentFontSize, setContentFontSize] = useState<string>('normal');
  const [contentFontWeight, setContentFontWeight] = useState<string>('normal');
  const [lineHeight, setLineHeight] = useState<string>('normal');
  
  // Editing state
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

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
      loadEditingArticle();
    }
  }, [quizType]);

  // Load editing article data from localStorage
  const loadEditingArticle = () => {
    const editingArticleData = localStorage.getItem('editingArticle');
    if (editingArticleData) {
      try {
        const article: any = JSON.parse(editingArticleData);
        
        // Set editing state
        setEditingArticleId(article.id);
        
        // Pre-fill all form fields with article data
        setTitle(article.title || '');
        setSubtitle(article.subtitle || 'Financial Guidance');
        setPersonalizedText(article.content || '');
        setBackgroundColor(article.backgroundColor || '#ffffff');
        setTextColor(article.textColor || '#000000');
        setIconColor(article.iconColor || '#3b82f6');
        setAccentColor(article.accentColor || '#ef4444');
        setIconType(article.iconType || 'document');
        setShowIcon(article.showIcon !== false);
        setShowStatistic(article.showStatistic !== false);
        setStatisticText(article.statisticText || 'of people face similar financial challenges');
        setStatisticValue(article.statisticValue || '75%');
        setCtaText(article.ctaText || 'CONTINUE');
        setShowCta(article.showCta !== false);
        
        // Layout and positioning fields
        setTextAlignment(article.textAlignment || 'left');
        setContentPosition(article.contentPosition || 'center');
        setBackgroundStyle(article.backgroundStyle || 'solid');
        setBackgroundGradient(article.backgroundGradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
        setContentPadding(article.contentPadding || 'normal');
        setShowTopBar(article.showTopBar !== false);
        setTopBarColor(article.topBarColor || '#1f2937');
        
        // Text formatting fields
        setTitleFontSize(article.titleFontSize || 'large');
        setTitleFontWeight(article.titleFontWeight || 'bold');
        setContentFontSize(article.contentFontSize || 'normal');
        setContentFontWeight(article.contentFontWeight || 'normal');
        setLineHeight(article.lineHeight || 'normal');
        
        // Find and set the question and answer
        // Check if article has triggers array (from API) or separate fields (from quiz editor)
        if (article.triggers && article.triggers.length > 0) {
          const trigger = article.triggers[0];
          setSelectedQuestion(trigger.questionId || '');
          setSelectedOption(trigger.optionValue || '');
        } else if (article.triggerQuestionId && article.triggerAnswerValue) {
          // Handle the case where article comes from quiz editor with separate fields
          setSelectedQuestion(article.triggerQuestionId);
          setSelectedOption(article.triggerAnswerValue);
        }
        
        // Clear the localStorage after loading
        localStorage.removeItem('editingArticle');
        
        console.log('Loaded editing article:', article);
        console.log('Article triggers:', article.triggers);
        console.log('Article triggerQuestionId:', article.triggerQuestionId);
        console.log('Article triggerAnswerValue:', article.triggerAnswerValue);
        console.log('Selected question will be:', article.triggerQuestionId || (article.triggers?.[0]?.questionId));
        console.log('Selected option will be:', article.triggerAnswerValue || (article.triggers?.[0]?.optionValue));
        console.log('Article textAlignment:', article.textAlignment);
        console.log('Article titleFontSize:', article.titleFontSize);
        console.log('Article backgroundColor:', article.backgroundColor);
        console.log('Article showIcon:', article.showIcon);
      } catch (error) {
        console.error('Failed to parse editing article data:', error);
        localStorage.removeItem('editingArticle');
      }
    }
  };

  // Refresh questions when window gains focus (user comes back from quiz editor)
  useEffect(() => {
    const handleFocus = () => {
      if (quizType) {
        // Window focused, refreshing questions
        fetchQuestions();
      }
    };

    // Listen for localStorage changes (when quiz editor updates questions)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `quiz-questions-${quizType}` && e.newValue) {
        try {
          const newQuestions = JSON.parse(e.newValue);
          // Questions updated from localStorage
          setQuestions(newQuestions);
        } catch (error) {
          console.error('Failed to parse updated questions:', error);
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [quizType]);

  const fetchQuestions = async () => {
    try {
      // Fetching questions for quiz type
      
      // First, try to get questions from localStorage (current state from quiz editor)
      const cachedQuestions = localStorage.getItem(`quiz-questions-${quizType}`);
      if (cachedQuestions) {
        try {
          const parsedQuestions = JSON.parse(cachedQuestions);
          // Using cached questions from localStorage
          setQuestions(parsedQuestions);
          setIsLoading(false);
          return;
        } catch (e) {
          // Failed to parse cached questions, falling back to API
        }
      }
      
      // Fallback to API if no cached data
      const response = await fetch(`/api/admin/quiz-questions?quizType=${quizType}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        // Fetched questions from API
        setQuestions(data.questions || []);
      } else {
        console.error('Failed to fetch questions:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateArticle = async () => {
    if (!selectedQuestion || !selectedOption) return;

    setIsGenerating(true);
    try {
      const question = questions.find(q => q.id === selectedQuestion);
      const option = question?.options.find(opt => opt.value === selectedOption);
      
      if (!question || !option) return;

      const response = await fetch('/api/admin/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          questionId: selectedQuestion,
          questionPrompt: question.prompt,
          answerValue: selectedOption,
          answerLabel: option.label,
          category: 'general'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedArticle(data.article);
        // Pre-populate title with generated title
        setTitle(data.article.title);
        // Pre-populate content with generated content for easy editing
        setPersonalizedText(data.article.content);
      }
    } catch (error) {
      console.error('Failed to generate article:', error);
    } finally {
      setIsGenerating(false);
    }
  };


  const handleSaveArticle = async () => {
    if (!personalizedText.trim()) {
      alert('Please write some content in the Article Content field');
      return;
    }

    if (!selectedQuestion || !selectedOption) {
      alert('Please select a question and answer option. Articles need to be connected to specific quiz answers to be shown to users.');
      return;
    }

    setIsSaving(true);
    try {
      const isEditing = editingArticleId !== null;
      const url = isEditing ? `/api/admin/articles/${editingArticleId}` : '/api/admin/articles';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title || generatedArticle?.title || 'Custom Article',
          content: personalizedText,
          type: generatedArticle ? 'ai_generated' : 'static',
          category: generatedArticle?.category || 'general',
          tags: generatedArticle?.tags || [],
          // Customization fields
          subtitle,
          backgroundColor,
          textColor,
          iconColor,
          accentColor,
          iconType,
          showIcon,
          showStatistic,
          statisticText,
          statisticValue,
          ctaText,
          showCta,
          // Layout and positioning fields
          textAlignment,
          contentPosition,
          backgroundStyle,
          backgroundGradient,
          contentPadding,
          showTopBar,
          topBarColor,
          // Text formatting fields
          titleFontSize,
          titleFontWeight,
          contentFontSize,
          contentFontWeight,
          lineHeight,
          triggers: selectedQuestion ? [{
            questionId: selectedQuestion,
            optionValue: selectedOption,
            condition: {},
            priority: 0,
            isActive: true
          }] : []
        })
      });

      if (response.ok) {
        alert(isEditing ? 'Article updated successfully!' : 'Article saved successfully!');
        router.push(`/admin/quiz-editor/${quizType}`);
      } else {
        const error = await response.json();
        alert(`Failed to ${isEditing ? 'update' : 'save'}: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Failed to save article. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getIconComponent = () => {
    const baseClass = "w-16 h-16";
    
    switch (iconType) {
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

  const getQuizTypeDisplayName = (type: string) => {
    const displayNames: { [key: string]: string } = {
      "financial-profile": "Financial Profile",
      "health-finance": "Health Finance",
      "marriage-finance": "Marriage Finance"
    };
    return displayNames[type] || type;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
          {/* Compact Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push(`/admin/quiz-editor/${quizType}`)}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back</span>
              </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Create Article - {getQuizTypeDisplayName(quizType)}
              </h1>
            </div>
          </div>
                  <button
            onClick={handleSaveArticle}
            disabled={isSaving || !personalizedText.trim() || !selectedQuestion || !selectedOption}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
            {isSaving ? (editingArticleId ? 'Updating...' : 'Saving...') : (editingArticleId ? 'Update Article' : 'Save Article')}
                  </button>
            </div>
          </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-3 gap-8">
            {/* Left Panel - Article Setup */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Article Setup</h2>
                  <button
                  onClick={fetchQuestions}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  title="Refresh questions from quiz editor"
                >
                  🔄
                  </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Question <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedQuestion}
                      onChange={(e) => setSelectedQuestion(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="">Select...</option>
                      {questions.map((q, index) => (
                        <option key={q.id} value={q.id}>
                          Q{index + 1}: {q.prompt.substring(0, 30)}...
                    </option>
                  ))}
                </select>
              </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Answer <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedOption}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                      disabled={!selectedQuestion}
                    >
                      <option value="">Select...</option>
                      {selectedQuestion && questions.find(q => q.id === selectedQuestion)?.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                </div>

                    <button
                      onClick={handleGenerateArticle}
                  disabled={isGenerating || (!selectedQuestion || !selectedOption)}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                  {isGenerating ? 'Generating...' : 'Generate AI Article'}
                    </button>

                {/* Content Fields */}
                <div className="space-y-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Title
                    </label>
                    <input
                      type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                        placeholder="Article title..."
                    />
                  </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Subtitle
                    </label>
                    <input
                      type="text"
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                        placeholder="Financial Guidance"
                    />
                  </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      value={personalizedText}
                      onChange={(e) => setPersonalizedText(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                      rows={4}
                      placeholder="Write content here or generate AI content first..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Visual Settings and Live Preview */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Visual Settings</h2>
              
              <div className="space-y-3">
                  <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Icon Type
                  </label>
                  <select
                    value={iconType}
                    onChange={(e) => setIconType(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="document">📄 Document</option>
                    <option value="chart">📊 Chart</option>
                    <option value="heart">❤️ Heart</option>
                    <option value="star">⭐ Star</option>
                    <option value="lightbulb">💡 Lightbulb</option>
                    <option value="target">🎯 Target</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showIcon"
                      checked={showIcon}
                      onChange={(e) => setShowIcon(e.target.checked)}
                      className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="showIcon" className="text-xs text-gray-700">
                      Show Icon
                    </label>
            </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showStatistic"
                      checked={showStatistic}
                      onChange={(e) => setShowStatistic(e.target.checked)}
                      className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="showStatistic" className="text-xs text-gray-700">
                      Show Statistic
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showCta"
                    checked={showCta}
                    onChange={(e) => setShowCta(e.target.checked)}
                    className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="showCta" className="text-xs text-gray-700">
                    Show CTA
                  </label>
                  </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Colors
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-1">
                    <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer border border-gray-300"
                        />
                        <span className="text-xs text-gray-600">BG</span>
                  </div>
                      <div className="flex items-center space-x-1">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer border border-gray-300"
                        />
                        <span className="text-xs text-gray-600">Text</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <input
                          type="color"
                          value={iconColor}
                          onChange={(e) => setIconColor(e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer border border-gray-300"
                        />
                        <span className="text-xs text-gray-600">Icon</span>
                    </div>
                      <div className="flex items-center space-x-1">
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer border border-gray-300"
                        />
                        <span className="text-xs text-gray-600">Accent</span>
                </div>
                    </div>
                  </div>
                  </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Statistics
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={statisticValue}
                        onChange={(e) => setStatisticValue(e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                        placeholder="75%"
                      />
                      <input
                        type="text"
                        value={statisticText}
                        onChange={(e) => setStatisticText(e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                        placeholder="of people..."
                    />
                  </div>
                  </div>
                  </div>

                  <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    CTA Text
                    </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                    placeholder="CONTINUE"
                    />
                  </div>
                      </div>
                    </div>

            {/* Live Preview */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Live Preview</h2>
              
              <div 
                className="rounded-lg shadow-lg min-h-[400px] flex flex-col"
                style={backgroundStyle === 'gradient' && backgroundGradient ? { background: backgroundGradient } : { backgroundColor }}
              >
                {/* Header */}
                {showTopBar && (
                  <div className="flex items-center justify-center p-4" style={{ backgroundColor: topBarColor }}>
                    <div className="flex items-center space-x-3">
                      <button className="flex items-center space-x-2" style={{ color: '#ffffff' }}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                      <div className="text-lg font-bold" style={{ color: '#ffffff' }}>BRIGHTNEST</div>
                      <div className="px-3 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: accentColor }}>
                        FINANCIAL
                      </div>
                    </div>
                      </div>
                    )}

                {/* Main Content */}
                <div className={`flex-1 flex flex-col ${
                  contentPadding === 'compact' ? 'p-4' : 
                  contentPadding === 'spacious' ? 'p-8' : 'p-6'
                } items-center ${
                  contentPosition === 'top' ? 'justify-start' :
                  contentPosition === 'bottom' ? 'justify-end' :
                  'justify-center'
                }`}>
                  {/* Content Block - All elements aligned together */}
                  <div className="w-full max-w-md">
                    {/* Icon */}
                    {showIcon && (
                      <div className={`mb-6 ${
                        textAlignment === 'left' ? 'flex justify-start' :
                        textAlignment === 'right' ? 'flex justify-end' :
                        'flex justify-center'
                      }`}>
                        {getIconComponent()}
                      </div>
                    )}

                    {/* Title */}
                    <h1 
                      className={`${getTitleSizeClass(titleFontSize)} ${getTitleWeightClass(titleFontWeight)} mb-3 ${getLineHeightClass(lineHeight)} w-full ${
                        textAlignment === 'left' ? 'text-left' :
                        textAlignment === 'right' ? 'text-right' :
                        'text-center'
                      }`}
                      style={{ color: textColor }}
                    >
                      {title || 'ARTICLE TITLE'}
                    </h1>

                    {/* Subtitle */}
                    {subtitle && (
                      <p 
                        className={`${getContentSizeClass(contentFontSize)} ${getContentWeightClass(contentFontWeight)} mb-6 opacity-80 w-full ${getLineHeightClass(lineHeight)} ${
                          textAlignment === 'left' ? 'text-left' :
                          textAlignment === 'right' ? 'text-right' :
                          'text-center'
                        }`}
                        style={{ color: textColor }}
                      >
                        {subtitle}
                      </p>
                    )}

                    {/* Content */}
                    <div className="w-full mb-6">
                      {personalizedText ? (
                        <p 
                          className={`${getContentSizeClass(contentFontSize)} ${getContentWeightClass(contentFontWeight)} ${getLineHeightClass(lineHeight)} mb-4 w-full ${
                            textAlignment === 'left' ? 'text-left' :
                            textAlignment === 'right' ? 'text-right' :
                            'text-center'
                          }`}
                          style={{ color: textColor }}
                        >
                          {personalizedText
                            .replace(/\{\{name\}\}/g, '{{name}}')
                            .replace(/\{\{email\}\}/g, '{{email}}')
                            .replace(/\{\{answer\}\}/g, '{{answer}}')
                            .substring(0, 200) + (personalizedText.length > 200 ? '...' : '')
                          }
                        </p>
                      ) : (
                        <div className={`${
                          textAlignment === 'left' ? 'text-left' :
                          textAlignment === 'right' ? 'text-right' :
                          'text-center'
                        }`}>
                          <div className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: iconColor }}>
                            <svg fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                            </svg>
                          </div>
                          <p className="text-sm opacity-60" style={{ color: textColor }}>
                            Write your content in the Article Content field above
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Statistic */}
                    {showStatistic && (
                      <div className={`w-full mb-6 ${
                        textAlignment === 'left' ? 'text-left' :
                        textAlignment === 'right' ? 'text-right' :
                        'text-center'
                      }`}>
                        <div className="text-4xl font-bold mb-2 w-full" style={{ color: accentColor }}>
                          {statisticValue}
                        </div>
                        <div className="text-sm w-full" style={{ color: textColor }}>
                          {statisticText}
                        </div>
                      </div>
                    )}

                    {/* CTA Button */}
                    {showCta && (
                      <button
                        className="w-full py-4 rounded-lg font-bold text-white transition-colors"
                        style={{ backgroundColor: accentColor }}
                      >
                        {ctaText}
                      </button>
                    )}
                    </div>
                  </div>
              </div>
            </div>
          </div>

          {/* Third Column - Layout & Positioning Settings */}
          <div className="space-y-4">
            {/* Layout & Positioning Settings */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Layout & Positioning</h2>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Text Align
                    </label>
                    <select
                      value={textAlignment}
                      onChange={(e) => setTextAlignment(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <select
                      value={contentPosition}
                      onChange={(e) => setContentPosition(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="top">Top</option>
                      <option value="center">Center</option>
                      <option value="bottom">Bottom</option>
                    </select>
                    </div>
                  </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Background
                  </label>
                  <select
                    value={backgroundStyle}
                    onChange={(e) => setBackgroundStyle(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="solid">Solid</option>
                    <option value="gradient">Gradient</option>
                  </select>
                    </div>

                {backgroundStyle === 'gradient' && (
                    <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Gradient CSS
                      </label>
                      <input
                        type="text"
                      value={backgroundGradient}
                      onChange={(e) => setBackgroundGradient(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                      placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      />
                    </div>
                    )}

                <div className="grid grid-cols-2 gap-2">
                    <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Padding
                      </label>
                    <select
                      value={contentPadding}
                      onChange={(e) => setContentPadding(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="compact">Compact</option>
                      <option value="normal">Normal</option>
                      <option value="spacious">Spacious</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showTopBar"
                      checked={showTopBar}
                      onChange={(e) => setShowTopBar(e.target.checked)}
                      className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="showTopBar" className="ml-2 block text-xs text-gray-700">
                      Top Bar
                    </label>
                  </div>
                    </div>

                {showTopBar && (
                    <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Top Bar Color
                      </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={topBarColor}
                        onChange={(e) => setTopBarColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={topBarColor}
                        onChange={(e) => setTopBarColor(e.target.value)}
                        className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                        placeholder="#1f2937"
                      />
                    </div>
                  </div>
                )}

                {/* Text Formatting Options */}
                <div className="border-t pt-3 mt-3">
                  <h3 className="text-sm font-medium text-gray-800 mb-3">Text Formatting</h3>
                  
                  <div className="space-y-3">
                    {/* Title Formatting */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Title Size
                        </label>
                        <select
                          value={titleFontSize}
                          onChange={(e) => setTitleFontSize(e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                        >
                          <option value="small">Small</option>
                          <option value="normal">Normal</option>
                          <option value="large">Large</option>
                          <option value="xlarge">Extra Large</option>
                        </select>
                        </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Title Weight
                        </label>
                        <select
                          value={titleFontWeight}
                          onChange={(e) => setTitleFontWeight(e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                        >
                          <option value="normal">Normal</option>
                          <option value="medium">Medium</option>
                          <option value="semibold">Semi Bold</option>
                          <option value="bold">Bold</option>
                          <option value="extrabold">Extra Bold</option>
                        </select>
                      </div>
                    </div>

                    {/* Content Formatting */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Content Size
                        </label>
                        <select
                          value={contentFontSize}
                          onChange={(e) => setContentFontSize(e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                        >
                          <option value="small">Small</option>
                          <option value="normal">Normal</option>
                          <option value="large">Large</option>
                        </select>
                  </div>
                      
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Content Weight
                        </label>
                        <select
                          value={contentFontWeight}
                          onChange={(e) => setContentFontWeight(e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                        >
                          <option value="light">Light</option>
                          <option value="normal">Normal</option>
                          <option value="medium">Medium</option>
                          <option value="semibold">Semi Bold</option>
                        </select>
                      </div>
                    </div>

                    {/* Line Height */}
                      <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Line Height
                      </label>
                      <select
                        value={lineHeight}
                        onChange={(e) => setLineHeight(e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                      >
                        <option value="tight">Tight</option>
                        <option value="normal">Normal</option>
                        <option value="relaxed">Relaxed</option>
                        <option value="loose">Loose</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}