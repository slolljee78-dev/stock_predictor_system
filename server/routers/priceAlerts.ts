/**
 * Price Alerts Router
 * tRPC procedures for managing price alerts and portfolio refresh
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  createPriceAlert,
  getUserPriceAlerts,
  getPriceAlert,
  updatePriceAlert,
  deletePriceAlert,
  getPriceAlertHistory,
  getAlertStatistics,
  checkPriceAlerts,
  triggerPriceAlert,
} from "../priceAlertService";
import { refreshPortfolioPrices, getRefreshStatistics } from "../portfolioRefresh";

export const priceAlertsRouter = router({
  /**
   * Create a new price alert
   */
  createAlert: protectedProcedure
    .input(
      z.object({
        stockId: z.number().int().positive(),
        targetPrice: z.number().positive(),
        alertType: z.enum(["above", "below"]),
        enableBrowserNotification: z.boolean().optional().default(true),
        enableEmailNotification: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await createPriceAlert({
        userId: ctx.user.id,
        stockId: input.stockId,
        targetPrice: input.targetPrice,
        alertType: input.alertType,
        enableBrowserNotification: input.enableBrowserNotification,
        enableEmailNotification: input.enableEmailNotification,
      });
    }),

  /**
   * Get all active price alerts for the current user
   */
  getMyAlerts: protectedProcedure.query(async ({ ctx }) => {
    return await getUserPriceAlerts(ctx.user.id);
  }),

  /**
   * Get a specific price alert
   */
  getAlert: protectedProcedure
    .input(z.object({ alertId: z.number().int().positive() }))
    .query(async ({ input, ctx }) => {
      return await getPriceAlert(input.alertId, ctx.user.id);
    }),

  /**
   * Update a price alert
   */
  updateAlert: protectedProcedure
    .input(
      z.object({
        alertId: z.number().int().positive(),
        targetPrice: z.number().positive().optional(),
        alertType: z.enum(["above", "below"]).optional(),
        status: z.enum(["active", "triggered", "dismissed", "deleted"]).optional(),
        enableBrowserNotification: z.boolean().optional(),
        enableEmailNotification: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { alertId, ...updateData } = input;
      return await updatePriceAlert(alertId, ctx.user.id, updateData);
    }),

  /**
   * Delete a price alert
   */
  deleteAlert: protectedProcedure
    .input(z.object({ alertId: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      return await deletePriceAlert(input.alertId, ctx.user.id);
    }),

  /**
   * Get price alert history for the current user
   */
  getAlertHistory: protectedProcedure
    .input(z.object({ limit: z.number().int().positive().optional().default(50) }))
    .query(async ({ input, ctx }) => {
      return await getPriceAlertHistory(ctx.user.id, input.limit);
    }),

  /**
   * Get alert statistics for the current user
   */
  getAlertStats: protectedProcedure.query(async ({ ctx }) => {
    return await getAlertStatistics(ctx.user.id);
  }),

  /**
   * Refresh all prices in a portfolio
   */
  refreshPortfolioPrices: protectedProcedure
    .input(
      z.object({
        positions: z.array(
          z.object({
            ticker: z.string().min(1).max(10),
            quantity: z.number().int().positive(),
            entryPrice: z.number().positive(),
          })
        ),
        cashBalance: z.number().nonnegative(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await refreshPortfolioPrices(input.positions, input.cashBalance);
      const stats = getRefreshStatistics(result);

      return {
        ...result,
        statistics: stats,
      };
    }),

  /**
   * Check if any prices trigger alerts
   */
  checkAlerts: protectedProcedure
    .input(
      z.object({
        stockId: z.number().int().positive(),
        currentPrice: z.number().positive(),
      })
    )
    .query(async ({ input }) => {
      const triggeredAlerts = await checkPriceAlerts(input.stockId, input.currentPrice);
      return {
        triggered: triggeredAlerts.length > 0,
        alertIds: triggeredAlerts,
        count: triggeredAlerts.length,
      };
    }),

  /**
   * Trigger a price alert manually (for testing)
   */
  triggerAlert: protectedProcedure
    .input(
      z.object({
        alertId: z.number().int().positive(),
        currentPrice: z.number().positive(),
        notificationChannels: z.array(z.string()).optional().default(["browser"]),
      })
    )
    .mutation(async ({ input }) => {
      return await triggerPriceAlert(input.alertId, input.currentPrice, input.notificationChannels);
    }),
});
