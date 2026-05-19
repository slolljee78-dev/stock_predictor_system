/**
 * Stock Screener with Advanced Filters
 * 
 * Allows users to filter stocks based on technical indicators, price, volume, and signals
 */

export interface ScreenerFilter {
  priceRange?: { min: number; max: number };
  volumeRange?: { min: number; max: number };
  marketCap?: 'micro' | 'small' | 'mid' | 'large' | 'mega';
  sector?: string[];
  signalType?: 'buy' | 'sell' | 'hold';
  confidenceMin?: number;
  rsiRange?: { min: number; max: number };
  macdPositive?: boolean;
  smaAlignment?: 'bullish' | 'bearish' | 'neutral';
  volumeAboveAverage?: boolean;
  priceAbove200SMA?: boolean;
}

export interface ScreenerResult {
  ticker: string;
  price: number;
  priceChange: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  sector: string;
  latestSignal?: {
    type: 'buy' | 'sell' | 'hold';
    confidence: number;
    timestamp: string;
  };
  technicalIndicators: {
    rsi: number;
    macd: number;
    sma20: number;
    sma50: number;
    sma200: number;
  };
  matchScore: number; // 0-100, how well it matches the filters
}

/**
 * Calculate match score for a stock against filters
 */
export function calculateMatchScore(stock: any, filters: ScreenerFilter): number {
  let score = 0;
  let maxScore = 0;

  // Price range filter
  if (filters.priceRange) {
    maxScore += 10;
    if (stock.price >= filters.priceRange.min && stock.price <= filters.priceRange.max) {
      score += 10;
    }
  }

  // Volume filter
  if (filters.volumeRange) {
    maxScore += 10;
    if (stock.volume >= filters.volumeRange.min && stock.volume <= filters.volumeRange.max) {
      score += 10;
    }
  }

  // Signal type filter
  if (filters.signalType && stock.latestSignal) {
    maxScore += 15;
    if (stock.latestSignal.type === filters.signalType) {
      score += 15;
    }
  }

  // Confidence filter
  if (filters.confidenceMin && stock.latestSignal) {
    maxScore += 15;
    if (stock.latestSignal.confidence >= filters.confidenceMin) {
      score += 15;
    }
  }

  // RSI filter
  if (filters.rsiRange) {
    maxScore += 10;
    if (stock.technicalIndicators.rsi >= filters.rsiRange.min && 
        stock.technicalIndicators.rsi <= filters.rsiRange.max) {
      score += 10;
    }
  }

  // MACD filter
  if (filters.macdPositive !== undefined) {
    maxScore += 10;
    const macdIsPositive = stock.technicalIndicators.macd > 0;
    if (macdIsPositive === filters.macdPositive) {
      score += 10;
    }
  }

  // SMA alignment filter
  if (filters.smaAlignment) {
    maxScore += 15;
    const price = stock.price;
    const sma20 = stock.technicalIndicators.sma20;
    const sma50 = stock.technicalIndicators.sma50;
    const sma200 = stock.technicalIndicators.sma200;

    let alignment = 'neutral';
    if (price > sma20 && sma20 > sma50 && sma50 > sma200) {
      alignment = 'bullish';
    } else if (price < sma20 && sma20 < sma50 && sma50 < sma200) {
      alignment = 'bearish';
    }

    if (alignment === filters.smaAlignment) {
      score += 15;
    }
  }

  // Volume above average
  if (filters.volumeAboveAverage) {
    maxScore += 10;
    if (stock.volume > stock.avgVolume) {
      score += 10;
    }
  }

  // Price above 200 SMA
  if (filters.priceAbove200SMA) {
    maxScore += 10;
    if (stock.price > stock.technicalIndicators.sma200) {
      score += 10;
    }
  }

  // Normalize score to 0-100
  return maxScore > 0 ? (score / maxScore) * 100 : 0;
}

/**
 * Filter stocks based on criteria
 */
export function filterStocks(stocks: any[], filters: ScreenerFilter): ScreenerResult[] {
  return stocks
    .map((stock) => ({
      ...stock,
      matchScore: calculateMatchScore(stock, filters),
    }))
    .filter((stock) => stock.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Get popular screeners (pre-built filters)
 */
export const POPULAR_SCREENERS = {
  bullish_breakout: {
    name: 'Bullish Breakout',
    description: 'Stocks showing bullish signals with strong volume',
    filters: {
      signalType: 'buy' as const,
      confidenceMin: 60,
      volumeAboveAverage: true,
      smaAlignment: 'bullish' as const,
    },
  },
  oversold_recovery: {
    name: 'Oversold Recovery',
    description: 'Stocks with RSI < 30 (oversold) showing buy signals',
    filters: {
      signalType: 'buy' as const,
      rsiRange: { min: 0, max: 30 },
      confidenceMin: 50,
    },
  },
  momentum_gainers: {
    name: 'Momentum Gainers',
    description: 'Stocks with strong positive MACD and volume',
    filters: {
      macdPositive: true,
      volumeAboveAverage: true,
      confidenceMin: 55,
    },
  },
  high_volume_sellers: {
    name: 'High Volume Sellers',
    description: 'Stocks with sell signals on high volume',
    filters: {
      signalType: 'sell' as const,
      volumeAboveAverage: true,
      confidenceMin: 60,
    },
  },
  golden_cross: {
    name: 'Golden Cross Setup',
    description: 'Bullish SMA alignment (20 > 50 > 200)',
    filters: {
      smaAlignment: 'bullish' as const,
      priceAbove200SMA: true,
    },
  },
};

/**
 * Get screener statistics
 */
export function getScreenerStats(results: ScreenerResult[]) {
  if (results.length === 0) {
    return {
      totalMatches: 0,
      avgMatchScore: 0,
      topSignal: null,
      avgPrice: 0,
      avgVolume: 0,
    };
  }

  const avgMatchScore = results.reduce((sum, r) => sum + r.matchScore, 0) / results.length;
  const avgPrice = results.reduce((sum, r) => sum + r.price, 0) / results.length;
  const avgVolume = results.reduce((sum, r) => sum + r.volume, 0) / results.length;

  const signalCounts = {
    buy: results.filter((r) => r.latestSignal?.type === 'buy').length,
    sell: results.filter((r) => r.latestSignal?.type === 'sell').length,
    hold: results.filter((r) => r.latestSignal?.type === 'hold').length,
  };

  const topSignal = Object.entries(signalCounts).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )[0] as 'buy' | 'sell' | 'hold';

  return {
    totalMatches: results.length,
    avgMatchScore: avgMatchScore.toFixed(1),
    topSignal,
    signalCounts,
    avgPrice: avgPrice.toFixed(2),
    avgVolume: Math.round(avgVolume),
  };
}

/**
 * Export screener results to CSV
 */
export function exportScreenerResults(results: ScreenerResult[]): string {
  const headers = [
    'Ticker',
    'Price',
    'Price Change %',
    'Volume',
    'Avg Volume',
    'Signal Type',
    'Signal Confidence',
    'RSI',
    'MACD',
    'SMA 20',
    'SMA 50',
    'SMA 200',
    'Match Score',
  ];

  const rows = results.map((r) => [
    r.ticker,
    r.price.toFixed(2),
    r.priceChange.toFixed(2),
    r.volume,
    r.avgVolume,
    r.latestSignal?.type || 'N/A',
    r.latestSignal?.confidence || 'N/A',
    r.technicalIndicators.rsi.toFixed(2),
    r.technicalIndicators.macd.toFixed(2),
    r.technicalIndicators.sma20.toFixed(2),
    r.technicalIndicators.sma50.toFixed(2),
    r.technicalIndicators.sma200.toFixed(2),
    r.matchScore.toFixed(1),
  ]);

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
  return csv;
}
