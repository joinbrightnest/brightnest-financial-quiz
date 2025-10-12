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

export interface ArchetypeCopyRequest {
  archetype: string;
  quizSummary: string;
  scores?: Record<string, number>;
  userName?: string;
}

export interface ArchetypeCopy {
  archetype: string;
  header: string;
  insights: string[];
  challenge: string;
  good_news: string;
  cta: string;
}

export class ArchetypeCopyService {
  private static instance: ArchetypeCopyService;
  
  static getInstance(): ArchetypeCopyService {
    if (!ArchetypeCopyService.instance) {
      ArchetypeCopyService.instance = new ArchetypeCopyService();
    }
    return ArchetypeCopyService.instance;
  }

  async generatePersonalizedCopy(request: ArchetypeCopyRequest): Promise<ArchetypeCopy> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(request);

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI');
      }

      return this.parseArchetypeResponse(response);
    } catch (error) {
      console.error('Archetype Copy Generation Error:', error);
      // Return fallback copy
      return this.getFallbackCopy(request.archetype);
    }
  }

  private buildSystemPrompt(): string {
    return `You are a senior brand copywriter and behavioral marketing strategist who specializes in "functional quizzes" and emotional conversion funnels.

Your job is to write the full copy for a financial education quiz result page that feels 100% personalized to the user.

Use the "Hidden Architecture of Quiz Funnels" framework:
- Start positive (validation)
- Move to neutral (awareness) 
- End with negative (problem), then flip to positive (relief and solution).

Maintain psychological contrast, comfort language, and functional identity statements.

TONE GUIDELINES:
- Empathetic, conversational, professional
- Write as if talking directly to them ("you")
- Blend authority with warmth
- Maintain psychological contrast (good → neutral → problem → hope → action)
- Keep length between 250–400 words total

OUTPUT FORMAT (JSON):
{
  "archetype": "",
  "header": "",
  "insights": [""],
  "challenge": "",
  "good_news": "",
  "cta": ""
}`;
  }

  private buildUserPrompt(request: ArchetypeCopyRequest): string {
    let prompt = `Archetype: ${request.archetype}
Quiz Summary: ${request.quizSummary}`;

    if (request.userName) {
      prompt += `\nUser Name: ${request.userName}`;
    }

    if (request.scores) {
      prompt += `\nScore Breakdown: ${JSON.stringify(request.scores)}`;
    }

    prompt += `\n\nGenerate personalized copy following the framework above.`;

    return prompt;
  }

  private parseArchetypeResponse(response: string): ArchetypeCopy {
    try {
      const parsed = JSON.parse(response);
      return {
        archetype: parsed.archetype || 'Financial Profile',
        header: parsed.header || 'Your Financial Archetype',
        insights: Array.isArray(parsed.insights) ? parsed.insights : [],
        challenge: parsed.challenge || 'Your financial journey has unique opportunities.',
        good_news: parsed.good_news || 'With the right guidance, you can achieve your financial goals.',
        cta: parsed.cta || 'Ready to take the next step? Book your Free Financial Assessment.'
      };
    } catch {
      // Fallback: treat as plain text and create basic structure
      return {
        archetype: 'Financial Profile',
        header: 'Your Financial Archetype',
        insights: [response.substring(0, 200) + '...'],
        challenge: 'Your financial journey has unique opportunities.',
        good_news: 'With the right guidance, you can achieve your financial goals.',
        cta: 'Ready to take the next step? Book your Free Financial Assessment.'
      };
    }
  }

  private getFallbackCopy(archetype: string): ArchetypeCopy {
    const fallbackCopies: Record<string, ArchetypeCopy> = {
      "Debt Crusher": {
        archetype: "Debt Crusher",
        header: "You're a Debt Crusher — focused, determined, and ready to eliminate financial obstacles.",
        insights: [
          "You prioritize eliminating debt to build financial freedom",
          "You're motivated by clear progress and measurable results",
          "You prefer structured approaches to financial challenges"
        ],
        challenge: "Your biggest challenge isn't motivation — it's maintaining momentum when progress feels slow.",
        good_news: "When that determination is paired with the right strategy, your debt-free timeline can accelerate dramatically. In your Free Financial Assessment Call, we'll help you identify which debts to tackle first and design a plan that maximizes your momentum.",
        cta: "Ready to crush your debt faster? Book your Free Financial Assessment now and get a personalized debt elimination strategy."
      },
      "Savings Builder": {
        archetype: "Savings Builder", 
        header: "You're a Savings Builder — patient, strategic, and committed to building long-term wealth.",
        insights: [
          "You value security and building wealth over time",
          "You prefer predictable, low-risk financial strategies",
          "You're disciplined about setting money aside regularly"
        ],
        challenge: "Your biggest challenge isn't discipline — it's ensuring your savings strategy is optimized for maximum growth.",
        good_news: "When that patience is paired with the right vehicles, your wealth can compound exponentially. In your Free Financial Assessment Call, we'll help you identify which savings strategies will deliver the best returns for your timeline.",
        cta: "Ready to build wealth faster? Book your Free Financial Assessment now and get a personalized savings optimization plan."
      },
      "Stability Seeker": {
        archetype: "Stability Seeker",
        header: "You're a Stability Seeker — cautious, thoughtful, and committed to financial security.",
        insights: [
          "You prefer predictable, low-risk financial strategies",
          "You value security over high returns",
          "You make decisions carefully and avoid unnecessary risks"
        ],
        challenge: "Your biggest challenge isn't risk management — it's ensuring your cautious approach doesn't limit your long-term growth potential.",
        good_news: "When that caution is paired with the right conservative strategies, you can achieve steady, reliable growth. In your Free Financial Assessment Call, we'll help you identify safe investment options that can still deliver meaningful returns.",
        cta: "Ready to grow your wealth safely? Book your Free Financial Assessment now and get a personalized conservative growth strategy."
      },
      "Optimizer": {
        archetype: "Optimizer",
        header: "You're an Optimizer — strategic, analytical, and focused on maximizing every financial opportunity.",
        insights: [
          "You're strategic about maximizing returns and efficiency",
          "You enjoy analyzing financial data and trends",
          "You're comfortable with calculated risks for better returns"
        ],
        challenge: "Your biggest challenge isn't analysis — it's avoiding analysis paralysis and taking action on your insights.",
        good_news: "When that analytical mind is paired with proven strategies, your results can exceed expectations. In your Free Financial Assessment Call, we'll help you identify which optimization strategies will deliver the best returns for your situation.",
        cta: "Ready to optimize your financial strategy? Book your Free Financial Assessment now and get a personalized wealth maximization plan."
      }
    };

    return fallbackCopies[archetype] || fallbackCopies["Stability Seeker"];
  }
}

export const archetypeCopyService = ArchetypeCopyService.getInstance();

export const aiContentService = AIContentService.getInstance();
