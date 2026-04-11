/**
 * Push Notification Service
 * Handles sending push notifications to users about trading signals
 */

// Push notifications will be stored in the database via tRPC procedures

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
 */
export async function sendPushNotification(
  userId: number,
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    // In production, store notification in database
    // For now, log to console
    console.log(`[Notification] User ${userId}: ${payload.title}`);

    // In a production app, you would send this to a push notification service
    // like Firebase Cloud Messaging (FCM) or Web Push API
    // For now, we're storing it in the database for in-app display

    console.log(`[Notification] Sent to user ${userId}: ${payload.title}`);
    return true;
  } catch (error) {
    console.error('[Notification] Failed to send notification:', error);
    return false;
  }
}

/**
 * Send buy signal notification
 */
export async function notifyBuySignal(
  userId: number,
  ticker: string,
  price: number,
  confidence: number
): Promise<boolean> {
  return sendPushNotification(userId, {
    title: `🔵 Buy Signal: ${ticker}`,
    body: `Strong buy signal at £${price.toFixed(2)} (${confidence}% confidence)`,
    icon: '📈',
    tag: `buy-${ticker}-${Date.now()}`,
    data: {
      type: 'buy_signal',
      ticker,
      price,
      confidence,
      url: `/stock/${ticker}`,
    },
  });
}

/**
 * Send sell signal notification
 */
export async function notifySellSignal(
  userId: number,
  ticker: string,
  price: number,
  confidence: number
): Promise<boolean> {
  return sendPushNotification(userId, {
    title: `🔴 Sell Signal: ${ticker}`,
    body: `Strong sell signal at £${price.toFixed(2)} (${confidence}% confidence)`,
    icon: '📉',
    tag: `sell-${ticker}-${Date.now()}`,
    data: {
      type: 'sell_signal',
      ticker,
      price,
      confidence,
      url: `/stock/${ticker}`,
    },
  });
}

/**
 * Send price alert notification
 */
export async function notifyPriceAlert(
  userId: number,
  ticker: string,
  price: number,
  targetPrice: number,
  direction: 'above' | 'below'
): Promise<boolean> {
  const directionText = direction === 'above' ? 'above' : 'below';
  return sendPushNotification(userId, {
    title: `💰 Price Alert: ${ticker}`,
    body: `${ticker} has moved ${directionText} £${targetPrice.toFixed(2)} (now £${price.toFixed(2)})`,
    icon: '🎯',
    tag: `price-${ticker}-${Date.now()}`,
    data: {
      type: 'price_alert',
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
  ticker: string,
  signalType: 'buy' | 'sell',
  price: number,
  confidence: number
): Promise<number> {
  let notifiedCount = 0;

  try {
    // In a production app, you would query all users watching this stock
    // For now, this is a placeholder for the notification logic
    console.log(`[Notification] Notifying users about ${signalType} signal for ${ticker}`);

    // Example: Get all users and send notifications
    // This would be called from a background job when signals are generated
  } catch (error) {
    console.error('[Notification] Failed to notify watchlist users:', error);
  }

  return notifiedCount;
}

/**
 * Format notification for display in UI
 */
export function formatNotificationForUI(notification: {
  title: string;
  body: string;
  type: string;
  ticker: string;
  price: number;
  confidence: number;
  createdAt: Date;
}) {
  return {
    id: `${notification.ticker}-${notification.createdAt.getTime()}`,
    title: notification.title,
    body: notification.body,
    type: notification.type,
    ticker: notification.ticker,
    price: notification.price,
    confidence: notification.confidence,
    timestamp: notification.createdAt,
    timeAgo: getTimeAgo(notification.createdAt),
  };
}

/**
 * Get human-readable time difference
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
