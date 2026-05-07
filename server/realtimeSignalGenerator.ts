/**
 * Real-time Signal Generator
 * Generates buy/sell signals based on technical indicators from live market data
 * Complements the LLM-based signal generator with real-time technical analysis
 */

import { MarketDataPoint, TechnicalIndicators } from './realtimeMarketData';

export type SignalType = 'buy' | 'sell' | 'hold';

export interface RealtimeSignal {
  ticker: string;
  signalType: SignalType;
  confidence: number; // 0-100
  price: number;
  timestamp: number;
  indicators: string[];
  reasoning: string;
  technicalData: {
    rsi: number | null;
    macd: number | null;
    smaPosition: string; // 'above' | 'below' | 'neutral'
    bbPosition: string; // 'upper' | 'lower' | 'middle'
  };
}

/**
 * Generate signals based on technical indicators
 */
export function generateRealtimeSignal(marketData: MarketDataPoint): RealtimeSignal {
  const { indicators, price, ticker, timestamp } = marketData;

  // Analyze each indicator
  const signals: SignalType[] = [];
  const triggerIndicators: string[] = [];
  let totalConfidence = 0;
  let indicatorCount = 0;

  // RSI Analysis (Oversold/Overbought)
  if (indicators.rsi14 !== null) {
    indicatorCount++;
    if (indicators.rsi14 < 30) {
      signals.push('buy');
      triggerIndicators.push('RSI Oversold');
      totalConfidence += 40;
    } else if (indicators.rsi14 > 70) {
      signals.push('sell');
      triggerIndicators.push('RSI Overbought');
      totalConfidence += 40;
    } else if (indicators.rsi14 < 50) {
      signals.push('sell');
      triggerIndicators.push('RSI Downtrend');
      totalConfidence += 20;
    } else {
      signals.push('buy');
      triggerIndicators.push('RSI Uptrend');
      totalConfidence += 20;
    }
  }

  // MACD Analysis
  if (indicators.macd !== null && indicators.macdSignal !== null) {
    indicatorCount++;
    const macdHistogram = indicators.macd - indicators.macdSignal;

    if (macdHistogram > 0 && indicators.macd > 0) {
      signals.push('buy');
      triggerIndicators.push('MACD Bullish');
      totalConfidence += 30;
    } else if (macdHistogram < 0 && indicators.macd < 0) {
      signals.push('sell');
      triggerIndicators.push('MACD Bearish');
      totalConfidence += 30;
    } else if (macdHistogram > 0) {
      signals.push('buy');
      triggerIndicators.push('MACD Crossover');
      totalConfidence += 25;
    } else {
      signals.push('sell');
      triggerIndicators.push('MACD Crossunder');
      totalConfidence += 25;
    }
  }

  // Moving Average Analysis
  const smaSignal = analyzeSMA(indicators, price.close);
  if (smaSignal.signal) {
    signals.push(smaSignal.signal);
    triggerIndicators.push(smaSignal.reason);
    totalConfidence += 25;
    indicatorCount++;
  }

  // Bollinger Bands Analysis
  const bbSignal = analyzeBollingerBands(indicators, price.close);
  if (bbSignal.signal) {
    signals.push(bbSignal.signal);
    triggerIndicators.push(bbSignal.reason);
    totalConfidence += 20;
    indicatorCount++;
  }

  // Determine final signal
  const buyCount = signals.filter(s => s === 'buy').length;
  const sellCount = signals.filter(s => s === 'sell').length;

  let finalSignal: SignalType = 'hold';
  if (buyCount > sellCount) {
    finalSignal = 'buy';
  } else if (sellCount > buyCount) {
    finalSignal = 'sell';
  }

  // Calculate confidence
  const confidence = indicatorCount > 0 ? Math.min(100, Math.round((totalConfidence / indicatorCount) * 1.2)) : 0;

  // Generate reasoning
  const reasoning = generateReasoning(finalSignal, triggerIndicators, indicators, price.close);

  // Analyze technical positions
  const smaPos = getSMAPosition(indicators, price.close);
  const bbPos = getBBPosition(indicators, price.close);

  return {
    ticker,
    signalType: finalSignal,
    confidence,
    price: price.close,
    timestamp,
    indicators: triggerIndicators,
    reasoning,
    technicalData: {
      rsi: indicators.rsi14,
      macd: indicators.macd,
      smaPosition: smaPos,
      bbPosition: bbPos,
    },
  };
}

/**
 * Analyze SMA (Simple Moving Average)
 */
function analyzeSMA(
  indicators: TechnicalIndicators,
  currentPrice: number
): { signal: SignalType | null; reason: string } {
  if (!indicators.sma20 || !indicators.sma50) {
    return { signal: null, reason: '' };
  }

  // Golden Cross: SMA20 > SMA50 (bullish)
  if (indicators.sma20 > indicators.sma50) {
    if (currentPrice > indicators.sma20) {
      return { signal: 'buy', reason: 'Price above SMA20 (Golden Cross)' };
    } else if (currentPrice > indicators.sma50) {
      return { signal: 'buy', reason: 'Price between SMA20/50 (Bullish)' };
    }
  }

  // Death Cross: SMA20 < SMA50 (bearish)
  if (indicators.sma20 < indicators.sma50) {
    if (currentPrice < indicators.sma20) {
      return { signal: 'sell', reason: 'Price below SMA20 (Death Cross)' };
    } else if (currentPrice < indicators.sma50) {
      return { signal: 'sell', reason: 'Price between SMA20/50 (Bearish)' };
    }
  }

  return { signal: null, reason: '' };
}

/**
 * Analyze Bollinger Bands
 */
function analyzeBollingerBands(
  indicators: TechnicalIndicators,
  currentPrice: number
): { signal: SignalType | null; reason: string } {
  if (!indicators.bb20Upper || !indicators.bb20Lower) {
    return { signal: null, reason: '' };
  }

  const middle = (indicators.bb20Upper + indicators.bb20Lower) / 2;

  // Price at upper band (potential reversal)
  if (currentPrice > indicators.bb20Upper * 0.98) {
    return { signal: 'sell', reason: 'Price at Bollinger Band Upper (Overbought)' };
  }

  // Price at lower band (potential reversal)
  if (currentPrice < indicators.bb20Lower * 1.02) {
    return { signal: 'buy', reason: 'Price at Bollinger Band Lower (Oversold)' };
  }

  // Price above middle (bullish)
  if (currentPrice > middle) {
    return { signal: 'buy', reason: 'Price above BB Middle (Bullish)' };
  }

  // Price below middle (bearish)
  if (currentPrice < middle) {
    return { signal: 'sell', reason: 'Price below BB Middle (Bearish)' };
  }

  return { signal: null, reason: '' };
}

/**
 * Get SMA position relative to price
 */
function getSMAPosition(indicators: TechnicalIndicators, currentPrice: number): string {
  if (!indicators.sma20 || !indicators.sma50) return 'neutral';

  if (currentPrice > indicators.sma20 && currentPrice > indicators.sma50) {
    return 'above';
  } else if (currentPrice < indicators.sma20 && currentPrice < indicators.sma50) {
    return 'below';
  }

  return 'neutral';
}

/**
 * Get Bollinger Band position
 */
function getBBPosition(indicators: TechnicalIndicators, currentPrice: number): string {
  if (!indicators.bb20Upper || !indicators.bb20Lower) return 'middle';

  const middle = (indicators.bb20Upper + indicators.bb20Lower) / 2;

  if (currentPrice > middle) {
    return 'upper';
  } else if (currentPrice < middle) {
    return 'lower';
  }

  return 'middle';
}

/**
 * Generate human-readable reasoning
 */
function generateReasoning(
  signal: SignalType,
  indicators: string[],
  technicalData: TechnicalIndicators,
  price: number
): string {
  if (signal === 'hold') {
    return 'Mixed signals detected. Hold current position.';
  }

  const action = signal === 'buy' ? 'BUY' : 'SELL';
  const reasons = indicators.slice(0, 3).join(', ');

  let sentiment = '';
  if (technicalData.rsi14 !== null) {
    if (technicalData.rsi14 < 30) {
      sentiment = 'Stock is oversold with strong downside momentum.';
    } else if (technicalData.rsi14 > 70) {
      sentiment = 'Stock is overbought with strong upside momentum.';
    } else if (technicalData.rsi14 < 50) {
      sentiment = 'Stock shows downside momentum.';
    } else {
      sentiment = 'Stock shows upside momentum.';
    }
  }

  return `${action} signal triggered by: ${reasons}. ${sentiment} Current price: $${price.toFixed(2)}.`;
}

/**
 * Validate signal strength
 */
export function validateSignalStrength(signal: RealtimeSignal, minConfidence: number = 25): boolean {
  return signal.confidence >= minConfidence && signal.signalType !== 'hold';
}

/**
 * Filter signals by confidence threshold
 */
export function filterSignalsByConfidence(
  signals: RealtimeSignal[],
  minConfidence: number = 25
): RealtimeSignal[] {
  return signals.filter(signal => signal.confidence >= minConfidence && signal.signalType !== 'hold');
}

/**
 * Detect divergence between price and indicators
 */
export function detectDivergence(
  currentSignal: RealtimeSignal,
  previousPrice: number,
  currentPrice: number
): { hasDivergence: boolean; type: 'bullish' | 'bearish' | null } {
  const priceMoving = currentPrice > previousPrice ? 'up' : 'down';
  const indicatorSignal = currentSignal.signalType;

  // Bullish divergence: price down, signal up
  if (priceMoving === 'down' && indicatorSignal === 'buy') {
    return { hasDivergence: true, type: 'bullish' };
  }

  // Bearish divergence: price up, signal down
  if (priceMoving === 'up' && indicatorSignal === 'sell') {
    return { hasDivergence: true, type: 'bearish' };
  }

  return { hasDivergence: false, type: null };
}
