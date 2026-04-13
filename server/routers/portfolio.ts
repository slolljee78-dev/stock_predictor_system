/**
 * Portfolio Router
 * tRPC procedures for portfolio tracking and performance
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { calculatePortfolioMetrics, getUserPortfolioMetrics } from "../portfolioService";

// Mock trades storage (in production, use database)
const userTrades = new Map<number, any[]>();

export const portfolioRouter = router({
  /**
   * Get portfolio metrics
   */
  getMetrics: protectedProcedure.query(async ({ ctx }) => {
    try {
      const trades = userTrades.get(ctx.user.id) || [];
      const metrics = calculatePortfolioMetrics(trades);
      return { success: true, data: metrics };
    } catch (error) {
      console.error("[Portfolio] Failed to get metrics:", error);
      return { success: false, error: "Failed to fetch portfolio metrics" };
    }
  }),

  /**
   * Add a new trade
   */
  addTrade: protectedProcedure
    .input(
      z.object({
        ticker: z.string().min(1).max(10),
        entryPrice: z.number().min(0.01),
        quantity: z.number().min(0.01),
        type: z.enum(["buy", "sell"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const trades = userTrades.get(ctx.user.id) || [];
        const newTrade = {
          id: Date.now(),
          ...input,
          entryDate: new Date(),
          status: "open",
        };
        trades.push(newTrade);
        userTrades.set(ctx.user.id, trades);
        return { success: true, data: newTrade };
      } catch (error) {
        console.error("[Portfolio] Failed to add trade:", error);
        return { success: false, error: "Failed to add trade" };
      }
    }),

  /**
   * Close a trade
   */
  closeTrade: protectedProcedure
    .input(
      z.object({
        tradeId: z.number(),
        exitPrice: z.number().min(0.01),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const trades = userTrades.get(ctx.user.id) || [];
        const trade = trades.find(t => t.id === input.tradeId);
        
        if (!trade) {
          return { success: false, error: "Trade not found" };
        }

        trade.exitPrice = input.exitPrice;
        trade.exitDate = new Date();
        trade.status = "closed";
        trade.returnAmount = (input.exitPrice - trade.entryPrice) * trade.quantity;
        trade.returnPercent = ((input.exitPrice - trade.entryPrice) / trade.entryPrice) * 100;

        userTrades.set(ctx.user.id, trades);
        return { success: true, data: trade };
      } catch (error) {
        console.error("[Portfolio] Failed to close trade:", error);
        return { success: false, error: "Failed to close trade" };
      }
    }),

  /**
   * Get all trades
   */
  getTrades: protectedProcedure
    .input(
      z.object({
        status: z.enum(["open", "closed", "all"]).default("all"),
        limit: z.number().min(1).max(500).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        let trades = userTrades.get(ctx.user.id) || [];
        
        if (input.status !== "all") {
          trades = trades.filter(t => t.status === input.status);
        }

        trades = trades.slice(0, input.limit);
        return { success: true, data: trades };
      } catch (error) {
        console.error("[Portfolio] Failed to get trades:", error);
        return { success: false, error: "Failed to fetch trades" };
      }
    }),

  /**
   * Delete a trade
   */
  deleteTrade: protectedProcedure
    .input(z.object({ tradeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        let trades = userTrades.get(ctx.user.id) || [];
        trades = trades.filter(t => t.id !== input.tradeId);
        userTrades.set(ctx.user.id, trades);
        return { success: true };
      } catch (error) {
        console.error("[Portfolio] Failed to delete trade:", error);
        return { success: false, error: "Failed to delete trade" };
      }
    }),
});
