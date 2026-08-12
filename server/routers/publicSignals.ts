/**
 * Public signals router — no auth required.
 * Powers the /signals/today page and public /stocks/:ticker pages.
 */

import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { signals, stocks } from "../../drizzle/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export const publicSignalsRouter = router({
  /**
   * Get today's signals (last 24 hours), joined with stock ticker.
   * Confidence scores are returned as-is; the frontend caps display for guests.
   */
  getToday: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      // Return empty array when DB is unavailable
      return [];
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const rows = await db
      .select({
        id: signals.id,
        ticker: stocks.ticker,
        stockName: stocks.name,
        type: signals.type,
        confidenceScore: signals.confidenceScore,
        priceAtSignal: signals.priceAtSignal,
        analysis: signals.analysis,
        status: signals.status,
        createdAt: signals.createdAt,
      })
      .from(signals)
      .innerJoin(stocks, eq(signals.stockId, stocks.id))
      .where(gte(signals.createdAt, since))
      .orderBy(desc(signals.confidenceScore), desc(signals.createdAt))
      .limit(50);

    return rows;
  }),

  /**
   * Get recent signals for a specific ticker (public, last 30 days, limit 20).
   */
  getForTicker: publicProcedure
    .input(z.string().min(1).max(10))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { stock: null, signals: [] };

      const ticker = input.toUpperCase();

      const stock = await db.query.stocks.findFirst({
        where: eq(stocks.ticker, ticker),
      });

      if (!stock) return { stock: null, signals: [] };

      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const rows = await db
        .select({
          id: signals.id,
          type: signals.type,
          confidenceScore: signals.confidenceScore,
          priceAtSignal: signals.priceAtSignal,
          analysis: signals.analysis,
          status: signals.status,
          createdAt: signals.createdAt,
        })
        .from(signals)
        .where(and(eq(signals.stockId, stock.id), gte(signals.createdAt, since)))
        .orderBy(desc(signals.createdAt))
        .limit(20);

      return { stock, signals: rows };
    }),

  /**
   * Get the top 10 most-signalled tickers in the last 7 days.
   * Used by the embeddable widget and the Today's Signals page sidebar.
   */
  getTopTickers: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const rows = await db
      .select({
        ticker: stocks.ticker,
        name: stocks.name,
        signalCount: sql<number>`COUNT(${signals.id})`,
        buyCount: sql<number>`SUM(CASE WHEN ${signals.type} = 'buy' THEN 1 ELSE 0 END)`,
        sellCount: sql<number>`SUM(CASE WHEN ${signals.type} = 'sell' THEN 1 ELSE 0 END)`,
        avgConfidence: sql<number>`AVG(${signals.confidenceScore})`,
        latestSignalType: sql<string>`(SELECT type FROM signals s2 WHERE s2.stockId = ${stocks.id} ORDER BY s2.createdAt DESC LIMIT 1)`,
      })
      .from(signals)
      .innerJoin(stocks, eq(signals.stockId, stocks.id))
      .where(gte(signals.createdAt, since))
      .groupBy(stocks.id, stocks.ticker, stocks.name)
      .orderBy(sql`COUNT(${signals.id}) DESC`)
      .limit(10);

    return rows;
  }),
});
