import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ArticleGenerationRequest {
  questionPrompt: string;
  selectedAnswer: string;
  answerLabel: string;
  category: string;
  context?: {
    previousAnswers?: Array<{ question: string; answer: string }>;
    currentScores?: Record<string, number>;
  };
}

export interface GeneratedArticle {
  title: string;
  content: string;
  keyPoints: string[];
  sources?: string[];
  confidence: number;
}

export class AIContentService {
  private static instance: AIContentService;
  
  static getInstance(): AIContentService {
    if (!AIContentService.instance) {
      AIContentService.instance = new AIContentService();
    }
    return AIContentService.instance;
  }

  async generatePersonalizedArticle(request: ArticleGenerationRequest): Promise<GeneratedArticle> {
    const systemPrompt = this.buildSystemPrompt(request.category);
    const userPrompt = this.buildUserPrompt(request);

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI');
      }

      return this.parseAIResponse(response);
    } catch (error) {
      console.error('AI Content Generation Error:', error);
      throw new Error('Failed to generate personalized content');
    }
  }

  async generateFromTemplate(template: string, variables: Record<string, any>): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a content generator that fills in templates with provided variables. Return only the filled template, no additional text."
          },
          {
            role: "user",
            content: `Template: ${template}\n\nVariables: ${JSON.stringify(variables)}\n\nFill in the template with the provided variables.`
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || template;
    } catch (error) {
      console.error('Template Generation Error:', error);
      return template; // Fallback to original template
    }
  }

  private buildSystemPrompt(category: string): string {
    const categoryPrompts = {
      marriage: `You are a financial relationship expert. Create informative, empathetic content about how finances affect relationships. Include relevant statistics and practical advice.`,
      health: `You are a financial wellness expert. Create content about the connection between financial stress and health. Include research-backed information and actionable tips.`,
      career: `You are a career and financial planning expert. Create content about how financial decisions impact career choices and professional growth.`,
      general: `You are a financial education expert. Create informative, engaging content that helps people understand financial concepts and their real-world implications.`
    };

    return categoryPrompts[category as keyof typeof categoryPrompts] || categoryPrompts.general;
  }

  private buildUserPrompt(request: ArticleGenerationRequest): string {
    let prompt = `Create a personalized article based on this quiz response:

Question: "${request.questionPrompt}"
Answer: "${request.answerLabel}" (value: "${request.selectedAnswer}")
Category: ${request.category}

`;

    if (request.context?.previousAnswers?.length) {
      prompt += `Previous answers for context:\n`;
      request.context.previousAnswers.forEach((qa, index) => {
        prompt += `${index + 1}. ${qa.question} → ${qa.answer}\n`;
      });
      prompt += '\n';
    }

    if (request.context?.currentScores) {
      prompt += `Current score breakdown: ${JSON.stringify(request.context.currentScores)}\n\n`;
    }

    prompt += `Requirements:
- Create an engaging title (max 60 characters)
- Write 150-200 words of informative content
- Include 1-2 key points with specific statistics (e.g., "70% of divorces are caused by financial stress")
- Add relevant research findings with percentages
- Make it personal and relatable
- Focus on actionable insights

Format your response as JSON:
{
  "title": "Article Title",
  "content": "Article content here...",
  "keyPoints": ["70% of divorces are caused by financial stress", "Couples who discuss money weekly are happier"],
  "sources": ["Source 1", "Source 2"],
  "confidence": 0.85
}`;

    return prompt;
  }

  private parseAIResponse(response: string): GeneratedArticle {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response);
      return {
        title: parsed.title || 'Financial Insight',
        content: parsed.content || response,
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
        sources: Array.isArray(parsed.sources) ? parsed.sources : [],
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.7
      };
    } catch {
      // Fallback: treat as plain text
      return {
        title: 'Financial Insight',
        content: response,
        keyPoints: [],
        sources: [],
        confidence: 0.5
      };
    }
  }

  async validateContent(content: string): Promise<{ isValid: boolean; issues: string[] }> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a content validator. Check if the content is appropriate, accurate, and follows financial education best practices."
          },
          {
            role: "user",
            content: `Validate this content: ${content}\n\nReturn JSON with "isValid" (boolean) and "issues" (array of strings).`
          }
        ],
        temperature: 0.1,
        max_tokens: 200,
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        try {
          return JSON.parse(response);
        } catch {
          return { isValid: true, issues: [] };
        }
      }
    } catch (error) {
      console.error('Content validation error:', error);
    }

    return { isValid: true, issues: [] };
  }
}

export const aiContentService = AIContentService.getInstance();
