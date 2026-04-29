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
});
