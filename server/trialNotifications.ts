/**
 * Trial Countdown & Email Notifications
 * Manages trial expiration notifications and email reminders
 */

export interface TrialStatus {
  userId: number;
  trialStartDate: Date;
  trialEndDate: Date;
  daysRemaining: number;
  percentageComplete: number;
  status: 'active' | 'expiring_soon' | 'expired';
  notificationsSent: TrialNotification[];
}

export interface TrialNotification {
  id: string;
  userId: number;
  type: 'day_7' | 'day_3' | 'day_1' | 'expired';
  sentAt: Date;
  read: boolean;
}

export interface TrialReminderEmail {
  userId: number;
  email: string;
  daysRemaining: number;
  trialEndDate: Date;
  upgradeUrl: string;
}

/**
 * Calculate trial status for user
 */
export function calculateTrialStatus(trialStartDate: Date | null): TrialStatus | null {
  if (!trialStartDate) return null;

  const trialEndDate = new Date(trialStartDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const now = new Date();
  const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  const totalTrialDays = 7;
  const percentageComplete = Math.max(0, Math.min(100, ((totalTrialDays - daysRemaining) / totalTrialDays) * 100));

  let status: 'active' | 'expiring_soon' | 'expired' = 'active';
  if (daysRemaining <= 0) {
    status = 'expired';
  } else if (daysRemaining <= 3) {
    status = 'expiring_soon';
  }

  return {
    userId: 0, // Will be set by caller
    trialStartDate,
    trialEndDate,
    daysRemaining: Math.max(0, daysRemaining),
    percentageComplete,
    status,
    notificationsSent: [],
  };
}

/**
 * Determine which notifications should be sent
 */
export function getNotificationsToSend(trialStatus: TrialStatus, sentNotifications: TrialNotification[]): string[] {
  const notificationsToSend: string[] = [];
  const sentTypes = new Set(sentNotifications.map((n) => n.type));

  if (trialStatus.daysRemaining === 7 && !sentTypes.has('day_7')) {
    notificationsToSend.push('day_7');
  }
  if (trialStatus.daysRemaining === 3 && !sentTypes.has('day_3')) {
    notificationsToSend.push('day_3');
  }
  if (trialStatus.daysRemaining === 1 && !sentTypes.has('day_1')) {
    notificationsToSend.push('day_1');
  }
  if (trialStatus.daysRemaining <= 0 && !sentTypes.has('expired')) {
    notificationsToSend.push('expired');
  }

  return notificationsToSend;
}

/**
 * Generate trial reminder email
 */
export function generateTrialReminderEmail(reminder: TrialReminderEmail, type: 'day_7' | 'day_3' | 'day_1' | 'expired'): EmailContent {
  const subjectLines: Record<string, string> = {
    day_7: 'Your Stock Predictor trial ends in 7 days',
    day_3: 'Your Stock Predictor trial ends in 3 days',
    day_1: 'Your Stock Predictor trial ends tomorrow',
    expired: 'Your Stock Predictor trial has ended',
  };

  const bodyLines: Record<string, string> = {
    day_7: `You have 7 days left to experience the full power of Stock Predictor. Your trial includes access to all premium features.`,
    day_3: `Your trial ends in just 3 days! Don't miss out on the advanced AI trading signals and portfolio management tools.`,
    day_1: `Your trial ends tomorrow! Upgrade now to continue using Stock Predictor and keep your trading signals active.`,
    expired: `Your trial has ended. Upgrade to a paid plan to continue using Stock Predictor and access all premium features.`,
  };

  return {
    subject: subjectLines[type],
    html: `
<html>
  <body style="font-family: Arial, sans-serif; color: #333;">
    <h2>Trial Status Update</h2>
    <p>${bodyLines[type]}</p>
    
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h3>Your Trial Details</h3>
      <p><strong>Trial Ends:</strong> ${reminder.trialEndDate.toLocaleDateString()} at 11:59 PM</p>
      <p><strong>Days Remaining:</strong> ${Math.max(0, reminder.daysRemaining)}</p>
      <p><strong>Status:</strong> ${reminder.daysRemaining > 0 ? 'Active' : 'Expired'}</p>
    </div>

    <h3>What You'll Get with a Paid Plan</h3>
    <ul>
      <li>✅ Unlimited stock monitoring</li>
      <li>✅ Advanced AI trading signals</li>
      <li>✅ Real-time market analysis</li>
      <li>✅ Portfolio management tools</li>
      <li>✅ Priority support</li>
      <li>✅ Trading 212 broker integration</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${reminder.upgradeUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Upgrade Now
      </a>
    </div>

    <h3>Questions?</h3>
    <p>If you have any questions about your trial or our plans, please reply to this email or visit our help center.</p>

    <hr style="margin-top: 40px;">
    <p style="color: #666; font-size: 12px;">
      © ${new Date().getFullYear()} Stock Predictor. All rights reserved.
    </p>
  </body>
</html>
    `,
    text: `
Trial Status Update

${bodyLines[type]}

Your Trial Details:
- Trial Ends: ${reminder.trialEndDate.toLocaleDateString()} at 11:59 PM
- Days Remaining: ${Math.max(0, reminder.daysRemaining)}
- Status: ${reminder.daysRemaining > 0 ? 'Active' : 'Expired'}

What You'll Get with a Paid Plan:
- Unlimited stock monitoring
- Advanced AI trading signals
- Real-time market analysis
- Portfolio management tools
- Priority support
- Trading 212 broker integration

Upgrade Now: ${reminder.upgradeUrl}

Questions?
If you have any questions about your trial or our plans, please reply to this email or visit our help center.

© ${new Date().getFullYear()} Stock Predictor. All rights reserved.
    `,
  };
}

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

/**
 * Generate trial countdown HTML for UI
 */
export function generateTrialCountdownHTML(trialStatus: TrialStatus): string {
  const progressColor = trialStatus.daysRemaining > 3 ? '#28a745' : trialStatus.daysRemaining > 1 ? '#ffc107' : '#dc3545';

  return `
<div class="trial-countdown" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
    <h3 style="margin: 0; font-size: 18px;">🎯 Your Trial Ends Soon</h3>
    <span style="font-size: 24px; font-weight: bold;">${trialStatus.daysRemaining} days</span>
  </div>
  
  <div style="background: rgba(255, 255, 255, 0.2); border-radius: 5px; overflow: hidden; margin-bottom: 15px;">
    <div style="background: ${progressColor}; width: ${trialStatus.percentageComplete}%; height: 8px; transition: width 0.3s ease;"></div>
  </div>
  
  <p style="margin: 10px 0; font-size: 14px;">
    Trial expires on <strong>${trialStatus.trialEndDate.toLocaleDateString()}</strong>
  </p>
  
  <div style="display: flex; gap: 10px; margin-top: 15px;">
    <a href="/pricing" style="background: white; color: #667eea; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold; flex: 1; text-align: center;">
      Upgrade Now
    </a>
    <button onclick="dismissTrialCountdown()" style="background: rgba(255, 255, 255, 0.2); color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">
      Dismiss
    </button>
  </div>
</div>
  `;
}

/**
 * Generate trial status widget for dashboard
 */
export function generateTrialStatusWidget(trialStatus: TrialStatus): string {
  const statusEmoji = trialStatus.status === 'active' ? '✅' : trialStatus.status === 'expiring_soon' ? '⚠️' : '❌';
  const statusText = trialStatus.status === 'active' ? 'Active' : trialStatus.status === 'expiring_soon' ? 'Expiring Soon' : 'Expired';

  return `
<div class="trial-widget" style="border: 2px solid #667eea; border-radius: 8px; padding: 15px; background: #f8f9ff;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
    <h4 style="margin: 0; color: #333;">Trial Status</h4>
    <span style="font-size: 20px;">${statusEmoji}</span>
  </div>
  
  <p style="margin: 5px 0; color: #666; font-size: 14px;">
    <strong>Status:</strong> ${statusText}
  </p>
  
  <p style="margin: 5px 0; color: #666; font-size: 14px;">
    <strong>Days Remaining:</strong> ${trialStatus.daysRemaining}
  </p>
  
  <p style="margin: 5px 0; color: #666; font-size: 14px;">
    <strong>Expires:</strong> ${trialStatus.trialEndDate.toLocaleDateString()}
  </p>
  
  <div style="margin-top: 10px; text-align: center;">
    <a href="/pricing" style="color: #667eea; text-decoration: none; font-weight: bold; font-size: 14px;">
      View Plans →
    </a>
  </div>
</div>
  `;
}

/**
 * Generate trial expiration report
 */
export function generateTrialExpirationReport(expiredUsers: Array<{ userId: number; expirationDate: Date }>): string {
  const report = `
# Trial Expiration Report

## Summary
- **Total Expired Trials:** ${expiredUsers.length}
- **Report Generated:** ${new Date().toLocaleString()}

## Expired Users
| User ID | Expiration Date | Days Ago |
|---------|-----------------|----------|
${expiredUsers.map((user) => {
  const daysAgo = Math.floor((new Date().getTime() - user.expirationDate.getTime()) / (24 * 60 * 60 * 1000));
  return `| ${user.userId} | ${user.expirationDate.toLocaleDateString()} | ${daysAgo} |`;
}).join('\n')}

## Recommendations
- Send upgrade reminders to users with expired trials
- Offer special promotions to encourage conversion
- Track conversion rate from trial to paid
- Identify common reasons for non-conversion
  `;

  return report;
}
