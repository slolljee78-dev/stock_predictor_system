/**
 * Portfolio Performance Service
 * Tracks user trades and calculates performance metrics
 */

import { getDb } from './db';
import { eq, desc } from 'drizzle-orm';

export interface Trade {
  id: number;
  ticker: string;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  type: 'buy' | 'sell';
  entryDate: Date;
  exitDate?: Date;
  returnPercent?: number;
  returnAmount?: number;
  status: 'open' | 'closed';
  notes?: string;
}

export interface PortfolioMetrics {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalReturn: number;
  totalReturnPercent: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
  currentPortfolioValue: number;
  totalInvested: number;
}

/**
 * Create a new trade entry
 */
export async function createTrade(
  userId: number,
  ticker: string,
  entryPrice: number,
  quantity: number,
  type: 'buy' | 'sell',
  notes?: string
): Promise<Trade> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // For now, we'll store trades in a simple structure
  // In production, you'd want a dedicated trades table
  const trade: Trade = {
    id: Math.random(),
    ticker,
    entryPrice,
    quantity,
    type,
    entryDate: new Date(),
    status: 'open',
    notes,
  };

  return trade;
}

/**
 * Close a trade with exit price
 */
export async function closeTrade(
  tradeId: number,
  exitPrice: number
): Promise<Trade> {
  const trade: Trade = {
    id: tradeId,
    ticker: 'UNKNOWN',
    entryPrice: 0,
    exitPrice,
    quantity: 0,
    type: 'buy',
    entryDate: new Date(),
    exitDate: new Date(),
    status: 'closed',
    returnPercent: 0,
    returnAmount: 0,
  };

  return trade;
}

/**
 * Calculate portfolio metrics
 */
export function calculatePortfolioMetrics(trades: Trade[]): PortfolioMetrics {
  const openTrades = trades.filter(t => t.status === 'open');
  const closedTrades = trades.filter(t => t.status === 'closed');

  // Calculate returns for closed trades
  const closedTradesWithReturns = closedTrades.map(trade => {
    const exitPrice = trade.exitPrice || trade.entryPrice;
    const returnAmount = (exitPrice - trade.entryPrice) * trade.quantity;
    const returnPercent = ((exitPrice - trade.entryPrice) / trade.entryPrice) * 100;

    return {
      ...trade,
      returnAmount,
      returnPercent,
    };
  });

  const winningTrades = closedTradesWithReturns.filter(t => (t.returnAmount || 0) > 0).length;
  const losingTrades = closedTradesWithReturns.filter(t => (t.returnAmount || 0) < 0).length;
  const winRate = closedTrades.length > 0
    ? Math.round((winningTrades / closedTrades.length) * 100)
    : 0;

  // Calculate total returns
  const totalReturn = closedTradesWithReturns.reduce((sum, t) => sum + (t.returnAmount || 0), 0);
  const totalInvested = trades.reduce((sum, t) => sum + (t.entryPrice * t.quantity), 0);
  const totalReturnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  // Calculate average win/loss
  const wins = closedTradesWithReturns
    .filter(t => (t.returnAmount || 0) > 0)
    .map(t => t.returnAmount || 0);
  const losses = closedTradesWithReturns
    .filter(t => (t.returnAmount || 0) < 0)
    .map(t => Math.abs(t.returnAmount || 0));

  const averageWin = wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0;
  const averageLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0;
  const profitFactor = averageLoss > 0 ? (averageWin * winningTrades) / (averageLoss * losingTrades) : 0;

  // Calculate largest win/loss
  const largestWin = wins.length > 0 ? Math.max(...wins) : 0;
  const largestLoss = losses.length > 0 ? Math.max(...losses) : 0;

  // Calculate current portfolio value
  const openTradesValue = openTrades.reduce((sum, t) => sum + (t.entryPrice * t.quantity), 0);
  const closedTradesProfit = closedTradesWithReturns.reduce((sum, t) => sum + (t.returnAmount || 0), 0);
  const currentPortfolioValue = openTradesValue + closedTradesProfit;

  return {
    totalTrades: trades.length,
    openTrades: openTrades.length,
    closedTrades: closedTrades.length,
    winningTrades,
    losingTrades,
    winRate,
    totalReturn: Math.round(totalReturn * 100) / 100,
    totalReturnPercent: Math.round(totalReturnPercent * 100) / 100,
    averageWin: Math.round(averageWin * 100) / 100,
    averageLoss: Math.round(averageLoss * 100) / 100,
    profitFactor: Math.round(profitFactor * 100) / 100,
    largestWin: Math.round(largestWin * 100) / 100,
    largestLoss: Math.round(largestLoss * 100) / 100,
    currentPortfolioValue: Math.round(currentPortfolioValue * 100) / 100,
    totalInvested: Math.round(totalInvested * 100) / 100,
  };
}

/**
 * Get portfolio metrics for a user
 * Note: In production, you'd fetch from database
 */
export async function getUserPortfolioMetrics(userId: number): Promise<PortfolioMetrics> {
  // Placeholder - in production, fetch from database
  const trades: Trade[] = [];
  return calculatePortfolioMetrics(trades);
}
