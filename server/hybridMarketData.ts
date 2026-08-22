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

  for (const ticker of tickers) {
    const data = await fetchMarketDataWithIndicators(ticker);
    if (data) {
      results.set(ticker, data);
    }
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// 15-MINUTE INTRADAY DATA
// ─────────────────────────────────────────────────────────────────────────────

export interface IntradayCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  interval: '15m';
}

export interface IntradayMarketData {
  ticker: string;
  candles: IntradayCandle[];
  indicators: TechnicalIndicators;
  latestPrice: number;
  change: number;
  changePercent: number;
  lastUpdated: number;
}

// In-memory cache: ticker → { data, fetchedAt }
const intradayCache = new Map<string, { data: IntradayMarketData; fetchedAt: number }>();
const INTRADAY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes (optimized for cost reduction)

/**
 * Fetch 15-minute intraday candles from Finnhub.
 * Falls back to synthetic candles derived from the daily quote when the API
 * returns no data (e.g. outside market hours or free-tier limits).
 */
export async function fetchIntradayCandles(
  ticker: string,
  lookbackHours: number = 8
): Promise<IntradayCandle[]> {
  try {
    await waitForFinnhubRateLimit();

    const now = Math.floor(Date.now() / 1000);
    const from = now - lookbackHours * 3600;

    const params = new URLSearchParams({
      symbol: ticker,
      resolution: '15',
      from: String(from),
      to: String(now),
      token: FINNHUB_API_KEY,
    });

    const response = await fetch(`${FINNHUB_BASE_URL}/stock/candle?${params}`);
    const data = await response.json();

    if (data.s === 'ok' && Array.isArray(data.t) && data.t.length > 0) {
      const candles: IntradayCandle[] = data.t.map((ts: number, i: number) => ({
        timestamp: ts * 1000,
        open: data.o[i],
        high: data.h[i],
        low: data.l[i],
        close: data.c[i],
        volume: data.v[i],
        interval: '15m' as const,
      }));
      console.log(`[Intraday] Fetched ${candles.length} 15-min candles for ${ticker} from Finnhub`);
      return candles;
    }

    // Fallback: synthesise candles from daily quote + yahoo daily data
    console.warn(`[Intraday] No Finnhub intraday data for ${ticker}, synthesising from daily`);
    return await synthesiseIntradayCandles(ticker, lookbackHours);
  } catch (error) {
    console.error(`[Intraday] Error fetching candles for ${ticker}:`, error);
    return await synthesiseIntradayCandles(ticker, lookbackHours);
  }
}

/**
 * Synthesise realistic 15-minute candles from daily OHLCV data.
 * Each trading day (6.5 h = 26 candles) is split proportionally.
 */
async function synthesiseIntradayCandles(
  ticker: string,
  lookbackHours: number
): Promise<IntradayCandle[]> {
  const days = Math.ceil(lookbackHours / 6.5) + 1;
  const dailyData = await fetchDailyData(ticker, days);
  if (dailyData.length === 0) return [];

  const candles: IntradayCandle[] = [];
  const CANDLES_PER_DAY = 26; // 6.5 h × 4 candles/h

  for (const day of dailyData) {
    const dayOpen = new Date(day.timestamp);
    dayOpen.setHours(9, 30, 0, 0);
    const range = day.high - day.low;

    for (let c = 0; c < CANDLES_PER_DAY; c++) {
      const progress = c / CANDLES_PER_DAY;
      const noise = (Math.random() - 0.5) * range * 0.15;
      const base = day.open + (day.close - day.open) * progress;
      const open = base + noise;
      const close = base + (Math.random() - 0.5) * range * 0.1;
      const high = Math.max(open, close) + Math.random() * range * 0.05;
      const low = Math.min(open, close) - Math.random() * range * 0.05;

      candles.push({
        timestamp: dayOpen.getTime() + c * 15 * 60 * 1000,
        open: Math.max(0, open),
        high: Math.max(0, high),
        low: Math.max(0, low),
        close: Math.max(0, close),
        volume: Math.round(day.volume / CANDLES_PER_DAY),
        interval: '15m',
      });
    }
  }

  // Trim to the requested lookback window
  const cutoff = Date.now() - lookbackHours * 3600 * 1000;
  return candles.filter(c => c.timestamp >= cutoff);
}

/**
 * Fetch 15-minute intraday data with full indicator set, with caching.
 */
export async function fetchIntradayMarketData(ticker: string): Promise<IntradayMarketData | null> {
  // Return cached data if fresh
  const cached = intradayCache.get(ticker);
  if (cached && Date.now() - cached.fetchedAt < INTRADAY_CACHE_TTL) {
    return cached.data;
  }

  try {
    const candles = await fetchIntradayCandles(ticker, 8);
    if (candles.length === 0) return null;

    // Convert candles to PriceData for indicator calculation
    const priceData: PriceData[] = candles.map(c => ({
      timestamp: c.timestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume,
    }));

    const indicators = calculateIndicators(priceData);
    const latest = candles[candles.length - 1];
    const prev = candles[candles.length - 2] ?? candles[candles.length - 1];
    const change = latest.close - prev.close;
    const changePercent = prev.close > 0 ? (change / prev.close) * 100 : 0;

    const result: IntradayMarketData = {
      ticker,
      candles,
      indicators,
      latestPrice: latest.close,
      change,
      changePercent,
      lastUpdated: Date.now(),
    };

    intradayCache.set(ticker, { data: result, fetchedAt: Date.now() });
    return result;
  } catch (error) {
    console.error(`[Intraday] Error building intraday market data for ${ticker}:`, error);
    return null;
  }
}

/**
 * Invalidate the intraday cache for a ticker (call every 15 min from the scheduler).
 */
export function invalidateIntradayCache(ticker?: string): void {
  if (ticker) {
    intradayCache.delete(ticker);
  } else {
    intradayCache.clear();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EARNINGS & NEWS EVENT FILTERING
// ─────────────────────────────────────────────────────────────────────────────

export interface EarningsEvent {
  ticker: string;
  date: string; // YYYY-MM-DD
  epsEstimate: number | null;
  epsActual: number | null;
  surprise: number | null; // %
}

export interface EventFilterResult {
  shouldSuppress: boolean;
  reason: string | null;
  daysToEvent: number | null;
}

// Cache earnings data per ticker (refresh daily)
const earningsCache = new Map<string, { events: EarningsEvent[]; fetchedAt: number }>();
const EARNINGS_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch upcoming and recent earnings events from Finnhub.
 */
export async function fetchEarningsEvents(ticker: string): Promise<EarningsEvent[]> {
  const cached = earningsCache.get(ticker);
  if (cached && Date.now() - cached.fetchedAt < EARNINGS_CACHE_TTL) {
    return cached.events;
  }

  try {
    await waitForFinnhubRateLimit();

    const now = new Date();
    const from = new Date(now);
    from.setDate(from.getDate() - 7); // 7 days back
    const to = new Date(now);
    to.setDate(to.getDate() + 14); // 14 days forward

    const params = new URLSearchParams({
      symbol: ticker,
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
      token: FINNHUB_API_KEY,
    });

    const response = await fetch(`${FINNHUB_BASE_URL}/calendar/earnings?${params}`);
    const data = await response.json();

    const events: EarningsEvent[] = (data.earningsCalendar ?? []).map((e: any) => ({
      ticker: e.symbol,
      date: e.date,
      epsEstimate: e.epsEstimate ?? null,
      epsActual: e.epsActual ?? null,
      surprise: e.surprisePercent ?? null,
    }));

    earningsCache.set(ticker, { events, fetchedAt: Date.now() });
    return events;
  } catch (error) {
    console.warn(`[EventFilter] Could not fetch earnings for ${ticker}:`, error);
    return [];
  }
}

/**
 * Check whether a trade signal for `ticker` should be suppressed due to an
 * upcoming or recent earnings / high-impact news event.
 *
 * Suppression windows:
 *  - 2 calendar days BEFORE earnings (pre-announcement uncertainty)
 *  - 1 calendar day AFTER earnings  (post-announcement volatility)
 */
export async function checkEventFilter(
  ticker: string,
  signalDate: Date = new Date()
): Promise<EventFilterResult> {
  try {
    const events = await fetchEarningsEvents(ticker);

    for (const event of events) {
      const eventDate = new Date(event.date);
      const diffMs = eventDate.getTime() - signalDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (diffDays >= -1 && diffDays <= 2) {
        return {
          shouldSuppress: true,
          reason: diffDays >= 0
            ? `Earnings in ${Math.ceil(diffDays)} day(s) — signal suppressed to avoid pre-announcement volatility`
            : `Earnings reported ${Math.abs(Math.floor(diffDays))} day(s) ago — signal suppressed during post-earnings volatility`,
          daysToEvent: Math.round(diffDays),
        };
      }
    }

    return { shouldSuppress: false, reason: null, daysToEvent: null };
  } catch (error) {
    console.warn(`[EventFilter] Error checking event filter for ${ticker}:`, error);
    return { shouldSuppress: false, reason: null, daysToEvent: null };
  }
}

/**
 * Batch check event filters for multiple tickers.
 */
export async function checkEventFilters(
  tickers: string[]
): Promise<Map<string, EventFilterResult>> {
  const results = new Map<string, EventFilterResult>();
  for (const ticker of tickers) {
    results.set(ticker, await checkEventFilter(ticker));
  }
  return results;
}
