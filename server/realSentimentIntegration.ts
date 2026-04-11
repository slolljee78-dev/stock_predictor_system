/**
 * Real Sentiment Data Integration - Phase 4
 * Integrates financial news and social media sentiment
 */

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: Date;
  sentiment: number; // -1 to 1
  relevance: number; // 0 to 1
}

export interface SocialMediaSentiment {
  platform: "twitter" | "reddit" | "stocktwits";
  mentions: number;
  sentiment: number; // -1 to 1
  volume: number;
  trend: "rising" | "falling" | "stable";
}

export interface EarningsSurprise {
  symbol: string;
  announcementDate: Date;
  epsEstimate: number;
  epsActual: number;
  epsSurprise: number; // percentage
  revenueEstimate: number;
  revenueActual: number;
  revenueSurprise: number; // percentage
  guidance: "positive" | "neutral" | "negative";
}

export interface InsiderActivity {
  symbol: string;
  insiderName: string;
  title: string;
  transactionType: "buy" | "sell";
  shares: number;
  price: number;
  date: Date;
  sentiment: number; // -1 to 1 based on transaction type
}

export interface CompositeSentiment {
  symbol: string;
  overallSentiment: number; // -100 to 100
  newsScore: number; // -100 to 100
  socialScore: number; // -100 to 100
  earningsScore: number; // -100 to 100
  insiderScore: number; // -100 to 100
  confidence: number; // 0 to 100
  recommendation: "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";
}

/**
 * Fetch financial news for a symbol
 * In production, this would use NewsAPI or similar service
 */
export async function fetchFinancialNews(symbol: string, limit: number = 10): Promise<NewsArticle[]> {
  // Mock implementation - in production, call NewsAPI
  const mockArticles: NewsArticle[] = [
    {
      title: `${symbol} Reports Strong Earnings`,
      description: "Company beats expectations with record revenue",
      url: "https://example.com/news",
      source: "Financial Times",
      publishedAt: new Date(),
      sentiment: 0.8,
      relevance: 0.95,
    },
    {
      title: `${symbol} Faces Regulatory Challenges`,
      description: "New regulations may impact future growth",
      url: "https://example.com/news",
      source: "Reuters",
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      sentiment: -0.6,
      relevance: 0.85,
    },
  ];

  return mockArticles.slice(0, limit);
}

/**
 * Fetch social media sentiment
 * In production, this would use Twitter API, Reddit API, etc.
 */
export async function fetchSocialMediaSentiment(symbol: string): Promise<SocialMediaSentiment[]> {
  // Mock implementation
  const mockSentiment: SocialMediaSentiment[] = [
    {
      platform: "twitter",
      mentions: 1250,
      sentiment: 0.65,
      volume: 2500,
      trend: "rising",
    },
    {
      platform: "reddit",
      mentions: 450,
      sentiment: 0.55,
      volume: 900,
      trend: "stable",
    },
    {
      platform: "stocktwits",
      mentions: 320,
      sentiment: 0.7,
      volume: 640,
      trend: "rising",
    },
  ];

  return mockSentiment;
}

/**
 * Fetch earnings surprises
 * In production, this would use earnings calendar APIs
 */
export async function fetchEarningsSurprises(symbol: string): Promise<EarningsSurprise[]> {
  // Mock implementation
  const mockEarnings: EarningsSurprise[] = [
    {
      symbol,
      announcementDate: new Date(),
      epsEstimate: 1.5,
      epsActual: 1.75,
      epsSurprise: 16.67,
      revenueEstimate: 5000000000,
      revenueActual: 5250000000,
      revenueSurprise: 5.0,
      guidance: "positive",
    },
  ];

  return mockEarnings;
}

/**
 * Fetch insider trading activity
 * In production, this would use SEC EDGAR or similar
 */
export async function fetchInsiderActivity(symbol: string, days: number = 30): Promise<InsiderActivity[]> {
  // Mock implementation
  const mockInsiders: InsiderActivity[] = [
    {
      symbol,
      insiderName: "John Doe",
      title: "CEO",
      transactionType: "buy",
      shares: 10000,
      price: 150,
      date: new Date(),
      sentiment: 0.9, // CEO buying is very bullish
    },
    {
      symbol,
      insiderName: "Jane Smith",
      title: "CFO",
      transactionType: "sell",
      shares: 5000,
      price: 148,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      sentiment: -0.5, // CFO selling is bearish
    },
  ];

  return mockInsiders;
}

/**
 * Analyze news sentiment using LLM
 */
export function analyzeNewsSentiment(articles: NewsArticle[]): number {
  if (articles.length === 0) return 0;

  const totalSentiment = articles.reduce((sum, article) => sum + article.sentiment * article.relevance, 0);
  const totalRelevance = articles.reduce((sum, article) => sum + article.relevance, 0);

  return totalRelevance > 0 ? (totalSentiment / totalRelevance) * 100 : 0;
}

/**
 * Analyze social media sentiment
 */
export function analyzeSocialMediaSentiment(sentiments: SocialMediaSentiment[]): number {
  if (sentiments.length === 0) return 0;

  // Weight by volume and trend
  let totalScore = 0;
  let totalWeight = 0;

  for (const sentiment of sentiments) {
    let weight = sentiment.volume;

    // Boost weight if trend is rising
    if (sentiment.trend === "rising") {
      weight *= 1.2;
    } else if (sentiment.trend === "falling") {
      weight *= 0.8;
    }

    totalScore += sentiment.sentiment * weight * 100;
    totalWeight += weight;
  }

  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

/**
 * Analyze earnings surprises
 */
export function analyzeEarningsSurprises(surprises: EarningsSurprise[]): number {
  if (surprises.length === 0) return 0;

  let score = 0;

  for (const surprise of surprises) {
    // EPS surprise
    const epsSurpriseScore = Math.min(surprise.epsSurprise / 10, 1) * 50;

    // Revenue surprise
    const revenueSurpriseScore = Math.min(surprise.revenueSurprise / 10, 1) * 30;

    // Guidance
    const guidanceScore = surprise.guidance === "positive" ? 20 : surprise.guidance === "negative" ? -20 : 0;

    score += epsSurpriseScore + revenueSurpriseScore + guidanceScore;
  }

  return Math.min(Math.max(score, -100), 100);
}

/**
 * Analyze insider activity
 */
export function analyzeInsiderActivity(activity: InsiderActivity[]): number {
  if (activity.length === 0) return 0;

  const totalSentiment = activity.reduce((sum, insider) => sum + insider.sentiment, 0);
  const avgSentiment = totalSentiment / activity.length;

  return avgSentiment * 100;
}

/**
 * Calculate composite sentiment score
 */
export async function calculateCompositeSentiment(symbol: string): Promise<CompositeSentiment> {
  try {
    // Fetch all data sources
    const [news, socialMedia, earnings, insiders] = await Promise.all([
      fetchFinancialNews(symbol),
      fetchSocialMediaSentiment(symbol),
      fetchEarningsSurprises(symbol),
      fetchInsiderActivity(symbol),
    ]);

    // Calculate individual scores
    const newsScore = analyzeNewsSentiment(news);
    const socialScore = analyzeSocialMediaSentiment(socialMedia);
    const earningsScore = analyzeEarningsSurprises(earnings);
    const insiderScore = analyzeInsiderActivity(insiders);

    // Calculate weighted composite score
    const overallSentiment =
      newsScore * 0.4 + socialScore * 0.3 + earningsScore * 0.2 + insiderScore * 0.1;

    // Determine confidence based on data availability
    const dataPoints = (news.length > 0 ? 1 : 0) + (socialMedia.length > 0 ? 1 : 0) + (earnings.length > 0 ? 1 : 0) + (insiders.length > 0 ? 1 : 0);
    const confidence = (dataPoints / 4) * 100;

    // Determine recommendation
    let recommendation: "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";
    if (overallSentiment > 50) {
      recommendation = "strong_buy";
    } else if (overallSentiment > 20) {
      recommendation = "buy";
    } else if (overallSentiment > -20) {
      recommendation = "hold";
    } else if (overallSentiment > -50) {
      recommendation = "sell";
    } else {
      recommendation = "strong_sell";
    }

    return {
      symbol,
      overallSentiment,
      newsScore,
      socialScore,
      earningsScore,
      insiderScore,
      confidence,
      recommendation,
    };
  } catch (error) {
    console.error(`Error calculating sentiment for ${symbol}:`, error);
    return {
      symbol,
      overallSentiment: 0,
      newsScore: 0,
      socialScore: 0,
      earningsScore: 0,
      insiderScore: 0,
      confidence: 0,
      recommendation: "hold",
    };
  }
}

/**
 * Create sentiment report
 */
export function createSentimentReport(sentiment: CompositeSentiment): string {
  let report = `# Sentiment Analysis Report - ${sentiment.symbol}\n\n`;
  report += `## Overall Sentiment: ${sentiment.overallSentiment.toFixed(1)}/100\n`;
  report += `**Recommendation:** ${sentiment.recommendation.toUpperCase()}\n`;
  report += `**Confidence:** ${sentiment.confidence.toFixed(1)}%\n\n`;

  report += `## Sentiment Breakdown\n`;
  report += `| Source | Score |\n`;
  report += `|--------|-------|\n`;
  report += `| News | ${sentiment.newsScore.toFixed(1)} |\n`;
  report += `| Social Media | ${sentiment.socialScore.toFixed(1)} |\n`;
  report += `| Earnings | ${sentiment.earningsScore.toFixed(1)} |\n`;
  report += `| Insider Activity | ${sentiment.insiderScore.toFixed(1)} |\n\n`;

  report += `## Interpretation\n`;
  if (sentiment.overallSentiment > 50) {
    report += "Strong positive sentiment. Consider increasing position size or initiating long positions.\n";
  } else if (sentiment.overallSentiment > 20) {
    report += "Positive sentiment. Good opportunity for long positions.\n";
  } else if (sentiment.overallSentiment > -20) {
    report += "Neutral sentiment. Wait for clearer signals before trading.\n";
  } else if (sentiment.overallSentiment > -50) {
    report += "Negative sentiment. Avoid new long positions. Consider short opportunities.\n";
  } else {
    report += "Strong negative sentiment. Avoid trading or consider short positions with caution.\n";
  }

  return report;
}
