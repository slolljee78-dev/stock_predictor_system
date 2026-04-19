/**
 * Ticker Validation Service
 * Validates ticker support and provides information about supported exchanges
 */

import axios from "axios";
import { ENV } from "./_core/env";

export interface TickerValidationResult {
  ticker: string;
  isSupported: boolean;
  exchange?: string;
  currency?: string;
  name?: string;
  error?: string;
}

export interface TickerSuggestion {
  ticker: string;
  name: string;
  exchange: string;
}

/**
 * Supported exchanges on Alpha Vantage
 * Reference: https://www.alphavantage.co/
 */
const SUPPORTED_EXCHANGES = {
  US: { name: "US Stock Market", prefixes: [""], examples: ["AAPL", "MSFT", "GOOGL"] },
  LSE: { name: "London Stock Exchange", prefixes: [""], examples: ["BP", "HSBC", "SHELL"] },
  TSE: { name: "Tokyo Stock Exchange", prefixes: [""], examples: ["9984.T", "6758.T"] },
  FRA: { name: "Frankfurt Stock Exchange", prefixes: [""], examples: ["SAP", "SIE"] },
  EURONEXT: { name: "Euronext", prefixes: [""], examples: ["ASML", "ASML.AS"] },
  NSE: { name: "National Stock Exchange of India", prefixes: [""], examples: ["INFY", "TCS"] },
  ASX: { name: "Australian Securities Exchange", prefixes: [""], examples: ["BHP", "CBA"] },
};

/**
 * Cache for ticker validation results
 */
const tickerValidationCache = new Map<string, { result: TickerValidationResult; timestamp: number }>();
const VALIDATION_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Validate if a ticker is supported by Alpha Vantage
 */
export async function validateTicker(ticker: string): Promise<TickerValidationResult> {
  const normalizedTicker = ticker.trim().toUpperCase();

  // Check cache first
  const cached = tickerValidationCache.get(normalizedTicker);
  if (cached && Date.now() - cached.timestamp < VALIDATION_CACHE_DURATION) {
    console.log(`[validateTicker] Using cached validation for ${normalizedTicker}`);
    return cached.result;
  }

  try {
    if (!ENV.alphaVantageApiKey) {
      console.warn("[validateTicker] No Alpha Vantage API key configured");
      return {
        ticker: normalizedTicker,
        isSupported: false,
        error: "API key not configured",
      };
    }

    // Try to fetch a quote for the ticker
    const response = await axios.get("https://www.alphavantage.co/query", {
      params: {
        function: "GLOBAL_QUOTE",
        symbol: normalizedTicker,
        apikey: ENV.alphaVantageApiKey,
      },
      timeout: 5000,
    });

    const quote = response.data?.["Global Quote"];
    const errorMessage = response.data?.["Note"] || response.data?.["Error Message"];

    // Check for rate limiting or errors
    if (errorMessage) {
      console.warn(`[validateTicker] API error for ${normalizedTicker}: ${errorMessage}`);
      return {
        ticker: normalizedTicker,
        isSupported: false,
        error: "API rate limit or error",
      };
    }

    // If we got a price, the ticker is supported
    if (quote && quote["05. price"]) {
      const price = parseFloat(quote["05. price"]);
      if (Number.isFinite(price) && price > 0) {
        const result: TickerValidationResult = {
          ticker: normalizedTicker,
          isSupported: true,
          currency: quote["08. currency"] || "USD",
          name: quote["01. symbol"] || normalizedTicker,
        };

        // Cache the result
        tickerValidationCache.set(normalizedTicker, { result, timestamp: Date.now() });
        console.log(`[validateTicker] Ticker ${normalizedTicker} is supported`);
        return result;
      }
    }

    // No price data means ticker is not supported
    console.warn(`[validateTicker] No price data for ${normalizedTicker}`);
    const result: TickerValidationResult = {
      ticker: normalizedTicker,
      isSupported: false,
      error: "Ticker not found or not supported",
    };

    // Cache negative results for shorter duration (1 hour) in case ticker becomes available
    tickerValidationCache.set(normalizedTicker, { result, timestamp: Date.now() });
    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[validateTicker] Error validating ${normalizedTicker}: ${errorMsg}`);

    return {
      ticker: normalizedTicker,
      isSupported: false,
      error: `Validation failed: ${errorMsg}`,
    };
  }
}

/**
 * Validate multiple tickers in batch
 */
export async function validateMultipleTickers(tickers: string[]): Promise<TickerValidationResult[]> {
  const results: TickerValidationResult[] = [];

  // Process in batches to avoid rate limiting
  const batchSize = 3;
  for (let i = 0; i < tickers.length; i += batchSize) {
    const batch = tickers.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((ticker) => validateTicker(ticker)));

    results.push(...batchResults);

    // Rate limiting - wait between batches
    if (i + batchSize < tickers.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Get suggestions for similar tickers or alternative exchanges
 */
export function getSuggestionsForTicker(ticker: string): TickerSuggestion[] {
  const suggestions: TickerSuggestion[] = [];

  // Add common US market suggestions
  if (ticker.length >= 1 && ticker.length <= 5) {
    // Check if ticker might be from a different exchange
    const commonAlternatives: Record<string, TickerSuggestion[]> = {
      BP: [{ ticker: "BP", name: "BP p.l.c.", exchange: "LSE" }],
      SHELL: [{ ticker: "SHELL", name: "Shell plc", exchange: "LSE" }],
      ASML: [{ ticker: "ASML", name: "ASML Holding", exchange: "EURONEXT" }],
      INFY: [{ ticker: "INFY", name: "Infosys", exchange: "NSE" }],
      TCS: [{ ticker: "TCS", name: "Tata Consultancy Services", exchange: "NSE" }],
    };

    if (commonAlternatives[ticker]) {
      suggestions.push(...commonAlternatives[ticker]);
    }
  }

  return suggestions;
}

/**
 * Clear validation cache
 */
export function clearValidationCache(ticker?: string): void {
  if (ticker) {
    tickerValidationCache.delete(ticker.toUpperCase());
    console.log(`[clearValidationCache] Cleared cache for ${ticker}`);
  } else {
    tickerValidationCache.clear();
    console.log(`[clearValidationCache] Cleared all validation cache`);
  }
}

/**
 * Get information about supported exchanges
 */
export function getSupportedExchanges() {
  return Object.entries(SUPPORTED_EXCHANGES).map(([code, info]) => ({
    code,
    ...info,
  }));
}

/**
 * Format ticker for display with exchange info
 */
export function formatTickerDisplay(ticker: string, exchange?: string): string {
  if (exchange && exchange !== "US") {
    return `${ticker} (${exchange})`;
  }
  return ticker;
}
