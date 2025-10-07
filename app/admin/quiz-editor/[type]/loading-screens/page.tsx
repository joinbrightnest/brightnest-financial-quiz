"use client";

import { useState, useEffect } from "react";

interface LoadingScreenEditorProps {
  params: Promise<{
    type: string;
  }>;
}

export default function LoadingScreenEditor({ params }: LoadingScreenEditorProps) {
  const [quizType, setQuizType] = useState<string>('');
  const [questions, setQuestions] = useState<any[]>([]);
  
  // Form fields
  const [title, setTitle] = useState("ANALYZING YOUR RESPONSES");
  const [subtitle, setSubtitle] = useState("Please wait while we analyze your answers");
  const [progressText, setProgressText] = useState("CALCULATING YOUR RESULTS...");
  const [personalizedText, setPersonalizedText] = useState("Hi {{name}}, we're processing your responses...");
  const [duration, setDuration] = useState(4000);
  const [iconType, setIconType] = useState("puzzle-4");
  const [animationStyle, setAnimationStyle] = useState("spin");
  const [backgroundColor, setBackgroundColor] = useState("#f0f9ff");
  const [textColor, setTextColor] = useState("#1e293b");
  const [iconColor, setIconColor] = useState("#06b6d4");
  const [progressBarColor, setProgressBarColor] = useState("#ef4444");
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [triggerQuestionId, setTriggerQuestionId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
    }
  }, [quizType]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/admin/quiz-questions?quizType=${quizType}`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/loading-screens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizType,
          title,
          subtitle,
          personalizedText,
          duration,
          iconType,
          animationStyle,
          backgroundColor,
          textColor,
          iconColor,
          progressBarColor,
          showProgressBar,
          progressText,
          triggerQuestionId: triggerQuestionId || undefined,
          isActive: true
        })
      });

      if (response.ok) {
        alert('Loading screen created successfully!');
        window.close();
      } else {
        const error = await response.json();
        alert(`Failed to save: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving loading screen:', error);
      alert('Failed to save loading screen. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getIconComponent = () => {
    const baseClass = `w-20 h-20 ${animationStyle === 'spin' ? 'animate-spin' : animationStyle === 'pulse' ? 'animate-pulse' : animationStyle === 'bounce' ? 'animate-bounce' : ''}`;
    
    switch (iconType) {
      case 'puzzle-4':
        return (
          <div className={`${baseClass} relative`} style={{ color: iconColor }}>
            <div className="absolute inset-0 grid grid-cols-2 gap-1">
              <div className="border-2 border-current rounded-tl-lg bg-current opacity-80 animate-pulse" style={{ animationDelay: '0s' }}></div>
              <div className="border-2 border-current rounded-tr-lg bg-current opacity-80 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="border-2 border-current rounded-bl-lg bg-current opacity-80 animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="border-2 border-current rounded-br-lg bg-current opacity-80 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>
          </div>
        );
      case 'emoji-brain':
        return <div className={baseClass} style={{ fontSize: '4rem' }}>🧠</div>;
      case 'emoji-heart':
        return <div className={baseClass} style={{ fontSize: '4rem' }}>❤️</div>;
      case 'emoji-star':
        return <div className={baseClass} style={{ fontSize: '4rem' }}>⭐</div>;
      case 'emoji-rocket':
        return <div className={baseClass} style={{ fontSize: '4rem' }}>🚀</div>;
      default:
        return (
          <svg className={baseClass} fill="currentColor" viewBox="0 0 24 24" style={{ color: iconColor }}>
            <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.close()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back to Quiz Editor</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create Loading Screen - {getQuizTypeDisplayName(quizType)}
              </h1>
              <p className="text-sm text-gray-500">Customize your loading screen with live preview</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Loading Screen'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-2 gap-8">
          {/* Left Panel - Settings */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Content Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Headline Text
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="ANALYZING YOUR RESPONSES"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Please wait while we analyze your answers"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personalized Text
                  </label>
                  <textarea
                    value={personalizedText}
                    onChange={(e) => setPersonalizedText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                    placeholder="Hi {{name}}, we're processing your responses..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use {{name}}, {{email}}, {{answer}} for personalization
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Progress Bar Text
                  </label>
                  <input
                    type="text"
                    value={progressText}
                    onChange={(e) => setProgressText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="CALCULATING YOUR RESULTS..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (milliseconds)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min="1000"
                    max="10000"
                    step="500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Visual Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Animated Icon
                  </label>
                  <select
                    value={iconType}
                    onChange={(e) => setIconType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="puzzle-4">🧩 4-Piece Puzzle</option>
                    <option value="emoji-brain">🧠 Brain</option>
                    <option value="emoji-heart">❤️ Heart</option>
                    <option value="emoji-star">⭐ Star</option>
                    <option value="emoji-rocket">🚀 Rocket</option>
                    <option value="loading">🔄 Spinner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Animation Style
                  </label>
                  <select
                    value={animationStyle}
                    onChange={(e) => setAnimationStyle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="spin">Spin</option>
                    <option value="pulse">Pulse</option>
                    <option value="bounce">Bounce</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="showProgressBar"
                    checked={showProgressBar}
                    onChange={(e) => setShowProgressBar(e.target.checked)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="showProgressBar" className="text-sm font-medium text-gray-700">
                    Show Progress Bar
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background
                    </label>
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text
                    </label>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon
                    </label>
                    <input
                      type="color"
                      value={iconColor}
                      onChange={(e) => setIconColor(e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Progress Bar
                    </label>
                    <input
                      type="color"
                      value={progressBarColor}
                      onChange={(e) => setProgressBarColor(e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Trigger Settings</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Show After Question (Optional)
                </label>
                <select
                  value={triggerQuestionId}
                  onChange={(e) => setTriggerQuestionId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">No specific question</option>
                  {questions.map((q) => (
                    <option key={q.id} value={q.id}>
                      Question {q.order}: {q.prompt.substring(0, 50)}...
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="sticky top-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Live Preview</h2>
              
              <div 
                className="rounded-2xl shadow-2xl flex flex-col items-center justify-center p-8 text-center min-h-[500px]"
                style={{ backgroundColor }}
              >
                <div className="mb-6">
                  {getIconComponent()}
                </div>
                
                <h2 
                  className="text-2xl font-bold mb-3"
                  style={{ color: textColor }}
                >
                  {title}
                </h2>
                
                {subtitle && (
                  <p 
                    className="text-base mb-4"
                    style={{ color: textColor }}
                  >
                    {subtitle}
                  </p>
                )}
                
                {personalizedText && (
                  <p 
                    className="text-sm opacity-80 mb-6"
                    style={{ color: textColor }}
                  >
                    {personalizedText.replace('{{name}}', 'John').replace('{{answer}}', 'financial planning')}
                  </p>
                )}
                
                {showProgressBar && (
                  <div className="w-full max-w-md mt-6">
                    {progressText && (
                      <p 
                        className="text-sm font-semibold mb-3"
                        style={{ color: textColor }}
                      >
                        {progressText}
                      </p>
                    )}
                    <div className="w-full bg-gray-200 rounded-full h-3 relative">
                      <div 
                        className="h-3 rounded-full transition-all duration-1000"
                        style={{ 
                          backgroundColor: progressBarColor,
                          width: '65%'
                        }}
                      ></div>
                      <span 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-semibold"
                        style={{ color: textColor }}
                      >
                        65%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
