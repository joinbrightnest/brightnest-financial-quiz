import { articleService } from './article-service';
import { aiContentService } from './ai-content';

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  questionPrompt: string;
  answerValue: string;
  answerLabel: string;
  expectedCategory: string;
  expectedKeywords: string[];
  testType: 'static' | 'ai_generated' | 'template';
}

export interface TestResult {
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

export class ArticleTestingFramework {
  private static instance: ArticleTestingFramework;
  
  static getInstance(): ArticleTestingFramework {
    if (!ArticleTestingFramework.instance) {
      ArticleTestingFramework.instance = new ArticleTestingFramework();
    }
    return ArticleTestingFramework.instance;
  }

  // Predefined test scenarios
  private testScenarios: TestScenario[] = [
    {
      id: 'marriage-finance-1',
      name: 'Marriage Finance Impact',
      description: 'Test article generation for marriage-related financial stress',
      questionPrompt: 'What aspect of your life is most affected by financial stress?',
      answerValue: 'marriage',
      answerLabel: 'My marriage/relationship',
      expectedCategory: 'marriage',
      expectedKeywords: ['marriage', 'relationship', 'divorce', 'financial stress', 'communication'],
      testType: 'ai_generated'
    },
    {
      id: 'health-finance-1',
      name: 'Health Finance Impact',
      description: 'Test article generation for health-related financial concerns',
      questionPrompt: 'What worries you most about your financial situation?',
      answerValue: 'health_costs',
      answerLabel: 'Healthcare and medical expenses',
      expectedCategory: 'health',
      expectedKeywords: ['health', 'medical', 'stress', 'wellness', 'insurance'],
      testType: 'ai_generated'
    },
    {
      id: 'career-finance-1',
      name: 'Career Finance Impact',
      description: 'Test article generation for career-related financial decisions',
      questionPrompt: 'What would you do with an extra $10,000?',
      answerValue: 'career_investment',
      answerLabel: 'Invest in my career/education',
      expectedCategory: 'career',
      expectedKeywords: ['career', 'education', 'investment', 'professional', 'growth'],
      testType: 'ai_generated'
    },
    {
      id: 'savings-behavior-1',
      name: 'Savings Behavior Analysis',
      description: 'Test article generation for savings-related behavior',
      questionPrompt: 'How do you typically handle unexpected expenses?',
      answerValue: 'emergency_fund',
      answerLabel: 'Use my emergency fund',
      expectedCategory: 'savings',
      expectedKeywords: ['emergency fund', 'savings', 'financial planning', 'preparedness'],
      testType: 'ai_generated'
    }
  ];

  async runAllTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    for (const scenario of this.testScenarios) {
      const result = await this.runSingleTest(scenario);
      results.push(result);
    }

    return results;
  }

  async runSingleTest(scenario: TestScenario): Promise<TestResult> {
    const startTime = Date.now();
    const issues: string[] = [];
    let score = 0;
    let generatedContent;

    try {
      // Generate article based on scenario type
      if (scenario.testType === 'ai_generated') {
        const generated = await aiContentService.generatePersonalizedArticle({
          questionPrompt: scenario.questionPrompt,
          selectedAnswer: scenario.answerValue,
          answerLabel: scenario.answerLabel,
          category: scenario.expectedCategory
        });

        generatedContent = {
          title: generated.title,
          content: generated.content,
          keyPoints: generated.keyPoints
        };

        // Validate content
        const validation = await this.validateGeneratedContent(generated, scenario);
        score = validation.score;
        issues.push(...validation.issues);
      }

      // Performance check
      const executionTime = Date.now() - startTime;
      if (executionTime > 10000) { // 10 seconds
        issues.push('Article generation took too long');
        score -= 0.2;
      }

    } catch (error) {
      issues.push(`Test execution failed: ${error}`);
      score = 0;
    }

    return {
      scenarioId: scenario.id,
      passed: score >= 0.7, // 70% threshold
      score: Math.max(0, Math.min(1, score)),
      issues,
      generatedContent,
      executionTime: Date.now() - startTime
    };
  }

  private async validateGeneratedContent(
    generated: any,
    scenario: TestScenario
  ): Promise<{ score: number; issues: string[] }> {
    let score = 1.0;
    const issues: string[] = [];

    // Check title quality
    if (!generated.title || generated.title.length < 10) {
      issues.push('Title is too short or missing');
      score -= 0.2;
    }

    // Check content quality
    if (!generated.content || generated.content.length < 100) {
      issues.push('Content is too short');
      score -= 0.3;
    }

    // Check for expected keywords
    const contentText = (generated.title + ' ' + generated.content).toLowerCase();
    const foundKeywords = scenario.expectedKeywords.filter(keyword => 
      contentText.includes(keyword.toLowerCase())
    );

    if (foundKeywords.length < scenario.expectedKeywords.length * 0.5) {
      issues.push(`Missing expected keywords. Found: ${foundKeywords.join(', ')}`);
      score -= 0.2;
    }

    // Check key points
    if (!generated.keyPoints || generated.keyPoints.length < 2) {
      issues.push('Insufficient key points');
      score -= 0.1;
    }

    // Check confidence score
    if (generated.confidence < 0.7) {
      issues.push('Low confidence score from AI');
      score -= 0.1;
    }

    return { score, issues };
  }

  async runPerformanceTest(iterations: number = 10): Promise<{
    averageTime: number;
    minTime: number;
    maxTime: number;
    successRate: number;
  }> {
    const times: number[] = [];
    let successes = 0;

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      try {
        await aiContentService.generatePersonalizedArticle({
          questionPrompt: 'Test question for performance',
          selectedAnswer: 'test_answer',
          answerLabel: 'Test Answer',
          category: 'general'
        });
        successes++;
      } catch (error) {
        console.error('Performance test error:', error);
      }
      times.push(Date.now() - startTime);
    }

    return {
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      successRate: successes / iterations
    };
  }

  async runA_BTest(
    scenarioA: TestScenario,
    scenarioB: TestScenario,
    iterations: number = 5
  ): Promise<{
    scenarioA: { averageScore: number; averageTime: number };
    scenarioB: { averageScore: number; averageTime: number };
    winner: 'A' | 'B' | 'tie';
  }> {
    const resultsA: TestResult[] = [];
    const resultsB: TestResult[] = [];

    for (let i = 0; i < iterations; i++) {
      resultsA.push(await this.runSingleTest(scenarioA));
      resultsB.push(await this.runSingleTest(scenarioB));
    }

    const avgScoreA = resultsA.reduce((sum, r) => sum + r.score, 0) / resultsA.length;
    const avgTimeA = resultsA.reduce((sum, r) => sum + r.executionTime, 0) / resultsA.length;

    const avgScoreB = resultsB.reduce((sum, r) => sum + r.score, 0) / resultsB.length;
    const avgTimeB = resultsB.reduce((sum, r) => sum + r.executionTime, 0) / resultsB.length;

    let winner: 'A' | 'B' | 'tie' = 'tie';
    if (avgScoreA > avgScoreB + 0.1) winner = 'A';
    else if (avgScoreB > avgScoreA + 0.1) winner = 'B';

    return {
      scenarioA: { averageScore: avgScoreA, averageTime: avgTimeA },
      scenarioB: { averageScore: avgScoreB, averageTime: avgTimeB },
      winner
    };
  }

  generateTestReport(results: TestResult[]): string {
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / total;
    const averageTime = results.reduce((sum, r) => sum + r.executionTime, 0) / total;

    let report = `# Article System Test Report\n\n`;
    report += `## Summary\n`;
    report += `- **Total Tests**: ${total}\n`;
    report += `- **Passed**: ${passed} (${((passed/total)*100).toFixed(1)}%)\n`;
    report += `- **Average Score**: ${(averageScore*100).toFixed(1)}%\n`;
    report += `- **Average Time**: ${averageTime.toFixed(0)}ms\n\n`;

    report += `## Detailed Results\n\n`;
    results.forEach(result => {
      report += `### ${result.scenarioId}\n`;
      report += `- **Status**: ${result.passed ? '✅ PASS' : '❌ FAIL'}\n`;
      report += `- **Score**: ${(result.score*100).toFixed(1)}%\n`;
      report += `- **Time**: ${result.executionTime}ms\n`;
      if (result.issues.length > 0) {
        report += `- **Issues**: ${result.issues.join(', ')}\n`;
      }
      if (result.generatedContent) {
        report += `- **Title**: ${result.generatedContent.title}\n`;
        report += `- **Key Points**: ${result.generatedContent.keyPoints.join(', ')}\n`;
      }
      report += `\n`;
    });

    return report;
  }
}

export const articleTestingFramework = ArticleTestingFramework.getInstance();
