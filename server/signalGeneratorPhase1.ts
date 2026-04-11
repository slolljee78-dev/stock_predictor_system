/**
 * Signal Generator Phase 1 - Enhanced with Volume, Multi-Timeframe, and Regime Detection
 * Wraps the base signal generator with Phase 1 improvements for higher accuracy
 */

import { generateTradingSignal, SignalGenerationInput, GeneratedSignal } from './signalGenerator';
import {
  analyzeVolume,
  detectMarketRegime,
  analyzeMultiTimeframe,
  generateEnhancedSignal,
  validateSignalQuality,
  calculateWinProbability,
  EnhancedSignal,
} from './enhancedSignalGenerator';
import { PricePoint } from './indicators';

export interface EnhancedSignalGenerationInput extends SignalGenerationInput {
  volumeHistory?: number[]; // Last 20 volumes for confirmation
  multiTimeframeSignals?: Map<string, { type: 'buy' | 'sell' | 'neutral'; confidence: number }>;
}

export interface SignalReport {
  ticker: string;
  currentPrice: number;
  timestamp: Date;
  signal: EnhancedSignal;
  winProbability: number;
  isValid: boolean;
  multiTimeframeSignals: Record<string, { type: 'buy' | 'sell' | 'neutral'; confidence: number }>;
  baseAnalysis: {
    type: 'buy' | 'sell' | null;
    confidence: number;
    analysis: string;
  };
}

export interface EnhancedGeneratedSignal extends GeneratedSignal {
  enhanced: EnhancedSignal;
  winProbability: number;
  isValid: boolean;
}

/**
 * Generate trading signal with Phase 1 enhancements
 * Returns enhanced signal with volume confirmation, multi-timeframe analysis, and regime detection
 */
export async function generateEnhancedTradingSignal(
  input: EnhancedSignalGenerationInput
): Promise<EnhancedGeneratedSignal> {
  // Generate base signal using LLM
  const baseSignal = await generateTradingSignal({
    ticker: input.ticker,
    stockId: input.stockId,
    priceHistory: input.priceHistory,
    currentPrice: input.currentPrice,
  });

  // Prepare data for Phase 1 analysis
  const recentPrices = input.priceHistory.slice(-50);
  const currentVolume = input.priceHistory[input.priceHistory.length - 1]?.volume || 0;
  const volumeHistory = input.volumeHistory || input.priceHistory.slice(-20).map(p => p.volume);

  // 1. Volume Confirmation
  const volumeAnalysis = analyzeVolume(currentVolume, volumeHistory, 1.5);

  // 2. Market Regime Detection
  const marketRegime = detectMarketRegime(recentPrices);

  // 3. Multi-Timeframe Analysis
  let multiTimeframeAlignment = 50; // Default neutral
  if (input.multiTimeframeSignals && input.multiTimeframeSignals.size > 0) {
    multiTimeframeAlignment = analyzeMultiTimeframe(input.multiTimeframeSignals);
  }

  // 4. Generate Enhanced Signal
  const baseSignalType = baseSignal.type === 'buy' ? 'buy' : baseSignal.type === 'sell' ? 'sell' : 'neutral';
  const enhancedSignal = generateEnhancedSignal(
    { type: baseSignalType, confidence: baseSignal.confidenceScore },
    volumeAnalysis,
    marketRegime,
    multiTimeframeAlignment
  );

  // 5. Calculate Win Probability
  const winProbability = calculateWinProbability(enhancedSignal);

  // 6. Validate Signal Quality
  const isValid = validateSignalQuality(enhancedSignal, 50, false, 40);

  return {
    ...baseSignal,
    enhanced: enhancedSignal,
    winProbability,
    isValid,
  };
}

/**
 * Generate multi-timeframe signals for a stock
 * Analyzes the same stock across different timeframes
 */
export async function generateMultiTimeframeSignals(
  ticker: string,
  stockId: number,
  priceHistory: PricePoint[],
  currentPrice: number
): Promise<Map<string, { type: 'buy' | 'sell' | 'neutral'; confidence: number }>> {
  const signals = new Map<string, { type: 'buy' | 'sell' | 'neutral'; confidence: number }>();

  // Define timeframes and their corresponding lookback periods
  const timeframes = [
    { name: '5m', periods: 5 },
    { name: '15m', periods: 15 },
    { name: '1h', periods: 60 },
    { name: 'daily', periods: 240 }, // Assuming 4 hours per trading day
  ];

  for (const timeframe of timeframes) {
    // Resample price data to timeframe
    const resampledPrices = resamplePriceData(priceHistory, timeframe.periods);

    if (resampledPrices.length < 50) {
      signals.set(timeframe.name, { type: 'neutral', confidence: 0 });
      continue;
    }

    // Generate signal for this timeframe
    const signal = await generateTradingSignal({
      ticker,
      stockId,
      priceHistory: resampledPrices,
      currentPrice,
    });

    signals.set(timeframe.name, {
      type: signal.type === 'buy' ? 'buy' : signal.type === 'sell' ? 'sell' : 'neutral',
      confidence: signal.confidenceScore,
    });
  }

  return signals;
}

/**
 * Resample price data to a different timeframe
 * Combines multiple candles into larger timeframe candles
 */
function resamplePriceData(prices: PricePoint[], periodMultiplier: number): PricePoint[] {
  if (periodMultiplier <= 1) return prices;

  const resampled: PricePoint[] = [];

  for (let i = 0; i < prices.length; i += periodMultiplier) {
    const chunk = prices.slice(i, i + periodMultiplier);
    if (chunk.length === 0) continue;

    const candle: PricePoint = {
      date: chunk[0].date,
      high: Math.max(...chunk.map(p => p.high)),
      low: Math.min(...chunk.map(p => p.low)),
      close: chunk[chunk.length - 1].close,
      volume: chunk.reduce((sum, p) => sum + p.volume, 0),
    };

    resampled.push(candle);
  }

  return resampled;
}

/**
 * Generate comprehensive signal report with all Phase 1 analysis
 */
export async function generateSignalReport(
  ticker: string,
  stockId: number,
  priceHistory: PricePoint[],
  currentPrice: number
) {
  // Generate multi-timeframe signals
  const multiTimeframeSignals = await generateMultiTimeframeSignals(
    ticker,
    stockId,
    priceHistory,
    currentPrice
  );

  // Generate enhanced signal
  const enhancedSignal = await generateEnhancedTradingSignal({
    ticker,
    stockId,
    priceHistory,
    currentPrice,
    multiTimeframeSignals,
  });

  return {
    ticker,
    currentPrice,
    timestamp: new Date(),
    signal: enhancedSignal.enhanced,
    winProbability: enhancedSignal.winProbability,
    isValid: enhancedSignal.isValid,
    multiTimeframeSignals: Object.fromEntries(multiTimeframeSignals),
    baseAnalysis: {
      type: enhancedSignal.type,
      confidence: enhancedSignal.confidenceScore,
      analysis: enhancedSignal.analysis,
    },
  };
}

/**
 * Filter signals based on quality criteria
 * Returns only high-quality signals suitable for trading
 */
export function filterHighQualitySignals(
  signals: EnhancedGeneratedSignal[],
  minConfidence: number = 60,
  minWinProbability: number = 55,
  requireVolumeConfirmation: boolean = false
): EnhancedGeneratedSignal[] {
  return signals.filter(signal => {
    // Check confidence threshold
    if (signal.enhanced.confidence < minConfidence) {
      return false;
    }

    // Check win probability threshold
    if (signal.winProbability < minWinProbability) {
      return false;
    }

    // Check volume confirmation if required
    if (requireVolumeConfirmation && !signal.enhanced.volumeConfirmed) {
      return false;
    }

    // Check overall validity
    if (!signal.isValid) {
      return false;
    }

    return true;
  });
}

/**
 * Calculate aggregate signal metrics for performance tracking
 */
export function calculateSignalMetrics(signals: EnhancedGeneratedSignal[]) {
  if (signals.length === 0) {
    return {
      totalSignals: 0,
      buySignals: 0,
      sellSignals: 0,
      averageConfidence: 0,
      averageWinProbability: 0,
      volumeConfirmedPercentage: 0,
      strongSignalsPercentage: 0,
    };
  }

  const buySignals = signals.filter(s => s.enhanced.type === 'buy').length;
  const sellSignals = signals.filter(s => s.enhanced.type === 'sell').length;
  const volumeConfirmed = signals.filter(s => s.enhanced.volumeConfirmed).length;
  const strongSignals = signals.filter(s => s.enhanced.strength === 'strong').length;

  const averageConfidence =
    signals.reduce((sum, s) => sum + s.enhanced.confidence, 0) / signals.length;
  const averageWinProbability =
    signals.reduce((sum, s) => sum + s.winProbability, 0) / signals.length;

  return {
    totalSignals: signals.length,
    buySignals,
    sellSignals,
    averageConfidence: Math.round(averageConfidence),
    averageWinProbability: Math.round(averageWinProbability),
    volumeConfirmedPercentage: Math.round((volumeConfirmed / signals.length) * 100),
    strongSignalsPercentage: Math.round((strongSignals / signals.length) * 100),
  };
}
