/**
 * Sentiment Analysis Router
 * tRPC procedures for sentiment analysis and news management
 */

import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { stockSentiment, newsArticles, stocks } from '../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import {
  calculateArticleSentiment,
  calculateAggregatedSentiment,
  classifySentiment,
  fetchNewsArticles,
  NewsArticle,
} from '../sentimentAnalysis';

export const sentimentRouter = router({
  /**
   * Get sentiment analysis for a specific stock
   */
  getStockSentiment: protectedProcedure
    .input(z.object({ stockId: z.number().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const sentiment = await db
        .select()
        .from(stockSentiment)
        .where(eq(stockSentiment.stockId, input.stockId))
        .orderBy(desc(stockSentiment.analysisDate))
        .limit(1);

      if (sentiment.length === 0) {
        return {
          sentimentScore: 0,
          confidence: 0,
          articleCount: 0,
          classification: 'neutral',
          analysisDate: new Date(),
        };
      }

      return {
        sentimentScore: sentiment[0].sentimentScore / 100, // Convert from stored int
        confidence: sentiment[0].confidence,
        articleCount: sentiment[0].articleCount,
        classification: sentiment[0].classification,
        analysisDate: sentiment[0].analysisDate,
      };
    }),

  /**
   * Get recent news articles for a stock
   */
  getStockNews: protectedProcedure
    .input(
      z.object({
        stockId: z.number().positive(),
        limit: z.number().int().positive().default(10),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const articles = await db
        .select()
        .from(newsArticles)
        .where(eq(newsArticles.stockId, input.stockId))
        .orderBy(desc(newsArticles.publishedAt))
        .limit(input.limit);

      return articles.map(article => ({
        id: article.id,
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source,
        sentimentScore: (article.sentimentScore ?? 0) / 100,
        publishedAt: article.publishedAt,
      }));
    }),

  /**
   * Analyze sentiment for a stock (fetch and analyze news)
   */
  analyzeSentiment: protectedProcedure
    .input(z.object({ stockId: z.number().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Get stock info
      const stock = await db
        .select()
        .from(stocks)
        .where(eq(stocks.id, input.stockId))
        .limit(1);

      if (stock.length === 0) {
        throw new Error('Stock not found');
      }

      // Fetch news articles (mock for now)
      const newsData = await fetchNewsArticles(stock[0].ticker);

      // Calculate sentiment for each article
      const articlesWithSentiment = newsData.map(article => ({
        ...article,
        sentiment: calculateArticleSentiment(article),
      }));

      // Calculate aggregated sentiment
      const aggregated = calculateAggregatedSentiment(articlesWithSentiment);

      // Store articles in database
      for (const article of articlesWithSentiment) {
        await db
          .insert(newsArticles)
          .values({
            stockId: input.stockId,
            title: article.title || '',
            description: article.description,
            content: article.content,
            url: article.url,
            source: article.source,
            sentimentScore: Math.round((article.sentiment || 0) * 100),
            publishedAt: article.publishedAt,
          })
          .onDuplicateKeyUpdate({
            set: {
              sentimentScore: Math.round((article.sentiment || 0) * 100),
            },
          });
      }

      // Store aggregated sentiment
      const classification = classifySentiment(aggregated.sentimentScore);
      const result = await db
        .insert(stockSentiment)
        .values({
          stockId: input.stockId,
          sentimentScore: Math.round(aggregated.sentimentScore * 100),
          confidence: Math.round(aggregated.confidence * 100),
          articleCount: aggregated.articleCount,
          classification,
          analysisDate: new Date(),
        });

      return {
        success: true,
        sentimentScore: aggregated.sentimentScore,
        confidence: aggregated.confidence,
        articleCount: aggregated.articleCount,
        classification,
        message: `Analyzed ${aggregated.articleCount} articles for ${stock[0].ticker}`,
      };
    }),

  /**
   * Get sentiment trends for a stock (last 30 days)
   */
  getSentimentTrend: protectedProcedure
    .input(z.object({ stockId: z.number().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const sentiments = await db
        .select()
        .from(stockSentiment)
        .where(eq(stockSentiment.stockId, input.stockId))
        .orderBy(desc(stockSentiment.analysisDate));

      return sentiments
        .filter(s => new Date(s.analysisDate) >= thirtyDaysAgo)
        .map(s => ({
          date: s.analysisDate,
          sentimentScore: s.sentimentScore / 100,
          confidence: s.confidence,
          articleCount: s.articleCount,
          classification: s.classification,
        }));
    }),

  /**
   * Get top positive and negative articles for a stock
   */
  getTopArticles: protectedProcedure
    .input(
      z.object({
        stockId: z.number().positive(),
        limit: z.number().int().positive().default(5),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const articles = await db
        .select()
        .from(newsArticles)
        .where(eq(newsArticles.stockId, input.stockId))
        .orderBy(desc(newsArticles.publishedAt));

      // Sort by sentiment score
      const sorted = articles.sort((a: any, b: any) => {
        const scoreA = a.sentimentScore ?? 0;
        const scoreB = b.sentimentScore ?? 0;
        return Math.abs(scoreB) - Math.abs(scoreA);
      });

      // Get top positive and negative
      const topPositive = sorted
        .filter(a => (a.sentimentScore ?? 0) > 0)
        .slice(0, input.limit)
        .map(a => ({
          id: a.id,
          title: a.title,
          url: a.url,
          source: a.source,
          sentimentScore: (a.sentimentScore ?? 0) / 100,
          publishedAt: a.publishedAt,
          type: 'positive' as const,
        }));

      const topNegative = sorted
        .filter(a => (a.sentimentScore ?? 0) < 0)
        .slice(0, input.limit)
        .map(a => ({
          id: a.id,
          title: a.title,
          url: a.url,
          source: a.source,
          sentimentScore: (a.sentimentScore ?? 0) / 100,
          publishedAt: a.publishedAt,
          type: 'negative' as const,
        }));

      return {
        positive: topPositive,
        negative: topNegative,
      };
    }),

  /**
   * Get sentiment for multiple stocks
   */
  getMultipleSentiments: protectedProcedure
    .input(z.object({ stockIds: z.array(z.number().positive()) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const results = await Promise.all(
        input.stockIds.map(async stockId => {
          const sentiment = await db
            .select()
            .from(stockSentiment)
            .where(eq(stockSentiment.stockId, stockId))
            .orderBy(desc(stockSentiment.analysisDate))
            .limit(1);

          return {
            stockId,
            sentimentScore: sentiment[0]?.sentimentScore ? sentiment[0].sentimentScore / 100 : 0,
            confidence: sentiment[0]?.confidence || 0,
            classification: sentiment[0]?.classification || 'neutral',
          };
        })
      );

      return results;
    }),

  /**
   * Get sentiment statistics across all stocks
   */
  getSentimentStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const allSentiments = await db
      .select()
      .from(stockSentiment)
      .orderBy(desc(stockSentiment.analysisDate));

    // Get latest sentiment for each stock
    const latestByStock = new Map();
    for (const sentiment of allSentiments) {
      if (!latestByStock.has(sentiment.stockId)) {
        latestByStock.set(sentiment.stockId, sentiment);
      }
    }

    const sentiments = Array.from(latestByStock.values());

    // Calculate statistics
    const scores = sentiments.map(s => s.sentimentScore / 100);
    const avgSentiment = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    const classifications = sentiments.map(s => s.classification);
    const veryPositive = classifications.filter(c => c === 'very_positive').length;
    const positive = classifications.filter(c => c === 'positive').length;
    const neutral = classifications.filter(c => c === 'neutral').length;
    const negative = classifications.filter(c => c === 'negative').length;
    const veryNegative = classifications.filter(c => c === 'very_negative').length;

    return {
      totalStocks: sentiments.length,
      averageSentiment: avgSentiment,
      distribution: {
        veryPositive,
        positive,
        neutral,
        negative,
        veryNegative,
      },
      bullishCount: veryPositive + positive,
      bearishCount: veryNegative + negative,
      neutralCount: neutral,
    };
  }),
});
