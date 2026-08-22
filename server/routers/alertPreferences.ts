/**
 * Alert Preferences Router
 * tRPC procedures for managing user alert preferences per stock
 */

import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { alertPreferences, stocks, userAlertSettings } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

export const alertPreferencesRouter = router({
  getUserSettings: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const existing = await db
      .select()
      .from(userAlertSettings)
      .where(eq(userAlertSettings.userId, ctx.user.id))
      .limit(1);

    const settings = existing[0];
    return {
      minBuyConfidence: settings?.minBuyConfidence ?? 60,
      minSellConfidence: settings?.minSellConfidence ?? 60,
      enableEmailAlerts: settings ? settings.enableEmailAlerts === 1 : false,
      enablePushAlerts: settings ? settings.enablePushAlerts === 1 : false,
      enableInAppAlerts: settings ? settings.enableInAppAlerts === 1 : true,
      quietHoursStart: settings?.quietHoursStart ?? '22:00',
      quietHoursEnd: settings?.quietHoursEnd ?? '08:00',
    };
  }),

  updateUserSettings: protectedProcedure
    .input(z.object({
      minBuyConfidence: z.number().int().min(0).max(100),
      minSellConfidence: z.number().int().min(0).max(100),
      enableEmailAlerts: z.boolean(),
      enablePushAlerts: z.boolean(),
      enableInAppAlerts: z.boolean(),
      quietHoursStart: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM time format'),
      quietHoursEnd: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM time format'),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const values = {
        minBuyConfidence: input.minBuyConfidence,
        minSellConfidence: input.minSellConfidence,
        enableEmailAlerts: input.enableEmailAlerts ? 1 : 0,
        enablePushAlerts: input.enablePushAlerts ? 1 : 0,
        enableInAppAlerts: input.enableInAppAlerts ? 1 : 0,
        quietHoursStart: input.quietHoursStart,
        quietHoursEnd: input.quietHoursEnd,
      };
      const existing = await db
        .select({ id: userAlertSettings.id })
        .from(userAlertSettings)
        .where(eq(userAlertSettings.userId, ctx.user.id))
        .limit(1);

      if (existing[0]) {
        await db.update(userAlertSettings).set(values).where(eq(userAlertSettings.id, existing[0].id));
      } else {
        await db.insert(userAlertSettings).values({ userId: ctx.user.id, ...values });
      }

      return { success: true };
    }),

  /**
   * Get alert preferences for a specific stock
   */
  getPreferences: protectedProcedure
    .input(z.object({ stockId: z.number().positive() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const prefs = await db
        .select()
        .from(alertPreferences)
        .where(and(eq(alertPreferences.userId, userId), eq(alertPreferences.stockId, input.stockId)))
        .limit(1);

      if (prefs.length === 0) {
        // Return default preferences
        return {
          stockId: input.stockId,
          minBuyConfidence: 60,
          minSellConfidence: 60,
          enableBuyAlerts: true,
          enableSellAlerts: true,
          enableSentimentAlerts: true,
          notificationChannels: ['in_app'],
          enablePushNotifications: false,
        };
      }

      return {
        stockId: prefs[0].stockId,
        minBuyConfidence: prefs[0].minBuyConfidence,
        minSellConfidence: prefs[0].minSellConfidence,
        enableBuyAlerts: prefs[0].enableBuyAlerts === 1,
        enableSellAlerts: prefs[0].enableSellAlerts === 1,
        enableSentimentAlerts: prefs[0].enableSentimentAlerts === 1,
        notificationChannels: JSON.parse(prefs[0].notificationChannels as string),
        enablePushNotifications: prefs[0].enablePushNotifications === 1,
      };
    }),

  /**
   * Update alert preferences for a stock
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        stockId: z.number().positive(),
        minBuyConfidence: z.number().min(0).max(100).optional(),
        minSellConfidence: z.number().min(0).max(100).optional(),
        enableBuyAlerts: z.boolean().optional(),
        enableSellAlerts: z.boolean().optional(),
        enableSentimentAlerts: z.boolean().optional(),
        notificationChannels: z.array(z.enum(['in_app', 'email', 'push'])).optional(),
        enablePushNotifications: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Check if preferences exist
      const existing = await db
        .select()
        .from(alertPreferences)
        .where(and(eq(alertPreferences.userId, userId), eq(alertPreferences.stockId, input.stockId)))
        .limit(1);

      const updateData: any = {};
      if (input.minBuyConfidence !== undefined) updateData.minBuyConfidence = input.minBuyConfidence;
      if (input.minSellConfidence !== undefined) updateData.minSellConfidence = input.minSellConfidence;
      if (input.enableBuyAlerts !== undefined) updateData.enableBuyAlerts = input.enableBuyAlerts ? 1 : 0;
      if (input.enableSellAlerts !== undefined) updateData.enableSellAlerts = input.enableSellAlerts ? 1 : 0;
      if (input.enableSentimentAlerts !== undefined) updateData.enableSentimentAlerts = input.enableSentimentAlerts ? 1 : 0;
      if (input.notificationChannels !== undefined) updateData.notificationChannels = JSON.stringify(input.notificationChannels);
      if (input.enablePushNotifications !== undefined) updateData.enablePushNotifications = input.enablePushNotifications ? 1 : 0;

      if (existing.length > 0) {
        // Update existing
        await db
          .update(alertPreferences)
          .set(updateData)
          .where(and(eq(alertPreferences.userId, userId), eq(alertPreferences.stockId, input.stockId)));
      } else {
        // Create new with defaults
        await db.insert(alertPreferences).values({
          userId,
          stockId: input.stockId,
          minBuyConfidence: input.minBuyConfidence ?? 60,
          minSellConfidence: input.minSellConfidence ?? 60,
          enableBuyAlerts: input.enableBuyAlerts !== false ? 1 : 0,
          enableSellAlerts: input.enableSellAlerts !== false ? 1 : 0,
          enableSentimentAlerts: input.enableSentimentAlerts !== false ? 1 : 0,
          notificationChannels: JSON.stringify(input.notificationChannels ?? ['in_app']),
          enablePushNotifications: input.enablePushNotifications ? 1 : 0,
        });
      }

      return { success: true, message: 'Preferences updated' };
    }),

  /**
   * Get all alert preferences for the current user
   */
  getAllPreferences: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const prefs = await db
      .select({
        stockId: alertPreferences.stockId,
        ticker: stocks.ticker,
        name: stocks.name,
        minBuyConfidence: alertPreferences.minBuyConfidence,
        minSellConfidence: alertPreferences.minSellConfidence,
        enableBuyAlerts: alertPreferences.enableBuyAlerts,
        enableSellAlerts: alertPreferences.enableSellAlerts,
        enableSentimentAlerts: alertPreferences.enableSentimentAlerts,
        notificationChannels: alertPreferences.notificationChannels,
        enablePushNotifications: alertPreferences.enablePushNotifications,
      })
      .from(alertPreferences)
      .innerJoin(stocks, eq(alertPreferences.stockId, stocks.id))
      .where(eq(alertPreferences.userId, userId));

    return prefs.map(p => ({
      stockId: p.stockId,
      ticker: p.ticker,
      name: p.name,
      minBuyConfidence: p.minBuyConfidence,
      minSellConfidence: p.minSellConfidence,
      enableBuyAlerts: p.enableBuyAlerts === 1,
      enableSellAlerts: p.enableSellAlerts === 1,
      enableSentimentAlerts: p.enableSentimentAlerts === 1,
      notificationChannels: JSON.parse(p.notificationChannels as string),
      enablePushNotifications: p.enablePushNotifications === 1,
    }));
  }),

  /**
   * Enable all alerts for a stock
   */
  enableAllAlerts: protectedProcedure
    .input(z.object({ stockId: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const existing = await db
        .select()
        .from(alertPreferences)
        .where(and(eq(alertPreferences.userId, userId), eq(alertPreferences.stockId, input.stockId)))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(alertPreferences)
          .set({
            enableBuyAlerts: 1,
            enableSellAlerts: 1,
            enableSentimentAlerts: 1,
          })
          .where(and(eq(alertPreferences.userId, userId), eq(alertPreferences.stockId, input.stockId)));
      } else {
        await db.insert(alertPreferences).values({
          userId,
          stockId: input.stockId,
          enableBuyAlerts: 1,
          enableSellAlerts: 1,
          enableSentimentAlerts: 1,
        });
      }

      return { success: true, message: 'All alerts enabled' };
    }),

  /**
   * Disable all alerts for a stock
   */
  disableAllAlerts: protectedProcedure
    .input(z.object({ stockId: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const existing = await db
        .select()
        .from(alertPreferences)
        .where(and(eq(alertPreferences.userId, userId), eq(alertPreferences.stockId, input.stockId)))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(alertPreferences)
          .set({
            enableBuyAlerts: 0,
            enableSellAlerts: 0,
            enableSentimentAlerts: 0,
          })
          .where(and(eq(alertPreferences.userId, userId), eq(alertPreferences.stockId, input.stockId)));
      } else {
        await db.insert(alertPreferences).values({
          userId,
          stockId: input.stockId,
          enableBuyAlerts: 0,
          enableSellAlerts: 0,
          enableSentimentAlerts: 0,
        });
      }

      return { success: true, message: 'All alerts disabled' };
    }),

  /**
   * Set notification channels for a stock
   */
  setNotificationChannels: protectedProcedure
    .input(
      z.object({
        stockId: z.number().positive(),
        channels: z.array(z.enum(['in_app', 'email', 'push'])),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const existing = await db
        .select()
        .from(alertPreferences)
        .where(and(eq(alertPreferences.userId, userId), eq(alertPreferences.stockId, input.stockId)))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(alertPreferences)
          .set({ notificationChannels: JSON.stringify(input.channels) })
          .where(and(eq(alertPreferences.userId, userId), eq(alertPreferences.stockId, input.stockId)));
      } else {
        await db.insert(alertPreferences).values({
          userId,
          stockId: input.stockId,
          notificationChannels: JSON.stringify(input.channels),
        });
      }

      return { success: true, message: 'Notification channels updated' };
    }),

  /**
   * Delete alert preferences for a stock (resets to defaults)
   */
  deletePreferences: protectedProcedure
    .input(z.object({ stockId: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db
        .delete(alertPreferences)
        .where(and(eq(alertPreferences.userId, userId), eq(alertPreferences.stockId, input.stockId)));

      return { success: true, message: 'Preferences deleted, defaults will be used' };
    }),
});
