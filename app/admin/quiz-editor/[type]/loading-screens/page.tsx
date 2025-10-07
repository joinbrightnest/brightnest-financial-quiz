"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  triggerQuestionId?: string;
  isActive: boolean;
}

interface Question {
  id: string;
  order: number;
  prompt: string;
}

interface LoadingScreenEditorProps {
  params: Promise<{
    type: string;
  }>;
}

export default function LoadingScreenEditor({ params }: LoadingScreenEditorProps) {
  const router = useRouter();
  const [quizType, setQuizType] = useState<string>('');
  const [loadingScreens, setLoadingScreens] = useState<LoadingScreen[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingScreen, setEditingScreen] = useState<LoadingScreen | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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
      fetchLoadingScreens();
      fetchQuestions();
    }
  }, [quizType]);

  const fetchLoadingScreens = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/loading-screens?quizType=${quizType}`);
      if (response.ok) {
        const data = await response.json();
        setLoadingScreens(data.loadingScreens || []);
      }
    } catch (error) {
      console.error("Error fetching loading screens:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const getQuizTypeDisplayName = (type: string) => {
    const displayNames: { [key: string]: string } = {
      "financial-profile": "Financial Profile",
      "health-finance": "Health Finance",
      "marriage-finance": "Marriage Finance"
    };
    return displayNames[type] || type;
  };

  const getQuestionDisplayName = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    return question ? `Question ${question.order}: ${question.prompt.substring(0, 50)}...` : 'Unknown Question';
  };

  const handleCreateNew = () => {
    const newScreen: LoadingScreen = {
      id: `new-${Date.now()}`,
      quizType,
      title: "Loading...",
      subtitle: "Please wait while we process your answer",
      personalizedText: "Hi {{name}}, we're analyzing your response...",
      duration: 3000,
      iconType: "puzzle",
      animationStyle: "spin",
      backgroundColor: "#ffffff",
      textColor: "#000000",
      iconColor: "#3b82f6",
      isActive: true
    };
    setEditingScreen(newScreen);
    setIsCreating(true);
  };

  const handleEdit = (screen: LoadingScreen) => {
    setEditingScreen(screen);
    setIsCreating(false);
  };

  const handleDelete = async (screenId: string) => {
    if (confirm("Are you sure you want to delete this loading screen?")) {
      try {
        const response = await fetch(`/api/admin/loading-screens/${screenId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setLoadingScreens(prev => prev.filter(s => s.id !== screenId));
          alert('Loading screen deleted successfully!');
        } else {
          alert('Failed to delete loading screen. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting loading screen:', error);
        alert('Failed to delete loading screen. Please try again.');
      }
    }
  };

  const handleSave = async () => {
    if (!editingScreen) return;

    try {
      const url = isCreating 
        ? '/api/admin/loading-screens'
        : `/api/admin/loading-screens/${editingScreen.id}`;
      
      const method = isCreating ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingScreen)
      });

      if (response.ok) {
        await fetchLoadingScreens();
        setEditingScreen(null);
        setIsCreating(false);
        alert(isCreating ? 'Loading screen created successfully!' : 'Loading screen updated successfully!');
      } else {
        alert('Failed to save loading screen. Please try again.');
      }
    } catch (error) {
      console.error('Error saving loading screen:', error);
      alert('Failed to save loading screen. Please try again.');
    }
  };

  const getIconComponent = (iconType: string, color: string, animationStyle: string) => {
    const iconClass = `w-16 h-16 ${color} ${getAnimationClass(animationStyle)}`;
    
    switch (iconType) {
      case 'puzzle':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"/>
          </svg>
        );
      case 'gears':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
          </svg>
        );
      case 'brain':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M9.5,2A2.5,2.5 0 0,0 7,4.5A2.5,2.5 0 0,0 9.5,7A2.5,2.5 0 0,0 12,4.5A2.5,2.5 0 0,0 9.5,2M14.5,2A2.5,2.5 0 0,0 12,4.5A2.5,2.5 0 0,0 14.5,7A2.5,2.5 0 0,0 17,4.5A2.5,2.5 0 0,0 14.5,2M9.5,9A2.5,2.5 0 0,0 7,11.5A2.5,2.5 0 0,0 9.5,14A2.5,2.5 0 0,0 12,11.5A2.5,2.5 0 0,0 9.5,9M14.5,9A2.5,2.5 0 0,0 12,11.5A2.5,2.5 0 0,0 14.5,14A2.5,2.5 0 0,0 17,11.5A2.5,2.5 0 0,0 14.5,9M9.5,16A2.5,2.5 0 0,0 7,18.5A2.5,2.5 0 0,0 9.5,21A2.5,2.5 0 0,0 12,18.5A2.5,2.5 0 0,0 9.5,16M14.5,16A2.5,2.5 0 0,0 12,18.5A2.5,2.5 0 0,0 14.5,21A2.5,2.5 0 0,0 17,18.5A2.5,2.5 0 0,0 14.5,16Z"/>
          </svg>
        );
      case 'heart':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5 2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.04L12,21.35Z"/>
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
          </svg>
        );
    }
  };

  const getAnimationClass = (animationStyle: string) => {
    switch (animationStyle) {
      case 'spin':
        return 'animate-spin';
      case 'pulse':
        return 'animate-pulse';
      case 'bounce':
        return 'animate-bounce';
      case 'ping':
        return 'animate-ping';
      default:
        return 'animate-spin';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading screen editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
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
                Loading Screens - {getQuizTypeDisplayName(quizType)}
              </h1>
              <p className="text-sm text-gray-500">Create custom loading screens that appear between quiz questions</p>
            </div>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="font-medium">Add Loading Screen</span>
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Left Panel - Loading Screens List */}
        <div className="w-1/3 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Loading Screens</h2>
            {loadingScreens.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No loading screens yet</h3>
                <p className="text-gray-500 mb-4">Create your first loading screen to add engaging transitions between questions.</p>
                <button
                  onClick={handleCreateNew}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Create Loading Screen
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {loadingScreens.map((screen) => (
                  <div key={screen.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{screen.title}</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(screen)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(screen.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{screen.subtitle}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Duration: {screen.duration}ms</span>
                      <span>Icon: {screen.iconType}</span>
                      {screen.triggerQuestionId && (
                        <span>Trigger: {getQuestionDisplayName(screen.triggerQuestionId)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Editor/Preview */}
        <div className="flex-1">
          {editingScreen ? (
            <div className="flex h-screen">
              {/* Settings Panel */}
              <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    {isCreating ? 'Create Loading Screen' : 'Edit Loading Screen'}
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Basic Settings */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={editingScreen.title}
                        onChange={(e) => setEditingScreen({...editingScreen, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Loading..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subtitle
                      </label>
                      <input
                        type="text"
                        value={editingScreen.subtitle || ''}
                        onChange={(e) => setEditingScreen({...editingScreen, subtitle: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Please wait while we process your answer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Personalized Text
                      </label>
                      <textarea
                        value={editingScreen.personalizedText || ''}
                        onChange={(e) => setEditingScreen({...editingScreen, personalizedText: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        rows={3}
                        placeholder="Hi {{name}}, we're analyzing your response..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use variables like {{name}}, {{email}} to personalize the message
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (milliseconds)
                      </label>
                      <input
                        type="number"
                        value={editingScreen.duration}
                        onChange={(e) => setEditingScreen({...editingScreen, duration: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        min="1000"
                        max="10000"
                        step="500"
                      />
                    </div>

                    {/* Visual Settings */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon Type
                      </label>
                      <select
                        value={editingScreen.iconType}
                        onChange={(e) => setEditingScreen({...editingScreen, iconType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="puzzle">Puzzle Pieces</option>
                        <option value="gears">Gears</option>
                        <option value="brain">Brain</option>
                        <option value="heart">Heart</option>
                        <option value="loading">Loading Spinner</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Animation Style
                      </label>
                      <select
                        value={editingScreen.animationStyle}
                        onChange={(e) => setEditingScreen({...editingScreen, animationStyle: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="spin">Spin</option>
                        <option value="pulse">Pulse</option>
                        <option value="bounce">Bounce</option>
                        <option value="ping">Ping</option>
                      </select>
                    </div>

                    {/* Color Settings */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Background Color
                        </label>
                        <input
                          type="color"
                          value={editingScreen.backgroundColor}
                          onChange={(e) => setEditingScreen({...editingScreen, backgroundColor: e.target.value})}
                          className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Text Color
                        </label>
                        <input
                          type="color"
                          value={editingScreen.textColor}
                          onChange={(e) => setEditingScreen({...editingScreen, textColor: e.target.value})}
                          className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Icon Color
                        </label>
                        <input
                          type="color"
                          value={editingScreen.iconColor}
                          onChange={(e) => setEditingScreen({...editingScreen, iconColor: e.target.value})}
                          className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    {/* Trigger Question */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trigger Question (Optional)
                      </label>
                      <select
                        value={editingScreen.triggerQuestionId || ''}
                        onChange={(e) => setEditingScreen({...editingScreen, triggerQuestionId: e.target.value || undefined})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">No specific trigger (manual activation)</option>
                        {questions.map((question) => (
                          <option key={question.id} value={question.id}>
                            Question {question.order}: {question.prompt.substring(0, 50)}...
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-6">
                      <button
                        onClick={handleSave}
                        className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                      >
                        {isCreating ? 'Create Loading Screen' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingScreen(null);
                          setIsCreating(false);
                        }}
                        className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Panel */}
              <div className="w-1/2 bg-gray-100 flex items-center justify-center">
                <div 
                  className="w-96 h-96 rounded-2xl shadow-2xl flex flex-col items-center justify-center p-8 text-center"
                  style={{ backgroundColor: editingScreen.backgroundColor }}
                >
                  <div className="mb-6">
                    {getIconComponent(editingScreen.iconType, `text-[${editingScreen.iconColor}]`, editingScreen.animationStyle)}
                  </div>
                  <h2 
                    className="text-2xl font-bold mb-2"
                    style={{ color: editingScreen.textColor }}
                  >
                    {editingScreen.title}
                  </h2>
                  {editingScreen.subtitle && (
                    <p 
                      className="text-lg mb-4"
                      style={{ color: editingScreen.textColor }}
                    >
                      {editingScreen.subtitle}
                    </p>
                  )}
                  {editingScreen.personalizedText && (
                    <p 
                      className="text-sm opacity-80"
                      style={{ color: editingScreen.textColor }}
                    >
                      {editingScreen.personalizedText.replace('{{name}}', 'John')}
                    </p>
                  )}
                  <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        backgroundColor: editingScreen.iconColor,
                        width: '60%'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Screen Editor</h3>
                <p className="text-gray-500 mb-6">Select a loading screen to edit or create a new one to get started.</p>
                <button
                  onClick={handleCreateNew}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                >
                  Create New Loading Screen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
