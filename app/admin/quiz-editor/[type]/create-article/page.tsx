"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Question {
  id: string;
  prompt: string;
  options: Array<{
    label: string;
    value: string;
    weightCategory: string;
    weightValue: number;
  }>;
}

export default function CreateArticlePage({ params }: { params: Promise<{ type: string }> }) {
  const router = useRouter();
  const [quizType, setQuizType] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [manualQuestion, setManualQuestion] = useState<string>('');
  const [manualAnswer, setManualAnswer] = useState<string>('');
  const [useManualInput, setUseManualInput] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState<{
    title: string;
    content: string;
    category: string;
    tags: string[];
    keyPoints?: string[];
  } | null>(null);
  const [editableArticle, setEditableArticle] = useState<{
    title: string;
    content: string;
    category: string;
    keyPoints: string[];
  }>({
    title: '',
    content: '',
    category: 'general',
    keyPoints: ['']
  });
  const [isSaving, setIsSaving] = useState(false);

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
      const response = await fetch(`/api/admin/quiz-questions?quizType=${quizType}`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  const handleGenerateArticle = async () => {
    if (!selectedQuestion || !selectedOption) return;

    setIsGenerating(true);
    try {
      const question = questions.find(q => q.id === selectedQuestion);
      const option = question?.options.find(opt => opt.value === selectedOption);
      
      if (!question || !option) return;

      const response = await fetch('/api/admin/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: selectedQuestion,
          questionPrompt: question.prompt,
          answerValue: selectedOption,
          answerLabel: option.label,
          category: 'general'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedArticle(data.article);
      }
    } catch (error) {
      console.error('Failed to generate article:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateManualArticle = async () => {
    if (!manualQuestion || !manualAnswer) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/admin/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionPrompt: manualQuestion,
          answerValue: manualAnswer,
          answerLabel: manualAnswer,
          category: 'general'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedArticle(data.article);
      }
    } catch (error) {
      console.error('Failed to generate article:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveArticle = async () => {
    if (!generatedArticle) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedArticle.title,
          content: generatedArticle.content,
          type: 'ai_generated',
          category: generatedArticle.category,
          tags: generatedArticle.tags || [],
          triggers: useManualInput ? [] : [{
            questionId: selectedQuestion,
            optionValue: selectedOption,
            priority: 5,
            isActive: true
          }]
        })
      });

      if (response.ok) {
        alert('Article saved successfully!');
        router.push(`/admin/quiz-editor/${quizType}`);
      }
    } catch (error) {
      console.error('Failed to save article:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveManualArticle = async () => {
    if (!editableArticle.title || !editableArticle.content) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editableArticle.title,
          content: editableArticle.content,
          type: 'static',
          category: editableArticle.category,
          tags: editableArticle.keyPoints.filter(point => point.trim() !== ''),
          triggers: []
        })
      });

      if (response.ok) {
        alert('Manual article saved successfully!');
        router.push(`/admin/quiz-editor/${quizType}`);
      }
    } catch (error) {
      console.error('Failed to save manual article:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedQuestionData = questions.find(q => q.id === selectedQuestion);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <button
                onClick={() => router.push(`/admin/quiz-editor/${quizType}`)}
                className="text-blue-600 hover:text-blue-800 mb-2"
              >
                ← Back to Quiz Editor
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Create AI Article</h1>
              <p className="text-gray-600">Generate personalized insights for quiz answers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel - Configuration */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Article Configuration</h2>
              
              {/* Input Mode Toggle */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Input Mode
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setUseManualInput(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      !useManualInput
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Select from Quiz
                  </button>
                  <button
                    onClick={() => setUseManualInput(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      useManualInput
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Write Manually
                  </button>
                </div>
              </div>

              {!useManualInput ? (
                <>
                  {/* Question Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Question
                </label>
                <select
                  value={selectedQuestion}
                  onChange={(e) => {
                    setSelectedQuestion(e.target.value);
                    setSelectedOption('');
                    setGeneratedArticle(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="">Choose a question...</option>
                  {questions.map((question) => (
                    <option key={question.id} value={question.id} className="text-gray-900">
                      {question.prompt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Option Selection */}
              {selectedQuestionData && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Answer Option
                  </label>
                  <select
                    value={selectedOption}
                    onChange={(e) => {
                      setSelectedOption(e.target.value);
                      setGeneratedArticle(null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Choose an answer option...</option>
                    {selectedQuestionData.options.map((option) => (
                      <option key={option.value} value={option.value} className="text-gray-900">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

                  {/* Generate Button */}
                  {selectedQuestion && selectedOption && (
                    <button
                      onClick={handleGenerateArticle}
                      disabled={isGenerating}
                      className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {isGenerating ? "Generating Article..." : "Generate AI Article"}
                    </button>
                  )}
                </>
              ) : (
                <>
                  {/* Manual Input Fields */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text
                    </label>
                    <input
                      type="text"
                      value={manualQuestion}
                      onChange={(e) => setManualQuestion(e.target.value)}
                      placeholder="Enter your question here..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer Text
                    </label>
                    <input
                      type="text"
                      value={manualAnswer}
                      onChange={(e) => setManualAnswer(e.target.value)}
                      placeholder="Enter the answer here..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>

                  {/* Generate Button for Manual Input */}
                  {manualQuestion && manualAnswer && (
                    <button
                      onClick={() => handleGenerateManualArticle()}
                      disabled={isGenerating}
                      className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium mb-4"
                    >
                      {isGenerating ? "Generating Article..." : "Generate AI Article"}
                    </button>
                  )}

                </>
              )}
            </div>

            {/* Right Panel - Preview */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Article Preview</h2>
              
              {useManualInput ? (
                /* Manual Mode - Show Editable Article */
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Article Title
                    </label>
                    <input
                      type="text"
                      value={editableArticle.title}
                      onChange={(e) => setEditableArticle({...editableArticle, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Article Content
                    </label>
                    <textarea
                      value={editableArticle.content}
                      onChange={(e) => setEditableArticle({...editableArticle, content: e.target.value})}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Points
                    </label>
                    <textarea
                      value={editableArticle.keyPoints.join('\n')}
                      onChange={(e) => setEditableArticle({...editableArticle, keyPoints: e.target.value.split('\n')})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>

                  {/* Quick Stat Preview */}
                  {editableArticle.keyPoints.some(point => point.includes('%')) && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Quick Stat Preview:</h4>
                      <div className="text-2xl font-bold text-red-600 mb-1">
                        {editableArticle.keyPoints.find(point => point.includes('%'))?.match(/\d+%/) || "70%"}
                      </div>
                      <p className="text-sm text-gray-600">
                        {editableArticle.keyPoints.find(point => point.includes('%'))?.replace(/\d+%/, "").trim() || "of people face similar challenges"}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => handleSaveManualArticle()}
                    disabled={!editableArticle.title || !editableArticle.content}
                    className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Save Manual Article
                  </button>
                </div>
              ) : (
                /* AI Generated Mode */
                !generatedArticle ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">Select a question and answer option to generate an article</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Article Content */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {generatedArticle.title}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {generatedArticle.content}
                      </p>
                    </div>

                    {/* Key Points */}
                    {generatedArticle.keyPoints && generatedArticle.keyPoints.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Key Points:</h4>
                        <ul className="space-y-1">
                          {generatedArticle.keyPoints.map((point: string, index: number) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Quick Stat Preview */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Quick Stat Preview:</h4>
                      <div className="text-2xl font-bold text-red-600 mb-1">
                        {generatedArticle.keyPoints?.[0]?.match(/\d+%/) || "70%"}
                      </div>
                      <p className="text-sm text-gray-600">
                        {generatedArticle.keyPoints?.[0]?.replace(/\d+%/, "").trim() || "of people face similar challenges"}
                      </p>
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={handleSaveArticle}
                      disabled={isSaving}
                      className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {isSaving ? "Saving Article..." : "Save Article"}
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
