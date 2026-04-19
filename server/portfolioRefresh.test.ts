/**
 * Tests for Portfolio Refresh Service
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { refreshPortfolioPrices, getRefreshStatistics, PortfolioPosition } from "./portfolioRefresh";

// Mock the liveMarketData module
vi.mock("./liveMarketData", () => ({
  fetchStockPriceWithCache: vi.fn(),
}));

import { fetchStockPriceWithCache } from "./liveMarketData";

describe("Portfolio Refresh Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("refreshPortfolioPrices", () => {
    it("should refresh prices for all positions", async () => {
      const mockFetch = fetchStockPriceWithCache as any;
      mockFetch.mockResolvedValue({ price: 150.25, timestamp: new Date().toISOString() });

      const positions: PortfolioPosition[] = [
        { ticker: "AAPL", quantity: 10, entryPrice: 140 },
        { ticker: "GOOGL", quantity: 5, entryPrice: 130 },
      ];

      const result = await refreshPortfolioPrices(positions, 1000);

      expect(result.totalPositions).toBe(2);
      expect(result.successfulUpdates).toBe(2);
      expect(result.failedUpdates).toBe(0);
      expect(result.results).toHaveLength(2);
    });

    it("should handle partial failures gracefully", async () => {
      const mockFetch = fetchStockPriceWithCache as any;
      mockFetch
        .mockResolvedValueOnce({ price: 150.25, timestamp: new Date().toISOString() })
        .mockResolvedValueOnce(null); // Second call fails

      const positions: PortfolioPosition[] = [
        { ticker: "AAPL", quantity: 10, entryPrice: 140 },
        { ticker: "GOOGL", quantity: 5, entryPrice: 130 },
      ];

      const result = await refreshPortfolioPrices(positions, 1000);

      expect(result.totalPositions).toBe(2);
      expect(result.successfulUpdates).toBe(1);
      expect(result.failedUpdates).toBe(1);
    });

    it("should calculate portfolio value correctly", async () => {
      const mockFetch = fetchStockPriceWithCache as any;
      mockFetch.mockResolvedValue({ price: 150, timestamp: new Date().toISOString() });

      const positions: PortfolioPosition[] = [
        { ticker: "AAPL", quantity: 10, entryPrice: 140 }, // 10 * 150 = 1500
      ];

      const result = await refreshPortfolioPrices(positions, 500); // Cash: 500

      expect(result.totalValue).toBe(1500); // Position value
      expect(result.totalCash).toBe(500);
      expect(result.portfolioValue).toBe(2000); // Total value + cash
    });

    it("should calculate price changes correctly", async () => {
      const mockFetch = fetchStockPriceWithCache as any;
      mockFetch.mockResolvedValue({ price: 160, timestamp: new Date().toISOString() });

      const positions: PortfolioPosition[] = [
        { ticker: "AAPL", quantity: 10, entryPrice: 140 },
      ];

      const previousPrices = new Map([["AAPL", 150]]);
      const result = await refreshPortfolioPrices(positions, 0, previousPrices);

      expect(result.results[0].currentPrice).toBe(160);
      expect(result.results[0].previousPrice).toBe(150);
      expect(result.results[0].change).toBe(10);
      expect(result.results[0].changePercent).toBeCloseTo(6.67, 1);
    });

    it("should handle empty portfolio", async () => {
      const result = await refreshPortfolioPrices([], 1000);

      expect(result.totalPositions).toBe(0);
      expect(result.successfulUpdates).toBe(0);
      expect(result.failedUpdates).toBe(0);
      expect(result.totalValue).toBe(0);
      expect(result.portfolioValue).toBe(1000);
    });

    it("should handle API errors gracefully", async () => {
      const mockFetch = fetchStockPriceWithCache as any;
      mockFetch.mockRejectedValue(new Error("API Error"));

      const positions: PortfolioPosition[] = [
        { ticker: "AAPL", quantity: 10, entryPrice: 140 },
      ];

      const result = await refreshPortfolioPrices(positions, 1000);

      expect(result.failedUpdates).toBe(1);
      expect(result.results[0].error).toBeDefined();
    });

    it("should include refresh timestamp", async () => {
      const mockFetch = fetchStockPriceWithCache as any;
      mockFetch.mockResolvedValue({ price: 150, timestamp: new Date().toISOString() });

      const positions: PortfolioPosition[] = [
        { ticker: "AAPL", quantity: 10, entryPrice: 140 },
      ];

      const result = await refreshPortfolioPrices(positions, 1000);

      expect(result.refreshedAt).toBeDefined();
      expect(new Date(result.refreshedAt)).toBeInstanceOf(Date);
    });
  });

  describe("getRefreshStatistics", () => {
    it("should calculate success rate", () => {
      const mockResult = {
        totalPositions: 10,
        successfulUpdates: 8,
        failedUpdates: 2,
        results: [],
        totalValue: 0,
        totalCash: 0,
        portfolioValue: 0,
        totalReturn: 0,
        totalReturnPercent: 0,
        refreshedAt: new Date().toISOString(),
      };

      const stats = getRefreshStatistics(mockResult);

      expect(stats.successRate).toBe("80.0");
      expect(stats.failureRate).toBe("20.0");
    });

    it("should calculate average change percent", () => {
      const mockResult = {
        totalPositions: 3,
        successfulUpdates: 3,
        failedUpdates: 0,
        results: [
          {
            ticker: "AAPL",
            currentPrice: 160,
            previousPrice: 150,
            change: 10,
            changePercent: 6.67,
            timestamp: new Date().toISOString(),
          },
          {
            ticker: "GOOGL",
            currentPrice: 140,
            previousPrice: 140,
            change: 0,
            changePercent: 0,
            timestamp: new Date().toISOString(),
          },
          {
            ticker: "MSFT",
            currentPrice: 380,
            previousPrice: 400,
            change: -20,
            changePercent: -5,
            timestamp: new Date().toISOString(),
          },
        ],
        totalValue: 0,
        totalCash: 0,
        portfolioValue: 0,
        totalReturn: 0,
        totalReturnPercent: 0,
        refreshedAt: new Date().toISOString(),
      };

      const stats = getRefreshStatistics(mockResult);

      expect(parseFloat(stats.averageChangePercent)).toBeCloseTo(0.56, 1);
    });

    it("should identify best and worst performers", () => {
      const mockResult = {
        totalPositions: 3,
        successfulUpdates: 3,
        failedUpdates: 0,
        results: [
          {
            ticker: "AAPL",
            currentPrice: 160,
            previousPrice: 150,
            change: 10,
            changePercent: 6.67,
            timestamp: new Date().toISOString(),
          },
          {
            ticker: "GOOGL",
            currentPrice: 140,
            previousPrice: 140,
            change: 0,
            changePercent: 0,
            timestamp: new Date().toISOString(),
          },
          {
            ticker: "MSFT",
            currentPrice: 380,
            previousPrice: 400,
            change: -20,
            changePercent: -5,
            timestamp: new Date().toISOString(),
          },
        ],
        totalValue: 0,
        totalCash: 0,
        portfolioValue: 0,
        totalReturn: 0,
        totalReturnPercent: 0,
        refreshedAt: new Date().toISOString(),
      };

      const stats = getRefreshStatistics(mockResult);

      expect(stats.bestPerformer?.ticker).toBe("AAPL");
      expect(stats.worstPerformer?.ticker).toBe("MSFT");
    });

    it("should handle empty results", () => {
      const mockResult = {
        totalPositions: 0,
        successfulUpdates: 0,
        failedUpdates: 0,
        results: [],
        totalValue: 0,
        totalCash: 0,
        portfolioValue: 0,
        totalReturn: 0,
        totalReturnPercent: 0,
        refreshedAt: new Date().toISOString(),
      };

      const stats = getRefreshStatistics(mockResult);

      expect(stats.successRate).toBe("0.0");
      expect(stats.averageChangePercent).toBe("0.00");
    });
  });

  describe("Rate Limiting", () => {
    it("should respect rate limiting between requests", async () => {
      const mockFetch = fetchStockPriceWithCache as any;
      mockFetch.mockResolvedValue({ price: 150, timestamp: new Date().toISOString() });

      const positions: PortfolioPosition[] = [
        { ticker: "AAPL", quantity: 10, entryPrice: 140 },
        { ticker: "GOOGL", quantity: 5, entryPrice: 130 },
        { ticker: "MSFT", quantity: 8, entryPrice: 350 },
      ];

      const startTime = Date.now();
      await refreshPortfolioPrices(positions, 1000);
      const endTime = Date.now();

      // Should take at least 600ms (300ms * 2 intervals between 3 requests)
      expect(endTime - startTime).toBeGreaterThanOrEqual(600);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large portfolios", async () => {
      const mockFetch = fetchStockPriceWithCache as any;
      mockFetch.mockResolvedValue({ price: 150, timestamp: new Date().toISOString() });

      const positions: PortfolioPosition[] = Array.from({ length: 50 }, (_, i) => ({
        ticker: `TICK${i}`,
        quantity: 10,
        entryPrice: 100,
      }));

      const result = await refreshPortfolioPrices(positions, 10000);

      expect(result.totalPositions).toBe(50);
      expect(result.successfulUpdates).toBe(50);
    });

    it("should handle zero cash balance", async () => {
      const mockFetch = fetchStockPriceWithCache as any;
      mockFetch.mockResolvedValue({ price: 150, timestamp: new Date().toISOString() });

      const positions: PortfolioPosition[] = [
        { ticker: "AAPL", quantity: 10, entryPrice: 140 },
      ];

      const result = await refreshPortfolioPrices(positions, 0);

      expect(result.totalCash).toBe(0);
      expect(result.portfolioValue).toBe(1500);
    });

    it("should handle positions with zero quantity", async () => {
      const mockFetch = fetchStockPriceWithCache as any;
      mockFetch.mockResolvedValue({ price: 150, timestamp: new Date().toISOString() });

      const positions: PortfolioPosition[] = [
        { ticker: "AAPL", quantity: 0, entryPrice: 140 },
      ];

      // This should be prevented at validation level, but service should handle it
      const result = await refreshPortfolioPrices(positions, 1000);

      expect(result.totalPositions).toBe(1);
    });
  });
});
