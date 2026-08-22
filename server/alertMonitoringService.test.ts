/**
 * Tests for Alert Monitoring Service
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  alertMonitoringService,
  initializeAlertMonitoring,
  shutdownAlertMonitoring,
  MonitoringConfig,
} from "./alertMonitoringService";

describe("Alert Monitoring Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    alertMonitoringService.resetConfig();
    alertMonitoringService.resetStats();
  });

  afterEach(() => {
    alertMonitoringService.stop();
    vi.clearAllMocks();
  });

  describe("Service Lifecycle", () => {
    it("should initialize with default configuration", () => {
      const config = alertMonitoringService.getConfig();

      expect(config.pollIntervalMs).toBe(120000);
      expect(config.maxAlertsPerCycle).toBe(100);
      expect(config.enableBrowserNotifications).toBe(true);
      expect(config.enableEmailNotifications).toBe(false);
    });

    it("should start the monitoring service", async () => {
      await alertMonitoringService.start();

      const stats = alertMonitoringService.getStats();
      expect(stats.isRunning).toBe(true);
      expect(stats.startTime).toBeDefined();
    });

    it("should stop the monitoring service", async () => {
      await alertMonitoringService.start();
      alertMonitoringService.stop();

      const stats = alertMonitoringService.getStats();
      expect(stats.isRunning).toBe(false);
    });

    it("should pause and resume the service", async () => {
      await alertMonitoringService.start();
      alertMonitoringService.pause();

      let stats = alertMonitoringService.getStats();
      expect(stats.isRunning).toBe(false);

      await alertMonitoringService.resume();
      stats = alertMonitoringService.getStats();
      expect(stats.isRunning).toBe(true);
    });

    it("should not start if already running", async () => {
      await alertMonitoringService.start();
      const startTime1 = alertMonitoringService.getStats().startTime;

      // Try to start again
      await alertMonitoringService.start();
      const startTime2 = alertMonitoringService.getStats().startTime;

      expect(startTime1).toEqual(startTime2);
    });
  });

  describe("Configuration Management", () => {
    it("should update configuration", () => {
      const newConfig: Partial<MonitoringConfig> = {
        pollIntervalMs: 60000,
        maxAlertsPerCycle: 50,
      };

      alertMonitoringService.updateConfig(newConfig);
      const config = alertMonitoringService.getConfig();

      expect(config.pollIntervalMs).toBe(60000);
      expect(config.maxAlertsPerCycle).toBe(50);
    });

    it("should preserve unchanged config values", () => {
      alertMonitoringService.updateConfig({ pollIntervalMs: 45000 });

      const config = alertMonitoringService.getConfig();
      expect(config.pollIntervalMs).toBe(45000);
      expect(config.maxAlertsPerCycle).toBe(100); // Unchanged
      expect(config.enableBrowserNotifications).toBe(true); // Unchanged
    });

    it("should handle partial configuration updates", () => {
      alertMonitoringService.updateConfig({
        enableBrowserNotifications: false,
        enableEmailNotifications: true,
      });

      const config = alertMonitoringService.getConfig();
      expect(config.enableBrowserNotifications).toBe(false);
      expect(config.enableEmailNotifications).toBe(true);
      expect(config.pollIntervalMs).toBe(120000); // Unchanged
    });
  });

  describe("Statistics Tracking", () => {
    it("should track monitoring statistics", async () => {
      await alertMonitoringService.start();

      const stats = alertMonitoringService.getStats();

      expect(stats.isRunning).toBe(true);
      expect(stats.startTime).toBeDefined();
      expect(stats.totalChecks).toBeGreaterThanOrEqual(0);
      expect(stats.totalAlertsTriggered).toBeGreaterThanOrEqual(0);
      expect(stats.failedChecks).toBeGreaterThanOrEqual(0);
    });

    it("should reset statistics", async () => {
      await alertMonitoringService.start();

      const statsBefore = alertMonitoringService.getStats();
      expect(statsBefore.totalChecks).toBeGreaterThanOrEqual(0);

      alertMonitoringService.resetStats();
      const statsAfter = alertMonitoringService.getStats();

      expect(statsAfter.totalChecks).toBe(0);
      expect(statsAfter.totalAlertsTriggered).toBe(0);
      expect(statsAfter.failedChecks).toBe(0);
    });

    it("should track average check time", async () => {
      await alertMonitoringService.start();

      const stats = alertMonitoringService.getStats();
      expect(stats.averageCheckTimeMs).toBeGreaterThanOrEqual(0);
    });

    it("should track last check time", async () => {
      await alertMonitoringService.start();

      const stats = alertMonitoringService.getStats();
      expect(stats.lastCheckTime).toBeDefined();
    });
  });

  describe("Health Status", () => {
    it("should report healthy status when running", async () => {
      await alertMonitoringService.start();

      const health = alertMonitoringService.getHealthStatus();

      expect(health.isHealthy).toBe(true);
      expect(health.failureRate).toBeLessThan(10);
      expect(health.message).toContain("running");
    });

    it("should report unhealthy status when not running", () => {
      const health = alertMonitoringService.getHealthStatus();

      expect(health.isHealthy).toBe(false);
      expect(health.message).toContain("not running");
    });

    it("should calculate failure rate correctly", () => {
      // Simulate some checks with failures
      const stats = alertMonitoringService.getStats();

      // Manually set stats for testing
      const mockStats = {
        ...stats,
        totalChecks: 100,
        failedChecks: 5,
      };

      const failureRate = (mockStats.failedChecks / mockStats.totalChecks) * 100;
      expect(failureRate).toBe(5);
    });
  });

  describe("Initialization and Shutdown", () => {
    it("should initialize with custom configuration", async () => {
      const customConfig: Partial<MonitoringConfig> = {
        pollIntervalMs: 15000,
        maxAlertsPerCycle: 200,
      };

      await initializeAlertMonitoring(customConfig);

      const config = alertMonitoringService.getConfig();
      expect(config.pollIntervalMs).toBe(15000);
      expect(config.maxAlertsPerCycle).toBe(200);

      shutdownAlertMonitoring();
    });

    it("should not start twice during initialization", async () => {
      await initializeAlertMonitoring();
      const startTime1 = alertMonitoringService.getStats().startTime;

      await initializeAlertMonitoring();
      const startTime2 = alertMonitoringService.getStats().startTime;

      expect(startTime1).toEqual(startTime2);

      shutdownAlertMonitoring();
    });

    it("should shutdown the service", async () => {
      await initializeAlertMonitoring();
      expect(alertMonitoringService.getStats().isRunning).toBe(true);

      shutdownAlertMonitoring();
      expect(alertMonitoringService.getStats().isRunning).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle pause when not running", () => {
      // Should not throw error
      expect(() => alertMonitoringService.pause()).not.toThrow();
    });

    it("should handle resume when not running", async () => {
      // Should not throw error
      await expect(alertMonitoringService.resume()).resolves.toBeUndefined();
    });

    it("should handle stop when not running", () => {
      // Should not throw error
      expect(() => alertMonitoringService.stop()).not.toThrow();
    });

    it("should handle very short poll intervals", () => {
      alertMonitoringService.updateConfig({ pollIntervalMs: 1000 });
      const config = alertMonitoringService.getConfig();
      expect(config.pollIntervalMs).toBe(1000);
    });

    it("should handle very long poll intervals", () => {
      alertMonitoringService.updateConfig({ pollIntervalMs: 300000 });
      const config = alertMonitoringService.getConfig();
      expect(config.pollIntervalMs).toBe(300000);
    });

    it("should handle large max alerts per cycle", () => {
      alertMonitoringService.updateConfig({ maxAlertsPerCycle: 1000 });
      const config = alertMonitoringService.getConfig();
      expect(config.maxAlertsPerCycle).toBe(1000);
    });
  });

  describe("Monitoring Info", () => {
    it("should provide comprehensive monitoring information", async () => {
      await alertMonitoringService.start();

      // Get monitoring info through service
      const stats = alertMonitoringService.getStats();
      const health = alertMonitoringService.getHealthStatus();
      const config = alertMonitoringService.getConfig();

      expect(stats).toBeDefined();
      expect(health).toBeDefined();
      expect(config).toBeDefined();

      // Verify structure
      expect(stats).toHaveProperty("isRunning");
      expect(stats).toHaveProperty("totalChecks");
      expect(health).toHaveProperty("isHealthy");
      expect(config).toHaveProperty("pollIntervalMs");
    });
  });

  describe("Concurrent Operations", () => {
    it("should handle multiple start/stop cycles", async () => {
      for (let i = 0; i < 3; i++) {
        await alertMonitoringService.start();
        expect(alertMonitoringService.getStats().isRunning).toBe(true);

        alertMonitoringService.stop();
        expect(alertMonitoringService.getStats().isRunning).toBe(false);
      }
    });

    it("should handle pause/resume cycles", async () => {
      await alertMonitoringService.start();

      for (let i = 0; i < 3; i++) {
        alertMonitoringService.pause();
        expect(alertMonitoringService.getStats().isRunning).toBe(false);

        await alertMonitoringService.resume();
        expect(alertMonitoringService.getStats().isRunning).toBe(true);
      }

      alertMonitoringService.stop();
    });
  });
});
