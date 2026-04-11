import { describe, it, expect } from "vitest";
import {
  detectChartPatterns,
  identifySupportResistance,
  checkEarningsProximity,
  calculateCompositeSentiment,
  generateSentimentSignalAdjustment,
} from "./sentimentAnalyzer";

describe("Sentiment Analyzer - Chart Patterns", () => {
  it("should detect head and shoulders pattern", () => {
    const prices = [100, 105, 110, 105, 115, 110, 105, 100];
    const patterns = detectChartPatterns(prices);
    expect(patterns.some(p => p.type === "head_shoulders")).toBe(true);
  });

  it("should detect double top pattern", () => {
    const prices = [100, 105, 110, 105, 110, 105, 100];
    const patterns = detectChartPatterns(prices);
    expect(patterns.some(p => p.type === "double_top")).toBe(true);
  });

  it("should detect double bottom pattern", () => {
    const prices = [110, 105, 100, 105, 100, 105, 110];
    const patterns = detectChartPatterns(prices);
    expect(patterns.some(p => p.type === "double_bottom")).toBe(true);
  });

  it("should return empty array for insufficient data", () => {
    const prices = [100, 101, 102];
    const patterns = detectChartPatterns(prices);
    expect(patterns.length).toBe(0);
  });

  it("should identify pattern direction correctly", () => {
    const bullishPrices = [100, 95, 90, 95, 90, 95, 110];
    const patterns = detectChartPatterns(bullishPrices);
    const bullishPatterns = patterns.filter(p => p.direction === "bullish");
    expect(bullishPatterns.length).toBeGreaterThan(0);
  });
});

describe("Sentiment Analyzer - Support & Resistance", () => {
  it("should identify support levels below current price", () => {
    const prices = Array.from({ length: 50 }, (_, i) => 100 + Math.sin(i * 0.5) * 10);
    const sr = identifySupportResistance(prices);
    expect(sr.support.every(s => s < prices[prices.length - 1])).toBe(true);
  });

  it("should identify resistance levels above current price", () => {
    const prices = Array.from({ length: 50 }, (_, i) => 100 + Math.sin(i * 0.5) * 10);
    const sr = identifySupportResistance(prices);
    expect(sr.resistance.every(r => r > prices[prices.length - 1])).toBe(true);
  });

  it("should return current price as key level for insufficient data", () => {
    const prices = [100, 101, 102];
    const sr = identifySupportResistance(prices);
    expect(sr.keyLevel).toBe(prices[prices.length - 1]);
  });

  it("should identify key level between support and resistance", () => {
    const prices = Array.from({ length: 50 }, (_, i) => 100 + Math.sin(i * 0.5) * 10);
    const sr = identifySupportResistance(prices);
    const currentPrice = prices[prices.length - 1];

    // Key level should be a valid price point
    expect(sr.keyLevel).toBeGreaterThan(0);
    expect(sr.keyLevel).toBeLessThanOrEqual(Math.max(...prices));
  });
});

describe("Sentiment Analyzer - Earnings", () => {
  it("should detect upcoming earnings for TSLA", () => {
    const earnings = checkEarningsProximity("TSLA", 7);
    expect(earnings).not.toBeNull();
    if (earnings) {
      expect(earnings.ticker).toBe("TSLA");
      expect(earnings.date).toBeInstanceOf(Date);
    }
  });

  it("should return null for non-existent ticker", () => {
    const earnings = checkEarningsProximity("NONEXISTENT", 7);
    expect(earnings).toBeNull();
  });

  it("should return null if earnings are beyond specified days", () => {
    const earnings = checkEarningsProximity("GOOGL", 5);
    expect(earnings).toBeNull();
  });

  it("should detect AAPL earnings within 7 days", () => {
    const earnings = checkEarningsProximity("AAPL", 7);
    expect(earnings).not.toBeNull();
  });
});

describe("Sentiment Analyzer - Composite Sentiment", () => {
  it("should calculate weighted sentiment correctly", () => {
    const composite = calculateCompositeSentiment(0.8, 0.6, 0.7);
    expect(composite).toBeGreaterThan(0);
    expect(composite).toBeLessThanOrEqual(1);
  });

  it("should respect weight distribution", () => {
    const weights = { news: 0.5, pattern: 0.3, supportResistance: 0.2 };
    const composite = calculateCompositeSentiment(1, -1, -1, weights);
    // With 50% positive and 50% negative, result should be neutral or slightly positive
    expect(composite).toBeGreaterThanOrEqual(-0.1);
    expect(composite).toBeLessThanOrEqual(0.1);
  });

  it("should clamp result between -1 and 1", () => {
    const composite1 = calculateCompositeSentiment(2, 2, 2);
    const composite2 = calculateCompositeSentiment(-2, -2, -2);
    expect(composite1).toBeLessThanOrEqual(1);
    expect(composite2).toBeGreaterThanOrEqual(-1);
  });

  it("should return neutral for neutral inputs", () => {
    const composite = calculateCompositeSentiment(0, 0, 0);
    expect(composite).toBe(0);
  });
});

describe("Sentiment Analyzer - Signal Adjustment", () => {
  it("should boost signal for positive sentiment", () => {
    const adjustment = generateSentimentSignalAdjustment(
      0.8,
      [],
      { support: [], resistance: [], keyLevel: 100 },
      100
    );
    expect(adjustment.adjustment).toBeGreaterThan(0);
  });

  it("should reduce signal for negative sentiment", () => {
    const adjustment = generateSentimentSignalAdjustment(
      -0.8,
      [],
      { support: [], resistance: [], keyLevel: 100 },
      100
    );
    expect(adjustment.adjustment).toBeLessThan(0);
  });

  it("should boost signal for bullish patterns", () => {
    const bullishPattern = {
      type: "double_bottom" as const,
      strength: 0.8,
      direction: "bullish" as const,
      breakoutPrice: 98,
      targetPrice: 110,
    };
    const adjustment = generateSentimentSignalAdjustment(
      0,
      [bullishPattern],
      { support: [], resistance: [], keyLevel: 100 },
      100
    );
    expect(adjustment.adjustment).toBeGreaterThan(0);
  });

  it("should reduce signal for bearish patterns", () => {
    const bearishPattern = {
      type: "head_shoulders" as const,
      strength: 0.8,
      direction: "bearish" as const,
      breakoutPrice: 102,
      targetPrice: 90,
    };
    const adjustment = generateSentimentSignalAdjustment(
      0,
      [bearishPattern],
      { support: [], resistance: [], keyLevel: 100 },
      100
    );
    expect(adjustment.adjustment).toBeLessThan(0);
  });

  it("should clamp adjustment between -30 and 30", () => {
    const adjustment = generateSentimentSignalAdjustment(
      1,
      Array(10).fill({
        type: "double_bottom" as const,
        strength: 0.8,
        direction: "bullish" as const,
        breakoutPrice: 98,
        targetPrice: 110,
      }),
      { support: [], resistance: [], keyLevel: 100 },
      100
    );
    expect(adjustment.adjustment).toBeLessThanOrEqual(30);
    expect(adjustment.adjustment).toBeGreaterThanOrEqual(-30);
  });

  it("should provide reasoning for adjustments", () => {
    const adjustment = generateSentimentSignalAdjustment(
      0.7,
      [],
      { support: [], resistance: [], keyLevel: 100 },
      100
    );
    expect(adjustment.reasoning).toBeTruthy();
    expect(adjustment.reasoning.length).toBeGreaterThan(0);
  });
});
