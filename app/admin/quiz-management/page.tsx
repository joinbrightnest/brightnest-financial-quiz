"use client";

import { useState, useEffect, useRef } from "react";

interface Question {
  id: string;
  quizType: string;
  order: number;
  prompt: string;
  type: string;
  options: Array<{
    label: string;
    value: string;
    weightCategory: string;
    weightValue: number;
  }>;
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
  const hasInitiallyLoaded = useRef(false);

  const [allQuizTypes, setAllQuizTypes] = useState<Array<{
    name: string;
    displayName: string;
    description: string;
    questionCount: number;
  }>>([]);

  useEffect(() => {
    fetchQuizData();
  }, []);

  // Handle page visibility and focus changes to prevent unnecessary re-fetching
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Only refetch if we haven't loaded data yet (initial load)
      if (!document.hidden && !hasInitiallyLoaded.current) {
        fetchQuizData();
      }
    };

    const handleWindowFocus = () => {
      // Don't refetch when window regains focus - this prevents the loading flash
      // The data is already there, no need to reload
    };

    const handleWindowBlur = () => {
      // Don't do anything when window loses focus
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  const fetchQuizData = async () => {
    try {
      // Only show loading state on initial load, not on window switches
      if (!hasInitiallyLoaded.current) {
        setIsLoading(true);
      }
      
      // Get all unique quiz types from the database
      const response = await fetch('/api/admin/all-quiz-types');
      const data = await response.json();
      
      if (data.success) {
        setAllQuizTypes(data.quizTypes);
        setQuizTypes(data.quizTypes);
        
        // Set selected quiz type to first available if current selection doesn't exist
        let quizTypeToUse = selectedQuizType;
        if (data.quizTypes.length > 0 && !data.quizTypes.find((qt: {name: string}) => qt.name === selectedQuizType)) {
          quizTypeToUse = data.quizTypes[0].name;
          setSelectedQuizType(quizTypeToUse);
        }
        
        // Get questions for selected quiz type
        await fetchQuestions(quizTypeToUse);
        hasInitiallyLoaded.current = true;
      }
    } catch (error) {
      console.error("Error fetching quiz data:", error);
    } finally {
      // Only hide loading state if we were actually showing it
      if (!hasInitiallyLoaded.current) {
        setIsLoading(false);
      }
    }
  };

  const fetchQuestions = async (quizType: string) => {
    try {
      console.log('Fetching questions for quiz type:', quizType);
      // Clear questions first to prevent showing stale data
      setQuestions([]);
      const response = await fetch(`/api/admin/quiz-questions?quizType=${quizType}`);
      const data = await response.json();
      console.log('Fetched questions:', data.questions?.length || 0, 'for', quizType);
      setQuestions(data.questions || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestions([]); // Clear questions on error
    }
  };

  const handleQuizTypeChange = (quizType: string) => {
    console.log('Changing to quiz type:', quizType);
    setSelectedQuizType(quizType);
    fetchQuestions(quizType);
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

  const deleteQuizType = async (quizType: string) => {
    const quizDisplayName = allQuizTypes.find(qt => qt.name === quizType)?.displayName || quizType;
    
    if (!confirm(`⚠️ DANGER: Are you sure you want to PERMANENTLY DELETE the "${quizDisplayName}" quiz?\n\nThis will:\n• Delete ALL questions for this quiz\n• Delete ALL quiz sessions and answers\n• Delete ALL results for this quiz\n• Remove the quiz from the system completely\n\nThis action CANNOT be undone!`)) {
      return;
    }

    // Double confirmation for safety
    if (!confirm(`🚨 FINAL WARNING: You are about to PERMANENTLY DELETE "${quizDisplayName}"\n\nType "DELETE" to confirm (case sensitive):`)) {
      return;
    }

    const confirmation = prompt(`Please type "DELETE" to confirm permanent deletion of "${quizDisplayName}":`);
    if (confirmation !== "DELETE") {
      alert("Deletion cancelled. You must type 'DELETE' exactly to confirm.");
      return;
    }

    try {
      const response = await fetch("/api/admin/delete-quiz-type", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quizType }),
      });

      const result = await response.json();

      if (response.ok) {
        await fetchQuizData();
        alert(`✅ Quiz "${quizDisplayName}" has been permanently deleted from the system.`);
      } else {
        alert(`❌ Failed to delete quiz: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting quiz type:", error);
      alert("❌ Error deleting quiz. Please try again.");
    }
  };

  if (isLoading && !hasInitiallyLoaded.current) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.open('/admin/dashboard', '_self')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Quiz Management</h1>
                <p className="text-sm text-gray-500">Manage and customize your quiz content</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchQuizData}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Create New Quiz Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Create New Quiz</h3>
                <p className="text-sm text-gray-600">Design a custom quiz from scratch</p>
              </div>
            </div>
            <button
              onClick={() => window.open('/admin/quiz-editor/new-quiz', '_self')}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-semibold">Create Quiz</span>
            </button>
          </div>
        </div>

        {/* Quiz Types Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200/50">
            <h3 className="text-lg font-bold text-gray-900">All Quizzes ({allQuizTypes.length})</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quiz</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Questions</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {allQuizTypes.map((quizType, index) => (
                  <tr key={quizType.name} className={`${selectedQuizType === quizType.name ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          index % 4 === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                          index % 4 === 1 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                          index % 4 === 2 ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                          'bg-gradient-to-br from-orange-500 to-orange-600'
                        }`}>
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{quizType.displayName}</div>
                          <div className="text-xs text-gray-500">{quizType.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        index % 4 === 0 ? 'bg-blue-100 text-blue-800' :
                        index % 4 === 1 ? 'bg-emerald-100 text-emerald-800' :
                        index % 4 === 2 ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {quizType.questionCount} questions
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">{quizType.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => window.open(`/admin/quiz-editor/${quizType.name}`, '_self')}
                          className="flex items-center space-x-1 px-2 py-1.5 bg-blue-600 text-white rounded-md text-xs font-semibold"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            handleQuizTypeChange(quizType.name);
                          }}
                          className={`flex items-center space-x-1 px-2 py-1.5 rounded-md text-xs font-semibold ${
                            selectedQuizType === quizType.name
                              ? "bg-gray-900 text-white"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => resetQuizType(quizType.name)}
                          className="flex items-center space-x-1 px-2 py-1.5 bg-orange-50 text-orange-700 rounded-md text-xs font-semibold"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>Reset</span>
                        </button>
                        <button
                          onClick={() => deleteQuizType(quizType.name)}
                          className="flex items-center space-x-1 px-2 py-1.5 bg-red-600 text-white rounded-md text-xs font-semibold hover:bg-red-700 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Spacing between sections */}
        <div className="mb-8"></div>

        {/* Questions List */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Questions for {quizTypes.find(qt => qt.name === selectedQuizType)?.displayName}
                  </h2>
                  <p className="text-sm text-gray-600">{questions.length} questions total</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            {questions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-medium">No questions found for this quiz type.</p>
                <p className="text-gray-400 text-sm mt-1">Use the &quot;Customize Quiz&quot; button above to add questions.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="group bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {question.order}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                            {question.prompt}
                          </h3>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        question.type === 'single' ? 'bg-blue-100 text-blue-800' :
                        question.type === 'text' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {question.type === 'single' ? 'Multiple Choice' : 
                         question.type === 'text' ? 'Text Input' : 'Email Input'}
                      </span>
                    </div>
                    
                    {question.options && question.options.length > 0 && (
                      <div className="bg-gray-50/50 rounded-lg p-4">
                        <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          Answer Options ({question.options.length})
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center space-x-3 bg-white/70 rounded-lg p-3 border border-gray-200/50">
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                              <span className="text-sm text-gray-700 font-medium">{option.label}</span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {option.weightCategory}
                              </span>
                            </div>
                          ))}
                        </div>
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
