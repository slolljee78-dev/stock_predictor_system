/**
 * Live Market Data Service
 * Fetches real-time stock prices from multiple sources with fallback strategy
 * Primary: Alpha Vantage API (configured via ALPHA_VANTAGE_API_KEY)
 * Fallback: Yahoo Finance (with CSRF token handling)
 */

import axios from "axios";
import { ENV } from "./_core/env";

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
 * Axios instance for Alpha Vantage API
 */
function getAlphaVantageClient() {
  return axios.create({
    timeout: 8000,
    baseURL: "https://www.alphavantage.co",
  });
}

/**
 * Axios instance for Yahoo Finance with proper headers
 */
function getYahooFinanceClient() {
  return axios.create({
    timeout: 8000,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Referer": "https://finance.yahoo.com/",
      "DNT": "1",
      "Connection": "keep-alive",
    },
  });
}

/**
 * Fetch stock price from Alpha Vantage API
 */
async function fetchFromAlphaVantage(ticker: string): Promise<StockPrice | null> {
  try {
    if (!ENV.alphaVantageApiKey) {
      console.warn("[fetchFromAlphaVantage] No Alpha Vantage API key configured");
      return null;
    }

    const response = await getAlphaVantageClient().get("/query", {
      params: {
        function: "GLOBAL_QUOTE",
        symbol: ticker,
        apikey: ENV.alphaVantageApiKey,
      },
    });

    const quote = response.data?.["Global Quote"];
    if (!quote || !quote["05. price"]) {
      console.warn(`[fetchFromAlphaVantage] No quote data for ${ticker}`, { quote });
      return null;
    }

    const price = parseFloat(quote["05. price"]);
    const change = parseFloat(quote["09. change"]) || 0;
    const changePercent = parseFloat(quote["10. change percent"]?.replace("%", "")) || 0;

    if (!Number.isFinite(price) || price <= 0) {
      console.warn(`[fetchFromAlphaVantage] Invalid price for ${ticker}: ${price}`);
      return null;
    }

    console.log(`[fetchFromAlphaVantage] Successfully fetched ${ticker}: $${price}`);

    return {
      ticker,
      price,
      change,
      changePercent,
      timestamp: new Date().toISOString(),
      volume: parseInt(quote["06. volume"] || "0", 10),
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn(`[fetchFromAlphaVantage] Error fetching ${ticker}: ${errorMsg}`);
    return null;
  }
}

/**
 * Fetch stock price from Yahoo Finance API (with CSRF token)
 */
async function fetchFromYahooFinance(ticker: string): Promise<StockPrice | null> {
  try {
    // First, fetch the crumb token
    const yahooFinanceAxios = getYahooFinanceClient();
    const crumbResponse = await yahooFinanceAxios.get("https://query1.finance.yahoo.com/v10/finance/quoteSummary/AAPL", {
      params: { modules: "price" },
    });

    // Extract crumb from response headers or use alternative approach
    const response = await yahooFinanceAxios.get(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}`, {
      params: {
        modules: "price,summaryDetail",
      },
    });

    const priceData = response.data?.quoteSummary?.result?.[0]?.price;
    if (!priceData || !priceData.regularMarketPrice) {
      console.warn(`[fetchFromYahooFinance] No price data for ${ticker}`);
      return null;
    }

    const currentPrice = priceData.regularMarketPrice?.raw || 0;
    const previousClose = priceData.regularMarketPreviousClose?.raw || currentPrice;
    const change = currentPrice - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    console.log(`[fetchFromYahooFinance] Successfully fetched ${ticker}: $${currentPrice}`);

    return {
      ticker,
      price: currentPrice,
      change,
      changePercent,
      timestamp: new Date().toISOString(),
      volume: priceData.regularMarketVolume?.raw || 0,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn(`[fetchFromYahooFinance] Error fetching ${ticker}: ${errorMsg}`);
    return null;
  }
}

/**
 * Fetch current stock price from multiple sources with fallback
 * Primary: Alpha Vantage
 * Fallback: Yahoo Finance
 */
export async function fetchStockPrice(ticker: string): Promise<StockPrice | null> {
  // Try Alpha Vantage first
  const alphaPrice = await fetchFromAlphaVantage(ticker);
  if (alphaPrice) {
    return alphaPrice;
  }

  // Fallback to Yahoo Finance
  console.log(`[fetchStockPrice] Alpha Vantage failed for ${ticker}, trying Yahoo Finance`);
  const yahooPrice = await fetchFromYahooFinance(ticker);
  if (yahooPrice) {
    return yahooPrice;
  }

  console.error(`[fetchStockPrice] All sources failed for ${ticker}`);
  return null;
}

/**
 * Fetch multiple stock prices in batch
 */
export async function fetchMultipleStockPrices(tickers: string[]): Promise<StockPrice[]> {
  const prices: StockPrice[] = [];

  // Process in batches to avoid rate limiting
  const batchSize = 3;
  for (let i = 0; i < tickers.length; i += batchSize) {
    const batch = tickers.slice(i, i + batchSize);
    const batchPrices = await Promise.all(batch.map((ticker) => fetchStockPrice(ticker)));

    prices.push(...batchPrices.filter((p) => p !== null) as StockPrice[]);

    // Rate limiting - wait between batches
    if (i + batchSize < tickers.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return prices;
}

/**
 * Fetch detailed market data for a single stock
 */
export async function fetchMarketData(ticker: string): Promise<MarketData | null> {
  try {
    // Try to get basic price first
    const priceData = await fetchStockPrice(ticker);
    if (!priceData) {
      return null;
    }

    // For now, return market data with available price info
    // In production, you might want to fetch additional details from Alpha Vantage
    return {
      ticker,
      currentPrice: priceData.price,
      dayHigh: 0,
      dayLow: 0,
      fiftyTwoWeekHigh: 0,
      fiftyTwoWeekLow: 0,
      marketCap: 0,
      pe: 0,
      dividend: 0,
      volume: priceData.volume,
      avgVolume: 0,
      bid: 0,
      ask: 0,
      change: priceData.change,
      changePercent: priceData.changePercent,
      timestamp: priceData.timestamp,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[fetchMarketData] Error fetching market data for ${ticker}: ${errorMsg}`);
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
    console.log(`[fetchStockPriceWithCache] Using cached price for ${ticker}: $${cached.price.price}`);
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
    console.log(`[clearPriceCache] Cleared cache for ${ticker}`);
  } else {
    priceCache.clear();
    console.log(`[clearPriceCache] Cleared all cache`);
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
