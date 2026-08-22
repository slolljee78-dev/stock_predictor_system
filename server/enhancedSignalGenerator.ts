import { PricePoint } from './indicators';

/**
 * Enhanced Signal Generator with Phase 1 Improvements:
 * - Volume confirmation
 * - Multi-timeframe analysis
 * - Market regime detection
 */

export interface EnhancedSignal {
  type: 'buy' | 'sell' | 'neutral';
  confidence: number; // 0-100
  reason: string;
  volumeConfirmed: boolean;
  multiTimeframeAlignment: number; // 0-100 (% of timeframes aligned)
  marketRegime: 'trending_up' | 'trending_down' | 'ranging' | 'volatile';
  strength: 'weak' | 'moderate' | 'strong';
}

export interface VolumeAnalysis {
  currentVolume: number;
  averageVolume: number;
  volumeRatio: number; // current / average
  isConfirmed: boolean; // volume > 1.5x average
}

export interface MarketRegime {
  type: 'trending_up' | 'trending_down' | 'ranging' | 'volatile';
  strength: number; // 0-100
  atr: number; // Average True Range for volatility
}

/**
 * Analyze volume to confirm signal strength
 */
export function analyzeVolume(
  currentVolume: number,
  volumeHistory: number[],
  minConfirmationRatio: number = 1.5
): VolumeAnalysis {
  if (volumeHistory.length === 0) {
    return {
      currentVolume,
      averageVolume: 0,
      volumeRatio: 0,
      isConfirmed: false,
    };
  }

  const averageVolume = volumeHistory.reduce((a, b) => a + b, 0) / volumeHistory.length;
  const volumeRatio = currentVolume / averageVolume;
  const isConfirmed = volumeRatio >= minConfirmationRatio;

  return {
    currentVolume,
    averageVolume,
    volumeRatio,
    isConfirmed,
  };
}

/**
 * Detect market regime (trending, ranging, volatile)
 */
export function detectMarketRegime(prices: PricePoint[]): MarketRegime {
  if (prices.length < 20) {
    return {
      type: 'ranging',
      strength: 0,
      atr: 0,
    };
  }

  // Calculate ATR (Average True Range) for volatility
  const trueRanges = prices.slice(1).map((price, i) => {
    const prev = prices[i];
    const tr1 = price.high - price.low;
    const tr2 = Math.abs(price.high - prev.close);
    const tr3 = Math.abs(price.low - prev.close);
    return Math.max(tr1, tr2, tr3);
  });

  const atr = trueRanges.reduce((a, b) => a + b, 0) / trueRanges.length;
  const atrPercent = (atr / prices[prices.length - 1].close) * 100;

  // Calculate trend using SMA
  const sma20 = prices.slice(-20).reduce((a, b) => a + b.close, 0) / 20;
  const sma50 = prices.length >= 50 
    ? prices.slice(-50).reduce((a, b) => a + b.close, 0) / 50 
    : sma20;

  const currentPrice = prices[prices.length - 1].close;
  const trendStrength = Math.abs((currentPrice - sma50) / sma50) * 100;

  // Determine regime
  let type: MarketRegime['type'];
  let strength: number;

  if (atrPercent > 3) {
    // High volatility
    type = 'volatile';
    strength = Math.min(100, atrPercent * 10);
  } else if (trendStrength > 2) {
    // Clear trend
    type = currentPrice > sma50 ? 'trending_up' : 'trending_down';
    strength = Math.min(100, trendStrength * 20);
  } else {
    // Ranging market
    type = 'ranging';
    strength = Math.min(100, (2 - trendStrength) * 50);
  }

  return {
    type,
    strength,
    atr,
  };
}

/**
 * Analyze signal alignment across multiple timeframes
 * Returns percentage of timeframes that align with the signal
 */
export function analyzeMultiTimeframe(
  signals: Map<string, { type: 'buy' | 'sell' | 'neutral'; confidence: number }>
): number {
  if (signals.size === 0) return 0;

  const timeframes = Array.from(signals.values());
  const bullishSignals = timeframes.filter(s => s.type === 'buy').length;
  const bearishSignals = timeframes.filter(s => s.type === 'sell').length;
  const neutralSignals = timeframes.filter(s => s.type === 'neutral').length;

  // Calculate alignment score
  const maxSignals = Math.max(bullishSignals, bearishSignals);
  const alignment = (maxSignals / timeframes.length) * 100;

  return alignment;
}

/**
 * Generate enhanced signal with Phase 1 improvements
 */
export function generateEnhancedSignal(
  baseSignal: { type: 'buy' | 'sell' | 'neutral'; confidence: number },
  volumeAnalysis: VolumeAnalysis,
  marketRegime: MarketRegime,
  multiTimeframeAlignment: number
): EnhancedSignal {
  let confidence = baseSignal.confidence;
  let strength: 'weak' | 'moderate' | 'strong' = 'moderate';

  // Boost confidence if volume is confirmed
  if (volumeAnalysis.isConfirmed) {
    confidence = Math.min(100, confidence + 10);
  } else if (baseSignal.type !== 'neutral') {
    // Reduce confidence if volume not confirmed
    confidence = Math.max(0, confidence - 15);
  }

  // Adjust confidence based on market regime
  if (baseSignal.type === 'buy' && marketRegime.type === 'trending_up') {
    confidence = Math.min(100, confidence + 15);
  } else if (baseSignal.type === 'sell' && marketRegime.type === 'trending_down') {
    confidence = Math.min(100, confidence + 15);
  } else if (marketRegime.type === 'ranging') {
    // Reduce confidence in ranging markets
    confidence = Math.max(0, confidence - 10);
  } else if (marketRegime.type === 'volatile') {
    // Reduce confidence in volatile markets
    confidence = Math.max(0, confidence - 20);
  }

  // Adjust confidence based on multi-timeframe alignment
  const alignmentBoost = (multiTimeframeAlignment / 100) * 20;
  confidence = Math.min(100, confidence + alignmentBoost);

  // Determine strength
  if (confidence >= 70) {
    strength = 'strong';
  } else if (confidence >= 50) {
    strength = 'moderate';
  } else {
    strength = 'weak';
  }

  // Build reason string
  let reason = `${baseSignal.type.toUpperCase()} signal (base confidence: ${baseSignal.confidence}%)`;
  
  if (volumeAnalysis.isConfirmed) {
    reason += ` | Volume confirmed (${volumeAnalysis.volumeRatio.toFixed(1)}x average)`;
  } else {
    reason += ` | Low volume (${volumeAnalysis.volumeRatio.toFixed(1)}x average)`;
  }

  reason += ` | Market: ${marketRegime.type} (strength: ${marketRegime.strength.toFixed(0)}%)`;
  reason += ` | Timeframe alignment: ${multiTimeframeAlignment.toFixed(0)}%`;

  return {
    type: baseSignal.type,
    confidence: Math.round(confidence),
    reason,
    volumeConfirmed: volumeAnalysis.isConfirmed,
    multiTimeframeAlignment: Math.round(multiTimeframeAlignment),
    marketRegime: marketRegime.type,
    strength,
  };
}

/**
 * Calculate volatility-adjusted position size
 * Higher volatility = smaller position
 */
export function calculatePositionSize(
  portfolio: { cash: number },
  atr: number,
  currentPrice: number,
  riskPercentage: number = 2 // Risk 2% of portfolio per trade
): number {
  const riskAmount = portfolio.cash * (riskPercentage / 100);
  const stopLossDistance = atr * 2; // 2x ATR stop loss
  const positionSize = riskAmount / stopLossDistance;
  const maxShares = Math.floor(positionSize);

  // Ensure we don't spend more than 10% of portfolio on one trade
  const maxCost = portfolio.cash * 0.1;
  const maxSharesByBudget = Math.floor(maxCost / currentPrice);

  return Math.min(maxShares, maxSharesByBudget);
}

/**
 * Validate signal quality
 * Returns true if signal meets minimum quality thresholds
 */
export function validateSignalQuality(
  signal: EnhancedSignal,
  minConfidence: number = 50,
  requireVolumeConfirmation: boolean = false,
  requireMultiTimeframeAlignment: number = 50
): boolean {
  // Check minimum confidence
  if (signal.confidence < minConfidence) {
    return false;
  }

  // Check volume confirmation if required
  if (requireVolumeConfirmation && !signal.volumeConfirmed) {
    return false;
  }

  // Check multi-timeframe alignment if required
  if (signal.multiTimeframeAlignment < requireMultiTimeframeAlignment) {
    return false;
  }

  // Don't trade neutral signals
  if (signal.type === 'neutral') {
    return false;
  }

  // Avoid trading in highly volatile markets
  if (signal.marketRegime === 'volatile' && signal.confidence < 70) {
    return false;
  }

  return true;
}

/**
 * Calculate win probability based on signal characteristics
 */
export function calculateWinProbability(signal: EnhancedSignal): number {
  let probability = 50; // Base 50% probability

  // Confidence adjustment
  probability += (signal.confidence - 50) * 0.4; // 40% weight on confidence

  // Volume confirmation bonus
  if (signal.volumeConfirmed) {
    probability += 5;
  }

  // Market regime adjustment
  if (
    (signal.type === 'buy' && signal.marketRegime === 'trending_up') ||
    (signal.type === 'sell' && signal.marketRegime === 'trending_down')
  ) {
    probability += 8;
  }

  // Multi-timeframe alignment bonus
  probability += (signal.multiTimeframeAlignment / 100) * 10;

  // Strength adjustment
  if (signal.strength === 'strong') {
    probability += 5;
  } else if (signal.strength === 'weak') {
    probability -= 5;
  }

  // Cap between 30% and 85% (realistic bounds)
  return Math.max(30, Math.min(85, probability));
}
