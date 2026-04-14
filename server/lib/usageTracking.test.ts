import { describe, it, expect } from "vitest";
import {
  FREE_TIER_LIMITS,
  PAID_TIER_LIMITS,
  getUserQuota,
  hasReachedSignalLimit,
  hasReachedStockLimit,
  getUpgradeRecommendation,
} from "./usageTracking";

describe("Usage Tracking Utilities", () => {
  describe("FREE_TIER_LIMITS", () => {
    it("should have correct free tier limits", () => {
      expect(FREE_TIER_LIMITS.maxStocks).toBe(3);
      expect(FREE_TIER_LIMITS.maxSignalsPerDay).toBe(5);
      expect(FREE_TIER_LIMITS.maxWatchlists).toBe(1);
      expect(FREE_TIER_LIMITS.maxAlerts).toBe(2);
    });
  });

  describe("PAID_TIER_LIMITS", () => {
    it("should have starter tier limits", () => {
      expect(PAID_TIER_LIMITS.starter.maxStocks).toBe(20);
      expect(PAID_TIER_LIMITS.starter.maxSignalsPerDay).toBe(50);
    });

    it("should have pro tier limits", () => {
      expect(PAID_TIER_LIMITS.pro.maxStocks).toBe(100);
      expect(PAID_TIER_LIMITS.pro.maxSignalsPerDay).toBe(200);
    });

    it("should have elite tier limits", () => {
      expect(PAID_TIER_LIMITS.elite.maxStocks).toBe(500);
      expect(PAID_TIER_LIMITS.elite.maxSignalsPerDay).toBe(1000);
    });
  });

  describe("getUserQuota", () => {
    it("should calculate free tier quota correctly", () => {
      const user = { subscriptionTier: "free" };
      const usage = {
        signalsUsedToday: 3,
        stocksMonitored: 2,
        watchlistsCount: 1,
        alertsCount: 1,
      };

      const quota = getUserQuota(user, usage);

      expect(quota.tier).toBe("free");
      expect(quota.signalsUsedToday).toBe(3);
      expect(quota.signalsLimit).toBe(5);
      expect(quota.signalsRemaining).toBe(2);
      expect(quota.stocksMonitored).toBe(2);
      expect(quota.stocksLimit).toBe(3);
      expect(quota.stocksRemaining).toBe(1);
    });

    it("should calculate paid tier quota correctly", () => {
      const user = { subscriptionTier: "pro" };
      const usage = {
        signalsUsedToday: 50,
        stocksMonitored: 50,
        watchlistsCount: 5,
        alertsCount: 10,
      };

      const quota = getUserQuota(user, usage);

      expect(quota.tier).toBe("pro");
      expect(quota.signalsLimit).toBe(200);
      expect(quota.stocksLimit).toBe(100);
      expect(quota.signalsRemaining).toBe(150);
      expect(quota.stocksRemaining).toBe(50);
    });

    it("should mark as at limit when any quota is exhausted", () => {
      const user = { subscriptionTier: "free" };
      const usage = {
        signalsUsedToday: 5,
        stocksMonitored: 2,
        watchlistsCount: 1,
        alertsCount: 1,
      };

      const quota = getUserQuota(user, usage);

      expect(quota.isAtLimit).toBe(true);
      expect(quota.signalsRemaining).toBe(0);
    });

    it("should calculate quota percentage correctly", () => {
      const user = { subscriptionTier: "free" };
      const usage = {
        signalsUsedToday: 3,
        stocksMonitored: 2,
        watchlistsCount: 1,
        alertsCount: 1,
      };

      const quota = getUserQuota(user, usage);

      // (3 + 2 + 1 + 1) / (5 + 3 + 1 + 2) * 100 = 7/11 * 100 = 63.63%
      expect(quota.quotaPercentage).toBe(64); // rounded
    });
  });

  describe("hasReachedSignalLimit", () => {
    it("should return true when free user reaches signal limit", () => {
      const user = { subscriptionTier: "free" };
      expect(hasReachedSignalLimit(user, 5)).toBe(true);
    });

    it("should return false when free user has signals remaining", () => {
      const user = { subscriptionTier: "free" };
      expect(hasReachedSignalLimit(user, 3)).toBe(false);
    });

    it("should return true when paid user reaches their limit", () => {
      const user = { subscriptionTier: "pro" };
      expect(hasReachedSignalLimit(user, 200)).toBe(true);
    });

    it("should return false when paid user has signals remaining", () => {
      const user = { subscriptionTier: "pro" };
      expect(hasReachedSignalLimit(user, 100)).toBe(false);
    });
  });

  describe("hasReachedStockLimit", () => {
    it("should return true when free user reaches stock limit", () => {
      const user = { subscriptionTier: "free" };
      expect(hasReachedStockLimit(user, 3)).toBe(true);
    });

    it("should return false when free user has stocks available", () => {
      const user = { subscriptionTier: "free" };
      expect(hasReachedStockLimit(user, 2)).toBe(false);
    });

    it("should return true when paid user reaches their limit", () => {
      const user = { subscriptionTier: "elite" };
      expect(hasReachedStockLimit(user, 500)).toBe(true);
    });
  });

  describe("getUpgradeRecommendation", () => {
    it("should return null for non-free users", () => {
      const quota = {
        tier: "pro",
        signalsUsedToday: 100,
        signalsLimit: 200,
        signalsRemaining: 100,
        stocksMonitored: 50,
        stocksLimit: 100,
        stocksRemaining: 50,
        watchlistsCount: 5,
        watchlistsLimit: 10,
        watchlistsRemaining: 5,
        alertsCount: 10,
        alertsLimit: 50,
        alertsRemaining: 40,
        isAtLimit: false,
        quotaPercentage: 25,
      };

      expect(getUpgradeRecommendation(quota)).toBeNull();
    });

    it("should return signal limit message when signals exhausted", () => {
      const quota = {
        tier: "free",
        signalsUsedToday: 5,
        signalsLimit: 5,
        signalsRemaining: 0,
        stocksMonitored: 2,
        stocksLimit: 3,
        stocksRemaining: 1,
        watchlistsCount: 1,
        watchlistsLimit: 1,
        watchlistsRemaining: 0,
        alertsCount: 1,
        alertsLimit: 2,
        alertsRemaining: 1,
        isAtLimit: true,
        quotaPercentage: 80,
      };

      const recommendation = getUpgradeRecommendation(quota);
      expect(recommendation).toContain("signal limit");
    });

    it("should return stock limit message when stocks exhausted", () => {
      const quota = {
        tier: "free",
        signalsUsedToday: 3,
        signalsLimit: 5,
        signalsRemaining: 2,
        stocksMonitored: 3,
        stocksLimit: 3,
        stocksRemaining: 0,
        watchlistsCount: 1,
        watchlistsLimit: 1,
        watchlistsRemaining: 0,
        alertsCount: 1,
        alertsLimit: 2,
        alertsRemaining: 1,
        isAtLimit: true,
        quotaPercentage: 70,
      };

      const recommendation = getUpgradeRecommendation(quota);
      expect(recommendation).toContain("stock");
    });

    it("should return quota warning when usage is high", () => {
      const quota = {
        tier: "free",
        signalsUsedToday: 4,
        signalsLimit: 5,
        signalsRemaining: 1,
        stocksMonitored: 2,
        stocksLimit: 3,
        stocksRemaining: 1,
        watchlistsCount: 1,
        watchlistsLimit: 1,
        watchlistsRemaining: 0,
        alertsCount: 2,
        alertsLimit: 2,
        alertsRemaining: 0,
        isAtLimit: true,
        quotaPercentage: 85,
      };

      const recommendation = getUpgradeRecommendation(quota);
      expect(recommendation).toContain("85%");
    });
  });
});
