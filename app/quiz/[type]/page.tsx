"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QuestionCard from "@/components/QuestionCard";
import TextInput from "@/components/TextInput";
import ArticleDisplayWrapper from "@/components/ArticleDisplayWrapper";
import LoadingScreenDisplay from "@/components/LoadingScreenDisplay";

interface Question {
  id: string;
  order: number;
  prompt: string;
  type: string;
  options: Array<{
    label: string;
    value: string;
    weightCategory: string;
    weightValue: number;
  }>;
  skipButton?: boolean;
  continueButton?: boolean;
  continueButtonColor?: string;
  continueButtonText?: string;
}

interface LoadingScreen {
  id: string;
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
  // Image fields
  imageUrl?: string;
  imageAlt?: string;
  showImage?: boolean;
}

interface QuizPageProps {
  params: Promise<{
    type: string;
  }>;
}

type QuizState = 'loading' | 'question' | 'article' | 'loading-screen' | 'error' | 'completed';

export default function QuizPage({ params }: QuizPageProps) {
  const router = useRouter();
  
  // Core quiz state
  const [quizType, setQuizType] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(10); // Default fallback
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // User input state
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [textValue, setTextValue] = useState<string>("");
  const [userVariables, setUserVariables] = useState<{name?: string; email?: string}>({});
  
  // UI state
  const [quizState, setQuizState] = useState<QuizState>('question'); // Start with question state
  const [error, setError] = useState<string | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Article state
  const [articleData, setArticleData] = useState<any>(null);
  const [lastAnswer, setLastAnswer] = useState<{questionId: string, answerValue: string, answerLabel: string} | null>(null);
  
  // Loading screen state
  const [currentLoadingScreen, setCurrentLoadingScreen] = useState<LoadingScreen | null>(null);
  const [pendingNextQuestion, setPendingNextQuestion] = useState<Question | null>(null);

  // Handle async params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setQuizType(resolvedParams.type);
    };
    getParams();
  }, [params]);

  // Handle affiliate parameter from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const affiliateCode = urlParams.get('affiliate');
    
    if (affiliateCode) {
      console.log("🎯 Quiz started with affiliate code from URL:", affiliateCode);
      // Set the affiliate cookie for the quiz system
      document.cookie = `affiliate_ref=${affiliateCode}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
    }
  }, []);

  // Initialize quiz
  useEffect(() => {
    if (!quizType) return;
    
    const initializeQuiz = async () => {
      try {
        // Only use affiliate code if explicitly provided in URL
        // Don't use cookie-based affiliate codes for direct website visits
        const urlParams = new URLSearchParams(window.location.search);
        const affiliateCode = urlParams.get('affiliate');
        
        // Run initialization in parallel for faster loading
        const [sessionResponse, countResponse] = await Promise.all([
          fetch("/api/quiz/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              quizType,
              affiliateCode: affiliateCode || undefined
            }),
          }),
          fetch(`/api/quiz/questions/count?quizType=${quizType}`)
        ]);
        
        if (!sessionResponse.ok) {
          throw new Error("Failed to start quiz");
        }
        
        const sessionData = await sessionResponse.json();
        const countData = countResponse.ok ? await countResponse.json() : { count: 10 };
        
        setSessionId(sessionData.sessionId);
        // Store session ID in localStorage for the analyzing page
        localStorage.setItem('quizSessionId', sessionData.sessionId);
        console.log('Quiz: Stored sessionId in localStorage:', sessionData.sessionId);
        setCurrentQuestion(sessionData.question);
        setCurrentQuestionIndex(0);
        setTotalQuestions(countData.count);
        setCanGoBack(false);
        setIsLoading(false);
      } catch (err) {
        console.error('Quiz initialization error:', err);
        setError("Failed to start quiz. Please try again.");
        setQuizState('error');
        setIsLoading(false);
      }
    };

    initializeQuiz();
  }, [quizType]);


  const processAnswer = async (value: string, answerLabel: string) => {
    if (!sessionId || !currentQuestion) return;

    try {
      // Run articles check and answer save in parallel for maximum speed
      const [articlesResponse, answerResponse] = await Promise.all([
        fetch('/api/quiz/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            questionId: currentQuestion.id,
            answerValue: value,
            answerLabel: answerLabel
          })
        }),
        fetch("/api/quiz/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            questionId: currentQuestion.id,
            value: value,
          }),
        })
      ]);

      // Check articles first (this determines if we show article or advance)
      if (articlesResponse.ok) {
        const articlesData = await articlesResponse.json();
        
        if (articlesData.articles && articlesData.articles.length > 0) {
          setArticleData(articlesData.articles[0]);
          setLastAnswer({
            questionId: currentQuestion.id,
            answerValue: value,
            answerLabel: answerLabel
          });
          setQuizState('article');
          return;
        }
      }

      // No articles found, process the answer response
      if (!answerResponse.ok) {
        throw new Error("Failed to save answer");
      }

      const answerData = await answerResponse.json();

      if (answerData.isComplete) {
        // Quiz completed - redirect to analyzing page first (no alert)
        router.push('/analyzing');
      } else {
        // Check for loading screen
        if (answerData.loadingScreen) {
          setCurrentLoadingScreen(answerData.loadingScreen);
          setPendingNextQuestion(answerData.nextQuestion);
          setQuizState('loading-screen');
        } else {
          // Move to next question immediately
          setCurrentQuestion(answerData.nextQuestion);
          setCurrentQuestionIndex(prev => prev + 1);
          setCanGoBack(true);
          clearInputs();
          setQuizState('question');
        }
      }
    } catch (error) {
      console.error('Error processing answer:', error);
      setError("Failed to save answer. Please try again.");
      setQuizState('error');
    }
  };


  const handleAnswer = async (value: string) => {
    if (!currentQuestion) return;
    
    // Store user variables
    if (currentQuestion.type === "text" && currentQuestion.prompt.toLowerCase().includes("name")) {
      setUserVariables(prev => ({ ...prev, name: value }));
      // Store name in localStorage for analyzing page and Calendly pre-fill
      localStorage.setItem('userName', value);
    }
    if (currentQuestion.type === "email") {
      setUserVariables(prev => ({ ...prev, email: value }));
      // Store email in localStorage for Calendly pre-fill
      localStorage.setItem('userEmail', value);
    }
    
    const answerLabel = currentQuestion.options.find(opt => opt.value === value)?.label || value;
    
    // Immediate visual feedback - set selected value before processing
    setSelectedValue(value);
    
    // If continue button is enabled, don't process answer immediately
    if (currentQuestion.continueButton) {
      return; // Wait for continue button click
    }
    
    await processAnswer(value, answerLabel);
  };

  const handleTextSubmit = async () => {
    if (!textValue.trim() || !currentQuestion) return;
    
    // Store user variables
    if (currentQuestion.type === "text" && currentQuestion.prompt.toLowerCase().includes("name")) {
      setUserVariables(prev => ({ ...prev, name: textValue }));
      // Store name in localStorage for analyzing page
      localStorage.setItem('userName', textValue);
    }
    if (currentQuestion.type === "email") {
      setUserVariables(prev => ({ ...prev, email: textValue }));
    }
    
    // Optimistic UI update - clear inputs immediately for better UX
    clearInputs();
    
    await processAnswer(textValue, textValue);
  };

  const handleSkip = async () => {
    if (!currentQuestion) return;
    
    // Mark as skipped by sending a special value
    await processAnswer("__SKIPPED__", "Skipped");
  };

  const handleContinue = async () => {
    if (!currentQuestion || !selectedValue) return;
    
    const answerLabel = currentQuestion.options.find(opt => opt.value === selectedValue)?.label || selectedValue;
    
    // Clear inputs and process the selected answer
    clearInputs();
    await processAnswer(selectedValue, answerLabel);
  };

  const handleBack = async () => {
    if (!sessionId || !currentQuestion || currentQuestion.order <= 1) return;

    try {
      const response = await fetch("/api/quiz/previous", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          currentQuestionId: currentQuestion.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get previous question");
      }

      const data = await response.json();
      setCurrentQuestion(data.question);
      setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
      setCanGoBack(data.question.order > 1);
      
      // Clear states
      clearAllStates();
      
      // Restore existing answer
      if (data.existingAnswer) {
        if (data.question.type === "text" || data.question.type === "email") {
          setTextValue(data.existingAnswer);
          setSelectedValue(null);
        } else {
          setSelectedValue(data.existingAnswer);
          setTextValue("");
        }
      } else {
        clearInputs();
      }
      
      setQuizState('question');
    } catch (err) {
      setError("Failed to go back to previous question. Please try again.");
      setQuizState('error');
    }
  };

  const handleArticleClose = async () => {
    if (!lastAnswer || !sessionId) return;
    
    try {
      // Save answer and get next question
      const answerResponse = await fetch("/api/quiz/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionId: lastAnswer.questionId,
          value: lastAnswer.answerValue,
        }),
      });

      if (!answerResponse.ok) {
        throw new Error("Failed to save answer");
      }

      const answerData = await answerResponse.json();

      if (answerData.isComplete) {
        // Quiz completed - redirect to analyzing page first (no alert)
        router.push('/analyzing');
      } else {
        // Check for loading screen
        if (answerData.loadingScreen) {
          setCurrentLoadingScreen(answerData.loadingScreen);
          setPendingNextQuestion(answerData.nextQuestion);
          setQuizState('loading-screen');
        } else {
          // Move to next question immediately
          setCurrentQuestion(answerData.nextQuestion);
          setCurrentQuestionIndex(prev => prev + 1);
          setCanGoBack(true);
          clearAllStates();
          setQuizState('question');
        }
      }
    } catch (error) {
      console.error('Error processing answer after article:', error);
      setError("Failed to save answer. Please try again.");
      setQuizState('error');
    }
  };

  const handleLoadingScreenComplete = () => {
    if (pendingNextQuestion) {
      setCurrentQuestion(pendingNextQuestion);
      setCurrentQuestionIndex(prev => prev + 1);
      setCanGoBack(true);
      
      clearAllStates();
      setQuizState('question');
    }
  };

  const clearInputs = () => {
    setSelectedValue(null);
    setTextValue("");
  };

  const clearAllStates = () => {
    clearInputs();
    setLastAnswer(null);
    setArticleData(null);
    setCurrentLoadingScreen(null);
    setPendingNextQuestion(null);
  };

  // Render based on quiz state
  if (quizState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (quizState === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quizState === 'article' && lastAnswer && sessionId && articleData) {
    return (
      <ArticleDisplayWrapper
        sessionId={sessionId}
        questionId={lastAnswer.questionId}
        answerValue={lastAnswer.answerValue}
        answerLabel={lastAnswer.answerLabel}
        onContinue={handleArticleClose}
        articleData={articleData}
      />
    );
  }

  if (quizState === 'loading-screen' && currentLoadingScreen) {
    return (
      <LoadingScreenDisplay
        {...currentLoadingScreen}
        onComplete={handleLoadingScreenComplete}
        userName={userVariables.name || "User"}
        lastAnswer={lastAnswer?.answerLabel || "your response"}
      />
    );
  }

  if (quizState === 'question') {
    // Show loading state only if we're still loading and don't have a question yet
    if (isLoading && !currentQuestion) {
      return (
        <div className="min-h-screen bg-white">
          <div className="bg-gray-800 w-full py-4">
            <div className="max-w-lg mx-auto px-6">
              <h1 className="text-white text-xl font-bold text-center tracking-wide">
                BrightNest
              </h1>
            </div>
          </div>
          <div className="max-w-lg mx-auto px-6 py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-white relative">
        {currentQuestion && (
          <>
            {currentQuestion.type === "text" || currentQuestion.type === "email" ? (
              <TextInput
                question={currentQuestion}
                value={textValue}
                onChange={setTextValue}
                onSubmit={handleTextSubmit}
                onSkip={handleSkip}
                onContinue={handleContinue}
                onBack={handleBack}
                canGoBack={canGoBack}
                currentQuestion={currentQuestionIndex + 1}
                totalQuestions={totalQuestions}
                userVariables={userVariables}
              />
            ) : (
              <QuestionCard
                question={currentQuestion}
                currentQuestion={currentQuestionIndex + 1}
                totalQuestions={totalQuestions}
                selectedValue={selectedValue}
                onAnswer={handleAnswer}
                onSkip={handleSkip}
                onContinue={handleContinue}
                onBack={handleBack}
                canGoBack={canGoBack}
                userVariables={userVariables}
              />
            )}
          </>
        )}
        
        {/* Loading overlay while initializing */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Preparing quiz...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}