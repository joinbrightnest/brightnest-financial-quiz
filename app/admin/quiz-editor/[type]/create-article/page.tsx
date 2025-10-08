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
    }
  }, [quizType]);

  // Refresh questions when window gains focus (user comes back from quiz editor)
  useEffect(() => {
    const handleFocus = () => {
      if (quizType) {
        console.log('Window focused, refreshing questions...');
        fetchQuestions();
      }
    };

    // Listen for localStorage changes (when quiz editor updates questions)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `quiz-questions-${quizType}` && e.newValue) {
        try {
          const newQuestions = JSON.parse(e.newValue);
          console.log('Questions updated from localStorage:', newQuestions);
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
      console.log('Fetching questions for quiz type:', quizType);
      
      // First, try to get questions from localStorage (current state from quiz editor)
      const cachedQuestions = localStorage.getItem(`quiz-questions-${quizType}`);
      if (cachedQuestions) {
        try {
          const parsedQuestions = JSON.parse(cachedQuestions);
          console.log('Using cached questions from localStorage:', parsedQuestions);
          setQuestions(parsedQuestions);
          setIsLoading(false);
          return;
        } catch (e) {
          console.log('Failed to parse cached questions, falling back to API');
        }
      }
      
      // Fallback to API if no cached data
      const response = await fetch(`/api/admin/quiz-questions?quizType=${quizType}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched questions from API:', data.questions);
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
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
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
        alert('Article saved successfully!');
        router.push(`/admin/quiz-editor/${quizType}`);
      } else {
        const error = await response.json();
        alert(`Failed to save: ${error.error || 'Unknown error'}`);
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
          {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push(`/admin/quiz-editor/${quizType}`)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back to Quiz Editor</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create AI Article - {getQuizTypeDisplayName(quizType)}
              </h1>
              <p className="text-sm text-gray-500">
                Generate and customize personalized insights for quiz answers
              </p>
            </div>
          </div>
              <button
            onClick={handleSaveArticle}
            disabled={isSaving || !personalizedText.trim() || !selectedQuestion || !selectedOption}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
              >
            {isSaving ? 'Saving...' : 'Save Article'}
              </button>
            </div>
          </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-2 gap-8">
            {/* Left Panel - Configuration */}
          <div className="space-y-6">
            {/* Article Generation */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Article Generation</h2>
                  <button
                  onClick={fetchQuestions}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Refresh questions from quiz editor"
                >
                  🔄 Refresh
                  </button>
              </div>

              <div className="space-y-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Question <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">({questions.length} questions loaded)</span>
                </label>
                <select
                  value={selectedQuestion}
                    onChange={(e) => setSelectedQuestion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Select a question...</option>
                    {questions.map((q, index) => (
                      <option key={q.id} value={q.id}>
                        Question {index + 1}: {q.prompt.substring(0, 50)}...
                      </option>
                    ))}
                </select>
              </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Answer Option <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    disabled={!selectedQuestion}
                  >
                    <option value="">Select an answer...</option>
                    {selectedQuestion && questions.find(q => q.id === selectedQuestion)?.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                    <button
                      onClick={handleGenerateArticle}
                  disabled={isGenerating || (!selectedQuestion || !selectedOption)}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
                    >
                  {isGenerating ? 'Generating...' : 'Generate AI Article'}
                    </button>
              </div>
            </div>

            {/* Content Customization */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Content Settings</h2>
              
              <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Article Title
                    </label>
                    <input
                      type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Article title will be generated..."
                    />
                  </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle
                    </label>
                    <input
                      type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Financial Guidance"
                    />
                  </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Article Content
                  </label>
                  <textarea
                    value={personalizedText}
                    onChange={(e) => setPersonalizedText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    rows={8}
                    placeholder="Write your article content here, or generate AI content first. Use {{name}} or {{answer}} for personalization."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Write your own content here, or generate AI content first. Articles must be connected to specific quiz answers to be shown to users.
                  </p>
            </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statistic Value
                    </label>
                    <input
                      type="text"
                      value={statisticValue}
                      onChange={(e) => setStatisticValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="75%"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statistic Text
                    </label>
                    <input
                      type="text"
                      value={statisticText}
                      onChange={(e) => setStatisticText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="of people face similar challenges"
                    />
                  </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call-to-Action Text
                    </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="CONTINUE"
                    />
                  </div>
                      </div>
                    </div>

            {/* Visual Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Visual Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon Type
                  </label>
                  <select
                    value={iconType}
                    onChange={(e) => setIconType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="document">📄 Document</option>
                    <option value="chart">📊 Chart</option>
                    <option value="heart">❤️ Heart</option>
                    <option value="star">⭐ Star</option>
                    <option value="lightbulb">💡 Lightbulb</option>
                    <option value="target">🎯 Target</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="showIcon"
                    checked={showIcon}
                    onChange={(e) => setShowIcon(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="showIcon" className="text-sm font-medium text-gray-700">
                    Show Icon
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="showStatistic"
                    checked={showStatistic}
                    onChange={(e) => setShowStatistic(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="showStatistic" className="text-sm font-medium text-gray-700">
                    Show Statistic
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="showCta"
                    checked={showCta}
                    onChange={(e) => setShowCta(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="showCta" className="text-sm font-medium text-gray-700">
                    Show Call-to-Action Button
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded text-gray-900"
                      />
                    </div>
                  </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text
                      </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded text-gray-900"
                      />
                    </div>
                  </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon
                      </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={iconColor}
                        onChange={(e) => setIconColor(e.target.value)}
                        className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={iconColor}
                        onChange={(e) => setIconColor(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded text-gray-900"
                      />
                    </div>
                  </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accent/Button
                      </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
                        </div>
                      </div>

          {/* Right Panel - Live Preview */}
          <div className="sticky top-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Live Preview</h2>
              
              <div 
                className="rounded-2xl shadow-2xl p-8 text-center min-h-[600px] flex flex-col"
                style={{ backgroundColor }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <button className="flex items-center space-x-2 text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    </button>
                  <div className="text-lg font-bold" style={{ color: textColor }}>BRIGHTNEST</div>
                  <div className="px-3 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: accentColor }}>
                    FINANCIAL
                  </div>
                </div>

                {/* Icon */}
                {showIcon && (
                  <div className="mb-6 flex justify-center">
                    {getIconComponent()}
                  </div>
                )}

                {/* Title */}
                <h1 
                  className="text-2xl font-bold mb-3 leading-tight"
                  style={{ color: textColor }}
                >
                  {title || 'ARTICLE TITLE'}
                </h1>

                {/* Subtitle */}
                {subtitle && (
                  <p 
                    className="text-sm mb-6 opacity-80"
                    style={{ color: textColor }}
                  >
                    {subtitle}
                  </p>
                )}

                {/* Content */}
                <div className="flex-1 flex items-center justify-center">
                  {personalizedText ? (
                    <div className="text-left max-w-md">
                      <p 
                        className="text-sm leading-relaxed mb-4"
                        style={{ color: textColor }}
                      >
                        {personalizedText
                          .replace(/\{\{name\}\}/g, 'John')
                          .replace(/\{\{email\}\}/g, 'john@example.com')
                          .replace(/\{\{answer\}\}/g, 'financial planning')
                          .substring(0, 200) + (personalizedText.length > 200 ? '...' : '')
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
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
                  <div className="mb-6">
                    <div className="text-4xl font-bold mb-2" style={{ color: accentColor }}>
                      {statisticValue}
                    </div>
                    <div className="text-sm" style={{ color: textColor }}>
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
    </div>
  );
}