/**
 * Tests for Ticker Validation Service
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import axios from "axios";

// Mock axios before importing the module
vi.mock("axios", () => {
  const mockAxios = {
    get: vi.fn(),
  };
  return { default: mockAxios };
});

import {
  validateTicker,
  validateMultipleTickers,
  getSuggestionsForTicker,
  getSupportedExchanges,
  clearValidationCache,
} from "./tickerValidation";

describe("Ticker Validation Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearValidationCache();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("validateTicker", () => {
    it("should return isSupported=true for valid ticker with price data", async () => {
      const mockAxios = axios as any;
      mockAxios.get.mockResolvedValue({
        data: {
          "Global Quote": {
            "01. symbol": "AAPL",
            "05. price": "150.25",
            "08. currency": "USD",
          },
        },
      });

      const result = await validateTicker("AAPL");

      expect(result.ticker).toBe("AAPL");
      expect(result.isSupported).toBe(true);
      expect(result.currency).toBe("USD");
      expect(result.name).toBe("AAPL");
    });

    it("should return isSupported=false for invalid ticker", async () => {
      const mockAxios = axios as any;
      mockAxios.get.mockResolvedValue({
        data: {
          "Global Quote": {
            "01. symbol": "INVALID",
            // Missing price data
          },
        },
      });

      const result = await validateTicker("INVALID");

      expect(result.ticker).toBe("INVALID");
      expect(result.isSupported).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle API rate limiting error", async () => {
      const mockAxios = axios as any;
      mockAxios.get.mockResolvedValue({
        data: {
          "Note": "Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute.",
        },
      });

      const result = await validateTicker("AAPL");

      expect(result.isSupported).toBe(false);
      expect(result.error).toContain("rate limit");
    });

    it("should handle network errors gracefully", async () => {
      const mockAxios = axios as any;
      mockAxios.get.mockRejectedValue(new Error("Network timeout"));

      const result = await validateTicker("AAPL");

      expect(result.isSupported).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should normalize ticker to uppercase", async () => {
      const mockAxios = axios as any;
      mockAxios.get.mockResolvedValue({
        data: {
          "Global Quote": {
            "01. symbol": "AAPL",
            "05. price": "150.25",
          },
        },
      });

      const result = await validateTicker("aapl");

      expect(result.ticker).toBe("AAPL");
      expect(result.isSupported).toBe(true);
    });

    it("should cache validation results", async () => {
      const mockAxios = axios as any;
      mockAxios.get.mockResolvedValue({
        data: {
          "Global Quote": {
            "01. symbol": "AAPL",
            "05. price": "150.25",
          },
        },
      });

      // First call
      const result1 = await validateTicker("AAPL");
      expect(mockAxios.get).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await validateTicker("AAPL");
      expect(mockAxios.get).toHaveBeenCalledTimes(1); // Still 1, not 2

      expect(result1).toEqual(result2);
    });

    it("should handle zero price as invalid", async () => {
      const mockAxios = axios as any;
      mockAxios.get.mockResolvedValue({
        data: {
          "Global Quote": {
            "01. symbol": "TEST",
            "05. price": "0",
          },
        },
      });

      const result = await validateTicker("TEST");

      expect(result.isSupported).toBe(false);
    });

    it("should handle negative price as invalid", async () => {
      const mockAxios = axios as any;
      mockAxios.get.mockResolvedValue({
        data: {
          "Global Quote": {
            "01. symbol": "TEST",
            "05. price": "-50.00",
          },
        },
      });

      const result = await validateTicker("TEST");

      expect(result.isSupported).toBe(false);
    });

    it("should handle non-numeric price as invalid", async () => {
      const mockAxios = axios as any;
      mockAxios.get.mockResolvedValue({
        data: {
          "Global Quote": {
            "01. symbol": "TEST",
            "05. price": "invalid",
          },
        },
      });

      const result = await validateTicker("TEST");

      expect(result.isSupported).toBe(false);
    });
  });

  describe("validateMultipleTickers", () => {
    it("should validate multiple tickers in batch", async () => {
      const mockAxios = axios as any;
      mockAxios.get
        .mockResolvedValueOnce({
          data: {
            "Global Quote": {
              "01. symbol": "AAPL",
              "05. price": "150.25",
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            "Global Quote": {
              "01. symbol": "GOOGL",
              "05. price": "140.50",
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            "Global Quote": {
              "01. symbol": "INVALID",
              // No price
            },
          },
        });

      const result = await validateMultipleTickers(["AAPL", "GOOGL", "INVALID"]);

      expect(result.validations).toHaveLength(3);
      expect(result.supported).toHaveLength(2);
      expect(result.unsupported).toHaveLength(1);
    });

    it("should handle partial failures in batch validation", async () => {
      const mockAxios = axios as any;
      mockAxios.get
        .mockResolvedValueOnce({
          data: {
            "Global Quote": {
              "01. symbol": "AAPL",
              "05. price": "150.25",
            },
          },
        })
        .mockRejectedValueOnce(new Error("Network error"));

      const result = await validateMultipleTickers(["AAPL", "GOOGL"]);

      expect(result.validations.length).toBeGreaterThan(0);
      expect(result.supported.length).toBeGreaterThan(0);
    });
  });

  describe("getSuggestionsForTicker", () => {
    it("should return suggestions for known tickers", () => {
      const suggestions = getSuggestionsForTicker("BP");

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].ticker).toBe("BP");
      expect(suggestions[0].exchange).toBe("LSE");
    });

    it("should return empty array for unknown tickers", () => {
      const suggestions = getSuggestionsForTicker("UNKNOWN");

      expect(suggestions).toEqual([]);
    });
  });

  describe("getSupportedExchanges", () => {
    it("should return list of supported exchanges", () => {
      const exchanges = getSupportedExchanges();

      expect(exchanges.length).toBeGreaterThan(0);
      expect(exchanges[0]).toHaveProperty("code");
      expect(exchanges[0]).toHaveProperty("name");
      expect(exchanges[0]).toHaveProperty("examples");
    });

    it("should include major exchanges", () => {
      const exchanges = getSupportedExchanges();
      const codes = exchanges.map((e) => e.code);

      expect(codes).toContain("US");
      expect(codes).toContain("LSE");
      expect(codes).toContain("NSE");
    });
  });

  describe("clearValidationCache", () => {
    it("should clear cache for specific ticker", async () => {
      const mockAxios = axios as any;
      mockAxios.get.mockResolvedValue({
        data: {
          "Global Quote": {
            "01. symbol": "AAPL",
            "05. price": "150.25",
          },
        },
      });

      // Cache a result
      await validateTicker("AAPL");
      expect(mockAxios.get).toHaveBeenCalledTimes(1);

      // Clear cache
      clearValidationCache("AAPL");

      // Validate again - should call API again
      await validateTicker("AAPL");
      expect(mockAxios.get).toHaveBeenCalledTimes(2);
    });

    it("should clear all cache when called without ticker", async () => {
      const mockAxios = axios as any;
      mockAxios.get.mockResolvedValue({
        data: {
          "Global Quote": {
            "01. symbol": "AAPL",
            "05. price": "150.25",
          },
        },
      });

      // Cache multiple results
      await validateTicker("AAPL");
      await validateTicker("GOOGL");
      expect(mockAxios.get).toHaveBeenCalledTimes(2);

      // Clear all cache
      clearValidationCache();

      // Validate again - should call API for both
      await validateTicker("AAPL");
      await validateTicker("GOOGL");
      expect(mockAxios.get).toHaveBeenCalledTimes(4);
    });
  });
});
