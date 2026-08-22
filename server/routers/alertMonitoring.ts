/**
 * Alert Monitoring Router
 * tRPC procedures for controlling and monitoring the alert monitoring service
 */

import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  alertMonitoringService,
  initializeAlertMonitoring,
  shutdownAlertMonitoring,
} from "../alertMonitoringService";

export const alertMonitoringRouter = router({
  /**
   * Start the alert monitoring service
   */
  start: protectedProcedure.mutation(async () => {
    try {
      await alertMonitoringService.start();
      return {
        success: true,
        message: "Alert monitoring service started",
      };
    } catch (error) {
      console.error("[alertMonitoring.start] Error:", error);
      throw error;
    }
  }),

  /**
   * Stop the alert monitoring service
   */
  stop: protectedProcedure.mutation(async () => {
    try {
      alertMonitoringService.stop();
      return {
        success: true,
        message: "Alert monitoring service stopped",
      };
    } catch (error) {
      console.error("[alertMonitoring.stop] Error:", error);
      throw error;
    }
  }),

  /**
   * Pause the alert monitoring service
   */
  pause: protectedProcedure.mutation(async () => {
    try {
      alertMonitoringService.pause();
      return {
        success: true,
        message: "Alert monitoring service paused",
      };
    } catch (error) {
      console.error("[alertMonitoring.pause] Error:", error);
      throw error;
    }
  }),

  /**
   * Resume the alert monitoring service
   */
  resume: protectedProcedure.mutation(async () => {
    try {
      await alertMonitoringService.resume();
      return {
        success: true,
        message: "Alert monitoring service resumed",
      };
    } catch (error) {
      console.error("[alertMonitoring.resume] Error:", error);
      throw error;
    }
  }),

  /**
   * Get current monitoring statistics
   */
  getStats: publicProcedure.query(() => {
    return alertMonitoringService.getStats();
  }),

  /**
   * Get monitoring configuration
   */
  getConfig: publicProcedure.query(() => {
    return alertMonitoringService.getConfig();
  }),

  /**
   * Update monitoring configuration
   */
  updateConfig: protectedProcedure
    .input(
      z.object({
        pollIntervalMs: z.number().int().positive().optional(),
        maxAlertsPerCycle: z.number().int().positive().optional(),
        enableBrowserNotifications: z.boolean().optional(),
        enableEmailNotifications: z.boolean().optional(),
      })
    )
    .mutation(({ input }) => {
      try {
        alertMonitoringService.updateConfig(input);
        return {
          success: true,
          message: "Configuration updated",
          config: alertMonitoringService.getConfig(),
        };
      } catch (error) {
        console.error("[alertMonitoring.updateConfig] Error:", error);
        throw error;
      }
    }),

  /**
   * Reset monitoring statistics
   */
  resetStats: protectedProcedure.mutation(() => {
    try {
      alertMonitoringService.resetStats();
      return {
        success: true,
        message: "Statistics reset",
      };
    } catch (error) {
      console.error("[alertMonitoring.resetStats] Error:", error);
      throw error;
    }
  }),

  /**
   * Get health status of the monitoring service
   */
  getHealthStatus: publicProcedure.query(() => {
    return alertMonitoringService.getHealthStatus();
  }),

  /**
   * Get detailed monitoring information
   */
  getMonitoringInfo: publicProcedure.query(() => {
    const stats = alertMonitoringService.getStats();
    const health = alertMonitoringService.getHealthStatus();
    const config = alertMonitoringService.getConfig();

    return {
      stats,
      health,
      config,
      uptime: stats.startTime ? Date.now() - stats.startTime.getTime() : 0,
    };
  }),
});
