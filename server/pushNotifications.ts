/**
 * Push Notifications Service
 * Handles Web Push API notifications for signal alerts and sentiment updates
 */

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Send a push notification to a subscription
 * In production, this would use web-push library to send actual notifications
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushNotificationPayload
): Promise<{ success: boolean; message: string }> {
  try {
    // In production, use web-push library:
    // const webpush = require('web-push');
    // await webpush.sendNotification(subscription, JSON.stringify(payload));

    console.log('[Push Notification] Sending to:', subscription.endpoint);
    console.log('[Push Notification] Payload:', payload);

    // Mock implementation - simulate successful send
    return {
      success: true,
      message: 'Push notification sent successfully',
    };
  } catch (error) {
    console.error('[Push Notification] Error:', error);
    return {
      success: false,
      message: `Failed to send push notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Create a push notification payload for a buy signal
 */
export function createBuySignalNotification(
  ticker: string,
  confidence: number,
  price: number
): PushNotificationPayload {
  return {
    title: `🟢 BUY Signal: ${ticker}`,
    body: `High-confidence buy signal (${confidence}%) at $${(price / 100).toFixed(2)}`,
    tag: `buy-signal-${ticker}`,
    data: {
      type: 'buy_signal',
      ticker,
      confidence,
      price,
      timestamp: new Date().toISOString(),
    },
    actions: [
      {
        action: 'view',
        title: 'View Details',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  };
}

/**
 * Create a push notification payload for a sell signal
 */
export function createSellSignalNotification(
  ticker: string,
  confidence: number,
  price: number
): PushNotificationPayload {
  return {
    title: `🔴 SELL Signal: ${ticker}`,
    body: `High-confidence sell signal (${confidence}%) at $${(price / 100).toFixed(2)}`,
    tag: `sell-signal-${ticker}`,
    data: {
      type: 'sell_signal',
      ticker,
      confidence,
      price,
      timestamp: new Date().toISOString(),
    },
    actions: [
      {
        action: 'view',
        title: 'View Details',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  };
}

/**
 * Create a push notification payload for sentiment change
 */
export function createSentimentNotification(
  ticker: string,
  sentimentScore: number,
  classification: string
): PushNotificationPayload {
  const emoji =
    classification === 'very_positive'
      ? '📈'
      : classification === 'positive'
        ? '📊'
        : classification === 'neutral'
          ? '➡️'
          : classification === 'negative'
            ? '📉'
            : '⚠️';

  return {
    title: `${emoji} Sentiment Update: ${ticker}`,
    body: `Market sentiment is ${classification.replace('_', ' ')} (${Math.round((sentimentScore + 1) / 2 * 100)}%)`,
    tag: `sentiment-${ticker}`,
    data: {
      type: 'sentiment_update',
      ticker,
      sentimentScore,
      classification,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Create a push notification payload for high-confidence alerts
 */
export function createHighConfidenceAlertNotification(
  ticker: string,
  signalType: 'buy' | 'sell',
  confidence: number
): PushNotificationPayload {
  const title = signalType === 'buy' ? '🚀 Strong BUY' : '⛔ Strong SELL';
  return {
    title: `${title}: ${ticker}`,
    body: `${confidence}% confidence ${signalType} signal detected`,
    tag: `high-confidence-${signalType}-${ticker}`,
    data: {
      type: 'high_confidence_alert',
      ticker,
      signalType,
      confidence,
      timestamp: new Date().toISOString(),
    },
    actions: [
      {
        action: 'trade',
        title: `Execute ${signalType.toUpperCase()}`,
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  };
}

/**
 * Create a push notification payload for portfolio milestone
 */
export function createPortfolioMilestoneNotification(
  milestone: string,
  value: number,
  change: number
): PushNotificationPayload {
  const emoji = change > 0 ? '🎉' : '⚠️';
  return {
    title: `${emoji} Portfolio Milestone`,
    body: `${milestone}: $${(value / 100).toFixed(2)} (${change > 0 ? '+' : ''}${change.toFixed(2)}%)`,
    tag: 'portfolio-milestone',
    data: {
      type: 'portfolio_milestone',
      milestone,
      value,
      change,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Validate a push subscription
 */
export function isValidPushSubscription(subscription: any): subscription is PushSubscription {
  return (
    subscription &&
    typeof subscription === 'object' &&
    typeof subscription.endpoint === 'string' &&
    subscription.keys &&
    typeof subscription.keys.p256dh === 'string' &&
    typeof subscription.keys.auth === 'string'
  );
}

/**
 * Format notification for display
 */
export function formatNotificationForDisplay(payload: PushNotificationPayload): string {
  const data = payload.data || {};
  const timestamp = data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString();

  let message = `${payload.title}\n${payload.body}\n${timestamp}`;

  if (data.ticker) {
    message += `\nTicker: ${data.ticker}`;
  }

  if (data.confidence) {
    message += `\nConfidence: ${data.confidence}%`;
  }

  if (data.price) {
    message += `\nPrice: $${(data.price / 100).toFixed(2)}`;
  }

  return message;
}

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(type: string): string {
  const icons: Record<string, string> = {
    buy_signal: '🟢',
    sell_signal: '🔴',
    sentiment_update: '📊',
    high_confidence_alert: '⚡',
    portfolio_milestone: '🎯',
  };

  return icons[type] || '📱';
}
