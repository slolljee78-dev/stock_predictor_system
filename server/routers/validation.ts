/**
 * Validation Router
 * Handles 3-month paper trading validation endpoints
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  initializePaperTradingSession,
  recordTrade,
  calculateDailyPerformance,
  calculateMonthlyPerformance,
  generateValidationReport,
  DEFAULT_VALIDATION_CONFIG,
  PaperTradingSession,
  TradeRecord,
  getSessionById,
} from "../paperTradingValidator";
import { getDb } from "../db";
import { validationSessions, validationDailyPerformance, validationTrades } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const validationRouter = router({
  // Create a new validation session
  createSession: protectedProcedure
    .input(
      z.object({
        startingCapital: z.number().default(100),
        monthlyTarget: z.number().default(0.1),
        dailyLossLimit: z.number().default(0.02),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const config = {
        ...DEFAULT_VALIDATION_CONFIG,
        startingCapital: input.startingCapital,
        monthlyTarget: input.monthlyTarget,
        dailyLossLimit: input.dailyLossLimit,
      };

      if (!ctx.session?.user?.id || !ctx.session?.user?.email) {
        throw new Error("User not authenticated");
      }
      const session = await initializePaperTradingSession(ctx.session.user.id, ctx.session.user.email, config);

      return {
        sessionId: session.sessionId,
        startingCapital: session.startingCapital,
        currentCapital: session.currentCapital,
        status: session.status,
      };
    }),

  // Get session details
  getSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const session = await getSessionById(input.sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const sessionRecord = (await db.select().from(validationSessions).where(eq(validationSessions.sessionId, session.sessionId)))[0];
      if (!sessionRecord) throw new Error("Validation session not found");

      const allTradesFromDb = await db.select().from(validationTrades).where(eq(validationTrades.sessionId, sessionRecord.id));

      return {
        sessionId: session.sessionId,
        startingCapital: session.startingCapital,
        currentCapital: session.currentCapital,
        status: session.status,
        totalTrades: allTradesFromDb.length,
        startDate: session.startDate.toISOString(),
      };
    }),

  // Record a trade
  recordTrade: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        trade: z.object({
          tradeId: z.string(),
          date: z.string(),
          time: z.string(),
          ticker: z.string(),
          type: z.enum(["BUY", "SELL"]),
          quantity: z.number(),
          entryPrice: z.number(),
          executionPrice: z.number(),
          commission: z.number(),
          totalCost: z.number(),
          pnl: z.number().optional(),
          pnlPercent: z.number().optional(),
          signal: z.object({
            confidence: z.number(),
            type: z.string(),
            reason: z.string(),
          }),
        }),
        currentPrice: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await recordTrade(input.sessionId, input.trade as TradeRecord, input.currentPrice);
      return result;
    }),

  // Get daily performance
  getDailyPerformance: protectedProcedure
    .input(z.object({ sessionId: z.string(), date: z.string() }))
    .query(async ({ input }) => {
      const session = await getSessionById(input.sessionId);
      if (!session) {
        throw new Error("Session not found");
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const sessionRecord = (await db.select().from(validationSessions).where(eq(validationSessions.sessionId, session.sessionId)))[0];
      if (!sessionRecord) throw new Error("Validation session not found");
      const dailyPerformanceRecords = await db.select().from(validationDailyPerformance).where(and(eq(validationDailyPerformance.sessionId, sessionRecord.id), eq(validationDailyPerformance.date, input.date)));
      if (dailyPerformanceRecords.length === 0) {
        throw new Error("Daily performance not found for this date");
      }
      const daily = dailyPerformanceRecords[0];
      return {
        date: daily.date,
        openingCapital: daily.openingCapital.toNumber(),
        closingCapital: daily.closingCapital.toNumber(),
        dailyPnL: daily.dailyPnL.toNumber(),
        dailyPnLPercent: daily.dailyPnLPercent.toNumber(),
        trades: daily.trades,
        winningTrades: daily.winningTrades,
        losingTrades: daily.losingTrades,
        winRate: daily.winRate.toNumber(),
        maxDailyDrawdown: daily.maxDailyDrawdown.toNumber(),
        riskLimitHit: daily.riskLimitHit === 1,
      };
    }),

  // Get monthly performance
  getMonthlyPerformance: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        month: z.number(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const session = await getSessionById(input.sessionId);
      if (!session) {
        throw new Error("Session not found");
      }
      const monthly = await calculateMonthlyPerformance(session, input.month, input.startDate, input.endDate);
      return monthly;
    }),

  // Get validation report
  getValidationReport: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const session = await getSessionById(input.sessionId);
      if (!session) {
        throw new Error("Session not found");
      }
      const report = await generateValidationReport(session);
      return report;
    }),

  // Get trade history
  getTradeHistory: protectedProcedure
    .input(z.object({ sessionId: z.string(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const session = await getSessionById(input.sessionId);
      if (!session) {
        throw new Error("Session not found");
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const sessionRecord = (await db.select().from(validationSessions).where(eq(validationSessions.sessionId, session.sessionId)))[0];
      if (!sessionRecord) throw new Error("Validation session not found");
      const allTradesFromDb = await db.select().from(validationTrades).where(eq(validationTrades.sessionId, sessionRecord.id));
      const allTradesMapped: TradeRecord[] = allTradesFromDb.map(t => ({
        tradeId: t.tradeId,
        date: t.date,
        time: t.time,
        ticker: t.ticker,
        type: t.type,
        quantity: t.quantity,
        entryPrice: t.entryPrice.toNumber(),
        executionPrice: t.executionPrice.toNumber(),
        commission: t.commission.toNumber(),
        totalCost: t.totalCost.toNumber(),
        pnl: t.pnl?.toNumber(),
        pnlPercent: t.pnlPercent?.toNumber(),
        signal: {
          confidence: t.signalConfidence,
          type: t.signalType,
          reason: t.signalReason || "",
        },
      }));
      return allTradesMapped.slice(-input.limit).reverse();
    }),

  // Get current metrics
  getMetrics: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const session = await getSessionById(input.sessionId);
      if (!session) {
        throw new Error("Session not found");
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const sessionRecord = (await db.select().from(validationSessions).where(eq(validationSessions.sessionId, session.sessionId)))[0];
      if (!sessionRecord) throw new Error("Validation session not found");

      const allTradesFromDb = await db.select().from(validationTrades).where(eq(validationTrades.sessionId, sessionRecord.id));
      const allTradesMapped: TradeRecord[] = allTradesFromDb.map(t => ({
        tradeId: t.tradeId,
        date: t.date,
        time: t.time,
        ticker: t.ticker,
        type: t.type,
        quantity: t.quantity,
        entryPrice: t.entryPrice.toNumber(),
        executionPrice: t.executionPrice.toNumber(),
        commission: t.commission.toNumber(),
        totalCost: t.totalCost.toNumber(),
        pnl: t.pnl?.toNumber(),
        pnlPercent: t.pnlPercent?.toNumber(),
        signal: {
          confidence: t.signalConfidence,
          type: t.signalType,
          reason: t.signalReason || "",
        },
      }));

      const winningTrades = allTradesMapped.filter((t) => (t.pnl || 0) > 0).length;
      const totalTrades = allTradesMapped.length;
      const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;

      const dailyPerformanceRecords = await db.select().from(validationDailyPerformance).where(eq(validationDailyPerformance.sessionId, sessionRecord.id));
      const dailyReturns = dailyPerformanceRecords.map((d) => d.dailyPnLPercent.toNumber());
      const avgReturn = dailyReturns.length > 0 ? dailyReturns.reduce((a, b) => a + b) / dailyReturns.length : 0;
      const variance =
        dailyReturns.length > 0
          ? dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / dailyReturns.length
          : 0;
      const stdDev = Math.sqrt(variance);
      const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

      let maxDrawdown = 0;
      let peakCapital = session.startingCapital;
      let runningCapital = session.startingCapital;
      for (const trade of allTradesMapped) {
        runningCapital += trade.pnl || 0;
        peakCapital = Math.max(peakCapital, runningCapital);
        const drawdown = (peakCapital - runningCapital) / peakCapital;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }

      const today = new Date().toISOString().split("T")[0];
      const todayTrades = allTradesMapped.filter((t) => t.date === today);
      const dailyPnL = todayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

      const monthlyPnL = allTradesMapped.reduce((sum, t) => sum + (t.pnl || 0), 0);
      const monthlyReturn = (monthlyPnL / session.startingCapital) * 100;

      return {
        currentCapital: session.currentCapital,
        dailyPnL,
        monthlyReturn,
        winRate,
        sharpeRatio,
        maxDrawdown,
        totalTrades,
      };
    }),

  // List all sessions
  listSessions: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const sessions = await db.select().from(validationSessions).where(eq(validationSessions.userId, ctx.session.user.id));
    return sessions.map((session) => ({
      sessionId: session.sessionId,
      startingCapital: session.startingCapital.toNumber(),
      currentCapital: session.currentCapital.toNumber(),
      status: session.status,
      startDate: session.startDate.toISOString(),
      totalTrades: (await db.select().from(validationTrades).where(eq(validationTrades.sessionId, session.id))).length,
    }));
  }),

  // Delete session
  deleteSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      activeSessions.delete(input.sessionId);
      return { success: true };
    }),
});
