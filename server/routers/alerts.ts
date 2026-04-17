/**
 * Signal Alerts Router
 * tRPC procedures for managing buy/sell signal alerts with confidence thresholds
 */

import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { signalAlerts, alertPreferences, signals, stocks } from '../../drizzle/schema';
import { eq, and, desc, gte } from 'drizzle-orm';

export const alertsRouter = router({
  /**
   * Create a signal alert when a new signal is generated above confidence threshold
   */
  createAlert: protectedProcedure
    .input(
      z.object({
        stockId: z.number().positive(),
        signalType: z.enum(['buy', 'sell']),
        confidence: z.number().min(0).max(100),
        price: z.number().positive(),
        notificationChannels: z.array(z.enum(['in_app', 'email', 'push'])).default(['in_app']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Get user's alert preferences for this stock
      const preferences = await db
        .select()
        .from(alertPreferences)
        .where(and(eq(alertPreferences.userId, userId), eq(alertPreferences.stockId, input.stockId)))
        .limit(1);

      // Check if alerts are enabled for this signal type
      if (preferences.length > 0) {
        const pref = preferences[0];
        const minConfidence =
          input.signalType === 'buy' ? pref.minBuyConfidence : pref.minSellConfidence;
        const alertsEnabled =
          input.signalType === 'buy' ? pref.enableBuyAlerts : pref.enableSellAlerts;

        // Skip if alerts disabled or confidence below threshold
        if (!alertsEnabled || input.confidence < minConfidence) {
          return {
            success: false,
            message: `Alert not created: ${alertsEnabled ? 'confidence below threshold' : 'alerts disabled'}`,
            alertId: null,
          };
        }
      }

      // Create the alert
      await db.insert(signalAlerts).values({
        userId,
        stockId: input.stockId,
        signalType: input.signalType,
        confidence: input.confidence,
        price: input.price,
        status: 'pending',
        notificationChannels: JSON.stringify(input.notificationChannels),
      });

      return {
        success: true,
        message: `${input.signalType.toUpperCase()} alert created with ${input.confidence}% confidence`,
        alertId: null,
      };
    }),

  /**
   * Get pending alerts for the current user
   */
  getPendingAlerts: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().positive().default(20),
        offset: z.number().int().nonnegative().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const alerts = await db
        .select({
          id: signalAlerts.id,
          stockId: signalAlerts.stockId,
          signalType: signalAlerts.signalType,
          confidence: signalAlerts.confidence,
          price: signalAlerts.price,
          status: signalAlerts.status,
          createdAt: signalAlerts.createdAt,
          ticker: stocks.ticker,
          name: stocks.name,
        })
        .from(signalAlerts)
        .innerJoin(stocks, eq(signalAlerts.stockId, stocks.id))
        .where(and(eq(signalAlerts.userId, userId), eq(signalAlerts.status, 'pending')))
        .orderBy(desc(signalAlerts.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return alerts;
    }),

  /**
   * Get alert history for the current user
   */
  getAlertHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().positive().default(50),
        offset: z.number().int().nonnegative().default(0),
        status: z.enum(['pending', 'sent', 'dismissed']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const baseQuery = db
        .select({
          id: signalAlerts.id,
          stockId: signalAlerts.stockId,
          signalType: signalAlerts.signalType,
          confidence: signalAlerts.confidence,
          price: signalAlerts.price,
          status: signalAlerts.status,
          createdAt: signalAlerts.createdAt,
          sentAt: signalAlerts.sentAt,
          ticker: stocks.ticker,
          name: stocks.name,
        })
        .from(signalAlerts)
        .innerJoin(stocks, eq(signalAlerts.stockId, stocks.id));

      const whereConditions = input.status
        ? and(eq(signalAlerts.userId, userId), eq(signalAlerts.status, input.status))
        : eq(signalAlerts.userId, userId);

      const results = await baseQuery
        .where(whereConditions)
        .orderBy(desc(signalAlerts.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return results;
    }),

  /**
   * Mark an alert as sent
   */
  markAlertSent: protectedProcedure
    .input(z.object({ alertId: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verify alert belongs to user
      const alert = await db
        .select()
        .from(signalAlerts)
        .where(and(eq(signalAlerts.id, input.alertId), eq(signalAlerts.userId, userId)))
        .limit(1);

      if (alert.length === 0) {
        throw new Error('Alert not found');
      }

      await db
        .update(signalAlerts)
        .set({ status: 'sent', sentAt: new Date() })
        .where(eq(signalAlerts.id, input.alertId));

      return { success: true, message: 'Alert marked as sent' };
    }),

  /**
   * Dismiss an alert
   */
  dismissAlert: protectedProcedure
    .input(z.object({ alertId: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verify alert belongs to user
      const alert = await db
        .select()
        .from(signalAlerts)
        .where(and(eq(signalAlerts.id, input.alertId), eq(signalAlerts.userId, userId)))
        .limit(1);

      if (alert.length === 0) {
        throw new Error('Alert not found');
      }

      await db
        .update(signalAlerts)
        .set({ status: 'dismissed' })
        .where(eq(signalAlerts.id, input.alertId));

      return { success: true, message: 'Alert dismissed' };
    }),

  /**
   * Get alert statistics for the current user
   */
  getAlertStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const allAlerts = await db
      .select()
      .from(signalAlerts)
      .where(eq(signalAlerts.userId, userId));

    const pending = allAlerts.filter(a => a.status === 'pending').length;
    const sent = allAlerts.filter(a => a.status === 'sent').length;
    const dismissed = allAlerts.filter(a => a.status === 'dismissed').length;

    const buyAlerts = allAlerts.filter(a => a.signalType === 'buy').length;
    const sellAlerts = allAlerts.filter(a => a.signalType === 'sell').length;

    const avgConfidence =
      allAlerts.length > 0 ? allAlerts.reduce((sum, a) => sum + a.confidence, 0) / allAlerts.length : 0;

    return {
      total: allAlerts.length,
      pending,
      sent,
      dismissed,
      buyAlerts,
      sellAlerts,
      averageConfidence: Math.round(avgConfidence),
    };
  }),

  /**
   * Get high-confidence alerts (above 80%)
   */
  getHighConfidenceAlerts: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const alerts = await db
      .select({
        id: signalAlerts.id,
        stockId: signalAlerts.stockId,
        signalType: signalAlerts.signalType,
        confidence: signalAlerts.confidence,
        price: signalAlerts.price,
        status: signalAlerts.status,
        createdAt: signalAlerts.createdAt,
        ticker: stocks.ticker,
        name: stocks.name,
      })
      .from(signalAlerts)
      .innerJoin(stocks, eq(signalAlerts.stockId, stocks.id))
      .where(and(eq(signalAlerts.userId, userId), gte(signalAlerts.confidence, 80)))
      .orderBy(desc(signalAlerts.confidence));

    return alerts;
  }),

  /**
   * Get alerts by signal type
   */
  getAlertsByType: protectedProcedure
    .input(z.object({ signalType: z.enum(['buy', 'sell']) }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const alerts = await db
        .select({
          id: signalAlerts.id,
          stockId: signalAlerts.stockId,
          signalType: signalAlerts.signalType,
          confidence: signalAlerts.confidence,
          price: signalAlerts.price,
          status: signalAlerts.status,
          createdAt: signalAlerts.createdAt,
          ticker: stocks.ticker,
          name: stocks.name,
        })
        .from(signalAlerts)
        .innerJoin(stocks, eq(signalAlerts.stockId, stocks.id))
        .where(
          and(eq(signalAlerts.userId, userId), eq(signalAlerts.signalType, input.signalType))
        )
        .orderBy(desc(signalAlerts.createdAt));

      return alerts;
    }),

  /**
   * Clear old dismissed alerts (older than 30 days)
   */
  clearOldAlerts: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await db
      .delete(signalAlerts)
      .where(
        and(
          eq(signalAlerts.userId, userId),
          eq(signalAlerts.status, 'dismissed'),
          gte(signalAlerts.createdAt, thirtyDaysAgo)
        )
      );

    return {
      success: true,
      message: `Cleared old dismissed alerts`,
    };
  }),
});
