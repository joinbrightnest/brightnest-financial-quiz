"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ArticleDisplayNoom from "@/components/ArticleDisplayNoom";

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

export default function TestArticlesPage({ params }: { params: Promise<{ type: string }> }) {
  const router = useRouter();
  const [quizType, setQuizType] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [testArticle, setTestArticle] = useState<{
    title: string;
    content: string;
    keyPoints: string[];
  }>({
    title: '',
    content: '',
    keyPoints: ['']
  });
  const [showPopup, setShowPopup] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleGenerateTestArticle = async () => {
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
          questionPrompt: question.prompt,
          answerValue: selectedOption,
          answerLabel: option.label,
          category: 'general'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTestArticle({
          title: data.article.title,
          content: data.article.content,
          keyPoints: data.article.keyPoints || []
        });
      }
    } catch (error) {
      console.error('Failed to generate article:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTestPopup = () => {
    if (testArticle.title && testArticle.content) {
      setShowPopup(true);
    }
  };

  const handleSaveAsFinal = async () => {
    if (!testArticle.title || !testArticle.content || !selectedQuestion || !selectedOption) return;

    try {
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: testArticle.title,
          content: testArticle.content,
          type: 'ai_generated',
          category: 'general',
          tags: testArticle.keyPoints.filter(point => point.trim() !== ''),
          triggers: [{
            questionId: selectedQuestion,
            optionValue: selectedOption,
            priority: 5,
            isActive: true
          }]
        })
      });

      if (response.ok) {
        alert('Article saved as final version!');
      }
    } catch (error) {
      console.error('Failed to save article:', error);
    }
  };

  const selectedQuestionData = questions.find(q => q.id === selectedQuestion);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <button
                onClick={() => router.push(`/admin/quiz-editor/${quizType}`)}
                className="text-blue-600 hover:text-blue-800 mb-2"
              >
                ← Back to Quiz Editor
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Test Articles</h1>
              <p className="text-gray-600">Test different articles and find the perfect ones</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Question Selection */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Question & Answer</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question
                </label>
                <select
                  value={selectedQuestion}
                  onChange={(e) => {
                    setSelectedQuestion(e.target.value);
                    setSelectedOption('');
                    setTestArticle({ title: '', content: '', keyPoints: [''] });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="">Choose a question...</option>
                  {questions.map((question) => (
                    <option key={question.id} value={question.id}>
                      {question.prompt}
                    </option>
                  ))}
                </select>
              </div>

              {selectedQuestionData && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer Option
                  </label>
                  <select
                    value={selectedOption}
                    onChange={(e) => {
                      setSelectedOption(e.target.value);
                      setTestArticle({ title: '', content: '', keyPoints: [''] });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Choose an answer...</option>
                    {selectedQuestionData.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedQuestion && selectedOption && (
                <button
                  onClick={handleGenerateTestArticle}
                  disabled={isGenerating}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isGenerating ? "Generating..." : "Generate Test Article"}
                </button>
              )}
            </div>

            {/* Middle Panel - Article Editor */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Article</h2>
              
              {testArticle.title ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={testArticle.title}
                      onChange={(e) => setTestArticle({...testArticle, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      value={testArticle.content}
                      onChange={(e) => setTestArticle({...testArticle, content: e.target.value})}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Points (one per line)
                    </label>
                    <textarea
                      value={testArticle.keyPoints.join('\n')}
                      onChange={(e) => setTestArticle({...testArticle, keyPoints: e.target.value.split('\n')})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={handleTestPopup}
                      className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-medium"
                    >
                      Test Popup
                    </button>
                    <button
                      onClick={handleSaveAsFinal}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
                    >
                      Save as Final
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Select a question and answer to generate an article</p>
                </div>
              )}
            </div>

            {/* Right Panel - Quick Stat Preview */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Stat Preview</h2>
              
              {testArticle.keyPoints.some(point => point.includes('%')) ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {testArticle.keyPoints.find(point => point.includes('%'))?.match(/\d+%/) || "70%"}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {testArticle.keyPoints.find(point => point.includes('%'))?.replace(/\d+%/, "").trim() || "of people face similar challenges"}
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">How it will look:</h3>
                    <p className="text-sm text-gray-700">
                      This is exactly how the statistic will appear in the popup when users answer this question.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Add a statistic with % to see preview</p>
                  <p className="text-xs text-gray-400 mt-2">Example: "70% of people face similar challenges"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Test Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-teal-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
              <button
                onClick={() => setShowPopup(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="text-center">
                <h1 className="text-lg font-bold text-gray-900">BRIGHTNEST</h1>
                <span className="text-xs bg-gray-800 text-white px-2 py-1 rounded-full">FINANCIAL</span>
              </div>
              <div className="w-6"></div>
            </div>

            {/* Main Content */}
            <div className="px-6 pb-6 text-center">
              {/* Icon */}
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-wide">
                {testArticle.title}
              </h2>

              {/* Subtitle */}
              <p className="text-gray-600 mb-4">
                Financial Guidance
              </p>

              {/* Main Message */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                {testArticle.content}
              </p>

              {/* Quick Stat */}
              {testArticle.keyPoints.some(point => point.includes('%')) && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="text-3xl font-bold text-red-600 mb-1">
                    {testArticle.keyPoints.find(point => point.includes('%'))?.match(/\d+%/) || "70%"}
                  </div>
                  <p className="text-sm text-gray-600">
                    {testArticle.keyPoints.find(point => point.includes('%'))?.replace(/\d+%/, "").trim() || "of people face similar challenges"}
                  </p>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={() => setShowPopup(false)}
                className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors"
              >
                CONTINUE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
