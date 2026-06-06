/**
 * Hybrid Market Data Service
 * Combines Finnhub (real-time quotes) + yahoo-finance2 (historical data)
 * - Finnhub: Real-time prices (60 calls/min, unlimited daily)
 * - yahoo-finance2: Historical OHLCV data (unlimited, no rate limits)
 */

import { ENV } from './_core/env';
import YahooFinanceModule from 'yahoo-finance2';

const yahooFinance = new YahooFinanceModule();

const FINNHUB_API_KEY = ENV.finnhubApiKey;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const RATE_LIMIT_DELAY = 1000; // 1 second between Finnhub calls (60/min)

let lastFinnhubCallTime = 0;

/**
 * Wait for Finnhub rate limit
 */
async function waitForFinnhubRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastCall = now - lastFinnhubCallTime;
  if (timeSinceLastCall < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastCall));
  }
  lastFinnhubCallTime = Date.now();
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
  sma20: number | null;
  sma50: number | null;
  ema12: number | null;
  ema26: number | null;
  rsi14: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHistogram: number | null;
  bb20Upper: number | null;
  bb20Lower: number | null;
  atr14: number | null;
}

export interface MarketDataPoint {
  ticker: string;
  timestamp: number;
  price: PriceData;
  indicators: TechnicalIndicators;
  change: number;
  changePercent: number;
}

/**
 * Fetch current price from Finnhub
 */
export async function fetchCurrentPrice(ticker: string): Promise<PriceData | null> {
  try {
    await waitForFinnhubRateLimit();

    const params = new URLSearchParams({
      symbol: ticker,
      token: FINNHUB_API_KEY,
    });

    const response = await fetch(`${FINNHUB_BASE_URL}/quote?${params}`);
    const data = await response.json();

    if (data.error) {
      console.warn(`[Hybrid Market Data] Error fetching price for ${ticker}: ${data.error}`);
      return null;
    }

    if (!data.c) {
      console.warn(`[Hybrid Market Data] No price data for ${ticker}`);
      return null;
    }

    return {
      timestamp: Date.now(),
      open: data.o || 0,
      high: data.h || 0,
      low: data.l || 0,
      close: data.c || 0,
      volume: data.v || 0,
    };
  } catch (error) {
    console.error(`[Hybrid Market Data] Error fetching price for ${ticker}:`, error);
    return null;
  }
}

/**
 * Fetch historical data from yahoo-finance2
 */
export async function fetchDailyData(ticker: string, limit: number = 100): Promise<PriceData[]> {
  try {
    console.log(`[Hybrid Market Data] Fetching ${limit} days of historical data for ${ticker} from yahoo-finance2`);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (limit + 10)); // Get extra days for safety

    // Fetch historical data
    const quotes = await yahooFinance.historical(ticker, {
      period1: startDate,
      period2: endDate,
      interval: '1d',
    });

    if (!quotes || quotes.length === 0) {
      console.warn(`[Hybrid Market Data] No historical data for ${ticker}`);
      return [];
    }

    // Convert to PriceData format and limit results
    const prices: PriceData[] = quotes
      .slice(-limit)
      .map((quote: any) => ({
        timestamp: quote.date ? new Date(quote.date).getTime() : Date.now(),
        open: quote.open || 0,
        high: quote.high || 0,
        low: quote.low || 0,
        close: quote.close || 0,
        volume: quote.volume || 0,
      }));

    console.log(`[Hybrid Market Data] Retrieved ${prices.length} historical records for ${ticker}`);
    return prices;
  } catch (error) {
    console.error(`[Hybrid Market Data] Error fetching historical data for ${ticker}:`, error);
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
 * Calculate MACD
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
    const [currentPrice, dailyData] = await Promise.all([
      fetchCurrentPrice(ticker),
      fetchDailyData(ticker, 100),
    ]);

    if (!currentPrice || dailyData.length === 0) {
      console.warn(`[Hybrid Market Data] Missing data for ${ticker}: price=${!!currentPrice}, history=${dailyData.length}`);
      return null;
    }

    const indicators = calculateIndicators(dailyData);

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
    console.error(`[Hybrid Market Data] Error fetching market data for ${ticker}:`, error);
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

  // Use serial processing with a slight delay between batches to respect rate limits and reduce concurrent load
  for (let i = 0; i < tickers.length; i++) {
    const ticker = tickers[i];
    const data = await fetchMarketDataWithIndicators(ticker);
    if (data) {
      results.set(ticker, data);
    }
    
    // Add a small delay between every 5 stocks to reduce burst load on APIs
    if (i > 0 && i % 5 === 0 && i < tickers.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return results;
}
