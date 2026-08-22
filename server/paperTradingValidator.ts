/**
 * Paper Trading Validation Engine
 * Runs 3-month validation with live prices to prove 10% monthly returns
 * Target: £100 → £110 → £121 → £133.10 with 2% daily loss limit
 */

import { calculateCommission, calculateSlippage, DEFAULT_CONFIG, SimulatorConfig } from "./simulatorEngine";

export interface ValidationConfig {
  startingCapital: number; // £100
  monthlyTarget: number; // 10% = 0.10
  dailyLossLimit: number; // 2% = 0.02
  minWinRate: number; // 60% = 0.60
  minSharpeRatio: number; // 1.0
  maxDrawdown: number; // 5% = 0.05
  validationDurationDays: number; // 90 days
}

export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  startingCapital: 100,
  monthlyTarget: 0.10,
  dailyLossLimit: 0.02,
  minWinRate: 0.60,
  minSharpeRatio: 1.0,
  maxDrawdown: 0.05,
  validationDurationDays: 90,
};

export interface DailyPerformance {
  date: string;
  openingCapital: number;
  closingCapital: number;
  dailyPnL: number;
  dailyPnLPercent: number;
  trades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  maxDailyDrawdown: number;
  riskLimitHit: boolean;
}

export interface MonthlyPerformance {
  month: number;
  startDate: string;
  endDate: string;
  openingCapital: number;
  closingCapital: number;
  monthlyReturn: number;
  monthlyReturnPercent: number;
  targetReturn: number;
  targetMet: boolean;
  totalTrades: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  daysRiskLimitHit: number;
}

export interface ValidationReport {
  validationPeriod: {
    startDate: string;
    endDate: string;
    durationDays: number;
  };
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  totalReturnPercent: number;
  monthlyPerformance: MonthlyPerformance[];
  overallMetrics: {
    totalTrades: number;
    winRate: number;
    sharpeRatio: number;
    maxDrawdown: number;
    profitFactor: number;
    averageWinSize: number;
    averageLossSize: number;
  };
  validationStatus: "PASSED" | "FAILED" | "IN_PROGRESS";
  passedCriteria: string[];
  failedCriteria: string[];
  recommendations: string[];
}

export interface PaperTradingSession {
  sessionId: string;
  startDate: Date;
  startingCapital: number;
  currentCapital: number;
  dailyPerformance: DailyPerformance[];
  monthlyPerformance: MonthlyPerformance[];
  allTrades: TradeRecord[];
  config: ValidationConfig;
  status: "ACTIVE" | "PAUSED" | "COMPLETED";
}

export interface TradeRecord {
  tradeId: string;
  date: string;
  time: string;
  ticker: string;
  type: "BUY" | "SELL";
  quantity: number;
  entryPrice: number;
  executionPrice: number;
  commission: number;
  totalCost: number;
  pnl?: number;
  pnlPercent?: number;
  signal: {
    confidence: number;
    type: string;
    reason: string;
  };
}

/**
 * Initialize a new paper trading validation session
 */
export function initializePaperTradingSession(
  config: ValidationConfig = DEFAULT_VALIDATION_CONFIG
): PaperTradingSession {
  return {
    sessionId: `validation-${Date.now()}`,
    startDate: new Date(),
    startingCapital: config.startingCapital,
    currentCapital: config.startingCapital,
    dailyPerformance: [],
    monthlyPerformance: [],
    allTrades: [],
    config,
    status: "ACTIVE",
  };
}

/**
 * Record a trade in the validation session
 */
export function recordTrade(
  session: PaperTradingSession,
  trade: TradeRecord,
  currentPrice: number
): { success: boolean; message: string; newCapital?: number } {
  // Check daily loss limit
  const today = new Date().toISOString().split("T")[0];
  const todayTrades = session.allTrades.filter((t) => t.date === today);
  const todayPnL = todayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const potentialDailyLoss = todayPnL + (trade.pnl || 0);
  const dailyLossPercent = Math.abs(potentialDailyLoss) / session.startingCapital;

  if (dailyLossPercent > session.config.dailyLossLimit) {
    return {
      success: false,
      message: `Daily loss limit (${session.config.dailyLossLimit * 100}%) would be exceeded. Current daily loss: ${(dailyLossPercent * 100).toFixed(2)}%`,
    };
  }

  // Record the trade
  session.allTrades.push(trade);

  // Update capital
  const tradeImpact = trade.type === "BUY" ? -trade.totalCost : trade.totalCost;
  session.currentCapital += tradeImpact;

  return {
    success: true,
    message: `Trade recorded successfully`,
    newCapital: session.currentCapital,
  };
}

/**
 * Calculate daily performance metrics
 */
export function calculateDailyPerformance(
  session: PaperTradingSession,
  date: string
): DailyPerformance {
  const dayTrades = session.allTrades.filter((t) => t.date === date);
  const winningTrades = dayTrades.filter((t) => (t.pnl || 0) > 0).length;
  const losingTrades = dayTrades.filter((t) => (t.pnl || 0) < 0).length;
  const totalTrades = dayTrades.length;
  const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;

  const dailyPnL = dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const openingCapital = session.startingCapital;
  const closingCapital = openingCapital + dailyPnL;
  const dailyPnLPercent = dailyPnL / openingCapital;

  // Calculate max drawdown for the day
  let maxDailyDrawdown = 0;
  let runningCapital = openingCapital;
  for (const trade of dayTrades) {
    runningCapital += trade.pnl || 0;
    const drawdown = Math.max(0, (openingCapital - runningCapital) / openingCapital);
    maxDailyDrawdown = Math.max(maxDailyDrawdown, drawdown);
  }

  return {
    date,
    openingCapital,
    closingCapital,
    dailyPnL,
    dailyPnLPercent,
    trades: totalTrades,
    winningTrades,
    losingTrades,
    winRate,
    maxDailyDrawdown,
    riskLimitHit: Math.abs(dailyPnLPercent) > session.config.dailyLossLimit,
  };
}

/**
 * Calculate monthly performance metrics
 */
export function calculateMonthlyPerformance(
  session: PaperTradingSession,
  month: number,
  startDate: string,
  endDate: string
): MonthlyPerformance {
  const monthTrades = session.allTrades.filter((t) => t.date >= startDate && t.date <= endDate);
  const winningTrades = monthTrades.filter((t) => (t.pnl || 0) > 0).length;
  const totalTrades = monthTrades.length;
  const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;

  const monthPnL = monthTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const openingCapital = session.startingCapital * Math.pow(1 + session.config.monthlyTarget, month - 1);
  const closingCapital = openingCapital + monthPnL;
  const monthlyReturn = monthPnL;
  const monthlyReturnPercent = monthPnL / openingCapital;

  // Calculate Sharpe ratio (simplified: daily returns std dev)
  const dailyReturns = session.dailyPerformance
    .filter((d) => d.date >= startDate && d.date <= endDate)
    .map((d) => d.dailyPnLPercent);
  const avgReturn = dailyReturns.length > 0 ? dailyReturns.reduce((a, b) => a + b) / dailyReturns.length : 0;
  const variance =
    dailyReturns.length > 0
      ? dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / dailyReturns.length
      : 0;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0; // Annualized

  // Calculate max drawdown
  let maxDrawdown = 0;
  let peakCapital = openingCapital;
  let runningCapital = openingCapital;
  for (const trade of monthTrades) {
    runningCapital += trade.pnl || 0;
    peakCapital = Math.max(peakCapital, runningCapital);
    const drawdown = (peakCapital - runningCapital) / peakCapital;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  const targetReturn = openingCapital * session.config.monthlyTarget;
  const targetMet = monthlyReturn >= targetReturn;

  const riskLimitHits = session.dailyPerformance
    .filter((d) => d.date >= startDate && d.date <= endDate && d.riskLimitHit).length;

  return {
    month,
    startDate,
    endDate,
    openingCapital,
    closingCapital,
    monthlyReturn,
    monthlyReturnPercent,
    targetReturn,
    targetMet,
    totalTrades,
    winRate,
    sharpeRatio,
    maxDrawdown,
    daysRiskLimitHit: riskLimitHits,
  };
}

/**
 * Generate final validation report
 */
export function generateValidationReport(session: PaperTradingSession): ValidationReport {
  const totalReturn = session.currentCapital - session.startingCapital;
  const totalReturnPercent = totalReturn / session.startingCapital;

  // Collect all metrics
  const allTrades = session.allTrades;
  const winningTrades = allTrades.filter((t) => (t.pnl || 0) > 0).length;
  const totalTrades = allTrades.length;
  const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;

  // Calculate profit factor
  const totalWins = allTrades
    .filter((t) => (t.pnl || 0) > 0)
    .reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalLosses = Math.abs(
    allTrades
      .filter((t) => (t.pnl || 0) < 0)
      .reduce((sum, t) => sum + (t.pnl || 0), 0)
  );
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;

  // Calculate average win/loss
  const avgWinSize = winningTrades > 0 ? totalWins / winningTrades : 0;
  const losingTrades = allTrades.filter((t) => (t.pnl || 0) < 0).length;
  const avgLossSize = losingTrades > 0 ? totalLosses / losingTrades : 0;

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

  // Check validation criteria
  const passedCriteria: string[] = [];
  const failedCriteria: string[] = [];

  if (totalReturnPercent >= session.config.monthlyTarget * 3) {
    passedCriteria.push(`3-month return target: ${(totalReturnPercent * 100).toFixed(2)}% ≥ ${(session.config.monthlyTarget * 3 * 100).toFixed(2)}%`);
  } else {
    failedCriteria.push(`3-month return target: ${(totalReturnPercent * 100).toFixed(2)}% < ${(session.config.monthlyTarget * 3 * 100).toFixed(2)}%`);
  }

  if (winRate >= session.config.minWinRate) {
    passedCriteria.push(`Win rate: ${(winRate * 100).toFixed(2)}% ≥ ${(session.config.minWinRate * 100).toFixed(2)}%`);
  } else {
    failedCriteria.push(`Win rate: ${(winRate * 100).toFixed(2)}% < ${(session.config.minWinRate * 100).toFixed(2)}%`);
  }

  if (sharpeRatio >= session.config.minSharpeRatio) {
    passedCriteria.push(`Sharpe ratio: ${sharpeRatio.toFixed(2)} ≥ ${session.config.minSharpeRatio.toFixed(2)}`);
  } else {
    failedCriteria.push(`Sharpe ratio: ${sharpeRatio.toFixed(2)} < ${session.config.minSharpeRatio.toFixed(2)}`);
  }

  if (maxDrawdown <= session.config.maxDrawdown) {
    passedCriteria.push(`Max drawdown: ${(maxDrawdown * 100).toFixed(2)}% ≤ ${(session.config.maxDrawdown * 100).toFixed(2)}%`);
  } else {
    failedCriteria.push(`Max drawdown: ${(maxDrawdown * 100).toFixed(2)}% > ${(session.config.maxDrawdown * 100).toFixed(2)}%`);
  }

  const recommendations: string[] = [];
  if (winRate < session.config.minWinRate) {
    recommendations.push("Improve signal quality - current win rate is below target");
  }
  if (maxDrawdown > session.config.maxDrawdown) {
    recommendations.push("Tighten risk management - drawdown exceeds acceptable limits");
  }
  if (sharpeRatio < session.config.minSharpeRatio) {
    recommendations.push("Increase risk-adjusted returns - Sharpe ratio is too low");
  }
  if (failedCriteria.length === 0) {
    recommendations.push("System is ready for real capital trading - all validation criteria met!");
  }

  const validationStatus = failedCriteria.length === 0 ? "PASSED" : "FAILED";

  return {
    validationPeriod: {
      startDate: session.startDate.toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      durationDays: Math.floor((Date.now() - session.startDate.getTime()) / (1000 * 60 * 60 * 24)),
    },
    initialCapital: session.startingCapital,
    finalCapital: session.currentCapital,
    totalReturn,
    totalReturnPercent,
    monthlyPerformance: session.monthlyPerformance,
    overallMetrics: {
      totalTrades,
      winRate,
      sharpeRatio,
      maxDrawdown,
      profitFactor,
      averageWinSize: avgWinSize,
      averageLossSize: avgLossSize,
    },
    validationStatus,
    passedCriteria,
    failedCriteria,
    recommendations,
  };
}
