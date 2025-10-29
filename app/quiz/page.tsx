"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QuestionCard from "@/components/QuestionCard";
import TextInput from "@/components/TextInput";
import ArticleDisplayWrapper from "@/components/ArticleDisplayWrapper";

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
  skipButton?: boolean;
  continueButton?: boolean;
  continueButtonColor?: string;
}

export default function QuizPage() {
  const router = useRouter();
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
  const [pendingAnswer, setPendingAnswer] = useState<{
    value: string;
    label: string;
  } | null>(null);

  useEffect(() => {
    const initializeQuiz = async () => {
      try {
        // Only use affiliate code if explicitly provided in URL
        // Don't use cookie-based affiliate codes for direct website visits
        const urlParams = new URLSearchParams(window.location.search);
        const affiliateCode = urlParams.get('affiliate');
        
        const response = await fetch("/api/quiz/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            affiliateCode: affiliateCode || undefined
          }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to start quiz");
        }
        
        const data = await response.json();
        setSessionId(data.sessionId);
        setCurrentQuestion(data.question);
        setTotalQuestions(await getTotalQuestions());
        setCanGoBack(false); // Can't go back from first question
        setIsLoading(false);
      } catch (err) {
        setError("Failed to start quiz. Please try again.");
        setIsLoading(false);
      }
    };

    initializeQuiz();
  }, []);

  const getTotalQuestions = async (): Promise<number> => {
    try {
      const response = await fetch("/api/quiz/questions/count");
      const data = await response.json();
      return data.count;
    } catch {
      return 5; // fallback
    }
  };

  const handleAnswer = async (value: string) => {
    setSelectedValue(value);
    
    // Find the answer label
    const option = currentQuestion?.options.find(opt => opt.value === value);
    const answerLabel = option?.label || value;
    
    // Set pending answer and show article
    setPendingAnswer({ value, label: answerLabel });
    setShowArticle(true);
  };

  const handleArticleClose = async () => {
    setShowArticle(false);
    
    // Now advance to next question
    if (pendingAnswer) {
      await handleNext(pendingAnswer.value);
      setPendingAnswer(null);
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

  const handleNext = async (providedValue?: string) => {
    const valueToSubmit = currentQuestion?.type === "text" || currentQuestion?.type === "email" 
      ? textValue 
      : providedValue || selectedValue;
      
    if (!valueToSubmit || !sessionId || !currentQuestion) return;

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
          // Store session ID for analyzing page
          localStorage.setItem('quizSessionId', sessionId);
          router.push('/analyzing');
        }
      } else {
        // Move to next question
        setCurrentQuestion(data.nextQuestion);
        setQuestionNumber(questionNumber + 1);
        setCanGoBack(true); // Can go back from any question after the first
        setSelectedValue(null);
        setTextValue("");
      }
    } catch (err) {
      setError("Failed to save answer. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Skeleton Quiz Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-pulse">
            {/* Progress bar skeleton */}
            <div className="mb-8">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full w-1/12 bg-gradient-to-r from-gray-300 to-gray-200"></div>
              </div>
              <div className="flex justify-between mt-2">
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Question skeleton */}
            <div className="mb-8">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>

            {/* Options skeleton */}
            <div className="space-y-3 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl border-2 border-gray-200"></div>
              ))}
            </div>

            {/* Button skeleton */}
            <div className="flex justify-between items-center">
              <div className="h-12 w-24 bg-gray-200 rounded-xl"></div>
              <div className="h-12 w-32 bg-blue-200 rounded-xl"></div>
            </div>
          </div>

          {/* Loading indicator */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Preparing your personalized assessment...</span>
            </div>
          </div>
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

  return (
    <div className="min-h-screen bg-white">
      {currentQuestion.type === "text" || currentQuestion.type === "email" ? (
        <TextInput
          question={currentQuestion}
          value={textValue}
          onChange={setTextValue}
          onSubmit={handleNext}
          onBack={handleBack}
          canGoBack={canGoBack}
          currentQuestion={questionNumber}
          totalQuestions={totalQuestions}
        />
      ) : (
        <QuestionCard
          question={currentQuestion}
          currentQuestion={questionNumber}
          totalQuestions={totalQuestions}
          selectedValue={selectedValue}
          onAnswer={handleAnswer}
          onBack={handleBack}
          canGoBack={canGoBack}
        />
      )}

      {/* Article Display Modal - Show for all questions with options */}
      {showArticle && pendingAnswer && currentQuestion && sessionId && currentQuestion.options && currentQuestion.options.length > 0 && (
        <ArticleDisplayWrapper
          sessionId={sessionId}
          questionId={currentQuestion.id}
          answerValue={pendingAnswer.value}
          answerLabel={pendingAnswer.label}
          onContinue={handleArticleClose}
        />
      )}
    </div>
  );
}
