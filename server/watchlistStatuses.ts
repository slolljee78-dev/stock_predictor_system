import { getUserWatchlist } from "./db";
import {
  calculateIndicators,
  fetchCurrentPrice,
  fetchDailyData,
  type MarketDataPoint,
  type PriceData,
} from "./hybridMarketData";
import {
  generateRealtimeSignal,
  type RealtimeSignal,
} from "./realtimeSignalGenerator";

export type WatchlistStockState =
  | "buy"
  | "sell"
  | "hold"
  | "low_confidence"
  | "no_active_setup"
  | "data_unavailable";

export interface WatchlistStatusSummary {
  ticker: string;
  state: WatchlistStockState;
  badge: string;
  detail: string;
  confidence: number | null;
  threshold: number;
  price: number | null;
}

export function classifyWatchlistSignalStatus(
  signal: RealtimeSignal | null,
  threshold: number,
): Omit<WatchlistStatusSummary, "ticker"> {
  if (!signal) {
    return {
      state: "data_unavailable",
      badge: "Data unavailable",
      detail: "We could not refresh market data for this stock right now.",
      confidence: null,
      threshold,
      price: null,
    };
  }

  if (signal.signalType === "buy" && signal.confidence >= threshold) {
    return {
      state: "buy",
      badge: "Buy",
      detail: signal.reasoning,
      confidence: signal.confidence,
      threshold,
      price: signal.price,
    };
  }

  if (signal.signalType === "sell" && signal.confidence >= threshold) {
    return {
      state: "sell",
      badge: "Sell",
      detail: signal.reasoning,
      confidence: signal.confidence,
      threshold,
      price: signal.price,
    };
  }

  if (signal.signalType === "hold") {
    return {
      state: signal.indicators.length > 0 ? "hold" : "no_active_setup",
      badge: signal.indicators.length > 0 ? "Hold" : "No active setup",
      detail:
        signal.reasoning ||
        (signal.indicators.length > 0
          ? "Signals are mixed, so no trade is being surfaced yet."
          : "Indicators are neutral, so there is no actionable setup yet."),
      confidence: signal.confidence,
      threshold,
      price: signal.price,
    };
  }

  return {
    state: "low_confidence",
    badge: "Low confidence",
    detail: `${signal.confidence}% confidence is below the ${threshold}% action threshold. ${signal.reasoning}`,
    confidence: signal.confidence,
    threshold,
    price: signal.price,
  };
}

async function fetchMarketDataForStatus(ticker: string): Promise<MarketDataPoint | null> {
  const [currentPrice, dailyData] = await Promise.all([
    fetchCurrentPrice(ticker),
    fetchDailyData(ticker, 100),
  ]);

  if (dailyData.length === 0) {
    return null;
  }

  const fallbackPrice = dailyData[dailyData.length - 1] as PriceData;
  const resolvedPrice = currentPrice ?? {
    ...fallbackPrice,
    timestamp: Date.now(),
  };

  const previousClose = dailyData[dailyData.length - 2]?.close ?? resolvedPrice.close;

  return {
    ticker,
    timestamp: resolvedPrice.timestamp,
    price: resolvedPrice,
    indicators: calculateIndicators(dailyData),
    change: resolvedPrice.close - previousClose,
    changePercent: previousClose > 0 ? ((resolvedPrice.close - previousClose) / previousClose) * 100 : 0,
  };
}

export async function getWatchlistStatuses(userId: number): Promise<WatchlistStatusSummary[]> {
  const watchlist = await getUserWatchlist(userId);

  const summaries = await Promise.all(
    watchlist.map(async (stock) => {
      const threshold = typeof stock.minConfidenceThreshold === "number" ? stock.minConfidenceThreshold : 25;

      try {
        const marketData = await fetchMarketDataForStatus(stock.ticker);
        const signal = marketData ? generateRealtimeSignal(marketData) : null;
        const summary = classifyWatchlistSignalStatus(signal, threshold);

        return {
          ticker: stock.ticker,
          ...summary,
        };
      } catch (error) {
        console.error(`[Watchlist Status] Failed to build status for ${stock.ticker}:`, error);
        return {
          ticker: stock.ticker,
          state: "data_unavailable" as const,
          badge: "Data unavailable",
          detail: "We could not refresh market data for this stock right now.",
          confidence: null,
          threshold,
          price: null,
        };
      }
    }),
  );

  return summaries;
}
