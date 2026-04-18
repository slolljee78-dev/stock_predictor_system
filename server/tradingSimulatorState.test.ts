import { describe, expect, it } from "vitest";

import {
  createDefaultTradingSimulatorState,
  createEmptyPortfolio,
  getSelectedPortfolio,
  getTradePriceSourceLabel,
  loadTradingSimulatorState,
  normalizeTradingSimulatorState,
  saveTradingSimulatorState,
} from "../client/src/lib/tradingSimulatorState";

describe("trading simulator state persistence", () => {
  it("loads the default seeded simulator state when storage is empty", () => {
    const storage = {
      getItem: () => null,
    };

    const state = loadTradingSimulatorState(storage);

    expect(state.portfolios.length).toBeGreaterThan(0);
    expect(getSelectedPortfolio(state).positions.length).toBeGreaterThan(0);
  });

  it("saves and restores separate simulator portfolios with their own trades and positions", () => {
    let storedValue: string | null = null;
    const storage = {
      getItem: () => storedValue,
      setItem: (_key: string, value: string) => {
        storedValue = value;
      },
    };

    const state = createDefaultTradingSimulatorState();
    state.portfolios.push({
      ...createEmptyPortfolio(2, "Income Portfolio", 25000),
      positions: [
        {
          ticker: "MSFT",
          quantity: 12,
          entryPrice: 410,
          currentPrice: 415,
          unrealizedPnL: 60,
          unrealizedPnLPercent: 1.22,
        },
      ],
      trades: [
        {
          id: 1,
          ticker: "MSFT",
          type: "buy",
          quantity: 12,
          price: 410,
          date: "2026-04-18 09:15",
          priceSource: "live",
        },
      ],
    });
    state.selectedPortfolioId = 2;

    saveTradingSimulatorState(state, storage);
    const restored = loadTradingSimulatorState(storage);

    expect(storedValue).not.toBeNull();
    expect(restored.selectedPortfolioId).toBe(2);
    expect(getSelectedPortfolio(restored).name).toBe("Income Portfolio");
    expect(getSelectedPortfolio(restored).positions[0]?.ticker).toBe("MSFT");
    expect(getSelectedPortfolio(restored).trades[0]?.priceSource).toBe("live");
  });

  it("falls back to the first stored portfolio when the saved selected portfolio is invalid", () => {
    const normalized = normalizeTradingSimulatorState({
      portfolios: [createEmptyPortfolio(3, "Recovery")],
      selectedPortfolioId: 999,
    });

    expect(normalized.selectedPortfolioId).toBe(3);
    expect(getSelectedPortfolio(normalized).name).toBe("Recovery");
  });

  it("returns customer-friendly price-source labels", () => {
    expect(getTradePriceSourceLabel("live")).toBe("Live market price");
    expect(getTradePriceSourceLabel("fallback")).toBe("Manual fallback price");
  });
});
