"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FlowBuilder from "@/components/FlowBuilder";

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

export default function FlowBuilderPage({ params }: { params: Promise<{ type: string }> }) {
  const router = useRouter();
  const [quizType, setQuizType] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setQuizType(resolvedParams.type);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (quizType) {
      fetchData();
    }
  }, [quizType]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch questions
      const questionsResponse = await fetch(`/api/admin/quiz-questions?quizType=${quizType}`);
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        setQuestions(questionsData.questions || []);
      }

      // Load articles from simple article system (localStorage)
      const storedArticles = localStorage.getItem('brightnest_articles');
      if (storedArticles) {
        const articlesData = JSON.parse(storedArticles);
        const articlesList = Object.values(articlesData).map((article: any) => ({
          id: article.id,
          title: article.title,
          content: article.content,
          category: article.category
        }));
        setArticles(articlesList);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFlow = async (nodes: any[], connections: any[]) => {
    try {
      console.log('Saving flow:', { nodes, connections });
      
      // Here you would save the flow configuration
      // For now, just show success message
      alert('Flow saved successfully!');
      
      // You could save this to a simple JSON file or localStorage
      localStorage.setItem(`quiz_flow_${quizType}`, JSON.stringify({
        nodes,
        connections,
        quizType,
        updatedAt: new Date().toISOString()
      }));
      
    } catch (error) {
      console.error('Failed to save flow:', error);
      alert('Failed to save flow. Please try again.');
    }
  };

  const handleCreateArticle = () => {
    // Open article creation in a new tab/window
    const newWindow = window.open(`/admin/quiz-editor/${quizType}/create-article`, '_blank');
    
    // Listen for when the new window closes to refresh articles
    const checkClosed = setInterval(() => {
      if (newWindow?.closed) {
        clearInterval(checkClosed);
        // Refresh articles when the article creation window closes
        fetchData();
      }
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flow builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push(`/admin/quiz-editor/${quizType}`)}
              className="text-blue-600 hover:text-blue-800 mb-2"
            >
              ← Back to Quiz Editor
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Quiz Flow Builder</h1>
            <p className="text-gray-600">Drag and drop to create your quiz flow with articles</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Questions: {questions.length} | Articles: {articles.length}
            </div>
          </div>
        </div>
      </div>

      {/* Flow Builder */}
      <FlowBuilder
        questions={questions}
        articles={articles}
        onSave={handleSaveFlow}
        onCreateArticle={handleCreateArticle}
        onRefresh={fetchData}
      />
    </div>
  );
}
