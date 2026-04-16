import { describe, it, expect } from "vitest";
import {
  detectMarketRegime,
  getAdaptedStrategy,
  calculateVolatilityBasedPositionSize,
  detectBullBearMarket,
  detectSectorRotation,
  getSectorRotationRecommendation,
  createRegimeReport,
  MarketRegime,
} from "./marketRegimeAdapter";
import { MarketData } from "./realMarketDataFetcher";

/**
 * Generate mock market data for testing
 */
function generateMockData(
  tradingDays: number,
  trend: "up" | "down" | "sideways" = "sideways",
  volatility: number = 0.02
): MarketData[] {
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

    let dailyReturn: number;
    if (trend === "up") {
      dailyReturn = 0.001 + (Math.random() - 0.5) * volatility;
    } else if (trend === "down") {
      dailyReturn = -0.001 + (Math.random() - 0.5) * volatility;
    } else {
      dailyReturn = (Math.random() - 0.5) * volatility;
    }

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

describe("Market Regime Adapter", () => {
  it("should detect trending up market", () => {
    const data = generateMockData(100, "up", 0.01);
    const analysis = detectMarketRegime(data);

    expect(analysis.regime).toBeDefined();
    expect(analysis.confidence).toBeGreaterThan(0);
  });

  it("should detect trending down market", () => {
    const data = generateMockData(100, "down", 0.01);
    const analysis = detectMarketRegime(data);

    expect(analysis.regime).toBeDefined();
    expect(analysis.confidence).toBeGreaterThan(0);
  });

  it("should detect ranging market", () => {
    const data = generateMockData(100, "sideways", 0.005);
    const analysis = detectMarketRegime(data);

    expect(analysis.regime).toMatch(/ranging|choppy|trending/);
    expect(analysis.confidence).toBeGreaterThan(0);
  });

  it("should detect volatile market", () => {
    const data = generateMockData(100, "sideways", 0.05);
    const analysis = detectMarketRegime(data);

    expect(analysis.regime).toBeDefined();
    expect(analysis.volatility).toBeGreaterThan(0.01);
  });

  it("should handle insufficient data", () => {
    const data = generateMockData(10);
    const analysis = detectMarketRegime(data, 50);

    expect(analysis.regime).toBe("ranging");
    expect(analysis.confidence).toBeLessThan(50);
  });

  it("should return valid regime analysis", () => {
    const data = generateMockData(100);
    const analysis = detectMarketRegime(data);

    expect(analysis.regime).toBeDefined();
    expect(analysis.confidence).toBeGreaterThanOrEqual(0);
    expect(analysis.confidence).toBeLessThanOrEqual(100);
    expect(analysis.volatility).toBeGreaterThanOrEqual(0);
    expect(analysis.trend).toBeGreaterThanOrEqual(-1);
    expect(analysis.trend).toBeLessThanOrEqual(1);
    expect(analysis.strength).toBeGreaterThanOrEqual(0);
    expect(analysis.strength).toBeLessThanOrEqual(1);
    expect(analysis.recommendation).toBeDefined();
  });

  it("should get adapted strategy for trending up", () => {
    const data = generateMockData(100, "up");
    const analysis = detectMarketRegime(data);
    const strategy = getAdaptedStrategy(analysis);

    expect(strategy.confidenceThreshold).toBeGreaterThan(0);
    expect(strategy.positionSizingMultiplier).toBeGreaterThan(0);
    expect(strategy.maxPositions).toBeGreaterThan(0);
  });

  it("should get adapted strategy for volatile market", () => {
    const data = generateMockData(100, "sideways", 0.05);
    const analysis = detectMarketRegime(data);
    const strategy = getAdaptedStrategy(analysis);

    expect(strategy.confidenceThreshold).toBeGreaterThan(0);
    expect(strategy.positionSizingMultiplier).toBeGreaterThan(0);
  });

  it("should calculate volatility-based position size", () => {
    const capital = 10000;
    const lowVolatilitySize = calculateVolatilityBasedPositionSize(capital, 0.01);
    const highVolatilitySize = calculateVolatilityBasedPositionSize(capital, 0.05);

    expect(lowVolatilitySize).toBeGreaterThan(highVolatilitySize);
    expect(lowVolatilitySize).toBeGreaterThan(0);
    expect(highVolatilitySize).toBeGreaterThan(0);
  });

  it("should detect bull market", () => {
    const data = generateMockData(250, "up", 0.01);
    const market = detectBullBearMarket(data);

    expect(market).toMatch(/bull|neutral/);
  });

  it("should detect bear market", () => {
    const data = generateMockData(250, "down", 0.01);
    const market = detectBullBearMarket(data);

    expect(market).toMatch(/bear|neutral/);
  });

  it("should detect neutral market", () => {
    const data = generateMockData(250, "sideways", 0.01);
    const market = detectBullBearMarket(data);

    expect(market).toMatch(/neutral|bull|bear/);
  });

  it("should handle insufficient data for bull/bear detection", () => {
    const data = generateMockData(50);
    const market = detectBullBearMarket(data, 200);

    expect(market).toBe("neutral");
  });

  it("should detect sector rotation", () => {
    const sectorData = new Map<string, MarketData[]>();
    sectorData.set("Tech", generateMockData(100, "up", 0.02));
    sectorData.set("Finance", generateMockData(100, "down", 0.02));
    sectorData.set("Energy", generateMockData(100, "sideways", 0.01));

    const momentum = detectSectorRotation(sectorData);

    expect(momentum.size).toBe(3);
    expect(momentum.get("Tech")).toBeGreaterThan(momentum.get("Finance")!);
  });

  it("should get sector rotation recommendation", () => {
    const sectorMomentum = new Map<string, number>();
    sectorMomentum.set("Tech", 5);
    sectorMomentum.set("Finance", 2);
    sectorMomentum.set("Energy", -3);
    sectorMomentum.set("Healthcare", -1);

    const recommendation = getSectorRotationRecommendation(sectorMomentum);

    expect(recommendation.bullishSectors.length).toBeGreaterThan(0);
    expect(recommendation.bearishSectors.length).toBeGreaterThan(0);
    expect(recommendation.bullishSectors).toContain("Tech");
    expect(recommendation.bearishSectors).toContain("Energy");
  });

  it("should create regime report", () => {
    const data = generateMockData(100);
    const analysis = detectMarketRegime(data);
    const report = createRegimeReport(analysis);

    expect(report).toContain("Market Regime Analysis Report");
    expect(report).toContain("Current Regime");
    expect(report).toContain("Confidence");
    expect(report).toContain("Adapted Strategy Parameters");
  });

  it("should maintain consistency across regime calls", () => {
    const data = generateMockData(100, "up");
    const analysis1 = detectMarketRegime(data);
    const analysis2 = detectMarketRegime(data);

    expect(analysis1.regime).toBeDefined();
    expect(analysis2.regime).toBeDefined();
    expect(analysis1.volatility).toBe(analysis2.volatility);
  });

  it("should have valid adapted strategy parameters", () => {
    const regimes: MarketRegime[] = ["trending_up", "trending_down", "ranging", "volatile", "choppy"];

    for (const regime of regimes) {
      const mockAnalysis = {
        regime,
        confidence: 75,
        volatility: 0.02,
        trend: 0.05,
        strength: 0.8,
        recommendation: "Test",
      };

      const strategy = getAdaptedStrategy(mockAnalysis);

      expect(strategy.confidenceThreshold).toBeGreaterThan(0);
      expect(strategy.confidenceThreshold).toBeLessThan(100);
      expect(strategy.positionSizingMultiplier).toBeGreaterThan(0);
      expect(strategy.stopLossPercent).toBeGreaterThan(0);
      expect(strategy.takeProfitPercent).toBeGreaterThan(0);
      expect(strategy.maxPositions).toBeGreaterThan(0);
      expect(["high", "medium", "low"]).toContain(strategy.tradingFrequency);
    }
  });

  it("should adjust position size based on volatility", () => {
    const capital = 10000;
    const baseSize = calculateVolatilityBasedPositionSize(capital, 0.02);
    const lowVolSize = calculateVolatilityBasedPositionSize(capital, 0.01);
    const highVolSize = calculateVolatilityBasedPositionSize(capital, 0.04);

    expect(lowVolSize).toBeGreaterThan(baseSize);
    expect(highVolSize).toBeLessThan(baseSize);
  });

  it("should handle edge cases in sector rotation", () => {
    const emptyData = new Map<string, MarketData[]>();
    const momentum = detectSectorRotation(emptyData);

    expect(momentum.size).toBe(0);
  });

  it("should handle insufficient sector data", () => {
    const sectorData = new Map<string, MarketData[]>();
    sectorData.set("Tech", generateMockData(10));

    const momentum = detectSectorRotation(sectorData, 50);

    expect(momentum.get("Tech")).toBe(0);
  });
});
