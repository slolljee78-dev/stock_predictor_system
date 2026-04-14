/**
 * Signals Router
 * tRPC procedures for trading signal management and retrieval
 */

import { router, publicProcedure, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { signals, stocks, notifications } from "../../drizzle/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { getUserNotifications, markNotificationAsRead } from "../pushNotificationService";
import { startBackgroundJobs, stopBackgroundJobs, triggerSignalGeneration, getBackgroundJobStatus } from "../backgroundJobs";
import { exportSignalsAsCSV, exportSignalsAsJSON, generateSignalReport } from "../signalExportService";

export const signalsRouter = router({
  /**
   * Get all active signals
   */
  getActiveSignals: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Apply feature limits based on subscription tier
        let limit = input.limit;
        if (ctx.user.subscriptionTier === "free") {
          // Free tier: max 5 signals per day
          limit = Math.min(input.limit, 5);
        }

        const activeSignals = await db
          .select({
            id: signals.id,
            type: signals.type,
            confidenceScore: signals.confidenceScore,
            priceAtSignal: signals.priceAtSignal,
            analysis: signals.analysis,
            status: signals.status,
            createdAt: signals.createdAt,
            stock: {
              id: stocks.id,
              ticker: stocks.ticker,
              name: stocks.name,
            },
          })
          .from(signals)
          .innerJoin(stocks, eq(signals.stockId, stocks.id))
          .where(eq(signals.status, "active"))
          .orderBy(desc(signals.confidenceScore))
          .limit(limit)
          .offset(input.offset);

        return {
          signals: activeSignals,
          total: activeSignals.length,
        };
      } catch (error) {
        console.error("[Signals] Failed to get active signals:", error);
        return { signals: [], total: 0 };
      }
    }),

  /**
   * Get signals by ticker
   */
  getSignalsByTicker: publicProcedure
    .input(
      z.object({
        ticker: z.string(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const tickerSignals = await db
          .select()
          .from(signals)
          .innerJoin(stocks, eq(signals.stockId, stocks.id))
          .where(eq(stocks.ticker, input.ticker))
          .orderBy(desc(signals.createdAt))
          .limit(input.limit);

        return tickerSignals.map(row => ({
          ...row.signals,
          stock: row.stocks,
        }));
      } catch (error) {
        console.error("[Signals] Failed to get signals by ticker:", error);
        return [];
      }
    }),

  /**
   * Get user notifications
   */
  getNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const userNotifications = await getUserNotifications(ctx.user.id, input.limit);
        return userNotifications;
      } catch (error) {
        console.error("[Signals] Failed to get notifications:", error);
        return [];
      }
    }),

  /**
   * Mark notification as read
   */
  markNotificationAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const success = await markNotificationAsRead(input.notificationId);
        return { success };
      } catch (error) {
        console.error("[Signals] Failed to mark notification as read:", error);
        return { success: false };
      }
    }),

  /**
   * Get signal statistics
   */
  getSignalStats: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const allSignals = await db.select().from(signals);
      const buySignals = allSignals.filter(s => s.type === 'buy');
      const sellSignals = allSignals.filter(s => s.type === 'sell');
      const activeSignals = allSignals.filter(s => s.status === 'active');

      const avgConfidence = allSignals.length > 0
        ? allSignals.reduce((sum, s) => sum + s.confidenceScore, 0) / allSignals.length
        : 0;

      return {
        totalSignals: allSignals.length,
        buySignals: buySignals.length,
        sellSignals: sellSignals.length,
        activeSignals: activeSignals.length,
        avgConfidence: Math.round(avgConfidence),
        buyToSellRatio: buySignals.length > 0 ? (buySignals.length / sellSignals.length).toFixed(2) : '0',
      };
    } catch (error) {
      console.error("[Signals] Failed to get signal stats:", error);
      return {
        totalSignals: 0,
        buySignals: 0,
        sellSignals: 0,
        activeSignals: 0,
        avgConfidence: 0,
        buyToSellRatio: '0',
      };
    }
  }),

  /**
   * Admin: Trigger manual signal generation
   */
  triggerSignalGeneration: adminProcedure.mutation(async () => {
    try {
      await triggerSignalGeneration();
      return { success: true, message: "Signal generation triggered" };
    } catch (error) {
      console.error("[Signals] Failed to trigger signal generation:", error);
      return { success: false, message: "Failed to trigger signal generation" };
    }
  }),

  /**
   * Admin: Get background job status
   */
  getBackgroundJobStatus: adminProcedure.query(() => {
    try {
      return getBackgroundJobStatus();
    } catch (error) {
      console.error("[Signals] Failed to get background job status:", error);
      return { isRunning: false, isActive: false, timestamp: new Date().toISOString() };
    }
  }),

  /**
   * Admin: Start background jobs
   */
  startBackgroundJobs: adminProcedure
    .input(
      z.object({
        frequency: z.enum(['5min', '15min', 'hourly', 'daily']).default('15min'),
        marketHoursOnly: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      try {
        startBackgroundJobs({
          enabled: true,
          frequency: input.frequency,
          marketHoursOnly: input.marketHoursOnly,
          notifyUsers: true,
        });
        return { success: true, message: "Background jobs started" };
      } catch (error) {
        console.error("[Signals] Failed to start background jobs:", error);
        return { success: false, message: "Failed to start background jobs" };
      }
    }),

  /**
   * Admin: Stop background jobs
   */
  stopBackgroundJobs: adminProcedure.mutation(() => {
    try {
      stopBackgroundJobs();
      return { success: true, message: "Background jobs stopped" };
    } catch (error) {
      console.error("[Signals] Failed to stop background jobs:", error);
      return { success: false, message: "Failed to stop background jobs" };
    }
  }),

  exportAsCSV: protectedProcedure
    .input(z.object({ limit: z.number().default(100), includeAnalysis: z.boolean().default(false) }))
    .query(async ({ input }) => {
      try {
        const csv = await exportSignalsAsCSV({ ...input, format: 'csv' });
        return { success: true, data: csv };
      } catch (error) {
        console.error("[Signals] Export CSV failed:", error);
        return { success: false, error: "Export failed" };
      }
    }),

  exportAsJSON: protectedProcedure
    .input(z.object({ limit: z.number().default(100), includeAnalysis: z.boolean().default(false) }))
    .query(async ({ input }) => {
      try {
        const json = await exportSignalsAsJSON({ ...input, format: 'json' });
        return { success: true, data: json };
      } catch (error) {
        console.error("[Signals] Export JSON failed:", error);
        return { success: false, error: "Export failed" };
      }
    }),

  generateReport: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      try {
        const report = await generateSignalReport(ctx.user.id, input.limit);
        return { success: true, data: report };
      } catch (error) {
        console.error("[Signals] Report generation failed:", error);
        return { success: false, error: "Report generation failed" };
      }
    }),
});
