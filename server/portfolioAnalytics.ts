/**
 * Portfolio Analytics & Comparison
 * Advanced analytics, benchmarking, and performance attribution
 */

export interface PortfolioMetrics {
  totalValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  riskRewardRatio: number;
}

export interface BenchmarkComparison {
  portfolioReturn: number;
  benchmarkReturn: number;
  outperformance: number;
  alpha: number;
  beta: number;
  correlation: number;
}

export interface PerformanceAttribution {
  stockName: string;
  contribution: number;
  contributionPercent: number;
  weight: number;
  return: number;
}

export interface PortfolioSnapshot {
  date: Date;
  value: number;
  cash: number;
  positions: Array<{
    ticker: string;
    quantity: number;
    price: number;
    value: number;
  }>;
}

/**
 * Calculate portfolio metrics
 */
export function calculatePortfolioMetrics(
  snapshots: PortfolioSnapshot[],
  trades: Array<{ entryPrice: number; exitPrice: number; quantity: number; profit: number }>
): PortfolioMetrics {
  if (snapshots.length < 2) {
    return getEmptyMetrics();
  }

  const startValue = snapshots[0].value;
  const endValue = snapshots[snapshots.length - 1].value;
  const totalReturn = endValue - startValue;
  const totalReturnPercent = (totalReturn / startValue) * 100;

  // Calculate annualized return
  const daysHeld = (snapshots[snapshots.length - 1].date.getTime() - snapshots[0].date.getTime()) / (1000 * 60 * 60 * 24);
  const yearsHeld = daysHeld / 365;
  const annualizedReturn = Math.pow(endValue / startValue, 1 / yearsHeld) - 1;

  // Calculate Sharpe ratio
  const dailyReturns = calculateDailyReturns(snapshots);
  const sharpeRatio = calculateSharpeRatio(dailyReturns);

  // Calculate max drawdown
  const maxDrawdown = calculateMaxDrawdown(snapshots);

  // Calculate win rate and profit factor
  const winningTrades = trades.filter((t) => t.profit > 0);
  const losingTrades = trades.filter((t) => t.profit < 0);
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
  const totalWins = winningTrades.reduce((sum, t) => sum + t.profit, 0);
  const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0));
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;

  // Calculate average win/loss
  const averageWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
  const averageLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;
  const riskRewardRatio = averageLoss > 0 ? averageWin / averageLoss : averageWin > 0 ? Infinity : 0;

  return {
    totalValue: endValue,
    totalReturn,
    totalReturnPercent,
    annualizedReturn: annualizedReturn * 100,
    sharpeRatio,
    maxDrawdown,
    winRate,
    profitFactor,
    averageWin,
    averageLoss,
    riskRewardRatio,
  };
}

/**
 * Compare portfolio to benchmark (S&P 500)
 */
export function compareToBenchmark(
  portfolioSnapshots: PortfolioSnapshot[],
  benchmarkSnapshots: PortfolioSnapshot[]
): BenchmarkComparison {
  if (portfolioSnapshots.length < 2 || benchmarkSnapshots.length < 2) {
    return getEmptyBenchmarkComparison();
  }

  const portfolioReturn =
    ((portfolioSnapshots[portfolioSnapshots.length - 1].value - portfolioSnapshots[0].value) /
      portfolioSnapshots[0].value) *
    100;
  const benchmarkReturn =
    ((benchmarkSnapshots[benchmarkSnapshots.length - 1].value - benchmarkSnapshots[0].value) /
      benchmarkSnapshots[0].value) *
    100;

  const outperformance = portfolioReturn - benchmarkReturn;

  // Calculate alpha and beta
  const portfolioReturns = calculateDailyReturns(portfolioSnapshots);
  const benchmarkReturns = calculateDailyReturns(benchmarkSnapshots);

  const { alpha, beta } = calculateAlphaBeta(portfolioReturns, benchmarkReturns);
  const correlation = calculateCorrelation(portfolioReturns, benchmarkReturns);

  return {
    portfolioReturn,
    benchmarkReturn,
    outperformance,
    alpha,
    beta,
    correlation,
  };
}

/**
 * Calculate performance attribution by stock
 */
export function calculatePerformanceAttribution(
  positions: Array<{
    ticker: string;
    quantity: number;
    entryPrice: number;
    currentPrice: number;
  }>,
  totalPortfolioValue: number
): PerformanceAttribution[] {
  return positions.map((position) => {
    const positionValue = position.quantity * position.currentPrice;
    const positionReturn = position.quantity * (position.currentPrice - position.entryPrice);
    const weight = (positionValue / totalPortfolioValue) * 100;
    const returnPercent = ((position.currentPrice - position.entryPrice) / position.entryPrice) * 100;
    const contribution = (weight / 100) * returnPercent;

    return {
      stockName: position.ticker,
      contribution,
      contributionPercent: contribution,
      weight,
      return: returnPercent,
    };
  });
}

/**
 * Generate portfolio comparison report
 */
export function generateComparisonReport(
  portfolioName: string,
  metrics: PortfolioMetrics,
  benchmarkComparison: BenchmarkComparison,
  attribution: PerformanceAttribution[]
): string {
  const report = `
# Portfolio Comparison Report: ${portfolioName}

## Performance Summary
- **Total Return**: ${metrics.totalReturnPercent.toFixed(2)}%
- **Annualized Return**: ${metrics.annualizedReturn.toFixed(2)}%
- **Sharpe Ratio**: ${metrics.sharpeRatio.toFixed(2)}
- **Max Drawdown**: ${metrics.maxDrawdown.toFixed(2)}%

## Benchmark Comparison (vs S&P 500)
- **Portfolio Return**: ${benchmarkComparison.portfolioReturn.toFixed(2)}%
- **Benchmark Return**: ${benchmarkComparison.benchmarkReturn.toFixed(2)}%
- **Outperformance**: ${benchmarkComparison.outperformance.toFixed(2)}%
- **Alpha**: ${benchmarkComparison.alpha.toFixed(2)}
- **Beta**: ${benchmarkComparison.beta.toFixed(2)}
- **Correlation**: ${benchmarkComparison.correlation.toFixed(2)}

## Trade Statistics
- **Win Rate**: ${metrics.winRate.toFixed(2)}%
- **Profit Factor**: ${metrics.profitFactor.toFixed(2)}
- **Average Win**: $${metrics.averageWin.toFixed(2)}
- **Average Loss**: $${metrics.averageLoss.toFixed(2)}
- **Risk/Reward Ratio**: ${metrics.riskRewardRatio.toFixed(2)}

## Performance Attribution (Top Contributors)
${attribution
  .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
  .slice(0, 10)
  .map((a) => `- **${a.stockName}**: ${a.contribution.toFixed(2)}% contribution (${a.return.toFixed(2)}% return)`)
  .join('\n')}

## Recommendations
${generateRecommendations(metrics, benchmarkComparison)}
`;

  return report;
}

// Private helper functions

function calculateDailyReturns(snapshots: PortfolioSnapshot[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < snapshots.length; i++) {
    const dailyReturn = (snapshots[i].value - snapshots[i - 1].value) / snapshots[i - 1].value;
    returns.push(dailyReturn);
  }
  return returns;
}

function calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.02): number {
  if (returns.length === 0) return 0;

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;

  const annualizedReturn = mean * 252;
  const annualizedStdDev = stdDev * Math.sqrt(252);

  return (annualizedReturn - riskFreeRate) / annualizedStdDev;
}

function calculateMaxDrawdown(snapshots: PortfolioSnapshot[]): number {
  let maxDrawdown = 0;
  let peak = snapshots[0].value;

  for (const snapshot of snapshots) {
    if (snapshot.value > peak) {
      peak = snapshot.value;
    }
    const drawdown = ((peak - snapshot.value) / peak) * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return maxDrawdown;
}

function calculateAlphaBeta(
  portfolioReturns: number[],
  benchmarkReturns: number[]
): { alpha: number; beta: number } {
  const n = Math.min(portfolioReturns.length, benchmarkReturns.length);
  if (n === 0) return { alpha: 0, beta: 0 };

  const portfolioMean = portfolioReturns.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const benchmarkMean = benchmarkReturns.slice(0, n).reduce((a, b) => a + b, 0) / n;

  let covariance = 0;
  let benchmarkVariance = 0;

  for (let i = 0; i < n; i++) {
    covariance += (portfolioReturns[i] - portfolioMean) * (benchmarkReturns[i] - benchmarkMean);
    benchmarkVariance += Math.pow(benchmarkReturns[i] - benchmarkMean, 2);
  }

  covariance /= n;
  benchmarkVariance /= n;

  const beta = benchmarkVariance !== 0 ? covariance / benchmarkVariance : 0;
  const alpha = portfolioMean - beta * benchmarkMean;

  return { alpha: alpha * 252, beta };
}

function calculateCorrelation(returns1: number[], returns2: number[]): number {
  const n = Math.min(returns1.length, returns2.length);
  if (n === 0) return 0;

  const mean1 = returns1.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const mean2 = returns2.slice(0, n).reduce((a, b) => a + b, 0) / n;

  let covariance = 0;
  let variance1 = 0;
  let variance2 = 0;

  for (let i = 0; i < n; i++) {
    const diff1 = returns1[i] - mean1;
    const diff2 = returns2[i] - mean2;
    covariance += diff1 * diff2;
    variance1 += Math.pow(diff1, 2);
    variance2 += Math.pow(diff2, 2);
  }

  const stdDev1 = Math.sqrt(variance1 / n);
  const stdDev2 = Math.sqrt(variance2 / n);

  if (stdDev1 === 0 || stdDev2 === 0) return 0;

  return (covariance / n) / (stdDev1 * stdDev2);
}

function generateRecommendations(metrics: PortfolioMetrics, benchmarkComparison: BenchmarkComparison): string {
  const recommendations: string[] = [];

  if (metrics.sharpeRatio < 1) {
    recommendations.push('- Improve risk-adjusted returns by diversifying positions');
  }

  if (metrics.maxDrawdown > 10) {
    recommendations.push('- Consider implementing tighter stop-losses to reduce maximum drawdown');
  }

  if (metrics.winRate < 50) {
    recommendations.push('- Focus on improving signal quality and entry/exit timing');
  }

  if (benchmarkComparison.outperformance < 0) {
    recommendations.push('- Portfolio is underperforming benchmark; review strategy effectiveness');
  }

  if (metrics.profitFactor < 1.5) {
    recommendations.push('- Increase profit factor by improving win rate or average win size');
  }

  if (recommendations.length === 0) {
    recommendations.push('- Portfolio is performing well; continue current strategy');
  }

  return recommendations.join('\n');
}

function getEmptyMetrics(): PortfolioMetrics {
  return {
    totalValue: 0,
    totalReturn: 0,
    totalReturnPercent: 0,
    annualizedReturn: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    winRate: 0,
    profitFactor: 0,
    averageWin: 0,
    averageLoss: 0,
    riskRewardRatio: 0,
  };
}

function getEmptyBenchmarkComparison(): BenchmarkComparison {
  return {
    portfolioReturn: 0,
    benchmarkReturn: 0,
    outperformance: 0,
    alpha: 0,
    beta: 0,
    correlation: 0,
  };
}
