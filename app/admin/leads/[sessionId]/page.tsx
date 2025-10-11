"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface QuizSession {
  id: string;
  quizType: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  answers: QuizAnswer[];
  result?: {
    archetype: string;
    scores: any;
  };
}

interface QuizAnswer {
  id: string;
  questionId: string;
  value: any;
  question: {
    id: string;
    prompt: string;
    type: string;
    order: number;
  };
}

export default function SessionAnswersPage() {
  const router = useRouter();
  const params = useParams();
  const [session, setSession] = useState<QuizSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const getSessionId = async () => {
      const resolvedParams = await params;
      const sessionId = resolvedParams.sessionId as string;
      if (sessionId) {
        fetchSessionData(sessionId);
      }
    };
    getSessionId();
  }, [params]);

  const fetchSessionData = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/admin/session/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch session data');
      }
      const data = await response.json();
      setSession(data.session);
    } catch (error) {
      console.error('Error fetching session:', error);
      setError('Failed to load session data');
    } finally {
      setIsLoading(false);
    }
  };

  const getQuizTypeDisplayName = (quizType: string) => {
    return quizType
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const toggleAnswerSelection = (answerId: string) => {
    const newSelected = new Set(selectedAnswers);
    if (newSelected.has(answerId)) {
      newSelected.delete(answerId);
    } else {
      newSelected.add(answerId);
    }
    setSelectedAnswers(newSelected);
  };

  const selectAllAnswers = () => {
    if (session) {
      setSelectedAnswers(new Set(session.answers.map(a => a.id)));
    }
  };

  const deselectAllAnswers = () => {
    setSelectedAnswers(new Set());
  };

  const exportSelectedAnswers = () => {
    if (!session || selectedAnswers.size === 0) return;

    const selectedAnswersData = session.answers.filter(a => selectedAnswers.has(a.id));
    
    // Create CSV content
    const csvHeaders = ['Question Order', 'Question Prompt', 'Answer Value', 'Question Type', 'Answered At'];
    const csvRows = selectedAnswersData.map(answer => [
      answer.question.order,
      answer.question.prompt,
      JSON.stringify(answer.value),
      answer.question.type,
      new Date(answer.createdAt).toISOString()
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${session.id}-selected-answers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-black">Loading session data...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-black mb-4">{error || 'Session not found'}</p>
          <button
            onClick={() => router.push('/admin/leads')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to CRM
          </button>
        </div>
      </div>
    );
  }

  const nameAnswer = session.answers.find(a => a.question.type === "text");
  const emailAnswer = session.answers.find(a => a.question.type === "email");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-black">Quiz Session Details</h1>
              <p className="text-sm text-black">Session ID: {session.id}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCheckboxes(!showCheckboxes)}
                className={`py-2 px-4 rounded-lg transition-colors text-sm font-medium ${
                  showCheckboxes 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                {showCheckboxes ? 'Hide Selection' : 'Select Answers'}
              </button>
              {showCheckboxes && (
                <>
                  <button
                    onClick={selectAllAnswers}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAllAnswers}
                    className="bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                  >
                    Deselect All
                  </button>
                  <button
                    onClick={exportSelectedAnswers}
                    disabled={selectedAnswers.size === 0}
                    className={`py-2 px-4 rounded-lg transition-colors text-sm font-medium ${
                      selectedAnswers.size === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    Export Selected ({selectedAnswers.size})
                  </button>
                </>
              )}
              <button
                onClick={() => router.push('/admin/leads')}
                className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Back to CRM
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Session Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-black">Session Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <span className="font-medium text-black">Quiz Type:</span>
                <div className="text-black">{getQuizTypeDisplayName(session.quizType)}</div>
              </div>
              <div>
                <span className="font-medium text-black">Status:</span>
                <div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    session.status === "completed" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-orange-100 text-orange-800"
                  }`}>
                    {session.status === "completed" ? "Completed" : "In Progress"}
                  </span>
                </div>
              </div>
              <div>
                <span className="font-medium text-black">Started:</span>
                <div className="text-black">{new Date(session.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <span className="font-medium text-black">Completed:</span>
                <div className="text-black">
                  {session.completedAt ? new Date(session.completedAt).toLocaleString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-black">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-black">Name:</span>
                <div className="text-black">{nameAnswer?.value || "N/A"}</div>
              </div>
              <div>
                <span className="font-medium text-black">Email:</span>
                <div className="text-black">{emailAnswer?.value || "N/A"}</div>
              </div>
            </div>
          </div>

          {/* Result */}
          {session.result && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 text-black">Quiz Result</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-black">Archetype:</span>
                  <div className="text-black text-lg font-semibold">{session.result.archetype}</div>
                </div>
                <div>
                  <span className="font-medium text-black">Scores:</span>
                  <div className="text-black">
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                      {JSON.stringify(session.result.scores, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Answers */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">
                Quiz Answers ({session.answers.length} answers)
              </h3>
              {showCheckboxes && (
                <div className="text-sm text-gray-600">
                  {selectedAnswers.size} of {session.answers.length} selected
                </div>
              )}
            </div>
            {session.answers.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 text-lg mb-2">No answers recorded</div>
                <div className="text-gray-400 text-sm">
                  This session may have been completed before answer tracking was implemented, 
                  or there was an issue saving the answers.
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {session.answers
                  .sort((a, b) => a.question.order - b.question.order)
                  .map((answer) => (
                    <div 
                      key={answer.id} 
                      className={`border rounded-lg p-4 transition-all duration-200 ${
                        showCheckboxes && selectedAnswers.has(answer.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {showCheckboxes && (
                          <div className="flex-shrink-0 pt-1">
                            <input
                              type="checkbox"
                              checked={selectedAnswers.has(answer.id)}
                              onChange={() => toggleAnswerSelection(answer.id)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-sm text-black">
                              Question {answer.question.order}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(answer.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-sm text-black mb-2">
                            <span className="font-medium">Question:</span> {answer.question.prompt}
                          </div>
                          <div className="text-sm text-black mb-1">
                            <span className="font-medium">Answer:</span> {JSON.stringify(answer.value)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Type: {answer.question.type}
                          </div>
                        </div>
                      </div>
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
