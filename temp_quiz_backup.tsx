"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import QuestionCard from "@/components/QuestionCard";
import TextInput from "@/components/TextInput";
import ArticleDisplayInline from "@/components/ArticleDisplayInline";
import LoadingPageDisplay from "@/components/LoadingPageDisplay";

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
    console.log('Component mounted, params:', params);
    const getParams = async () => {
      try {
        console.log('Attempting to resolve params...');
        const resolvedParams = await params;
        console.log('Resolved params:', resolvedParams);
        setQuizType(resolvedParams.type);
      } catch (error) {
        console.error('Error resolving params:', error);
        // Fallback to extracting from URL
        if (typeof window !== 'undefined') {
          const urlParts = window.location.pathname.split('/');
          const typeFromUrl = urlParts[urlParts.length - 1];
          console.log('Using type from URL:', typeFromUrl);
          setQuizType(typeFromUrl);
        }
      }
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
  const [showLoadingPage, setShowLoadingPage] = useState(false);
  const [userVariables, setUserVariables] = useState<{ [key: string]: string }>({});
  const hasInitiallyLoaded = useRef(false);

  // Function to replace variables in text
  const replaceVariables = (text: string): string => {
    if (!text || typeof text !== 'string') {
      return text || ''; // Return empty string if text is null/undefined
    }
    return text.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
      return userVariables[variableName] || match; // Return the variable value or keep the original if not found
    });
  };

  useEffect(() => {
    console.log('Quiz type changed:', quizType);
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
    
    setIsTransitioning(true);
    setSelectedValue(value);
    
    // Find the answer label for the article
    const answerLabel = currentQuestion?.options.find(opt => opt.value === value)?.label || value;
    
    // Immediately set up the answer for potential article display
    const answerData = {
      questionId: currentQuestion?.id || '',
      answerValue: value,
      answerLabel: answerLabel
    };
    
    try {
      // Check if there's an article for this answer
      const response = await fetch('/api/quiz/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: answerData.questionId,
          answerValue: value,
          answerLabel: answerLabel
        })
      });
      
      const data = await response.json();
      
      // If there are articles, show them
      if (data.articles && data.articles.length > 0) {
        setLastAnswer(answerData);
        setShowArticle(true);
      } else {
        // No articles found, go straight to next question
        await handleNext(value);
      }
    } catch (error) {
      console.error('Error checking for articles:', error);
      // On error, go to next question
      await handleNext(value);
    } finally {
      setIsTransitioning(false);
    }
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

  const handleLoadingPageComplete = async () => {
    try {
      // Clear loading page state - the next question should already be set
      setShowLoadingPage(false);
      setShowArticle(false);
      setLastAnswer(null);
      setSelectedValue(null);
      setTextValue("");
      setIsTransitioning(false);
    } catch (err) {
      setError("Failed to load next question. Please try again.");
      setShowLoadingPage(false);
      setIsTransitioning(false);
    }
  };

  const handleNext = async (providedValue?: string) => {
    const valueToSubmit = currentQuestion?.type === "text" || currentQuestion?.type === "email" 
      ? textValue 
      : providedValue || selectedValue;
      
    if (!valueToSubmit || !sessionId || !currentQuestion) return;

    // Capture text input values as variables
    if (currentQuestion.type === "text" || currentQuestion.type === "email") {
      // Determine variable name based on question prompt or use a default
      let variableName = 'name'; // default
      
      // Try to extract variable name from question prompt
      const prompt = currentQuestion.prompt.toLowerCase();
      if (prompt.includes('name') || prompt.includes('first name')) {
        variableName = 'name';
      } else if (prompt.includes('email')) {
        variableName = 'email';
      } else if (prompt.includes('age')) {
        variableName = 'age';
      } else if (prompt.includes('company')) {
        variableName = 'company';
      }
      
      // Store the variable
      setUserVariables(prev => ({
        ...prev,
        [variableName]: valueToSubmit
      }));
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
        // Check if there's a loading page for the current question (after answering)
        const currentQuestionId = currentQuestion.id;
        try {
          const loadingPageResponse = await fetch(`/api/admin/loading-pages?quizType=${quizType}&questionId=${currentQuestionId}`);
          if (loadingPageResponse.ok) {
            const loadingPageData = await loadingPageResponse.json();
            if (loadingPageData.loadingPages && loadingPageData.loadingPages.length > 0) {
              // Show loading page
              setShowLoadingPage(true);
              // Store the next question data for after loading page
              setCurrentQuestion(data.nextQuestion);
              setQuestionNumber(questionNumber + 1);
              setCanGoBack(true);
              return;
            }
          }
        } catch (loadingError) {
          console.log('Error checking for loading page:', loadingError);
        }
        
        // No loading page, move directly to next question
        setCurrentQuestion(data.nextQuestion);
        setQuestionNumber(questionNumber + 1);
        setCanGoBack(true);
        setSelectedValue(null);
        setTextValue("");
        setShowArticle(false);
        setLastAnswer(null);
      }
    } catch (err) {
      setError("Failed to save answer. Please try again.");
    }
  };

  const handleArticleClose = async () => {
    if (isTransitioning) return; // Prevent multiple clicks
    
    setIsTransitioning(true);
    
    try {
      // Hide article first
      setShowArticle(false);
      setLastAnswer(null);
      
      // Then advance to next question
      if (lastAnswer) {
        await handleNext(lastAnswer.answerValue);
      }
    } finally {
      setIsTransitioning(false);
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

  // Ensure currentQuestion has all required properties
  if (!currentQuestion.prompt || !currentQuestion.options) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Question data is incomplete.</p>
        </div>
      </div>
    );
  }


  // Show loading page if active
  if (showLoadingPage && sessionId) {
    return (
      <LoadingPageDisplay
        quizType={quizType}
        userAnswers={userVariables}
        userName={userVariables.name || 'there'}
        onComplete={handleLoadingPageComplete}
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
      {currentQuestion && (currentQuestion.type === "text" || currentQuestion.type === "email") ? (
        <TextInput
          question={{
            ...currentQuestion,
            prompt: replaceVariables(currentQuestion?.prompt || '')
          }}
          value={textValue}
          onChange={setTextValue}
          onNext={handleNext}
          onBack={handleBack}
          canGoBack={canGoBack}
          currentQuestion={questionNumber}
          totalQuestions={totalQuestions}
        />
      ) : (
        <QuestionCard
          question={{
            ...currentQuestion,
            prompt: replaceVariables(currentQuestion?.prompt || '')
          }}
          currentQuestion={questionNumber}
          totalQuestions={totalQuestions}
          selectedValue={selectedValue}
          onAnswer={handleAnswer}
          onNext={handleNext}
          onBack={handleBack}
          canGoBack={canGoBack}
        />
      )}
    </div>
  );
}
