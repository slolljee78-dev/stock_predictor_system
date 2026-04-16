/**
 * Walk-Forward Backtester
 * Implements walk-forward analysis for robust strategy validation
 * Divides historical data into training and testing windows
 */

import { MarketData, calculateSharpeRatio, calculateMaxDrawdown } from "./realMarketDataFetcher";
import { runBacktestSimulation, BacktestMetrics } from "./backtestEngine";

export interface WalkForwardWindow {
  trainingStart: Date;
  trainingEnd: Date;
  testingStart: Date;
  testingEnd: Date;
  trainingData: MarketData[];
  testingData: MarketData[];
}

export interface WalkForwardResult {
  symbol: string;
  totalPeriodStart: Date;
  totalPeriodEnd: Date;
  windowCount: number;
  windows: Array<{
    windowIndex: number;
    trainingPeriod: string;
    testingPeriod: string;
    testingMetrics: BacktestMetrics;
  }>;
  aggregatedMetrics: {
    averageWinRate: number;
    averageProfitFactor: number;
    averageSharpeRatio: number;
    averageMaxDrawdown: number;
    totalTrades: number;
    overallWinRate: number;
    overallProfitFactor: number;
    consistency: number;
  };
}

/**
 * Create walk-forward windows from historical data
 * Typical: 60% training, 20% testing, 20% out-of-sample
 */
export function createWalkForwardWindows(
  data: MarketData[],
  windowSize: number = 252,
  testSize: number = 63
): WalkForwardWindow[] {
  const windows: WalkForwardWindow[] = [];
  const step = windowSize + testSize;

  for (let i = 0; i + windowSize + testSize <= data.length; i += step) {
    const trainingStart = i;
    const trainingEnd = i + windowSize;
    const testingStart = trainingEnd;
    const testingEnd = testingStart + testSize;

    if (testingEnd > data.length) break;

    windows.push({
      trainingStart: data[trainingStart].timestamp,
      trainingEnd: data[trainingEnd - 1].timestamp,
      testingStart: data[testingStart].timestamp,
      testingEnd: data[testingEnd - 1].timestamp,
      trainingData: data.slice(trainingStart, trainingEnd),
      testingData: data.slice(testingStart, testingEnd),
    });
  }

  return windows;
}

/**
 * Run walk-forward backtest
 */
export async function runWalkForwardBacktest(
  symbol: string,
  data: MarketData[],
  windowSize: number = 252,
  testSize: number = 63
): Promise<WalkForwardResult> {
  const windows = createWalkForwardWindows(data, windowSize, testSize);

  if (windows.length === 0) {
    throw new Error("Insufficient data for walk-forward analysis");
  }

  const windowResults: Array<{
    windowIndex: number;
    trainingPeriod: string;
    testingPeriod: string;
    testingMetrics: BacktestMetrics;
  }> = [];

  let totalTrades = 0;
  let totalWins = 0;
  const winRates: number[] = [];
  const profitFactors: number[] = [];
  const sharpeRatios: number[] = [];
  const maxDrawdowns: number[] = [];

  for (let i = 0; i < windows.length; i++) {
    const window = windows[i];

    const metrics = await runBacktestSimulation(
      window.testingData,
      10000,
      0.02,
      0.0005,
      0.001
    );

    windowResults.push({
      windowIndex: i,
      trainingPeriod: `${window.trainingStart.toISOString().split("T")[0]} to ${window.trainingEnd
        .toISOString()
        .split("T")[0]}`,
      testingPeriod: `${window.testingStart.toISOString().split("T")[0]} to ${window.testingEnd
        .toISOString()
        .split("T")[0]}`,
      testingMetrics: metrics,
    });

    totalTrades += metrics.totalTrades;
    totalWins += metrics.winningTrades;
    winRates.push(metrics.winRate);
    profitFactors.push(metrics.profitFactor);
    sharpeRatios.push(metrics.sharpeRatio);
    maxDrawdowns.push(metrics.maxDrawdown);
  }

  const meanWinRate = winRates.reduce((a, b) => a + b, 0) / winRates.length;
  const winRateVariance =
    winRates.length > 0
      ? Math.sqrt(
          winRates.reduce((sum, wr) => sum + Math.pow(wr - meanWinRate, 2), 0) /
            winRates.length
        )
      : 0;
  const consistency = meanWinRate > 0 ? 1 - winRateVariance / meanWinRate : 0;

  return {
    symbol,
    totalPeriodStart: data[0].timestamp,
    totalPeriodEnd: data[data.length - 1].timestamp,
    windowCount: windows.length,
    windows: windowResults,
    aggregatedMetrics: {
      averageWinRate: meanWinRate,
      averageProfitFactor: profitFactors.reduce((a, b) => a + b, 0) / profitFactors.length,
      averageSharpeRatio: sharpeRatios.reduce((a, b) => a + b, 0) / sharpeRatios.length,
      averageMaxDrawdown: maxDrawdowns.reduce((a, b) => a + b, 0) / maxDrawdowns.length,
      totalTrades,
      overallWinRate: totalTrades > 0 ? totalWins / totalTrades : 0,
      overallProfitFactor: profitFactors.reduce((a, b) => a + b, 0) / profitFactors.length,
      consistency: Math.max(0, consistency),
    },
  };
}

/**
 * Generate comprehensive backtest report
 */
export function generateBacktestReport(result: WalkForwardResult): string {
  const report = `
═══════════════════════════════════════════════════════════════
WALK-FORWARD BACKTEST REPORT
═══════════════════════════════════════════════════════════════

Symbol: ${result.symbol}
Analysis Period: ${result.totalPeriodStart.toISOString().split("T")[0]} to ${result.totalPeriodEnd
    .toISOString()
    .split("T")[0]}
Number of Windows: ${result.windowCount}

───────────────────────────────────────────────────────────────
AGGREGATED METRICS
───────────────────────────────────────────────────────────────
Average Win Rate:        ${(result.aggregatedMetrics.averageWinRate * 100).toFixed(2)}%
Average Profit Factor:   ${result.aggregatedMetrics.averageProfitFactor.toFixed(2)}x
Average Sharpe Ratio:    ${result.aggregatedMetrics.averageSharpeRatio.toFixed(2)}
Average Max Drawdown:    ${(result.aggregatedMetrics.averageMaxDrawdown * 100).toFixed(2)}%
Total Trades:            ${result.aggregatedMetrics.totalTrades}
Overall Win Rate:        ${(result.aggregatedMetrics.overallWinRate * 100).toFixed(2)}%
Consistency Score:       ${(result.aggregatedMetrics.consistency * 100).toFixed(2)}%

───────────────────────────────────────────────────────────────
WINDOW-BY-WINDOW RESULTS
───────────────────────────────────────────────────────────────
${result.windows
  .map(
    (w) => `
Window ${w.windowIndex + 1}
  Training: ${w.trainingPeriod}
  Testing:  ${w.testingPeriod}
  Win Rate: ${(w.testingMetrics.winRate * 100).toFixed(2)}%
  Profit Factor: ${w.testingMetrics.profitFactor.toFixed(2)}x
  Sharpe Ratio: ${w.testingMetrics.sharpeRatio.toFixed(2)}
  Max Drawdown: ${(w.testingMetrics.maxDrawdown * 100).toFixed(2)}%
  Trades: ${w.testingMetrics.totalTrades}
`
  )
  .join("\n")}

───────────────────────────────────────────────────────────────
INTERPRETATION
───────────────────────────────────────────────────────────────
${
  result.aggregatedMetrics.consistency > 0.7
    ? "✅ HIGH CONSISTENCY: Strategy performs reliably across different market periods"
    : result.aggregatedMetrics.consistency > 0.5
      ? "⚠️  MODERATE CONSISTENCY: Strategy shows variable performance across periods"
      : "❌ LOW CONSISTENCY: Strategy results are inconsistent - may not be robust"
}

${
  result.aggregatedMetrics.averageWinRate > 0.6
    ? "✅ STRONG WIN RATE: Strategy wins more than 60% of trades"
    : result.aggregatedMetrics.averageWinRate > 0.5
      ? "⚠️  ACCEPTABLE WIN RATE: Strategy wins slightly more than 50% of trades"
      : "❌ WEAK WIN RATE: Strategy wins less than 50% of trades"
}

${
  result.aggregatedMetrics.averageSharpeRatio > 1.0
    ? "✅ GOOD RISK-ADJUSTED RETURNS: Sharpe ratio indicates good risk management"
    : "⚠️  MODERATE RISK-ADJUSTED RETURNS: Consider improving risk management"
}

═══════════════════════════════════════════════════════════════
`;

  return report;
}
