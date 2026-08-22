/**
 * Phase 4: Risk Management System
 * Implements stop-loss, position sizing, portfolio protection
 */

export interface Position {
  ticker: string;
  shares: number;
  entryPrice: number;
  currentPrice: number;
  entryTime: Date;
}

export interface Portfolio {
  totalCapital: number;
  positions: Position[];
  cash: number;
  dayStartCapital: number;
}

export interface RiskMetrics {
  portfolioValue: number;
  dayPnL: number;
  dayPnLPercent: number;
  maxDrawdown: number;
  sharpeRatio: number;
  riskExposure: number; // 0-1
  correlationRisk: number; // 0-1
  concentration: number; // 0-1
}

export interface PositionSizing {
  maxPositionSize: number; // % of portfolio
  positionSizePercent: number; // % of portfolio for this trade
  shares: number;
  riskAmount: number; // £ at risk
  stopLoss: number;
  takeProfit: number;
}

/**
 * Calculate Kelly Criterion for optimal position sizing
 * Formula: f* = (bp - q) / b
 * where: b = odds, p = win probability, q = loss probability
 */
export function calculateKellyCriterion(
  winProbability: number,
  winRatio: number,
  lossRatio: number = 1
): number {
  // Simplified: assume 1:1 risk/reward
  const q = 1 - winProbability;
  const b = winRatio / lossRatio;

  let kellyCriterion = (b * winProbability - q) / b;

  // Apply safety factor (use 25% of Kelly to be conservative)
  kellyCriterion = kellyCriterion * 0.25;

  // Clamp between 0.5% and 5% of portfolio
  return Math.max(0.005, Math.min(0.05, kellyCriterion));
}

/**
 * Calculate position size based on risk management rules
 */
export function calculatePositionSize(
  portfolio: Portfolio,
  entryPrice: number,
  stopLossPrice: number,
  winProbability: number = 0.6
): PositionSizing {
  const portfolioValue = portfolio.totalCapital + portfolio.positions.reduce((sum, p) => sum + p.shares * p.currentPrice, 0);

  // Risk per trade: 1-2% of portfolio
  const riskPerTrade = portfolioValue * 0.01;

  // Calculate stop loss distance
  const stopLossDistance = Math.abs(entryPrice - stopLossPrice);

  // Calculate shares based on risk
  const shares = Math.floor(riskPerTrade / stopLossDistance);

  // Calculate position size percentage
  const positionValue = shares * entryPrice;
  const positionSizePercent = positionValue / portfolioValue;

  // Apply Kelly Criterion for optimization
  const kellySize = calculateKellyCriterion(winProbability, 1, 1);
  const optimalPositionSize = Math.min(positionSizePercent, kellySize);

  // Calculate take profit (2:1 reward/risk)
  const takeProfit = entryPrice + stopLossDistance * 2;

  return {
    maxPositionSize: 0.1, // 10% max per position
    positionSizePercent: optimalPositionSize,
    shares: Math.floor((optimalPositionSize * portfolioValue) / entryPrice),
    riskAmount: riskPerTrade,
    stopLoss: stopLossPrice,
    takeProfit,
  };
}

/**
 * Check if position should be stopped out
 */
export function checkStopLoss(
  position: Position,
  stopLossPercent: number = 0.02 // 2% stop loss
): { shouldStop: boolean; reason: string } {
  const pnl = (position.currentPrice - position.entryPrice) / position.entryPrice;

  if (pnl < -stopLossPercent) {
    return {
      shouldStop: true,
      reason: `Stop loss triggered: ${(pnl * 100).toFixed(2)}% loss`,
    };
  }

  return {
    shouldStop: false,
    reason: "Position within stop loss threshold",
  };
}

/**
 * Check if position should take profit
 */
export function checkTakeProfit(
  position: Position,
  takeProfitPercent: number = 0.05 // 5% take profit
): { shouldTakeProfit: boolean; reason: string } {
  const pnl = (position.currentPrice - position.entryPrice) / position.entryPrice;

  if (pnl > takeProfitPercent) {
    return {
      shouldTakeProfit: true,
      reason: `Take profit triggered: ${(pnl * 100).toFixed(2)}% gain`,
    };
  }

  return {
    shouldTakeProfit: false,
    reason: "Position below take profit threshold",
  };
}

/**
 * Calculate portfolio risk metrics
 */
export function calculateRiskMetrics(portfolio: Portfolio, historicalValues: number[]): RiskMetrics {
  const positionValue = portfolio.positions.reduce((sum, p) => sum + p.shares * p.currentPrice, 0);
  const currentValue = positionValue + portfolio.cash;

  const dayStartValue = portfolio.dayStartCapital;
  const dayPnL = currentValue - dayStartValue;
  const dayPnLPercent = dayStartValue > 0 ? dayPnL / dayStartValue : 0;

  // Calculate max drawdown
  let maxDrawdown = 0;
  let peak = historicalValues[0] || currentValue;
  for (const value of historicalValues) {
    if (value > peak) peak = value;
    const drawdown = (peak - value) / peak;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  // Calculate Sharpe ratio
  const returns = [];
  for (let i = 1; i < historicalValues.length; i++) {
    returns.push((historicalValues[i] - historicalValues[i - 1]) / historicalValues[i - 1]);
  }
  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length || 0;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length || 0;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? (meanReturn / stdDev) * Math.sqrt(252) : 0;

  // Calculate risk exposure (% of portfolio in positions)
  const riskExposure = positionValue / currentValue;

  // Calculate concentration risk (Herfindahl index)
  let concentrationRisk = 0;
  for (const position of portfolio.positions) {
    const positionPercent = (position.shares * position.currentPrice) / currentValue;
    concentrationRisk += positionPercent * positionPercent;
  }

  // Calculate correlation risk (simplified)
  let correlationRisk = 0;
  if (portfolio.positions.length > 1) {
    // In production, calculate actual correlations
    correlationRisk = Math.min(1, portfolio.positions.length * 0.1);
  }

  return {
    portfolioValue: currentValue,
    dayPnL,
    dayPnLPercent,
    maxDrawdown,
    sharpeRatio,
    riskExposure,
    correlationRisk,
    concentration: concentrationRisk,
  };
}

/**
 * Check portfolio-level risk limits
 */
export function checkPortfolioRiskLimits(
  portfolio: Portfolio,
  dayStartValue: number,
  maxDailyLossPercent: number = 0.02 // 2% max daily loss
): { withinLimits: boolean; violations: string[] } {
  const positionValue = portfolio.positions.reduce((sum, p) => sum + p.shares * p.currentPrice, 0);
  const currentValue = positionValue + portfolio.cash;

  const dayPnL = currentValue - dayStartValue;
  const dayPnLPercent = dayPnL / dayStartValue;

  const violations: string[] = [];

  // Check daily loss limit
  if (dayPnLPercent < -maxDailyLossPercent) {
    violations.push(`Daily loss limit exceeded: ${(dayPnLPercent * 100).toFixed(2)}% loss`);
  }

  // Check position concentration
  for (const position of portfolio.positions) {
    const positionPercent = (position.shares * position.currentPrice) / currentValue;
    if (positionPercent > 0.1) {
      violations.push(`Position concentration too high: ${(positionPercent * 100).toFixed(2)}% in ${position.ticker}`);
    }
  }

  // Check total exposure
  const totalExposure = portfolio.positions.reduce((sum, p) => sum + p.shares * p.currentPrice, 0);
  if (totalExposure > currentValue * 1.5) {
    violations.push(`Total exposure too high: ${((totalExposure / currentValue) * 100).toFixed(2)}% of portfolio`);
  }

  return {
    withinLimits: violations.length === 0,
    violations,
  };
}

/**
 * Suggest portfolio rebalancing
 */
export function suggestRebalancing(portfolio: Portfolio): { shouldRebalance: boolean; actions: string[] } {
  const positionValue = portfolio.positions.reduce((sum, p) => sum + p.shares * p.currentPrice, 0);
  const totalValue = positionValue + portfolio.cash;

  const actions: string[] = [];
  let shouldRebalance = false;

  // Check for positions that have grown too large
  for (const position of portfolio.positions) {
    const positionPercent = (position.shares * position.currentPrice) / totalValue;
    if (positionPercent > 0.15) {
      actions.push(`Reduce ${position.ticker} position: currently ${(positionPercent * 100).toFixed(2)}% of portfolio`);
      shouldRebalance = true;
    }
  }

  // Check for positions that have shrunk too much
  if (portfolio.positions.length < 5 && portfolio.cash > totalValue * 0.3) {
    actions.push("Cash position too high: consider adding new positions");
    shouldRebalance = true;
  }

  return {
    shouldRebalance,
    actions,
  };
}
