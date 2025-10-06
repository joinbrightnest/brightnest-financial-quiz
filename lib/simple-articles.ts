// Simple article system - like Noom but with AI generation and customization

export interface SimpleArticle {
  id: string;
  category: string;
  title: string;
  content: string;
  stat: string;
  description: string;
  keyPoints: string[];
  isCustomized: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleMatch {
  category: string;
  confidence: number;
}

export class SimpleArticleSystem {
  private static instance: SimpleArticleSystem;
  private articles: Map<string, SimpleArticle> = new Map();
  
  static getInstance(): SimpleArticleSystem {
    if (!SimpleArticleSystem.instance) {
      SimpleArticleSystem.instance = new SimpleArticleSystem();
    }
    return SimpleArticleSystem.instance;
  }

  // Load articles from localStorage or initialize with defaults
  async loadArticles(): Promise<void> {
    try {
      const stored = localStorage.getItem('brightnest_articles');
      if (stored) {
        const articles = JSON.parse(stored);
        this.articles = new Map(Object.entries(articles));
      } else {
        // Initialize with default articles
        await this.initializeDefaultArticles();
      }
    } catch (error) {
      console.error('Failed to load articles:', error);
      await this.initializeDefaultArticles();
    }
  }

  // Save articles to localStorage
  async saveArticles(): Promise<void> {
    try {
      const articlesObj = Object.fromEntries(this.articles);
      localStorage.setItem('brightnest_articles', JSON.stringify(articlesObj));
    } catch (error) {
      console.error('Failed to save articles:', error);
    }
  }

  // Get article for a specific answer
  async getArticleForAnswer(questionPrompt: string, answerValue: string, answerLabel: string): Promise<SimpleArticle | null> {
    const category = this.determineCategory(questionPrompt, answerLabel);
    return this.articles.get(category) || null;
  }

  // Generate or get article for category
  async generateOrGetArticle(category: string, questionPrompt?: string, answerLabel?: string): Promise<SimpleArticle> {
    // Check if we already have a customized article
    const existing = this.articles.get(category);
    if (existing && existing.isCustomized) {
      return existing;
    }

    // Generate new article with AI
    const generated = await this.generateAIArticle(category, questionPrompt, answerLabel);
    
    // Save the generated article
    this.articles.set(category, generated);
    await this.saveArticles();
    
    return generated;
  }

  // Update article (when you customize it)
  async updateArticle(category: string, updates: Partial<SimpleArticle>): Promise<void> {
    const existing = this.articles.get(category);
    if (existing) {
      const updated = {
        ...existing,
        ...updates,
        isCustomized: true,
        updatedAt: new Date().toISOString()
      };
      this.articles.set(category, updated);
      await this.saveArticles();
    }
  }

  // Get all articles for management
  getAllArticles(): SimpleArticle[] {
    return Array.from(this.articles.values());
  }

  // Delete article
  async deleteArticle(category: string): Promise<void> {
    this.articles.delete(category);
    await this.saveArticles();
  }

  // Determine category from question/answer
  private determineCategory(questionPrompt: string, answerLabel: string): string {
    const prompt = questionPrompt.toLowerCase();
    const answer = answerLabel.toLowerCase();
    
    // Marriage/Relationship keywords
    if (prompt.includes('marriage') || prompt.includes('relationship') || prompt.includes('partner') ||
        answer.includes('marriage') || answer.includes('relationship') || answer.includes('partner')) {
      return 'marriage';
    }
    
    // Health keywords
    if (prompt.includes('health') || prompt.includes('stress') || prompt.includes('wellness') ||
        answer.includes('health') || answer.includes('stress') || answer.includes('wellness')) {
      return 'health';
    }
    
    // Career keywords
    if (prompt.includes('career') || prompt.includes('job') || prompt.includes('work') ||
        answer.includes('career') || answer.includes('job') || answer.includes('work')) {
      return 'career';
    }
    
    // Savings keywords
    if (prompt.includes('save') || prompt.includes('emergency') || prompt.includes('budget') ||
        answer.includes('save') || answer.includes('emergency') || answer.includes('budget')) {
      return 'savings';
    }
    
    // Debt keywords
    if (prompt.includes('debt') || prompt.includes('credit') || prompt.includes('loan') ||
        answer.includes('debt') || answer.includes('credit') || answer.includes('loan')) {
      return 'debt';
    }
    
    // Investing keywords
    if (prompt.includes('invest') || prompt.includes('stock') || prompt.includes('retirement') ||
        answer.includes('invest') || answer.includes('stock') || answer.includes('retirement')) {
      return 'investing';
    }
    
    // Default
    return 'general';
  }

  // Generate AI article for category
  private async generateAIArticle(category: string, questionPrompt?: string, answerLabel?: string): Promise<SimpleArticle> {
    try {
      const response = await fetch('/api/admin/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionPrompt: questionPrompt || `Financial question about ${category}`,
          answerValue: category,
          answerLabel: answerLabel || category,
          category: category
        })
      });

      if (response.ok) {
        const data = await response.json();
        const article = data.article;
        
        // Extract stat from key points
        const statMatch = article.keyPoints?.[0]?.match(/(\d+%)/);
        const stat = statMatch ? statMatch[0] : this.getDefaultStat(category);
        const description = article.keyPoints?.[0]?.replace(/\d+%/, "").trim() || this.getDefaultDescription(category);
        
        return {
          id: `article-${category}-${Date.now()}`,
          category,
          title: article.title,
          content: article.content,
          stat,
          description,
          keyPoints: article.keyPoints || [],
          isCustomized: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Failed to generate AI article:', error);
    }

    // Fallback to default article
    return this.getDefaultArticle(category);
  }

  // Initialize with default articles
  private async initializeDefaultArticles(): Promise<void> {
    const defaultArticles = [
      {
        id: 'article-marriage-default',
        category: 'marriage',
        title: 'Financial Stress and Relationships',
        content: 'Financial disagreements are the leading cause of relationship problems. When money becomes a source of conflict, it can strain even the strongest relationships. Open communication about finances is crucial for maintaining a healthy partnership.',
        stat: '70%',
        description: 'of divorces are caused by financial stress',
        keyPoints: ['70% of divorces are caused by financial stress', 'Couples who discuss money weekly are happier', 'Financial transparency builds trust'],
        isCustomized: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'article-health-default',
        category: 'health',
        title: 'Money and Your Health',
        content: 'Financial stress can have serious impacts on your physical and mental well-being. Studies show that money worries can lead to sleep problems, anxiety, and even physical health issues. Taking control of your finances can improve your overall health.',
        stat: '65%',
        description: 'of people report financial stress affects their health',
        keyPoints: ['65% of people report financial stress affects their health', 'Money worries can cause sleep problems', 'Financial planning reduces anxiety'],
        isCustomized: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'article-career-default',
        category: 'career',
        title: 'Career and Financial Planning',
        content: 'Your career choices and financial decisions are deeply interconnected. Investing in your professional development can lead to better earning potential, while smart financial planning can give you the freedom to make career changes.',
        stat: '80%',
        description: 'of people say money impacts career decisions',
        keyPoints: ['80% of people say money impacts career decisions', 'Professional development increases earning potential', 'Financial security enables career flexibility'],
        isCustomized: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    defaultArticles.forEach(article => {
      this.articles.set(article.category, article);
    });

    await this.saveArticles();
  }

  // Get default stat for category
  private getDefaultStat(category: string): string {
    const stats = {
      marriage: '70%',
      health: '65%',
      career: '80%',
      savings: '40%',
      debt: '77%',
      investing: '55%',
      general: '75%'
    };
    return stats[category as keyof typeof stats] || '75%';
  }

  // Get default description for category
  private getDefaultDescription(category: string): string {
    const descriptions = {
      marriage: 'of divorces are caused by financial stress',
      health: 'of people report financial stress affects their health',
      career: 'of people say money impacts career decisions',
      savings: 'of Americans can\'t cover a $400 emergency',
      debt: 'of Americans have some form of debt',
      investing: 'of Americans don\'t invest in the stock market',
      general: 'of people face similar financial challenges'
    };
    return descriptions[category as keyof typeof descriptions] || 'of people face similar challenges';
  }

  // Get default article for category
  private getDefaultArticle(category: string): SimpleArticle {
    return {
      id: `article-${category}-default`,
      category,
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} Financial Insight`,
      content: `Your answer relates to ${category} and finances. This is an important area to consider when planning your financial future.`,
      stat: this.getDefaultStat(category),
      description: this.getDefaultDescription(category),
      keyPoints: [`${this.getDefaultStat(category)} ${this.getDefaultDescription(category)}`],
      isCustomized: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

export const simpleArticleSystem = SimpleArticleSystem.getInstance();
