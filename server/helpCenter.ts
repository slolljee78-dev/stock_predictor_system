/**
 * Help Center & FAQ System
 * Comprehensive documentation and support resources
 */

export interface HelpArticle {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  content: string;
  keywords: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  createdAt: Date;
  updatedAt: Date;
  relatedArticles: string[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  views: number;
  helpful: number;
  notHelpful: number;
  tags: string[];
}

export interface SupportTicket {
  id: string;
  userId: number;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'waiting' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  responses: Array<{
    id: string;
    from: 'user' | 'support';
    message: string;
    timestamp: Date;
  }>;
}

export interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  articleCount: number;
  faqCount: number;
}

const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Learn the basics of Stock Predictor',
    icon: '🚀',
    articleCount: 0,
    faqCount: 0,
  },
  {
    id: 'trading',
    name: 'Trading & Signals',
    description: 'Understand trading signals and execution',
    icon: '💹',
    articleCount: 0,
    faqCount: 0,
  },
  {
    id: 'portfolio',
    name: 'Portfolio Management',
    description: 'Manage and analyze your portfolio',
    icon: '📊',
    articleCount: 0,
    faqCount: 0,
  },
  {
    id: 'account',
    name: 'Account & Billing',
    description: 'Account settings and subscription management',
    icon: '⚙️',
    articleCount: 0,
    faqCount: 0,
  },
  {
    id: 'technical',
    name: 'Technical Analysis',
    description: 'Learn about technical indicators',
    icon: '📈',
    articleCount: 0,
    faqCount: 0,
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    description: 'Solve common issues',
    icon: '🔧',
    articleCount: 0,
    faqCount: 0,
  },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'What is Stock Predictor?',
    answer:
      'Stock Predictor is an AI-powered trading platform that provides intelligent buy/sell signals using machine learning models, technical analysis, and market sentiment analysis.',
    category: 'getting-started',
    views: 0,
    helpful: 0,
    notHelpful: 0,
    tags: ['overview', 'introduction'],
  },
  {
    id: 'faq-2',
    question: 'How do I get started?',
    answer:
      'Sign up for a free account, complete your profile, add stocks to your watchlist, and start receiving AI trading signals. You can practice with paper trading before using real money.',
    category: 'getting-started',
    views: 0,
    helpful: 0,
    notHelpful: 0,
    tags: ['onboarding', 'setup'],
  },
  {
    id: 'faq-3',
    question: 'What is paper trading?',
    answer:
      'Paper trading is a simulated trading environment where you can practice trading with virtual money. It allows you to test strategies without risking real capital.',
    category: 'trading',
    views: 0,
    helpful: 0,
    notHelpful: 0,
    tags: ['trading', 'practice'],
  },
  {
    id: 'faq-4',
    question: 'How accurate are the trading signals?',
    answer:
      'Our AI models achieve approximately 65% win rate based on historical backtesting. However, past performance does not guarantee future results. Always use proper risk management.',
    category: 'trading',
    views: 0,
    helpful: 0,
    notHelpful: 0,
    tags: ['signals', 'accuracy'],
  },
  {
    id: 'faq-5',
    question: 'Can I use real money?',
    answer:
      'Yes, with our Pro and Elite plans, you can connect your Trading 212 broker account for real trading. Start with paper trading to build confidence.',
    category: 'trading',
    views: 0,
    helpful: 0,
    notHelpful: 0,
    tags: ['real-trading', 'broker'],
  },
  {
    id: 'faq-6',
    question: 'What are the subscription plans?',
    answer:
      'We offer three plans: Starter (£9.99/month) with 50 stocks, Pro (£29.99/month) with 212 stocks and real trading, and Elite (£99.99/month) with unlimited stocks and API access.',
    category: 'account',
    views: 0,
    helpful: 0,
    notHelpful: 0,
    tags: ['pricing', 'plans'],
  },
  {
    id: 'faq-7',
    question: 'Is there a free trial?',
    answer:
      'Yes! New users get a 7-day free trial with full access to all features. After the trial, you can use our free Freemium tier with limited features.',
    category: 'account',
    views: 0,
    helpful: 0,
    notHelpful: 0,
    tags: ['trial', 'free'],
  },
  {
    id: 'faq-8',
    question: 'What technical indicators are available?',
    answer:
      'We provide 15+ indicators including RSI, MACD, Bollinger Bands, Moving Averages, Stochastic, ATR, ADX, and more. Each signal is based on multiple indicators.',
    category: 'technical',
    views: 0,
    helpful: 0,
    notHelpful: 0,
    tags: ['indicators', 'technical-analysis'],
  },
];

const HELP_ARTICLES: HelpArticle[] = [
  {
    id: 'article-1',
    title: 'Getting Started with Stock Predictor',
    category: 'getting-started',
    content: `
# Getting Started with Stock Predictor

Stock Predictor is an AI-powered trading platform designed to help you make smarter trading decisions.

## Step 1: Create Your Account
Sign up with your email and create a password. Verify your email address.

## Step 2: Complete Your Profile
Add your trading experience level, investment goals, and risk tolerance.

## Step 3: Add Stocks to Your Watchlist
Search for stocks you want to monitor and add them to your watchlist.

## Step 4: Receive Trading Signals
Start receiving AI-generated buy/sell signals with confidence scores.

## Step 5: Practice with Paper Trading
Use our simulated trading environment to practice before using real money.

## Next Steps
- Read about technical indicators
- Learn about risk management
- Explore the leaderboard
- Join our community
    `,
    keywords: ['getting-started', 'onboarding', 'setup'],
    views: 0,
    helpful: 0,
    notHelpful: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    relatedArticles: ['article-2', 'article-3'],
  },
  {
    id: 'article-2',
    title: 'Understanding Trading Signals',
    category: 'trading',
    content: `
# Understanding Trading Signals

Our AI generates trading signals based on multiple factors:

## Signal Components
1. **Technical Analysis** - 15+ indicators
2. **Machine Learning** - LSTM, XGBoost, Ensemble models
3. **Sentiment Analysis** - Market sentiment and news
4. **Market Regime** - Current market conditions

## Signal Confidence
- Green (High): 70-100% confidence
- Yellow (Medium): 50-70% confidence
- Red (Low): <50% confidence

## How to Use Signals
1. Review the signal details
2. Check the technical indicators
3. Consider your risk tolerance
4. Execute the trade or skip it

## Risk Management
Always use stop losses and take profits to manage risk.
    `,
    keywords: ['signals', 'trading', 'indicators'],
    views: 0,
    helpful: 0,
    notHelpful: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    relatedArticles: ['article-1', 'article-4'],
  },
];

/**
 * Get help categories
 */
export function getHelpCategories(): HelpCategory[] {
  return HELP_CATEGORIES;
}

/**
 * Get FAQ items
 */
export function getFAQItems(category?: string): FAQItem[] {
  if (category) {
    return FAQ_ITEMS.filter((item) => item.category === category);
  }
  return FAQ_ITEMS;
}

/**
 * Get help articles
 */
export function getHelpArticles(category?: string): HelpArticle[] {
  if (category) {
    return HELP_ARTICLES.filter((article) => article.category === category);
  }
  return HELP_ARTICLES;
}

/**
 * Search help content
 */
export function searchHelp(query: string): { articles: HelpArticle[]; faqs: FAQItem[] } {
  const lowerQuery = query.toLowerCase();

  const articles = HELP_ARTICLES.filter((article) => article.title.toLowerCase().includes(lowerQuery) || article.keywords.some((k) => k.includes(lowerQuery)));

  const faqs = FAQ_ITEMS.filter((faq) => faq.question.toLowerCase().includes(lowerQuery) || faq.tags.some((t) => t.includes(lowerQuery)));

  return { articles, faqs };
}

/**
 * Mark FAQ as helpful
 */
export function markFAQHelpful(faqId: string, helpful: boolean): void {
  const faq = FAQ_ITEMS.find((f) => f.id === faqId);
  if (faq) {
    if (helpful) {
      faq.helpful++;
    } else {
      faq.notHelpful++;
    }
  }
}

/**
 * Create support ticket
 */
export function createSupportTicket(userId: number, subject: string, description: string, category: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'): SupportTicket {
  return {
    id: `ticket-${Date.now()}`,
    userId,
    subject,
    description,
    category,
    priority,
    status: 'open',
    createdAt: new Date(),
    updatedAt: new Date(),
    responses: [
      {
        id: `resp-${Date.now()}`,
        from: 'support',
        message: 'Thank you for contacting us. We have received your ticket and will respond shortly.',
        timestamp: new Date(),
      },
    ],
  };
}

/**
 * Generate help center homepage
 */
export function generateHelpCenterHomepage(): string {
  const categories = getHelpCategories();
  const topFAQs = getFAQItems().slice(0, 5);

  const homepage = `
# Help Center

## Browse by Category
${categories.map((cat) => `- [${cat.icon} ${cat.name}](${cat.id}) - ${cat.description}`).join('\n')}

## Popular Questions
${topFAQs.map((faq) => `- [${faq.question}](#${faq.id})`).join('\n')}

## Contact Support
Can't find what you're looking for? [Create a support ticket](#support)

## Community
Join our community forum to connect with other traders and share strategies.
  `;

  return homepage;
}
