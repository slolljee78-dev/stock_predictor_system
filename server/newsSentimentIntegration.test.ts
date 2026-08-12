import { describe, it, expect } from 'vitest';
import {
  analyzeSentiment,
  extractKeywords,
  calculateRelevanceScore,
  calculateSentimentSummary,
  adjustSignalConfidenceWithSentiment,
  detectMarketMovingNews,
  generateSentimentAlert,
  batchProcessNewsArticles,
  NewsArticle,
  SentimentSummary,
} from './newsSentimentIntegration';

describe('News & Sentiment Integration', () => {
  describe('analyzeSentiment', () => {
    it('should detect positive sentiment', () => {
      const text = 'Apple stock surges with strong earnings beat and bullish outlook';
      const result = analyzeSentiment(text);

      expect(result.sentiment).toBe('positive');
      expect(result.score).toBeGreaterThan(0);
    });

    it('should detect negative sentiment', () => {
      const text = 'Stock plunges as company misses earnings and issues warning';
      const result = analyzeSentiment(text);

      expect(result.sentiment).toBe('negative');
      expect(result.score).toBeLessThan(0);
    });

    it('should detect neutral sentiment', () => {
      const text = 'Company announces quarterly meeting scheduled for next month';
      const result = analyzeSentiment(text);

      expect(result.sentiment).toBe('neutral');
      expect(Math.abs(result.score)).toBeLessThan(0.2);
    });

    it('should return score between -1 and 1', () => {
      const texts = [
        'Extremely positive news with multiple bullish indicators',
        'Neutral announcement',
        'Extremely negative crash with major concerns',
      ];

      texts.forEach(text => {
        const result = analyzeSentiment(text);
        expect(result.score).toBeGreaterThanOrEqual(-1);
        expect(result.score).toBeLessThanOrEqual(1);
      });
    });

    it('should handle empty text', () => {
      const result = analyzeSentiment('');

      expect(result.sentiment).toBe('neutral');
      expect(result.score).toBe(0);
    });
  });

  describe('extractKeywords', () => {
    it('should extract keywords from text', () => {
      const text = 'Apple announced strong earnings growth with record profits';
      const keywords = extractKeywords(text);

      expect(Array.isArray(keywords)).toBe(true);
      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords.length).toBeLessThanOrEqual(5);
    });

    it('should respect maxKeywords parameter', () => {
      const text = 'Apple announced strong earnings growth with record profits';
      const keywords = extractKeywords(text, 3);

      expect(keywords.length).toBeLessThanOrEqual(3);
    });

    it('should filter out short words', () => {
      const text = 'A big company announced earnings';
      const keywords = extractKeywords(text);

      keywords.forEach(keyword => {
        expect(keyword.length).toBeGreaterThan(3);
      });
    });

    it('should handle empty text', () => {
      const keywords = extractKeywords('');

      expect(Array.isArray(keywords)).toBe(true);
      expect(keywords.length).toBe(0);
    });
  });

  describe('calculateRelevanceScore', () => {
    it('should give high score for direct ticker mention', () => {
      const score = calculateRelevanceScore('AAPL stock surges today', 'AAPL', 'Apple');

      expect(score).toBeGreaterThan(0.4);
    });

    it('should give medium score for company name mention', () => {
      const score = calculateRelevanceScore('Apple announces new product', 'AAPL', 'Apple');

      expect(score).toBeGreaterThan(0.2);
    });

    it('should give low score for generic tech news', () => {
      const score = calculateRelevanceScore('Tech sector rallies on positive data', 'AAPL', 'Apple');

      expect(score).toBeLessThan(0.2);
    });

    it('should return score between 0 and 1', () => {
      const score = calculateRelevanceScore('Random text about stocks', 'AAPL', 'Apple');

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  describe('calculateSentimentSummary', () => {
    const mockArticles: NewsArticle[] = [
      {
        id: '1',
        ticker: 'AAPL',
        title: 'Positive news',
        description: 'Good results',
        url: 'http://example.com',
        source: 'Reuters',
        publishedAt: new Date(),
        sentiment: 'positive',
        sentimentScore: 0.8,
        relevanceScore: 0.9,
        keywords: ['earnings', 'growth'],
      },
      {
        id: '2',
        ticker: 'AAPL',
        title: 'Negative news',
        description: 'Bad results',
        url: 'http://example.com',
        source: 'Reuters',
        publishedAt: new Date(),
        sentiment: 'negative',
        sentimentScore: -0.6,
        relevanceScore: 0.9,
        keywords: ['decline', 'loss'],
      },
      {
        id: '3',
        ticker: 'AAPL',
        title: 'Neutral news',
        description: 'Announcement',
        url: 'http://example.com',
        source: 'Reuters',
        publishedAt: new Date(),
        sentiment: 'neutral',
        sentimentScore: 0.1,
        relevanceScore: 0.8,
        keywords: ['meeting', 'scheduled'],
      },
    ];

    it('should calculate sentiment summary', () => {
      const summary = calculateSentimentSummary(mockArticles);

      expect(summary.ticker).toBe('AAPL');
      expect(summary.totalArticles).toBe(3);
      expect(summary.positiveCount).toBe(1);
      expect(summary.negativeCount).toBe(1);
      expect(summary.neutralCount).toBe(1);
    });

    it('should calculate average sentiment', () => {
      const summary = calculateSentimentSummary(mockArticles);

      expect(summary.averageSentiment).toBeCloseTo((0.8 - 0.6 + 0.1) / 3, 2);
    });

    it('should detect sentiment trend', () => {
      const articles: NewsArticle[] = [
        ...mockArticles.slice(0, 2),
        {
          ...mockArticles[2],
          sentimentScore: 0.7,
          sentiment: 'positive',
        },
      ];

      const summary = calculateSentimentSummary(articles);

      expect(['improving', 'declining', 'stable']).toContain(summary.trend);
    });

    it('should handle empty articles', () => {
      const summary = calculateSentimentSummary([]);

      expect(summary.totalArticles).toBe(0);
      expect(summary.averageSentiment).toBe(0);
    });
  });

  describe('adjustSignalConfidenceWithSentiment', () => {
    it('should increase buy signal confidence with positive sentiment', () => {
      const result = adjustSignalConfidenceWithSentiment(0.6, 0.7, 'buy');

      expect(result.adjustedConfidence).toBeGreaterThan(0.6);
      expect(result.sentimentImpact).toBeGreaterThan(0);
    });

    it('should decrease buy signal confidence with negative sentiment', () => {
      const result = adjustSignalConfidenceWithSentiment(0.6, -0.7, 'buy');

      expect(result.adjustedConfidence).toBeLessThan(0.6);
      expect(result.sentimentImpact).toBeLessThan(0);
    });

    it('should increase sell signal confidence with negative sentiment', () => {
      const result = adjustSignalConfidenceWithSentiment(0.6, -0.7, 'sell');

      expect(result.adjustedConfidence).toBeGreaterThan(0.6);
      expect(result.sentimentImpact).toBeGreaterThan(0);
    });

    it('should keep confidence between 0 and 1', () => {
      const result = adjustSignalConfidenceWithSentiment(0.95, 0.9, 'buy');

      expect(result.adjustedConfidence).toBeLessThanOrEqual(1);
      expect(result.adjustedConfidence).toBeGreaterThanOrEqual(0);
    });
  });

  describe('detectMarketMovingNews', () => {
    const mockArticle: NewsArticle = {
      id: '1',
      ticker: 'AAPL',
      title: 'Major earnings beat',
      description: 'Apple beats expectations',
      url: 'http://example.com',
      source: 'Reuters',
      publishedAt: new Date(),
      sentiment: 'positive',
      sentimentScore: 0.9,
      relevanceScore: 0.95,
      keywords: ['earnings', 'beat'],
    };

    it('should detect high impact news', () => {
      const result = detectMarketMovingNews(mockArticle);

      expect(result.impactLevel).toBe('high');
      expect(result.expectedPriceMovement).toBeGreaterThan(0);
    });

    it('should estimate price movement', () => {
      const result = detectMarketMovingNews(mockArticle);

      expect(result.expectedPriceMovement).toBeGreaterThan(0);
      expect(result.expectedPriceMovement).toBeLessThan(0.1);
    });

    it('should determine urgency based on age', () => {
      const recentArticle = {
        ...mockArticle,
        publishedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      };

      const result = detectMarketMovingNews(recentArticle);

      expect(result.urgency).toBe('immediate');
    });
  });

  describe('generateSentimentAlert', () => {
    const mockSummary: SentimentSummary = {
      ticker: 'AAPL',
      averageSentiment: 0.7,
      positiveCount: 8,
      negativeCount: 1,
      neutralCount: 1,
      totalArticles: 10,
      trend: 'improving',
      lastUpdated: new Date(),
    };

    const previousSummary: SentimentSummary = {
      ...mockSummary,
      averageSentiment: 0.2,
      trend: 'stable',
    };

    it('should generate alert for sentiment shift', () => {
      const alert = generateSentimentAlert(mockSummary, previousSummary, null);

      expect(alert).not.toBeNull();
      expect(alert?.type).toBe('sentiment-shift');
    });

    it('should generate alert for extreme sentiment', () => {
      const extremeSummary: SentimentSummary = {
        ...mockSummary,
        averageSentiment: 0.85,
      };

      const alert = generateSentimentAlert(extremeSummary, null, null);

      expect(alert).not.toBeNull();
      expect(alert?.type).toBe('sentiment-extreme');
    });

    it('should return null when no alert conditions met', () => {
      const stableSummary: SentimentSummary = {
        ...mockSummary,
        averageSentiment: 0.3,
      };

      const alert = generateSentimentAlert(stableSummary, previousSummary, null);

      expect(alert).toBeNull();
    });
  });

  describe('batchProcessNewsArticles', () => {
    const mockArticles: NewsArticle[] = [
      {
        id: '1',
        ticker: 'AAPL',
        title: 'Apple news',
        description: 'Positive',
        url: 'http://example.com',
        source: 'Reuters',
        publishedAt: new Date(),
        sentiment: 'positive',
        sentimentScore: 0.8,
        relevanceScore: 0.9,
        keywords: ['earnings'],
      },
      {
        id: '2',
        ticker: 'MSFT',
        title: 'Microsoft news',
        description: 'Negative',
        url: 'http://example.com',
        source: 'Reuters',
        publishedAt: new Date(),
        sentiment: 'negative',
        sentimentScore: -0.7,
        relevanceScore: 0.85,
        keywords: ['loss'],
      },
      {
        id: '3',
        ticker: 'AAPL',
        title: 'More Apple news',
        description: 'Neutral',
        url: 'http://example.com',
        source: 'Reuters',
        publishedAt: new Date(),
        sentiment: 'neutral',
        sentimentScore: 0.1,
        relevanceScore: 0.8,
        keywords: ['meeting'],
      },
    ];

    it('should group articles by ticker', () => {
      const result = batchProcessNewsArticles(mockArticles);

      expect(result.has('AAPL')).toBe(true);
      expect(result.has('MSFT')).toBe(true);
    });

    it('should calculate summary for each ticker', () => {
      const result = batchProcessNewsArticles(mockArticles);

      const appleSummary = result.get('AAPL');
      expect(appleSummary?.totalArticles).toBe(2);
      expect(appleSummary?.ticker).toBe('AAPL');
    });

    it('should handle empty articles', () => {
      const result = batchProcessNewsArticles([]);

      expect(result.size).toBe(0);
    });
  });
});
