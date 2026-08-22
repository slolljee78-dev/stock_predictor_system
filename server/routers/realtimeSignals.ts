/**
 * Real-time Signals Router
 * tRPC procedures for real-time signal generation and monitoring
 */

import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { fetchMarketDataWithIndicators, fetchMultipleMarketData } from '../realtimeMarketData';
import { fetchIntradayMarketData, checkEventFilter } from '../hybridMarketData';
import { generateRealtimeSignal, validateSignalStrength, filterSignalsByConfidence } from '../realtimeSignalGenerator';
import { monitorSpecificStocks } from '../signalMonitoringJob';

export const realtimeSignalsRouter = router({
  /**
   * Get real-time signal for a single stock
   */
  getSignal: publicProcedure
    .input(
      z.object({
        ticker: z.string().min(1).max(10),
        minConfidence: z.number().min(0).max(100).optional().default(25),
      })
    )
    .query(async ({ input }) => {
      try {
        const marketData = await fetchMarketDataWithIndicators(input.ticker);

        if (!marketData) {
          return {
            success: false,
            error: `Unable to fetch market data for ${input.ticker}`,
            signal: null,
          };
        }

        const signal = generateRealtimeSignal(marketData);

        // Check if signal meets confidence threshold
        if (!validateSignalStrength(signal, input.minConfidence)) {
          return {
            success: true,
            signal: {
              ...signal,
              signalType: 'hold',
              reasoning: 'Signal confidence below threshold',
            },
          };
        }

        return {
          success: true,
          signal,
        };
      } catch (error) {
        console.error(`[Signals] Error getting signal for ${input.ticker}:`, error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          signal: null,
        };
      }
    }),

  /**
   * Get signals for multiple stocks
   */
  getMultipleSignals: publicProcedure
    .input(
      z.object({
        tickers: z.array(z.string().min(1).max(10)).min(1).max(50),
        minConfidence: z.number().min(0).max(100).optional().default(25),
      })
    )
    .query(async ({ input }) => {
      try {
        const marketDataMap = await fetchMultipleMarketData(input.tickers);
        const signals = [];

        for (const [ticker, marketData] of Array.from(marketDataMap.entries())) {
          const signal = generateRealtimeSignal(marketData);
          if (validateSignalStrength(signal, input.minConfidence)) {
            signals.push(signal);
          }
        }

        return {
          success: true,
          signals: signals.sort((a, b) => b.confidence - a.confidence),
          count: signals.length,
        };
      } catch (error) {
        console.error('[Signals] Error getting multiple signals:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          signals: [],
          count: 0,
        };
      }
    }),

  /**
   * Monitor specific stocks and get signals (protected - requires auth)
   */
  monitorStocks: protectedProcedure
    .input(
      z.object({
        tickers: z.array(z.string().min(1).max(10)).min(1).max(50),
        minConfidence: z.number().min(0).max(100).optional().default(25),
        notifyOnSignal: z.boolean().optional().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const results = await monitorSpecificStocks(
          input.tickers,
          ctx.user.id.toString(),
          ctx.user.email || '',
          {
            confidenceThreshold: input.minConfidence,
            notifyOnSignal: input.notifyOnSignal,
          }
        );

        return {
          success: true,
          signals: results,
          count: results.length,
        };
      } catch (error) {
        console.error('[Signals] Error monitoring stocks:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          signals: [],
          count: 0,
        };
      }
    }),

  /**
   * Get technical indicators for a stock
   */
  getIndicators: publicProcedure
    .input(
      z.object({
        ticker: z.string().min(1).max(10),
      })
    )
    .query(async ({ input }) => {
      try {
        const marketData = await fetchMarketDataWithIndicators(input.ticker);

        if (!marketData) {
          return {
            success: false,
            error: `Unable to fetch market data for ${input.ticker}`,
            indicators: null,
          };
        }

        return {
          success: true,
          ticker: input.ticker,
          price: marketData.price.close,
          change: marketData.change,
          changePercent: marketData.changePercent,
          indicators: marketData.indicators,
          timestamp: marketData.timestamp,
        };
      } catch (error) {
        console.error(`[Signals] Error getting indicators for ${input.ticker}:`, error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          indicators: null,
        };
      }
    }),

  /**
   * Get buy signals (high confidence)
   */
  getBuySignals: publicProcedure
    .input(
      z.object({
        tickers: z.array(z.string().min(1).max(10)).min(1).max(50),
        minConfidence: z.number().min(0).max(100).optional().default(30),
      })
    )
    .query(async ({ input }) => {
      try {
        const marketDataMap = await fetchMultipleMarketData(input.tickers);
        const buySignals = [];

        for (const [ticker, marketData] of Array.from(marketDataMap.entries())) {
          const signal = generateRealtimeSignal(marketData);
          if (signal.signalType === 'buy' && signal.confidence >= input.minConfidence) {
            buySignals.push(signal);
          }
        }

        return {
          success: true,
          signals: buySignals.sort((a, b) => b.confidence - a.confidence),
          count: buySignals.length,
        };
      } catch (error) {
        console.error('[Signals] Error getting buy signals:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          signals: [],
          count: 0,
        };
      }
    }),

  /**
   * Get sell signals (high confidence)
   */
  getSellSignals: publicProcedure
    .input(
      z.object({
        tickers: z.array(z.string().min(1).max(10)).min(1).max(50),
        minConfidence: z.number().min(0).max(100).optional().default(30),
      })
    )
    .query(async ({ input }) => {
      try {
        const marketDataMap = await fetchMultipleMarketData(input.tickers);
        const sellSignals = [];

        for (const [ticker, marketData] of Array.from(marketDataMap.entries())) {
          const signal = generateRealtimeSignal(marketData);
          if (signal.signalType === 'sell' && signal.confidence >= input.minConfidence) {
            sellSignals.push(signal);
          }
        }

        return {
          success: true,
          signals: sellSignals.sort((a, b) => b.confidence - a.confidence),
          count: sellSignals.length,
        };
      } catch (error) {
        console.error('[Signals] Error getting sell signals:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          signals: [],
          count: 0,
        };
      }
    }),

  /**
   * Get market overview with signals for top stocks
   */
  getMarketOverview: publicProcedure
    .input(
      z.object({
        tickers: z.array(z.string().min(1).max(10)).optional().default(['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN']),
        minConfidence: z.number().min(0).max(100).optional().default(25),
      })
    )
    .query(async ({ input }) => {
      try {
        const marketDataMap = await fetchMultipleMarketData(input.tickers);
        const overview = [];

        for (const [ticker, marketData] of Array.from(marketDataMap.entries())) {
          const signal = generateRealtimeSignal(marketData);
          overview.push({
            ticker,
            price: marketData.price.close,
            change: marketData.change,
            changePercent: marketData.changePercent,
            signal: signal.signalType,
            confidence: signal.confidence,
            rsi: signal.technicalData.rsi,
            timestamp: marketData.timestamp,
          });
        }

        return {
          success: true,
          overview: overview.sort((a, b) => b.confidence - a.confidence),
          count: overview.length,
        };
      } catch (error) {
        console.error('[Signals] Error getting market overview:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          overview: [],
          count: 0,
        };
      }
    }),

  /**
   * Get 15-minute intraday candles with technical indicators for a ticker.
   * Falls back to synthesised candles when Finnhub returns no data.
   */
  getIntradayData: publicProcedure
    .input(
      z.object({
        ticker: z.string().min(1).max(10),
        lookbackHours: z.number().min(1).max(24).optional().default(8),
      })
    )
    .query(async ({ input }) => {
      try {
        const data = await fetchIntradayMarketData(input.ticker);
        if (!data) {
          return { success: false, error: `No intraday data for ${input.ticker}`, data: null };
        }
        return { success: true, data };
      } catch (error) {
        console.error('[Signals] Error fetching intraday data:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: null,
        };
      }
    }),

  /**
   * Check whether a signal for a ticker should be suppressed due to an
   * upcoming or recent earnings / high-impact news event.
   */
  checkEarningsFilter: publicProcedure
    .input(z.object({ ticker: z.string().min(1).max(10) }))
    .query(async ({ input }) => {
      try {
        const result = await checkEventFilter(input.ticker);
        return { success: true, ...result };
      } catch (error) {
        return {
          success: false,
          shouldSuppress: false,
          reason: null,
          daysToEvent: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),
});
