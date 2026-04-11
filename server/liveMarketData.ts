/**
 * Live Market Data Service
 * Fetches real-time stock prices from Yahoo Finance
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
    // Using yfinance via Python would be ideal, but we can use web scraping
    // For now, we'll use a free API endpoint that doesn't require authentication
    const response = await axios.get(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}`, {
      params: {
        modules: "price,summaryDetail",
      },
      timeout: 5000,
    });

    const priceData = response.data?.quoteSummary?.result?.[0]?.price;
    if (!priceData) {
      return null;
    }

    const currentPrice = priceData.regularMarketPrice?.raw || 0;
    const previousClose = priceData.regularMarketPreviousClose?.raw || currentPrice;
    const change = currentPrice - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    return {
      ticker,
      price: currentPrice,
      change,
      changePercent,
      timestamp: new Date().toISOString(),
      volume: priceData.regularMarketVolume?.raw || 0,
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
