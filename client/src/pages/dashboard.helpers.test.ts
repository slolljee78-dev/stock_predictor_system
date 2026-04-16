import { describe, it, expect } from "vitest";
import {
  calculateSignalCoverage,
  getQuickAddStockSelection,
  isStockAlreadyInWatchlist,
} from "./dashboard.helpers";

describe("dashboard.helpers", () => {
  describe("calculateSignalCoverage", () => {
    it("returns 0 when watchlist is empty", () => {
      const watchlist: any[] = [];
      const signals: any[] = [];
      expect(calculateSignalCoverage(watchlist, signals)).toBe(0);
    });

    it("returns 0 when no signals match watchlist tickers", () => {
      const watchlist = [
        { ticker: "AAPL", stockId: 1 },
        { ticker: "GOOGL", stockId: 2 },
      ];
      const signals = [
        { ticker: "MSFT" },
        { ticker: "TSLA" },
      ];
      expect(calculateSignalCoverage(watchlist, signals)).toBe(0);
    });

    it("returns 100 when all watchlist stocks have signals", () => {
      const watchlist = [
        { ticker: "AAPL", stockId: 1 },
        { ticker: "GOOGL", stockId: 2 },
      ];
      const signals = [
        { ticker: "AAPL" },
        { ticker: "GOOGL" },
      ];
      expect(calculateSignalCoverage(watchlist, signals)).toBe(100);
    });

    it("returns 50 when half of watchlist stocks have signals", () => {
      const watchlist = [
        { ticker: "AAPL", stockId: 1 },
        { ticker: "GOOGL", stockId: 2 },
        { ticker: "MSFT", stockId: 3 },
        { ticker: "TSLA", stockId: 4 },
      ];
      const signals = [
        { ticker: "AAPL" },
        { ticker: "GOOGL" },
      ];
      expect(calculateSignalCoverage(watchlist, signals)).toBe(50);
    });

    it("caps coverage at 100 even with duplicate signals", () => {
      const watchlist = [
        { ticker: "AAPL", stockId: 1 },
      ];
      const signals = [
        { ticker: "AAPL" },
        { ticker: "AAPL" },
        { ticker: "AAPL" },
      ];
      expect(calculateSignalCoverage(watchlist, signals)).toBe(100);
    });
  });

  describe("isStockAlreadyInWatchlist", () => {
    it("returns false when watchlist is empty", () => {
      const watchlist: any[] = [];
      const stock = { id: 1, ticker: "AAPL" };
      expect(isStockAlreadyInWatchlist(watchlist, stock)).toBe(false);
    });

    it("returns true when stock is in watchlist by stockId", () => {
      const watchlist = [
        { ticker: "AAPL", stockId: 1 },
        { ticker: "GOOGL", stockId: 2 },
      ];
      const stock = { id: 1, ticker: "AAPL" };
      expect(isStockAlreadyInWatchlist(watchlist, stock)).toBe(true);
    });

    it("returns true when stock is in watchlist by ticker", () => {
      const watchlist = [
        { ticker: "AAPL", stockId: null },
        { ticker: "GOOGL", stockId: 2 },
      ];
      const stock = { id: 999, ticker: "AAPL" };
      expect(isStockAlreadyInWatchlist(watchlist, stock)).toBe(true);
    });

    it("returns false when stock is not in watchlist", () => {
      const watchlist = [
        { ticker: "AAPL", stockId: 1 },
        { ticker: "GOOGL", stockId: 2 },
      ];
      const stock = { id: 3, ticker: "MSFT" };
      expect(isStockAlreadyInWatchlist(watchlist, stock)).toBe(false);
    });

    it("handles mixed stockId presence", () => {
      const watchlist = [
        { ticker: "AAPL", stockId: 1 },
        { ticker: "GOOGL", stockId: null },
        { ticker: "MSFT", stockId: 3 },
      ];
      const stock = { id: 2, ticker: "GOOGL" };
      expect(isStockAlreadyInWatchlist(watchlist, stock)).toBe(true);
    });
  });

  describe("getQuickAddStockSelection", () => {
    it("opens the add-stock panel for a preselected ticker", () => {
      expect(getQuickAddStockSelection("GOOGL")).toEqual({
        isAddStockOpen: true,
        searchQuery: "GOOGL",
      });
    });

    it("preserves the chosen ticker so quick selection stays deterministic", () => {
      expect(getQuickAddStockSelection("NVDA").searchQuery).toBe("NVDA");
      expect(getQuickAddStockSelection("AAPL").isAddStockOpen).toBe(true);
    });
  });
});
