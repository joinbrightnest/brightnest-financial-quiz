"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ConfirmationModal from "../components/ConfirmationModal";

interface QuizType {
  name: string;
  displayName: string;
  description: string;
  questionCount: number;
}

export default function QuizManagement() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const hasInitiallyLoaded = useRef(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    confirmText: string;
    isDangerous: boolean;
    requireInput?: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: null,
    confirmText: "Confirm",
    isDangerous: false,
    action: async () => { },
  });

  const [allQuizTypes, setAllQuizTypes] = useState<QuizType[]>([]);

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



  const executeReset = async (quizType: string) => {
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
        // alert(`Quiz type ${quizType} reset successfully!`); // Optional: could show a toast instead
      } else {
        alert("Failed to reset quiz type");
      }
    } catch (error) {
      console.error("Error resetting quiz type:", error);
      alert("Error resetting quiz type");
    }
  };

  const executeDelete = async (quizType: string) => {
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
      } else {
        alert(`Failed to delete quiz: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting quiz type:", error);
      alert("Error deleting quiz. Please try again.");
    }
  };

  const handleResetClick = (quizType: string, displayName: string) => {
    setModalState({
      isOpen: true,
      title: "Reset Quiz Type",
      message: (
        <span>
          Are you sure you want to reset all questions for <strong>{displayName}</strong>?
          <br /><br />
          This will delete all existing questions.
        </span>
      ),
      confirmText: "Reset",
      isDangerous: true,
      action: () => executeReset(quizType)
    });
  };

  const handleDeleteClick = (quizType: string, displayName: string) => {
    setModalState({
      isOpen: true,
      title: "Delete Quiz Type",
      message: (
        <span>
          Are you sure you want to PERMANENTLY DELETE the <strong>{displayName}</strong> quiz?
          <br /><br />
          This will:
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Delete ALL questions for this quiz</li>
            <li>Delete ALL quiz sessions and answers</li>
            <li>Delete ALL results for this quiz</li>
            <li>Remove the quiz from the system completely</li>
          </ul>
          <br />
          This action CANNOT be undone!
        </span>
      ),
      confirmText: "Delete Forever",
      isDangerous: true,
      requireInput: "DELETE",
      action: () => executeDelete(quizType)
    });
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors group"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-200"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quiz Management</h1>
                <p className="text-sm text-gray-500 mt-1">Manage and customize your quiz content</p>
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

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Create New Quiz Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Create New Quiz</h3>
                <p className="text-sm text-gray-600 mt-1">Design a custom quiz from scratch</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/admin/quiz-editor/new-quiz')}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-semibold">Create Quiz</span>
            </button>
          </div>
        </div>

        {/* Quiz Types Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Quizzes ({allQuizTypes.length})</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quiz</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Questions</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allQuizTypes.map((quizType, index) => (
                  <tr key={quizType.name} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${index % 4 === 0 ? 'bg-blue-500' :
                          index % 4 === 1 ? 'bg-emerald-500' :
                            index % 4 === 2 ? 'bg-purple-500' :
                              'bg-orange-500'
                          }`}>
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{quizType.displayName}</div>
                          <div className="text-xs text-gray-500 font-mono">{quizType.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${index % 4 === 0 ? 'bg-blue-100 text-blue-800' :
                        index % 4 === 1 ? 'bg-emerald-100 text-emerald-800' :
                          index % 4 === 2 ? 'bg-purple-100 text-purple-800' :
                            'bg-orange-100 text-orange-800'
                        }`}>
                        {quizType.questionCount} questions
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs">{quizType.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/admin/quiz-editor/${quizType.name}`)}
                          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleResetClick(quizType.name, quizType.displayName)}
                          className="flex items-center space-x-2 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-sm font-medium transition-colors border border-orange-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>Reset</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(quizType.name, quizType.displayName)}
                          className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      </div>

      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={async () => {
          await modalState.action();
          setModalState(prev => ({ ...prev, isOpen: false }));
        }}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        isDangerous={modalState.isDangerous}
        requireInput={modalState.requireInput}
      />
    </div>
  );
}
