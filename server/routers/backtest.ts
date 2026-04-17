/**
 * Backtesting Router
 * tRPC procedures for running and managing backtests
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { runBacktestSimulation } from '../backtestEngine';
import { getDb } from '../db';
import { backtestRuns, backtestTrades } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

export const backtestRouter = router({
  /**
   * Start a new backtest run
   */
  startBacktest: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        startDate: z.date(),
        endDate: z.date(),
        initialCapital: z.number().positive(),
        stockIds: z.array(z.number()),
        filterSettings: z.object({
          minConfidence: z.number().min(0).max(100),
          maxVIX: z.number().positive(),
          maxCorrelation: z.number().min(0).max(1),
          maxDailyLoss: z.number().min(0).max(10),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Create backtest run record
      const result = await db.insert(backtestRuns).values({
        userId,
        name: input.name,
        startDate: input.startDate,
        endDate: input.endDate,
        initialCapital: input.initialCapital,
        stockIds: JSON.stringify(input.stockIds),
        filterSettings: JSON.stringify(input.filterSettings),
        finalCapital: input.initialCapital,
        totalReturn: 0,
        winRate: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        status: 'running',
      });

      const backtestId = result[0]?.insertId || 0;

      // Run backtest asynchronously (in production, use a job queue)
      runBacktestAsync(backtestId, userId, input).catch(err => {
        console.error(`Backtest ${backtestId} failed:`, err);
      });

      return {
        backtestId,
        status: 'running',
        message: 'Backtest started. Results will be available shortly.',
      };
    }),

  /**
   * Get backtest results
   */
  getBacktestResults: protectedProcedure
    .input(z.object({ backtestId: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Fetch backtest run
      const runs = await db
        .select()
        .from(backtestRuns)
        .where(and(eq(backtestRuns.id, input.backtestId), eq(backtestRuns.userId, userId)));

      if (runs.length === 0) {
        throw new Error('Backtest not found');
      }

      const run = runs[0];

      // Fetch trades for this backtest
      const trades = await db
        .select()
        .from(backtestTrades)
        .where(eq(backtestTrades.backtestRunId, input.backtestId));

      return {
        backtest: run,
        trades,
        status: run.status,
      };
    }),

  /**
   * List all backtests for user
   */
  listBacktests: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const runs = await db
        .select()
        .from(backtestRuns)
        .where(eq(backtestRuns.userId, userId))
        .orderBy(backtestRuns.createdAt)
        .limit(input.limit)
        .offset(input.offset);

      return runs;
    }),

  /**
   * Delete a backtest
   */
  deleteBacktest: protectedProcedure
    .input(z.object({ backtestId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verify ownership
      const runs = await db
        .select()
        .from(backtestRuns)
        .where(and(eq(backtestRuns.id, input.backtestId), eq(backtestRuns.userId, userId)));

      if (runs.length === 0) {
        throw new Error('Backtest not found');
      }

      // Delete backtest (cascades to trades)
      await db.delete(backtestRuns).where(eq(backtestRuns.id, input.backtestId));

      return { success: true };
    }),

  /**
   * Compare multiple backtests
   */
  compareBacktests: protectedProcedure
    .input(z.object({ backtestIds: z.array(z.number()) }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const runs = await db
        .select()
        .from(backtestRuns)
        .where(eq(backtestRuns.userId, userId));

      // Filter to only requested backtests
      const filteredRuns = runs.filter((r: any) => input.backtestIds.includes(r.id));

      return {
        backtests: filteredRuns,
        comparison: {
          bestReturn: Math.max(...filteredRuns.map((r: any) => r.totalReturn)),
          bestSharpe: Math.max(...filteredRuns.map((r: any) => r.sharpeRatio)),
          bestWinRate: Math.max(...filteredRuns.map((r: any) => r.winRate)),
          avgReturn: filteredRuns.reduce((sum: number, r: any) => sum + r.totalReturn, 0) / filteredRuns.length,
        },
      };
    }),

  /**
   * Export backtest results as CSV
   */
  exportBacktest: protectedProcedure
    .input(z.object({ backtestId: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Fetch backtest and trades
      const runs = await db
        .select()
        .from(backtestRuns)
        .where(and(eq(backtestRuns.id, input.backtestId), eq(backtestRuns.userId, userId)));

      if (runs.length === 0) {
        throw new Error('Backtest not found');
      }

      const trades = await db
        .select()
        .from(backtestTrades)
        .where(eq(backtestTrades.backtestRunId, input.backtestId));

      // Generate CSV
      const csvHeader = 'Ticker,Type,Entry Date,Entry Price,Exit Date,Exit Price,Quantity,Profit/Loss,Return %,Exit Reason,Confidence\n';
      const csvRows = trades
        .map(
          (t: any) =>
            `${t.ticker || 'N/A'},${t.type},${t.entryDate},${t.entryPrice},${t.exitDate},${t.exitPrice},${t.quantity},${t.profitLoss},${t.returnPercent},${t.exitReason},${t.signalConfidence}`
        )
        .join('\n');

      const csv = csvHeader + csvRows;

      return {
        csv,
        filename: `backtest-${input.backtestId}-${new Date().toISOString().split('T')[0]}.csv`,
      };
    }),
});

/**
 * Run backtest asynchronously
 */
async function runBacktestAsync(backtestId: number, userId: number, config: any) {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Simulate backtest run (in production, fetch real historical data)
    const mockResults = {
      totalTrades: Math.floor(Math.random() * 50) + 10,
      winningTrades: Math.floor(Math.random() * 30) + 5,
      winRate: Math.random() * 100,
      totalReturn: Math.random() * 50 - 10,
      sharpeRatio: Math.random() * 2,
      maxDrawdown: Math.random() * 20,
      avgWin: Math.random() * 500 + 100,
      avgLoss: Math.random() * 300 + 50,
      profitFactor: Math.random() * 3,
      finalCapital: config.initialCapital + Math.random() * 10000 - 5000,
      trades: [],
    };

    // Update backtest run with results
    await db
      .update(backtestRuns)
      .set({
        finalCapital: Math.round(mockResults.finalCapital),
        totalReturn: Math.round(mockResults.totalReturn * 100),
        winRate: Math.round(mockResults.winRate),
        sharpeRatio: Math.round(mockResults.sharpeRatio * 100),
        maxDrawdown: Math.round(mockResults.maxDrawdown),
        totalTrades: mockResults.totalTrades,
        winningTrades: mockResults.winningTrades,
        avgWin: Math.round(mockResults.avgWin),
        avgLoss: Math.round(mockResults.avgLoss),
        profitFactor: Math.round(mockResults.profitFactor * 100),
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(backtestRuns.id, backtestId));

    // Insert mock trades
    for (let i = 0; i < mockResults.totalTrades; i++) {
      const isWin = i < mockResults.winningTrades;
      const profitLoss = isWin ? Math.random() * 1000 : -Math.random() * 500;

      await db.insert(backtestTrades).values({
        backtestRunId: backtestId,
        stockId: config.stockIds[Math.floor(Math.random() * config.stockIds.length)],
        type: 'buy',
        entryDate: new Date(config.startDate.getTime() + Math.random() * (config.endDate.getTime() - config.startDate.getTime())),
        entryPrice: Math.round(Math.random() * 30000 + 5000),
        exitDate: new Date(),
        exitPrice: Math.round(Math.random() * 30000 + 5000),
        quantity: Math.floor(Math.random() * 100) + 10,
        profitLoss: Math.round(profitLoss),
        returnPercent: Math.round(Math.random() * 10 - 5),
        exitReason: isWin ? 'take-profit' : 'stop-loss',
        signalConfidence: Math.floor(Math.random() * 40) + 60,
      });
    }
  } catch (error) {
    console.error(`Backtest ${backtestId} error:`, error);
    const db = await getDb();
    if (db) {
      await db
        .update(backtestRuns)
        .set({
          status: 'failed',
          errorMessage: (error as Error).message,
          completedAt: new Date(),
        })
        .where(eq(backtestRuns.id, backtestId));
    }
  }
}
