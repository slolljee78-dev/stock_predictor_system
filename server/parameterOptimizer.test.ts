import { describe, it, expect } from "vitest";
import {
  optimizeIndicatorParameters,
  optimizeSignalWeights,
  performSensitivityAnalysis,
  optimizeForMarketConditions,
  createOptimizationReport,
  DEFAULT_INDICATOR_PARAMS,
  DEFAULT_SIGNAL_WEIGHTS,
  IndicatorParams,
  SignalWeights,
} from "./parameterOptimizer";
import { MarketData } from "./realMarketDataFetcher";

/**
 * Generate mock market data for testing
 */
function generateMockData(tradingDays: number): MarketData[] {
  const data: MarketData[] = [];
  let price = 100;
  const startDate = new Date("2023-01-01");
  let daysAdded = 0;
  let dayCounter = 0;

  while (daysAdded < tradingDays) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayCounter);
    dayCounter++;

    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dailyReturn = (Math.random() - 0.5) * 0.02;
    price = price * (1 + dailyReturn);

    const open = price * (1 - Math.random() * 0.005);
    const close = price;
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);

    data.push({
      timestamp: date,
      open,
      high,
      low,
      close,
      volume: Math.floor(1000000 + Math.random() * 2000000),
      adjustedClose: close,
    });

    daysAdded++;
  }

  return data;
}

describe("Parameter Optimizer", () => {
  it("should have default indicator parameters", () => {
    expect(DEFAULT_INDICATOR_PARAMS.rsiPeriod).toBe(14);
    expect(DEFAULT_INDICATOR_PARAMS.rsiOverbought).toBe(70);
    expect(DEFAULT_INDICATOR_PARAMS.rsiOversold).toBe(30);
    expect(DEFAULT_INDICATOR_PARAMS.bbPeriod).toBe(20);
    expect(DEFAULT_INDICATOR_PARAMS.bbStdDev).toBe(2);
  });

  it("should have default signal weights that sum to 1", () => {
    const sum =
      DEFAULT_SIGNAL_WEIGHTS.phase1Weight +
      DEFAULT_SIGNAL_WEIGHTS.phase2Weight +
      DEFAULT_SIGNAL_WEIGHTS.phase3Weight +
      DEFAULT_SIGNAL_WEIGHTS.phase4Weight +
      DEFAULT_SIGNAL_WEIGHTS.quickWinsWeight;

    expect(sum).toBeCloseTo(1.0, 5);
  });

  it("should optimize indicator parameters", async () => {
    const data = generateMockData(300);
    const results = await optimizeIndicatorParameters(data);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].score).toBeGreaterThanOrEqual(0);
    expect(results[0].params).toBeDefined();
    expect(results[0].metrics).toBeDefined();
  });

  it("should return sorted optimization results by score", async () => {
    const data = generateMockData(300);
    const results = await optimizeIndicatorParameters(data);

    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
    }
  });

  it("should optimize signal weights using genetic algorithm", async () => {
    const data = generateMockData(300);
    const results = await optimizeSignalWeights(data, 10, 5);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].weights).toBeDefined();

    for (const result of results) {
      const sum =
        result.weights.phase1Weight +
        result.weights.phase2Weight +
        result.weights.phase3Weight +
        result.weights.phase4Weight +
        result.weights.quickWinsWeight;

      expect(sum).toBeCloseTo(1.0, 5);
    }
  });

  it("should perform sensitivity analysis", async () => {
    const data = generateMockData(300);
    const results = await performSensitivityAnalysis(
      data,
      DEFAULT_INDICATOR_PARAMS,
      "rsiPeriod",
      [10, 20],
      5
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].value).toBeDefined();
    expect(results[0].score).toBeDefined();
  });

  it("should have increasing values in sensitivity analysis", async () => {
    const data = generateMockData(300);
    const results = await performSensitivityAnalysis(
      data,
      DEFAULT_INDICATOR_PARAMS,
      "rsiPeriod",
      [10, 20],
      5
    );

    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].value).toBeLessThan(results[i + 1].value);
    }
  });

  it("should optimize for low volatility market", async () => {
    const data = generateMockData(300);
    const params = await optimizeForMarketConditions(data, "low");

    expect(params.rsiOverbought).toBe(65);
    expect(params.rsiOversold).toBe(35);
    expect(params.bbStdDev).toBe(1.5);
  });

  it("should optimize for high volatility market", async () => {
    const data = generateMockData(300);
    const params = await optimizeForMarketConditions(data, "high");

    expect(params.rsiOverbought).toBe(75);
    expect(params.rsiOversold).toBe(25);
    expect(params.bbStdDev).toBe(2.5);
  });

  it("should optimize for medium volatility market", async () => {
    const data = generateMockData(300);
    const params = await optimizeForMarketConditions(data, "medium");

    expect(params.rsiOverbought).toBe(DEFAULT_INDICATOR_PARAMS.rsiOverbought);
    expect(params.rsiOversold).toBe(DEFAULT_INDICATOR_PARAMS.rsiOversold);
    expect(params.bbStdDev).toBe(DEFAULT_INDICATOR_PARAMS.bbStdDev);
  });

  it("should create optimization report", async () => {
    const data = generateMockData(300);
    const results = await optimizeIndicatorParameters(data);
    const report = createOptimizationReport(results);

    expect(report).toContain("Parameter Optimization Report");
    expect(report).toContain("Best Configuration");
    expect(report).toContain("Top 5 Configurations");
    expect(report).toContain("Score");
  });

  it("should handle empty optimization results", () => {
    const report = createOptimizationReport([]);
    expect(report).toBe("No optimization results available");
  });

  it("should maintain parameter validity after optimization", async () => {
    const data = generateMockData(300);
    const results = await optimizeIndicatorParameters(data);

    for (const result of results) {
      expect(result.params.rsiPeriod).toBeGreaterThan(0);
      expect(result.params.rsiOverbought).toBeGreaterThan(result.params.rsiOversold);
      expect(result.params.bbPeriod).toBeGreaterThan(0);
      expect(result.params.bbStdDev).toBeGreaterThan(0);
    }
  });

  it("should have consistent optimization scores", async () => {
    const data = generateMockData(300);
    const results = await optimizeIndicatorParameters(data);

    for (const result of results) {
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(typeof result.score).toBe("number");
    }
  });

  it("should generate valid weight distributions", async () => {
    const data = generateMockData(300);
    const results = await optimizeSignalWeights(data, 10, 5);

    for (const result of results) {
      expect(result.weights.phase1Weight).toBeGreaterThanOrEqual(0);
      expect(result.weights.phase1Weight).toBeLessThanOrEqual(1);
      expect(result.weights.phase2Weight).toBeGreaterThanOrEqual(0);
      expect(result.weights.phase2Weight).toBeLessThanOrEqual(1);
      expect(result.weights.phase3Weight).toBeGreaterThanOrEqual(0);
      expect(result.weights.phase3Weight).toBeLessThanOrEqual(1);
      expect(result.weights.phase4Weight).toBeGreaterThanOrEqual(0);
      expect(result.weights.phase4Weight).toBeLessThanOrEqual(1);
      expect(result.weights.quickWinsWeight).toBeGreaterThanOrEqual(0);
      expect(result.weights.quickWinsWeight).toBeLessThanOrEqual(1);
    }
  });
});
