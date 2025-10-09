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

type QuizState = 'loading' | 'question' | 'article' | 'loading-screen' | 'error' | 'completed';

export default function QuizPage({ params }: QuizPageProps) {
  const router = useRouter();
  
  // Core quiz state
  const [quizType, setQuizType] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // User input state
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [textValue, setTextValue] = useState<string>("");
  const [userVariables, setUserVariables] = useState<{name?: string; email?: string}>({});
  
  // UI state
  const [quizState, setQuizState] = useState<QuizState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  
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

  // Initialize quiz
  useEffect(() => {
    if (!quizType) return;
    
    const initializeQuiz = async () => {
      try {
        const response = await fetch("/api/quiz/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quizType }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to start quiz");
        }
        
        const data = await response.json();
        setSessionId(data.sessionId);
        setCurrentQuestion(data.question);
        setCurrentQuestionIndex(0);
        setTotalQuestions(await getTotalQuestions());
        setCanGoBack(false);
        setQuizState('question');
      } catch (err) {
        console.error('Quiz initialization error:', err);
        setError("Failed to start quiz. Please try again.");
        setQuizState('error');
      }
    };

    initializeQuiz();
  }, [quizType]);

  const getTotalQuestions = async (): Promise<number> => {
    try {
      const response = await fetch(`/api/quiz/questions/count?quizType=${quizType}`);
      if (!response.ok) return 10;
      const data = await response.json();
      return data.count;
    } catch {
      return 10;
    }
  };

  const processAnswer = async (value: string, answerLabel: string) => {
    if (!sessionId || !currentQuestion) return;

    try {
      // Check for articles first
      const articlesResponse = await fetch('/api/quiz/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          answerValue: value,
          answerLabel: answerLabel
        })
      });

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

      // No articles found, save answer and advance
      await saveAnswerAndAdvance(value);
    } catch (error) {
      console.error('Error processing answer:', error);
      setError("Failed to save answer. Please try again.");
      setQuizState('error');
    }
  };

  const saveAnswerAndAdvance = async (value: string) => {
    if (!sessionId || !currentQuestion) return;

    try {
      const answerResponse = await fetch("/api/quiz/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          value: value,
        }),
      });

      if (!answerResponse.ok) {
        throw new Error("Failed to save answer");
      }

      const answerData = await answerResponse.json();

      if (answerData.isComplete) {
        // Quiz completed
        const resultResponse = await fetch("/api/quiz/result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        if (resultResponse.ok) {
          const resultData = await resultResponse.json();
          router.push(`/results/${resultData.resultId}`);
        }
      } else {
        // Check for loading screen
        if (answerData.loadingScreen) {
          setCurrentLoadingScreen(answerData.loadingScreen);
          setPendingNextQuestion(answerData.nextQuestion);
          setQuizState('loading-screen');
        } else {
          // Move to next question
          setCurrentQuestion(answerData.nextQuestion);
          setCurrentQuestionIndex(prev => prev + 1);
          setCanGoBack(true);
          clearInputs();
          setQuizState('question');
        }
      }
    } catch (error) {
      console.error('Error saving answer:', error);
      setError("Failed to save answer. Please try again.");
      setQuizState('error');
    }
  };

  const handleAnswer = async (value: string) => {
    if (!currentQuestion) return;
    
    // Store user variables
    if (currentQuestion.type === "text" && currentQuestion.prompt.toLowerCase().includes("name")) {
      setUserVariables(prev => ({ ...prev, name: value }));
    }
    if (currentQuestion.type === "email") {
      setUserVariables(prev => ({ ...prev, email: value }));
    }
    
    const answerLabel = currentQuestion.options.find(opt => opt.value === value)?.label || value;
    await processAnswer(value, answerLabel);
  };

  const handleTextSubmit = async () => {
    if (!textValue.trim() || !currentQuestion) return;
    
    // Store user variables
    if (currentQuestion.type === "text" && currentQuestion.prompt.toLowerCase().includes("name")) {
      setUserVariables(prev => ({ ...prev, name: textValue }));
    }
    if (currentQuestion.type === "email") {
      setUserVariables(prev => ({ ...prev, email: textValue }));
    }
    
    await processAnswer(textValue, textValue);
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
    if (!lastAnswer) return;
    
    clearAllStates();
    await saveAnswerAndAdvance(lastAnswer.answerValue);
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

  if (quizState === 'question' && currentQuestion) {
    return (
      <div className="min-h-screen bg-white">
        {currentQuestion.type === "text" || currentQuestion.type === "email" ? (
          <TextInput
            question={currentQuestion}
            value={textValue}
            onChange={setTextValue}
            onSubmit={handleTextSubmit}
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
            onBack={handleBack}
            canGoBack={canGoBack}
            userVariables={userVariables}
          />
        )}
      </div>
    );
  }

  return null;
}