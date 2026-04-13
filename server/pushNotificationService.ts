/**
 * Push Notification Service
 * Handles sending push notifications to users about trading signals
 * Stores notifications in database for in-app display and delivery
 */

import { getDb } from "./db";
import { notifications, users, signals } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag: string; // Unique identifier for grouping notifications
  data: {
    type: 'buy_signal' | 'sell_signal' | 'alert' | 'price_alert';
    ticker: string;
    price: number;
    confidence: number;
    url: string; // Link to stock detail page
  };
}

/**
 * Send a push notification to a user
 * Stores in database and optionally sends via email
 */
export async function sendPushNotification(
  userId: number,
  signalId: number,
  payload: PushNotificationPayload,
  sendEmail: boolean = true
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Store notification in database
    await db.insert(notifications).values({
      userId,
      signalId,
      ticker: payload.data.ticker,
      title: payload.title,
      message: payload.body,
      isRead: 0,
      createdAt: new Date(),
    });

    // Log for monitoring
    console.log(`[Notification] Stored for user ${userId}: ${payload.title}`);

    // Send email notification if enabled
    if (sendEmail) {
      try {
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, userId));

        if (user[0]?.email) {
          await sendSignalEmail(
            user[0].email,
            payload,
            user[0].name || "Trader"
          );
        }
      } catch (emailError) {
        console.error("[Notification] Failed to send email:", emailError);
        // Don't fail the notification if email fails
      }
    }

    return true;
  } catch (error) {
    console.error("[Notification] Failed to send notification:", error);
    return false;
  }
}

/**
 * Send email notification for trading signal
 */
async function sendSignalEmail(
  email: string,
  payload: PushNotificationPayload,
  userName: string
): Promise<void> {
  try {
    const emailContent = `
Hi ${userName},

${payload.title}

${payload.body}

Signal Details:
- Ticker: ${payload.data.ticker}
- Price: £${payload.data.price.toFixed(2)}
- Confidence: ${payload.data.confidence}%
- Type: ${payload.data.type.replace('_', ' ').toUpperCase()}

View Details: ${payload.data.url}

Best regards,
Vortex Trade Team
    `;

    // Send via owner notification (for now, can be replaced with user email service)
    await notifyOwner({
      title: payload.title,
      content: emailContent,
    });

    console.log(`[Email] Signal notification sent to ${email}`);
  } catch (error) {
    console.error("[Email] Failed to send signal email:", error);
    throw error;
  }
}

/**
 * Send buy signal notification
 */
export async function notifyBuySignal(
  userId: number,
  signalId: number,
  ticker: string,
  price: number,
  confidence: number,
  sendEmail: boolean = true
): Promise<boolean> {
  return sendPushNotification(
    userId,
    signalId,
    {
      title: `🔵 Buy Signal: ${ticker}`,
      body: `Strong buy signal at £${price.toFixed(2)} (${confidence}% confidence)`,
      icon: "📈",
      tag: `buy-${ticker}-${Date.now()}`,
      data: {
        type: "buy_signal",
        ticker,
        price,
        confidence,
        url: `/stock/${ticker}`,
      },
    },
    sendEmail
  );
}

/**
 * Send sell signal notification
 */
export async function notifySellSignal(
  userId: number,
  signalId: number,
  ticker: string,
  price: number,
  confidence: number,
  sendEmail: boolean = true
): Promise<boolean> {
  return sendPushNotification(
    userId,
    signalId,
    {
      title: `🔴 Sell Signal: ${ticker}`,
      body: `Strong sell signal at £${price.toFixed(2)} (${confidence}% confidence)`,
      icon: "📉",
      tag: `sell-${ticker}-${Date.now()}`,
      data: {
        type: "sell_signal",
        ticker,
        price,
        confidence,
        url: `/stock/${ticker}`,
      },
    },
    sendEmail
  );
}

/**
 * Send price alert notification
 */
export async function notifyPriceAlert(
  userId: number,
  signalId: number,
  ticker: string,
  price: number,
  targetPrice: number,
  direction: "above" | "below"
): Promise<boolean> {
  const directionText = direction === "above" ? "above" : "below";
  return sendPushNotification(userId, signalId, {
    title: `💰 Price Alert: ${ticker}`,
    body: `${ticker} has moved ${directionText} £${targetPrice.toFixed(
      2
    )} (now £${price.toFixed(2)})`,
    icon: "🎯",
    tag: `price-${ticker}-${Date.now()}`,
    data: {
      type: "price_alert",
      ticker,
      price,
      confidence: 100,
      url: `/stock/${ticker}`,
    },
  });
}

/**
 * Notify all users watching a stock about a signal
 */
export async function notifyWatchlistUsers(
  signalId: number,
  ticker: string,
  signalType: "buy" | "sell",
  price: number,
  confidence: number
): Promise<number> {
  let notifiedCount = 0;

  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get all users with active subscriptions
    const watchlistUsers = await db
      .select()
      .from(users)
      .where(eq(users.subscriptionStatus, "active"));

    // Send notifications to all users
    for (const user of watchlistUsers) {
      try {
        if (signalType === "buy") {
          await notifyBuySignal(user.id, signalId, ticker, price, confidence, false);
        } else {
          await notifySellSignal(user.id, signalId, ticker, price, confidence, false);
        }
        notifiedCount++;
      } catch (error) {
        console.error(
          `[Notification] Failed to notify user ${user.id}:`,
          error
        );
      }
    }

    console.log(
      `[Notification] Notified ${notifiedCount} users about ${signalType} signal for ${ticker}`
    );
  } catch (error) {
    console.error("[Notification] Failed to notify watchlist users:", error);
  }

  return notifiedCount;
}

/**
 * Get user notifications
 */
export async function getUserNotifications(
  userId: number,
  limit: number = 50
): Promise<any[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(notifications.createdAt)
      .limit(limit);

    return userNotifications;
  } catch (error) {
    console.error("[Notification] Failed to get user notifications:", error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  notificationId: number
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(notifications)
      .set({ 
        isRead: 1,
        readAt: new Date()
      })
      .where(eq(notifications.id, notificationId));

    return true;
  } catch (error) {
    console.error("[Notification] Failed to mark as read:", error);
    return false;
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(
  notificationId: number
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Soft delete by marking as read
    await db
      .update(notifications)
      .set({ 
        isRead: 1,
        readAt: new Date()
      })
      .where(eq(notifications.id, notificationId));

    return true;
  } catch (error) {
    console.error("[Notification] Failed to delete notification:", error);
    return false;
  }
}

/**
 * Format notification for display in UI
 */
export function formatNotificationForUI(notification: {
  title: string;
  message: string;
  ticker: string;
  createdAt: Date;
  isRead: number;
}) {
  return {
    id: `${notification.ticker}-${notification.createdAt.getTime()}`,
    title: notification.title,
    body: notification.message,
    ticker: notification.ticker,
    timestamp: notification.createdAt,
    isRead: notification.isRead === 1,
    timeAgo: getTimeAgo(notification.createdAt),
  };
}

/**
 * Get human-readable time difference
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
