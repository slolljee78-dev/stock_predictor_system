import { describe, expect, it } from "vitest";
import {
  getActionableWatchlistCounts,
  getLiveSignalCoverage,
  getResolvedWatchlistPresentation,
} from "./dashboardWatchlistSignals";

describe("dashboardWatchlistSignals", () => {
  it("counts only live buy and sell statuses as actionable", () => {
    const counts = getActionableWatchlistCounts([
      { ticker: "AAPL", state: "buy", badge: "Buy", detail: "Bullish setup" },
      { ticker: "MSFT", state: "sell", badge: "Sell", detail: "Bearish setup" },
      { ticker: "NVDA", state: "hold", badge: "Hold", detail: "Mixed signals" },
      { ticker: "TSLA", state: "low_confidence", badge: "Low confidence", detail: "Below threshold" },
    ]);

    expect(counts).toEqual({ buyCount: 1, sellCount: 1 });
  });

  it("calculates coverage from live actionable statuses instead of historical rows", () => {
    const coverage = getLiveSignalCoverage(
      [
        { ticker: "AAPL", state: "buy", badge: "Buy", detail: "Bullish setup" },
        { ticker: "MSFT", state: "sell", badge: "Sell", detail: "Bearish setup" },
        { ticker: "NVDA", state: "hold", badge: "Hold", detail: "Mixed signals" },
        { ticker: "TSLA", state: "low_confidence", badge: "Low confidence", detail: "Below threshold" },
      ],
      4,
    );

    expect(coverage).toBe(50);
  });

  it("prefers live status when it disagrees with an older stored signal", () => {
    const presentation = getResolvedWatchlistPresentation(
      "AAPL",
      { ticker: "AAPL", state: "hold", badge: "Hold", detail: "Mixed signals detected." },
      { ticker: "AAPL", type: "sell" },
    );

    expect(presentation).toEqual({
      ticker: "AAPL",
      statusLabel: "Hold",
      statusDetail: "Mixed signals detected.",
      statusTone: "hold",
      source: "live",
    });
  });

  it("falls back to stored signal when no live status is available", () => {
    const presentation = getResolvedWatchlistPresentation(
      "MSFT",
      undefined,
      { ticker: "MSFT", type: "sell" },
    );

    expect(presentation).toEqual({
      ticker: "MSFT",
      statusLabel: "Sell",
      statusDetail: "This stock currently has an active sell setup.",
      statusTone: "sell",
      source: "stored",
    });
  });

  it("returns a neutral placeholder when neither live nor stored data exists", () => {
    const presentation = getResolvedWatchlistPresentation("GOOGL");

    expect(presentation).toEqual({
      ticker: "GOOGL",
      statusLabel: "No active setup",
      statusDetail: "We are still monitoring this stock for a stronger setup.",
      statusTone: "no_active_setup",
      source: "empty",
    });
  });
});
