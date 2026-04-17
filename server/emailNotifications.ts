/**
 * Email Notifications Service
 * Sends email notifications for trading alerts and sentiment updates
 */

import { ENV } from './_core/env';

export interface EmailNotification {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
}

/**
 * Send email via Manus built-in API
 */
export async function sendEmail(notification: EmailNotification): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      console.warn('[Email] Manus API not configured');
      return { success: false, error: 'Manus API not configured' };
    }

    const response = await fetch(`${ENV.forgeApiUrl}/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ENV.forgeApiKey}`,
      },
      body: JSON.stringify({
        to: notification.to,
        subject: notification.subject,
        html: notification.htmlContent,
        text: notification.textContent,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Email] Send failed:', error);
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.messageId || data.id,
    };
  } catch (error) {
    console.error('[Email] Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create buy signal email
 */
export function createBuySignalEmail(
  userEmail: string,
  ticker: string,
  confidence: number,
  price: number,
  technicalIndicators?: Record<string, any>
): EmailNotification {
  const priceFormatted = (price / 100).toFixed(2);
  const indicators = technicalIndicators ? JSON.stringify(technicalIndicators, null, 2) : 'N/A';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">🟢 BUY Signal Alert</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">High-confidence trading opportunity</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
        <table style="width: 100%; margin-bottom: 20px;">
          <tr>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0; font-weight: bold;">Stock Ticker</td>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0;">${ticker}</td>
          </tr>
          <tr>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0; font-weight: bold;">Signal Confidence</td>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0;">${confidence}%</td>
          </tr>
          <tr>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0; font-weight: bold;">Current Price</td>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0;">$${priceFormatted}</td>
          </tr>
          <tr>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0; font-weight: bold;">Time</td>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0;">${new Date().toLocaleString()}</td>
          </tr>
        </table>

        <div style="background: white; padding: 15px; border: 1px solid #e0e0e0; border-radius: 4px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0;">Technical Indicators</h3>
          <pre style="margin: 0; font-size: 12px; overflow-x: auto;">${indicators}</pre>
        </div>

        <div style="background: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; border-radius: 4px; margin-bottom: 20px;">
          <p style="margin: 0; color: #2e7d32;"><strong>Recommendation:</strong> Consider this high-confidence buy signal. Review the technical indicators and market conditions before executing.</p>
        </div>

        <div style="text-align: center;">
          <a href="https://stock-predictor.manus.space/dashboard" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Dashboard</a>
        </div>

        <p style="margin-top: 20px; font-size: 12px; color: #666; text-align: center;">
          This is an automated alert from Stock Predictor. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  const textContent = `
BUY Signal Alert for ${ticker}

Signal Confidence: ${confidence}%
Current Price: $${priceFormatted}
Time: ${new Date().toLocaleString()}

Technical Indicators:
${indicators}

Recommendation: Consider this high-confidence buy signal. Review the technical indicators and market conditions before executing.

View Dashboard: https://stock-predictor.manus.space/dashboard

This is an automated alert from Stock Predictor.
  `;

  return {
    to: userEmail,
    subject: `🟢 BUY Signal Alert: ${ticker} (${confidence}% confidence)`,
    htmlContent,
    textContent,
  };
}

/**
 * Create sell signal email
 */
export function createSellSignalEmail(
  userEmail: string,
  ticker: string,
  confidence: number,
  price: number,
  technicalIndicators?: Record<string, any>
): EmailNotification {
  const priceFormatted = (price / 100).toFixed(2);
  const indicators = technicalIndicators ? JSON.stringify(technicalIndicators, null, 2) : 'N/A';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">🔴 SELL Signal Alert</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">High-confidence exit opportunity</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
        <table style="width: 100%; margin-bottom: 20px;">
          <tr>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0; font-weight: bold;">Stock Ticker</td>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0;">${ticker}</td>
          </tr>
          <tr>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0; font-weight: bold;">Signal Confidence</td>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0;">${confidence}%</td>
          </tr>
          <tr>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0; font-weight: bold;">Current Price</td>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0;">$${priceFormatted}</td>
          </tr>
          <tr>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0; font-weight: bold;">Time</td>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0;">${new Date().toLocaleString()}</td>
          </tr>
        </table>

        <div style="background: white; padding: 15px; border: 1px solid #e0e0e0; border-radius: 4px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0;">Technical Indicators</h3>
          <pre style="margin: 0; font-size: 12px; overflow-x: auto;">${indicators}</pre>
        </div>

        <div style="background: #ffebee; padding: 15px; border-left: 4px solid #f44336; border-radius: 4px; margin-bottom: 20px;">
          <p style="margin: 0; color: #c62828;"><strong>Recommendation:</strong> Consider this high-confidence sell signal. Review the technical indicators and market conditions before executing.</p>
        </div>

        <div style="text-align: center;">
          <a href="https://stock-predictor.manus.space/dashboard" style="display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Dashboard</a>
        </div>

        <p style="margin-top: 20px; font-size: 12px; color: #666; text-align: center;">
          This is an automated alert from Stock Predictor. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  const textContent = `
SELL Signal Alert for ${ticker}

Signal Confidence: ${confidence}%
Current Price: $${priceFormatted}
Time: ${new Date().toLocaleString()}

Technical Indicators:
${indicators}

Recommendation: Consider this high-confidence sell signal. Review the technical indicators and market conditions before executing.

View Dashboard: https://stock-predictor.manus.space/dashboard

This is an automated alert from Stock Predictor.
  `;

  return {
    to: userEmail,
    subject: `🔴 SELL Signal Alert: ${ticker} (${confidence}% confidence)`,
    htmlContent,
    textContent,
  };
}

/**
 * Create sentiment update email
 */
export function createSentimentUpdateEmail(
  userEmail: string,
  ticker: string,
  sentimentScore: number,
  classification: string,
  articleCount: number
): EmailNotification {
  const percentage = Math.round((sentimentScore + 1) / 2 * 100);
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

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">${emoji} Sentiment Update: ${ticker}</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Market sentiment analysis</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
        <table style="width: 100%; margin-bottom: 20px;">
          <tr>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0; font-weight: bold;">Stock Ticker</td>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0;">${ticker}</td>
          </tr>
          <tr>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0; font-weight: bold;">Sentiment Classification</td>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0;">${emoji} ${classification.replace('_', ' ')}</td>
          </tr>
          <tr>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0; font-weight: bold;">Sentiment Score</td>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0;">${percentage}% (${sentimentScore.toFixed(2)})</td>
          </tr>
          <tr>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0; font-weight: bold;">Articles Analyzed</td>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0;">${articleCount}</td>
          </tr>
        </table>

        <div style="text-align: center;">
          <a href="https://stock-predictor.manus.space/dashboard" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Sentiment Analysis</a>
        </div>

        <p style="margin-top: 20px; font-size: 12px; color: #666; text-align: center;">
          This is an automated alert from Stock Predictor. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  const textContent = `
Sentiment Update for ${ticker}

Sentiment Classification: ${emoji} ${classification.replace('_', ' ')}
Sentiment Score: ${percentage}% (${sentimentScore.toFixed(2)})
Articles Analyzed: ${articleCount}

View Sentiment Analysis: https://stock-predictor.manus.space/dashboard

This is an automated alert from Stock Predictor.
  `;

  return {
    to: userEmail,
    subject: `${emoji} Sentiment Update: ${ticker} - ${classification.replace('_', ' ')}`,
    htmlContent,
    textContent,
  };
}
