"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import QuestionCard from "@/components/QuestionCard";
import TextInput from "@/components/TextInput";

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

  useEffect(() => {
    if (!quizType) return; // Wait for quizType to be set
    
    const initializeQuiz = async () => {
      try {
        const response = await fetch("/api/quiz/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quizType }),
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
  }, [quizType]);

  const getTotalQuestions = async (): Promise<number> => {
    try {
      const response = await fetch(`/api/quiz/questions/count?quizType=${quizType}`);
      const data = await response.json();
      return data.count;
    } catch {
      return 10; // fallback
    }
  };

  const handleAnswer = async (value: string) => {
    setSelectedValue(value);
    
    // Auto-advance immediately to next question
    await handleNext(value);
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
          router.push(`/results/${resultData.resultId}`);
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
        />
      )}
    </div>
  );
}
