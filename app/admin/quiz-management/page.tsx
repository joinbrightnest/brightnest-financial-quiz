"use client";

import { useState, useEffect } from "react";

interface Question {
  id: string;
  quizType: string;
  order: number;
  prompt: string;
  type: string;
  options: any[];
  active: boolean;
}

interface QuizType {
  name: string;
  displayName: string;
  description: string;
  questionCount: number;
}

export default function QuizManagement() {
  const [quizTypes, setQuizTypes] = useState<QuizType[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuizType, setSelectedQuizType] = useState<string>("financial-profile");
  const [isLoading, setIsLoading] = useState(true);

  const quizTypeConfig = [
    {
      name: "financial-profile",
      displayName: "Financial Profile",
      description: "General financial personality assessment"
    },
    {
      name: "health-finance",
      displayName: "Health Finance",
      description: "Healthcare and medical expense management"
    },
    {
      name: "marriage-finance",
      displayName: "Marriage Finance",
      description: "Couples financial planning and management"
    }
  ];

  useEffect(() => {
    fetchQuizData();
  }, []);

  const fetchQuizData = async () => {
    try {
      setIsLoading(true);
      
      // Get question counts for each quiz type
      const quizTypeData = await Promise.all(
        quizTypeConfig.map(async (config) => {
          const response = await fetch(`/api/quiz/questions/count?quizType=${config.name}`);
          const data = await response.json();
          return {
            ...config,
            questionCount: data.count || 0
          };
        })
      );
      
      setQuizTypes(quizTypeData);
      
      // Get questions for selected quiz type
      await fetchQuestions(selectedQuizType);
    } catch (error) {
      console.error("Error fetching quiz data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuestions = async (quizType: string) => {
    try {
      const response = await fetch(`/api/admin/quiz-questions?quizType=${quizType}`);
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const handleQuizTypeChange = (quizType: string) => {
    setSelectedQuizType(quizType);
    fetchQuestions(quizType);
  };

  const duplicateQuestions = async (fromQuizType: string, toQuizType: string) => {
    try {
      const response = await fetch("/api/admin/duplicate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromQuizType,
          toQuizType
        }),
      });

      if (response.ok) {
        await fetchQuizData();
        alert(`Questions duplicated from ${fromQuizType} to ${toQuizType} successfully!`);
      } else {
        alert("Failed to duplicate questions");
      }
    } catch (error) {
      console.error("Error duplicating questions:", error);
      alert("Error duplicating questions");
    }
  };

  const resetQuizType = async (quizType: string) => {
    if (!confirm(`Are you sure you want to reset all questions for ${quizType}? This will delete all existing questions.`)) {
      return;
    }

    try {
      const response = await fetch("/api/admin/reset-quiz-type", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quizType }),
      });

      if (response.ok) {
        await fetchQuizData();
        alert(`Quiz type ${quizType} reset successfully!`);
      } else {
        alert("Failed to reset quiz type");
      }
    } catch (error) {
      console.error("Error resetting quiz type:", error);
      alert("Error resetting quiz type");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quiz Management</h1>
          <p className="mt-2 text-gray-600">Manage quiz types and questions</p>
        </div>

        {/* Quiz Types Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quizTypes.map((quizType) => (
            <div key={quizType.name} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900">{quizType.displayName}</h3>
              <p className="text-sm text-gray-600 mt-1">{quizType.description}</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">{quizType.questionCount} questions</p>
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => handleQuizTypeChange(quizType.name)}
                  className={`w-full px-3 py-2 text-sm rounded-md ${
                    selectedQuizType === quizType.name
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  View Questions
                </button>
                <button
                  onClick={() => resetQuizType(quizType.name)}
                  className="w-full px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                >
                  Reset Questions
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Duplicate Questions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Duplicate Questions</h2>
          <p className="text-gray-600 mb-4">Copy all questions from one quiz type to another</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                const fromQuizType = e.target.value;
                const toQuizType = selectedQuizType;
                if (fromQuizType && toQuizType && fromQuizType !== toQuizType) {
                  duplicateQuestions(fromQuizType, toQuizType);
                }
              }}
            >
              <option value="">Select source quiz type...</option>
              {quizTypes.map((quizType) => (
                <option key={quizType.name} value={quizType.name}>
                  {quizType.displayName} ({quizType.questionCount} questions)
                </option>
              ))}
            </select>
            <div className="text-sm text-gray-600 flex items-center">
              → Will copy to: <strong className="ml-1">{quizTypes.find(qt => qt.name === selectedQuizType)?.displayName}</strong>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Questions for {quizTypes.find(qt => qt.name === selectedQuizType)?.displayName}
            </h2>
          </div>
          <div className="p-6">
            {questions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No questions found for this quiz type.</p>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">
                        Question {question.order}: {question.prompt}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        question.type === 'single' ? 'bg-blue-100 text-blue-800' :
                        question.type === 'text' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {question.type}
                      </span>
                    </div>
                    {question.options && question.options.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-1">Options:</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {question.options.map((option, optIndex) => (
                            <li key={optIndex} className="flex items-center">
                              <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                              {option.label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
