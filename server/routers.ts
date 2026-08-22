import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { validationRouter } from "./routers/validation";
import { liveMarketRouter } from "./routers/liveMarket";
import { automationRouter } from "./routers/automation";
import { backtestRouter } from "./routers/backtest";
import { sentimentRouter } from "./routers/sentiment";
import { alertsRouter } from "./routers/alerts";
import { alertPreferencesRouter } from "./routers/alertPreferences";
import { pushNotificationsRouter } from "./routers/pushNotifications";
import { realtimeSignalsRouter } from './routers/realtimeSignals';
import { signalNotificationsRouter } from './routers/signalNotifications';
import { priceAlertsRouter } from "./routers/priceAlerts";
import { alertMonitoringRouter } from "./routers/alertMonitoring";
import { profileRouter } from "./routers/profile";
import { blogRouter } from "./routers/blog";
import { referralRouter } from "./routers/referral";
import { publicSignalsRouter } from "./routers/publicSignals";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  automation: automationRouter,
  priceAlerts: priceAlertsRouter,
  alertMonitoring: alertMonitoringRouter,
  profile: profileRouter,
  blog: blogRouter,
  referral: referralRouter,

  stocks: router({
    search: publicProcedure
      .input((val: unknown) => {
        if (typeof val === 'string') return val;
        throw new Error('Expected string');
      })
      .query(async ({ input }) => {
        const results = await import('./db').then(db => db.searchStocks(input));
        return results;
      }),

    getAll: publicProcedure.query(async () => {
      const results = await import('./db').then(db => db.getAllStocks({ type: 'equity' }));
      return results;
    }),

    getByTicker: publicProcedure
      .input((val: unknown) => {
        if (typeof val === 'string') return val;
        throw new Error('Expected string');
      })
      .query(async ({ input }) => {
        const result = await import('./db').then(db => db.getStockByTicker(input));
        return result;
      }),
  }),

  watchlist: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const results = await import('./db').then(db => db.getUserWatchlist(ctx.user.id));
      return results;
    }),

    add: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null) {
          const candidate = val as {
            stockId?: number;
            ticker?: string;
            name?: string;
            exchange?: string;
            type?: 'equity' | 'etf';
            currency?: string;
            label?: string;
          };

          if (typeof candidate.stockId === 'number' || typeof candidate.ticker === 'string') {
            return candidate;
          }
        }
        throw new Error('Invalid input');
      })
      .mutation(async ({ ctx, input }) => {
        try {
          await import('./db').then(db =>
            db.addToWatchlist(ctx.user.id, {
              stockId: input.stockId,
              ticker: input.ticker,
              name: input.name,
              exchange: input.exchange,
              type: input.type,
              currency: input.currency,
            }, { label: input.label })
          );
          return { success: true };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to add stock to watchlist';
          throw new Error(message);
        }
      }),

    remove: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null && 'watchlistId' in val) {
          return val as { watchlistId: number };
        }
        throw new Error('Invalid input');
      })
      .mutation(async ({ ctx, input }) => {
        await import('./db').then(db =>
          db.removeFromWatchlist(input.watchlistId, ctx.user.id)
        );
        return { success: true };
      }),

    updatePreferences: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null && 'watchlistId' in val) {
          return val as any;
        }
        throw new Error('Invalid input');
      })
      .mutation(async ({ ctx, input }) => {
        try {
          await import('./db').then(db =>
            db.updateWatchlistPreferences((input as any).watchlistId, ctx.user.id, {
              alertOnBuy: (input as any).alertOnBuy,
              alertOnSell: (input as any).alertOnSell,
              minConfidenceThreshold: (input as any).minConfidenceThreshold,
              emailNotifications: (input as any).emailNotifications,
              inAppNotifications: (input as any).inAppNotifications,
            })
          );
          return { success: true };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update preferences';
          throw new Error(message);
        }
      }),
  }),

  validation: validationRouter,

  signals: router({
    getForStock: publicProcedure
      .input((val: unknown) => {
        if (typeof val === 'number') return val;
        throw new Error('Expected number');
      })
      .query(async ({ input }) => {
        const results = await import('./db').then(db => db.getSignalsForStock(input, 50));
        return results;
      }),

    getForUser: protectedProcedure.query(async ({ ctx }) => {
      const { hasActivePaidPlan } = await import('./subscriptionAccess');
      const results = await import('./db').then(db => db.getActiveSignalsForUser(ctx.user.id));

      if (hasActivePaidPlan(ctx.user)) {
        return results;
      }

      return results.slice(0, 3).map((signal) => ({
        ...signal,
        confidenceScore: Math.min(signal.confidenceScore, 60),
      }));
    }),

    statuses: protectedProcedure.query(async ({ ctx }) => {
      const { hasActivePaidPlan } = await import('./subscriptionAccess');
      const { getWatchlistStatuses } = await import('./watchlistStatuses');
      const statuses = await getWatchlistStatuses(ctx.user.id);

      if (hasActivePaidPlan(ctx.user)) {
        return statuses;
      }

      return statuses.slice(0, 3).map((status) => ({
        ...status,
        explanation: "Upgrade to a paid plan to unlock the full live signal explanation for this stock.",
        recommendation: "Upgrade required",
      }));
    }),
  }),

  liveMarket: liveMarketRouter,

  portfolio: router({
    getLeaderboard: publicProcedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null) {
          return val as { limit?: number; sortBy?: 'return' | 'sharpe' | 'winRate' };
        }
        throw new Error('Invalid input');
      })
      .query(async ({ input }) => {
        try {
          // Return mock leaderboard data
          // In production, this would query the portfolios table
          return [
            {
              id: 1,
              name: 'Top Performer',
              totalReturn: 45.2,
              sharpeRatio: 1.8,
              winRate: 0.68,
              maxDrawdown: 0.08,
            },
            {
              id: 2,
              name: 'Consistent Trader',
              totalReturn: 32.1,
              sharpeRatio: 1.5,
              winRate: 0.62,
              maxDrawdown: 0.12,
            },
          ];
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch leaderboard';
          throw new Error(message);
        }
      }),

    exportToJSON: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null && 'portfolioId' in val) {
          return val as { portfolioId: number };
        }
        throw new Error('Invalid input');
      })
      .query(async ({ ctx, input }) => {
        try {
          const { exportPortfolioToJSON } = await import('./portfolioExportImport');
          // Mock portfolio data for now
          const mockPortfolio = {
            name: 'My Portfolio',
            description: 'Test portfolio',
            startingCapital: 10000,
            currentCapital: 12000,
            totalReturn: 0.20,
            winRate: 0.65,
            sharpeRatio: 1.5,
            maxDrawdown: 0.10,
            totalTrades: 15,
            winningTrades: 10,
            profitFactor: 2.1,
            status: 'active' as const,
            startDate: new Date(),
            endDate: undefined,
          };
          const mockTrades: any[] = [];
          return exportPortfolioToJSON(mockPortfolio, mockTrades);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Export failed';
          throw new Error(message);
        }
      }),

    exportToCSV: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null && 'portfolioId' in val) {
          return val as { portfolioId: number };
        }
        throw new Error('Invalid input');
      })
      .query(async ({ ctx, input }) => {
        try {
          const { exportPortfolioToJSON, exportPortfolioToCSV } = await import('./portfolioExportImport');
          // Mock portfolio data for now
          const mockPortfolio = {
            name: 'My Portfolio',
            description: 'Test portfolio',
            startingCapital: 10000,
            currentCapital: 12000,
            totalReturn: 0.20,
            winRate: 0.65,
            sharpeRatio: 1.5,
            maxDrawdown: 0.10,
            totalTrades: 15,
            winningTrades: 10,
            profitFactor: 2.1,
            status: 'active' as const,
            startDate: new Date(),
            endDate: undefined,
          };
          const mockTrades: any[] = [];
          const exported = exportPortfolioToJSON(mockPortfolio, mockTrades);
          return exportPortfolioToCSV(exported);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Export failed';
          throw new Error(message);
        }
      }),

    importFromJSON: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === 'string') return val;
        throw new Error('Expected JSON string');
      })
      .mutation(async ({ ctx, input }) => {
        try {
          const { importPortfolioFromJSON } = await import('./portfolioExportImport');
          const imported = importPortfolioFromJSON(input);
          // In production, this would insert into the portfolios table
          return { success: true, portfolioId: Math.floor(Math.random() * 1000) };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Import failed';
          throw new Error(message);
        }
      }),
  }),

  simulator: router({
    executeLiveTradeWithMarketPrice: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null) {
          return val as any;
        }
        throw new Error('Invalid input');
      })
      .mutation(async ({ input }) => {
        try {
          const { executeLiveTradeWithMarketPrice } = await import('./liveSimulator');
          const result = await executeLiveTradeWithMarketPrice(
            (input as any).ticker,
            (input as any).type,
            (input as any).quantity,
            (input as any).requestedPrice,
            (input as any).slippagePercent,
            (input as any).commissionPercent
          );
          return result;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Trade execution failed';
          throw new Error(message);
        }
      }),

    getAutoTradingUniverse: protectedProcedure.query(async ({ ctx }) => {
      const { hasActivePaidPlan } = await import('./subscriptionAccess');
      const { getTradingStocks } = await import('./stockDataFetcher');
      const stocks = getTradingStocks();

      if (hasActivePaidPlan(ctx.user)) {
        return stocks;
      }

      return stocks.slice(0, 6);
    }),

    runAutoTradingRound: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null) {
          return val as any;
        }
        throw new Error('Invalid input');
      })
      .mutation(async ({ ctx, input }) => {
        try {
          const { assertAutoTradingAccess } = await import('./subscriptionAccess');
          const { executeAutoTradingRound } = await import('./autoTradingRoundService');
          assertAutoTradingAccess(ctx.user);
          return await executeAutoTradingRound({
            positions: Array.isArray((input as any).positions) ? (input as any).positions : [],
            cashBalance: typeof (input as any).cashBalance === 'number' ? (input as any).cashBalance : 0,
            desiredUniverseSize: typeof (input as any).desiredUniverseSize === 'number' ? (input as any).desiredUniverseSize : undefined,
            universeTickers: Array.isArray((input as any).universeTickers) ? (input as any).universeTickers : [],
            minConfidence: typeof (input as any).minConfidence === 'number' ? (input as any).minConfidence : undefined,
            maxTradesPerRound: typeof (input as any).maxTradesPerRound === 'number' ? (input as any).maxTradesPerRound : undefined,
            positionSizePercent: typeof (input as any).positionSizePercent === 'number' ? (input as any).positionSizePercent : undefined,
            maxOpenPositions: typeof (input as any).maxOpenPositions === 'number' ? (input as any).maxOpenPositions : undefined,
            scanBatchSize: typeof (input as any).scanBatchSize === 'number' ? (input as any).scanBatchSize : undefined,
            scanOffset: typeof (input as any).scanOffset === 'number' ? (input as any).scanOffset : undefined,
            slippagePercent: typeof (input as any).slippagePercent === 'number' ? (input as any).slippagePercent : undefined,
            commissionPercent: typeof (input as any).commissionPercent === 'number' ? (input as any).commissionPercent : undefined,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Automated trading round failed';
          throw new Error(message);
        }
      }),

    getScheduledAutoTradingRun: protectedProcedure.query(async ({ ctx }) => {
      const { assertAutoTradingAccess } = await import('./subscriptionAccess');
      const { getScheduledSimulatorRun } = await import('./scheduledSimulatorRuns');
      assertAutoTradingAccess(ctx.user);
      // Read-only: processing is handled exclusively by the Heartbeat cron
      // (/api/scheduled/simulator-auto-trading every 6h) to avoid double-execution
      // and premature completion when the user simply opens the page.
      return getScheduledSimulatorRun(ctx.user.id);
    }),

    startScheduledAutoTradingRun: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null) {
          return val as any;
        }
        throw new Error('Invalid input');
      })
      .mutation(async ({ ctx, input }) => {
        const { assertAutoTradingAccess } = await import('./subscriptionAccess');
        const { startScheduledSimulatorRun } = await import('./scheduledSimulatorRuns');
        assertAutoTradingAccess(ctx.user);
        return startScheduledSimulatorRun({
          userId: ctx.user.id,
          portfolio: (input as any).portfolio,
          settings: {
            durationDays: (input as any).durationDays,
            riskProfileId: (input as any).riskProfileId,
            universeSize: (input as any).universeSize,
            minConfidence: (input as any).minConfidence,
            maxTradesPerRound: (input as any).maxTradesPerRound,
            positionSizePercent: (input as any).positionSizePercent,
            universeTickers: Array.isArray((input as any).universeTickers) ? (input as any).universeTickers : [],
          },
        });
      }),

    cancelScheduledAutoTradingRun: protectedProcedure.mutation(async ({ ctx }) => {
      const { assertAutoTradingAccess } = await import('./subscriptionAccess');
      const { cancelScheduledSimulatorRun } = await import('./scheduledSimulatorRuns');
      assertAutoTradingAccess(ctx.user);
      await cancelScheduledSimulatorRun(ctx.user.id);
      return { success: true };
    }),

    calculateLivePortfolioValue: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null) {
          return val as any;
        }
        throw new Error('Invalid input');
      })
      .query(async ({ input }) => {
        try {
          const { calculateLivePortfolioValue } = await import('./liveSimulator');
          const result = await calculateLivePortfolioValue(
            (input as any).positions,
            (input as any).cashBalance
          );
          return result;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Portfolio calculation failed';
          throw new Error(message);
        }
      }),
  }),

  dashboard: router({
    getTrendData: publicProcedure.query(async () => {
      const { getSignalTrend } = await import('./db');
      return getSignalTrend(7);
    }),
    getTrendDataByDay: publicProcedure.query(async () => {
      const { getSignalTrendByDay } = await import('./db');
      return getSignalTrendByDay(7);
    }),
  }),

  signalAccuracy: router({
    getStats: publicProcedure.query(async () => {
      const { getSignalAccuracyStats } = await import('./db');
      return getSignalAccuracyStats();
    }),
  }),

  publicSignals: publicSignalsRouter,

  backtest: backtestRouter,
  sentiment: sentimentRouter,
  alerts: alertsRouter,
  alertPreferences: alertPreferencesRouter,
  pushNotifications: pushNotificationsRouter,
  realtimeSignals: realtimeSignalsRouter,
  signalNotifications: signalNotificationsRouter,
});

export type AppRouter = typeof appRouter;
