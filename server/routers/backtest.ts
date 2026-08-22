/**
 * Backtesting Router
 * tRPC procedures for running and managing backtests
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { runBacktestSimulation, runBacktestWithDividends } from '../backtestEngine';
import { getDb } from '../db';
import { backtestRuns, backtestTrades } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { MarketData } from '../realMarketDataFetcher';

/**
 * Generate sample historical data for backtesting
 * In production, this would fetch real historical OHLCV data from an API
 */
function generateSampleHistoricalData(startDate: Date, endDate: Date): MarketData[] {
  const data: MarketData[] = [];
  const current = new Date(startDate);
  let price = 100; // Starting price

  while (current < endDate) {
    // Skip weekends
    if (current.getDay() !== 0 && current.getDay() !== 6) {
      // Generate realistic OHLCV data with trend
      const dailyChange = (Math.random() - 0.48) * 4; // Slight upward bias
      const open = price;
      const close = price * (1 + dailyChange / 100);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = Math.floor(Math.random() * 5000000) + 1000000;

      data.push({
        timestamp: new Date(current),
        open,
        high,
        low,
        close,
        volume,
      });

      price = close;
    }

    current.setDate(current.getDate() + 1);
  }

  return data;
}

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
        initialCapital: String(input.initialCapital),
        stockIds: JSON.stringify(input.stockIds),
        filterSettings: JSON.stringify(input.filterSettings),
        finalCapital: String(input.initialCapital),
        totalReturn: '0',
        winRate: '0',
        sharpeRatio: '0',
        maxDrawdown: '0',
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
        .where(and(eq(backtestRuns.id, input.backtestId), eq(backtestRuns.userId, userId)))
        .limit(1);

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
        run,
        trades,
      };
    }),

  /**
   * List all backtests for the current user
   */
  listBacktests: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().positive().default(20),
        offset: z.number().int().nonnegative().default(0),
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
        .where(and(eq(backtestRuns.id, input.backtestId), eq(backtestRuns.userId, userId)))
        .limit(1);

      if (runs.length === 0) {
        throw new Error('Backtest not found');
      }

      // Delete trades first
      await db.delete(backtestTrades).where(eq(backtestTrades.backtestRunId, input.backtestId));

      // Delete backtest run
      await db.delete(backtestRuns).where(eq(backtestRuns.id, input.backtestId));

      return { success: true };
    }),

  /**
   * Compare multiple backtests
   */
  compareBacktests: protectedProcedure
    .input(
      z.object({
        backtestIds: z.array(z.number()).min(2).max(5),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const runs = await db
        .select()
        .from(backtestRuns)
        .where(and(eq(backtestRuns.userId, userId)));

      const filtered = runs.filter(r => input.backtestIds.includes(r.id));

      if (filtered.length !== input.backtestIds.length) {
        throw new Error('One or more backtests not found');
      }

      return filtered;
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

      // Fetch backtest run
      const runs = await db
        .select()
        .from(backtestRuns)
        .where(and(eq(backtestRuns.id, input.backtestId), eq(backtestRuns.userId, userId)))
        .limit(1);

      if (runs.length === 0) {
        throw new Error('Backtest not found');
      }

      const run = runs[0];

      // Fetch trades
      const trades = await db
        .select()
        .from(backtestTrades)
        .where(eq(backtestTrades.backtestRunId, input.backtestId));

      // Generate CSV
      const headers = [
        'Entry Date',
        'Entry Price',
        'Exit Date',
        'Exit Price',
        'Quantity',
        'Type',
        'Profit/Loss',
        'Return %',
        'Exit Reason',
        'Signal Confidence',
      ];

      const rows = trades.map(t => [
        t.entryDate?.toISOString() || '',
        t.entryPrice || 0,
        t.exitDate?.toISOString() || '',
        t.exitPrice || 0,
        t.quantity || 0,
        t.type || '',
        t.profitLoss || 0,
        t.returnPercent || 0,
        t.exitReason || '',
        t.signalConfidence || 0,
      ]);

      const csvContent = [
        `Backtest Results: ${run.name}`,
        `Start Date: ${run.startDate}`,
        `End Date: ${run.endDate}`,
        `Initial Capital: $${run.initialCapital}`,
        `Final Capital: $${run.finalCapital}`,
        `Total Return: ${run.totalReturn}%`,
        `Win Rate: ${run.winRate}%`,
        `Sharpe Ratio: ${run.sharpeRatio}`,
        `Max Drawdown: ${run.maxDrawdown}%`,
        '',
        headers.join(','),
        ...rows.map(r => r.join(',')),
      ].join('\n');

      return {
        filename: `backtest-${input.backtestId}-${Date.now()}.csv`,
        content: csvContent,
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

    // Generate sample historical data
    const historicalData = generateSampleHistoricalData(config.startDate, config.endDate);

    if (historicalData.length < 20) {
      throw new Error('Insufficient historical data for backtest');
    }

    // Build a realistic dividend schedule for the backtest period
    // Quarterly dividends at ~2% annual yield (0.5% per quarter) on starting price $100
    const dividendSchedule = [];
    const current = new Date(config.startDate);
    while (current < config.endDate) {
      dividendSchedule.push({ exDate: current.toISOString().split('T')[0], amount: 0.50 });
      current.setMonth(current.getMonth() + 3); // quarterly
    }

    // Run dividend-aware backtest simulation
    const results = await runBacktestWithDividends(
      historicalData,
      { dividends: dividendSchedule },
      config.initialCapital,
      0.02,   // Risk per trade (2%)
      0.0005, // Slippage
      0.001,  // Commission
      true    // Reinvest dividends
    );

    // Update backtest run with real results (including dividend metrics in notes)
    const dividendNote = results.dividendEvents > 0
      ? ` | Dividends: $${results.totalDividendIncome.toFixed(2)} (${results.dividendEvents} events)`
      : '';

    await db
      .update(backtestRuns)
      .set({
        finalCapital: Math.round(results.totalProfit + config.initialCapital).toString(),
        totalReturn: (Math.round(results.totalReturnWithDividends * 100) / 100).toString(),
        winRate: (Math.round(results.winRate * 100) / 100).toString(),
        sharpeRatio: (Math.round(results.sharpeRatio * 100) / 100).toString(),
        maxDrawdown: (Math.round(results.maxDrawdown * 100) / 100).toString(),
        totalTrades: results.totalTrades,
        winningTrades: results.winningTrades,
        avgWin: Math.round(results.averageWin).toString(),
        avgLoss: Math.round(results.averageLoss).toString(),
        profitFactor: (Math.round(results.profitFactor * 100) / 100).toString(),
        status: 'completed',
        completedAt: new Date(),
        errorMessage: dividendNote || null, // repurpose for informational note
      })
      .where(eq(backtestRuns.id, backtestId));

    // Insert actual trades from backtest results
    for (const trade of results.trades) {
      await db.insert(backtestTrades).values({
        backtestRunId: backtestId,
        stockId: config.stockIds[0], // Use first stock ID
        type: trade.type === 'BUY' ? 'buy' : 'sell',
        entryDate: trade.entryTime,
        entryPrice: (Math.round(trade.entryPrice * 100) / 100).toString(),
        exitDate: trade.exitTime,
        exitPrice: (Math.round(trade.exitPrice * 100) / 100).toString(),
        quantity: Math.floor(trade.quantity),
        profitLoss: Math.round(trade.profit).toString(),
        returnPercent: (Math.round(trade.profitPercent * 100) / 100).toString(),
        exitReason: trade.profit > 0 ? 'take-profit' : 'stop-loss',
        signalConfidence: Math.floor(trade.confidence),
      });
    }

    console.log(`[Backtest] Completed backtest ${backtestId} with ${results.totalTrades} trades`);
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
