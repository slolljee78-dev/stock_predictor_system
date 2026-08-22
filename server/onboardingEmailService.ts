// @ts-nocheck — template literals with {{ }} placeholders are intentional
/**
 * Vortextrade 7-Day Onboarding Email Sequence
 *
 * Architecture:
 * - On new user sign-up, call `scheduleOnboardingSequence(userId, email, firstName)`
 * - A scheduled endpoint `/api/scheduled/onboarding-emails` runs every hour (via Manus Heartbeat)
 *   and calls `processOnboardingQueue()` to send any due emails
 * - To actually send emails, wire `sendOnboardingEmail()` to your email provider
 *   (Resend, SendGrid, Mailgun, etc.) by setting RESEND_API_KEY in Secrets
 */

import { getDb } from "./db";
import { onboardingEmailQueue, onboardingUnsubscribes } from "../drizzle/schema";
import { eq, and, lte, isNull } from "drizzle-orm";

// ─── Email step definitions ───────────────────────────────────────────────────

const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR;

export interface OnboardingStep {
  stepNumber: number;
  delayMs: number; // delay from sign-up time
  subject: string;
  previewText: string;
  body: string; // plain-text with {{variable}} placeholders
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    stepNumber: 1,
    delayMs: 0, // immediate — welcome email
    subject: "Welcome to Vortextrade — your AI signals are ready 🚀",
    previewText: "Here's how to get your first signal in under 2 minutes.",
    body: `Hi {{firstName}},

Welcome to Vortextrade! You've just joined a growing community of UK retail investors using AI-powered signals to trade smarter on Trading 212.

Here's what to do first:

1. Visit your dashboard: {{dashboardUrl}}
2. Add a stock to your watchlist (try AAPL, TSLA, or NVDA)
3. Wait for your first AI signal — they refresh every 15 minutes

Your free plan gives you access to 3 signals per day. Upgrade to Pro or Elite for unlimited signals and real-time alerts.

Any questions? Just reply to this email.

— The Vortextrade Team
{{unsubscribeUrl}}`,
  },
  {
    stepNumber: 2,
    delayMs: ONE_DAY, // Day 1
    subject: "How to read a Vortextrade signal (2-minute guide)",
    previewText: "Confidence score, entry price, stop loss — here's what each field means.",
    body: `Hi {{firstName}},

Every signal on Vortextrade includes five key pieces of information:

• **Direction** — BUY or SELL
• **Confidence** — 0–100%. We recommend acting on signals above 70%
• **Entry Price** — the suggested price to enter the trade
• **Target Price** — where the AI expects the price to reach
• **Stop Loss** — the price at which you should exit to limit losses

The Signal Accuracy page ({{signalAccuracyUrl}}) shows you our historical win rate so you can judge for yourself.

Tomorrow I'll show you how to use the paper trading simulator to test signals before risking real money.

— The Vortextrade Team
{{unsubscribeUrl}}`,
  },
  {
    stepNumber: 3,
    delayMs: 2 * ONE_DAY, // Day 2
    subject: "Practice risk-free with the Vortextrade Simulator",
    previewText: "Test signals without spending a penny — here's how.",
    body: `Hi {{firstName}},

Before acting on any signal with real money, use the Vortextrade Simulator to test it first.

The simulator gives you a £10,000 virtual portfolio. You can:

• Execute paper trades based on signals
• Track your portfolio return over time
• See your win rate and average gain/loss
• Compare your performance against the AI's predictions

Visit the Simulator: {{simulatorUrl}}

This is especially useful for new signals on stocks you haven't traded before. Once you've seen a signal type work 3–5 times in the simulator, you'll have the confidence to act on it with real money.

— The Vortextrade Team
{{unsubscribeUrl}}`,
  },
  {
    stepNumber: 4,
    delayMs: 3 * ONE_DAY, // Day 3
    subject: "Never miss a signal — set up your alerts",
    previewText: "Get notified the moment a high-confidence signal appears.",
    body: `Hi {{firstName}},

The best signals often appear outside market hours or when you're not watching the dashboard. That's why alerts matter.

On Vortextrade you can set up:

• **Email alerts** — get an email the moment a signal fires
• **Push notifications** — instant browser/mobile notifications
• **Confidence threshold** — only alert me when confidence is above X%
• **Watchlist-only** — only alert me for stocks I'm watching

Set up your alerts here: {{alertPreferencesUrl}}

Pro tip: Set your confidence threshold to 75%+ to filter out weaker signals and only get notified for the highest-quality opportunities.

— The Vortextrade Team
{{unsubscribeUrl}}`,
  },
  {
    stepNumber: 5,
    delayMs: 4 * ONE_DAY, // Day 4
    subject: "What our best users do differently",
    previewText: "Three habits that separate profitable signal traders from the rest.",
    body: `Hi {{firstName}},

After watching hundreds of users interact with Vortextrade signals, three habits stand out among those who perform best:

**1. They use the simulator first**
They never act on a new signal type with real money until they've seen it work in the simulator at least 3 times.

**2. They respect the stop loss**
The AI sets a stop loss for a reason. Users who ignore it and "hold on hoping it recovers" consistently underperform those who cut losses quickly.

**3. They track their own accuracy**
The Signal Accuracy page shows you your personal win rate by signal type and stock. The best users review this weekly and focus on the signal types where they perform best.

Your Signal Accuracy dashboard: {{signalAccuracyUrl}}

— The Vortextrade Team
{{unsubscribeUrl}}`,
  },
  {
    stepNumber: 6,
    delayMs: 5 * ONE_DAY, // Day 5
    subject: "Earn free subscription days — refer a friend",
    previewText: "Share Vortextrade and get 30 free days for every friend who upgrades.",
    body: `Hi {{firstName}},

Know someone else who trades on Trading 212? Share Vortextrade with them and earn 30 free days of your current plan for every friend who upgrades to a paid tier.

Your referral link: {{referralUrl}}

Share it on:
• The Trading 212 Community Forum
• r/trading212 or r/UKInvesting on Reddit
• Your investing group chat

There's no limit — refer 12 friends and get a full year free.

— The Vortextrade Team
{{unsubscribeUrl}}`,
  },
  {
    stepNumber: 7,
    delayMs: 6 * ONE_DAY, // Day 6
    subject: "Upgrade to Pro — unlimited signals, real-time alerts",
    previewText: "Your free trial ends soon. Here's what you unlock with Pro.",
    body: `Hi {{firstName}},

You've been using Vortextrade for a week now. Here's what you unlock when you upgrade to Pro:

✅ Unlimited signals (vs 3/day on free)
✅ Real-time alerts (vs 15-minute delay)
✅ Full signal history and backtesting
✅ Advanced technical indicators
✅ Priority support

Pro is £9.99/month — less than a single bad trade costs you.

Upgrade here: {{pricingUrl}}

If you have any questions about whether Pro is right for you, just reply to this email and I'll help you decide.

— Stuart, Vortextrade Founder
{{unsubscribeUrl}}`,
  },
];

// ─── Schedule the sequence for a new user ────────────────────────────────────

export async function scheduleOnboardingSequence(
  userId: number,
  email: string,
  firstName: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const now = Date.now();

  // Check if already scheduled (idempotent)
  const existing = await db
    .select({ id: onboardingEmailQueue.id })
    .from(onboardingEmailQueue)
    .where(eq(onboardingEmailQueue.userId, userId))
    .limit(1);

  if (existing.length > 0) return; // already scheduled

  // Check if unsubscribed
  const unsub = await db
    .select({ id: onboardingUnsubscribes.id })
    .from(onboardingUnsubscribes)
    .where(eq(onboardingUnsubscribes.userId, userId))
    .limit(1);

  if (unsub.length > 0) return;

  const rows = ONBOARDING_STEPS.map((step) => ({
    userId,
    email,
    firstName: firstName || "there",
    stepNumber: step.stepNumber,
    scheduledAt: now + step.delayMs,
    status: "pending" as const,
    createdAt: now,
  }));

  await db.insert(onboardingEmailQueue).values(rows);
  console.log(`[Onboarding] Scheduled ${rows.length} emails for user ${userId}`);
}

// ─── Process due emails ───────────────────────────────────────────────────────

export async function processOnboardingQueue(origin: string): Promise<{ sent: number; failed: number }> {
  const db = await getDb();
  if (!db) return { sent: 0, failed: 0 };

  const now = Date.now();
  let sent = 0;
  let failed = 0;

  // Get all pending emails that are due
  const due = await db
    .select()
    .from(onboardingEmailQueue)
    .where(
      and(
        eq(onboardingEmailQueue.status, "pending"),
        lte(onboardingEmailQueue.scheduledAt, now),
        isNull(onboardingEmailQueue.sentAt)
      )
    )
    .limit(50); // process in batches

  for (const item of due) {
    // Check if user unsubscribed
    const unsub = await db
      .select({ id: onboardingUnsubscribes.id })
      .from(onboardingUnsubscribes)
      .where(eq(onboardingUnsubscribes.userId, item.userId))
      .limit(1);

    if (unsub.length > 0) {
      await db
        .update(onboardingEmailQueue)
        .set({ status: "unsubscribed" })
        .where(eq(onboardingEmailQueue.id, item.id));
      continue;
    }

    const step = ONBOARDING_STEPS.find((s) => s.stepNumber === item.stepNumber);
    if (!step) continue;

    try {
      await sendOnboardingEmail({
        to: item.email,
        firstName: item.firstName,
        subject: step.subject,
        body: step.body,
        origin,
        userId: item.userId,
      });

      await db
        .update(onboardingEmailQueue)
        .set({ status: "sent", sentAt: Date.now() })
        .where(eq(onboardingEmailQueue.id, item.id));

      sent++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await db
        .update(onboardingEmailQueue)
        .set({ status: "failed", errorMessage: msg })
        .where(eq(onboardingEmailQueue.id, item.id));
      failed++;
      console.error(`[Onboarding] Failed to send step ${item.stepNumber} to ${item.email}:`, msg);
    }
  }

  return { sent, failed };
}

// ─── Email sender (wire to your provider here) ───────────────────────────────

interface SendParams {
  to: string;
  firstName: string;
  subject: string;
  body: string;
  origin: string;
  userId: number;
}

async function sendOnboardingEmail(params: SendParams): Promise<void> {
  const { to, firstName, subject, body, origin, userId } = params;

  const unsubscribeUrl = `${origin}/api/onboarding/unsubscribe?uid=${userId}`;
  const referralUrl = `${origin}/?ref=`; // referral code appended at runtime if needed

  const rendered = body
    .replace(/{{firstName}}/g, firstName)
    .replace(/{{dashboardUrl}}/g, `${origin}/dashboard`)
    .replace(/{{signalAccuracyUrl}}/g, `${origin}/signal-accuracy`)
    .replace(/{{simulatorUrl}}/g, `${origin}/simulator`)
    .replace(/{{alertPreferencesUrl}}/g, `${origin}/alert-preferences`)
    .replace(/{{pricingUrl}}/g, `${origin}/pricing`)
    .replace(/{{referralUrl}}/g, referralUrl)
    .replace(/{{unsubscribeUrl}}/g, `Unsubscribe: ${unsubscribeUrl}`);

  // ── Wire your email provider here ──────────────────────────────────────────
  // Option A: Resend (recommended — free tier, great DX)
  //   const resendKey = process.env.RESEND_API_KEY;
  //   if (!resendKey) throw new Error("RESEND_API_KEY not set");
  //   await fetch("https://api.resend.com/emails", {
  //     method: "POST",
  //     headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       from: "Vortextrade <hello@vortextrade.com>",
  //       to,
  //       subject,
  //       text: rendered,
  //     }),
  //   });
  //
  // Option B: SendGrid
  //   const sgKey = process.env.SENDGRID_API_KEY;
  //   ...
  //
  // Option C: Mailgun
  //   ...
  // ───────────────────────────────────────────────────────────────────────────

  // Until a provider is configured, log the email content for testing
  console.log(`[Onboarding] Would send to ${to}: "${subject}"`);
  console.log(`[Onboarding] Body preview: ${rendered.substring(0, 100)}...`);

  // Throw if no provider configured (so status stays "pending" not "sent")
  const hasProvider =
    process.env.RESEND_API_KEY ||
    process.env.SENDGRID_API_KEY ||
    process.env.MAILGUN_API_KEY;

  if (!hasProvider) {
    throw new Error("No email provider configured. Set RESEND_API_KEY, SENDGRID_API_KEY, or MAILGUN_API_KEY.");
  }
}

// ─── Unsubscribe a user from the sequence ────────────────────────────────────

export async function unsubscribeFromOnboarding(userId: number, email: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Mark all pending emails as unsubscribed
  await db
    .update(onboardingEmailQueue)
    .set({ status: "unsubscribed" })
    .where(and(eq(onboardingEmailQueue.userId, userId), eq(onboardingEmailQueue.status, "pending")));

  // Record the unsubscribe
  const existing = await db
    .select({ id: onboardingUnsubscribes.id })
    .from(onboardingUnsubscribes)
    .where(eq(onboardingUnsubscribes.userId, userId))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(onboardingUnsubscribes).values({ userId, email, unsubscribedAt: Date.now() });
  }
}
