import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  getRiskStrategyConfig,
  getRiskStrategyDescription,
  type RiskStrategy,
} from "../riskStrategyService";

export const riskStrategyRouter = router({
  /**
   * Get current user's risk strategy
   */
  getCurrent: protectedProcedure.query(async ({ ctx }: any) => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    if (!user.length) {
      throw new Error("User not found");
    }

    const strategy = (user[0].riskStrategy || "balanced") as RiskStrategy;
    const config = getRiskStrategyConfig(strategy);
    const description = getRiskStrategyDescription(strategy);

    return {
      strategy,
      config,
      description,
    };
  }),

  /**
   * Update user's risk strategy
   */
  update: protectedProcedure
    .input(
      z.object({
        strategy: z.enum(["cautious", "balanced", "high_risk"]),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      await db
        .update(users)
        .set({
          riskStrategy: input.strategy as RiskStrategy,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id));

      const config = getRiskStrategyConfig(input.strategy as RiskStrategy);
      const description = getRiskStrategyDescription(input.strategy as RiskStrategy);

      return {
        strategy: input.strategy,
        config,
        description,
        message: "Risk strategy updated successfully",
      };
    }),

  /**
   * Get all risk strategy options with details
   */
  getAll: protectedProcedure.query(async () => {
    const strategies: RiskStrategy[] = ["cautious", "balanced", "high_risk"];
    
    return strategies.map((strategy) => ({
      id: strategy,
      name: strategy.charAt(0).toUpperCase() + strategy.slice(1),
      description: getRiskStrategyDescription(strategy),
      config: getRiskStrategyConfig(strategy),
    }));
  }),

  /**
   * Get risk strategy config for a specific strategy
   */
  getConfig: protectedProcedure
    .input(
      z.object({
        strategy: z.enum(["cautious", "balanced", "high_risk"]),
      })
    )
    .query(({ input }: any) => {
      return getRiskStrategyConfig(input.strategy as RiskStrategy);
    }),
});
