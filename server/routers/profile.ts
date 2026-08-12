import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { SUBSCRIPTION_PRODUCTS } from "../products";

export const profileRouter = router({
  /**
   * Get the current user's full profile including subscription info
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        loginMethod: users.loginMethod,
        stripeCustomerId: users.stripeCustomerId,
        stripeSubscriptionId: users.stripeSubscriptionId,
        subscriptionTier: users.subscriptionTier,
        subscriptionStatus: users.subscriptionStatus,
        subscriptionStartedAt: users.subscriptionStartedAt,
        createdAt: users.createdAt,
        lastSignedIn: users.lastSignedIn,
      })
      .from(users)
      .where(eq(users.id, ctx.user.id));

    const user = result[0];
    if (!user) throw new Error("User not found");

    // Enrich with product details for the current tier
    const tier = (user.subscriptionTier ?? "free") as string;
    const tierKey = tier.toUpperCase() as keyof typeof SUBSCRIPTION_PRODUCTS;
    const productDetails = SUBSCRIPTION_PRODUCTS[tierKey] ?? null;

    return {
      ...user,
      productDetails,
      isOnFreePlan: tier === "free" || !tier,
      isActive: user.subscriptionStatus === "active",
    };
  }),

  /**
   * Update display name
   */
  updateDisplayName: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .update(users)
        .set({ name: input.name })
        .where(eq(users.id, ctx.user.id));

      return { success: true };
    }),

  /**
   * Cancel subscription — marks it as cancelled in DB.
   * Actual Stripe cancellation is handled via webhook when the period ends.
   */
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const result = await db
      .select({ subscriptionTier: users.subscriptionTier, subscriptionStatus: users.subscriptionStatus })
      .from(users)
      .where(eq(users.id, ctx.user.id));

    const user = result[0];
    if (!user) throw new Error("User not found");

    if (!user.subscriptionTier || user.subscriptionTier === "free") {
      throw new Error("No active subscription to cancel");
    }

    await db
      .update(users)
      .set({ subscriptionStatus: "cancelled" })
      .where(eq(users.id, ctx.user.id));

    return { success: true, message: "Subscription cancelled. You will retain access until the end of your billing period." };
  }),

  /**
   * Get all available subscription plans for the upgrade UI
   */
  getPlans: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const result = await db
      .select({ subscriptionTier: users.subscriptionTier, subscriptionStatus: users.subscriptionStatus })
      .from(users)
      .where(eq(users.id, ctx.user.id));

    const user = result[0];
    const currentTier = (user?.subscriptionTier ?? "free").toUpperCase();

    return Object.entries(SUBSCRIPTION_PRODUCTS).map(([key, plan]) => ({
      key,
      ...plan,
      isCurrent: key === currentTier,
    }));
  }),
});
