import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { referralCodes, referralConversions, users } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

function generateReferralCode(name: string, userId: number): string {
  // e.g. "STUART-4X2K"
  const prefix = (name || "USER")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 6);
  const suffix = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `${prefix}-${suffix}`;
}

export const referralRouter = router({
  // Get or create the current user's referral code
  getMyCode: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const existing = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.userId, ctx.user.id))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Create a new code
    const code = generateReferralCode(ctx.user.name || "", ctx.user.id);
    await db.insert(referralCodes).values({
      userId: ctx.user.id,
      code,
    });

    const created = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.userId, ctx.user.id))
      .limit(1);

    return created[0];
  }),

  // Get referral conversions for the current user
  getMyReferrals: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const conversions = await db
      .select({
        id: referralConversions.id,
        status: referralConversions.status,
        creditsAwarded: referralConversions.creditsAwarded,
        convertedAt: referralConversions.convertedAt,
        creditedAt: referralConversions.creditedAt,
        createdAt: referralConversions.createdAt,
        referredUserName: users.name,
      })
      .from(referralConversions)
      .leftJoin(users, eq(referralConversions.referredUserId, users.id))
      .where(eq(referralConversions.referrerId, ctx.user.id))
      .orderBy(desc(referralConversions.createdAt))
      .limit(50);

    return conversions;
  }),

  // Get referral stats summary
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const code = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.userId, ctx.user.id))
      .limit(1);

    if (code.length === 0) {
      return { totalReferrals: 0, totalCreditsEarned: 0, pendingCredits: 0 };
    }

    const pending = await db
      .select()
      .from(referralConversions)
      .where(eq(referralConversions.referrerId, ctx.user.id));

    const pendingCredits = pending
      .filter((c) => c.status === "converted")
      .reduce((sum, c) => sum + c.creditsAwarded, 0);

    return {
      totalReferrals: code[0].totalReferrals,
      totalCreditsEarned: code[0].totalCreditsEarned,
      pendingCredits,
    };
  }),

  // Record a referral when a new user signs up via a referral link
  // Called server-side after OAuth callback when ?ref= param is present
  recordReferral: publicProcedure
    .input(
      z.object({
        code: z.string(),
        newUserId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Find the referral code owner
      const codeRecord = await db
        .select()
        .from(referralCodes)
        .where(eq(referralCodes.code, input.code.toUpperCase()))
        .limit(1);

      if (codeRecord.length === 0) return { success: false, reason: "invalid_code" };

      // Don't let users refer themselves
      if (codeRecord[0].userId === input.newUserId) {
        return { success: false, reason: "self_referral" };
      }

      // Check if this user was already referred
      const existingConversion = await db
        .select()
        .from(referralConversions)
        .where(eq(referralConversions.referredUserId, input.newUserId))
        .limit(1);

      if (existingConversion.length > 0) {
        return { success: false, reason: "already_referred" };
      }

      // Record the conversion (pending until they upgrade to paid)
      await db.insert(referralConversions).values({
        referrerId: codeRecord[0].userId,
        referredUserId: input.newUserId,
        code: input.code.toUpperCase(),
        status: "pending",
        creditsAwarded: 0,
        convertedAt: new Date(),
      });

      // Increment total referrals counter
      await db
        .update(referralCodes)
        .set({ totalReferrals: codeRecord[0].totalReferrals + 1 })
        .where(eq(referralCodes.id, codeRecord[0].id));

      return { success: true };
    }),
});
