import { describe, it, expect } from "vitest";
import {
  createWalkForwardWindows,
  runWalkForwardBacktest,
  generateBacktestReport,
} from "./walkForwardBacktester";
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

    // Skip weekends
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

describe("Walk-Forward Backtester", () => {
  it("should create walk-forward windows correctly", () => {
    const data = generateMockData(400);
    const windows = createWalkForwardWindows(data, 252, 63);

    expect(windows.length).toBeGreaterThan(0);
    expect(windows[0].trainingData.length).toBe(252);
    expect(windows[0].testingData.length).toBe(63);
  });

  it("should handle insufficient data gracefully", () => {
    const data = generateMockData(50);
    const windows = createWalkForwardWindows(data, 252, 63);

    expect(windows.length).toBe(0);
  });

  it("should create non-overlapping windows", () => {
    const data = generateMockData(500);
    const windows = createWalkForwardWindows(data, 252, 63);

    for (let i = 0; i < windows.length - 1; i++) {
      const currentTestData = windows[i].testingData;
      const nextTrainData = windows[i + 1].trainingData;
      
      const currentTestTimestamps = new Set(currentTestData.map(d => d.timestamp.getTime()));
      for (const d of nextTrainData) {
        expect(currentTestTimestamps.has(d.timestamp.getTime())).toBe(false);
      }
    }
  });

  it("should run walk-forward backtest", async () => {
    const data = generateMockData(500);
    const result = await runWalkForwardBacktest("TEST", data, 252, 63);

    expect(result.symbol).toBe("TEST");
    expect(result.windowCount).toBeGreaterThan(0);
    expect(result.aggregatedMetrics.averageWinRate).toBeGreaterThanOrEqual(0);
    expect(result.aggregatedMetrics.averageWinRate).toBeLessThanOrEqual(1);
    expect(result.aggregatedMetrics.consistency).toBeGreaterThanOrEqual(0);
    expect(result.aggregatedMetrics.consistency).toBeLessThanOrEqual(1);
  });

  it("should generate backtest report", async () => {
    const data = generateMockData(500);
    const result = await runWalkForwardBacktest("TEST", data, 252, 63);
    const report = generateBacktestReport(result);

    expect(report).toContain("WALK-FORWARD BACKTEST REPORT");
    expect(report).toContain("TEST");
    expect(report).toContain("Average Win Rate");
    expect(report).toContain("Profit Factor");
  });

  it("should calculate consistency score", async () => {
    const data = generateMockData(500);
    const result = await runWalkForwardBacktest("TEST", data, 252, 63);

    expect(result.aggregatedMetrics.consistency).toBeGreaterThanOrEqual(0);
    expect(result.aggregatedMetrics.consistency).toBeLessThanOrEqual(1);
  });

  it("should aggregate metrics correctly", async () => {
    const data = generateMockData(500);
    const result = await runWalkForwardBacktest("TEST", data, 252, 63);

    const avgWinRate =
      result.windows.reduce((sum, w) => sum + w.testingMetrics.winRate, 0) /
      result.windows.length;
    expect(result.aggregatedMetrics.averageWinRate).toBeCloseTo(avgWinRate, 5);
  });

  it("should handle different window sizes", async () => {
    const data = generateMockData(800);
    const result1 = await runWalkForwardBacktest("TEST", data, 252, 63);
    const result2 = await runWalkForwardBacktest("TEST", data, 150, 50);

    expect(result1.windowCount).toBeGreaterThan(0);
    expect(result2.windowCount).toBeGreaterThan(0);
    expect(result1.windowCount).not.toBe(result2.windowCount);
  });

  it("should validate total trades across windows", async () => {
    const data = generateMockData(500);
    const result = await runWalkForwardBacktest("TEST", data, 252, 63);

    let totalTradesFromWindows = 0;
    for (const window of result.windows) {
      totalTradesFromWindows += window.testingMetrics.totalTrades;
    }

    expect(result.aggregatedMetrics.totalTrades).toBeGreaterThanOrEqual(totalTradesFromWindows);
  });
});
