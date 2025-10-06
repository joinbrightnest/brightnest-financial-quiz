"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

interface QuizEditorProps {
  params: Promise<{
    type: string;
  }>;
}

export default function QuizEditor({ params }: QuizEditorProps) {
  const router = useRouter();
  const [quizType, setQuizType] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [draggedQuestion, setDraggedQuestion] = useState<string | null>(null);

  // Handle async params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setQuizType(resolvedParams.type);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (quizType) {
      fetchQuestions();
    }
  }, [quizType]);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/quiz-questions?quizType=${quizType}`);
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, questionId: string) => {
    setDraggedQuestion(questionId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetQuestionId: string) => {
    e.preventDefault();
    
    if (!draggedQuestion || draggedQuestion === targetQuestionId) {
      setDraggedQuestion(null);
      return;
    }

    const draggedIndex = questions.findIndex(q => q.id === draggedQuestion);
    const targetIndex = questions.findIndex(q => q.id === targetQuestionId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedQuestion(null);
      return;
    }

    // Reorder questions
    const newQuestions = [...questions];
    const [draggedQuestionObj] = newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(targetIndex, 0, draggedQuestionObj);

    // Update order numbers
    const updatedQuestions = newQuestions.map((question, index) => ({
      ...question,
      order: index + 1
    }));

    setQuestions(updatedQuestions);
    setDraggedQuestion(null);
  };

  const handleQuestionEdit = (questionId: string, field: string, value: any) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  const handleOptionEdit = (questionId: string, optionIndex: number, field: string, value: any) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? {
            ...q,
            options: q.options.map((opt, idx) => 
              idx === optionIndex ? { ...opt, [field]: value } : opt
            )
          }
        : q
    ));
  };

  const addNewOption = (questionId: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? {
            ...q,
            options: [
              ...q.options,
              {
                label: "New Option",
                value: "new_option",
                weightCategory: "spending",
                weightValue: 1
              }
            ]
          }
        : q
    ));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? {
            ...q,
            options: q.options.filter((_, idx) => idx !== optionIndex)
          }
        : q
    ));
  };

  const addNewQuestion = () => {
    const newQuestion: Question = {
      id: `new-${Date.now()}`,
      quizType,
      order: questions.length + 1,
      prompt: "New Question",
      type: "single",
      options: [
        {
          label: "Option 1",
          value: "option_1",
          weightCategory: "spending",
          weightValue: 1
        },
        {
          label: "Option 2",
          value: "option_2",
          weightCategory: "savings",
          weightValue: 2
        }
      ],
      active: true
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const removeQuestion = (questionId: string) => {
    if (confirm("Are you sure you want to remove this question?")) {
      setQuestions(prev => prev.filter(q => q.id !== questionId));
    }
  };

  const saveChanges = async () => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/admin/save-quiz-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizType,
          questions
        }),
      });

      if (response.ok) {
        alert("Questions saved successfully!");
        await fetchQuestions(); // Refresh to get updated data
      } else {
        alert("Failed to save questions");
      }
    } catch (error) {
      console.error("Error saving questions:", error);
      alert("Error saving questions");
    } finally {
      setIsSaving(false);
    }
  };

  const getQuizTypeDisplayName = (type: string) => {
    const displayNames: { [key: string]: string } = {
      "financial-profile": "Financial Profile",
      "health-finance": "Health Finance",
      "marriage-finance": "Marriage Finance"
    };
    return displayNames[type] || type;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.back()}
                className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
              >
                ← Back to Quiz Management
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Quiz Editor: {getQuizTypeDisplayName(quizType)}
              </h1>
              <p className="mt-2 text-gray-600">
                Drag and drop to reorder questions. Click to edit content.
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={addNewQuestion}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add Question
              </button>
              <button
                onClick={saveChanges}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div
              key={question.id}
              draggable
              onDragStart={(e) => handleDragStart(e, question.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, question.id)}
              className={`bg-white rounded-lg shadow-md border-2 transition-all duration-200 ${
                draggedQuestion === question.id
                  ? "border-blue-500 opacity-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Question Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                      {question.order}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Question {question.order}</h3>
                      <p className="text-sm text-gray-500">
                        Type: {question.type} • {question.options.length} options
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingQuestion(
                        editingQuestion === question.id ? null : question.id
                      )}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      {editingQuestion === question.id ? "Done Editing" : "Edit"}
                    </button>
                    <button
                      onClick={() => removeQuestion(question.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Question Content */}
              <div className="p-4">
                {editingQuestion === question.id ? (
                  <div className="space-y-4">
                    {/* Question Prompt */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Prompt
                      </label>
                      <textarea
                        value={question.prompt}
                        onChange={(e) => handleQuestionEdit(question.id, "prompt", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>

                    {/* Question Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Type
                      </label>
                      <select
                        value={question.type}
                        onChange={(e) => handleQuestionEdit(question.id, "type", e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="single">Multiple Choice</option>
                        <option value="text">Text Input</option>
                        <option value="email">Email Input</option>
                      </select>
                    </div>

                    {/* Options (only for single type) */}
                    {question.type === "single" && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Answer Options
                          </label>
                          <button
                            onClick={() => addNewOption(question.id)}
                            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                          >
                            Add Option
                          </button>
                        </div>
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                              <div className="flex-1 grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={option.label}
                                  onChange={(e) => handleOptionEdit(question.id, optIndex, "label", e.target.value)}
                                  placeholder="Option label"
                                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <input
                                  type="text"
                                  value={option.value}
                                  onChange={(e) => handleOptionEdit(question.id, optIndex, "value", e.target.value)}
                                  placeholder="Option value"
                                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <select
                                value={option.weightCategory}
                                onChange={(e) => handleOptionEdit(question.id, optIndex, "weightCategory", e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="debt">Debt</option>
                                <option value="savings">Savings</option>
                                <option value="spending">Spending</option>
                                <option value="investing">Investing</option>
                                <option value="contact">Contact</option>
                              </select>
                              <input
                                type="number"
                                value={option.weightValue}
                                onChange={(e) => handleOptionEdit(question.id, optIndex, "weightValue", parseInt(e.target.value))}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                min="0"
                                max="5"
                              />
                              {question.options.length > 1 && (
                                <button
                                  onClick={() => removeOption(question.id, optIndex)}
                                  className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-900 font-medium mb-3">{question.prompt}</p>
                    {question.type === "single" && (
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center space-x-2 text-sm">
                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                            <span className="text-gray-700">{option.label}</span>
                            <span className="text-gray-500">({option.weightCategory}: {option.weightValue})</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {question.type === "text" && (
                      <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded">
                        Text input field
                      </div>
                    )}
                    {question.type === "email" && (
                      <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded">
                        Email input field
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {questions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No questions found for this quiz type.</p>
            <button
              onClick={addNewQuestion}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Your First Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
