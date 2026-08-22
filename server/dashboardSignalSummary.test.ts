import { describe, expect, it } from "vitest";
import {
  getDailyStockSignalSummary,
  getLatestSignalsByTicker,
  getUniqueActionableCounts,
} from "../client/src/lib/dashboardSignalSummary";

describe("dashboard signal summary", () => {
  const baseSignals = [
    { ticker: "AAPL", type: "sell" as const, createdAt: "2026-04-24T08:00:00.000Z" },
    { ticker: "AAPL", type: "sell" as const, createdAt: "2026-04-24T06:00:00.000Z" },
    { ticker: "MSFT", type: "sell" as const, createdAt: "2026-04-23T09:00:00.000Z" },
    { ticker: "NVDA", type: "buy" as const, createdAt: "2026-04-22T09:00:00.000Z" },
    { ticker: "NVDA", type: "sell" as const, createdAt: "2026-04-21T09:00:00.000Z" },
  ];

  it("keeps only the latest actionable signal per ticker", () => {
    const latest = getLatestSignalsByTicker(baseSignals);

    expect(Object.keys(latest)).toHaveLength(3);
    expect(latest.AAPL.createdAt).toBe("2026-04-24T08:00:00.000Z");
    expect(latest.NVDA.type).toBe("buy");
  });

  it("counts unique actionable stocks instead of raw signal records", () => {
    expect(getUniqueActionableCounts(baseSignals)).toEqual({
      buyCount: 1,
      sellCount: 2,
    });
  });

  it("summarizes daily activity using unique tickers per day and direction", () => {
    const realDateNow = Date.now;
    Date.now = () => new Date("2026-04-24T12:00:00.000Z").getTime();

    try {
      const summary = getDailyStockSignalSummary(baseSignals, 4);

      expect(summary).toEqual([
        { date: "2026-04-21", buyCount: 0, sellCount: 1 },
        { date: "2026-04-22", buyCount: 1, sellCount: 0 },
        { date: "2026-04-23", buyCount: 0, sellCount: 1 },
        { date: "2026-04-24", buyCount: 0, sellCount: 1 },
      ]);
    } finally {
      Date.now = realDateNow;
    }
  });
});
