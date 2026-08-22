/**
 * Tests for Live Market Data Service
 * Verifies Alpha Vantage and Yahoo Finance API integration
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// Mock axios before importing the module
vi.mock("axios", () => {
  const mockAxios = {
    create: vi.fn(),
    isAxiosError: vi.fn((error) => error?.response !== undefined),
  };
  return { default: mockAxios };
});

vi.mock("./_core/env", () => ({
  ENV: { alphaVantageApiKey: "test-alpha-vantage-key" },
}));

import axios from "axios";
import * as liveMarketData from "./liveMarketData";

describe("Live Market Data Service", () => {
  let mockGet: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear the cache before each test
    liveMarketData.clearPriceCache();

    // Setup default mock for axios.create
    mockGet = vi.fn();
    const mockedAxios = axios as any;
    mockedAxios.create.mockReturnValue({
      get: mockGet,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchStockPrice", () => {
    it("should return null when both Alpha Vantage and Yahoo Finance fail", async () => {
      mockGet.mockRejectedValue(new Error("API Error"));

      const result = await liveMarketData.fetchStockPrice("INVALID");
      expect(result).toBeNull();
    });

    it("should handle valid Alpha Vantage stock price response", async () => {
      mockGet.mockResolvedValue({
        data: {
          "Global Quote": {
            "01. symbol": "AAPL",
            "05. price": "150.25",
            "09. change": "2.50",
            "10. change percent": "1.69%",
            "06. volume": "50000000",
          },
        },
      });

      const result = await liveMarketData.fetchStockPrice("AAPL");

      expect(result).not.toBeNull();
      if (result) {
        expect(result.ticker).toBe("AAPL");
        expect(result.price).toBe(150.25);
        expect(result.change).toBe(2.5);
        expect(result.changePercent).toBe(1.69);
        expect(result.volume).toBe(50000000);
        expect(result.timestamp).toBeDefined();
      }
    });

    it("should handle missing price data gracefully", async () => {
      mockGet.mockResolvedValue({
        data: {
          "Global Quote": {
            "01. symbol": "INVALID",
            // Missing "05. price"
          },
        },
      });

      const result = await liveMarketData.fetchStockPrice("INVALID");
      expect(result).toBeNull();
    });

    it("should handle invalid price values (zero or negative)", async () => {
      mockGet.mockResolvedValue({
        data: {
          "Global Quote": {
            "01. symbol": "TEST",
            "05. price": "0", // Invalid price
            "09. change": "0",
            "10. change percent": "0%",
            "06. volume": "0",
          },
        },
      });

      const result = await liveMarketData.fetchStockPrice("TEST");
      expect(result).toBeNull();
    });

    it("should handle network errors gracefully", async () => {
      mockGet.mockRejectedValue(new Error("Network timeout"));

      const result = await liveMarketData.fetchStockPrice("AAPL");
      expect(result).toBeNull();
    });

    it("should handle null response data", async () => {
      mockGet.mockResolvedValue({
        data: null,
      });

      const result = await liveMarketData.fetchStockPrice("AAPL");
      expect(result).toBeNull();
    });
  });

  describe("fetchStockPriceWithCache", () => {
    it("should cache price data and return cached value on subsequent calls", async () => {
      const mockResponse = {
        data: {
          "Global Quote": {
            "01. symbol": "AAPL",
            "05. price": "150.25",
            "09. change": "2.50",
            "10. change percent": "1.69%",
            "06. volume": "50000000",
          },
        },
      };

      mockGet.mockResolvedValue(mockResponse);

      // First call - should fetch from API
      const result1 = await liveMarketData.fetchStockPriceWithCache("AAPL");
      expect(result1).not.toBeNull();
      expect(mockGet).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const result2 = await liveMarketData.fetchStockPriceWithCache("AAPL");
      expect(result2).not.toBeNull();
      expect(mockGet).toHaveBeenCalledTimes(1); // Still 1, not 2

      // Verify cached data matches
      expect(result1?.price).toBe(result2?.price);
    });

    it("should return null when API fails and no cache exists", async () => {
      mockGet.mockRejectedValue(new Error("API Error"));

      const result = await liveMarketData.fetchStockPriceWithCache("UNKNOWN");
      expect(result).toBeNull();
    });
  });

  describe("clearPriceCache", () => {
    it("should clear cache for a specific ticker", async () => {
      const mockResponse = {
        data: {
          "Global Quote": {
            "01. symbol": "AAPL",
            "05. price": "150.25",
            "09. change": "2.50",
            "10. change percent": "1.69%",
            "06. volume": "50000000",
          },
        },
      };

      mockGet.mockResolvedValue(mockResponse);

      // Cache a price
      await liveMarketData.fetchStockPriceWithCache("AAPL");
      expect(mockGet).toHaveBeenCalledTimes(1);

      // Clear cache for AAPL
      liveMarketData.clearPriceCache("AAPL");

      // Fetch again - should call API again
      await liveMarketData.fetchStockPriceWithCache("AAPL");
      expect(mockGet).toHaveBeenCalledTimes(2);
    });

    it("should clear all cache when called without ticker", async () => {
      const mockResponse = {
        data: {
          "Global Quote": {
            "01. symbol": "AAPL",
            "05. price": "150.25",
            "09. change": "2.50",
            "10. change percent": "1.69%",
            "06. volume": "50000000",
          },
        },
      };

      mockGet.mockResolvedValue(mockResponse);

      // Cache multiple prices
      await liveMarketData.fetchStockPriceWithCache("AAPL");
      await liveMarketData.fetchStockPriceWithCache("GOOGL");
      expect(mockGet).toHaveBeenCalledTimes(2);

      // Clear all cache
      liveMarketData.clearPriceCache();

      // Fetch again - should call API for both
      await liveMarketData.fetchStockPriceWithCache("AAPL");
      await liveMarketData.fetchStockPriceWithCache("GOOGL");
      expect(mockGet).toHaveBeenCalledTimes(4);
    });
  });

  describe("getCachedPrice", () => {
    it("should return cached price if available", async () => {
      const mockResponse = {
        data: {
          "Global Quote": {
            "01. symbol": "AAPL",
            "05. price": "150.25",
            "09. change": "2.50",
            "10. change percent": "1.69%",
            "06. volume": "50000000",
          },
        },
      };

      mockGet.mockResolvedValue(mockResponse);

      // Cache a price
      await liveMarketData.fetchStockPriceWithCache("AAPL");

      // Get cached price without fetching
      const cached = liveMarketData.getCachedPrice("AAPL");
      expect(cached).not.toBeNull();
      expect(cached?.price).toBe(150.25);
    });

    it("should return null if price not cached", () => {
      const cached = liveMarketData.getCachedPrice("UNKNOWN");
      expect(cached).toBeNull();
    });
  });

  describe("fetchMultipleStockPrices", () => {
    it("should fetch multiple stock prices in batches", async () => {
      mockGet
        .mockResolvedValueOnce({
          data: {
            "Global Quote": {
              "01. symbol": "AAPL",
              "05. price": "150.25",
              "09. change": "2.50",
              "10. change percent": "1.69%",
              "06. volume": "50000000",
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            "Global Quote": {
              "01. symbol": "GOOGL",
              "05. price": "140.50",
              "09. change": "1.50",
              "10. change percent": "1.08%",
              "06. volume": "30000000",
            },
          },
        });

      const results = await liveMarketData.fetchMultipleStockPrices(["AAPL", "GOOGL"]);

      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].ticker).toBe("AAPL");
    });

    it("should handle partial failures in batch requests", async () => {
      mockGet
        .mockResolvedValueOnce({
          data: {
            "Global Quote": {
              "01. symbol": "AAPL",
              "05. price": "150.25",
              "09. change": "2.50",
              "10. change percent": "1.69%",
              "06. volume": "50000000",
            },
          },
        })
        .mockRejectedValueOnce(new Error("API Error")); // GOOGL fails

      const results = await liveMarketData.fetchMultipleStockPrices(["AAPL", "GOOGL"]);

      // Should return only successful results
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].ticker).toBe("AAPL");
    });
  });

  describe("fetchMarketData", () => {
    it("should return market data with available price info", async () => {
      mockGet.mockResolvedValue({
        data: {
          "Global Quote": {
            "01. symbol": "AAPL",
            "05. price": "150.25",
            "09. change": "2.50",
            "10. change percent": "1.69%",
            "06. volume": "50000000",
          },
        },
      });

      const result = await liveMarketData.fetchMarketData("AAPL");

      expect(result).not.toBeNull();
      if (result) {
        expect(result.ticker).toBe("AAPL");
        expect(result.currentPrice).toBe(150.25);
        expect(result.change).toBe(2.5);
        expect(result.changePercent).toBe(1.69);
        expect(result.volume).toBe(50000000);
      }
    });

    it("should return null when price fetch fails", async () => {
      mockGet.mockRejectedValue(new Error("API Error"));

      const result = await liveMarketData.fetchMarketData("INVALID");
      expect(result).toBeNull();
    });
  });

  describe("Price validation", () => {
    it("should handle non-numeric price strings", async () => {
      mockGet.mockResolvedValue({
        data: {
          "Global Quote": {
            "01. symbol": "TEST",
            "05. price": "invalid", // Non-numeric
            "09. change": "0",
            "10. change percent": "0%",
            "06. volume": "0",
          },
        },
      });

      const result = await liveMarketData.fetchStockPrice("TEST");
      expect(result).toBeNull();
    });

    it("should handle negative price values", async () => {
      mockGet.mockResolvedValue({
        data: {
          "Global Quote": {
            "01. symbol": "TEST",
            "05. price": "-50.00", // Negative
            "09. change": "0",
            "10. change percent": "0%",
            "06. volume": "0",
          },
        },
      });

      const result = await liveMarketData.fetchStockPrice("TEST");
      expect(result).toBeNull();
    });

    it("should handle very large price values", async () => {
      mockGet.mockResolvedValue({
        data: {
          "Global Quote": {
            "01. symbol": "TEST",
            "05. price": "999999.99",
            "09. change": "100.00",
            "10. change percent": "0.01%",
            "06. volume": "1000000",
          },
        },
      });

      const result = await liveMarketData.fetchStockPrice("TEST");
      expect(result).not.toBeNull();
      if (result) {
        expect(result.price).toBe(999999.99);
      }
    });
  });
});
