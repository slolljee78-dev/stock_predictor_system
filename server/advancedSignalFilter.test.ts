import { describe, it, expect } from "vitest";
import {
  filterSignals,
  getSignalStatistics,
  filterPresets,
} from "./advancedSignalFilter";

describe("Advanced Signal Filtering", () => {
  const mockSignals = [
    {
      id: 1,
      ticker: "AAPL",
      type: "buy" as const,
      confidenceScore: 85,
      priceAtSignal: 15000,
      volume: 5000000,
      priceChange: 2.5,
      sector: "Technology",
      indicators: { rsi: 65, macd: "bullish" },
      createdAt: new Date("2026-04-16"),
    },
    {
      id: 2,
      ticker: "MSFT",
      type: "sell" as const,
      confidenceScore: 72,
      priceAtSignal: 32000,
      volume: 3000000,
      priceChange: -1.5,
      sector: "Technology",
      indicators: { rsi: 35, macd: "bearish" },
      createdAt: new Date("2026-04-15"),
    },
    {
      id: 3,
      ticker: "JPM",
      type: "buy" as const,
      confidenceScore: 65,
      priceAtSignal: 18000,
      volume: 2000000,
      priceChange: 0.5,
      sector: "Finance",
      indicators: { rsi: 55, macd: "neutral" },
      createdAt: new Date("2026-04-14"),
    },
  ];

  it("should filter by minimum confidence", () => {
    const filtered = filterSignals(mockSignals, { minConfidence: 75 });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].ticker).toBe("AAPL");
  });

  it("should filter by signal type", () => {
    const filtered = filterSignals(mockSignals, { signalType: "buy" });
    expect(filtered).toHaveLength(2);
    expect(filtered.every((s) => s.type === "buy")).toBe(true);
  });

  it("should filter by volume", () => {
    const filtered = filterSignals(mockSignals, { minVolume: 3000000 });
    expect(filtered).toHaveLength(2);
  });

  it("should filter by price change", () => {
    const filtered = filterSignals(mockSignals, { maxPriceChange: 1.5 });
    expect(filtered).toHaveLength(2);
  });

  it("should filter by sectors", () => {
    const filtered = filterSignals(mockSignals, { sectors: ["Technology"] });
    expect(filtered).toHaveLength(2);
    expect(filtered.every((s) => s.sector === "Technology")).toBe(true);
  });

  it("should exclude tickers", () => {
    const filtered = filterSignals(mockSignals, { excludeTickers: ["MSFT"] });
    expect(filtered).toHaveLength(2);
    expect(filtered.every((s) => s.ticker !== "MSFT")).toBe(true);
  });

  it("should include only specified tickers", () => {
    const filtered = filterSignals(mockSignals, { includeTickers: ["AAPL", "JPM"] });
    expect(filtered).toHaveLength(2);
    expect(filtered.every((s) => ["AAPL", "JPM"].includes(s.ticker))).toBe(true);
  });

  it("should sort by confidence", () => {
    const filtered = filterSignals(mockSignals, { sortBy: "confidence" });
    expect(filtered[0].confidenceScore).toBeGreaterThanOrEqual(filtered[1].confidenceScore);
  });

  it("should sort by volume", () => {
    const filtered = filterSignals(mockSignals, { sortBy: "volume" });
    expect(filtered[0].volume || 0).toBeGreaterThanOrEqual(filtered[1].volume || 0);
  });

  it("should sort by date", () => {
    const filtered = filterSignals(mockSignals, { sortBy: "date" });
    expect(filtered[0].createdAt.getTime()).toBeGreaterThanOrEqual(
      filtered[1].createdAt.getTime()
    );
  });

  it("should apply limit", () => {
    const filtered = filterSignals(mockSignals, { limit: 1 });
    expect(filtered).toHaveLength(1);
  });

  it("should calculate relevance scores", () => {
    const filtered = filterSignals(mockSignals, {});
    expect(filtered.every((s) => s.relevanceScore >= 0)).toBe(true);
  });

  it("should get signal statistics", () => {
    const filtered = filterSignals(mockSignals, {});
    const stats = getSignalStatistics(filtered);

    expect(stats.totalSignals).toBe(3);
    expect(stats.buySignals).toBe(2);
    expect(stats.sellSignals).toBe(1);
    expect(stats.avgConfidence).toBeGreaterThan(0);
    expect(stats.topSignals).toHaveLength(3);
  });

  it("should handle empty signal list", () => {
    const stats = getSignalStatistics([]);
    expect(stats.totalSignals).toBe(0);
    expect(stats.buySignals).toBe(0);
    expect(stats.sellSignals).toBe(0);
  });

  it("should apply high confidence preset", () => {
    const filtered = filterSignals(mockSignals, filterPresets.highConfidence);
    expect(filtered.every((s) => s.confidenceScore >= 80)).toBe(true);
  });

  it("should apply bullish preset", () => {
    const filtered = filterSignals(mockSignals, filterPresets.bullish);
    expect(filtered.every((s) => s.type === "buy")).toBe(true);
  });

  it("should apply bearish preset", () => {
    const filtered = filterSignals(mockSignals, filterPresets.bearish);
    expect(filtered.every((s) => s.type === "sell")).toBe(true);
  });

  it("should apply high volume preset", () => {
    const filtered = filterSignals(mockSignals, filterPresets.highVolume);
    expect(filtered.length).toBeGreaterThan(0);
  });

  it("should combine multiple filters", () => {
    const filtered = filterSignals(mockSignals, {
      minConfidence: 70,
      signalType: "buy",
      sectors: ["Technology"],
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].ticker).toBe("AAPL");
  });
});
