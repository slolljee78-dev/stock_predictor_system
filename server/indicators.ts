/**
 * Technical Indicator Calculations
 * Implements RSI, MACD, Bollinger Bands, SMA, and EMA
 */

export interface PricePoint {
  date: Date;
  close: number;
  high: number;
  low: number;
  volume: number;
}

export interface IndicatorValues {
  rsi: number | null;
  macd: { line: number; signal: number; histogram: number } | null;
  bollingerBands: { upper: number; middle: number; lower: number } | null;
  sma20: number | null;
  sma50: number | null;
  ema12: number | null;
  ema26: number | null;
}

/**
 * Calculate Relative Strength Index (RSI)
 * RSI = 100 - (100 / (1 + RS))
 * RS = Average Gain / Average Loss
 */
export function calculateRSI(prices: number[], period: number = 14): number | null {
  if (prices.length < period + 1) return null;

  let gains = 0;
  let losses = 0;

  // Calculate initial gains and losses
  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return avgGain === 0 ? 50 : 100;

  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  return Math.round(rsi * 100) / 100;
}

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(prices: number[], period: number): number | null {
  if (prices.length < period) return null;

  const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
  return Math.round((sum / period) * 100) / 100;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(prices: number[], period: number): number | null {
  if (prices.length < period) return null;

  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }

  return Math.round(ema * 100) / 100;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  prices: number[]
): { line: number; signal: number; histogram: number } | null {
  if (prices.length < 26) return null;

  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);

  if (!ema12 || !ema26) return null;

  const macdLine = ema12 - ema26;

  // Calculate signal line (9-period EMA of MACD line)
  // For simplicity, we'll use a basic approximation
  const signalLine = Math.round(macdLine * 0.9 * 100) / 100;
  const histogram = macdLine - signalLine;

  return {
    line: Math.round(macdLine * 100) / 100,
    signal: signalLine,
    histogram: Math.round(histogram * 100) / 100,
  };
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(
  prices: number[],
  period: number = 20,
  stdDevMultiplier: number = 2
): { upper: number; middle: number; lower: number } | null {
  if (prices.length < period) return null;

  const recentPrices = prices.slice(-period);
  const middle = recentPrices.reduce((a, b) => a + b, 0) / period;

  const variance =
    recentPrices.reduce((sum, price) => sum + Math.pow(price - middle, 2), 0) /
    period;
  const stdDev = Math.sqrt(variance);

  return {
    upper: Math.round((middle + stdDev * stdDevMultiplier) * 100) / 100,
    middle: Math.round(middle * 100) / 100,
    lower: Math.round((middle - stdDev * stdDevMultiplier) * 100) / 100,
  };
}

/**
 * Calculate all indicators for a given price history
 */
export function calculateAllIndicators(pricePoints: PricePoint[]): IndicatorValues {
  if (pricePoints.length === 0) {
    return {
      rsi: null,
      macd: null,
      bollingerBands: null,
      sma20: null,
      sma50: null,
      ema12: null,
      ema26: null,
    };
  }

  const closePrices = pricePoints.map(p => p.close);

  return {
    rsi: calculateRSI(closePrices, 14),
    macd: calculateMACD(closePrices),
    bollingerBands: calculateBollingerBands(closePrices, 20),
    sma20: calculateSMA(closePrices, 20),
    sma50: calculateSMA(closePrices, 50),
    ema12: calculateEMA(closePrices, 12),
    ema26: calculateEMA(closePrices, 26),
  };
}

/**
 * Analyze indicators to generate a buy/sell signal
 * Returns: { signal: 'buy' | 'sell' | null, confidence: 0-100 }
 */
export function analyzeIndicators(indicators: IndicatorValues): {
  signal: 'buy' | 'sell' | null;
  confidence: number;
} {
  let buySignals = 0;
  let sellSignals = 0;
  const totalSignals = 5; // RSI, MACD, Bollinger Bands, SMA, EMA

  // RSI Analysis (30 = oversold/buy, 70 = overbought/sell)
  if (indicators.rsi !== null) {
    if (indicators.rsi < 30) buySignals++;
    else if (indicators.rsi > 70) sellSignals++;
  }

  // MACD Analysis (positive = bullish, negative = bearish)
  if (indicators.macd !== null) {
    if (indicators.macd.histogram > 0 && indicators.macd.line > indicators.macd.signal) {
      buySignals++;
    } else if (indicators.macd.histogram < 0 && indicators.macd.line < indicators.macd.signal) {
      sellSignals++;
    }
  }

  // Bollinger Bands Analysis
  if (indicators.bollingerBands !== null) {
    // Price near lower band = oversold = buy
    const bbRange = indicators.bollingerBands.upper - indicators.bollingerBands.lower;
    const pricePosition =
      (indicators.bollingerBands.middle - indicators.bollingerBands.lower) / bbRange;

    if (pricePosition < 0.2) buySignals++;
    else if (pricePosition > 0.8) sellSignals++;
  }

  // SMA Analysis (price above SMA = uptrend, below = downtrend)
  if (indicators.sma20 !== null && indicators.sma50 !== null) {
    if (indicators.sma20 > indicators.sma50) buySignals++;
    else sellSignals++;
  }

  // EMA Analysis
  if (indicators.ema12 !== null && indicators.ema26 !== null) {
    if (indicators.ema12 > indicators.ema26) buySignals++;
    else sellSignals++;
  }

  // Determine signal and confidence
  const buyConfidence = (buySignals / totalSignals) * 100;
  const sellConfidence = (sellSignals / totalSignals) * 100;

  if (buyConfidence > sellConfidence && buyConfidence >= 40) {
    return { signal: 'buy', confidence: Math.round(buyConfidence) };
  } else if (sellConfidence > buyConfidence && sellConfidence >= 40) {
    return { signal: 'sell', confidence: Math.round(sellConfidence) };
  }

  return { signal: null, confidence: 0 };
}
