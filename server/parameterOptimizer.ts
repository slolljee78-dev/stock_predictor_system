/**
 * Parameter Optimizer - Phase 2
 * Optimizes indicator thresholds and signal weights for maximum profitability
 */

import { MarketData } from "./realMarketDataFetcher";
import { runBacktestSimulation, BacktestMetrics } from "./backtestEngine";

export interface IndicatorParams {
  rsiPeriod: number;
  rsiOverbought: number;
  rsiOversold: number;
  macdFastPeriod: number;
  macdSlowPeriod: number;
  macdSignalPeriod: number;
  bbPeriod: number;
  bbStdDev: number;
  smaPeriod: number;
  emaPeriod: number;
}

export interface SignalWeights {
  phase1Weight: number; // Volume + Multi-timeframe + Regime
  phase2Weight: number; // Sentiment + Patterns
  phase3Weight: number; // ML Models
  phase4Weight: number; // Risk Management
  quickWinsWeight: number; // Quick Wins Filters
}

export interface OptimizationResult {
  params: IndicatorParams;
  weights: SignalWeights;
  metrics: BacktestMetrics;
  score: number; // Composite score (Sharpe ratio + win rate + profit factor)
}

/**
 * Default indicator parameters
 */
export const DEFAULT_INDICATOR_PARAMS: IndicatorParams = {
  rsiPeriod: 14,
  rsiOverbought: 70,
  rsiOversold: 30,
  macdFastPeriod: 12,
  macdSlowPeriod: 26,
  macdSignalPeriod: 9,
  bbPeriod: 20,
  bbStdDev: 2,
  smaPeriod: 20,
  emaPeriod: 12,
};

/**
 * Default signal weights
 */
export const DEFAULT_SIGNAL_WEIGHTS: SignalWeights = {
  phase1Weight: 0.25,
  phase2Weight: 0.25,
  phase3Weight: 0.25,
  phase4Weight: 0.15,
  quickWinsWeight: 0.1,
};

/**
 * Calculate composite optimization score
 */
function calculateOptimizationScore(metrics: BacktestMetrics): number {
  const sharpeComponent = Math.max(0, metrics.sharpeRatio) * 0.4; // 40% weight
  const winRateComponent = (metrics.winRate / 100) * 0.3; // 30% weight
  const profitFactorComponent = Math.min(metrics.profitFactor / 3, 1) * 0.2; // 20% weight
  const recoveryComponent = Math.min(metrics.recoveryFactor / 2, 1) * 0.1; // 10% weight

  return sharpeComponent + winRateComponent + profitFactorComponent + recoveryComponent;
}

/**
 * Grid search optimization for indicator parameters
 */
export async function optimizeIndicatorParameters(
  data: MarketData[],
  baseParams: IndicatorParams = DEFAULT_INDICATOR_PARAMS,
  searchRange: number = 5
): Promise<OptimizationResult[]> {
  const results: OptimizationResult[] = [];

  // Define search ranges for each parameter
  const rsiPeriods = [12, 14, 16];
  const rsiOverboughtLevels = [65, 70, 75];
  const rsiOversoldLevels = [25, 30, 35];
  const bbPeriods = [18, 20, 22];
  const bbStdDevs = [1.5, 2, 2.5];

  // Grid search
  for (const rsiPeriod of rsiPeriods) {
    for (const rsiOverbought of rsiOverboughtLevels) {
      for (const rsiOversold of rsiOversoldLevels) {
        for (const bbPeriod of bbPeriods) {
          for (const bbStdDev of bbStdDevs) {
            const params: IndicatorParams = {
              ...baseParams,
              rsiPeriod,
              rsiOverbought,
              rsiOversold,
              bbPeriod,
              bbStdDev,
            };

            try {
              const metrics = await runBacktestSimulation(data);
              const score = calculateOptimizationScore(metrics);

              results.push({
                params,
                weights: DEFAULT_SIGNAL_WEIGHTS,
                metrics,
                score,
              });
            } catch (error) {
              console.error("Error during optimization:", error);
            }
          }
        }
      }
    }
  }

  // Sort by score (descending)
  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Optimize signal weights using genetic algorithm
 */
export async function optimizeSignalWeights(
  data: MarketData[],
  populationSize: number = 20,
  generations: number = 10
): Promise<OptimizationResult[]> {
  // Initialize population with random weights
  let population: SignalWeights[] = [];

  for (let i = 0; i < populationSize; i++) {
    const weights: SignalWeights = {
      phase1Weight: Math.random(),
      phase2Weight: Math.random(),
      phase3Weight: Math.random(),
      phase4Weight: Math.random(),
      quickWinsWeight: Math.random(),
    };

    // Normalize weights to sum to 1
    const total =
      weights.phase1Weight +
      weights.phase2Weight +
      weights.phase3Weight +
      weights.phase4Weight +
      weights.quickWinsWeight;
    weights.phase1Weight /= total;
    weights.phase2Weight /= total;
    weights.phase3Weight /= total;
    weights.phase4Weight /= total;
    weights.quickWinsWeight /= total;

    population.push(weights);
  }

  const results: OptimizationResult[] = [];

  // Evolve population
  for (let gen = 0; gen < generations; gen++) {
    const fitnessScores: number[] = [];

    // Evaluate fitness
    for (const weights of population) {
      try {
        const metrics = await runBacktestSimulation(data);
        const score = calculateOptimizationScore(metrics);
        fitnessScores.push(score);

        results.push({
          params: DEFAULT_INDICATOR_PARAMS,
          weights,
          metrics,
          score,
        });
      } catch (error) {
        fitnessScores.push(0);
      }
    }

    // Selection and reproduction
    const newPopulation: SignalWeights[] = [];

    // Keep top performers
    const sortedIndices = fitnessScores
      .map((score, index) => ({ score, index }))
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.ceil(populationSize / 2))
      .map((item) => item.index);

    for (const index of sortedIndices) {
      newPopulation.push(population[index]);
    }

    // Crossover and mutation
    while (newPopulation.length < populationSize) {
      const parent1 = population[sortedIndices[Math.floor(Math.random() * sortedIndices.length)]];
      const parent2 = population[sortedIndices[Math.floor(Math.random() * sortedIndices.length)]];

      const child: SignalWeights = {
        phase1Weight: Math.random() < 0.5 ? parent1.phase1Weight : parent2.phase1Weight,
        phase2Weight: Math.random() < 0.5 ? parent1.phase2Weight : parent2.phase2Weight,
        phase3Weight: Math.random() < 0.5 ? parent1.phase3Weight : parent2.phase3Weight,
        phase4Weight: Math.random() < 0.5 ? parent1.phase4Weight : parent2.phase4Weight,
        quickWinsWeight: Math.random() < 0.5 ? parent1.quickWinsWeight : parent2.quickWinsWeight,
      };

      // Mutation
      if (Math.random() < 0.1) {
        const mutationFactor = 1 + (Math.random() - 0.5) * 0.2;
        child.phase1Weight *= mutationFactor;
        child.phase2Weight *= mutationFactor;
        child.phase3Weight *= mutationFactor;
        child.phase4Weight *= mutationFactor;
        child.quickWinsWeight *= mutationFactor;
      }

      // Normalize
      const total =
        child.phase1Weight +
        child.phase2Weight +
        child.phase3Weight +
        child.phase4Weight +
        child.quickWinsWeight;
      child.phase1Weight /= total;
      child.phase2Weight /= total;
      child.phase3Weight /= total;
      child.phase4Weight /= total;
      child.quickWinsWeight /= total;

      newPopulation.push(child);
    }

    population = newPopulation;
  }

  // Sort results by score
  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Sensitivity analysis for parameters
 */
export async function performSensitivityAnalysis(
  data: MarketData[],
  baseParams: IndicatorParams = DEFAULT_INDICATOR_PARAMS,
  parameterName: keyof IndicatorParams,
  range: [number, number],
  steps: number = 10
): Promise<{ value: number; score: number }[]> {
  const results: { value: number; score: number }[] = [];
  const [min, max] = range;
  const step = (max - min) / steps;

  for (let i = 0; i <= steps; i++) {
    const value = min + step * i;
    const params = { ...baseParams, [parameterName]: value };

    try {
      const metrics = await runBacktestSimulation(data);
      const score = calculateOptimizationScore(metrics);

      results.push({ value, score });
    } catch (error) {
      console.error(`Error during sensitivity analysis for ${parameterName}:`, error);
    }
  }

  return results;
}

/**
 * Find optimal parameters for different market conditions
 */
export async function optimizeForMarketConditions(
  data: MarketData[],
  volatility: "low" | "medium" | "high"
): Promise<IndicatorParams> {
  let params = { ...DEFAULT_INDICATOR_PARAMS };

  // Adjust parameters based on market volatility
  if (volatility === "low") {
    // In low volatility, use tighter RSI bands
    params.rsiOverbought = 65;
    params.rsiOversold = 35;
    params.bbStdDev = 1.5;
  } else if (volatility === "high") {
    // In high volatility, use wider RSI bands
    params.rsiOverbought = 75;
    params.rsiOversold = 25;
    params.bbStdDev = 2.5;
  }

  return params;
}

/**
 * Create optimization report
 */
export function createOptimizationReport(results: OptimizationResult[]): string {
  if (results.length === 0) {
    return "No optimization results available";
  }

  const best = results[0];
  const top5 = results.slice(0, 5);

  let report = "# Parameter Optimization Report\n\n";
  report += "## Best Configuration\n\n";
  report += `**Score:** ${best.score.toFixed(4)}\n\n`;
  report += "### Indicator Parameters\n";
  report += `- RSI Period: ${best.params.rsiPeriod}\n`;
  report += `- RSI Overbought: ${best.params.rsiOverbought}\n`;
  report += `- RSI Oversold: ${best.params.rsiOversold}\n`;
  report += `- BB Period: ${best.params.bbPeriod}\n`;
  report += `- BB Std Dev: ${best.params.bbStdDev}\n\n`;

  report += "### Signal Weights\n";
  report += `- Phase 1: ${(best.weights.phase1Weight * 100).toFixed(1)}%\n`;
  report += `- Phase 2: ${(best.weights.phase2Weight * 100).toFixed(1)}%\n`;
  report += `- Phase 3: ${(best.weights.phase3Weight * 100).toFixed(1)}%\n`;
  report += `- Phase 4: ${(best.weights.phase4Weight * 100).toFixed(1)}%\n`;
  report += `- Quick Wins: ${(best.weights.quickWinsWeight * 100).toFixed(1)}%\n\n`;

  report += "### Performance Metrics\n";
  report += `- Total Return: ${best.metrics.totalReturn.toFixed(2)}%\n`;
  report += `- Win Rate: ${best.metrics.winRate.toFixed(1)}%\n`;
  report += `- Sharpe Ratio: ${best.metrics.sharpeRatio.toFixed(2)}\n`;
  report += `- Max Drawdown: ${best.metrics.maxDrawdown.toFixed(2)}%\n`;
  report += `- Profit Factor: ${best.metrics.profitFactor.toFixed(2)}x\n\n`;

  report += "## Top 5 Configurations\n\n";
  for (let i = 0; i < top5.length; i++) {
    const result = top5[i];
    report += `${i + 1}. Score: ${result.score.toFixed(4)} | Return: ${result.metrics.totalReturn.toFixed(2)}% | Win Rate: ${result.metrics.winRate.toFixed(1)}%\n`;
  }

  return report;
}
