import { describe, expect, it } from "vitest";
import { classifyWatchlistSignalStatus } from "./watchlistStatuses";

describe("watchlist status classification", () => {
  it("marks strong buy signals as actionable", () => {
    const result = classifyWatchlistSignalStatus(
      {
        ticker: "AAPL",
        signalType: "buy",
        confidence: 62,
        price: 187.12,
        timestamp: Date.now(),
        indicators: ["MACD Bullish"],
        reasoning: "BUY signal triggered by: MACD Bullish.",
        technicalData: {
          rsi: 44,
          macd: 1.2,
          smaPosition: "above",
          bbPosition: "upper",
        },
      },
      25,
    );

    expect(result.state).toBe("buy");
    expect(result.badge).toBe("Buy");
  });

  it("marks weak directional signals as low confidence", () => {
    const result = classifyWatchlistSignalStatus(
      {
        ticker: "NVDA",
        signalType: "sell",
        confidence: 18,
        price: 901.44,
        timestamp: Date.now(),
        indicators: ["RSI Overbought"],
        reasoning: "SELL signal triggered by: RSI Overbought.",
        technicalData: {
          rsi: 74,
          macd: -0.3,
          smaPosition: "below",
          bbPosition: "upper",
        },
      },
      25,
    );

    expect(result.state).toBe("low_confidence");
    expect(result.badge).toBe("Low confidence");
    expect(result.detail).toContain("below the 25% action threshold");
  });

  it("uses hold when indicators are mixed", () => {
    const result = classifyWatchlistSignalStatus(
      {
        ticker: "GOOGL",
        signalType: "hold",
        confidence: 22,
        price: 164.2,
        timestamp: Date.now(),
        indicators: ["MACD Crossover", "RSI Uptrend"],
        reasoning: "Mixed signals detected. Hold current position.",
        technicalData: {
          rsi: 51,
          macd: 0.1,
          smaPosition: "neutral",
          bbPosition: "middle",
        },
      },
      25,
    );

    expect(result.state).toBe("hold");
    expect(result.badge).toBe("Hold");
  });

  it("uses no active setup when there are no trigger indicators", () => {
    const result = classifyWatchlistSignalStatus(
      {
        ticker: "TSLA",
        signalType: "hold",
        confidence: 0,
        price: 171.4,
        timestamp: Date.now(),
        indicators: [],
        reasoning: "",
        technicalData: {
          rsi: null,
          macd: null,
          smaPosition: "neutral",
          bbPosition: "middle",
        },
      },
      25,
    );

    expect(result.state).toBe("no_active_setup");
    expect(result.badge).toBe("No active setup");
  });

  it("handles missing market data gracefully", () => {
    const result = classifyWatchlistSignalStatus(null, 25);

    expect(result.state).toBe("data_unavailable");
    expect(result.badge).toBe("Data unavailable");
    expect(result.confidence).toBeNull();
  });
});
