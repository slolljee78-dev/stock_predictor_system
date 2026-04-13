/**
 * Admin Dashboard tRPC Router
 * Provides admin-only procedures for system management
 */

import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  getSystemStats,
  getSubscriptionStats,
  getUserList,
  getUserDetails,
  getPaymentAnalytics,
  getSignalMetrics,
  getUserActivityMetrics,
  getChurnAnalysis,
  logAdminAction,
  getAuditLog,
  getAdminAuditLog,
} from "../adminQueries";

/**
 * Admin-only procedure wrapper
 */
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({ ctx });
});

export const adminRouter = router({
  /**
   * Get overall system statistics
   */
  getSystemStats: adminProcedure.query(async () => {
    try {
      const stats = await getSystemStats();
      return stats;
    } catch (error) {
      console.error("[Admin Router] Error getting system stats:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch system statistics",
      });
    }
  }),

  /**
   * Get subscription tier breakdown
   */
  getSubscriptionStats: adminProcedure.query(async () => {
    try {
      const stats = await getSubscriptionStats();
      return stats;
    } catch (error) {
      console.error("[Admin Router] Error getting subscription stats:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch subscription statistics",
      });
    }
  }),

  /**
   * Get paginated user list
   */
  getUserList: adminProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        pageSize: z.number().int().positive().max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      try {
        const result = await getUserList(input.page, input.pageSize);
        return result;
      } catch (error) {
        console.error("[Admin Router] Error getting user list:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user list",
        });
      }
    }),

  /**
   * Get detailed user information
   */
  getUserDetails: adminProcedure
    .input(z.object({ userId: z.number().int().positive() }))
    .query(async ({ input, ctx }) => {
      try {
        // Log the action
        logAdminAction(ctx.user.id, "VIEW_USER_DETAILS", input.userId);

        const details = await getUserDetails(input.userId);
        return details;
      } catch (error) {
        console.error("[Admin Router] Error getting user details:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user details",
        });
      }
    }),

  /**
   * Get payment analytics
   */
  getPaymentAnalytics: adminProcedure.query(async () => {
    try {
      const analytics = await getPaymentAnalytics();
      return analytics;
    } catch (error) {
      console.error("[Admin Router] Error getting payment analytics:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch payment analytics",
      });
    }
  }),

  /**
   * Get signal accuracy metrics
   */
  getSignalMetrics: adminProcedure.query(async () => {
    try {
      const metrics = await getSignalMetrics();
      return metrics;
    } catch (error) {
      console.error("[Admin Router] Error getting signal metrics:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch signal metrics",
      });
    }
  }),

  /**
   * Get user activity metrics
   */
  getUserActivityMetrics: adminProcedure.query(async () => {
    try {
      const metrics = await getUserActivityMetrics();
      return metrics;
    } catch (error) {
      console.error("[Admin Router] Error getting user activity metrics:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch user activity metrics",
      });
    }
  }),

  /**
   * Get churn analysis
   */
  getChurnAnalysis: adminProcedure.query(async () => {
    try {
      const analysis = await getChurnAnalysis();
      return analysis;
    } catch (error) {
      console.error("[Admin Router] Error getting churn analysis:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch churn analysis",
      });
    }
  }),

  /**
   * Get audit log
   */
  getAuditLog: adminProcedure
    .input(z.object({ limit: z.number().int().positive().max(1000).default(100) }))
    .query(async ({ input }) => {
      try {
        const log = getAuditLog(input.limit);
        return log;
      } catch (error) {
        console.error("[Admin Router] Error getting audit log:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch audit log",
        });
      }
    }),

  /**
   * Get admin's own audit log
   */
  getMyAuditLog: adminProcedure
    .input(z.object({ limit: z.number().int().positive().max(1000).default(100) }))
    .query(async ({ input, ctx }) => {
      try {
        const log = getAdminAuditLog(ctx.user.id, input.limit);
        return log;
      } catch (error) {
        console.error("[Admin Router] Error getting admin audit log:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch audit log",
        });
      }
    }),

  /**
   * Check if current user is admin
   */
  isAdmin: protectedProcedure.query(({ ctx }) => {
    return ctx.user.role === "admin";
  }),
});
