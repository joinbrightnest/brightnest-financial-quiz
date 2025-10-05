"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QuestionCard from "@/components/QuestionCard";

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

export default function QuizPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeQuiz = async () => {
      try {
        const response = await fetch("/api/quiz/start", {
          method: "POST",
        });
        
        if (!response.ok) {
          throw new Error("Failed to start quiz");
        }
        
        const data = await response.json();
        setSessionId(data.sessionId);
        setCurrentQuestion(data.question);
        setTotalQuestions(await getTotalQuestions());
        setIsLoading(false);
      } catch (_err) {
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

  const handleAnswer = (value: string) => {
    setSelectedValue(value);
  };

  const handleNext = async () => {
    if (!selectedValue || !sessionId || !currentQuestion) return;

    try {
      const response = await fetch("/api/quiz/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          value: selectedValue,
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
        setSelectedValue(null);
      }
    } catch (_err) {
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
    <div className="min-h-screen bg-gray-50 py-8">
      <QuestionCard
        question={currentQuestion}
        currentQuestion={questionNumber}
        totalQuestions={totalQuestions}
        selectedValue={selectedValue}
        onAnswer={handleAnswer}
        onNext={handleNext}
      />
    </div>
  );
}
