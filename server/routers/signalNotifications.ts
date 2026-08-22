import { protectedProcedure, publicProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { sendBuySignalNotification, sendSellSignalNotification } from '../notificationDelivery';

/**
 * Signal Notification Router
 * Handles triggering notifications when buy/sell signals are detected
 */
export const signalNotificationsRouter = router({
  /**
   * Trigger a buy signal notification
   * Sends to all configured channels (email, push, in-app)
   */
  triggerBuySignal: protectedProcedure
    .input(
      z.object({
        ticker: z.string().min(1).max(10),
        price: z.number().positive(),
        confidence: z.number().min(0).max(100),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await sendBuySignalNotification(
          {
            ticker: input.ticker,
            signalType: 'buy',
            price: input.price,
            confidence: input.confidence,
          },
          {
            userId: ctx.user.id.toString(),
            userEmail: ctx.user.email || 'user@example.com',
            channels: {
              email: true,
              push: true,
              inApp: true,
            },
          }
        );

        return {
          success: result.success,
          channels: result.channels,
          message: 'Buy signal notification sent',
        };
      } catch (error) {
        console.error('Failed to send buy signal notification:', error);
        return {
          success: false,
          channels: { email: false, push: false, inApp: false },
          message: 'Failed to send notification',
        };
      }
    }),

  /**
   * Trigger a sell signal notification
   * Sends to all configured channels (email, push, in-app)
   */
  triggerSellSignal: protectedProcedure
    .input(
      z.object({
        ticker: z.string().min(1).max(10),
        price: z.number().positive(),
        confidence: z.number().min(0).max(100),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await sendSellSignalNotification(
          {
            ticker: input.ticker,
            signalType: 'sell',
            price: input.price,
            confidence: input.confidence,
          },
          {
            userId: ctx.user.id.toString(),
            userEmail: ctx.user.email || 'user@example.com',
            channels: {
              email: true,
              push: true,
              inApp: true,
            },
          }
        );

        return {
          success: result.success,
          channels: result.channels,
          message: 'Sell signal notification sent',
        };
      } catch (error) {
        console.error('Failed to send sell signal notification:', error);
        return {
          success: false,
          channels: { email: false, push: false, inApp: false },
          message: 'Failed to send notification',
        };
      }
    }),

  /**
   * Test notification delivery
   * Sends a test notification to verify all channels are working
   */
  sendTestNotification: protectedProcedure
    .input(
      z.object({
        ticker: z.string().min(1).max(10).default('AAPL'),
        signalType: z.enum(['buy', 'sell']).default('buy'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const testPrice = 150.00;
        const testConfidence = 75;

        let result;
        if (input.signalType === 'buy') {
          result = await sendBuySignalNotification(
            {
              ticker: input.ticker,
              signalType: 'buy',
              price: testPrice,
              confidence: testConfidence,
            },
            {
              userId: ctx.user.id.toString(),
              userEmail: ctx.user.email || 'user@example.com',
              channels: {
                email: true,
                push: true,
                inApp: true,
              },
            }
          );
        } else {
          result = await sendSellSignalNotification(
            {
              ticker: input.ticker,
              signalType: 'sell',
              price: testPrice,
              confidence: testConfidence,
            },
            {
              userId: ctx.user.id.toString(),
              userEmail: ctx.user.email || 'user@example.com',
              channels: {
                email: true,
                push: true,
                inApp: true,
              },
            }
          );
        }

        return {
          success: result.success,
          channels: result.channels,
          message: 'Test notification sent successfully',
        };
      } catch (error) {
        console.error('Failed to send test notification:', error);
        return {
          success: false,
          channels: { email: false, push: false, inApp: false },
          message: 'Failed to send test notification',
        };
      }
    }),

  /**
   * Get notification delivery status
   * Returns information about notification channels and delivery status
   */
  getNotificationStatus: protectedProcedure.query(async ({ ctx }) => {
    return {
      userId: ctx.user.id,
      channels: {
        email: {
          enabled: true,
          description: 'Email notifications to registered email',
        },
        push: {
          enabled: true,
          description: 'Browser push notifications',
        },
        inApp: {
          enabled: true,
          description: 'In-app notification center',
        },
      },
      lastNotificationTime: null,
      notificationCount: 0,
    };
  }),

  /**
   * Bulk trigger notifications for multiple signals
   * Useful for batch processing of detected signals
   */
  triggerBulkSignals: protectedProcedure
    .input(
      z.object({
        signals: z.array(
          z.object({
            ticker: z.string().min(1).max(10),
            price: z.number().positive(),
            confidence: z.number().min(0).max(100),
            type: z.enum(['buy', 'sell']),
            reason: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const results = [];

      for (const signal of input.signals) {
        try {
          let result;
          if (signal.type === 'buy') {
            result = await sendBuySignalNotification(
              {
                ticker: signal.ticker,
                signalType: 'buy',
                price: signal.price,
                confidence: signal.confidence,
              },
              {
                userId: ctx.user.id.toString(),
                userEmail: ctx.user.email || 'user@example.com',
                channels: {
                  email: true,
                  push: true,
                  inApp: true,
                },
              }
            );
          } else {
            result = await sendSellSignalNotification(
              {
                ticker: signal.ticker,
                signalType: 'sell',
                price: signal.price,
                confidence: signal.confidence,
              },
              {
                userId: ctx.user.id.toString(),
                userEmail: ctx.user.email || 'user@example.com',
                channels: {
                  email: true,
                  push: true,
                  inApp: true,
                },
              }
            );
          }

          results.push({
            ticker: signal.ticker,
            type: signal.type,
            success: result.success,
            channels: result.channels,
          });
        } catch (error) {
          console.error(`Failed to send ${signal.type} signal for ${signal.ticker}:`, error);
          results.push({
            ticker: signal.ticker,
            type: signal.type,
            success: false,
            channels: { email: false, push: false, inApp: false },
          });
        }
      }

      const successCount = results.filter((r) => r.success).length;
      return {
        total: results.length,
        successful: successCount,
        failed: results.length - successCount,
        results,
      };
    }),
});
