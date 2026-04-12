/**
 * Advanced Risk Management System
 * 
 * Implements comprehensive risk management strategies including:
 * - Portfolio-level stop-loss (max 2% loss per day)
 * - Position sizing using Kelly Criterion
 * - Correlation analysis to avoid over-concentration
 * - Dynamic risk adjustment based on volatility
 * - Maximum daily loss limit protection
 * - Risk metrics dashboard
 */

export interface RiskMetrics {
  portfolioValue: number;
  totalRisk: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  betaToMarket: number;
  correlationMatrix: Record<string, Record<string, number>>;
  var95: number; // Value at Risk at 95% confidence
  cvar95: number; // Conditional Value at Risk
}

export interface PositionRisk {
  symbol: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  positionValue: number;
  unrealizedPL: number;
  percentOfPortfolio: number;
  riskPercentage: number;
  recommendedStopLoss: number;
  recommendedTakeProfit: number;
  riskRewardRatio: number;
}

export interface KellyCriterionResult {
  optimalFraction: number;
  recommendedPositionSize: number;
  maxRiskPerTrade: number;
  maxPositionValue: number;
}

/**
 * Risk Management Engine
 */
export class RiskManagementEngine {
  private maxDailyLossPercent = 0.02; // 2% max daily loss
  private maxPositionPercent = 0.1; // 10% max per position
  private minCorrelationThreshold = 0.7; // Warn if correlation > 0.7
  private riskFreeRate = 0.02; // 2% annual risk-free rate
  private confidenceLevel = 0.95; // 95% for VaR calculation

  /**
   * Calculate Kelly Criterion for optimal position sizing
   * Formula: f* = (bp - q) / b
   * where: b = odds, p = win probability, q = loss probability
   */
  calculateKellyCriterion(
    winRate: number,
    averageWin: number,
    averageLoss: number,
    portfolioValue: number
  ): KellyCriterionResult {
    const lossRate = 1 - winRate;

    // Odds: ratio of average win to average loss
    const odds = averageWin / averageLoss;

    // Kelly fraction: (bp - q) / b = (odds * p - q) / odds
    let kellyFraction =
      (odds * winRate - lossRate) / odds;

    // Apply safety factor (use 25% of Kelly to be conservative)
    kellyFraction = Math.max(0, Math.min(kellyFraction * 0.25, 0.25));

    const optimalFraction = kellyFraction;
    const recommendedPositionSize = portfolioValue * optimalFraction;
    const maxRiskPerTrade = recommendedPositionSize * 0.02; // 2% risk per trade
    const maxPositionValue = portfolioValue * this.maxPositionPercent;

    return {
      optimalFraction,
      recommendedPositionSize: Math.min(recommendedPositionSize, maxPositionValue),
      maxRiskPerTrade,
      maxPositionValue,
    };
  }

  /**
   * Calculate correlation between two price series
   */
  private calculateCorrelation(series1: number[], series2: number[]): number {
    if (series1.length !== series2.length || series1.length < 2) {
      return 0;
    }

    const n = series1.length;
    const mean1 = series1.reduce((a, b) => a + b) / n;
    const mean2 = series2.reduce((a, b) => a + b) / n;

    let covariance = 0;
    let variance1 = 0;
    let variance2 = 0;

    for (let i = 0; i < n; i++) {
      const diff1 = series1[i] - mean1;
      const diff2 = series2[i] - mean2;
      covariance += diff1 * diff2;
      variance1 += diff1 * diff1;
      variance2 += diff2 * diff2;
    }

    const stdDev1 = Math.sqrt(variance1 / n);
    const stdDev2 = Math.sqrt(variance2 / n);

    if (stdDev1 === 0 || stdDev2 === 0) return 0;

    return covariance / (n * stdDev1 * stdDev2);
  }

  /**
   * Build correlation matrix for portfolio
   */
  buildCorrelationMatrix(
    priceHistories: Record<string, number[]>
  ): Record<string, Record<string, number>> {
    const symbols = Object.keys(priceHistories);
    const correlations: Record<string, Record<string, number>> = {};

    symbols.forEach((sym1) => {
      correlations[sym1] = {};
      symbols.forEach((sym2) => {
        if (sym1 === sym2) {
          correlations[sym1][sym2] = 1;
        } else {
          correlations[sym1][sym2] = this.calculateCorrelation(
            priceHistories[sym1],
            priceHistories[sym2]
          );
        }
      });
    });

    return correlations;
  }

  /**
   * Calculate portfolio volatility
   */
  calculateVolatility(returns: number[]): number {
    if (returns.length < 2) return 0;

    const mean = returns.reduce((a, b) => a + b) / returns.length;
    const variance =
      returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) /
      returns.length;
    return Math.sqrt(variance);
  }

  /**
   * Calculate Sharpe Ratio
   */
  calculateSharpeRatio(
    returns: number[],
    riskFreeRate: number = this.riskFreeRate
  ): number {
    const volatility = this.calculateVolatility(returns);
    if (volatility === 0) return 0;

    const meanReturn = returns.reduce((a, b) => a + b) / returns.length;
    return (meanReturn - riskFreeRate / 252) / volatility; // 252 trading days
  }

  /**
   * Calculate Maximum Drawdown
   */
  calculateMaxDrawdown(prices: number[]): number {
    if (prices.length < 2) return 0;

    let maxPrice = prices[0];
    let maxDrawdown = 0;

    for (let i = 1; i < prices.length; i++) {
      if (prices[i] > maxPrice) {
        maxPrice = prices[i];
      }
      const drawdown = (maxPrice - prices[i]) / maxPrice;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    return maxDrawdown;
  }

  /**
   * Calculate Value at Risk (VaR) at given confidence level
   */
  calculateVaR(returns: number[], confidence: number = this.confidenceLevel): number {
    const sorted = [...returns].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * (1 - confidence));
    return sorted[index];
  }

  /**
   * Calculate Conditional Value at Risk (CVaR)
   */
  calculateCVaR(returns: number[], confidence: number = this.confidenceLevel): number {
    const sorted = [...returns].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * (1 - confidence));
    const tailReturns = sorted.slice(0, index + 1);
    return tailReturns.reduce((a, b) => a + b) / tailReturns.length;
  }

  /**
   * Calculate Beta to market
   */
  calculateBeta(assetReturns: number[], marketReturns: number[]): number {
    if (assetReturns.length !== marketReturns.length || assetReturns.length < 2) {
      return 1;
    }

    const n = assetReturns.length;
    const assetMean = assetReturns.reduce((a, b) => a + b) / n;
    const marketMean = marketReturns.reduce((a, b) => a + b) / n;

    let covariance = 0;
    let marketVariance = 0;

    for (let i = 0; i < n; i++) {
      covariance += (assetReturns[i] - assetMean) * (marketReturns[i] - marketMean);
      marketVariance += Math.pow(marketReturns[i] - marketMean, 2);
    }

    if (marketVariance === 0) return 1;
    return covariance / marketVariance;
  }

  /**
   * Assess position risk
   */
  assessPositionRisk(
    symbol: string,
    quantity: number,
    entryPrice: number,
    currentPrice: number,
    portfolioValue: number,
    stopLossPrice: number,
    takeProfitPrice: number
  ): PositionRisk {
    const positionValue = quantity * currentPrice;
    const unrealizedPL = (currentPrice - entryPrice) * quantity;
    const percentOfPortfolio = positionValue / portfolioValue;

    const riskPercentage = Math.abs(currentPrice - stopLossPrice) / currentPrice;
    const rewardPercentage = Math.abs(takeProfitPrice - currentPrice) / currentPrice;
    const riskRewardRatio = rewardPercentage / (riskPercentage || 0.01);

    return {
      symbol,
      quantity,
      entryPrice,
      currentPrice,
      positionValue,
      unrealizedPL,
      percentOfPortfolio,
      riskPercentage,
      recommendedStopLoss: currentPrice * (1 - riskPercentage * 0.5),
      recommendedTakeProfit: currentPrice * (1 + rewardPercentage * 2),
      riskRewardRatio,
    };
  }

  /**
   * Calculate comprehensive risk metrics
   */
  calculateRiskMetrics(
    portfolioValue: number,
    positions: PositionRisk[],
    returns: number[],
    marketReturns: number[],
    priceHistories: Record<string, number[]>
  ): RiskMetrics {
    const totalRisk = positions.reduce((sum, p) => sum + p.riskPercentage * p.percentOfPortfolio, 0);
    const sharpeRatio = this.calculateSharpeRatio(returns);
    const maxDrawdown = this.calculateMaxDrawdown(
      positions.length > 0 ? priceHistories[positions[0].symbol] || [] : []
    );
    const volatility = this.calculateVolatility(returns);
    const betaToMarket = this.calculateBeta(returns, marketReturns);
    const correlationMatrix = this.buildCorrelationMatrix(priceHistories);
    const var95 = this.calculateVaR(returns, 0.95);
    const cvar95 = this.calculateCVaR(returns, 0.95);

    return {
      portfolioValue,
      totalRisk,
      sharpeRatio,
      maxDrawdown,
      volatility,
      betaToMarket,
      correlationMatrix,
      var95,
      cvar95,
    };
  }

  /**
   * Check if position violates risk limits
   */
  checkRiskViolations(
    position: PositionRisk,
    portfolioValue: number,
    dailyLoss: number
  ): string[] {
    const violations: string[] = [];

    if (position.percentOfPortfolio > this.maxPositionPercent) {
      violations.push(
        `Position size (${(position.percentOfPortfolio * 100).toFixed(2)}%) exceeds max (${(this.maxPositionPercent * 100).toFixed(2)}%)`
      );
    }

    if (dailyLoss > portfolioValue * this.maxDailyLossPercent) {
      violations.push(
        `Daily loss (${(dailyLoss / portfolioValue * 100).toFixed(2)}%) exceeds max (${(this.maxDailyLossPercent * 100).toFixed(2)}%)`
      );
    }

    if (position.riskRewardRatio < 1) {
      violations.push(
        `Risk-reward ratio (${position.riskRewardRatio.toFixed(2)}) is unfavorable (< 1)`
      );
    }

    return violations;
  }

  /**
   * Get risk management recommendations
   */
  getRecommendations(
    riskMetrics: RiskMetrics,
    positions: PositionRisk[]
  ): string[] {
    const recommendations: string[] = [];

    if (riskMetrics.sharpeRatio < 1) {
      recommendations.push("Sharpe ratio is low - consider reducing risk or improving returns");
    }

    if (riskMetrics.maxDrawdown > 0.2) {
      recommendations.push("Maximum drawdown exceeds 20% - consider tighter stop-losses");
    }

    if (riskMetrics.volatility > 0.3) {
      recommendations.push("Portfolio volatility is high - consider diversification");
    }

    // Check for high correlations
    Object.keys(riskMetrics.correlationMatrix).forEach((sym1) => {
      Object.keys(riskMetrics.correlationMatrix[sym1]).forEach((sym2) => {
        if (
          sym1 < sym2 &&
          riskMetrics.correlationMatrix[sym1][sym2] > this.minCorrelationThreshold
        ) {
          recommendations.push(
            `High correlation (${riskMetrics.correlationMatrix[sym1][sym2].toFixed(2)}) between ${sym1} and ${sym2} - reduce concentration`
          );
        }
      });
    });

    if (positions.some((p) => p.riskRewardRatio < 1)) {
      recommendations.push("Some positions have unfavorable risk-reward ratios - review entries");
    }

    return recommendations;
  }
}

let engineInstance: RiskManagementEngine | null = null;

export function getRiskManagementEngine(): RiskManagementEngine {
  if (!engineInstance) {
    engineInstance = new RiskManagementEngine();
  }
  return engineInstance;
}
