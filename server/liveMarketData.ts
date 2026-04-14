/**
 * Live Market Data Service
 * Fetches real-time stock prices from Yahoo Finance and historical data from Alpha Vantage
 */

import axios from "axios";

export interface StockPrice {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
  volume: number;
  marketCap?: number;
  pe?: number;
}

export interface IntraDayData {
  ticker: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketData {
  ticker: string;
  currentPrice: number;
  dayHigh: number;
  dayLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  marketCap: number;
  pe: number;
  dividend: number;
  volume: number;
  avgVolume: number;
  bid: number;
  ask: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

/**
 * Fetch current stock price from Yahoo Finance API
 * Using free tier with rate limiting
 */
export async function fetchStockPrice(ticker: string): Promise<StockPrice | null> {
  try {
    const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`, {
      params: {
        interval: "1d",
        range: "1d",
      },
      timeout: 5000,
    });

    const result = response.data?.chart?.result?.[0];
    if (!result) {
      return null;
    }

    const quote = result.meta;
    const regularMarketPrice = quote.regularMarketPrice || 0;
    const previousClose = quote.previousClose || regularMarketPrice;
    const change = regularMarketPrice - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    return {
      ticker,
      price: regularMarketPrice,
      change,
      changePercent,
      timestamp: new Date().toISOString(),
      volume: quote.regularMarketVolume || 0,
      marketCap: quote.marketCap,
      pe: quote.trailingPE,
    };
  } catch (error) {
    console.error(`Error fetching price for ${ticker}:`, error);
    return null;
  }
}

/**
 * Fetch multiple stock prices in batch
 */
export async function fetchMultipleStockPrices(tickers: string[]): Promise<StockPrice[]> {
  const prices: StockPrice[] = [];

  // Process in batches to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < tickers.length; i += batchSize) {
    const batch = tickers.slice(i, i + batchSize);
    const batchPrices = await Promise.all(batch.map((ticker) => fetchStockPrice(ticker)));

    prices.push(...batchPrices.filter((p) => p !== null) as StockPrice[]);

    // Rate limiting - wait between batches
    if (i + batchSize < tickers.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return prices;
}

/**
 * Fetch detailed market data for a single stock
 */
export async function fetchMarketData(ticker: string): Promise<MarketData | null> {
  try {
    const response = await axios.get(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}`, {
      params: {
        modules: "price,summaryDetail,financialData",
      },
      timeout: 5000,
    });

    const result = response.data?.quoteSummary?.result?.[0];
    if (!result) {
      return null;
    }

    const price = result.price || {};
    const summary = result.summaryDetail || {};
    const financial = result.financialData || {};

    const currentPrice = price.regularMarketPrice?.raw || 0;
    const previousClose = price.regularMarketPreviousClose?.raw || currentPrice;
    const change = currentPrice - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    return {
      ticker,
      currentPrice,
      dayHigh: price.regularMarketDayHigh?.raw || 0,
      dayLow: price.regularMarketDayLow?.raw || 0,
      fiftyTwoWeekHigh: summary.fiftyTwoWeekHigh?.raw || 0,
      fiftyTwoWeekLow: summary.fiftyTwoWeekLow?.raw || 0,
      marketCap: summary.marketCap?.raw || 0,
      pe: summary.trailingPE?.raw || 0,
      dividend: summary.trailingAnnualDividendYield?.raw || 0,
      volume: price.regularMarketVolume?.raw || 0,
      avgVolume: summary.averageVolume?.raw || 0,
      bid: price.bid?.raw || 0,
      ask: price.ask?.raw || 0,
      change,
      changePercent,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching market data for ${ticker}:`, error);
    return null;
  }
}

/**
 * Cache for storing recent prices to reduce API calls
 */
const priceCache = new Map<string, { price: StockPrice; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute cache

/**
 * Fetch stock price with caching
 */
export async function fetchStockPriceWithCache(ticker: string): Promise<StockPrice | null> {
  const cached = priceCache.get(ticker);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }

  const price = await fetchStockPrice(ticker);
  if (price) {
    priceCache.set(ticker, { price, timestamp: now });
  }

  return price;
}

/**
 * Clear cache for a specific ticker or all
 */
export function clearPriceCache(ticker?: string): void {
  if (ticker) {
    priceCache.delete(ticker);
  } else {
    priceCache.clear();
  }
}

/**
 * Get cached price without fetching
 */
export function getCachedPrice(ticker: string): StockPrice | null {
  const cached = priceCache.get(ticker);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }
  return null;
}

/**
 * Cache for storing historical data to reduce API calls
 */
const historyCache = new Map<string, { data: IntraDayData[]; timestamp: number }>();
const HISTORY_CACHE_DURATION = 5 * 60 * 1000; // 5 minute cache

/**
 * Rate limiter for Alpha Vantage API
 * Free tier: 5 requests per minute
 */
const apiCallTimes: number[] = [];
const API_RATE_LIMIT = 5; // requests
const API_RATE_WINDOW = 60000; // 1 minute

function canMakeApiCall(): boolean {
  const now = Date.now();
  // Remove calls outside the window
  while (apiCallTimes.length > 0 && apiCallTimes[0] < now - API_RATE_WINDOW) {
    apiCallTimes.shift();
  }
  return apiCallTimes.length < API_RATE_LIMIT;
}

function recordApiCall(): void {
  apiCallTimes.push(Date.now());
}

/**
 * Fetch historical OHLCV data from Alpha Vantage API
 * Falls back to mock data if API limit is reached or API key is not configured
 */
export async function fetchPriceHistory(
  ticker: string,
  timeframe: "1h" | "4h" | "1d" | "1w" = "1d"
): Promise<IntraDayData[]> {
  try {
    // Check cache first
    const cacheKey = `${ticker}-${timeframe}`;
    const cached = historyCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < HISTORY_CACHE_DURATION) {
      return cached.data;
    }

    // Check if we can make an API call
    if (!canMakeApiCall()) {
      console.warn(`Alpha Vantage API rate limit reached for ${ticker}. Using cached or mock data.`);
      // Return cached data if available, otherwise mock data
      if (cached) {
        return cached.data;
      }
      return generateMockData(ticker, timeframe);
    }

    // Determine Alpha Vantage function based on timeframe
    let alphaFunction = "TIME_SERIES_DAILY";
    if (timeframe === "1h" || timeframe === "4h") {
      alphaFunction = "TIME_SERIES_INTRADAY";
    }

    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      console.warn("Alpha Vantage API key not configured. Using mock data.");
      return generateMockData(ticker, timeframe);
    }

    recordApiCall();

    // Fetch from Alpha Vantage
    const params: Record<string, string> = {
      function: alphaFunction,
      symbol: ticker,
      apikey: apiKey,
    };

    if (timeframe === "1h") {
      params.interval = "60min";
    } else if (timeframe === "4h") {
      params.interval = "240min";
    }

    const response = await axios.get("https://www.alphavantage.co/query", {
      params,
      timeout: 10000,
    });

    const data = parseAlphaVantageResponse(response.data, ticker, timeframe);

    // Cache the result
    historyCache.set(cacheKey, { data, timestamp: Date.now() });

    return data;
  } catch (error) {
    console.error(`Error fetching price history for ${ticker}:`, error);
    // Fall back to mock data on error
    return generateMockData(ticker, timeframe);
  }
}

/**
 * Parse Alpha Vantage API response
 */
function parseAlphaVantageResponse(
  response: any,
  ticker: string,
  timeframe: "1h" | "4h" | "1d" | "1w"
): IntraDayData[] {
  const data: IntraDayData[] = [];

  // Check for errors
  if (response["Error Message"]) {
    console.error(`Alpha Vantage error: ${response["Error Message"]}`);
    return generateMockData(ticker, timeframe);
  }

  if (response["Note"]) {
    console.warn(`Alpha Vantage note: ${response["Note"]}`);
    return generateMockData(ticker, timeframe);
  }

  // Parse time series data
  let timeSeries: Record<string, any> = {};

  if (response["Time Series (Daily)"]) {
    timeSeries = response["Time Series (Daily)"];
  } else if (response["Time Series (60min)"]) {
    timeSeries = response["Time Series (60min)"];
  } else if (response["Time Series (240min)"]) {
    timeSeries = response["Time Series (240min)"];
  }

  // Convert to IntraDayData format
  Object.entries(timeSeries)
    .slice(0, 20) // Limit to 20 candles
    .forEach(([timestamp, values]: [string, any]) => {
      data.push({
        ticker,
        timestamp,
        open: parseFloat(values["1. open"] || 0),
        high: parseFloat(values["2. high"] || 0),
        low: parseFloat(values["3. low"] || 0),
        close: parseFloat(values["4. close"] || 0),
        volume: parseInt(values["5. volume"] || 0),
      });
    });

  // Sort by timestamp ascending
  data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return data;
}

/**
 * Generate mock OHLCV data as fallback
 */
function generateMockData(ticker: string, timeframe: "1h" | "4h" | "1d" | "1w"): IntraDayData[] {
  const now = new Date();
  const data: IntraDayData[] = [];

  let periods = 20;
  let intervalMs = 24 * 60 * 60 * 1000;

  if (timeframe === "1h") {
    periods = 24;
    intervalMs = 60 * 60 * 1000;
  } else if (timeframe === "4h") {
    periods = 30;
    intervalMs = 4 * 60 * 60 * 1000;
  } else if (timeframe === "1w") {
    periods = 12;
    intervalMs = 7 * 24 * 60 * 60 * 1000;
  }

  const basePrice = 100;

  for (let i = periods - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * intervalMs);
    const volatility = 0.02;
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const close = basePrice * (1 + randomChange);
    const open = close * (1 + (Math.random() - 0.5) * volatility);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const volume = Math.floor(Math.random() * 5000000) + 1000000;

    data.push({
      ticker,
      timestamp: timestamp.toISOString(),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });
  }

  return data;
}
