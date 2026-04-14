/**
 * Live Market Data Router
 * tRPC endpoints for real-time stock prices and market data
 */

import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  fetchStockPrice,
  fetchMultipleStockPrices,
  fetchMarketData,
  fetchStockPriceWithCache,
  clearPriceCache,
  fetchPriceHistory,
} from "../liveMarketData";

export const liveMarketRouter = router({
  // Get current price for a single stock
  getPrice: publicProcedure.input(z.object({ ticker: z.string() })).query(async ({ input }) => {
    const price = await fetchStockPriceWithCache(input.ticker);
    return price || { error: `Could not fetch price for ${input.ticker}` };
  }),

  // Get current prices for multiple stocks
  getPrices: publicProcedure
    .input(z.object({ tickers: z.array(z.string()) }))
    .query(async ({ input }) => {
      const prices = await fetchMultipleStockPrices(input.tickers);
      return {
        prices,
        count: prices.length,
        timestamp: new Date().toISOString(),
      };
    }),

  // Get detailed market data for a stock
  getMarketData: publicProcedure.input(z.object({ ticker: z.string() })).query(async ({ input }) => {
    const data = await fetchMarketData(input.ticker);
    return data || { error: `Could not fetch market data for ${input.ticker}` };
  }),

  // Get market data for multiple stocks
  getMultipleMarketData: publicProcedure
    .input(z.object({ tickers: z.array(z.string()) }))
    .query(async ({ input }) => {
      const data = await Promise.all(input.tickers.map((ticker) => fetchMarketData(ticker)));
      return {
        data: data.filter((d) => d !== null),
        count: data.filter((d) => d !== null).length,
        timestamp: new Date().toISOString(),
      };
    }),

  // Get top gainers
  getTopGainers: publicProcedure
    .input(z.object({ tickers: z.array(z.string()), limit: z.number().default(5) }))
    .query(async ({ input }) => {
      const prices = await fetchMultipleStockPrices(input.tickers);
      const sorted = prices.sort((a, b) => b.changePercent - a.changePercent);
      return sorted.slice(0, input.limit);
    }),

  // Get top losers
  getTopLosers: publicProcedure
    .input(z.object({ tickers: z.array(z.string()), limit: z.number().default(5) }))
    .query(async ({ input }) => {
      const prices = await fetchMultipleStockPrices(input.tickers);
      const sorted = prices.sort((a, b) => a.changePercent - b.changePercent);
      return sorted.slice(0, input.limit);
    }),

  // Get historical price data
  getPriceHistory: publicProcedure
    .input(
      z.object({
        ticker: z.string(),
        timeframe: z.enum(["1h", "4h", "1d", "1w"]).default("1d"),
      })
    )
    .query(async ({ input }) => {
      const history = await fetchPriceHistory(input.ticker, input.timeframe);
      return history;
    }),

  // Refresh price cache
  refreshCache: publicProcedure.input(z.object({ ticker: z.string().optional() })).mutation(({ input }) => {
    clearPriceCache(input.ticker);
    return { success: true, message: `Cache cleared${input.ticker ? ` for ${input.ticker}` : " for all tickers"}` };
  }),
});
