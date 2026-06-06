/**
 * Real-time Alert Monitoring Service
 * Continuously monitors active price alerts and triggers notifications when prices hit targets
 */

import { getDb } from "./db";
import { priceAlerts, stocks } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { fetchStockPriceWithCache } from "./liveMarketData";
import { triggerPriceAlert, checkPriceAlerts } from "./priceAlertService";

export interface MonitoringConfig {
  pollIntervalMs: number; // How often to check prices (default: 30000ms = 30 seconds)
  maxAlertsPerCycle: number; // Max alerts to check per cycle (default: 100)
  enableBrowserNotifications: boolean; // Enable browser notifications (default: true)
  enableEmailNotifications: boolean; // Enable email notifications (default: false)
}

export interface MonitoringStats {
  isRunning: boolean;
  startTime: Date | null;
  lastCheckTime: Date | null;
  totalChecks: number;
  totalAlertsTriggered: number;
  totalNotificationsSent: number;
  failedChecks: number;
  averageCheckTimeMs: number;
  activeAlertCount: number;
}

export interface AlertCheckResult {
  alertId: number;
  stockId: number;
  ticker: string;
  currentPrice: number;
  targetPrice: number;
  alertType: "above" | "below";
  triggered: boolean;
  notificationChannels: string[];
}

class AlertMonitoringService {
  private isRunning = false;
  private pollingInterval: NodeJS.Timeout | null = null;
  private config: MonitoringConfig;
  private stats: MonitoringStats = {
    isRunning: false,
    startTime: null,
    lastCheckTime: null,
    totalChecks: 0,
    totalAlertsTriggered: 0,
    totalNotificationsSent: 0,
    failedChecks: 0,
    averageCheckTimeMs: 0,
    activeAlertCount: 0,
  };
  private checkTimes: number[] = [];

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = {
      pollIntervalMs: config.pollIntervalMs || 120000, // 2 minutes
      maxAlertsPerCycle: config.maxAlertsPerCycle || 100,
      enableBrowserNotifications: config.enableBrowserNotifications !== false,
      enableEmailNotifications: config.enableEmailNotifications || false,
    };
  }

  /**
   * Start the alert monitoring service
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      console.warn("[AlertMonitoring] Service already running");
      return;
    }

    this.isRunning = true;
    this.stats.isRunning = true;
    this.stats.startTime = new Date();

    console.log("[AlertMonitoring] Starting alert monitoring service");
    console.log(`[AlertMonitoring] Poll interval: ${this.config.pollIntervalMs}ms`);

    // Run first check immediately
    await this.checkAlerts();

    // Set up polling interval
    this.pollingInterval = setInterval(() => {
      this.checkAlerts().catch((error) => {
        console.error("[AlertMonitoring] Error during alert check:", error);
        this.stats.failedChecks++;
      });
    }, this.config.pollIntervalMs);
  }

  /**
   * Stop the alert monitoring service
   */
  public stop(): void {
    if (!this.isRunning) {
      console.warn("[AlertMonitoring] Service not running");
      return;
    }

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    this.isRunning = false;
    this.stats.isRunning = false;

    console.log("[AlertMonitoring] Alert monitoring service stopped");
  }

  /**
   * Pause the alert monitoring service (can be resumed)
   */
  public pause(): void {
    if (!this.isRunning) {
      console.warn("[AlertMonitoring] Service not running");
      return;
    }

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    console.log("[AlertMonitoring] Alert monitoring service paused");
  }

  /**
   * Resume the alert monitoring service
   */
  public async resume(): Promise<void> {
    if (this.isRunning && this.pollingInterval) {
      console.warn("[AlertMonitoring] Service already running");
      return;
    }

    this.isRunning = true;
    console.log("[AlertMonitoring] Resuming alert monitoring service");

    // Run check immediately
    await this.checkAlerts();

    // Resume polling
    this.pollingInterval = setInterval(() => {
      this.checkAlerts().catch((error) => {
        console.error("[AlertMonitoring] Error during alert check:", error);
        this.stats.failedChecks++;
      });
    }, this.config.pollIntervalMs);
  }

  /**
   * Check all active alerts and trigger if conditions are met
   */
  private async checkAlerts(): Promise<void> {
    const checkStartTime = Date.now();

    try {
      const db = await getDb();
      if (!db) {
        console.error("[AlertMonitoring] Database not available");
        this.stats.failedChecks++;
        return;
      }

      // Get all active alerts with their stock information
      const activeAlerts = await db
        .select({
          id: priceAlerts.id,
          userId: priceAlerts.userId,
          stockId: priceAlerts.stockId,
          ticker: stocks.ticker,
          targetPrice: priceAlerts.targetPrice,
          alertType: priceAlerts.alertType,
          enableBrowserNotification: priceAlerts.enableBrowserNotification,
          enableEmailNotification: priceAlerts.enableEmailNotification,
        })
        .from(priceAlerts)
        .innerJoin(stocks, eq(priceAlerts.stockId, stocks.id))
        .where(eq(priceAlerts.status, "active"))
        .limit(this.config.maxAlertsPerCycle);

      this.stats.activeAlertCount = activeAlerts.length;

      if (activeAlerts.length === 0) {
        this.stats.lastCheckTime = new Date();
        return;
      }

      console.log(`[AlertMonitoring] Checking ${activeAlerts.length} active alerts`);

      const triggeredAlerts: AlertCheckResult[] = [];

      // Check each alert
      for (const alert of activeAlerts) {
        try {
          const priceData = await fetchStockPriceWithCache(alert.ticker);

          if (!priceData) {
            console.warn(`[AlertMonitoring] Failed to fetch price for ${alert.ticker}`);
            continue;
          }

          const currentPrice = priceData.price;
          const targetPrice = parseFloat(alert.targetPrice);
          let triggered = false;

          if (alert.alertType === "above" && currentPrice >= targetPrice) {
            triggered = true;
          } else if (alert.alertType === "below" && currentPrice <= targetPrice) {
            triggered = true;
          }

          if (triggered) {
            const notificationChannels: string[] = [];
            if (alert.enableBrowserNotification) notificationChannels.push("browser");
            if (alert.enableEmailNotification) notificationChannels.push("email");

            triggeredAlerts.push({
              alertId: alert.id,
              stockId: alert.stockId,
              ticker: alert.ticker,
              currentPrice,
              targetPrice,
              alertType: alert.alertType,
              triggered: true,
              notificationChannels,
            });

            console.log(
              `[AlertMonitoring] Alert triggered: ${alert.ticker} ${alert.alertType} ${targetPrice} (current: ${currentPrice})`
            );
          }
        } catch (error) {
          console.error(`[AlertMonitoring] Error checking alert for ${alert.ticker}:`, error);
        }

        // Rate limiting between price fetches
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Process triggered alerts
      for (const alert of triggeredAlerts) {
        try {
          await triggerPriceAlert(alert.alertId, alert.currentPrice, alert.notificationChannels);
          this.stats.totalAlertsTriggered++;
          this.stats.totalNotificationsSent += alert.notificationChannels.length;
        } catch (error) {
          console.error(`[AlertMonitoring] Error triggering alert ${alert.alertId}:`, error);
        }
      }

      this.stats.totalChecks++;
      this.stats.lastCheckTime = new Date();

      // Update average check time
      const checkTime = Date.now() - checkStartTime;
      this.checkTimes.push(checkTime);
      if (this.checkTimes.length > 100) {
        this.checkTimes.shift();
      }
      this.stats.averageCheckTimeMs = Math.round(
        this.checkTimes.reduce((a, b) => a + b, 0) / this.checkTimes.length
      );
    } catch (error) {
      console.error("[AlertMonitoring] Unexpected error during alert check:", error);
      this.stats.failedChecks++;
    }
  }

  /**
   * Get current monitoring statistics
   */
  public getStats(): MonitoringStats {
    return { ...this.stats };
  }

  /**
   * Get monitoring configuration
   */
  public getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  /**
   * Update monitoring configuration
   */
  public updateConfig(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config };
    console.log("[AlertMonitoring] Configuration updated:", this.config);
  }

  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.stats = {
      isRunning: this.stats.isRunning,
      startTime: this.stats.startTime,
      lastCheckTime: null,
      totalChecks: 0,
      totalAlertsTriggered: 0,
      totalNotificationsSent: 0,
      failedChecks: 0,
      averageCheckTimeMs: 0,
      activeAlertCount: 0,
    };
    this.checkTimes = [];
    console.log("[AlertMonitoring] Statistics reset");
  }

  /**
   * Get health status of the monitoring service
   */
  public getHealthStatus(): {
    isHealthy: boolean;
    message: string;
    failureRate: number;
  } {
    if (!this.isRunning) {
      return {
        isHealthy: false,
        message: "Service is not running",
        failureRate: 0,
      };
    }

    const failureRate =
      this.stats.totalChecks > 0
        ? (this.stats.failedChecks / this.stats.totalChecks) * 100
        : 0;

    const isHealthy = failureRate < 10; // Healthy if failure rate < 10%

    return {
      isHealthy,
      message: isHealthy
        ? `Service running normally (${failureRate.toFixed(1)}% failure rate)`
        : `Service degraded (${failureRate.toFixed(1)}% failure rate)`,
      failureRate,
    };
  }
}

// Export singleton instance
export const alertMonitoringService = new AlertMonitoringService();

/**
 * Initialize and start the alert monitoring service
 * Call this from your server startup code
 */
export async function initializeAlertMonitoring(
  config?: Partial<MonitoringConfig>
): Promise<void> {
  if (config) {
    alertMonitoringService.updateConfig(config);
  }

  // Only start if not already running
  if (!alertMonitoringService.getStats().isRunning) {
    await alertMonitoringService.start();
  }
}

/**
 * Shutdown the alert monitoring service
 * Call this from your server shutdown code
 */
export function shutdownAlertMonitoring(): void {
  alertMonitoringService.stop();
}
