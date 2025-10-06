import { prisma } from './prisma';
import { aiContentService, ArticleGenerationRequest } from './ai-content';

export interface ArticleTrigger {
  questionId?: string;
  optionValue?: string;
  condition?: {
    scoreRanges?: Record<string, { min: number; max: number }>;
    requiredAnswers?: Array<{ questionId: string; value: string }>;
    tags?: string[];
  };
  priority: number;
}

export interface ArticleMatch {
  article: {
    id: string;
    title: string;
    content: string;
    type: string;
    category: string;
  };
  trigger: ArticleTrigger;
  confidence: number;
}

export class ArticleService {
  private static instance: ArticleService;
  
  static getInstance(): ArticleService {
    if (!ArticleService.instance) {
      ArticleService.instance = new ArticleService();
    }
    return ArticleService.instance;
  }

  async getRelevantArticles(
    sessionId: string,
    currentQuestionId?: string,
    currentAnswer?: string
  ): Promise<ArticleMatch[]> {
    // Get session and all answers
    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        answers: {
          include: { question: true }
        }
      }
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Get all active article triggers
    const triggers = await prisma.articleTrigger.findMany({
      where: { isActive: true },
      include: {
        article: {
          where: { isActive: true }
        }
      }
    });

    const matches: ArticleMatch[] = [];

    for (const trigger of triggers) {
      if (!trigger.article) continue;

      const confidence = await this.calculateMatchConfidence(
        trigger,
        session.answers,
        currentQuestionId,
        currentAnswer
      );

      if (confidence > 0.3) { // Minimum confidence threshold
        matches.push({
          article: {
            id: trigger.article.id,
            title: trigger.article.title,
            content: trigger.article.content,
            type: trigger.article.type,
            category: trigger.article.category
          },
          trigger: {
            questionId: trigger.questionId || undefined,
            optionValue: trigger.optionValue || undefined,
            condition: trigger.condition as any,
            priority: trigger.priority
          },
          confidence
        });
      }
    }

    // Sort by priority and confidence
    return matches.sort((a, b) => {
      if (a.trigger.priority !== b.trigger.priority) {
        return b.trigger.priority - a.trigger.priority;
      }
      return b.confidence - a.confidence;
    });
  }

  async generateDynamicArticle(
    sessionId: string,
    questionId: string,
    answerValue: string,
    answerLabel: string
  ): Promise<ArticleMatch | null> {
    let question: any = null;
    let session: any = null;
    let context: any = {};

    try {
      // Get question and session context
      question = await prisma.quizQuestion.findUnique({
        where: { id: questionId }
      });

      session = await prisma.quizSession.findUnique({
        where: { id: sessionId },
        include: {
          answers: {
            include: { question: true }
          }
        }
      });

      if (question && session) {
        // Build context for AI generation
        context = {
          previousAnswers: session.answers.map((answer: any) => ({
            question: answer.question.prompt,
            answer: typeof answer.value === 'string' ? answer.value : JSON.stringify(answer.value)
          })),
          currentScores: await this.calculateCurrentScores(sessionId)
        };
      }
    } catch (error) {
      console.error('Database error, proceeding with basic article generation:', error);
      // Continue with basic generation even if database is not available
    }

    // Determine category from question or quiz type
    const category = question ? this.determineCategory(question.quizType, question.prompt) : 'general';

    const request: ArticleGenerationRequest = {
      questionPrompt: question?.prompt || 'Financial question',
      selectedAnswer: answerValue,
      answerLabel,
      category,
      context
    };

    try {
      const generated = await aiContentService.generatePersonalizedArticle(request);
      
      // Create temporary article match
      return {
        article: {
          id: `generated-${Date.now()}`,
          title: generated.title,
          content: generated.content,
          type: 'ai_generated',
          category
        },
        trigger: {
          questionId,
          optionValue: answerValue,
          priority: 5
        },
        confidence: generated.confidence
      };
    } catch (error) {
      console.error('Failed to generate dynamic article:', error);
      return null;
    }
  }

  async createStaticArticle(
    title: string,
    content: string,
    category: string,
    triggers: ArticleTrigger[]
  ) {
    const article = await prisma.article.create({
      data: {
        title,
        content,
        type: 'static',
        category,
        tags: []
      }
    });

    // Create triggers
    for (const trigger of triggers) {
      await prisma.articleTrigger.create({
        data: {
          articleId: article.id,
          questionId: trigger.questionId,
          optionValue: trigger.optionValue,
          condition: trigger.condition,
          priority: trigger.priority
        }
      });
    }

    return article;
  }

  async createTemplateArticle(
    name: string,
    template: string,
    category: string,
    variables: string[],
    triggers: ArticleTrigger[]
  ) {
    const templateRecord = await prisma.articleTemplate.create({
      data: {
        name,
        template,
        category,
        variables
      }
    });

    // Create triggers for template
    for (const trigger of triggers) {
      await prisma.articleTrigger.create({
        data: {
          articleId: templateRecord.id, // Using template ID as article ID for now
          questionId: trigger.questionId,
          optionValue: trigger.optionValue,
          condition: trigger.condition,
          priority: trigger.priority
        }
      });
    }

    return templateRecord;
  }

  async recordArticleView(sessionId: string, articleId: string) {
    try {
      await prisma.articleView.create({
        data: {
          sessionId,
          articleId
        }
      });
    } catch (error) {
      // Ignore duplicate view errors
      console.log('Article view already recorded or error:', error);
    }
  }

  private async calculateMatchConfidence(
    trigger: any,
    answers: any[],
    currentQuestionId?: string,
    currentAnswer?: string
  ): Promise<number> {
    let confidence = 0;

    // Check direct question/answer match
    if (trigger.questionId && trigger.optionValue) {
      if (currentQuestionId === trigger.questionId && currentAnswer === trigger.optionValue) {
        confidence += 0.8;
      } else {
        // Check historical answers
        const matchingAnswer = answers.find(
          answer => answer.questionId === trigger.questionId && 
                   answer.value === trigger.optionValue
        );
        if (matchingAnswer) {
          confidence += 0.6;
        }
      }
    }

    // Check complex conditions
    if (trigger.condition) {
      const condition = trigger.condition as any;
      
      // Check score ranges
      if (condition.scoreRanges) {
        const scores = await this.calculateCurrentScores(answers[0]?.sessionId);
        for (const [category, range] of Object.entries(condition.scoreRanges)) {
          const score = scores[category as string] || 0;
          const { min, max } = range as { min: number; max: number };
          if (score >= min && score <= max) {
            confidence += 0.3;
          }
        }
      }

      // Check required answers
      if (condition.requiredAnswers) {
        let requiredMatches = 0;
        for (const required of condition.requiredAnswers) {
          const hasMatch = answers.some(
            answer => answer.questionId === required.questionId && 
                     answer.value === required.value
          );
          if (hasMatch) requiredMatches++;
        }
        confidence += (requiredMatches / condition.requiredAnswers.length) * 0.4;
      }
    }

    return Math.min(confidence, 1.0);
  }

  private determineCategory(quizType: string, questionPrompt: string): string {
    const prompt = questionPrompt.toLowerCase();
    
    if (prompt.includes('marriage') || prompt.includes('relationship') || prompt.includes('partner')) {
      return 'marriage';
    }
    if (prompt.includes('health') || prompt.includes('stress') || prompt.includes('wellness')) {
      return 'health';
    }
    if (prompt.includes('career') || prompt.includes('job') || prompt.includes('work')) {
      return 'career';
    }
    
    return 'general';
  }

  private async calculateCurrentScores(sessionId: string): Promise<Record<string, number>> {
    // This would use your existing scoring logic
    // For now, return empty scores
    return {
      debt: 0,
      savings: 0,
      spending: 0,
      investing: 0
    };
  }
}

export const articleService = ArticleService.getInstance();
