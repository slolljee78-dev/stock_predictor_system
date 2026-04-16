/**
 * Advanced Signal Filtering Service
 * Provides sophisticated filtering and ranking of trading signals
 */

export interface SignalFilter {
  minConfidence?: number;
  maxConfidence?: number;
  signalType?: "buy" | "sell" | "both";
  minVolume?: number;
  maxPriceChange?: number;
  sectors?: string[];
  excludeTickers?: string[];
  includeTickers?: string[];
  timeframe?: "1d" | "5d" | "1m" | "3m" | "1y";
  sortBy?: "confidence" | "volume" | "priceChange" | "date";
  limit?: number;
}

export interface FilteredSignal {
  id: number;
  ticker: string;
  type: "buy" | "sell";
  confidenceScore: number;
  priceAtSignal: number;
  volume?: number;
  priceChange?: number;
  sector?: string;
  indicators?: Record<string, unknown>;
  createdAt: Date;
  relevanceScore: number;
}

/**
 * Filter signals based on criteria
 */
export function filterSignals(
  signals: Array<{
    id: number;
    ticker: string;
    type: "buy" | "sell";
    confidenceScore: number;
    priceAtSignal: number;
    volume?: number;
    priceChange?: number;
    sector?: string;
    indicators?: Record<string, unknown>;
    createdAt: Date;
  }>,
  filter: SignalFilter
): FilteredSignal[] {
  let filtered = [...signals];

  // Filter by confidence score
  if (filter.minConfidence !== undefined) {
    filtered = filtered.filter((s) => s.confidenceScore >= filter.minConfidence!);
  }
  if (filter.maxConfidence !== undefined) {
    filtered = filtered.filter((s) => s.confidenceScore <= filter.maxConfidence!);
  }

  // Filter by signal type
  if (filter.signalType && filter.signalType !== "both") {
    filtered = filtered.filter((s) => s.type === filter.signalType);
  }

  // Filter by volume
  if (filter.minVolume !== undefined) {
    filtered = filtered.filter((s) => (s.volume || 0) >= filter.minVolume!);
  }

  // Filter by price change
  if (filter.maxPriceChange !== undefined) {
    filtered = filtered.filter((s) => Math.abs(s.priceChange || 0) <= filter.maxPriceChange!);
  }

  // Filter by sectors
  if (filter.sectors && filter.sectors.length > 0) {
    filtered = filtered.filter((s) => filter.sectors!.includes(s.sector || ""));
  }

  // Filter by excluded tickers
  if (filter.excludeTickers && filter.excludeTickers.length > 0) {
    filtered = filtered.filter((s) => !filter.excludeTickers!.includes(s.ticker));
  }

  // Filter by included tickers
  if (filter.includeTickers && filter.includeTickers.length > 0) {
    filtered = filtered.filter((s) => filter.includeTickers!.includes(s.ticker));
  }

  // Calculate relevance scores
  const withRelevance = filtered.map((signal) => ({
    ...signal,
    relevanceScore: calculateRelevanceScore(signal, filter),
  }));

  // Sort by specified criteria
  const sorted = sortSignals(withRelevance, filter.sortBy || "confidence");

  // Apply limit
  return sorted.slice(0, filter.limit || 50);
}

/**
 * Calculate relevance score for a signal
 */
function calculateRelevanceScore(
  signal: {
    confidenceScore: number;
    volume?: number;
    priceChange?: number;
  },
  filter: SignalFilter
): number {
  let score = 0;

  // Confidence component (0-40 points)
  score += (signal.confidenceScore / 100) * 40;

  // Volume component (0-30 points)
  if (signal.volume && filter.minVolume) {
    const volumeRatio = Math.min(signal.volume / filter.minVolume, 2);
    score += Math.min(volumeRatio * 15, 30);
  }

  // Price change component (0-30 points)
  if (signal.priceChange !== undefined && filter.maxPriceChange) {
    const changeRatio = 1 - Math.abs(signal.priceChange) / filter.maxPriceChange;
    score += Math.max(changeRatio * 30, 0);
  }

  return Math.round(score);
}

/**
 * Sort signals by specified criteria
 */
function sortSignals(
  signals: FilteredSignal[],
  sortBy: "confidence" | "volume" | "priceChange" | "date"
): FilteredSignal[] {
  const sorted = [...signals];

  switch (sortBy) {
    case "confidence":
      sorted.sort((a, b) => b.confidenceScore - a.confidenceScore);
      break;
    case "volume":
      sorted.sort((a, b) => (b.volume || 0) - (a.volume || 0));
      break;
    case "priceChange":
      sorted.sort((a, b) => Math.abs(b.priceChange || 0) - Math.abs(a.priceChange || 0));
      break;
    case "date":
      sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      break;
  }

  return sorted;
}

/**
 * Get signal statistics
 */
export function getSignalStatistics(signals: FilteredSignal[]) {
  if (signals.length === 0) {
    return {
      totalSignals: 0,
      buySignals: 0,
      sellSignals: 0,
      avgConfidence: 0,
      avgRelevance: 0,
      topSignals: [],
    };
  }

  const buySignals = signals.filter((s) => s.type === "buy");
  const sellSignals = signals.filter((s) => s.type === "sell");
  const avgConfidence = signals.reduce((sum, s) => sum + s.confidenceScore, 0) / signals.length;
  const avgRelevance = signals.reduce((sum, s) => sum + s.relevanceScore, 0) / signals.length;

  return {
    totalSignals: signals.length,
    buySignals: buySignals.length,
    sellSignals: sellSignals.length,
    avgConfidence: Math.round(avgConfidence),
    avgRelevance: Math.round(avgRelevance),
    topSignals: signals.slice(0, 5),
  };
}

/**
 * Create filter presets
 */
export const filterPresets = {
  highConfidence: {
    minConfidence: 80,
    sortBy: "confidence" as const,
    limit: 10,
  },
  lowRisk: {
    minConfidence: 70,
    maxPriceChange: 5,
    sortBy: "confidence" as const,
    limit: 10,
  },
  highVolume: {
    minVolume: 1000000,
    sortBy: "volume" as const,
    limit: 10,
  },
  bullish: {
    signalType: "buy" as const,
    minConfidence: 60,
    sortBy: "confidence" as const,
    limit: 15,
  },
  bearish: {
    signalType: "sell" as const,
    minConfidence: 60,
    sortBy: "confidence" as const,
    limit: 15,
  },
  recent: {
    sortBy: "date" as const,
    limit: 20,
  },
};
