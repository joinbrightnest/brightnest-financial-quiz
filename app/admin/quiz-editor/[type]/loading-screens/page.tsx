"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DragDropUpload from "@/components/DragDropUpload";

interface LoadingScreenEditorProps {
  params: Promise<{
    type: string;
  }>;
}

export default function LoadingScreenEditor({ params }: LoadingScreenEditorProps) {
  const router = useRouter();
  const [quizType, setQuizType] = useState<string>('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingScreenId, setLoadingScreenId] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form fields
  const [title, setTitle] = useState("ANALYZING YOUR RESPONSES");
  const [subtitle, setSubtitle] = useState("Please wait while we analyze your answers");
  const [progressText, setProgressText] = useState("CALCULATING YOUR RESULTS...");
  const [personalizedText, setPersonalizedText] = useState("Hi there, we're processing your responses...");
  const [duration, setDuration] = useState(4000);
  const [iconType, setIconType] = useState("puzzle-4");
  const [animationStyle, setAnimationStyle] = useState("spin");
  const [backgroundColor, setBackgroundColor] = useState("#f0f9ff");
  const [textColor, setTextColor] = useState("#1e293b");
  const [iconColor, setIconColor] = useState("#06b6d4");
  const [progressBarColor, setProgressBarColor] = useState("#ef4444");
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [showTopBar, setShowTopBar] = useState<boolean>(true);
  const [topBarColor, setTopBarColor] = useState<string>('#1f2937');
  const [triggerQuestionId, setTriggerQuestionId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [dots, setDots] = useState("");
  
  // Image fields
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageAlt, setImageAlt] = useState<string>('');
  const [showImage, setShowImage] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Handle async params and URL parameters
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setQuizType(resolvedParams.type);
      
      // Check for loading screen ID in URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');
      if (id) {
        setLoadingScreenId(id);
        setIsEditing(true);
      }
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (quizType) {
      fetchQuestions();
      if (isEditing && loadingScreenId) {
        fetchLoadingScreen();
      } else {
        setIsLoading(false);
      }
    }
  }, [quizType, isEditing, loadingScreenId]);

  // Animate dots
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(dotsInterval);
  }, []);

  // Update text based on progress
  useEffect(() => {
    if (testProgress <= 33) {
      setCurrentTextIndex(0);
    } else if (testProgress <= 66) {
      setCurrentTextIndex(1);
    } else {
      setCurrentTextIndex(2);
    }
  }, [testProgress]);

  // Listen for localStorage changes to refresh questions when quiz editor updates them
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `quiz-questions-${quizType}` && e.newValue) {
        try {
          const updatedQuestions = JSON.parse(e.newValue);
          setQuestions(updatedQuestions);
        } catch (error) {
          console.error('Failed to parse updated questions:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [quizType]);

  // Refresh questions when window gains focus (when user comes back from quiz editor)
  useEffect(() => {
    const handleFocus = () => {
      if (quizType) {
        fetchQuestions();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [quizType]);

  const fetchQuestions = async () => {
    try {
      // First, try to get questions from localStorage (current state from quiz editor)
      const cachedQuestions = localStorage.getItem(`quiz-questions-${quizType}`);
      if (cachedQuestions) {
        try {
          const parsedQuestions = JSON.parse(cachedQuestions);
          // Using cached questions from localStorage
          setQuestions(parsedQuestions);
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
      console.error("Error fetching questions:", error);
    }
  };

  const fetchLoadingScreen = async () => {
    try {
      const response = await fetch(`/api/admin/loading-screens/${loadingScreenId}`);
      if (response.ok) {
        const data = await response.json();
        const screen = data.loadingScreen;
        
        // Pre-populate form with existing data
        setTitle(screen.title || "ANALYZING YOUR RESPONSES");
        setSubtitle(screen.subtitle || "Please wait while we analyze your answers");
        setProgressText(screen.progressText || "CALCULATING YOUR RESULTS...");
        setPersonalizedText(screen.personalizedText || "Hi there, we're processing your responses...");
        setDuration(screen.duration || 4000);
        setIconType(screen.iconType || "puzzle-4");
        setAnimationStyle(screen.animationStyle || "spin");
        setBackgroundColor(screen.backgroundColor || "#f0f9ff");
        setTextColor(screen.textColor || "#1e293b");
        setIconColor(screen.iconColor || "#06b6d4");
        setProgressBarColor(screen.progressBarColor || "#ef4444");
        setShowProgressBar(screen.showProgressBar !== undefined ? screen.showProgressBar : true);
        setShowTopBar(screen.showTopBar !== false);
        setTopBarColor(screen.topBarColor || '#1f2937');
        setTriggerQuestionId(screen.triggerQuestionId || "");
        
        // Image fields
        setImageUrl(screen.imageUrl || '');
        setImageAlt(screen.imageAlt || '');
        setShowImage(screen.showImage || false);
      } else {
        console.error("Failed to fetch loading screen");
      }
    } catch (error) {
      console.error("Error fetching loading screen:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = () => {
    setIsTesting(true);
    setTestProgress(0);
    
    // Create realistic variable-speed data processing
    const startTime = Date.now();
    let lastProgress = 0;
    let currentSpeed = 1;
    let nextSpeedChange = Math.random() * 500 + 300; // Change speed every 300-800ms
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      
      // Randomly change speed at intervals
      if (elapsed > nextSpeedChange) {
        // More dramatic speed changes: 0.5x to 1.8x
        currentSpeed = 0.5 + Math.random() * 1.3;
        nextSpeedChange = elapsed + (Math.random() * 600 + 400); // Next change in 400-1000ms
      }
      
      // Calculate progress increment with current speed
      const baseIncrement = (100 / duration) * 50; // Base progress per 50ms
      const increment = baseIncrement * currentSpeed;
      lastProgress += increment;
      
      // Make sure we don't overshoot
      const maxProgress = (elapsed / duration) * 100;
      lastProgress = Math.min(lastProgress, maxProgress);
      
      // Ensure we reach 100% at the end
      if (elapsed >= duration) {
        setTestProgress(100);
        clearInterval(interval);
        setTimeout(() => {
          setIsTesting(false);
          setTestProgress(0);
        }, 300);
      } else {
        setTestProgress(Math.min(lastProgress, 99));
      }
    }, 50);
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setImageUrl(result.imageUrl);
        setImageAlt(file.name.split('.')[0]); // Use filename as default alt text
        setShowImage(true);
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setImageAlt('');
    setShowImage(false);
  };

  const handleSave = async () => {
    // Validate that a question is selected
    if (!triggerQuestionId) {
      alert('Please select a question to show this loading screen after.');
      return;
    }

    setIsSaving(true);
    try {
      const url = isEditing 
        ? `/api/admin/loading-screens/${loadingScreenId}`
        : '/api/admin/loading-screens';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
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
          showTopBar,
          topBarColor,
          triggerQuestionId,
          // Image fields
          imageUrl,
          imageAlt,
          showImage,
          isActive: true
        })
      });

      if (response.ok) {
        alert(`Loading screen ${isEditing ? 'updated' : 'created'} successfully!`);
        router.back();
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

  const loadingTexts = [
    "Analyzing responses",
    "Processing your unique profile",
    "Preparing results"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit' : 'Create'} Loading Screen - {getQuizTypeDisplayName(quizType)}
              </h1>
              <p className="text-sm text-gray-500">
                {isLoading ? 'Loading...' : 'Customize your loading screen with live preview'}
              </p>
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

      <div className="max-w-7xl mx-auto p-4 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading loading screen data...</p>
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-8 h-[calc(100vh-120px)]">
          {/* Left Panel - Settings */}
          <div className="space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Content Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Headline Text
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                    rows={3}
                    placeholder="Hi there, we're processing your responses..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use {`{{name}}`} or {`{{answer}}`} for personalization
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                    placeholder="CALCULATING YOUR RESULTS..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Duration: {(duration / 1000).toFixed(1)}s
                    </label>
                    <button
                      onClick={handleTest}
                      disabled={isTesting}
                      className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50"
                    >
                      {isTesting ? 'Testing...' : 'Test'}
                    </button>
                  </div>
                  <input
                    type="range"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    min="1000"
                    max="10000"
                    step="500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1s</span>
                    <span>10s</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Visual Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Animated Icon
                  </label>
                  <select
                    value={iconType}
                    onChange={(e) => setIconType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  >
                    <option value="spin">Spin</option>
                    <option value="pulse">Pulse</option>
                    <option value="bounce">Bounce</option>
                  </select>
                </div>

                {/* Image Upload Section */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium text-gray-800 mb-3">Image Upload</h3>
                  
                  <div className="space-y-3">
                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Image
                      </label>
                      <DragDropUpload
                        onUpload={handleImageUpload}
                        isUploading={isUploading}
                        accept="image/*"
                        maxSize={5}
                      />
                    </div>

                    {/* Show Image Toggle */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="showImage"
                        checked={showImage}
                        onChange={(e) => setShowImage(e.target.checked)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <label htmlFor="showImage" className="text-sm font-medium text-gray-700">
                        Show Image
                      </label>
                    </div>

                    {/* Image Alt Text */}
                    {showImage && imageUrl && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Alt Text (for accessibility)
                        </label>
                        <input
                          type="text"
                          value={imageAlt}
                          onChange={(e) => setImageAlt(e.target.value)}
                          placeholder="Describe the image..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                        />
                      </div>
                    )}

                    {/* Image Preview */}
                    {showImage && imageUrl && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preview
                        </label>
                        <div className="relative">
                          <img
                            src={imageUrl}
                            alt={imageAlt}
                            className="w-full h-32 object-cover rounded border"
                          />
                          <button
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
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

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="showTopBar"
                    checked={showTopBar}
                    onChange={(e) => setShowTopBar(e.target.checked)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="showTopBar" className="text-sm font-medium text-gray-700">
                    Show Top Bar
                  </label>
                </div>

                {showTopBar && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Top Bar Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={topBarColor}
                        onChange={(e) => setTopBarColor(e.target.value)}
                        className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={topBarColor}
                        onChange={(e) => setTopBarColor(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded text-gray-900"
                      />
                    </div>
                  </div>
                )}

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
                      Progress Bar
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={progressBarColor}
                        onChange={(e) => setProgressBarColor(e.target.value)}
                        className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={progressBarColor}
                        onChange={(e) => setProgressBarColor(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Trigger Settings</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Show After Question <span className="text-red-500">*</span>
                </label>
              <select
                value={triggerQuestionId}
                onChange={(e) => setTriggerQuestionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                required
              >
                  <option value="">Select a question...</option>
                  {questions.map((q, index) => (
                    <option key={q.id} value={q.id}>
                      Question {index + 1}: {q.prompt.substring(0, 50)}...
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="sticky top-4 h-fit">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Live Preview</h2>
              
              <div 
                className={`rounded-2xl shadow-2xl flex flex-col min-h-[500px] transition-all ${
                  isTesting ? 'ring-4 ring-orange-500 ring-opacity-50 scale-105' : ''
                }`}
                style={{ backgroundColor }}
              >
                {showTopBar && (
                  <div className="flex items-center justify-center p-4" style={{ backgroundColor: topBarColor }}>
                    <h1 className="text-white text-xl font-bold tracking-wide">BrightNest</h1>
                  </div>
                )}
                
                <div className="flex flex-col items-center justify-center p-8 text-center flex-1">
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
                    {personalizedText
                      .replace(/\{\{name\}\}/g, 'John')
                      .replace(/\{\{answer\}\}/g, 'financial planning')}
                  </p>
                )}
                
                {showProgressBar && (
                  <div className="mt-8">
                    {/* Uploaded Image */}
                    {showImage && imageUrl && (
                      <div className="mb-6 flex justify-center">
                        <img
                          src={imageUrl}
                          alt={imageAlt}
                          className="max-w-full h-auto rounded-lg shadow-sm"
                          style={{ maxHeight: '200px' }}
                        />
                      </div>
                    )}
                    
                    {/* Icon/Symbol */}
                    <div className="mb-4 flex justify-center">{getIconComponent()}</div>
                    
                    {/* Loading Text */}
                    <p
                      className="text-lg font-medium mb-6 tracking-wide text-center"
                      style={{ color: textColor }}
                    >
                      {loadingTexts[currentTextIndex]}{dots}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="flex justify-center">
                      <div 
                        className="relative overflow-hidden rounded-lg" 
                        style={{ 
                          width: '300px', 
                          height: '32px',
                          backgroundColor: '#e4dece'
                        }}
                      >
                        <div
                          className="h-full transition-all duration-300 ease-out rounded-lg"
                          style={{
                            backgroundColor: '#fb513d',
                            width: isTesting ? `${testProgress}%` : '65%',
                          }}
                        />
                        
                        {/* Progress Percentage */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span 
                            className="text-base font-bold"
                            style={{ 
                              color: '#191717',
                              fontWeight: '600'
                            }}
                          >
                            {isTesting ? `${Math.round(testProgress)}%` : '65%'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
