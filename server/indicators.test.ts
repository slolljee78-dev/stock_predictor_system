import { describe, it, expect } from "vitest";
import {
  calculateRSI,
  calculateSMA,
  calculateEMA,
  calculateMACD,
  calculateBollingerBands,
  analyzeIndicators,
} from "./indicators";

describe("Technical Indicators", () => {
  // Generate mock price data
  const generatePrices = (count: number, basePrice: number = 100): number[] => {
    const prices = [];
    let price = basePrice;
    for (let i = 0; i < count; i++) {
      price += (Math.random() - 0.5) * 2;
      prices.push(Math.max(price, 10));
    }
    return prices;
  };

  describe("RSI Calculation", () => {
    it("should return null if insufficient data", () => {
      const prices = generatePrices(10);
      const rsi = calculateRSI(prices, 14);
      expect(rsi).toBeNull();
    });

    it("should calculate RSI with sufficient data", () => {
      const prices = generatePrices(50);
      const rsi = calculateRSI(prices, 14);
      expect(rsi).not.toBeNull();
      expect(rsi).toBeGreaterThanOrEqual(0);
      expect(rsi).toBeLessThanOrEqual(100);
    });

    it("should return 100 for all gains", () => {
      const prices = Array.from({ length: 20 }, (_, i) => 100 + i);
      const rsi = calculateRSI(prices, 14);
      expect(rsi).toBe(100);
    });

    it("should return 0 for all losses", () => {
      const prices = Array.from({ length: 20 }, (_, i) => 100 - i);
      const rsi = calculateRSI(prices, 14);
      expect(rsi).toBe(0);
    });
  });

  describe("SMA Calculation", () => {
    it("should return null if insufficient data", () => {
      const prices = generatePrices(10);
      const sma = calculateSMA(prices, 20);
      expect(sma).toBeNull();
    });

    it("should calculate SMA correctly", () => {
      const prices = [100, 101, 102, 103, 104];
      const sma = calculateSMA(prices, 5);
      expect(sma).toBe(102);
    });

    it("should calculate SMA with period less than array length", () => {
      const prices = generatePrices(50);
      const sma = calculateSMA(prices, 20);
      expect(sma).not.toBeNull();
      expect(typeof sma).toBe("number");
    });
  });

  describe("EMA Calculation", () => {
    it("should return null if insufficient data", () => {
      const prices = generatePrices(10);
      const ema = calculateEMA(prices, 20);
      expect(ema).toBeNull();
    });

    it("should calculate EMA with sufficient data", () => {
      const prices = generatePrices(50);
      const ema = calculateEMA(prices, 12);
      expect(ema).not.toBeNull();
      expect(typeof ema).toBe("number");
    });

    it("should give more weight to recent prices", () => {
      const prices = [100, 100, 100, 100, 150]; // Last price spike
      const ema = calculateEMA(prices, 5);
      expect(ema).toBeGreaterThan(100);
      expect(ema).toBeLessThan(150);
    });
  });

  describe("MACD Calculation", () => {
    it("should return null if insufficient data", () => {
      const prices = generatePrices(20);
      const macd = calculateMACD(prices);
      expect(macd).toBeNull();
    });

    it("should calculate MACD with sufficient data", () => {
      const prices = generatePrices(50);
      const macd = calculateMACD(prices);
      expect(macd).not.toBeNull();
      expect(macd?.line).toBeDefined();
      expect(macd?.signal).toBeDefined();
      expect(macd?.histogram).toBeDefined();
    });

    it("should have histogram equal to line minus signal", () => {
      const prices = generatePrices(50);
      const macd = calculateMACD(prices);
      if (macd) {
        const expectedHistogram = macd.line - macd.signal;
        expect(Math.abs(macd.histogram - expectedHistogram)).toBeLessThan(0.01);
      }
    });
  });

  describe("Bollinger Bands Calculation", () => {
    it("should return null if insufficient data", () => {
      const prices = generatePrices(10);
      const bb = calculateBollingerBands(prices, 20);
      expect(bb).toBeNull();
    });

    it("should calculate Bollinger Bands with sufficient data", () => {
      const prices = generatePrices(50);
      const bb = calculateBollingerBands(prices, 20);
      expect(bb).not.toBeNull();
      expect(bb?.upper).toBeDefined();
      expect(bb?.middle).toBeDefined();
      expect(bb?.lower).toBeDefined();
    });

    it("should have upper band greater than middle band", () => {
      const prices = generatePrices(50);
      const bb = calculateBollingerBands(prices, 20);
      if (bb) {
        expect(bb.upper).toBeGreaterThan(bb.middle);
        expect(bb.middle).toBeGreaterThan(bb.lower);
      }
    });
  });

  describe("Signal Analysis", () => {
    it("should return hold signal when indicators are neutral", () => {
      const indicators = {
        rsi: 50,
        macd: { line: 0, signal: 0, histogram: 0 },
        bollingerBands: { upper: 110, middle: 100, lower: 90 },
        sma20: 100,
        sma50: 100,
        ema12: 100,
        ema26: 100,
      };

      const signal = analyzeIndicators(indicators);
      expect(signal.confidence).toBeLessThanOrEqual(60);
    });

    it("should generate buy signal when RSI is oversold", () => {
      const indicators = {
        rsi: 25,
        macd: { line: 1, signal: 0, histogram: 1 },
        bollingerBands: { upper: 110, middle: 100, lower: 90 },
        sma20: 105,
        sma50: 100,
        ema12: 105,
        ema26: 100,
      };

      const signal = analyzeIndicators(indicators);
      expect(signal.signal).toBe("buy");
      expect(signal.confidence).toBeGreaterThan(40);
    });

    it("should generate sell signal when RSI is overbought", () => {
      const indicators = {
        rsi: 75,
        macd: { line: -1, signal: 0, histogram: -1 },
        bollingerBands: { upper: 110, middle: 100, lower: 90 },
        sma20: 95,
        sma50: 100,
        ema12: 95,
        ema26: 100,
      };

      const signal = analyzeIndicators(indicators);
      expect(signal.signal).toBe("sell");
      expect(signal.confidence).toBeGreaterThan(40);
    });

    it("should have confidence score between 0 and 100", () => {
      const indicators = {
        rsi: 30,
        macd: { line: 1, signal: 0, histogram: 1 },
        bollingerBands: { upper: 110, middle: 100, lower: 90 },
        sma20: 105,
        sma50: 100,
        ema12: 105,
        ema26: 100,
      };

      const signal = analyzeIndicators(indicators);
      expect(signal.confidence).toBeGreaterThanOrEqual(0);
      expect(signal.confidence).toBeLessThanOrEqual(100);
    });
  });
});
