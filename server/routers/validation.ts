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
} from "../paperTradingValidator";

// Store active sessions in memory (in production, use database)
const activeSessions = new Map<string, PaperTradingSession>();

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

      const session = initializePaperTradingSession(config);
      activeSessions.set(session.sessionId, session);

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
      const session = activeSessions.get(input.sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      return {
        sessionId: session.sessionId,
        startingCapital: session.startingCapital,
        currentCapital: session.currentCapital,
        status: session.status,
        totalTrades: session.allTrades.length,
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
      const session = activeSessions.get(input.sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      const result = recordTrade(session, input.trade as TradeRecord, input.currentPrice);
      return result;
    }),

  // Get daily performance
  getDailyPerformance: protectedProcedure
    .input(z.object({ sessionId: z.string(), date: z.string() }))
    .query(async ({ input }) => {
      const session = activeSessions.get(input.sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      const daily = calculateDailyPerformance(session, input.date);
      return daily;
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
      const session = activeSessions.get(input.sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      const monthly = calculateMonthlyPerformance(session, input.month, input.startDate, input.endDate);
      return monthly;
    }),

  // Get validation report
  getValidationReport: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const session = activeSessions.get(input.sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      const report = generateValidationReport(session);
      return report;
    }),

  // Get trade history
  getTradeHistory: protectedProcedure
    .input(z.object({ sessionId: z.string(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const session = activeSessions.get(input.sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      return session.allTrades.slice(-input.limit).reverse();
    }),

  // Get current metrics
  getMetrics: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const session = activeSessions.get(input.sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      const allTrades = session.allTrades;
      const winningTrades = allTrades.filter((t) => (t.pnl || 0) > 0).length;
      const totalTrades = allTrades.length;
      const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;

      // Calculate Sharpe ratio
      const dailyReturns = session.dailyPerformance.map((d) => d.dailyPnLPercent);
      const avgReturn = dailyReturns.length > 0 ? dailyReturns.reduce((a, b) => a + b) / dailyReturns.length : 0;
      const variance =
        dailyReturns.length > 0
          ? dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / dailyReturns.length
          : 0;
      const stdDev = Math.sqrt(variance);
      const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

      // Calculate max drawdown
      let maxDrawdown = 0;
      let peakCapital = session.startingCapital;
      let runningCapital = session.startingCapital;
      for (const trade of allTrades) {
        runningCapital += trade.pnl || 0;
        peakCapital = Math.max(peakCapital, runningCapital);
        const drawdown = (peakCapital - runningCapital) / peakCapital;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }

      // Get today's P&L
      const today = new Date().toISOString().split("T")[0];
      const todayTrades = allTrades.filter((t) => t.date === today);
      const dailyPnL = todayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

      // Calculate monthly return
      const monthlyPnL = allTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
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
    return Array.from(activeSessions.values()).map((session) => ({
      sessionId: session.sessionId,
      startingCapital: session.startingCapital,
      currentCapital: session.currentCapital,
      status: session.status,
      startDate: session.startDate.toISOString(),
      totalTrades: session.allTrades.length,
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
