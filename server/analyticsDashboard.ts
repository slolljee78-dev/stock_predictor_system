/**
 * Advanced Analytics Dashboard
 * Comprehensive performance metrics, charts, and insights
 */

export interface DashboardMetrics {
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  calmarRatio: number;
  winRate: number;
  profitFactor: number;
  expectancy: number;
  recoveryFactor: number;
}

export interface PerformanceChart {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'area' | 'candlestick';
  data: Array<{
    timestamp: Date;
    value: number;
    benchmark?: number;
  }>;
  period: '1d' | '1w' | '1m' | '3m' | '6m' | '1y' | 'all';
}

export interface RiskMetrics {
  volatility: number;
  beta: number;
  correlation: number;
  var95: number; // Value at Risk 95%
  cvar95: number; // Conditional Value at Risk
  downside_deviation: number;
  skewness: number;
  kurtosis: number;
}

export interface TradeAnalysis {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  profitFactor: number;
  expectancy: number;
}

export interface MonthlyReturns {
  month: string;
  return: number;
  trades: number;
  winRate: number;
}

export interface SectorAllocation {
  sector: string;
  allocation: number;
  performance: number;
}

export interface DashboardSummary {
  metrics: DashboardMetrics;
  riskMetrics: RiskMetrics;
  tradeAnalysis: TradeAnalysis;
  monthlyReturns: MonthlyReturns[];
  sectorAllocation: SectorAllocation[];
  topPerformers: Array<{ symbol: string; return: number }>;
  worstPerformers: Array<{ symbol: string; return: number }>;
  recentTrades: Array<{
    symbol: string;
    type: 'buy' | 'sell';
    price: number;
    quantity: number;
    timestamp: Date;
  }>;
}

/**
 * Calculate performance metrics
 */
export function calculateMetrics(returns: number[], riskFreeRate: number = 0.02): DashboardMetrics {
  if (returns.length === 0) {
    return {
      totalReturn: 0,
      annualizedReturn: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      maxDrawdown: 0,
      calmarRatio: 0,
      winRate: 0,
      profitFactor: 0,
      expectancy: 0,
      recoveryFactor: 0,
    };
  }

  // Calculate total return
  const totalReturn = returns.reduce((a, b) => a + b, 0);

  // Calculate annualized return
  const annualizedReturn = (Math.pow(1 + totalReturn, 252 / returns.length) - 1) * 100;

  // Calculate volatility (standard deviation)
  const mean = totalReturn / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance) * Math.sqrt(252);

  // Calculate Sharpe Ratio
  const sharpeRatio = (annualizedReturn - riskFreeRate * 100) / (volatility * 100);

  // Calculate downside deviation (for Sortino)
  const downsideReturns = returns.filter((r) => r < 0);
  const downsideVariance = downsideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / returns.length;
  const downsideDeviation = Math.sqrt(downsideVariance) * Math.sqrt(252);
  const sortinoRatio = (annualizedReturn - riskFreeRate * 100) / (downsideDeviation * 100);

  // Calculate max drawdown
  let maxDrawdown = 0;
  let peak = 1;
  for (const ret of returns) {
    peak = Math.max(peak, peak * (1 + ret));
    const drawdown = (peak - peak * (1 + ret)) / peak;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  // Calculate Calmar Ratio
  const calmarRatio = maxDrawdown > 0 ? annualizedReturn / (maxDrawdown * 100) : 0;

  // Calculate win rate
  const winningReturns = returns.filter((r) => r > 0).length;
  const winRate = (winningReturns / returns.length) * 100;

  // Calculate profit factor
  const totalWins = returns.filter((r) => r > 0).reduce((a, b) => a + b, 0);
  const totalLosses = Math.abs(returns.filter((r) => r < 0).reduce((a, b) => a + b, 0));
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0;

  // Calculate expectancy
  const avgWin = totalWins / Math.max(winningReturns, 1);
  const avgLoss = totalLosses / Math.max(returns.length - winningReturns, 1);
  const expectancy = avgWin * (winRate / 100) - avgLoss * ((100 - winRate) / 100);

  // Calculate recovery factor
  const totalProfit = totalWins - totalLosses;
  const recoveryFactor = maxDrawdown > 0 ? totalProfit / (maxDrawdown * 100) : 0;

  return {
    totalReturn: totalReturn * 100,
    annualizedReturn,
    sharpeRatio,
    sortinoRatio,
    maxDrawdown: maxDrawdown * 100,
    calmarRatio,
    winRate,
    profitFactor,
    expectancy,
    recoveryFactor,
  };
}

/**
 * Calculate risk metrics
 */
export function calculateRiskMetrics(returns: number[], benchmarkReturns: number[]): RiskMetrics {
  if (returns.length === 0) {
    return {
      volatility: 0,
      beta: 0,
      correlation: 0,
      var95: 0,
      cvar95: 0,
      downside_deviation: 0,
      skewness: 0,
      kurtosis: 0,
    };
  }

  // Volatility
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance);

  // Beta (correlation with benchmark)
  const benchmarkMean = benchmarkReturns.reduce((a, b) => a + b, 0) / benchmarkReturns.length;
  const covariance = returns.reduce((sum, r, i) => sum + (r - mean) * (benchmarkReturns[i] - benchmarkMean), 0) / returns.length;
  const benchmarkVariance = benchmarkReturns.reduce((sum, r) => sum + Math.pow(r - benchmarkMean, 2), 0) / benchmarkReturns.length;
  const beta = benchmarkVariance > 0 ? covariance / benchmarkVariance : 0;

  // Correlation
  const correlation = covariance / (volatility * Math.sqrt(benchmarkVariance));

  // Value at Risk (95%)
  const sortedReturns = [...returns].sort((a, b) => a - b);
  const var95Index = Math.floor(returns.length * 0.05);
  const var95 = sortedReturns[var95Index];

  // Conditional Value at Risk (average of worst 5%)
  const cvar95 = sortedReturns.slice(0, var95Index + 1).reduce((a, b) => a + b, 0) / (var95Index + 1);

  // Downside deviation
  const downsideReturns = returns.filter((r) => r < 0);
  const downsideVariance = downsideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / returns.length;
  const downside_deviation = Math.sqrt(downsideVariance);

  // Skewness
  const skewness = returns.reduce((sum, r) => sum + Math.pow(r - mean, 3), 0) / (returns.length * Math.pow(volatility, 3));

  // Kurtosis
  const kurtosis = returns.reduce((sum, r) => sum + Math.pow(r - mean, 4), 0) / (returns.length * Math.pow(volatility, 4)) - 3;

  return {
    volatility: volatility * 100,
    beta,
    correlation,
    var95: var95 * 100,
    cvar95: cvar95 * 100,
    downside_deviation: downside_deviation * 100,
    skewness,
    kurtosis,
  };
}

/**
 * Generate performance chart data
 */
export function generatePerformanceChart(
  returns: Array<{ date: Date; value: number }>,
  benchmarkReturns?: Array<{ date: Date; value: number }>,
  period: '1d' | '1w' | '1m' | '3m' | '6m' | '1y' | 'all' = '1y'
): PerformanceChart {
  const chartData = returns.map((r) => ({
    timestamp: r.date,
    value: r.value,
    benchmark: benchmarkReturns?.find((b) => b.date === r.date)?.value,
  }));

  return {
    id: `chart-${Date.now()}`,
    title: 'Portfolio Performance',
    type: 'line',
    data: chartData,
    period,
  };
}

/**
 * Analyze trades
 */
export function analyzeTrades(trades: Array<{ type: 'buy' | 'sell'; price: number; quantity: number; pnl: number }>): TradeAnalysis {
  const closedTrades = trades.filter((t) => t.pnl !== undefined);

  if (closedTrades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      averageWin: 0,
      averageLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      profitFactor: 0,
      expectancy: 0,
    };
  }

  const winningTrades = closedTrades.filter((t) => t.pnl > 0);
  const losingTrades = closedTrades.filter((t) => t.pnl < 0);

  const winRate = (winningTrades.length / closedTrades.length) * 100;
  const averageWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length : 0;
  const averageLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length) : 0;
  const largestWin = Math.max(...winningTrades.map((t) => t.pnl), 0);
  const largestLoss = Math.abs(Math.min(...losingTrades.map((t) => t.pnl), 0));

  // Consecutive wins/losses
  let consecutiveWins = 0;
  let consecutiveLosses = 0;
  let maxConsecutiveWins = 0;
  let maxConsecutiveLosses = 0;

  for (const trade of closedTrades) {
    if (trade.pnl > 0) {
      consecutiveWins++;
      consecutiveLosses = 0;
      maxConsecutiveWins = Math.max(maxConsecutiveWins, consecutiveWins);
    } else {
      consecutiveLosses++;
      consecutiveWins = 0;
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, consecutiveLosses);
    }
  }

  const totalWins = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
  const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0;
  const expectancy = averageWin * (winRate / 100) - averageLoss * ((100 - winRate) / 100);

  return {
    totalTrades: closedTrades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate,
    averageWin,
    averageLoss,
    largestWin,
    largestLoss,
    consecutiveWins: maxConsecutiveWins,
    consecutiveLosses: maxConsecutiveLosses,
    profitFactor,
    expectancy,
  };
}

/**
 * Generate analytics report
 */
export function generateAnalyticsReport(summary: DashboardSummary): string {
  const { metrics, riskMetrics, tradeAnalysis } = summary;

  const report = `
# Advanced Analytics Report

## Performance Metrics
- **Total Return:** ${metrics.totalReturn.toFixed(2)}%
- **Annualized Return:** ${metrics.annualizedReturn.toFixed(2)}%
- **Sharpe Ratio:** ${metrics.sharpeRatio.toFixed(2)}
- **Sortino Ratio:** ${metrics.sortinoRatio.toFixed(2)}
- **Max Drawdown:** ${metrics.maxDrawdown.toFixed(2)}%
- **Calmar Ratio:** ${metrics.calmarRatio.toFixed(2)}

## Risk Metrics
- **Volatility:** ${riskMetrics.volatility.toFixed(2)}%
- **Beta:** ${riskMetrics.beta.toFixed(2)}
- **Correlation to Benchmark:** ${riskMetrics.correlation.toFixed(2)}
- **Value at Risk (95%):** ${riskMetrics.var95.toFixed(2)}%
- **Downside Deviation:** ${riskMetrics.downside_deviation.toFixed(2)}%
- **Skewness:** ${riskMetrics.skewness.toFixed(2)}
- **Kurtosis:** ${riskMetrics.kurtosis.toFixed(2)}

## Trade Analysis
- **Total Trades:** ${tradeAnalysis.totalTrades}
- **Winning Trades:** ${tradeAnalysis.winningTrades} (${tradeAnalysis.winRate.toFixed(2)}%)
- **Losing Trades:** ${tradeAnalysis.losingTrades}
- **Average Win:** $${tradeAnalysis.averageWin.toFixed(2)}
- **Average Loss:** $${tradeAnalysis.averageLoss.toFixed(2)}
- **Largest Win:** $${tradeAnalysis.largestWin.toFixed(2)}
- **Largest Loss:** $${tradeAnalysis.largestLoss.toFixed(2)}
- **Profit Factor:** ${tradeAnalysis.profitFactor.toFixed(2)}
- **Expectancy:** $${tradeAnalysis.expectancy.toFixed(2)}

## Top Performers
${summary.topPerformers.map((p) => `- ${p.symbol}: ${p.return.toFixed(2)}%`).join('\n')}

## Worst Performers
${summary.worstPerformers.map((p) => `- ${p.symbol}: ${p.return.toFixed(2)}%`).join('\n')}
`;

  return report;
}
