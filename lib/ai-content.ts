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
  quizAnswers?: Array<{ question: string; answer: string }>;
}

export interface ArchetypeCopy {
  archetype: string;
  header: {
    title: string;
    subtitle: string;
  };
  validation: string;
  personalized_insights: string[];
  problem_realization: string;
  hope_and_solution: string;
  cta: {
    headline: string;
    body: string;
    button: string;
    secondary: string;
  };
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
    return `You are an expert direct-response editor and transformation copywriter who specializes in emotional "state change" writing. 
You take existing quiz result pages and rewrite them to follow the "Hidden Architecture of Quiz Funnels" emotional framework.

Your job is to rewrite the user's result page while:
- Keeping factual accuracy and personalization (name, archetype, answers, etc.)
- Increasing emotional depth, identity connection, and flow
- Following the five emotional stages of change

EMOTIONAL FRAMEWORK TO FOLLOW:

1️⃣ **Validation / Identity Recognition**
   - Start warm and affirming.
   - Make the user feel deeply seen ("You're the kind of person who…").
   - Use emotional cues tied to their archetype and answers.

2️⃣ **Functional Reflection**
   - Use 2–4 sentences that show their patterns of thinking or behavior.
   - Each should mix logic + emotion.
   - Use examples from their quiz answers naturally.

3️⃣ **Problem Realization (Emotional Contrast)**
   - Gently surface the hidden tension or contradiction they live with.
   - Create mild discomfort or awareness, never shame.
   - Example: "You've done everything right… but sometimes that control keeps you from moving forward."

4️⃣ **Relief / Hope / Solution**
   - Flip the tone to optimism.
   - Show how their strength can become their superpower with the right guidance.
   - Bridge into your offer ("That's exactly what we'll work on during your Free Financial Assessment…").

5️⃣ **CTA / Transformation Invitation**
   - Write a short, emotionally charged headline (identity or benefit based).
   - 2–3 sentences of encouragement or reassurance.
   - Button text: "Book My Free Financial Assessment"

STYLE RULES:
- Speak directly to the user by name.
- Write in short, rhythmic sentences (avoid long walls of text).
- Alternate positive → neutral → problem → hopeful tones.
- Sound like a coach or therapist guiding self-discovery, not a salesman.
- Preserve the original structure but rewrite each section with emotional momentum.
- If the current text is too logical or detached, make it warmer and more visceral.

OUTPUT FORMAT (JSON):
{
  "header": "",
  "validation": "",
  "reflection": "",
  "problem_realization": "",
  "hope_and_solution": "",
  "cta": {
    "headline": "",
    "body": "",
    "button": "Book My Free Financial Assessment"
  }
}`;
  }

  private buildUserPrompt(request: ArchetypeCopyRequest): string {
    // First generate the initial copy using the original approach
    const initialCopy = this.generateInitialCopy(request);
    
    let prompt = `Name: ${request.userName || 'User'}
Archetype: ${request.archetype}
Original_Result_Page_Text: ${JSON.stringify(initialCopy, null, 2)}

TASK:
Rewrite the entire page using the 5-stage emotional structure.
Keep existing personalization (name, answers, insights) but amplify emotional resonance, contrast, and flow.`;

    return prompt;
  }

  private generateInitialCopy(request: ArchetypeCopyRequest): any {
    // Generate initial copy using the previous method
    const archetype = request.archetype;
    const userName = request.userName || 'User';
    
    return {
      archetype: archetype,
      header: {
        title: "Your Financial Archetype",
        subtitle: `Hey ${userName}, based on your answers, you're a ${archetype} — focused, determined, and ready to eliminate financial obstacles.`
      },
      validation: `You're the kind of person who tackles challenges head-on and doesn't shy away from difficult financial decisions.`,
      personalized_insights: request.quizAnswers?.slice(0, 3).map(answer => 
        `You mentioned that you ${answer.answer.toLowerCase()} — that shows your dedication and commitment.`
      ) || [
        "You prioritize eliminating debt to build financial freedom",
        "You're motivated by clear progress and measurable results",
        "You prefer structured approaches to financial challenges"
      ],
      problem_realization: `Your biggest challenge isn't motivation — it's maintaining momentum when progress feels slow.`,
      hope_and_solution: `When that determination is paired with the right strategy, your debt-free timeline can accelerate dramatically. In your Free Financial Assessment Call, we'll help you identify which debts to tackle first and design a plan that maximizes your momentum.`,
      cta: {
        headline: "Ready to Crush Your Debt Faster?",
        body: "Let's turn your determination into a strategic debt elimination plan that delivers results.",
        button: "Book My Free Financial Assessment",
        secondary: "Join Waitlist"
      }
    };
  }

  private parseArchetypeResponse(response: string): ArchetypeCopy {
    try {
      const parsed = JSON.parse(response);
      return {
        archetype: parsed.archetype || 'Financial Profile',
        header: {
          title: parsed.header?.title || 'Your Financial Archetype',
          subtitle: parsed.header?.subtitle || parsed.header || 'Based on your answers, this is your financial personality type.'
        },
        validation: parsed.validation || 'You have unique financial strengths and opportunities for growth.',
        personalized_insights: parsed.reflection ? [parsed.reflection] : 
                             Array.isArray(parsed.personalized_insights) ? parsed.personalized_insights : [],
        problem_realization: parsed.problem_realization || 'Your financial journey has unique challenges to overcome.',
        hope_and_solution: parsed.hope_and_solution || 'With the right guidance, you can achieve your financial goals.',
        cta: {
          headline: parsed.cta?.headline || 'Ready to Take Action?',
          body: parsed.cta?.body || 'Let\'s turn your financial insights into actionable results.',
          button: parsed.cta?.button || 'Book My Free Financial Assessment',
          secondary: parsed.cta?.secondary || 'Join Waitlist'
        }
      };
    } catch {
      // Fallback: treat as plain text and create basic structure
      return {
        archetype: 'Financial Profile',
        header: {
          title: 'Your Financial Archetype',
          subtitle: 'Based on your answers, this is your financial personality type.'
        },
        validation: 'You have unique financial strengths and opportunities for growth.',
        personalized_insights: [response.substring(0, 200) + '...'],
        problem_realization: 'Your financial journey has unique challenges to overcome.',
        hope_and_solution: 'With the right guidance, you can achieve your financial goals.',
        cta: {
          headline: 'Ready to Take Action?',
          body: 'Let\'s turn your financial insights into actionable results.',
          button: 'Book My Free Financial Assessment',
          secondary: 'Join Waitlist'
        }
      };
    }
  }

  private getFallbackCopy(archetype: string): ArchetypeCopy {
    const fallbackCopies: Record<string, ArchetypeCopy> = {
      "Debt Crusher": {
        archetype: "Debt Crusher",
        header: {
          title: "Your Financial Archetype",
          subtitle: "You're a Debt Crusher — focused, determined, and ready to eliminate financial obstacles."
        },
        validation: "You're the kind of person who tackles challenges head-on and doesn't shy away from difficult financial decisions.",
        personalized_insights: [
          "You prioritize eliminating debt to build financial freedom",
          "You're motivated by clear progress and measurable results",
          "You prefer structured approaches to financial challenges"
        ],
        problem_realization: "Your biggest challenge isn't motivation — it's maintaining momentum when progress feels slow.",
        hope_and_solution: "When that determination is paired with the right strategy, your debt-free timeline can accelerate dramatically. In your Free Financial Assessment Call, we'll help you identify which debts to tackle first and design a plan that maximizes your momentum.",
        cta: {
          headline: "Ready to Crush Your Debt Faster?",
          body: "Let's turn your determination into a strategic debt elimination plan that delivers results.",
          button: "Book My Free Financial Assessment",
          secondary: "Join Waitlist"
        }
      },
      "Savings Builder": {
        archetype: "Savings Builder",
        header: {
          title: "Your Financial Archetype",
          subtitle: "You're a Savings Builder — patient, strategic, and committed to building long-term wealth."
        },
        validation: "You're the kind of person who values security and understands that wealth is built through consistent, disciplined action.",
        personalized_insights: [
          "You value security and building wealth over time",
          "You prefer predictable, low-risk financial strategies",
          "You're disciplined about setting money aside regularly"
        ],
        problem_realization: "Your biggest challenge isn't discipline — it's ensuring your savings strategy is optimized for maximum growth.",
        hope_and_solution: "When that patience is paired with the right vehicles, your wealth can compound exponentially. In your Free Financial Assessment Call, we'll help you identify which savings strategies will deliver the best returns for your timeline.",
        cta: {
          headline: "Ready to Build Wealth Faster?",
          body: "Let's optimize your savings strategy to maximize growth while maintaining your security.",
          button: "Book My Free Financial Assessment",
          secondary: "Join Waitlist"
        }
      },
      "Stability Seeker": {
        archetype: "Stability Seeker",
        header: {
          title: "Your Financial Archetype",
          subtitle: "You're a Stability Seeker — cautious, thoughtful, and committed to financial security."
        },
        validation: "You're the kind of person who makes careful, well-researched decisions and values peace of mind over risky gains.",
        personalized_insights: [
          "You prefer predictable, low-risk financial strategies",
          "You value security over high returns",
          "You make decisions carefully and avoid unnecessary risks"
        ],
        problem_realization: "Your biggest challenge isn't risk management — it's ensuring your cautious approach doesn't limit your long-term growth potential.",
        hope_and_solution: "When that caution is paired with the right conservative strategies, you can achieve steady, reliable growth. In your Free Financial Assessment Call, we'll help you identify safe investment options that can still deliver meaningful returns.",
        cta: {
          headline: "Ready to Grow Your Wealth Safely?",
          body: "Let's design a conservative growth strategy that protects your peace of mind while building wealth.",
          button: "Book My Free Financial Assessment",
          secondary: "Join Waitlist"
        }
      },
      "Optimizer": {
        archetype: "Optimizer",
        header: {
          title: "Your Financial Archetype",
          subtitle: "You're an Optimizer — strategic, analytical, and focused on maximizing every financial opportunity."
        },
        validation: "You're the kind of person who loves analyzing data and finding ways to improve every aspect of your financial strategy.",
        personalized_insights: [
          "You're strategic about maximizing returns and efficiency",
          "You enjoy analyzing financial data and trends",
          "You're comfortable with calculated risks for better returns"
        ],
        problem_realization: "Your biggest challenge isn't analysis — it's avoiding analysis paralysis and taking action on your insights.",
        hope_and_solution: "When that analytical mind is paired with proven strategies, your results can exceed expectations. In your Free Financial Assessment Call, we'll help you identify which optimization strategies will deliver the best returns for your situation.",
        cta: {
          headline: "Ready to Optimize Your Financial Strategy?",
          body: "Let's turn your analytical skills into a comprehensive wealth maximization plan.",
          button: "Book My Free Financial Assessment",
          secondary: "Join Waitlist"
        }
      },
    };

    return fallbackCopies[archetype] || fallbackCopies["Stability Seeker"];
  }
}

export const archetypeCopyService = ArchetypeCopyService.getInstance();

export const aiContentService = AIContentService.getInstance();
