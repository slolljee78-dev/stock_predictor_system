/**
 * Stock Data Fetcher
 * Fetches historical price data from yfinance and manages Trading 212 stock list
 */

import { storePriceData, getStockByTicker } from './db';

/**
 * Trading 212 stock list - popular stocks available on the platform
 * This is a curated list; in production, this would be fetched from Trading 212 API
 */
export const TRADING_212_STOCKS = [
  // US Tech Giants
  { ticker: 'AAPL', name: 'Apple Inc.', type: 'equity', exchange: 'NASDAQ', sector: 'Technology' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', type: 'equity', exchange: 'NASDAQ', sector: 'Technology' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', type: 'equity', exchange: 'NASDAQ', sector: 'Technology' },
  { ticker: 'TSLA', name: 'Tesla Inc.', type: 'equity', exchange: 'NASDAQ', sector: 'Consumer Cyclical' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', type: 'equity', exchange: 'NASDAQ', sector: 'Consumer Cyclical' },
  { ticker: 'GOOGL', name: 'Alphabet Inc. (Class A)', type: 'equity', exchange: 'NASDAQ', sector: 'Communication Services' },
  { ticker: 'META', name: 'Meta Platforms Inc.', type: 'equity', exchange: 'NASDAQ', sector: 'Communication Services' },
  { ticker: 'PLTR', name: 'Palantir Technologies', type: 'equity', exchange: 'NASDAQ', sector: 'Technology' },
  
  // US Financial & Industrial
  { ticker: 'IBM', name: 'IBM Corporation', type: 'equity', exchange: 'NYSE', sector: 'Technology' },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', type: 'equity', exchange: 'NYSE', sector: 'Financial Services' },
  { ticker: 'BAC', name: 'Bank of America', type: 'equity', exchange: 'NYSE', sector: 'Financial Services' },
  { ticker: 'GE', name: 'General Electric', type: 'equity', exchange: 'NYSE', sector: 'Industrials' },
  
  // US Energy & Consumer
  { ticker: 'CVX', name: 'Chevron Corporation', type: 'equity', exchange: 'NYSE', sector: 'Energy' },
  { ticker: 'XOM', name: 'Exxon Mobil Corporation', type: 'equity', exchange: 'NYSE', sector: 'Energy' },
  { ticker: 'KO', name: 'The Coca-Cola Company', type: 'equity', exchange: 'NYSE', sector: 'Consumer Defensive' },
  { ticker: 'PG', name: 'Procter & Gamble', type: 'equity', exchange: 'NYSE', sector: 'Consumer Defensive' },
  
  // UK Stocks
  { ticker: 'BP', name: 'BP p.l.c.', type: 'equity', exchange: 'LSE', sector: 'Energy' },
  { ticker: 'RR', name: 'Rolls-Royce Holdings plc', type: 'equity', exchange: 'LSE', sector: 'Industrials' },
  { ticker: 'HSBA', name: 'HSBC Holdings plc', type: 'equity', exchange: 'LSE', sector: 'Financial Services' },
  { ticker: 'AZN', name: 'AstraZeneca PLC', type: 'equity', exchange: 'LSE', sector: 'Healthcare' },
  
  // ETFs
  { ticker: 'VUAG', name: 'Vanguard S&P 500 (Acc)', type: 'etf', exchange: 'LSE', sector: 'Index' },
  { ticker: 'VWRP', name: 'Vanguard FTSE All-World (Acc)', type: 'etf', exchange: 'LSE', sector: 'Index' },
  { ticker: 'SGLN', name: 'iShares Physical Gold', type: 'etf', exchange: 'LSE', sector: 'Commodities' },
  { ticker: 'FWRG', name: 'Invesco FTSE All-World (Acc)', type: 'etf', exchange: 'LSE', sector: 'Index' },
  { ticker: 'IUVF', name: 'iShares Edge MSCI USA Value Factor', type: 'etf', exchange: 'LSE', sector: 'Index' },
];

/**
 * Fetch historical price data from yfinance
 * Note: This is a mock implementation. In production, use the yfinance Python library
 * via a subprocess or API call.
 */
export async function fetchHistoricalPrices(
  ticker: string,
  days: number = 365
): Promise<Array<{ date: Date; open: number; high: number; low: number; close: number; volume: number }>> {
  try {
    const mockData = generateMockPriceData(ticker, days);
    return mockData;
  } catch (error) {
    console.error(`Failed to fetch prices for ${ticker}:`, error);
    return [];
  }
}

/**
 * Generate mock price data for demonstration
 * In production, replace with actual yfinance calls
 */
function generateMockPriceData(
  ticker: string,
  days: number
): Array<{ date: Date; open: number; high: number; low: number; close: number; volume: number }> {
  const data = [];
  let basePrice = 100;
  const now = new Date();

  for (let i = days; i > 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Random walk for price
    const change = (Math.random() - 0.5) * 2;
    basePrice = Math.max(basePrice + change, 10);

    const volatility = 0.02;
    const open = basePrice + (Math.random() - 0.5) * basePrice * volatility;
    const close = basePrice + (Math.random() - 0.5) * basePrice * volatility;
    const high = Math.max(open, close) + Math.random() * basePrice * volatility;
    const low = Math.min(open, close) - Math.random() * basePrice * volatility;
    const volume = Math.floor(Math.random() * 10000000) + 1000000;

    data.push({
      date,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
    });
  }

  return data;
}

/**
 * Load historical data for a stock into the database
 */
export async function loadStockHistoricalData(ticker: string, days: number = 365) {
  const stock = await getStockByTicker(ticker);
  if (!stock) {
    console.error(`Stock ${ticker} not found in database`);
    return;
  }

  const priceData = await fetchHistoricalPrices(ticker, days);
  if (priceData.length === 0) {
    console.error(`No price data fetched for ${ticker}`);
    return;
  }

  await storePriceData(stock.id, priceData);
  console.log(`Loaded ${priceData.length} price points for ${ticker}`);
}

/**
 * Get the list of Trading 212 stocks
 */
export function getTradingStocks() {
  return TRADING_212_STOCKS;
}

/**
 * Validate if a ticker is in the Trading 212 list
 */
export function isTrading212Stock(ticker: string): boolean {
  return TRADING_212_STOCKS.some(s => s.ticker.toUpperCase() === ticker.toUpperCase());
}
