import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { watchlistGroups, watchlists } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { hasReachedStockLimit } from "../lib/usageTracking";

export const watchlistsRouter = router({
  /**
   * List all watchlist groups for the current user
   * Ordered by displayOrder and creation date
   */
  listGroups: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database connection failed",
      });
    }

    const groups = await db
      .select()
      .from(watchlistGroups)
      .where(eq(watchlistGroups.userId, ctx.user.id))
      .orderBy(watchlistGroups.displayOrder, watchlistGroups.createdAt);

    return groups;
  }),

  /**
   * Get a specific watchlist group by ID
   * Ensures user owns the watchlist
   */
  getGroup: protectedProcedure
    .input(z.object({ groupId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const group = await db
        .select()
        .from(watchlistGroups)
        .where(
          and(
            eq(watchlistGroups.id, input.groupId),
            eq(watchlistGroups.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (group.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Watchlist group not found",
        });
      }

      return group[0];
    }),

  /**
   * Create a new watchlist group
   */
  createGroup: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      // Get the highest displayOrder to add new group at the end
      const lastGroups = await db
        .select({ displayOrder: watchlistGroups.displayOrder })
        .from(watchlistGroups)
        .where(eq(watchlistGroups.userId, ctx.user.id))
        .orderBy(desc(watchlistGroups.displayOrder))
        .limit(1);

      const displayOrder =
        (lastGroups[0]?.displayOrder ?? -1) + 1;

      await db.insert(watchlistGroups).values({
        userId: ctx.user.id,
        name: input.name,
        description: input.description,
        displayOrder,
      });

      // Return the created group
      const created = await db
        .select()
        .from(watchlistGroups)
        .where(
          and(
            eq(watchlistGroups.userId, ctx.user.id),
            eq(watchlistGroups.name, input.name)
          )
        )
        .orderBy(desc(watchlistGroups.createdAt))
        .limit(1);

      return created[0] || { id: 0, userId: ctx.user.id, name: input.name, description: input.description, displayOrder, createdAt: new Date(), updatedAt: new Date() };
    }),

  /**
   * Rename an existing watchlist group
   */
  renameGroup: protectedProcedure
    .input(
      z.object({
        groupId: z.number(),
        newName: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      // Verify user owns this watchlist
      const groups = await db
        .select()
        .from(watchlistGroups)
        .where(
          and(
            eq(watchlistGroups.id, input.groupId),
            eq(watchlistGroups.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (groups.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Watchlist group not found",
        });
      }

      await db
        .update(watchlistGroups)
        .set({ name: input.newName })
        .where(eq(watchlistGroups.id, input.groupId));

      return { success: true };
    }),

  /**
   * Update watchlist group description
   */
  updateGroupDescription: protectedProcedure
    .input(
      z.object({
        groupId: z.number(),
        description: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      // Verify user owns this watchlist
      const groups = await db
        .select()
        .from(watchlistGroups)
        .where(
          and(
            eq(watchlistGroups.id, input.groupId),
            eq(watchlistGroups.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (groups.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Watchlist group not found",
        });
      }

      await db
        .update(watchlistGroups)
        .set({ description: input.description })
        .where(eq(watchlistGroups.id, input.groupId));

      return { success: true };
    }),

  /**
   * Delete a watchlist group
   * This will cascade delete all stocks in the watchlist
   */
  deleteGroup: protectedProcedure
    .input(z.object({ groupId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      // Verify user owns this watchlist
      const groups = await db
        .select()
        .from(watchlistGroups)
        .where(
          and(
            eq(watchlistGroups.id, input.groupId),
            eq(watchlistGroups.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (groups.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Watchlist group not found",
        });
      }

      await db
        .delete(watchlistGroups)
        .where(eq(watchlistGroups.id, input.groupId));

      return { success: true };
    }),

  /**
   * Reorder stocks within a watchlist group
   * Updates displayOrder for each stock
   */
  reorderStocks: protectedProcedure
    .input(
      z.object({
        groupId: z.number(),
        stockIds: z.array(z.number()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      // Verify user owns this watchlist group
      const groups = await db
        .select({ id: watchlistGroups.id })
        .from(watchlistGroups)
        .where(
          and(
            eq(watchlistGroups.id, input.groupId),
            eq(watchlistGroups.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (groups.length === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot reorder stocks in a watchlist you don't own",
        });
      }

      // Update displayOrder for each stock
      for (let i = 0; i < input.stockIds.length; i++) {
        await db
          .update(watchlists)
          .set({ displayOrder: i })
          .where(
            and(
              eq(watchlists.id, input.stockIds[i]),
              eq(watchlists.userId, ctx.user.id)
            )
          );
      }

      return { success: true };
    }),

  /**
   * Reorder watchlist groups by updating displayOrder
   */
  reorderGroups: protectedProcedure
    .input(
      z.object({
        groupIds: z.array(z.number()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      // Verify all groups belong to the user
      const groups = await db
        .select({ id: watchlistGroups.id })
        .from(watchlistGroups)
        .where(eq(watchlistGroups.userId, ctx.user.id));

      const userGroupIds = new Set(groups.map((g) => g.id));
      for (const id of input.groupIds) {
        if (!userGroupIds.has(id)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot reorder watchlist groups you don't own",
          });
        }
      }

      // Update displayOrder for each group
      for (let i = 0; i < input.groupIds.length; i++) {
        await db
          .update(watchlistGroups)
          .set({ displayOrder: i })
          .where(eq(watchlistGroups.id, input.groupIds[i]));
      }

      return { success: true };
    }),
});
