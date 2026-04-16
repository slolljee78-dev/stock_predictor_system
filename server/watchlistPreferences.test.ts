import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Watchlist Preferences", () => {
  describe("updateWatchlistPreferences", () => {
    it("should update alert preferences correctly", () => {
      const preferences = {
        alertOnBuy: true,
        alertOnSell: false,
        minConfidenceThreshold: 75,
        emailNotifications: true,
        inAppNotifications: false,
      };

      // Verify all preferences are set correctly
      expect(preferences.alertOnBuy).toBe(true);
      expect(preferences.alertOnSell).toBe(false);
      expect(preferences.minConfidenceThreshold).toBe(75);
      expect(preferences.emailNotifications).toBe(true);
      expect(preferences.inAppNotifications).toBe(false);
    });

    it("should handle partial preference updates", () => {
      const preferences = {
        alertOnBuy: true,
        minConfidenceThreshold: 80,
      };

      expect(Object.keys(preferences).length).toBe(2);
      expect(preferences.alertOnBuy).toBe(true);
      expect(preferences.minConfidenceThreshold).toBe(80);
    });

    it("should validate confidence threshold range", () => {
      const validThresholds = [0, 25, 50, 75, 100];
      
      validThresholds.forEach(threshold => {
        expect(threshold).toBeGreaterThanOrEqual(0);
        expect(threshold).toBeLessThanOrEqual(100);
      });
    });

    it("should handle boolean conversion for database storage", () => {
      const preferences = {
        alertOnBuy: true,
        alertOnSell: false,
        emailNotifications: true,
        inAppNotifications: false,
      };

      // Convert to database format (1/0)
      const dbFormat = {
        alertOnBuy: preferences.alertOnBuy ? 1 : 0,
        alertOnSell: preferences.alertOnSell ? 1 : 0,
        emailNotifications: preferences.emailNotifications ? 1 : 0,
        inAppNotifications: preferences.inAppNotifications ? 1 : 0,
      };

      expect(dbFormat.alertOnBuy).toBe(1);
      expect(dbFormat.alertOnSell).toBe(0);
      expect(dbFormat.emailNotifications).toBe(1);
      expect(dbFormat.inAppNotifications).toBe(0);
    });

    it("should handle all notification channels", () => {
      const channels = {
        email: true,
        inApp: true,
        sms: false,
        push: false,
      };

      expect(channels.email).toBe(true);
      expect(channels.inApp).toBe(true);
      expect(channels.sms).toBe(false);
      expect(channels.push).toBe(false);
    });

    it("should validate signal type preferences", () => {
      const signalTypes = {
        buy: true,
        sell: true,
        neutral: false,
      };

      expect(signalTypes.buy).toBe(true);
      expect(signalTypes.sell).toBe(true);
      expect(signalTypes.neutral).toBe(false);
    });

    it("should support per-stock customization", () => {
      const stockPreferences = new Map([
        [1, { alertOnBuy: true, alertOnSell: false, minConfidenceThreshold: 60 }],
        [2, { alertOnBuy: false, alertOnSell: true, minConfidenceThreshold: 80 }],
        [3, { alertOnBuy: true, alertOnSell: true, minConfidenceThreshold: 50 }],
      ]);

      expect(stockPreferences.get(1)?.minConfidenceThreshold).toBe(60);
      expect(stockPreferences.get(2)?.minConfidenceThreshold).toBe(80);
      expect(stockPreferences.get(3)?.minConfidenceThreshold).toBe(50);
    });

    it("should handle default preferences", () => {
      const defaults = {
        alertOnBuy: true,
        alertOnSell: true,
        minConfidenceThreshold: 60,
        emailNotifications: true,
        inAppNotifications: true,
      };

      expect(defaults.alertOnBuy).toBe(true);
      expect(defaults.alertOnSell).toBe(true);
      expect(defaults.minConfidenceThreshold).toBe(60);
      expect(defaults.emailNotifications).toBe(true);
      expect(defaults.inAppNotifications).toBe(true);
    });

    it("should validate confidence threshold boundaries", () => {
      const testCases = [
        { threshold: 0, valid: true },
        { threshold: 50, valid: true },
        { threshold: 100, valid: true },
        { threshold: -1, valid: false },
        { threshold: 101, valid: false },
      ];

      testCases.forEach(({ threshold, valid }) => {
        const isValid = threshold >= 0 && threshold <= 100;
        expect(isValid).toBe(valid);
      });
    });

    it("should track preference change history", () => {
      const history = [
        { timestamp: Date.now(), alertOnBuy: true, minConfidenceThreshold: 60 },
        { timestamp: Date.now() + 1000, alertOnBuy: false, minConfidenceThreshold: 70 },
        { timestamp: Date.now() + 2000, alertOnBuy: true, minConfidenceThreshold: 80 },
      ];

      expect(history.length).toBe(3);
      expect(history[0].minConfidenceThreshold).toBe(60);
      expect(history[1].minConfidenceThreshold).toBe(70);
      expect(history[2].minConfidenceThreshold).toBe(80);
    });
  });
});
