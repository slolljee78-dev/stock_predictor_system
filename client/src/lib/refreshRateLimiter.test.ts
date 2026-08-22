import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  canRefresh,
  getRemainingCooldown,
  getRefreshState,
  getRefreshButtonLabel,
  isRefreshButtonDisabled,
} from "./refreshRateLimiter";

describe("refreshRateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  describe("canRefresh", () => {
    it("should allow refresh when lastRefreshTime is null", () => {
      expect(canRefresh(null)).toBe(true);
    });

    it("should allow refresh when cooldown has expired", () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const lastRefreshTime = now - 8000; // 8 seconds ago
      expect(canRefresh(lastRefreshTime)).toBe(true);
    });

    it("should prevent refresh when cooldown is still active", () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const lastRefreshTime = now - 5000; // 5 seconds ago (within 8s cooldown)
      expect(canRefresh(lastRefreshTime)).toBe(false);
    });

    it("should prevent refresh immediately after last refresh", () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const lastRefreshTime = now; // Just now
      expect(canRefresh(lastRefreshTime)).toBe(false);
    });
  });

  describe("getRemainingCooldown", () => {
    it("should return 0 when lastRefreshTime is null", () => {
      expect(getRemainingCooldown(null)).toBe(0);
    });

    it("should return 0 when cooldown has expired", () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const lastRefreshTime = now - 8000; // 8 seconds ago
      expect(getRemainingCooldown(lastRefreshTime)).toBe(0);
    });

    it("should return remaining seconds when cooldown is active", () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const lastRefreshTime = now - 3000; // 3 seconds ago
      const remaining = getRemainingCooldown(lastRefreshTime);

      // Should be approximately 5 seconds remaining (8 - 3)
      expect(remaining).toBeGreaterThanOrEqual(4);
      expect(remaining).toBeLessThanOrEqual(6);
    });

    it("should round up remaining seconds", () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const lastRefreshTime = now - 3100; // 3.1 seconds ago
      const remaining = getRemainingCooldown(lastRefreshTime);

      // Should round up to 5 seconds
      expect(remaining).toBe(5);
    });
  });

  describe("getRefreshState", () => {
    it("should return correct state when no refresh has occurred", () => {
      const state = getRefreshState(null);

      expect(state).toEqual({
        lastRefreshTime: null,
        cooldownRemaining: 0,
        isOnCooldown: false,
      });
    });

    it("should return correct state when cooldown is active", () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const lastRefreshTime = now - 3000; // 3 seconds ago
      const state = getRefreshState(lastRefreshTime);

      expect(state.lastRefreshTime).toBe(lastRefreshTime);
      expect(state.isOnCooldown).toBe(true);
      expect(state.cooldownRemaining).toBeGreaterThan(0);
      expect(state.cooldownRemaining).toBeLessThanOrEqual(5);
    });

    it("should return correct state when cooldown has expired", () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const lastRefreshTime = now - 8000; // 8 seconds ago
      const state = getRefreshState(lastRefreshTime);

      expect(state.lastRefreshTime).toBe(lastRefreshTime);
      expect(state.isOnCooldown).toBe(false);
      expect(state.cooldownRemaining).toBe(0);
    });
  });

  describe("getRefreshButtonLabel", () => {
    it("should return 'Refreshing...' when isRefreshing is true", () => {
      const label = getRefreshButtonLabel(true, false, 0);
      expect(label).toBe("Refreshing...");
    });

    it("should return 'Refresh' when no cooldown and not refreshing", () => {
      const label = getRefreshButtonLabel(false, false, 0);
      expect(label).toBe("Refresh");
    });

    it("should return countdown when on cooldown", () => {
      const label = getRefreshButtonLabel(false, true, 5);
      expect(label).toBe("Refresh in 5s");
    });

    it("should prioritize refreshing state over cooldown", () => {
      const label = getRefreshButtonLabel(true, true, 5);
      expect(label).toBe("Refreshing...");
    });

    it("should handle various cooldown values", () => {
      expect(getRefreshButtonLabel(false, true, 1)).toBe("Refresh in 1s");
      expect(getRefreshButtonLabel(false, true, 8)).toBe("Refresh in 8s");
    });
  });

  describe("isRefreshButtonDisabled", () => {
    it("should disable button when refreshing", () => {
      expect(isRefreshButtonDisabled(true, false)).toBe(true);
    });

    it("should disable button when on cooldown", () => {
      expect(isRefreshButtonDisabled(false, true)).toBe(true);
    });

    it("should disable button when both refreshing and on cooldown", () => {
      expect(isRefreshButtonDisabled(true, true)).toBe(true);
    });

    it("should enable button when neither refreshing nor on cooldown", () => {
      expect(isRefreshButtonDisabled(false, false)).toBe(false);
    });
  });
});
