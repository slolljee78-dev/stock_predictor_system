/**
 * Notification Delivery Service
 * Orchestrates multi-channel notification delivery (email, push, in-app)
 */

import { sendEmail, createBuySignalEmail, createSellSignalEmail, createSentimentUpdateEmail } from './emailNotifications';
import { fetchStockNewsFromAlphaVantage, calculateAggregatedSentiment, classifySentiment } from './alphaVantageNews';

export interface NotificationDeliveryOptions {
  userId: string;
  userEmail: string;
  channels: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

export interface SignalNotificationPayload {
  ticker: string;
  signalType: 'buy' | 'sell';
  confidence: number;
  price: number;
  technicalIndicators?: Record<string, any>;
}

export interface SentimentNotificationPayload {
  ticker: string;
  sentimentScore: number;
  articleCount: number;
}

/**
 * Send buy signal notification through all enabled channels
 */
export async function sendBuySignalNotification(
  payload: SignalNotificationPayload,
  options: NotificationDeliveryOptions
): Promise<{ success: boolean; channels: Record<string, boolean> }> {
  const results: Record<string, boolean> = {
    email: false,
    push: false,
    inApp: false,
  };

  try {
    // Email notification
    if (options.channels.email) {
      const emailNotification = createBuySignalEmail(
        options.userEmail,
        payload.ticker,
        payload.confidence,
        payload.price,
        payload.technicalIndicators
      );
      const emailResult = await sendEmail(emailNotification);
      results.email = emailResult.success;
      console.log(`[Notification] Buy signal email sent to ${options.userEmail}: ${emailResult.success}`);
    }

    // Push notification
    if (options.channels.push) {
      results.push = await sendPushNotification({
        title: `🟢 BUY Signal: ${payload.ticker}`,
        body: `${payload.confidence}% confidence at $${(payload.price / 100).toFixed(2)}`,
        data: {
          type: 'buy_signal',
          ticker: payload.ticker,
          confidence: payload.confidence,
          price: payload.price,
          url: `/stock/${payload.ticker}`,
        },
      });
      console.log(`[Notification] Buy signal push sent to user ${options.userId}: ${results.push}`);
    }

    // In-app notification
    if (options.channels.inApp) {
      results.inApp = await createInAppNotification(options.userId, {
        type: 'buy_signal',
        title: `🟢 BUY Signal: ${payload.ticker}`,
        message: `${payload.confidence}% confidence at $${(payload.price / 100).toFixed(2)}`,
        ticker: payload.ticker,
        data: payload,
      });
      console.log(`[Notification] Buy signal in-app notification created for user ${options.userId}: ${results.inApp}`);
    }

    return {
      success: Object.values(results).some(v => v),
      channels: results,
    };
  } catch (error) {
    console.error('[Notification] Error sending buy signal notification:', error);
    return {
      success: false,
      channels: results,
    };
  }
}

/**
 * Send sell signal notification through all enabled channels
 */
export async function sendSellSignalNotification(
  payload: SignalNotificationPayload,
  options: NotificationDeliveryOptions
): Promise<{ success: boolean; channels: Record<string, boolean> }> {
  const results: Record<string, boolean> = {
    email: false,
    push: false,
    inApp: false,
  };

  try {
    // Email notification
    if (options.channels.email) {
      const emailNotification = createSellSignalEmail(
        options.userEmail,
        payload.ticker,
        payload.confidence,
        payload.price,
        payload.technicalIndicators
      );
      const emailResult = await sendEmail(emailNotification);
      results.email = emailResult.success;
      console.log(`[Notification] Sell signal email sent to ${options.userEmail}: ${emailResult.success}`);
    }

    // Push notification
    if (options.channels.push) {
      results.push = await sendPushNotification({
        title: `🔴 SELL Signal: ${payload.ticker}`,
        body: `${payload.confidence}% confidence at $${(payload.price / 100).toFixed(2)}`,
        data: {
          type: 'sell_signal',
          ticker: payload.ticker,
          confidence: payload.confidence,
          price: payload.price,
          url: `/stock/${payload.ticker}`,
        },
      });
      console.log(`[Notification] Sell signal push sent to user ${options.userId}: ${results.push}`);
    }

    // In-app notification
    if (options.channels.inApp) {
      results.inApp = await createInAppNotification(options.userId, {
        type: 'sell_signal',
        title: `🔴 SELL Signal: ${payload.ticker}`,
        message: `${payload.confidence}% confidence at $${(payload.price / 100).toFixed(2)}`,
        ticker: payload.ticker,
        data: payload,
      });
      console.log(`[Notification] Sell signal in-app notification created for user ${options.userId}: ${results.inApp}`);
    }

    return {
      success: Object.values(results).some(v => v),
      channels: results,
    };
  } catch (error) {
    console.error('[Notification] Error sending sell signal notification:', error);
    return {
      success: false,
      channels: results,
    };
  }
}

/**
 * Send sentiment update notification
 */
export async function sendSentimentNotification(
  payload: SentimentNotificationPayload,
  options: NotificationDeliveryOptions
): Promise<{ success: boolean; channels: Record<string, boolean> }> {
  const results: Record<string, boolean> = {
    email: false,
    push: false,
    inApp: false,
  };

  try {
    const classification = classifySentiment(payload.sentimentScore);
    const emoji =
      classification === 'very_positive'
        ? '🚀'
        : classification === 'positive'
          ? '📈'
          : classification === 'neutral'
            ? '➡️'
            : classification === 'negative'
              ? '📉'
              : '⚠️';

    // Email notification
    if (options.channels.email) {
      const emailNotification = createSentimentUpdateEmail(
        options.userEmail,
        payload.ticker,
        payload.sentimentScore,
        classification,
        payload.articleCount
      );
      const emailResult = await sendEmail(emailNotification);
      results.email = emailResult.success;
      console.log(`[Notification] Sentiment email sent to ${options.userEmail}: ${emailResult.success}`);
    }

    // Push notification
    if (options.channels.push) {
      results.push = await sendPushNotification({
        title: `${emoji} Sentiment Update: ${payload.ticker}`,
        body: `${classification.replace('_', ' ')} - ${payload.articleCount} articles analyzed`,
        data: {
          type: 'sentiment_update',
          ticker: payload.ticker,
          sentiment: classification,
          score: payload.sentimentScore,
          url: `/stock/${payload.ticker}`,
        },
      });
      console.log(`[Notification] Sentiment push sent to user ${options.userId}: ${results.push}`);
    }

    // In-app notification
    if (options.channels.inApp) {
      results.inApp = await createInAppNotification(options.userId, {
        type: 'sentiment_update',
        title: `${emoji} Sentiment Update: ${payload.ticker}`,
        message: `${classification.replace('_', ' ')} - ${payload.articleCount} articles analyzed`,
        ticker: payload.ticker,
        data: payload,
      });
      console.log(`[Notification] Sentiment in-app notification created for user ${options.userId}: ${results.inApp}`);
    }

    return {
      success: Object.values(results).some(v => v),
      channels: results,
    };
  } catch (error) {
    console.error('[Notification] Error sending sentiment notification:', error);
    return {
      success: false,
      channels: results,
    };
  }
}

/**
 * Send push notification (mock implementation)
 */
async function sendPushNotification(payload: {
  title: string;
  body: string;
  data: Record<string, any>;
}): Promise<boolean> {
  try {
    // In production, this would send to Web Push service
    // For now, log the notification
    console.log('[Push Notification]', payload);
    return true;
  } catch (error) {
    console.error('[Push Notification] Error:', error);
    return false;
  }
}

/**
 * Create in-app notification (mock implementation)
 */
async function createInAppNotification(
  userId: string,
  notification: {
    type: string;
    title: string;
    message: string;
    ticker: string;
    data: any;
  }
): Promise<boolean> {
  try {
    // In production, this would save to database
    console.log(`[In-App Notification] User ${userId}:`, notification);
    return true;
  } catch (error) {
    console.error('[In-App Notification] Error:', error);
    return false;
  }
}

/**
 * Fetch news and send sentiment notification if sentiment changed significantly
 */
export async function updateAndNotifySentiment(
  ticker: string,
  options: NotificationDeliveryOptions,
  previousSentiment?: number
): Promise<{ success: boolean; newSentiment: number; changed: boolean }> {
  try {
    const newsResponse = await fetchStockNewsFromAlphaVantage(ticker);
    const aggregatedSentiment = calculateAggregatedSentiment(newsResponse.articles);

    // Check if sentiment changed significantly (more than 0.2 points)
    const significantChange =
      previousSentiment === undefined ||
      Math.abs(aggregatedSentiment.averageSentiment - previousSentiment) > 0.2;

    if (significantChange && newsResponse.articles.length > 0) {
      await sendSentimentNotification(
        {
          ticker,
          sentimentScore: aggregatedSentiment.averageSentiment,
          articleCount: newsResponse.articles.length,
        },
        options
      );
    }

    return {
      success: true,
      newSentiment: aggregatedSentiment.averageSentiment,
      changed: significantChange,
    };
  } catch (error) {
    console.error('[Notification] Error updating sentiment:', error);
    return {
      success: false,
      newSentiment: 0,
      changed: false,
    };
  }
}
