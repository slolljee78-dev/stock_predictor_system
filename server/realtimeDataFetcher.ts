/**
 * Real-Time Data Fetcher
 * Fetches live stock prices from yfinance and updates the database
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { storePriceData, getStockByTicker } from './db';
import { TRADING_212_STOCKS } from './stockDataFetcher';

const execAsync = promisify(exec);

/**
 * Fetch real-time price data using yfinance
 * Returns: { ticker, price, high, low, volume, timestamp }
 */
export async function fetchRealtimePrice(ticker: string): Promise<{
  ticker: string;
  price: number;
  high: number;
  low: number;
  open: number;
  volume: number;
  timestamp: Date;
} | null> {
  try {
    // Python script to fetch data using yfinance
    const pythonScript = `
import yfinance as yf
import json
from datetime import datetime

try:
    ticker = "${ticker}"
    data = yf.Ticker(ticker)
    info = data.info
    
    result = {
        "ticker": ticker,
        "price": float(info.get("currentPrice", 0) or info.get("regularMarketPrice", 0)),
        "high": float(info.get("fiftyTwoWeekHigh", 0)),
        "low": float(info.get("fiftyTwoWeekLow", 0)),
        "volume": int(info.get("volume", 0)),
        "timestamp": datetime.now().isoformat()
    }
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({"error": str(e)}))
`;

    const { stdout } = await execAsync(`python3 -c "${pythonScript.replace(/"/g, '\\"')}"`, {
      timeout: 10000,
    });

    const result = JSON.parse(stdout);
    if (result.error) {
      console.error(`Error fetching ${ticker}:`, result.error);
      return null;
    }

    return {
      ticker: result.ticker,
      price: result.price,
      high: result.high,
      low: result.low,
      open: result.open || result.price,
      volume: result.volume,
      timestamp: new Date(result.timestamp),
    };
  } catch (error) {
    console.error(`Failed to fetch real-time price for ${ticker}:`, error);
    return null;
  }
}

/**
 * Fetch real-time prices for multiple stocks
 */
export async function fetchRealtimePrices(tickers: string[]): Promise<
  Array<{
    ticker: string;
    price: number;
    high: number;
    low: number;
    open: number;
    volume: number;
    timestamp: Date;
  }>
> {
  const results = [];

  for (const ticker of tickers) {
    const data = await fetchRealtimePrice(ticker);
    if (data) {
      results.push(data);
    }
  }

  return results;
}

/**
 * Update all Trading 212 stocks with real-time prices
 */
export async function updateAllStockPrices(): Promise<number> {
  const tickers = TRADING_212_STOCKS.map(s => s.ticker);
  const prices = await fetchRealtimePrices(tickers);

  let updated = 0;
  for (const priceData of prices) {
    try {
      const stock = await getStockByTicker(priceData.ticker);
      if (stock) {
        // Store price data in price history
        await storePriceData(stock.id, [{
          date: priceData.timestamp,
          open: priceData.price,
          close: priceData.price,
          high: priceData.high,
          low: priceData.low,
          volume: priceData.volume,
        }]);
        updated++;
      }
    } catch (error) {
      console.error(`Failed to update ${priceData.ticker}:`, error);
    }
  }

  return updated;
}

/**
 * Start a background job to update prices periodically
 * Runs every 5 minutes during market hours (9:30 AM - 4:00 PM EST)
 */
export function startPriceUpdateJob() {
  console.log('[Price Updater] Starting real-time price update job');

  // Update immediately on start
  updateAllStockPrices().then(count => {
    console.log(`[Price Updater] Updated ${count} stocks`);
  });

  // Then update every 5 minutes
  setInterval(async () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Only update during market hours (simplified: 9:30 AM - 4:00 PM EST)
    // In production, check actual market hours and holidays
    const isMarketHours = hours >= 9 && hours < 16;

    if (isMarketHours) {
      const count = await updateAllStockPrices();
      console.log(`[Price Updater] Updated ${count} stocks at ${now.toLocaleTimeString()}`);
    }
  }, 5 * 60 * 1000); // 5 minutes
}

/**
 * Get latest price for a stock from price history
 */
export async function getLatestPrice(ticker: string): Promise<number | null> {
  try {
    const stock = await getStockByTicker(ticker);
    if (stock) {
      // In a real implementation, query the latest price from priceHistory table
      // For now, we'll fetch it fresh
      const data = await fetchRealtimePrice(ticker);
      return data?.price || null;
    }
    return null;
  } catch (error) {
    console.error(`Failed to get latest price for ${ticker}:`, error);
    return null;
  }
}
