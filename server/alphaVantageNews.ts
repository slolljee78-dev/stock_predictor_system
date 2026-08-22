/**
 * Alpha Vantage News Service
 * Fetches real market news and sentiment data from Alpha Vantage API
 */

import { ENV } from './_core/env';

export interface NewsArticle {
  title: string;
  summary: string;
  source: string;
  url: string;
  timePublished: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number; // -1 to 1
  relevance: number; // 0 to 1
  ticker: string;
}

export interface NewsResponse {
  articles: NewsArticle[];
  lastUpdated: string;
  totalArticles: number;
}

/**
 * Fetch news and sentiment for a specific stock from Alpha Vantage
 */
export async function fetchStockNewsFromAlphaVantage(
  ticker: string
): Promise<NewsResponse> {
  try {
    const apiKey = ENV.alphaVantageApiKey;
    if (!apiKey) {
      console.warn('[Alpha Vantage] API key not configured');
      return {
        articles: [],
        lastUpdated: new Date().toISOString(),
        totalArticles: 0,
      };
    }

    // Alpha Vantage News Sentiment endpoint
    const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${ticker}&apikey=${apiKey}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`[Alpha Vantage] HTTP error: ${response.status}`);
      return {
        articles: [],
        lastUpdated: new Date().toISOString(),
        totalArticles: 0,
      };
    }

    const data = await response.json();

    // Check for API errors
    if (data['Error Message'] || data['Note']) {
      console.warn(`[Alpha Vantage] API response: ${data['Error Message'] || data['Note']}`);
      return {
        articles: [],
        lastUpdated: new Date().toISOString(),
        totalArticles: 0,
      };
    }

    // Parse feed data
    const feed = data.feed || [];
    const articles: NewsArticle[] = feed
      .slice(0, 20) // Limit to 20 most recent articles
      .map((item: any) => {
        // Get sentiment for the specific ticker
        const tickerSentiment = item.ticker_sentiment?.find(
          (ts: any) => ts.ticker === ticker
        );

        const sentimentScore = tickerSentiment
          ? parseFloat(tickerSentiment.ticker_sentiment_score)
          : 0;
        const relevance = tickerSentiment
          ? parseFloat(tickerSentiment.relevance_score)
          : 0;

        // Classify sentiment
        let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
        if (sentimentScore > 0.1) sentiment = 'positive';
        else if (sentimentScore < -0.1) sentiment = 'negative';

        return {
          title: item.title,
          summary: item.summary,
          source: item.source,
          url: item.url,
          timePublished: item.time_published,
          sentiment,
          sentimentScore,
          relevance,
          ticker,
        };
      });

    return {
      articles,
      lastUpdated: new Date().toISOString(),
      totalArticles: articles.length,
    };
  } catch (error) {
    console.error('[Alpha Vantage] Error fetching news:', error);
    return {
      articles: [],
      lastUpdated: new Date().toISOString(),
      totalArticles: 0,
    };
  }
}

/**
 * Fetch news for multiple stocks
 */
export async function fetchMultipleStockNews(
  tickers: string[]
): Promise<Map<string, NewsResponse>> {
  const results = new Map<string, NewsResponse>();

  for (const ticker of tickers) {
    const news = await fetchStockNewsFromAlphaVantage(ticker);
    results.set(ticker, news);

    // Add delay to respect API rate limits (5 requests per minute for free tier)
    await new Promise(resolve => setTimeout(resolve, 12000)); // 12 second delay
  }

  return results;
}

/**
 * Calculate aggregated sentiment from articles
 */
export function calculateAggregatedSentiment(articles: NewsArticle[]): {
  averageSentiment: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  averageRelevance: number;
} {
  if (articles.length === 0) {
    return {
      averageSentiment: 0,
      positiveCount: 0,
      neutralCount: 0,
      negativeCount: 0,
      averageRelevance: 0,
    };
  }

  let totalSentiment = 0;
  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;
  let totalRelevance = 0;

  for (const article of articles) {
    totalSentiment += article.sentimentScore;
    totalRelevance += article.relevance;

    if (article.sentiment === 'positive') positiveCount++;
    else if (article.sentiment === 'neutral') neutralCount++;
    else negativeCount++;
  }

  return {
    averageSentiment: totalSentiment / articles.length,
    positiveCount,
    neutralCount,
    negativeCount,
    averageRelevance: totalRelevance / articles.length,
  };
}

/**
 * Get sentiment classification
 */
export function classifySentiment(
  score: number
): 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive' {
  if (score < -0.6) return 'very_negative';
  if (score < -0.2) return 'negative';
  if (score < 0.2) return 'neutral';
  if (score < 0.6) return 'positive';
  return 'very_positive';
}

/**
 * Filter articles by recency (hours)
 */
export function filterArticlesByRecency(
  articles: NewsArticle[],
  hoursOld: number
): NewsArticle[] {
  const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000);

  return articles.filter(article => {
    const publishTime = new Date(article.timePublished);
    return publishTime > cutoffTime;
  });
}

/**
 * Get top articles by relevance and sentiment
 */
export function getTopArticles(
  articles: NewsArticle[],
  limit: number = 5,
  minRelevance: number = 0.5
): NewsArticle[] {
  return articles
    .filter(a => a.relevance >= minRelevance)
    .sort((a, b) => {
      // Sort by relevance first, then by sentiment score magnitude
      if (b.relevance !== a.relevance) {
        return b.relevance - a.relevance;
      }
      return Math.abs(b.sentimentScore) - Math.abs(a.sentimentScore);
    })
    .slice(0, limit);
}

/**
 * Format articles for display
 */
export function formatArticlesForDisplay(articles: NewsArticle[]): string {
  if (articles.length === 0) {
    return 'No recent news articles found.';
  }

  return articles
    .map((article, index) => {
      const sentimentEmoji =
        article.sentiment === 'positive'
          ? '📈'
          : article.sentiment === 'negative'
            ? '📉'
            : '➡️';

      return `${index + 1}. ${sentimentEmoji} ${article.title}
   Source: ${article.source}
   Sentiment: ${article.sentiment} (${(article.sentimentScore * 100).toFixed(1)}%)
   Relevance: ${(article.relevance * 100).toFixed(1)}%
   URL: ${article.url}`;
    })
    .join('\n\n');
}
