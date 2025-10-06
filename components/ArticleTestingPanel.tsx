"use client";

import { useState } from "react";

interface TestResult {
  scenarioId: string;
  passed: boolean;
  score: number;
  issues: string[];
  generatedContent?: {
    title: string;
    content: string;
    keyPoints: string[];
  };
  executionTime: number;
}

interface PerformanceResult {
  averageTime: number;
  minTime: number;
  maxTime: number;
  successRate: number;
}

export default function ArticleTestingPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [performanceResults, setPerformanceResults] = useState<PerformanceResult | null>(null);
  const [testReport, setTestReport] = useState<string>("");
  const [iterations, setIterations] = useState(10);

  const runAllTests = async () => {
    setIsRunning(true);
    try {
      const response = await fetch('/api/admin/test-articles?type=all');
      if (response.ok) {
        const data = await response.json();
        setTestResults(data.results || []);
        setTestReport(data.report || "");
      }
    } catch (error) {
      console.error('Failed to run tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runPerformanceTest = async () => {
    setIsRunning(true);
    try {
      const response = await fetch(`/api/admin/test-articles?type=performance&iterations=${iterations}`);
      if (response.ok) {
        const data = await response.json();
        setPerformanceResults(data.results);
      }
    } catch (error) {
      console.error('Failed to run performance test:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadReport = () => {
    if (testReport) {
      const blob = new Blob([testReport], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `article-test-report-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Article System Testing</h2>
        <div className="flex space-x-2">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isRunning ? "Running..." : "Run All Tests"}
          </button>
          <button
            onClick={runPerformanceTest}
            disabled={isRunning}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Performance Test
          </button>
        </div>
      </div>

      {/* Performance Test Settings */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Performance Test Iterations
        </label>
        <input
          type="number"
          value={iterations}
          onChange={(e) => setIterations(parseInt(e.target.value) || 10)}
          min="1"
          max="100"
          className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      {/* Performance Results */}
      {performanceResults && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">Performance Test Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-green-600">Average Time:</span>
              <div className="font-mono">{performanceResults.averageTime.toFixed(0)}ms</div>
            </div>
            <div>
              <span className="text-green-600">Min Time:</span>
              <div className="font-mono">{performanceResults.minTime}ms</div>
            </div>
            <div>
              <span className="text-green-600">Max Time:</span>
              <div className="font-mono">{performanceResults.maxTime}ms</div>
            </div>
            <div>
              <span className="text-green-600">Success Rate:</span>
              <div className="font-mono">{(performanceResults.successRate * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Test Results</h3>
            {testReport && (
              <button
                onClick={downloadReport}
                className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
              >
                Download Report
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {testResults.map((result) => (
              <div
                key={result.scenarioId}
                className={`p-4 rounded-lg border ${
                  result.passed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`text-sm font-medium ${
                        result.passed ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {result.scenarioId}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        result.passed 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {result.passed ? 'PASS' : 'FAIL'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Score: {(result.score * 100).toFixed(1)}%
                      </span>
                      <span className="text-xs text-gray-500">
                        Time: {result.executionTime}ms
                      </span>
                    </div>
                    
                    {result.generatedContent && (
                      <div className="text-sm text-gray-700">
                        <div className="font-medium mb-1">
                          Title: {result.generatedContent.title}
                        </div>
                        <div className="text-xs text-gray-600 mb-1">
                          Key Points: {result.generatedContent.keyPoints.join(', ')}
                        </div>
                      </div>
                    )}
                    
                    {result.issues.length > 0 && (
                      <div className="text-sm text-red-600 mt-2">
                        Issues: {result.issues.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {testResults.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Tests:</span>
              <div className="font-semibold">{testResults.length}</div>
            </div>
            <div>
              <span className="text-gray-600">Passed:</span>
              <div className="font-semibold text-green-600">
                {testResults.filter(r => r.passed).length}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Average Score:</span>
              <div className="font-semibold">
                {(testResults.reduce((sum, r) => sum + r.score, 0) / testResults.length * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <span className="text-gray-600">Average Time:</span>
              <div className="font-semibold">
                {(testResults.reduce((sum, r) => sum + r.executionTime, 0) / testResults.length).toFixed(0)}ms
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
