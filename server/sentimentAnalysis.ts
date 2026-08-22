/**
 * Sentiment Analysis Engine
 * Analyzes news articles and generates sentiment scores for stocks
 */

export interface NewsArticle {
  title: string;
  description?: string;
  content?: string;
  url: string;
  publishedAt: Date;
  source: string;
  sentiment?: number; // -1 to 1
}

export interface SentimentResult {
  ticker: string;
  sentimentScore: number; // -1 (very negative) to 1 (very positive)
  confidence: number; // 0 to 1
  articleCount: number;
  lastUpdated: Date;
  articles: NewsArticle[];
}

/**
 * Sentiment keywords for analysis
 */
const POSITIVE_KEYWORDS = [
  'surge', 'rally', 'gain', 'profit', 'growth', 'strong', 'bullish',
  'beat', 'outperform', 'upgrade', 'upside', 'positive', 'excellent',
  'record', 'breakthrough', 'innovation', 'success', 'momentum',
  'rally', 'soar', 'jump', 'spike', 'rise', 'advance', 'climb',
  'improve', 'recovery', 'rebound', 'surge', 'boom', 'thrive'
];

const NEGATIVE_KEYWORDS = [
  'crash', 'plunge', 'loss', 'decline', 'bearish', 'miss', 'underperform',
  'downgrade', 'downside', 'negative', 'poor', 'worst', 'collapse',
  'scandal', 'fraud', 'bankruptcy', 'crisis', 'risk', 'warning',
  'fall', 'drop', 'tumble', 'slump', 'sink', 'decline', 'decrease',
  'struggle', 'challenge', 'threat', 'concern', 'worry', 'fear'
];

/**
 * Calculate sentiment score for a single article
 */
export function calculateArticleSentiment(article: NewsArticle): number {
  const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();
  
  let positiveCount = 0;
  let negativeCount = 0;

  // Count positive keywords
  for (const keyword of POSITIVE_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      positiveCount += matches.length;
    }
  }

  // Count negative keywords
  for (const keyword of NEGATIVE_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      negativeCount += matches.length;
    }
  }

  // Calculate sentiment score
  const total = positiveCount + negativeCount;
  if (total === 0) return 0; // Neutral if no keywords found

  const sentiment = (positiveCount - negativeCount) / total;
  return Math.max(-1, Math.min(1, sentiment)); // Clamp to [-1, 1]
}

/**
 * Calculate aggregate sentiment from multiple articles
 */
export function calculateAggregatedSentiment(articles: NewsArticle[]): SentimentResult {
  if (articles.length === 0) {
    return {
      ticker: '',
      sentimentScore: 0,
      confidence: 0,
      articleCount: 0,
      lastUpdated: new Date(),
      articles: [],
    };
  }

  // Calculate sentiment for each article
  const sentiments = articles.map(article => {
    const sentiment = calculateArticleSentiment(article);
    return { ...article, sentiment };
  });

  // Calculate weighted average (recent articles weighted more heavily)
  const now = new Date().getTime();
  let weightedSum = 0;
  let totalWeight = 0;

  for (const article of sentiments) {
    const ageInDays = (now - article.publishedAt.getTime()) / (1000 * 60 * 60 * 24);
    const weight = Math.exp(-ageInDays / 7); // Exponential decay, half-life of 7 days
    
    weightedSum += (article.sentiment || 0) * weight;
    totalWeight += weight;
  }

  const aggregatedSentiment = totalWeight > 0 ? weightedSum / totalWeight : 0;

  // Calculate confidence based on article count and keyword density
  const confidence = Math.min(1, Math.sqrt(articles.length) / 5); // Confidence increases with article count

  return {
    ticker: articles[0]?.source || '',
    sentimentScore: Math.max(-1, Math.min(1, aggregatedSentiment)),
    confidence,
    articleCount: articles.length,
    lastUpdated: new Date(),
    articles: sentiments,
  };
}

/**
 * Classify sentiment into categories
 */
export function classifySentiment(score: number): 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive' {
  if (score < -0.6) return 'very_negative';
  if (score < -0.2) return 'negative';
  if (score < 0.2) return 'neutral';
  if (score < 0.6) return 'positive';
  return 'very_positive';
}

/**
 * Get sentiment color for UI display
 */
export function getSentimentColor(score: number): string {
  const classification = classifySentiment(score);
  
  switch (classification) {
    case 'very_negative':
      return '#dc2626'; // red-600
    case 'negative':
      return '#f97316'; // orange-500
    case 'neutral':
      return '#6b7280'; // gray-500
    case 'positive':
      return '#84cc16'; // lime-500
    case 'very_positive':
      return '#22c55e'; // green-500
  }
}

/**
 * Format sentiment score for display
 */
export function formatSentimentScore(score: number): string {
  const percentage = Math.round((score + 1) / 2 * 100);
  return `${percentage}%`;
}

/**
 * Generate sentiment summary text
 */
export function generateSentimentSummary(result: SentimentResult): string {
  const classification = classifySentiment(result.sentimentScore);
  const articleCount = result.articleCount;
  
  const summaries: Record<string, string> = {
    very_negative: `Extremely negative sentiment (${articleCount} articles analyzed)`,
    negative: `Negative sentiment (${articleCount} articles analyzed)`,
    neutral: `Neutral sentiment (${articleCount} articles analyzed)`,
    positive: `Positive sentiment (${articleCount} articles analyzed)`,
    very_positive: `Extremely positive sentiment (${articleCount} articles analyzed)`,
  };

  return summaries[classification];
}

/**
 * Mock news API response for testing
 */
export async function fetchNewsArticles(ticker: string, limit: number = 10): Promise<NewsArticle[]> {
  // In production, this would call a real news API like NewsAPI
  // For now, return mock data
  const mockArticles: NewsArticle[] = [
    {
      title: `${ticker} stock surges on strong quarterly earnings`,
      description: `${ticker} reported record profits and beat analyst expectations`,
      content: `The company announced strong growth momentum and positive outlook for next quarter`,
      url: `https://example.com/news/${ticker}-1`,
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      source: 'Financial News',
      sentiment: 0.8,
    },
    {
      title: `${ticker} faces regulatory challenges`,
      description: `New regulations could impact business operations`,
      content: `Industry analysts express concerns about compliance costs`,
      url: `https://example.com/news/${ticker}-2`,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      source: 'Business Weekly',
      sentiment: -0.6,
    },
    {
      title: `${ticker} innovation drives market confidence`,
      description: `New product launch receives positive reviews`,
      content: `Customers praise breakthrough features and performance improvements`,
      url: `https://example.com/news/${ticker}-3`,
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      source: 'Tech News',
      sentiment: 0.7,
    },
  ];

  return mockArticles.slice(0, limit);
}
