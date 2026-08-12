/**
 * Real-time News & Sentiment Analysis Integration
 * Fetches news articles, analyzes sentiment, and integrates with trading signals
 */

export interface NewsArticle {
  id: string;
  ticker: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: Date;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number; // -1 to 1
  relevanceScore: number; // 0 to 1
  keywords: string[];
}

export interface SentimentSummary {
  ticker: string;
  averageSentiment: number; // -1 to 1
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  totalArticles: number;
  trend: 'improving' | 'declining' | 'stable';
  lastUpdated: Date;
}

export interface NewsImpactOnSignal {
  signalId: string;
  ticker: string;
  originalConfidence: number;
  adjustedConfidence: number;
  sentimentImpact: number; // -0.5 to 0.5
  newsCount: number;
  dominantSentiment: 'positive' | 'negative' | 'neutral';
}

/**
 * Analyze sentiment from text using keyword-based approach
 */
export function analyzeSentiment(text: string): {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
} {
  const lowerText = text.toLowerCase();

  // Positive keywords
  const positiveKeywords = [
    'surge', 'rally', 'gain', 'beat', 'outperform', 'strong', 'bullish',
    'growth', 'profit', 'earnings', 'upgrade', 'buy', 'positive', 'rise',
    'jump', 'soar', 'breakthrough', 'record', 'success', 'opportunity',
  ];

  // Negative keywords
  const negativeKeywords = [
    'plunge', 'crash', 'fall', 'miss', 'underperform', 'weak', 'bearish',
    'loss', 'decline', 'downgrade', 'sell', 'negative', 'drop', 'slump',
    'concern', 'risk', 'warning', 'failure', 'problem', 'threat',
  ];

  let positiveCount = 0;
  let negativeCount = 0;

  positiveKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    positiveCount += (text.match(regex) || []).length;
  });

  negativeKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    negativeCount += (text.match(regex) || []).length;
  });

  const total = positiveCount + negativeCount;

  if (total === 0) {
    return { sentiment: 'neutral', score: 0 };
  }

  const score = (positiveCount - negativeCount) / total;

  if (score > 0.2) {
    return { sentiment: 'positive', score: Math.min(1, score) };
  } else if (score < -0.2) {
    return { sentiment: 'negative', score: Math.max(-1, score) };
  } else {
    return { sentiment: 'neutral', score };
  }
}

/**
 * Extract keywords from news article
 */
export function extractKeywords(text: string, maxKeywords: number = 5): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 4);

  // Simple frequency-based keyword extraction
  const wordFreq: Record<string, number> = {};

  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Calculate relevance score for article to stock
 */
export function calculateRelevanceScore(
  articleText: string,
  ticker: string,
  companyName: string
): number {
  const lowerText = articleText.toLowerCase();
  const tickerLower = ticker.toLowerCase();
  const nameLower = companyName.toLowerCase();

  let relevanceScore = 0;

  // Direct ticker mention (high relevance)
  if (lowerText.includes(tickerLower)) {
    relevanceScore += 0.5;
  }

  // Company name mention (medium relevance)
  if (lowerText.includes(nameLower)) {
    relevanceScore += 0.3;
  }

  // Sector/industry keywords (low relevance)
  const sectorKeywords = ['tech', 'finance', 'healthcare', 'energy', 'retail'];
  sectorKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      relevanceScore += 0.05;
    }
  });

  return Math.min(1, relevanceScore);
}

/**
 * Calculate sentiment summary for a stock
 */
export function calculateSentimentSummary(
  articles: NewsArticle[]
): SentimentSummary {
  if (articles.length === 0) {
    return {
      ticker: '',
      averageSentiment: 0,
      positiveCount: 0,
      negativeCount: 0,
      neutralCount: 0,
      totalArticles: 0,
      trend: 'stable',
      lastUpdated: new Date(),
    };
  }

  const ticker = articles[0].ticker;
  const sentiments = articles.map(a => a.sentimentScore);
  const averageSentiment = sentiments.reduce((a, b) => a + b) / sentiments.length;

  const positiveCount = articles.filter(a => a.sentiment === 'positive').length;
  const negativeCount = articles.filter(a => a.sentiment === 'negative').length;
  const neutralCount = articles.filter(a => a.sentiment === 'neutral').length;

  // Determine trend (simplified: compare first half to second half)
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (articles.length >= 4) {
    const firstHalf = sentiments.slice(0, Math.floor(sentiments.length / 2));
    const secondHalf = sentiments.slice(Math.floor(sentiments.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b) / secondHalf.length;

    if (secondAvg > firstAvg + 0.1) {
      trend = 'improving';
    } else if (secondAvg < firstAvg - 0.1) {
      trend = 'declining';
    }
  }

  return {
    ticker,
    averageSentiment,
    positiveCount,
    negativeCount,
    neutralCount,
    totalArticles: articles.length,
    trend,
    lastUpdated: new Date(),
  };
}

/**
 * Adjust trading signal confidence based on news sentiment
 */
export function adjustSignalConfidenceWithSentiment(
  originalConfidence: number,
  sentimentScore: number,
  signalType: 'buy' | 'sell'
): {
  adjustedConfidence: number;
  sentimentImpact: number;
} {
  // For buy signals, positive sentiment increases confidence
  // For sell signals, negative sentiment increases confidence

  let sentimentImpact = 0;

  if (signalType === 'buy') {
    // Positive sentiment supports buy signal
    if (sentimentScore > 0.3) {
      sentimentImpact = Math.min(0.2, sentimentScore * 0.2);
    } else if (sentimentScore < -0.3) {
      sentimentImpact = Math.max(-0.3, sentimentScore * 0.3);
    }
  } else {
    // Negative sentiment supports sell signal
    if (sentimentScore < -0.3) {
      sentimentImpact = Math.min(0.2, Math.abs(sentimentScore) * 0.2);
    } else if (sentimentScore > 0.3) {
      sentimentImpact = Math.max(-0.3, -sentimentScore * 0.3);
    }
  }

  const adjustedConfidence = Math.max(
    0,
    Math.min(1, originalConfidence + sentimentImpact)
  );

  return {
    adjustedConfidence,
    sentimentImpact,
  };
}

/**
 * Detect market-moving news
 */
export interface MarketMovingNews {
  article: NewsArticle;
  impactLevel: 'high' | 'medium' | 'low';
  expectedPriceMovement: number; // percentage
  urgency: 'immediate' | 'soon' | 'gradual';
}

export function detectMarketMovingNews(
  article: NewsArticle,
  historicalVolatility: number = 0.02
): MarketMovingNews {
  // Determine impact level based on sentiment strength and relevance
  const sentimentStrength = Math.abs(article.sentimentScore);
  const combinedScore = sentimentStrength * article.relevanceScore;

  let impactLevel: 'high' | 'medium' | 'low';
  if (combinedScore > 0.6) {
    impactLevel = 'high';
  } else if (combinedScore > 0.3) {
    impactLevel = 'medium';
  } else {
    impactLevel = 'low';
  }

  // Estimate expected price movement
  const baseMovement = sentimentStrength * 0.05; // 0-5% base movement
  const expectedPriceMovement = baseMovement + historicalVolatility;

  // Determine urgency based on article recency
  const ageInHours =
    (new Date().getTime() - article.publishedAt.getTime()) / (1000 * 60 * 60);

  let urgency: 'immediate' | 'soon' | 'gradual';
  if (ageInHours < 1) {
    urgency = 'immediate';
  } else if (ageInHours < 24) {
    urgency = 'soon';
  } else {
    urgency = 'gradual';
  }

  return {
    article,
    impactLevel,
    expectedPriceMovement,
    urgency,
  };
}

/**
 * Generate sentiment-based trading alert
 */
export interface SentimentAlert {
  ticker: string;
  type: 'sentiment-shift' | 'market-moving-news' | 'sentiment-extreme';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  recommendedAction: string;
  timestamp: Date;
}

export function generateSentimentAlert(
  summary: SentimentSummary,
  previousSummary: SentimentSummary | null,
  marketMovingNews: MarketMovingNews | null
): SentimentAlert | null {
  // Detect sentiment shift
  if (previousSummary) {
    const sentimentChange = summary.averageSentiment - previousSummary.averageSentiment;

    if (Math.abs(sentimentChange) > 0.3) {
      const direction = sentimentChange > 0 ? 'positive' : 'negative';
      return {
        ticker: summary.ticker,
        type: 'sentiment-shift',
        severity: Math.abs(sentimentChange) > 0.5 ? 'high' : 'medium',
        message: `Significant ${direction} sentiment shift detected`,
        recommendedAction: `Review recent news and consider ${direction === 'positive' ? 'buy' : 'sell'} signals`,
        timestamp: new Date(),
      };
    }
  }

  // Detect market-moving news
  if (marketMovingNews && marketMovingNews.impactLevel === 'high') {
    return {
      ticker: summary.ticker,
      type: 'market-moving-news',
      severity: 'critical',
      message: `Market-moving news detected: ${marketMovingNews.article.title}`,
      recommendedAction: `Expected price movement: ${(marketMovingNews.expectedPriceMovement * 100).toFixed(2)}%`,
      timestamp: new Date(),
    };
  }

  // Detect extreme sentiment
  if (Math.abs(summary.averageSentiment) > 0.7) {
    const direction = summary.averageSentiment > 0 ? 'extremely positive' : 'extremely negative';
    return {
      ticker: summary.ticker,
      type: 'sentiment-extreme',
      severity: 'high',
      message: `Extremely ${direction} sentiment detected`,
      recommendedAction: `Monitor for potential reversal or continuation`,
      timestamp: new Date(),
    };
  }

  return null;
}

/**
 * Batch process news articles for multiple stocks
 */
export function batchProcessNewsArticles(
  articles: NewsArticle[]
): Map<string, SentimentSummary> {
  const summaryByTicker = new Map<string, SentimentSummary>();

  // Group articles by ticker
  const articlesByTicker = new Map<string, NewsArticle[]>();

  articles.forEach(article => {
    if (!articlesByTicker.has(article.ticker)) {
      articlesByTicker.set(article.ticker, []);
    }
    articlesByTicker.get(article.ticker)!.push(article);
  });

  // Calculate summary for each ticker
  articlesByTicker.forEach((tickerArticles, ticker) => {
    const summary = calculateSentimentSummary(tickerArticles);
    summaryByTicker.set(ticker, summary);
  });

  return summaryByTicker;
}
