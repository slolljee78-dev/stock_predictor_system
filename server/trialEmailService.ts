/**
 * Trial Email Notification Service
 * Handles sending trial expiration reminder emails
 */

import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  generateTrialExpiring3DaysEmail,
  generateTrialExpiring1DayEmail,
  generateTrialExpiredEmail,
  generateUpgradeRecommendationEmail
} from "./emailTemplates";
import { notifyOwner } from "./_core/notification";

interface EmailNotificationLog {
  userId: string;
  emailType: 'trial_3days' | 'trial_1day' | 'trial_expired' | 'upgrade_recommendation';
  sentAt: Date;
  status: 'sent' | 'failed';
  error?: string;
}

// In-memory log for tracking sent emails (in production, use database)
const emailLog: EmailNotificationLog[] = [];

/**
 * Send trial expiration emails
 * Should be run daily via background job
 */
export async function sendTrialExpirationEmails(): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn('[Trial Email Service] Database not available');
      return;
    }

    const now = new Date();
    
    // Get all users with active trials
    const usersWithTrials = await db
      .select()
      .from(users)
      .where(eq(users.subscriptionTier, 'TRIAL'));

    for (const user of usersWithTrials) {
      // Skip if trial already expired or no expiration date
      if (!user.trialExpiresAt || user.trialExpiresAt < now) continue;

      const daysUntilExpiration = Math.ceil(
        (user.trialExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Only process upcoming expirations (next 30 days)
      if (daysUntilExpiration > 30) continue;

      // 3 days before expiration
      if (daysUntilExpiration === 3) {
        await sendTrialExpiring3DaysEmail(user);
      }

      // 1 day before expiration
      if (daysUntilExpiration === 1) {
        await sendTrialExpiring1DayEmail(user);
      }

      // Trial expired
      if (daysUntilExpiration <= 0) {
        await sendTrialExpiredEmail(user);
      }
    }

    console.log(`[Trial Email Service] Processed ${usersWithTrials.length} users with trials`);
  } catch (error) {
    console.error('[Trial Email Service] Error sending trial emails:', error);
    await notifyOwner({
      title: 'Trial Email Service Error',
      content: `Failed to send trial expiration emails: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}

/**
 * Send trial expiration reminder (3 days before)
 */
async function sendTrialExpiring3DaysEmail(user: any): Promise<void> {
  try {
    // Check if already sent
    if (hasEmailBeenSent(user.id, 'trial_3days')) {
      return;
    }

    if (!user.trialExpiresAt || !user.email) return;

    const upgradeUrl = `${process.env.VITE_OAUTH_PORTAL_URL || 'https://manuspredictor-knj3qkdj.manus.space'}/pricing`;
    const emailTemplate = generateTrialExpiring3DaysEmail(
      user.name || 'Trader',
      user.trialExpiresAt,
      upgradeUrl
    );

    // Send email via Manus built-in API
    await sendEmailViaAPI(user.email, emailTemplate);

    logEmailSent(user.id, 'trial_3days', 'sent');
    console.log(`[Trial Email] Sent 3-day reminder to ${user.email}`);
  } catch (error) {
    logEmailSent(user.id, 'trial_3days', 'failed', error);
    console.error(`[Trial Email] Failed to send 3-day reminder to ${user.email}:`, error);
  }
}

/**
 * Send trial expiration reminder (1 day before)
 */
async function sendTrialExpiring1DayEmail(user: any): Promise<void> {
  try {
    // Check if already sent
    if (hasEmailBeenSent(user.id, 'trial_1day')) {
      return;
    }

    if (!user.trialExpiresAt || !user.email) return;

    const upgradeUrl = `${process.env.VITE_OAUTH_PORTAL_URL || 'https://manuspredictor-knj3qkdj.manus.space'}/pricing`;
    const emailTemplate = generateTrialExpiring1DayEmail(
      user.name || 'Trader',
      user.trialExpiresAt,
      upgradeUrl
    );

    // Send email via Manus built-in API
    await sendEmailViaAPI(user.email, emailTemplate);

    logEmailSent(user.id, 'trial_1day', 'sent');
    console.log(`[Trial Email] Sent 1-day reminder to ${user.email}`);
  } catch (error) {
    logEmailSent(user.id, 'trial_1day', 'failed', error);
    console.error(`[Trial Email] Failed to send 1-day reminder to ${user.email}:`, error);
  }
}

/**
 * Send trial expired email
 */
async function sendTrialExpiredEmail(user: any): Promise<void> {
  try {
    // Check if already sent
    if (hasEmailBeenSent(user.id, 'trial_expired')) {
      return;
    }

    if (!user.email) return;

    const upgradeUrl = `${process.env.VITE_OAUTH_PORTAL_URL || 'https://manuspredictor-knj3qkdj.manus.space'}/pricing`;
    const emailTemplate = generateTrialExpiredEmail(
      user.name || 'Trader',
      upgradeUrl
    );

    // Send email via Manus built-in API
    await sendEmailViaAPI(user.email, emailTemplate);

    logEmailSent(user.id, 'trial_expired', 'sent');
    console.log(`[Trial Email] Sent trial expired email to ${user.email}`);
  } catch (error) {
    logEmailSent(user.id, 'trial_expired', 'failed', error);
    console.error(`[Trial Email] Failed to send trial expired email to ${user.email}:`, error);
  }
}

/**
 * Send upgrade recommendation email based on user activity
 */
export async function sendUpgradeRecommendationEmail(
  userId: string | number,
  tradeCount: number,
  winRate: number
): Promise<void> {
  try {
    // Check if already sent
    if (hasEmailBeenSent(String(userId), 'upgrade_recommendation')) {
      return;
    }

    const db = await getDb();
    if (!db) {
      console.warn('[Trial Email Service] Database not available');
      return;
    }

    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.id, typeof userId === 'string' ? parseInt(userId) : userId));
    
    const user = userRows[0];

    if (!user || !user.email) return;

    const upgradeUrl = `${process.env.VITE_OAUTH_PORTAL_URL || 'https://manuspredictor-knj3qkdj.manus.space'}/pricing`;
    const emailTemplate = generateUpgradeRecommendationEmail(
      user.name || 'Trader',
      tradeCount,
      winRate,
      upgradeUrl
    );

    // Send email via Manus built-in API
    await sendEmailViaAPI(user.email, emailTemplate);

    logEmailSent(userId, 'upgrade_recommendation', 'sent');
    console.log(`[Trial Email] Sent upgrade recommendation to ${user.email}`);
  } catch (error) {
    logEmailSent(userId, 'upgrade_recommendation', 'failed', error);
    console.error(`[Trial Email] Failed to send upgrade recommendation:`, error);
  }
}

/**
 * Send email via Manus built-in email API
 */
async function sendEmailViaAPI(
  to: string,
  emailTemplate: { subject: string; html: string; text: string }
): Promise<void> {
  const apiUrl = process.env.BUILT_IN_FORGE_API_URL || 'https://api.manus.im';
  const apiKey = process.env.BUILT_IN_FORGE_API_KEY;

  if (!apiKey) {
    throw new Error('BUILT_IN_FORGE_API_KEY not configured');
  }

  const response = await fetch(`${apiUrl}/email/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      to,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      from: 'noreply@vortextrade.com'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Email API error: ${response.status} - ${error}`);
  }
}

/**
 * Check if email has already been sent to user
 */
function hasEmailBeenSent(
  userId: string,
  emailType: EmailNotificationLog['emailType']
): boolean {
  return emailLog.some(
    log => log.userId === userId && log.emailType === emailType && log.status === 'sent'
  );
}

/**
 * Log email sent status
 */
function logEmailSent(
  userId: string | number,
  emailType: EmailNotificationLog['emailType'],
  status: 'sent' | 'failed',
  error?: unknown
): void {
  emailLog.push({
    userId: String(userId),
    emailType,
    sentAt: new Date(),
    status,
    error: error instanceof Error ? error.message : undefined
  });

  // Keep only last 1000 entries
  if (emailLog.length > 1000) {
    emailLog.splice(0, emailLog.length - 1000);
  }
}

/**
 * Get email notification history
 */
export function getEmailNotificationHistory(userId?: string): EmailNotificationLog[] {
  if (userId) {
    return emailLog.filter(log => log.userId === userId);
  }
  return emailLog;
}

/**
 * Clear email notification log (for testing)
 */
export function clearEmailNotificationLog(): void {
  emailLog.length = 0;
}
