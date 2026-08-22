/**
 * Push Notifications Router
 * tRPC procedures for managing push notification subscriptions and sending notifications
 */

import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import {
  sendPushNotification,
  createBuySignalNotification,
  createSellSignalNotification,
  createSentimentNotification,
  createHighConfidenceAlertNotification,
  isValidPushSubscription,
} from '../pushNotifications';

// Store subscriptions in memory (in production, use database)
const userSubscriptions = new Map<number, any[]>();

export const pushNotificationsRouter = router({
  /**
   * Subscribe to push notifications
   */
  subscribe: protectedProcedure
    .input(
      z.object({
        endpoint: z.string().url(),
        keys: z.object({
          p256dh: z.string(),
          auth: z.string(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Validate subscription
      if (!isValidPushSubscription(input)) {
        throw new Error('Invalid push subscription');
      }

      // Store subscription
      if (!userSubscriptions.has(userId)) {
        userSubscriptions.set(userId, []);
      }

      const subscriptions = userSubscriptions.get(userId)!;

      // Check if already subscribed
      const existingIndex = subscriptions.findIndex(s => s.endpoint === input.endpoint);
      if (existingIndex >= 0) {
        subscriptions[existingIndex] = input;
      } else {
        subscriptions.push(input);
      }

      return {
        success: true,
        message: 'Successfully subscribed to push notifications',
        subscriptionCount: subscriptions.length,
      };
    }),

  /**
   * Unsubscribe from push notifications
   */
  unsubscribe: protectedProcedure
    .input(z.object({ endpoint: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      if (!userSubscriptions.has(userId)) {
        return { success: false, message: 'No subscriptions found' };
      }

      const subscriptions = userSubscriptions.get(userId)!;
      const initialCount = subscriptions.length;

      // Remove subscription
      const filtered = subscriptions.filter(s => s.endpoint !== input.endpoint);
      userSubscriptions.set(userId, filtered);

      if (filtered.length === initialCount) {
        return { success: false, message: 'Subscription not found' };
      }

      return {
        success: true,
        message: 'Successfully unsubscribed from push notifications',
        subscriptionCount: filtered.length,
      };
    }),

  /**
   * Get user's push subscriptions
   */
  getSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    if (!userSubscriptions.has(userId)) {
      return [];
    }

    const subscriptions = userSubscriptions.get(userId)!;
    return subscriptions.map(s => ({
      endpoint: s.endpoint,
      subscribed: true,
    }));
  }),

  /**
   * Send buy signal notification
   */
  sendBuySignal: protectedProcedure
    .input(
      z.object({
        ticker: z.string(),
        confidence: z.number().min(0).max(100),
        price: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      if (!userSubscriptions.has(userId)) {
        return { success: false, message: 'No push subscriptions found' };
      }

      const subscriptions = userSubscriptions.get(userId)!;
      const payload = createBuySignalNotification(input.ticker, input.confidence, input.price);

      const results = await Promise.all(
        subscriptions.map(sub => sendPushNotification(sub, payload))
      );

      const successful = results.filter(r => r.success).length;

      return {
        success: successful > 0,
        message: `Sent buy signal to ${successful}/${subscriptions.length} devices`,
        devicesNotified: successful,
      };
    }),

  /**
   * Send sell signal notification
   */
  sendSellSignal: protectedProcedure
    .input(
      z.object({
        ticker: z.string(),
        confidence: z.number().min(0).max(100),
        price: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      if (!userSubscriptions.has(userId)) {
        return { success: false, message: 'No push subscriptions found' };
      }

      const subscriptions = userSubscriptions.get(userId)!;
      const payload = createSellSignalNotification(input.ticker, input.confidence, input.price);

      const results = await Promise.all(
        subscriptions.map(sub => sendPushNotification(sub, payload))
      );

      const successful = results.filter(r => r.success).length;

      return {
        success: successful > 0,
        message: `Sent sell signal to ${successful}/${subscriptions.length} devices`,
        devicesNotified: successful,
      };
    }),

  /**
   * Send sentiment update notification
   */
  sendSentimentUpdate: protectedProcedure
    .input(
      z.object({
        ticker: z.string(),
        sentimentScore: z.number().min(-1).max(1),
        classification: z.enum(['very_negative', 'negative', 'neutral', 'positive', 'very_positive']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      if (!userSubscriptions.has(userId)) {
        return { success: false, message: 'No push subscriptions found' };
      }

      const subscriptions = userSubscriptions.get(userId)!;
      const payload = createSentimentNotification(input.ticker, input.sentimentScore, input.classification);

      const results = await Promise.all(
        subscriptions.map(sub => sendPushNotification(sub, payload))
      );

      const successful = results.filter(r => r.success).length;

      return {
        success: successful > 0,
        message: `Sent sentiment update to ${successful}/${subscriptions.length} devices`,
        devicesNotified: successful,
      };
    }),

  /**
   * Send high-confidence alert notification
   */
  sendHighConfidenceAlert: protectedProcedure
    .input(
      z.object({
        ticker: z.string(),
        signalType: z.enum(['buy', 'sell']),
        confidence: z.number().min(80).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      if (!userSubscriptions.has(userId)) {
        return { success: false, message: 'No push subscriptions found' };
      }

      const subscriptions = userSubscriptions.get(userId)!;
      const payload = createHighConfidenceAlertNotification(
        input.ticker,
        input.signalType,
        input.confidence
      );

      const results = await Promise.all(
        subscriptions.map(sub => sendPushNotification(sub, payload))
      );

      const successful = results.filter(r => r.success).length;

      return {
        success: successful > 0,
        message: `Sent high-confidence alert to ${successful}/${subscriptions.length} devices`,
        devicesNotified: successful,
      };
    }),

  /**
   * Check push notification support
   */
  checkSupport: protectedProcedure.query(async () => {
    return {
      supported: true,
      message: 'Push notifications are supported in this browser',
      requirements: {
        serviceWorker: true,
        pushApi: true,
        notification: true,
      },
    };
  }),

  /**
   * Get subscription count
   */
  getSubscriptionCount: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const count = userSubscriptions.has(userId) ? userSubscriptions.get(userId)!.length : 0;

    return {
      subscriptionCount: count,
      isSubscribed: count > 0,
    };
  }),

  /**
   * Clear all subscriptions for user
   */
  clearAllSubscriptions: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;
    userSubscriptions.delete(userId);

    return {
      success: true,
      message: 'All push subscriptions cleared',
    };
  }),
});
