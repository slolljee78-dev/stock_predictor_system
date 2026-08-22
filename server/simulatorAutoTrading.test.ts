import { describe, expect, it } from "vitest";

import {
  DEFAULT_AUTO_TRADING_MAX_OPEN_POSITIONS,
  planAutoTradingRound,
  selectAutoTradingUniverse,
  type AutoTradingSignalSnapshot,
  type AutoTradingUniverseStock,
} from "./simulatorAutoTrading";

const STOCKS: AutoTradingUniverseStock[] = [
  { ticker: "AAPL", name: "Apple", type: "equity", exchange: "NASDAQ", sector: "Technology" },
  { ticker: "MSFT", name: "Microsoft", type: "equity", exchange: "NASDAQ", sector: "Technology" },
  { ticker: "NVDA", name: "NVIDIA", type: "equity", exchange: "NASDAQ", sector: "Technology" },
  { ticker: "TSLA", name: "Tesla", type: "equity", exchange: "NASDAQ", sector: "Consumer" },
];

const SIGNALS: AutoTradingSignalSnapshot[] = [
  { ticker: "AAPL", name: "Apple", sector: "Technology", signalType: "buy", confidence: 88, currentPrice: 180 },
  { ticker: "MSFT", name: "Microsoft", sector: "Technology", signalType: "sell", confidence: 84, currentPrice: 410 },
  { ticker: "NVDA", name: "NVIDIA", sector: "Technology", signalType: "buy", confidence: 92, currentPrice: 900 },
  { ticker: "TSLA", name: "Tesla", sector: "Consumer", signalType: "hold", confidence: 91, currentPrice: 170 },
];

describe("selectAutoTradingUniverse", () => {
  it("returns locked tickers when a session already has a selected universe", () => {
    const universe = selectAutoTradingUniverse(STOCKS, 3, ["MSFT", "AAPL"]);
    expect(universe.map((stock) => stock.ticker)).toEqual(["MSFT", "AAPL"]);
  });

  it("keeps every watchlist ticker available, including tickers outside the curated basket", () => {
    const universe = selectAutoTradingUniverse(STOCKS, 2, ["MSFT", "AAPL", "VUSA"]);

    expect(universe.map((stock) => stock.ticker)).toEqual(["MSFT", "AAPL", "VUSA"]);
    expect(universe.find((stock) => stock.ticker === "VUSA")).toMatchObject({
      exchange: "User watchlist",
      sector: "User watchlist",
    });
  });

  it("builds a deterministic shuffled universe when random values are provided", () => {
    const randomValues = [0.9, 0.2, 0.5];
    const universe = selectAutoTradingUniverse(STOCKS, 2, [], () => randomValues.shift() ?? 0);
    expect(universe).toHaveLength(2);
    expect(new Set(universe.map((stock) => stock.ticker)).size).toBe(2);
  });
});

describe("planAutoTradingRound", () => {
  it("prioritises sells for currently held positions before new buys", () => {
    const result = planAutoTradingRound({
      signals: SIGNALS,
      positions: [{ ticker: "MSFT", quantity: 4, averagePrice: 390 }],
      cashBalance: 10_000,
      config: {
        minConfidence: 80,
        maxTradesPerRound: 2,
        positionSizePercent: 20,
      },
    });

    expect(result.actions).toHaveLength(2);
    expect(result.actions[0]).toMatchObject({ ticker: "MSFT", type: "SELL", quantity: 4 });
    expect(result.actions[1]).toMatchObject({ ticker: "NVDA", type: "BUY" });
  });

  it("skips low-confidence and hold signals", () => {
    const result = planAutoTradingRound({
      signals: SIGNALS,
      positions: [],
      cashBalance: 5_000,
      config: {
        minConfidence: 90,
        maxTradesPerRound: 3,
        positionSizePercent: 25,
      },
    });

    expect(result.actionableSignals.map((signal) => signal.ticker)).toEqual(["NVDA"]);
    expect(result.actions).toHaveLength(1);
    expect(result.actions[0]).toMatchObject({ ticker: "NVDA", type: "BUY" });
  });

  it("respects the max open positions guardrail", () => {
    const result = planAutoTradingRound({
      signals: SIGNALS,
      positions: Array.from({ length: DEFAULT_AUTO_TRADING_MAX_OPEN_POSITIONS }, (_, index) => ({
        ticker: `HELD${index}`,
        quantity: 1,
        averagePrice: 100,
      })),
      cashBalance: 20_000,
      config: {
        minConfidence: 70,
        maxTradesPerRound: 3,
        positionSizePercent: 15,
        maxOpenPositions: DEFAULT_AUTO_TRADING_MAX_OPEN_POSITIONS,
      },
    });

    expect(result.actions.every((action) => action.type !== "BUY")).toBe(true);
  });
});
