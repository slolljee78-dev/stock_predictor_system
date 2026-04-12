/**
 * Performance Filters & Quick Wins
 * 
 * Implements high-impact filters to improve signal quality:
 * - Volatility filter (skip signals when VIX > 25)
 * - Automatic profit-taking rules (+2% close, +5% close)
 * - Signal strength ranking (only trade >75% confidence)
 * - Market hours filter (avoid pre/post-market)
 * - Correlation filter (avoid correlated positions)
 * - Trade frequency limiter (max 10 trades/day)
 */

export interface FilteredSignal {
  symbol: string;
  originalConfidence: number;
  filteredConfidence: number;
  shouldTrade: boolean;
  filterReasons: string[];
  profitTargets: number[];
  stopLoss: number;
  expectedWinRate: number;
}

export interface MarketConditions {
  vixLevel: number;
  marketTrend: "BULLISH" | "BEARISH" | "NEUTRAL";
  volatility: number;
  isMarketHours: boolean;
  dayOfWeek: number;
  timeOfDay: number;
}

/**
 * Performance Filters Engine
 */
export class PerformanceFiltersEngine {
  private maxVixLevel = 25;
  private minConfidenceThreshold = 0.75;
  private maxTradesPerDay = 10;
  private profitTargets = [0.02, 0.05];
  private stopLossPercent = 0.02;
  private maxCorrelationForTrade = 0.7;
  private tradesExecutedToday = 0;

  /**
   * Check if current time is market hours
   */
  private isMarketHours(): boolean {
    const now = new Date();
    const estTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const hours = estTime.getHours();
    const minutes = estTime.getMinutes();
    const dayOfWeek = estTime.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) return false;

    const timeInMinutes = hours * 60 + minutes;
    return timeInMinutes >= 9 * 60 + 30 && timeInMinutes < 16 * 60;
  }

  /**
   * Volatility filter
   */
  applyVolatilityFilter(
    confidence: number,
    vixLevel: number
  ): { confidence: number; reason: string | null } {
    if (vixLevel > this.maxVixLevel) {
      return {
        confidence: confidence * 0.5,
        reason: `VIX level (${vixLevel.toFixed(1)}) exceeds threshold (${this.maxVixLevel})`,
      };
    }

    if (vixLevel < 15) {
      return {
        confidence: Math.min(confidence * 1.1, 0.95),
        reason: null,
      };
    }

    return { confidence, reason: null };
  }

  /**
   * Market hours filter
   */
  applyMarketHoursFilter(
    confidence: number,
    timestamp: number
  ): { confidence: number; reason: string | null } {
    const date = new Date(timestamp);
    const estTime = new Date(date.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const hours = estTime.getHours();
    const minutes = estTime.getMinutes();
    const dayOfWeek = estTime.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return {
        confidence: 0,
        reason: "Market closed (weekend)",
      };
    }

    const timeInMinutes = hours * 60 + minutes;
    const marketOpen = 9 * 60 + 30;
    const marketClose = 16 * 60;

    if (timeInMinutes < marketOpen || timeInMinutes >= marketClose) {
      return {
        confidence: confidence * 0.3,
        reason: `Outside market hours (${hours}:${String(minutes).padStart(2, "0")})`,
      };
    }

    return { confidence, reason: null };
  }

  /**
   * Signal strength filter
   */
  applySignalStrengthFilter(
    confidence: number
  ): { shouldTrade: boolean; reason: string | null } {
    if (confidence < this.minConfidenceThreshold) {
      return {
        shouldTrade: false,
        reason: `Confidence (${(confidence * 100).toFixed(1)}%) below threshold (${(this.minConfidenceThreshold * 100).toFixed(1)}%)`,
      };
    }

    return { shouldTrade: true, reason: null };
  }

  /**
   * Trade frequency limiter
   */
  applyTradeFrequencyFilter(
    confidence: number
  ): { shouldTrade: boolean; reason: string | null } {
    if (this.tradesExecutedToday >= this.maxTradesPerDay) {
      return {
        shouldTrade: false,
        reason: `Daily trade limit (${this.maxTradesPerDay}) reached`,
      };
    }

    return { shouldTrade: true, reason: null };
  }

  /**
   * Correlation filter
   */
  applyCorrelationFilter(
    symbol: string,
    confidence: number,
    existingPositions: Array<{ symbol: string; correlation: number }>
  ): { confidence: number; reason: string | null } {
    const highCorrelations = existingPositions.filter(
      (p) => p.correlation > this.maxCorrelationForTrade
    );

    if (highCorrelations.length > 0) {
      const correlatedSymbols = highCorrelations.map((p) => p.symbol).join(", ");
      return {
        confidence: confidence * 0.6,
        reason: `High correlation with existing positions: ${correlatedSymbols}`,
      };
    }

    return { confidence, reason: null };
  }

  /**
   * Calculate profit targets
   */
  calculateProfitTargets(
    currentPrice: number,
    confidence: number
  ): number[] {
    const targets: number[] = [];
    const confidenceMultiplier = confidence / 0.75;

    this.profitTargets.forEach((target) => {
      targets.push(currentPrice * (1 + target * confidenceMultiplier));
    });

    return targets;
  }

  /**
   * Calculate stop loss
   */
  calculateStopLoss(
    currentPrice: number,
    volatility: number
  ): number {
    const volatilityAdjustment = Math.max(0.01, Math.min(volatility, 0.05));
    const stopLossPercent = this.stopLossPercent + volatilityAdjustment;

    return currentPrice * (1 - stopLossPercent);
  }

  /**
   * Apply all filters to a signal
   */
  applyAllFilters(
    symbol: string,
    originalConfidence: number,
    currentPrice: number,
    marketConditions: MarketConditions,
    existingPositions: Array<{ symbol: string; correlation: number }>
  ): FilteredSignal {
    let confidence = originalConfidence;
    const filterReasons: string[] = [];

    const volatilityResult = this.applyVolatilityFilter(confidence, marketConditions.vixLevel);
    confidence = volatilityResult.confidence;
    if (volatilityResult.reason) filterReasons.push(volatilityResult.reason);

    const hoursResult = this.applyMarketHoursFilter(confidence, Date.now());
    confidence = hoursResult.confidence;
    if (hoursResult.reason) filterReasons.push(hoursResult.reason);

    const correlationResult = this.applyCorrelationFilter(
      symbol,
      confidence,
      existingPositions
    );
    confidence = correlationResult.confidence;
    if (correlationResult.reason) filterReasons.push(correlationResult.reason);

    const strengthResult = this.applySignalStrengthFilter(confidence);
    if (strengthResult.reason) filterReasons.push(strengthResult.reason);

    const frequencyResult = this.applyTradeFrequencyFilter(confidence);
    if (frequencyResult.reason) filterReasons.push(frequencyResult.reason);

    const shouldTrade =
      strengthResult.shouldTrade &&
      frequencyResult.shouldTrade &&
      confidence > this.minConfidenceThreshold;

    const profitTargets = this.calculateProfitTargets(currentPrice, confidence);
    const stopLoss = this.calculateStopLoss(currentPrice, marketConditions.volatility);
    const expectedWinRate = Math.max(0.5, confidence * 0.8);

    if (shouldTrade) {
      this.tradesExecutedToday++;
    }

    return {
      symbol,
      originalConfidence,
      filteredConfidence: confidence,
      shouldTrade,
      filterReasons,
      profitTargets,
      stopLoss,
      expectedWinRate,
    };
  }

  /**
   * Reset daily trade counter
   */
  resetDailyCounter(): void {
    this.tradesExecutedToday = 0;
  }

  /**
   * Get filter statistics
   */
  getFilterStats() {
    return {
      maxVixLevel: this.maxVixLevel,
      minConfidenceThreshold: this.minConfidenceThreshold,
      maxTradesPerDay: this.maxTradesPerDay,
      tradesExecutedToday: this.tradesExecutedToday,
      maxCorrelationForTrade: this.maxCorrelationForTrade,
      stopLossPercent: this.stopLossPercent,
    };
  }
}

let engineInstance: PerformanceFiltersEngine | null = null;

export function getPerformanceFiltersEngine(): PerformanceFiltersEngine {
  if (!engineInstance) {
    engineInstance = new PerformanceFiltersEngine();
  }
  return engineInstance;
}

export async function filterSignal(
  symbol: string,
  confidence: number,
  currentPrice: number,
  marketConditions: MarketConditions,
  existingPositions: Array<{ symbol: string; correlation: number }>
): Promise<FilteredSignal> {
  const engine = getPerformanceFiltersEngine();
  return engine.applyAllFilters(
    symbol,
    confidence,
    currentPrice,
    marketConditions,
    existingPositions
  );
}
