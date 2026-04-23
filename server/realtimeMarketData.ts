/**
 * Real-time Market Data Service
 * Fetches live price data and technical indicators from Alpha Vantage
 */

import { ENV } from './_core/env';

const API_KEY = ENV.alphaVantageApiKey;
const BASE_URL = 'https://www.alphavantage.co/query';
const RATE_LIMIT_DELAY = 3000; // 3 seconds between API calls (safe for free tier)
const DAILY_QUOTA = 25; // Free tier limit

let lastApiCallTime = 0;
let apiCallsToday = 0;
let lastQuotaResetDate = new Date().toDateString();

/**
 * Check if daily quota has been exceeded
 */
function checkAndResetQuota(): void {
  const today = new Date().toDateString();
  if (today !== lastQuotaResetDate) {
    apiCallsToday = 0;
    lastQuotaResetDate = today;
  }
}

/**
 * Check if we can make an API call
 */
function canMakeApiCall(): boolean {
  checkAndResetQuota();
  return apiCallsToday < DAILY_QUOTA;
}

/**
 * Increment API call counter
 */
function incrementApiCallCounter(): void {
  apiCallsToday++;
}

/**
 * Wait for rate limit to pass
 */
async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCallTime;
  if (timeSinceLastCall < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastCall));
  }
  lastApiCallTime = Date.now();
}

export interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  sma20: number | null; // 20-day Simple Moving Average
  sma50: number | null; // 50-day Simple Moving Average
  ema12: number | null; // 12-day Exponential Moving Average
  ema26: number | null; // 26-day Exponential Moving Average
  rsi14: number | null; // 14-day RSI
  macd: number | null; // MACD line
  macdSignal: number | null; // MACD signal line
  macdHistogram: number | null; // MACD histogram
  bb20Upper: number | null; // Bollinger Band 20-day upper
  bb20Lower: number | null; // Bollinger Band 20-day lower
  atr14: number | null; // 14-day Average True Range
}

export interface MarketDataPoint {
  ticker: string;
  timestamp: number;
  price: PriceData;
  indicators: TechnicalIndicators;
  change: number; // Percentage change
  changePercent: number;
}

/**
 * Fetch current price data for a stock
 */
export async function fetchCurrentPrice(ticker: string): Promise<PriceData | null> {
  try {
    await waitForRateLimit();

    const params = new URLSearchParams({
      function: 'GLOBAL_QUOTE',
      symbol: ticker,
      apikey: API_KEY,
    });

    const response = await fetch(`${BASE_URL}?${params}`);
    const data = await response.json();

    if (data['Global Quote'] && data['Global Quote']['05. price']) {
      const quote = data['Global Quote'];
      return {
        timestamp: Date.now(),
        open: parseFloat(quote['02. open']) || 0,
        high: parseFloat(quote['03. high']) || 0,
        low: parseFloat(quote['04. low']) || 0,
        close: parseFloat(quote['05. price']) || 0,
        volume: parseInt(quote['06. volume']) || 0,
      };
    }

    return null;
  } catch (error) {
    console.error(`[Market Data] Error fetching price for ${ticker}:`, error);
    return null;
  }
}

/**
 * Fetch daily OHLCV data for technical analysis
 */
export async function fetchDailyData(ticker: string, limit: number = 100): Promise<PriceData[]> {
  try {
    // Check if we've exceeded daily quota
    if (!canMakeApiCall()) {
      console.warn(`[Market Data] Daily API quota exceeded for ${ticker}. Calls used: ${apiCallsToday}/${DAILY_QUOTA}`);
      return [];
    }

    await waitForRateLimit();
    incrementApiCallCounter();

    const params = new URLSearchParams({
      function: 'TIME_SERIES_DAILY',
      symbol: ticker,
      apikey: API_KEY,
    });

    const response = await fetch(`${BASE_URL}?${params}`);
    const data = await response.json();

    if (!data['Time Series (Daily)']) {
      // Check for rate limit or error messages
      if (data['Error Message'] || data['Information'] || data['Note']) {
        console.warn(`[Market Data] API rate limit or error for ${ticker}: ${data['Error Message'] || data['Information'] || data['Note']}`);
      } else {
        console.warn(`[Market Data] No daily data for ${ticker}`);
      }
      return [];
    }

    const timeSeries = data['Time Series (Daily)'];
    const prices: PriceData[] = [];

    // Convert to array and limit
    let count = 0;
    for (const [dateStr, values] of Object.entries(timeSeries)) {
      if (count >= limit) break;

      const date = new Date(dateStr);
      const priceData = values as Record<string, string>;

      prices.push({
        timestamp: date.getTime(),
        open: parseFloat(priceData['1. open']) || 0,
        high: parseFloat(priceData['2. high']) || 0,
        low: parseFloat(priceData['3. low']) || 0,
        close: parseFloat(priceData['4. close']) || 0,
        volume: parseInt(priceData['5. volume']) || 0,
      });

      count++;
    }

    return prices.reverse(); // Return in chronological order
  } catch (error) {
    console.error(`[Market Data] Error fetching daily data for ${ticker}:`, error);
    return [];
  }
}

/**
 * Calculate Simple Moving Average
 */
function calculateSMA(prices: number[], period: number): number | null {
  if (prices.length < period) return null;
  const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
}

/**
 * Calculate Exponential Moving Average
 */
function calculateEMA(prices: number[], period: number): number | null {
  if (prices.length < period) return null;

  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }

  return ema;
}

/**
 * Calculate Relative Strength Index (RSI)
 */
function calculateRSI(prices: number[], period: number = 14): number | null {
  if (prices.length < period + 1) return null;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains = change;
    else gains = 0;
    if (change < 0) losses = Math.abs(change);
    else losses = 0;

    avgGain = (avgGain * (period - 1) + gains) / period;
    avgLoss = (avgLoss * (period - 1) + losses) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
function calculateMACD(
  prices: number[]
): { macd: number | null; signal: number | null; histogram: number | null } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);

  if (!ema12 || !ema26) {
    return { macd: null, signal: null, histogram: null };
  }

  const macd = ema12 - ema26;

  // Calculate signal line (9-day EMA of MACD)
  // For simplicity, use a smoothed version
  const signal = (macd * 0.67 + (calculateEMA(prices, 9) || 0) * 0.33);
  const histogram = macd - signal;

  return { macd, signal, histogram };
}

/**
 * Calculate Bollinger Bands
 */
function calculateBollingerBands(
  prices: number[],
  period: number = 20
): { upper: number | null; lower: number | null } {
  if (prices.length < period) return { upper: null, lower: null };

  const recentPrices = prices.slice(-period);
  const sma = recentPrices.reduce((a, b) => a + b, 0) / period;

  const variance =
    recentPrices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
  const stdDev = Math.sqrt(variance);

  return {
    upper: sma + 2 * stdDev,
    lower: sma - 2 * stdDev,
  };
}

/**
 * Calculate Average True Range (ATR)
 */
function calculateATR(priceData: PriceData[], period: number = 14): number | null {
  if (priceData.length < period + 1) return null;

  let trSum = 0;

  for (let i = 1; i <= period; i++) {
    const current = priceData[i];
    const previous = priceData[i - 1];

    const tr = Math.max(
      current.high - current.low,
      Math.abs(current.high - previous.close),
      Math.abs(current.low - previous.close)
    );

    trSum += tr;
  }

  let atr = trSum / period;

  for (let i = period + 1; i < priceData.length; i++) {
    const current = priceData[i];
    const previous = priceData[i - 1];

    const tr = Math.max(
      current.high - current.low,
      Math.abs(current.high - previous.close),
      Math.abs(current.low - previous.close)
    );

    atr = (atr * (period - 1) + tr) / period;
  }

  return atr;
}

/**
 * Calculate all technical indicators
 */
export function calculateIndicators(priceData: PriceData[]): TechnicalIndicators {
  const closePrices = priceData.map(p => p.close);

  const sma20 = calculateSMA(closePrices, 20);
  const sma50 = calculateSMA(closePrices, 50);
  const ema12 = calculateEMA(closePrices, 12);
  const ema26 = calculateEMA(closePrices, 26);
  const rsi14 = calculateRSI(closePrices, 14);
  const macd = calculateMACD(closePrices);
  const bb = calculateBollingerBands(closePrices, 20);
  const atr = calculateATR(priceData, 14);

  return {
    sma20,
    sma50,
    ema12,
    ema26,
    rsi14,
    macd: macd.macd,
    macdSignal: macd.signal,
    macdHistogram: macd.histogram,
    bb20Upper: bb.upper,
    bb20Lower: bb.lower,
    atr14: atr,
  };
}

/**
 * Fetch complete market data with indicators
 */
export async function fetchMarketDataWithIndicators(ticker: string): Promise<MarketDataPoint | null> {
  try {
    // Fetch current price and daily data
    const [currentPrice, dailyData] = await Promise.all([
      fetchCurrentPrice(ticker),
      fetchDailyData(ticker, 100),
    ]);

    if (!currentPrice || dailyData.length === 0) {
      return null;
    }

    // Calculate indicators
    const indicators = calculateIndicators(dailyData);

    // Calculate change
    const previousClose = dailyData[dailyData.length - 2]?.close || currentPrice.close;
    const change = currentPrice.close - previousClose;
    const changePercent = (change / previousClose) * 100;

    return {
      ticker,
      timestamp: currentPrice.timestamp,
      price: currentPrice,
      indicators,
      change,
      changePercent,
    };
  } catch (error) {
    console.error(`[Market Data] Error fetching market data for ${ticker}:`, error);
    return null;
  }
}

/**
 * Fetch market data for multiple stocks
 */
export async function fetchMultipleMarketData(
  tickers: string[]
): Promise<Map<string, MarketDataPoint>> {
  const results = new Map<string, MarketDataPoint>();

  for (const ticker of tickers) {
    const data = await fetchMarketDataWithIndicators(ticker);
    if (data) {
      results.set(ticker, data);
    }
  }

  return results;
}
