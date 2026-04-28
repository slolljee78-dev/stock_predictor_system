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

    statuses: protectedProcedure.query(async ({ ctx }) => {
      const { getWatchlistStatuses } = await import('./watchlistStatuses');
      return getWatchlistStatuses(ctx.user.id);
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

    getAutoTradingUniverse: protectedProcedure.query(async () => {
      const { getTradingStocks } = await import('./stockDataFetcher');
      return getTradingStocks();
    }),

    runAutoTradingRound: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null) {
          return val as any;
        }
        throw new Error('Invalid input');
      })
      .mutation(async ({ input }) => {
        try {
          const {
            DEFAULT_AUTO_TRADING_MAX_OPEN_POSITIONS,
            DEFAULT_AUTO_TRADING_MAX_TRADES_PER_ROUND,
            DEFAULT_AUTO_TRADING_MIN_CONFIDENCE,
            DEFAULT_AUTO_TRADING_POSITION_SIZE_PERCENT,
            DEFAULT_AUTO_TRADING_UNIVERSE_SIZE,
            planAutoTradingRound,
            selectAutoTradingUniverse,
          } = await import('./simulatorAutoTrading');
          const { getTradingStocks } = await import('./stockDataFetcher');
          const { fetchMultipleMarketData } = await import('./realtimeMarketData');
          const { generateRealtimeSignal } = await import('./realtimeSignalGenerator');
          const { executeLiveTradeWithMarketPrice } = await import('./liveSimulator');

          const stocks = getTradingStocks();
          const desiredUniverseSize = typeof (input as any).desiredUniverseSize === 'number'
            ? (input as any).desiredUniverseSize
            : DEFAULT_AUTO_TRADING_UNIVERSE_SIZE;
          const selectedUniverse = selectAutoTradingUniverse(
            stocks,
            desiredUniverseSize,
            Array.isArray((input as any).universeTickers) ? (input as any).universeTickers : [],
          );

          const positions = Array.isArray((input as any).positions) ? (input as any).positions : [];
          const scanBatchSize = typeof (input as any).scanBatchSize === 'number'
            ? Math.max(1, Math.min((input as any).scanBatchSize, selectedUniverse.length || 1))
            : Math.min(4, selectedUniverse.length || 1);
          const scanOffset = typeof (input as any).scanOffset === 'number' ? (input as any).scanOffset : 0;
          const scanTargets = selectedUniverse.length > 0
            ? Array.from({ length: scanBatchSize }, (_, index) => selectedUniverse[(scanOffset + index) % selectedUniverse.length])
            : [];
          const trackedTickers = Array.from(new Set([
            ...scanTargets.map((stock) => stock.ticker),
            ...positions.map((position: { ticker: string }) => position.ticker),
          ]));

          const marketDataMap = await fetchMultipleMarketData(trackedTickers);
          const universeByTicker = new Map(selectedUniverse.map((stock) => [stock.ticker.toUpperCase(), stock]));

          const signals = trackedTickers.flatMap((ticker) => {
            const marketData = marketDataMap.get(ticker);
            if (!marketData) {
              return [];
            }

            const stock = universeByTicker.get(ticker.toUpperCase()) ?? stocks.find((item) => item.ticker === ticker);
            const signal = generateRealtimeSignal(marketData);

            return [{
              ticker,
              name: stock?.name ?? ticker,
              sector: stock?.sector ?? 'Unknown',
              signalType: signal.signalType,
              confidence: signal.confidence,
              currentPrice: marketData.price.close,
              reasoning: signal.reasoning,
            }];
          });

          const plannedRound = planAutoTradingRound({
            signals,
            positions,
            cashBalance: typeof (input as any).cashBalance === 'number' ? (input as any).cashBalance : 0,
            config: {
              minConfidence: typeof (input as any).minConfidence === 'number'
                ? (input as any).minConfidence
                : DEFAULT_AUTO_TRADING_MIN_CONFIDENCE,
              maxTradesPerRound: typeof (input as any).maxTradesPerRound === 'number'
                ? (input as any).maxTradesPerRound
                : DEFAULT_AUTO_TRADING_MAX_TRADES_PER_ROUND,
              positionSizePercent: typeof (input as any).positionSizePercent === 'number'
                ? (input as any).positionSizePercent
                : DEFAULT_AUTO_TRADING_POSITION_SIZE_PERCENT,
              maxOpenPositions: typeof (input as any).maxOpenPositions === 'number'
                ? (input as any).maxOpenPositions
                : DEFAULT_AUTO_TRADING_MAX_OPEN_POSITIONS,
            },
          });

          const executedTrades = [] as Array<{
            ticker: string;
            name: string;
            sector: string;
            type: 'BUY' | 'SELL';
            quantity: number;
            requestedPrice: number;
            executedPrice: number;
            executionTime: string;
            slippage: number;
            commission: number;
            totalCost: number;
            priceSource: 'live' | 'fallback';
            confidence: number;
            reasoning: string;
          }>;

          for (const action of plannedRound.actions) {
            const execution = await executeLiveTradeWithMarketPrice(
              action.ticker,
              action.type,
              action.quantity,
              action.requestedPrice,
              typeof (input as any).slippagePercent === 'number' ? (input as any).slippagePercent : 0.05,
              typeof (input as any).commissionPercent === 'number' ? (input as any).commissionPercent : 0.1,
            );

            if (!execution.success) {
              continue;
            }

            executedTrades.push({
              ticker: action.ticker,
              name: action.name,
              sector: action.sector,
              type: action.type,
              quantity: action.quantity,
              requestedPrice: execution.requestedPrice,
              executedPrice: execution.executedPrice,
              executionTime: execution.executionTime,
              slippage: execution.slippage,
              commission: execution.commission,
              totalCost: execution.totalCost,
              priceSource: execution.priceSource,
              confidence: action.confidence,
              reasoning: action.reasoning,
            });
          }

          return {
            runAt: new Date().toISOString(),
            selectedUniverse,
            scannedCount: trackedTickers.length,
            scannedTickers: trackedTickers,
            nextScanOffset: selectedUniverse.length > 0 ? (scanOffset + scanBatchSize) % selectedUniverse.length : 0,
            actionableSignals: plannedRound.actionableSignals,
            executedTrades,
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Automated trading round failed';
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

  backtest: backtestRouter,
  sentiment: sentimentRouter,
  alerts: alertsRouter,
  alertPreferences: alertPreferencesRouter,
  pushNotifications: pushNotificationsRouter,
  realtimeSignals: realtimeSignalsRouter,
  signalNotifications: signalNotificationsRouter,
});

export type AppRouter = typeof appRouter;
