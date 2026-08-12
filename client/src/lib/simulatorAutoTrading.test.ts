import { describe, expect, it } from "vitest";

import { applyAutoExecutedTrades, type AutoExecutedTrade } from "./simulatorAutoTrading";
import { createEmptyPortfolio } from "./tradingSimulatorState";

describe("applyAutoExecutedTrades", () => {
  it("adds a new position and trade when the auto trader opens a buy position", () => {
    const portfolio = createEmptyPortfolio(1, "Signal Engine", 10_000);
    const trades: AutoExecutedTrade[] = [
      {
        ticker: "AAPL",
        type: "BUY",
        quantity: 10,
        executedPrice: 180,
        executionTime: "2026-04-28T12:00:00.000Z",
        totalCost: 1_801.8,
        priceSource: "live",
        confidence: 82,
        reasoning: "High-confidence buy signal",
      },
    ];

    const updated = applyAutoExecutedTrades(portfolio, trades);
    expect(updated.positions).toHaveLength(1);
    expect(updated.positions[0]).toMatchObject({ ticker: "AAPL", quantity: 10, entryPrice: 180 });
    expect(updated.cash).toBeCloseTo(8_198.2, 4);
    expect(updated.trades[0]).toMatchObject({ ticker: "AAPL", type: "buy", quantity: 10 });
  });

  it("closes an existing position and credits cash when the auto trader sells", () => {
    const portfolio = {
      ...createEmptyPortfolio(1, "Signal Engine", 10_000),
      cash: 8_000,
      currentValue: 10_300,
      totalReturn: 300,
      totalReturnPercent: 3,
      positions: [
        {
          ticker: "MSFT",
          quantity: 5,
          entryPrice: 400,
          currentPrice: 420,
          unrealizedPnL: 100,
          unrealizedPnLPercent: 5,
        },
      ],
      trades: [],
    };

    const trades: AutoExecutedTrade[] = [
      {
        ticker: "MSFT",
        type: "SELL",
        quantity: 5,
        executedPrice: 410,
        executionTime: "2026-04-28T12:05:00.000Z",
        totalCost: 2_047.95,
        priceSource: "live",
        confidence: 85,
        reasoning: "High-confidence sell signal",
      },
    ];

    const updated = applyAutoExecutedTrades(portfolio, trades);
    expect(updated.positions).toHaveLength(0);
    expect(updated.cash).toBeCloseTo(10_047.95, 4);
    expect(updated.trades[0]).toMatchObject({ ticker: "MSFT", type: "sell", quantity: 5 });
  });
});
