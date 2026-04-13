/**
 * Signal Accuracy Router
 * tRPC procedures for signal accuracy tracking and analytics
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  getSignalAccuracyMetrics,
  getSignalPerformanceDetails,
  getAccuracyTrends,
  getConfidenceDistribution,
} from "../signalAccuracyService";

export const accuracyRouter = router({
  /**
   * Get signal accuracy metrics for the current user
   */
  getMetrics: protectedProcedure
    .input(
      z.object({
        daysBack: z.number().min(1).max(365).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const metrics = await getSignalAccuracyMetrics(ctx.user.id, input.daysBack);
        return { success: true, data: metrics };
      } catch (error) {
        console.error("[Accuracy] Failed to get metrics:", error);
        return { success: false, error: "Failed to fetch metrics" };
      }
    }),

  /**
   * Get detailed signal performance
   */
  getPerformanceDetails: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(500).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const details = await getSignalPerformanceDetails(ctx.user.id, input.limit);
        return { success: true, data: details };
      } catch (error) {
        console.error("[Accuracy] Failed to get performance details:", error);
        return { success: false, error: "Failed to fetch performance details" };
      }
    }),

  /**
   * Get accuracy trends over time
   */
  getTrends: protectedProcedure
    .input(
      z.object({
        daysBack: z.number().min(7).max(365).default(90),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const trends = await getAccuracyTrends(ctx.user.id, input.daysBack);
        return { success: true, data: trends };
      } catch (error) {
        console.error("[Accuracy] Failed to get trends:", error);
        return { success: false, error: "Failed to fetch trends" };
      }
    }),

  /**
   * Get confidence score distribution
   */
  getConfidenceDistribution: protectedProcedure
    .input(
      z.object({
        daysBack: z.number().min(1).max(365).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const distribution = await getConfidenceDistribution(ctx.user.id, input.daysBack);
        return { success: true, data: distribution };
      } catch (error) {
        console.error("[Accuracy] Failed to get confidence distribution:", error);
        return { success: false, error: "Failed to fetch distribution" };
      }
    }),
});
