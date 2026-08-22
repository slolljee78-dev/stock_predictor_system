/**
 * Sentiment Analysis Tests
 */

import { describe, it, expect } from 'vitest';
import {
  calculateArticleSentiment,
  calculateAggregatedSentiment,
  classifySentiment,
  getSentimentColor,
  formatSentimentScore,
  generateSentimentSummary,
  NewsArticle,
} from './sentimentAnalysis';

describe('Sentiment Analysis Engine', () => {
  describe('calculateArticleSentiment', () => {
    it('should return positive sentiment for positive keywords', () => {
      const article: NewsArticle = {
        title: 'Stock surges on strong earnings',
        description: 'Company shows excellent growth and positive momentum',
        content: 'Bullish outlook with record profits',
        url: 'https://example.com',
        publishedAt: new Date(),
        source: 'News',
      };

      const sentiment = calculateArticleSentiment(article);
      expect(sentiment).toBeGreaterThan(0.5);
    });

    it('should return negative sentiment for negative keywords', () => {
      const article: NewsArticle = {
        title: 'Stock crashes on poor earnings',
        description: 'Company faces crisis and bankruptcy concerns',
        content: 'Bearish outlook with significant losses',
        url: 'https://example.com',
        publishedAt: new Date(),
        source: 'News',
      };

      const sentiment = calculateArticleSentiment(article);
      expect(sentiment).toBeLessThan(-0.5);
    });

    it('should return neutral sentiment for neutral content', () => {
      const article: NewsArticle = {
        title: 'Company announces quarterly meeting',
        description: 'Board to discuss strategic initiatives',
        content: 'Standard business operations continue',
        url: 'https://example.com',
        publishedAt: new Date(),
        source: 'News',
      };

      const sentiment = calculateArticleSentiment(article);
      expect(sentiment).toBeCloseTo(0, 1);
    });

    it('should clamp sentiment to [-1, 1] range', () => {
      const article: NewsArticle = {
        title: 'Positive positive positive positive positive',
        description: 'Positive positive positive',
        content: 'Positive positive positive',
        url: 'https://example.com',
        publishedAt: new Date(),
        source: 'News',
      };

      const sentiment = calculateArticleSentiment(article);
      expect(sentiment).toBeLessThanOrEqual(1);
      expect(sentiment).toBeGreaterThanOrEqual(-1);
    });

    it('should handle articles with few keywords', () => {
      const article: NewsArticle = {
        title: 'Company announces meeting',
        description: 'Board discusses strategy',
        content: 'Regular business update',
        url: 'https://example.com',
        publishedAt: new Date(),
        source: 'News',
      };

      const sentiment = calculateArticleSentiment(article);
      // This article has minimal sentiment keywords
      expect(sentiment).toBeCloseTo(0, 1);
    });
  });

  describe('calculateAggregatedSentiment', () => {
    it('should return zero for empty articles', () => {
      const result = calculateAggregatedSentiment([]);
      expect(result.sentimentScore).toBe(0);
      expect(result.confidence).toBe(0);
      expect(result.articleCount).toBe(0);
    });

    it('should calculate average sentiment from multiple articles', () => {
      const articles: NewsArticle[] = [
        {
          title: 'Stock surges on strong earnings',
          description: 'Positive news',
          url: 'https://example.com/1',
          publishedAt: new Date(),
          source: 'News',
        },
        {
          title: 'Stock crashes on poor earnings',
          description: 'Negative news',
          url: 'https://example.com/2',
          publishedAt: new Date(),
          source: 'News',
        },
      ];

      const result = calculateAggregatedSentiment(articles);
      expect(result.articleCount).toBe(2);
      expect(result.sentimentScore).toBeCloseTo(0, 1);
    });

    it('should weight recent articles more heavily', () => {
      const now = new Date();
      const articles: NewsArticle[] = [
        {
          title: 'Stock surges on strong earnings',
          description: 'Positive news',
          url: 'https://example.com/1',
          publishedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day old
          source: 'News',
        },
        {
          title: 'Stock crashes on poor earnings',
          description: 'Negative news',
          url: 'https://example.com/2',
          publishedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days old
          source: 'News',
        },
      ];

      const result = calculateAggregatedSentiment(articles);
      // Recent positive article should dominate, so overall sentiment should be positive
      expect(result.sentimentScore).toBeGreaterThan(0);
    });

    it('should calculate confidence based on article count', () => {
      const articles: NewsArticle[] = Array(10)
        .fill(null)
        .map((_, i) => ({
          title: `Article ${i}`,
          url: `https://example.com/${i}`,
          publishedAt: new Date(),
          source: 'News',
        }));

      const result = calculateAggregatedSentiment(articles);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('classifySentiment', () => {
    it('should classify very negative sentiment', () => {
      expect(classifySentiment(-0.9)).toBe('very_negative');
      expect(classifySentiment(-0.7)).toBe('very_negative');
    });

    it('should classify negative sentiment', () => {
      expect(classifySentiment(-0.5)).toBe('negative');
      expect(classifySentiment(-0.3)).toBe('negative');
    });

    it('should classify neutral sentiment', () => {
      expect(classifySentiment(-0.1)).toBe('neutral');
      expect(classifySentiment(0)).toBe('neutral');
      expect(classifySentiment(0.1)).toBe('neutral');
    });

    it('should classify positive sentiment', () => {
      expect(classifySentiment(0.3)).toBe('positive');
      expect(classifySentiment(0.5)).toBe('positive');
    });

    it('should classify very positive sentiment', () => {
      expect(classifySentiment(0.7)).toBe('very_positive');
      expect(classifySentiment(0.9)).toBe('very_positive');
    });
  });

  describe('getSentimentColor', () => {
    it('should return correct colors for sentiment scores', () => {
      expect(getSentimentColor(-0.9)).toBe('#dc2626'); // very negative
      expect(getSentimentColor(-0.5)).toBe('#f97316'); // negative
      expect(getSentimentColor(0)).toBe('#6b7280'); // neutral
      expect(getSentimentColor(0.5)).toBe('#84cc16'); // positive
      expect(getSentimentColor(0.9)).toBe('#22c55e'); // very positive
    });
  });

  describe('formatSentimentScore', () => {
    it('should format sentiment score as percentage', () => {
      expect(formatSentimentScore(-1)).toBe('0%');
      expect(formatSentimentScore(0)).toBe('50%');
      expect(formatSentimentScore(1)).toBe('100%');
    });

    it('should handle intermediate values', () => {
      expect(formatSentimentScore(-0.5)).toBe('25%');
      expect(formatSentimentScore(0.5)).toBe('75%');
    });
  });

  describe('generateSentimentSummary', () => {
    it('should generate appropriate summary for each sentiment level', () => {
      const baseResult = {
        ticker: 'AAPL',
        confidence: 0.8,
        lastUpdated: new Date(),
        articles: [],
      };

      const veryNegative = generateSentimentSummary({
        ...baseResult,
        sentimentScore: -0.9,
        articleCount: 5,
      });
      expect(veryNegative).toContain('Extremely negative');
      expect(veryNegative).toContain('5 articles');

      const positive = generateSentimentSummary({
        ...baseResult,
        sentimentScore: 0.7,
        articleCount: 3,
      });
      expect(positive).toContain('positive');
      expect(positive).toContain('3 articles');
    });
  });

  describe('Sentiment Score Boundaries', () => {
    it('should handle boundary values correctly', () => {
      const article: NewsArticle = {
        title: 'Test',
        url: 'https://example.com',
        publishedAt: new Date(),
        source: 'News',
      };

      const sentiment = calculateArticleSentiment(article);
      expect(sentiment).toBeGreaterThanOrEqual(-1);
      expect(sentiment).toBeLessThanOrEqual(1);
    });
  });

  describe('Keyword Matching', () => {
    it('should match keywords case-insensitively', () => {
      const article1: NewsArticle = {
        title: 'SURGE in stock price',
        url: 'https://example.com',
        publishedAt: new Date(),
        source: 'News',
      };

      const article2: NewsArticle = {
        title: 'surge in stock price',
        url: 'https://example.com',
        publishedAt: new Date(),
        source: 'News',
      };

      const sentiment1 = calculateArticleSentiment(article1);
      const sentiment2 = calculateArticleSentiment(article2);

      expect(sentiment1).toBeCloseTo(sentiment2, 2);
    });

    it('should match positive keywords in text', () => {
      const article: NewsArticle = {
        title: 'Stock surge forward',
        description: 'Company surges higher',
        url: 'https://example.com',
        publishedAt: new Date(),
        source: 'News',
      };

      const sentiment = calculateArticleSentiment(article);
      // Should match "surge" and "surges" as positive keywords
      expect(sentiment).toBeGreaterThan(0);
    });
  });
});
