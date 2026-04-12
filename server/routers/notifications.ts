import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getNotificationPreferences, getNotificationPreference, setNotificationPreference } from '../db';

/**
 * Notification Preferences Router
 * Manages per-stock notification settings and preferences
 */
export const notificationsRouter = router({
  /**
   * Get all notification preferences for current user
   */
  getPreferences: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const preferences = await getNotificationPreferences(ctx.user.id);
        return {
          preferences: preferences?.slice(input.offset, input.offset + input.limit) || [],
          totalCount: preferences?.length || 0,
        };
      } catch (error) {
        console.error('Failed to fetch notification preferences:', error);
        throw new Error('Failed to fetch notification preferences');
      }
    }),

  /**
   * Get preferences for specific stock
   */
  getStockPreferences: protectedProcedure
    .input(z.object({
      symbol: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const pref = await getNotificationPreference(ctx.user.id, input.symbol);
        
        if (!pref) {
          return {
            symbol: input.symbol,
            channels: ['email', 'inApp'],
            triggers: ['buySignal', 'sellSignal'],
            minConfidence: 60,
            enabled: true,
          };
        }
        
        return {
          symbol: pref.symbol,
          channels: JSON.parse(pref.channels || '[]'),
          triggers: JSON.parse(pref.triggers || '[]'),
          minConfidence: pref.minConfidence || 60,
          priceAlertThreshold: pref.priceAlertThreshold,
          enabled: pref.isEnabled === 1,
        };
      } catch (error) {
        console.error('Failed to fetch stock preferences:', error);
        throw new Error('Failed to fetch stock preferences');
      }
    }),

  /**
   * Create or update notification preferences for a stock
   */
  setStockPreferences: protectedProcedure
    .input(z.object({
      symbol: z.string(),
      channels: z.array(z.string()),
      triggers: z.array(z.string()),
      minConfidence: z.number().min(0).max(100).default(60),
      priceAlertThreshold: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await setNotificationPreference(
          ctx.user.id,
          input.symbol,
          input.channels,
          input.triggers,
          input.minConfidence,
          input.priceAlertThreshold
        );
        
        return { success: true };
      } catch (error) {
        console.error('Failed to set stock preferences:', error);
        throw new Error('Failed to set stock preferences');
      }
    }),

  /**
   * Delete notification preferences for a stock
   */
  deleteStockPreferences: protectedProcedure
    .input(z.object({
      symbol: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Delete from database
        return { success: true };
      } catch (error) {
        console.error('Failed to delete stock preferences:', error);
        throw new Error('Failed to delete stock preferences');
      }
    }),

  /**
   * Get notification history
   */
  getNotificationHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      read: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        // TODO: Fetch from notifications table
        return {
          notifications: [],
          totalCount: 0,
        };
      } catch (error) {
        console.error('Failed to fetch notification history:', error);
        throw new Error('Failed to fetch notification history');
      }
    }),

  /**
   * Mark notification as read
   */
  markAsRead: protectedProcedure
    .input(z.object({
      notificationId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Update notification status
        return { success: true };
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
        throw new Error('Failed to mark notification as read');
      }
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        // TODO: Update all user notifications
        return { success: true };
      } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
        throw new Error('Failed to mark all notifications as read');
      }
    }),

  /**
   * Delete notification
   */
  deleteNotification: protectedProcedure
    .input(z.object({
      notificationId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Delete from database
        return { success: true };
      } catch (error) {
        console.error('Failed to delete notification:', error);
        throw new Error('Failed to delete notification');
      }
    }),

  /**
   * Get unread notification count
   */
  getUnreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // TODO: Count unread notifications
        return { unreadCount: 0 };
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
        throw new Error('Failed to fetch unread count');
      }
    }),

  /**
   * Subscribe to push notifications
   */
  subscribeToPush: protectedProcedure
    .input(z.object({
      subscription: z.object({
        endpoint: z.string(),
        keys: z.object({
          p256dh: z.string(),
          auth: z.string(),
        }),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Save push subscription
        return { success: true };
      } catch (error) {
        console.error('Failed to subscribe to push:', error);
        throw new Error('Failed to subscribe to push');
      }
    }),

  /**
   * Unsubscribe from push notifications
   */
  unsubscribeFromPush: protectedProcedure
    .input(z.object({
      endpoint: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Delete push subscription
        return { success: true };
      } catch (error) {
        console.error('Failed to unsubscribe from push:', error);
        throw new Error('Failed to unsubscribe from push');
      }
    }),

  /**
   * Get global notification settings
   */
  getGlobalSettings: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // TODO: Fetch from user preferences
        return {
          emailNotifications: true,
          pushNotifications: true,
          inAppNotifications: true,
          marketingEmails: false,
          digestFrequency: 'daily',
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '08:00',
          },
        };
      } catch (error) {
        console.error('Failed to fetch global settings:', error);
        throw new Error('Failed to fetch global settings');
      }
    }),

  /**
   * Update global notification settings
   */
  updateGlobalSettings: protectedProcedure
    .input(z.object({
      emailNotifications: z.boolean().optional(),
      pushNotifications: z.boolean().optional(),
      inAppNotifications: z.boolean().optional(),
      marketingEmails: z.boolean().optional(),
      digestFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
      quietHours: z.object({
        enabled: z.boolean(),
        start: z.string(),
        end: z.string(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Update user preferences
        return { success: true };
      } catch (error) {
        console.error('Failed to update global settings:', error);
        throw new Error('Failed to update global settings');
      }
    }),
});
