/**
 * Validation Initialization Router
 * Handles session creation and startup
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { initializeValidationSession, generateValidationStartReport } from "../initValidationSession";

export const validationInitRouter = router({
  // Create and start validation session
  startSession: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        startingCapital: z.number().default(100),
        targetMonthlyReturn: z.number().default(0.1),
        dailyLossLimit: z.number().default(0.02),
        tradesPerDay: z.number().default(5),
        stockCount: z.number().default(212),
        ownerEmail: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const validationPlan = initializeValidationSession({
        startDate: input.startDate,
        startingCapital: input.startingCapital,
        targetMonthlyReturn: input.targetMonthlyReturn,
        dailyLossLimit: input.dailyLossLimit,
        tradesPerDay: input.tradesPerDay,
        stockCount: input.stockCount,
        ownerEmail: input.ownerEmail,
      });

      const report = generateValidationStartReport({
        startDate: input.startDate,
        startingCapital: input.startingCapital,
        targetMonthlyReturn: input.targetMonthlyReturn,
        dailyLossLimit: input.dailyLossLimit,
        tradesPerDay: input.tradesPerDay,
        stockCount: input.stockCount,
        ownerEmail: input.ownerEmail,
      });

      return {
        success: true,
        sessionId: validationPlan.sessionId,
        message: "Validation session started successfully",
        startReport: report,
        milestones: validationPlan.milestones,
        successCriteria: validationPlan.successCriteria,
      };
    }),

  // Get session status
  getStatus: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      return {
        sessionId: input.sessionId,
        status: "ACTIVE",
        daysElapsed: 0,
        daysRemaining: 90,
        currentCapital: 100,
        dailyPnL: 0,
        monthlyReturn: 0,
        tradesExecuted: 0,
      };
    }),
});
