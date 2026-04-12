import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME } from "../shared/const";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { validationRouter } from "./routers/validation";
import { liveMarketRouter } from "./routers/liveMarket";
import { automationRouter } from "./routers/automation";
import { paymentsRouter } from "./routers/payments";
import { brokersRouter } from "./routers/brokers";
import { templatesRouter } from "./routers/templates";
import { analyticsRouter } from "./routers/analytics";
import { notificationsRouter } from "./routers/notifications";

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
  payments: paymentsRouter,
  brokers: brokersRouter,
  templates: templatesRouter,
  analytics: analyticsRouter,
  notifications: notificationsRouter,

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
        if (typeof val === 'object' && val !== null && 'stockId' in val) {
          return val as { stockId: number; label?: string };
        }
        throw new Error('Invalid input');
      })
      .mutation(async ({ ctx, input }) => {
        await import('./db').then(db =>
          db.addToWatchlist(ctx.user.id, input.stockId, { label: input.label })
        );
        return { success: true };
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
});

export type AppRouter = typeof appRouter;
