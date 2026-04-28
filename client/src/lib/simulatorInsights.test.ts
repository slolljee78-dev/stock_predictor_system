import { describe, expect, it } from "vitest";

import {
  calculateSimulatorPerformanceSummary,
  filterTradesByOrigin,
  formatHoldingTime,
  getRiskProfile,
} from "./simulatorInsights";
import { createEmptyPortfolio, type SimulatorPortfolio } from "./tradingSimulatorState";

function createPortfolioWithTrades(): SimulatorPortfolio {
  const portfolio = createEmptyPortfolio(1, "Test Portfolio", 10000);
  return {
    ...portfolio,
    cash: 9500,
    currentValue: 10380,
    totalReturn: 380,
    totalReturnPercent: 3.8,
    positions: [
      {
        ticker: "MSFT",
        quantity: 2,
        entryPrice: 300,
        currentPrice: 340,
        unrealizedPnL: 80,
        unrealizedPnLPercent: 13.33,
      },
    ],
    trades: [
      {
        id: 5,
        ticker: "MSFT",
        type: "buy",
        quantity: 2,
        price: 300,
        date: "4/12/2026, 3:00:00 PM",
        executedAt: "2026-04-12T15:00:00.000Z",
        priceSource: "live",
        origin: "auto",
        confidence: 79,
        reasoning: "Momentum breakout",
        riskProfile: "balanced",
      },
      {
        id: 4,
        ticker: "NVDA",
        type: "sell",
        quantity: 1,
        price: 850,
        date: "4/12/2026, 2:00:00 PM",
        executedAt: "2026-04-12T14:00:00.000Z",
        priceSource: "live",
        origin: "auto",
        confidence: 83,
        reasoning: "Trend rolled over",
        riskProfile: "balanced",
      },
      {
        id: 3,
        ticker: "NVDA",
        type: "buy",
        quantity: 1,
        price: 900,
        date: "4/12/2026, 10:00:00 AM",
        executedAt: "2026-04-12T10:00:00.000Z",
        priceSource: "live",
        origin: "manual",
      },
      {
        id: 2,
        ticker: "AAPL",
        type: "sell",
        quantity: 2,
        price: 195,
        date: "4/11/2026, 12:00:00 PM",
        executedAt: "2026-04-11T12:00:00.000Z",
        priceSource: "live",
        origin: "manual",
      },
      {
        id: 1,
        ticker: "AAPL",
        type: "buy",
        quantity: 2,
        price: 180,
        date: "4/11/2026, 9:30:00 AM",
        executedAt: "2026-04-11T09:30:00.000Z",
        priceSource: "live",
        origin: "manual",
      },
    ],
  };
}

describe("simulatorInsights", () => {
  it("returns the expected risk profile presets", () => {
    const conservative = getRiskProfile("conservative");
    const aggressive = getRiskProfile("aggressive");

    expect(conservative.minConfidence).toBeGreaterThan(aggressive.minConfidence);
    expect(conservative.positionSizePercent).toBeLessThan(aggressive.positionSizePercent);
    expect(aggressive.maxTradesPerRound).toBeGreaterThan(conservative.maxTradesPerRound);
  });

  it("filters trade history by origin", () => {
    const portfolio = createPortfolioWithTrades();

    expect(filterTradesByOrigin(portfolio.trades, "all")).toHaveLength(5);
    expect(filterTradesByOrigin(portfolio.trades, "manual")).toHaveLength(3);
    expect(filterTradesByOrigin(portfolio.trades, "auto")).toHaveLength(2);
  });

  it("calculates realised and unrealised performance summary metrics", () => {
    const portfolio = createPortfolioWithTrades();
    const summary = calculateSimulatorPerformanceSummary(portfolio);

    expect(summary.closedTrades).toBe(2);
    expect(summary.winningTrades).toBe(1);
    expect(summary.winRate).toBe(50);
    expect(summary.realizedPnL).toBeCloseTo(-20);
    expect(summary.unrealizedPnL).toBeCloseTo(80);
    expect(summary.manualTrades).toBe(3);
    expect(summary.autoTrades).toBe(2);
    expect(summary.bestTrade?.ticker).toBe("AAPL");
    expect(summary.worstTrade?.ticker).toBe("NVDA");
    expect(summary.averageHoldingMinutes).toBe(195);
  });

  it("formats average holding time labels for empty, minute, and hour durations", () => {
    expect(formatHoldingTime(null)).toBe("Not enough closed trades yet");
    expect(formatHoldingTime(45)).toBe("45m average hold");
    expect(formatHoldingTime(135)).toBe("2h 15m average hold");
  });
});
