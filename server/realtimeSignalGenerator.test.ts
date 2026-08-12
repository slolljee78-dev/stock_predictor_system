import { describe, expect, it } from "vitest";

import { generateRealtimeSignal } from "./realtimeSignalGenerator";

function createMarketDataPoint(rsi14: number) {
  return {
    ticker: "AAPL",
    timestamp: Date.now(),
    price: {
      open: 100,
      high: 101,
      low: 99,
      close: 100,
      volume: 1_000_000,
    },
    indicators: {
      sma20: null,
      sma50: null,
      ema12: null,
      ema26: null,
      rsi14,
      macd: null,
      macdSignal: null,
      macdHistogram: null,
      bb20Upper: null,
      bb20Middle: null,
      bb20Lower: null,
      volumeSMA20: null,
      atr14: null,
    },
  };
}

function createConsensusMarketData() {
  return {
    ticker: "CONSENSUS",
    timestamp: Date.now(),
    price: {
      open: 108,
      high: 109,
      low: 107,
      close: 108,
      volume: 1_000_000,
    },
    indicators: {
      sma20: 110,
      sma50: 120,
      ema12: null,
      ema26: null,
      rsi14: 42,
      macd: -1,
      macdSignal: -0.5,
      macdHistogram: null,
      bb20Upper: 110,
      bb20Lower: 90,
      atr14: null,
    },
  };
}

function createMixedMarketData() {
  return {
    ticker: "MIXED",
    timestamp: Date.now(),
    price: {
      open: 100,
      high: 101,
      low: 99,
      close: 100,
      volume: 1_000_000,
    },
    indicators: {
      sma20: 101,
      sma50: 102,
      ema12: null,
      ema26: null,
      rsi14: 58,
      macd: -0.5,
      macdSignal: -1,
      macdHistogram: null,
      bb20Upper: 102,
      bb20Lower: 98,
      atr14: null,
    },
  };
}

describe("generateRealtimeSignal", () => {
  it("treats RSI above the midpoint as bullish momentum instead of a sell input", () => {
    const signal = generateRealtimeSignal(createMarketDataPoint(58) as Parameters<typeof generateRealtimeSignal>[0]);

    expect(signal.signalType).toBe("buy");
    expect(signal.indicators).toContain("RSI Uptrend");
  });

  it("treats RSI below the midpoint as bearish momentum instead of a buy input", () => {
    const signal = generateRealtimeSignal(createMarketDataPoint(42) as Parameters<typeof generateRealtimeSignal>[0]);

    expect(signal.signalType).toBe("sell");
    expect(signal.indicators).toContain("RSI Downtrend");
  });

  it("assigns high confidence when multiple indicators agree directionally", () => {
    const signal = generateRealtimeSignal(createConsensusMarketData() as Parameters<typeof generateRealtimeSignal>[0]);

    expect(signal.signalType).toBe("sell");
    expect(signal.confidence).toBeGreaterThanOrEqual(70);
  });

  it("returns hold with zero confidence when weighted buy and sell evidence is tied", () => {
    const signal = generateRealtimeSignal(createMixedMarketData() as Parameters<typeof generateRealtimeSignal>[0]);

    expect(signal.signalType).toBe("hold");
    expect(signal.confidence).toBe(0);
  });
});
