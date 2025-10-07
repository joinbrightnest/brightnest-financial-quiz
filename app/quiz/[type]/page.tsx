"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import QuestionCard from "@/components/QuestionCard";
import TextInput from "@/components/TextInput";
import ArticleDisplayInline from "@/components/ArticleDisplayInline";
import LoadingScreenDisplay from "@/components/LoadingScreenDisplay";

interface Question {
  id: string;
  prompt: string;
  type: string;
  options: Array<{
    label: string;
    value: string;
    weightCategory: string;
    weightValue: number;
  }>;
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
}

interface QuizPageProps {
  params: Promise<{
    type: string;
  }>;
}

export default function QuizPage({ params }: QuizPageProps) {
  const router = useRouter();
  const [quizType, setQuizType] = useState<string>('');

  // Handle async params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setQuizType(resolvedParams.type);
    };
    getParams();
  }, [params]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [textValue, setTextValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [showArticle, setShowArticle] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<{questionId: string, answerValue: string, answerLabel: string} | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const hasInitiallyLoaded = useRef(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [currentLoadingScreen, setCurrentLoadingScreen] = useState<LoadingScreen | null>(null);
  const [pendingNextQuestion, setPendingNextQuestion] = useState<Question | null>(null);
  const [userVariables, setUserVariables] = useState<{name?: string; email?: string}>({});

  useEffect(() => {
    if (!quizType) return; // Wait for quizType to be set
    
    const initializeQuiz = async () => {
      try {
        console.log('Starting quiz for type:', quizType);
        const response = await fetch("/api/quiz/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quizType }),
        });
        
        console.log('Quiz start response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Quiz start failed:', response.status, errorData);
          throw new Error(`Failed to start quiz: ${response.status} ${errorData.error || 'Unknown error'}`);
        }
        
        const data = await response.json();
        console.log('Quiz started successfully:', data);
        setSessionId(data.sessionId);
        setCurrentQuestion(data.question);
        setTotalQuestions(await getTotalQuestions());
        setCanGoBack(false); // Can't go back from first question
        hasInitiallyLoaded.current = true;
        setIsLoading(false);
      } catch (err) {
        console.error('Quiz initialization error:', err);
        setError(`Failed to start quiz. Please try again. Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        hasInitiallyLoaded.current = true;
        setIsLoading(false);
      }
    };

    initializeQuiz();
  }, [quizType]);

  const getTotalQuestions = async (): Promise<number> => {
    try {
      console.log('Getting total questions for quiz type:', quizType);
      const response = await fetch(`/api/quiz/questions/count?quizType=${quizType}`);
      console.log('Questions count response status:', response.status);
      
      if (!response.ok) {
        console.error('Failed to get question count:', response.status);
        return 10; // fallback
      }
      
      const data = await response.json();
      console.log('Total questions:', data.count);
      return data.count;
    } catch (err) {
      console.error('Error getting total questions:', err);
      return 10; // fallback
    }
  };

  const handleAnswer = async (value: string) => {
    if (isTransitioning) return; // Prevent multiple clicks
    
    setSelectedValue(value);
    
    // Store name if this is a text input question for "name"
    if (currentQuestion?.type === "text" && currentQuestion?.prompt.toLowerCase().includes("name")) {
      setUserVariables(prev => ({ ...prev, name: value }));
    }
    
    // Store email if this is an email input question
    if (currentQuestion?.type === "email") {
      setUserVariables(prev => ({ ...prev, email: value }));
    }
    
    // Find the answer label for the article
    const answerLabel = currentQuestion?.options.find(opt => opt.value === value)?.label || value;
    
    // Immediately set up the answer for potential article display
    const answerData = {
      questionId: currentQuestion?.id || '',
      answerValue: value,
      answerLabel: answerLabel
    };
    
    // Check if there's an article for this answer (non-blocking)
    fetch('/api/quiz/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        questionId: answerData.questionId,
        answerValue: value,
        answerLabel: answerLabel
      })
    })
    .then(response => response.json())
    .then(data => {
      // If there are articles, show them
      if (data.articles && data.articles.length > 0) {
        setLastAnswer(answerData);
        setShowArticle(true);
      } else {
        // No articles found, go straight to next question
        handleNext(value);
      }
    })
    .catch(error => {
      console.error('Error checking for articles:', error);
      // On error, go to next question
      handleNext(value);
    });
  };

  const handleBack = async () => {
    if (!sessionId || !currentQuestion || questionNumber <= 1) return;

    try {
      const response = await fetch("/api/quiz/previous", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
      setQuestionNumber(data.questionNumber);
      setCanGoBack(data.questionNumber > 1);
      
      // Set the existing answer if there is one
      if (data.existingAnswer) {
        if (data.question.type === "text" || data.question.type === "email") {
          setTextValue(data.existingAnswer);
          setSelectedValue(null);
        } else {
          setSelectedValue(data.existingAnswer);
          setTextValue("");
        }
      } else {
        setSelectedValue(null);
        setTextValue("");
      }
    } catch (err) {
      setError("Failed to go back to previous question. Please try again.");
    }
  };

  const handleNext = async (providedValue?: string) => {
    const valueToSubmit = currentQuestion?.type === "text" || currentQuestion?.type === "email" 
      ? textValue 
      : providedValue || selectedValue;
      
    if (!valueToSubmit || !sessionId || !currentQuestion) return;

    // Store name if this is a text input question for "name"
    if (currentQuestion?.type === "text" && currentQuestion?.prompt.toLowerCase().includes("name")) {
      setUserVariables(prev => ({ ...prev, name: valueToSubmit }));
    }
    
    // Store email if this is an email input question
    if (currentQuestion?.type === "email") {
      setUserVariables(prev => ({ ...prev, email: valueToSubmit }));
    }

    try {
      const response = await fetch("/api/quiz/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          value: valueToSubmit,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save answer");
      }

      const data = await response.json();

      if (data.isComplete) {
        // Calculate result
        const resultResponse = await fetch("/api/quiz/result", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });

        if (resultResponse.ok) {
          const resultData = await resultResponse.json();
          router.push(`/results/${resultData.resultId}`);
        }
      } else {
        // Check if there's a loading screen to show
        if (data.loadingScreen) {
          setCurrentLoadingScreen(data.loadingScreen);
          setPendingNextQuestion(data.nextQuestion);
          setShowLoadingScreen(true);
        } else {
          // Move to next question directly - set new question first, then clear states
          setCurrentQuestion(data.nextQuestion);
          setQuestionNumber(questionNumber + 1);
          setCanGoBack(true); // Can go back from any question after the first
          
          // Clear states after setting new question
          setShowArticle(false);
          setLastAnswer(null);
          setSelectedValue(null);
          setTextValue("");
        }
      }
    } catch (err) {
      setError("Failed to save answer. Please try again.");
    }
  };

  const handleArticleClose = async () => {
    if (isTransitioning) return; // Prevent multiple clicks
    
    // Advance to next question first, then hide article
    if (lastAnswer) {
      await handleNext(lastAnswer.answerValue);
    }
  };

  const handleLoadingScreenComplete = () => {
    if (pendingNextQuestion) {
      setCurrentQuestion(pendingNextQuestion);
      setQuestionNumber(questionNumber + 1);
      setCanGoBack(true);
      
      // Clear states
      setShowLoadingScreen(false);
      setCurrentLoadingScreen(null);
      setPendingNextQuestion(null);
      setShowArticle(false);
      setLastAnswer(null);
      setSelectedValue(null);
      setTextValue("");
    }
  };

  if (isLoading && !hasInitiallyLoaded.current) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
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

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No questions available.</p>
        </div>
      </div>
    );
  }


  // Show loading screen if we have one
  if (showLoadingScreen && currentLoadingScreen) {
    return (
      <LoadingScreenDisplay
        {...currentLoadingScreen}
        onComplete={handleLoadingScreenComplete}
        userName="User" // TODO: Get actual user name from session if available
        lastAnswer={lastAnswer?.answerLabel || "your response"}
      />
    );
  }

  // Show article display if we have an article to show
  if (showArticle && lastAnswer && sessionId) {
    return (
      <ArticleDisplayInline
        sessionId={sessionId}
        questionId={lastAnswer.questionId}
        answerValue={lastAnswer.answerValue}
        answerLabel={lastAnswer.answerLabel}
        onContinue={handleArticleClose}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {currentQuestion.type === "text" || currentQuestion.type === "email" ? (
        <TextInput
          question={currentQuestion}
          value={textValue}
          onChange={setTextValue}
          onNext={handleNext}
          onBack={handleBack}
          canGoBack={canGoBack}
          currentQuestion={questionNumber}
          totalQuestions={totalQuestions}
          userVariables={userVariables}
        />
      ) : (
        <QuestionCard
          question={currentQuestion}
          currentQuestion={questionNumber}
          totalQuestions={totalQuestions}
          selectedValue={selectedValue}
          onAnswer={handleAnswer}
          onNext={handleNext}
          onBack={handleBack}
          canGoBack={canGoBack}
          userVariables={userVariables}
        />
      )}
    </div>
  );
}
