import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { validationRouter } from "./routers/validation";
import { liveMarketRouter } from "./routers/liveMarket";
import { automationRouter } from "./routers/automation";
import { backtestRouter } from "./routers/backtest";

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
      const results = await import('./db').then(db => db.getActiveSignalsForUser(ctx.user.id));
      return results;
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

  backtest: backtestRouter,
});

export type AppRouter = typeof appRouter;
