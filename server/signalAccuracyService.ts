/**
 * Signal Accuracy Tracking Service
 * Tracks signal performance and accuracy metrics
 */

import { getDb } from './db';
import { signals, stocks, users, alerts } from '../drizzle/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

export interface SignalAccuracyMetrics {
  totalSignals: number;
  buySignals: number;
  sellSignals: number;
  winningSignals: number;
  losingSignals: number;
  winRate: number;
  averageConfidence: number;
  bestPerformingStock: string;
  worstPerformingStock: string;
  averageReturnPerSignal: number;
  totalReturnGenerated: number;
  profitableSignals: number;
  unprofitableSignals: number;
  neutralSignals: number;
}

export interface SignalPerformance {
  id: number;
  ticker: string;
  signalType: 'buy' | 'sell';
  entryPrice: number;
  exitPrice?: number;
  confidence: number;
  returnPercent?: number;
  status: 'active' | 'triggered' | 'expired';
  createdAt: Date;
  closedAt?: Date;
}

/**
 * Get signal accuracy metrics for a user
 */
export async function getSignalAccuracyMetrics(
  userId: number,
  daysBack: number = 30
): Promise<SignalAccuracyMetrics> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  // Get all signals for the user in the time period
  const userSignals = await db
    .select({
      id: signals.id,
      type: signals.type,
      confidenceScore: signals.confidenceScore,
      priceAtSignal: signals.priceAtSignal,
      status: signals.status,
      ticker: stocks.ticker,
      createdAt: signals.createdAt,
    })
    .from(signals)
    .innerJoin(stocks, eq(signals.stockId, stocks.id))
    .innerJoin(alerts, eq(signals.id, alerts.signalId))
    .where(
      and(
        eq(alerts.userId, userId),
        gte(signals.createdAt, startDate)
      )
    )
    .orderBy(desc(signals.createdAt));

  // Calculate metrics
  const totalSignals = userSignals.length;
  const buySignals = userSignals.filter(s => s.type === 'buy').length;
  const sellSignals = userSignals.filter(s => s.type === 'sell').length;
  const triggeredSignals = userSignals.filter(s => s.status === 'triggered').length;
  const expiredSignals = userSignals.filter(s => s.status === 'expired').length;
  const activeSignals = userSignals.filter(s => s.status === 'active').length;

  const winRate = totalSignals > 0 ? Math.round((triggeredSignals / totalSignals) * 100) : 0;
  const averageConfidence = totalSignals > 0
    ? Math.round(userSignals.reduce((sum, s) => sum + s.confidenceScore, 0) / totalSignals)
    : 0;

  // Group by ticker to find best/worst performers
  const tickerPerformance = new Map<string, { wins: number; losses: number }>();
  userSignals.forEach(signal => {
    const current = tickerPerformance.get(signal.ticker) || { wins: 0, losses: 0 };
    if (signal.status === 'triggered') current.wins++;
    if (signal.status === 'expired') current.losses++;
    tickerPerformance.set(signal.ticker, current);
  });
  let bestPerformingStock = 'N/A';
  let worstPerformingStock = 'N/A';
  let bestWinRate = -1;
  let worstWinRate = 101;

  tickerPerformance.forEach((perf, ticker) => {
    const rate = perf.wins + perf.losses > 0
      ? (perf.wins / (perf.wins + perf.losses)) * 100
      : 0;
    if (rate > bestWinRate) {
      bestWinRate = rate;
      bestPerformingStock = ticker;
    }
    if (rate < worstWinRate) {
      worstWinRate = rate;
      worstPerformingStock = ticker;
    }
  });

  // Estimate returns (simplified)
  const averageReturnPerSignal = winRate > 0 ? (winRate - (100 - winRate) * 0.5) / 100 : 0;
  const totalReturnGenerated = averageReturnPerSignal * totalSignals;

  return {
    totalSignals,
    buySignals,
    sellSignals,
    winningSignals: triggeredSignals,
    losingSignals: expiredSignals,
    winRate,
    averageConfidence,
    bestPerformingStock,
    worstPerformingStock,
    averageReturnPerSignal: Math.round(averageReturnPerSignal * 100) / 100,
    totalReturnGenerated: Math.round(totalReturnGenerated * 100) / 100,
    profitableSignals: triggeredSignals,
    unprofitableSignals: expiredSignals,
    neutralSignals: activeSignals,
  };
}

/**
 * Get signal performance details
 */
export async function getSignalPerformanceDetails(
  userId: number,
  limit: number = 50
): Promise<SignalPerformance[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const data = await db
    .select({
      id: signals.id,
      type: signals.type,
      priceAtSignal: signals.priceAtSignal,
      confidenceScore: signals.confidenceScore,
      status: signals.status,
      ticker: stocks.ticker,
      createdAt: signals.createdAt,
    })
    .from(signals)
    .innerJoin(stocks, eq(signals.stockId, stocks.id))
    .innerJoin(alerts, eq(signals.id, alerts.signalId))
    .where(eq(alerts.userId, userId))
    .orderBy(desc(signals.createdAt))
    .limit(limit);

  return data.map(row => ({
    id: row.id,
    ticker: row.ticker,
    signalType: row.type as 'buy' | 'sell',
    entryPrice: row.priceAtSignal / 100,
    confidence: row.confidenceScore,
    status: row.status as 'active' | 'triggered' | 'expired',
    createdAt: row.createdAt,
  }));
}

/**
 * Get accuracy trends over time
 */
export async function getAccuracyTrends(
  userId: number,
  daysBack: number = 90
): Promise<Array<{ date: string; winRate: number; totalSignals: number }>> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const data = await db
    .select({
      type: signals.type,
      status: signals.status,
      createdAt: signals.createdAt,
    })
    .from(signals)
    .innerJoin(alerts, eq(signals.id, alerts.signalId))
    .where(
      and(
        eq(alerts.userId, userId),
        gte(signals.createdAt, startDate)
      )
    )
    .orderBy(signals.createdAt);

  // Group by date
  const trends = new Map<string, { wins: number; total: number }>();

  data.forEach(signal => {
    const date = new Date(signal.createdAt).toISOString().split('T')[0];
    const current = trends.get(date) || { wins: 0, total: 0 };
    current.total++;
    if (signal.status === 'triggered') current.wins++;
    trends.set(date, current);
  });

  // Convert to array
  return Array.from(trends.entries())
    .map(([date, { wins, total }]) => ({
      date,
      winRate: Math.round((wins / total) * 100),
      totalSignals: total,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Get confidence score distribution
 */
export async function getConfidenceDistribution(
  userId: number,
  daysBack: number = 30
): Promise<Array<{ range: string; count: number; winRate: number }>> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const data = await db
    .select({
      confidenceScore: signals.confidenceScore,
      status: signals.status,
    })
    .from(signals)
    .innerJoin(alerts, eq(signals.id, alerts.signalId))
    .where(
      and(
        eq(alerts.userId, userId),
        gte(signals.createdAt, startDate)
      )
    );

  // Group by confidence ranges
  const ranges = {
    '80-100': { count: 0, wins: 0 },
    '60-79': { count: 0, wins: 0 },
    '40-59': { count: 0, wins: 0 },
    '0-39': { count: 0, wins: 0 },
  };

  data.forEach(signal => {
    const conf = signal.confidenceScore;
    let range: keyof typeof ranges;

    if (conf >= 80) range = '80-100';
    else if (conf >= 60) range = '60-79';
    else if (conf >= 40) range = '40-59';
    else range = '0-39';

    ranges[range].count++;
    if (signal.status === 'triggered') ranges[range].wins++;
  });

  return Object.entries(ranges).map(([range, { count, wins }]) => ({
    range,
    count,
    winRate: count > 0 ? Math.round((wins / count) * 100) : 0,
  }));
}
