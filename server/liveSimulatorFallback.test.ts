import { beforeEach, describe, expect, it, vi } from "vitest";

const liveMarketDataMocks = vi.hoisted(() => ({
  fetchStockPriceWithCache: vi.fn(),
}));

vi.mock("./liveMarketData", () => ({
  fetchStockPriceWithCache: liveMarketDataMocks.fetchStockPriceWithCache,
}));

import { executeLiveTradeWithMarketPrice } from "./liveSimulator";

describe("live simulator trade fallback", () => {
  beforeEach(() => {
    liveMarketDataMocks.fetchStockPriceWithCache.mockReset();
  });

  it("uses the requested price when live market data is unavailable", async () => {
    liveMarketDataMocks.fetchStockPriceWithCache.mockResolvedValue(null);

    const result = await executeLiveTradeWithMarketPrice("NVDA", "BUY", 10, 890, 0.05, 0.1);

    expect(result.success).toBe(true);
    expect(result.priceSource).toBe("fallback");
    expect(result.executedPrice).toBeCloseTo(890.445);
    expect(result.totalCost).toBeCloseTo(8913.35445);
  });

  it("returns net proceeds for sell orders after commission", async () => {
    liveMarketDataMocks.fetchStockPriceWithCache.mockResolvedValue({
      ticker: "AAPL",
      price: 100,
      change: 0,
      changePercent: 0,
      timestamp: new Date().toISOString(),
      volume: 0,
    });

    const result = await executeLiveTradeWithMarketPrice("AAPL", "SELL", 10, 100, 0.05, 0.1);

    expect(result.success).toBe(true);
    expect(result.priceSource).toBe("live");
    expect(result.executedPrice).toBeCloseTo(99.95);
    expect(result.commission).toBeCloseTo(0.9995);
    expect(result.totalCost).toBeCloseTo(998.5005);
  });

  it("still fails if no live price exists and the requested price is invalid", async () => {
    liveMarketDataMocks.fetchStockPriceWithCache.mockResolvedValue(null);

    const result = await executeLiveTradeWithMarketPrice("MSFT", "BUY", 5, 0, 0.05, 0.1);

    expect(result.success).toBe(false);
    expect(result.priceSource).toBe("fallback");
    expect(result.error).toContain("no fallback price was provided");
  });
});
