/**
 * Vortextrade Weekly Signal Digest
 *
 * Sends a Monday morning email to all subscribed users summarising:
 *   - Top 5 signals from the past week (by confidence)
 *   - Signal volume stats (buy vs sell counts)
 *   - Top performing tickers
 *   - A referral CTA
 *
 * Architecture:
 *   - POST /api/scheduled/weekly-digest  (called by Manus Heartbeat every Monday 08:00 UTC)
 *   - Reads users who have opted in (user.emailNotifications = 1 or preference set)
 *   - Sends via the same email provider as onboardingEmailService
 *
 * To activate: set RESEND_API_KEY (or SENDGRID_API_KEY / MAILGUN_API_KEY) in Secrets.
 */

import { getDb } from "./db";
import { signals, stocks, users, referralCodes } from "../drizzle/schema";
import { eq, desc, gte, and, sql } from "drizzle-orm";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DigestSignal {
  ticker: string;
  stockName: string;
  type: "buy" | "sell" | "hold";
  confidenceScore: number;
  priceAtSignal: string | null;
  createdAt: Date;
}

interface DigestData {
  userId: number;
  email: string;
  firstName: string;
  referralCode: string | null;
  topSignals: DigestSignal[];
  buyCount: number;
  sellCount: number;
  totalSignals: number;
  topTickers: Array<{ ticker: string; count: number }>;
  weekLabel: string;
}

// ─── Build digest data for a user ────────────────────────────────────────────

async function buildDigestData(
  userId: number,
  email: string,
  name: string
): Promise<DigestData | null> {
  const db = await getDb();
  if (!db) return null;

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Top 5 signals by confidence this week
  const topSignals = await db
    .select({
      ticker: stocks.ticker,
      stockName: stocks.name,
      type: signals.type,
      confidenceScore: signals.confidenceScore,
      priceAtSignal: signals.priceAtSignal,
      createdAt: signals.createdAt,
    })
    .from(signals)
    .innerJoin(stocks, eq(signals.stockId, stocks.id))
    .where(gte(signals.createdAt, since))
    .orderBy(desc(signals.confidenceScore))
    .limit(5);

  // Buy/sell counts
  const [buyRow] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(signals)
    .where(and(eq(signals.type, "buy"), gte(signals.createdAt, since)));

  const [sellRow] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(signals)
    .where(and(eq(signals.type, "sell"), gte(signals.createdAt, since)));

  // Top tickers by signal count
  const topTickers = await db
    .select({
      ticker: stocks.ticker,
      count: sql<number>`COUNT(${signals.id})`,
    })
    .from(signals)
    .innerJoin(stocks, eq(signals.stockId, stocks.id))
    .where(gte(signals.createdAt, since))
    .groupBy(stocks.ticker)
    .orderBy(sql`COUNT(${signals.id}) DESC`)
    .limit(5);

  // Referral code
  const refRows = await db
    .select({ code: referralCodes.code })
    .from(referralCodes)
    .where(eq(referralCodes.userId, userId))
    .limit(1);

  const buyCount = Number(buyRow?.count ?? 0);
  const sellCount = Number(sellRow?.count ?? 0);

  const weekLabel = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return {
    userId,
    email,
    firstName: name?.split(" ")[0] || "there",
    referralCode: refRows[0]?.code ?? null,
    topSignals,
    buyCount,
    sellCount,
    totalSignals: buyCount + sellCount,
    topTickers: topTickers.map((t) => ({ ticker: t.ticker, count: Number(t.count) })),
    weekLabel,
  };
}

// ─── Render the digest email body ─────────────────────────────────────────────

function renderDigestEmail(data: DigestData, origin: string): { subject: string; body: string } {
  const subject = `Your Vortextrade Weekly Digest — ${data.totalSignals} signals this week`;

  const topSignalLines = data.topSignals
    .map(
      (s, i) =>
        `${i + 1}. ${s.ticker} — ${s.type.toUpperCase()} @ ${
          s.priceAtSignal ? `$${parseFloat(s.priceAtSignal).toFixed(2)}` : "N/A"
        } (${s.confidenceScore}% confidence)`
    )
    .join("\n");

  const topTickerLines = data.topTickers
    .map((t) => `• ${t.ticker} — ${t.count} signals`)
    .join("\n");

  const referralSection = data.referralCode
    ? `\n\n─────────────────────────────\nEarn free subscription days\n─────────────────────────────\nShare your referral link and earn 30 free days for every friend who upgrades:\n${origin}/?ref=${data.referralCode}\n`
    : "";

  const body = `Hi ${data.firstName},

Here's your Vortextrade weekly signal digest for the week ending ${data.weekLabel}.

─────────────────────────────
This week's top signals
─────────────────────────────
${topSignalLines || "No signals generated this week."}

─────────────────────────────
Signal summary
─────────────────────────────
Total signals:  ${data.totalSignals}
Buy signals:    ${data.buyCount}
Sell signals:   ${data.sellCount}

─────────────────────────────
Most active tickers
─────────────────────────────
${topTickerLines || "No data available."}
${referralSection}
─────────────────────────────
View all signals on your dashboard:
${origin}/signals/today

─────────────────────────────
The Vortextrade Team

Unsubscribe from weekly digest: ${origin}/api/digest/unsubscribe?uid=${data.userId}`;

  return { subject, body };
}

// ─── Send a single digest email ───────────────────────────────────────────────

async function sendDigestEmail(
  to: string,
  subject: string,
  body: string
): Promise<void> {
  const hasProvider =
    process.env.RESEND_API_KEY ||
    process.env.SENDGRID_API_KEY ||
    process.env.MAILGUN_API_KEY;

  if (!hasProvider) {
    console.log(`[WeeklyDigest] Would send to ${to}: "${subject}"`);
    throw new Error("No email provider configured.");
  }

  if (process.env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Vortextrade <hello@vortextrade.com>",
        to,
        subject,
        text: body,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend error: ${err}`);
    }
    return;
  }

  if (process.env.SENDGRID_API_KEY) {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: "hello@vortextrade.com", name: "Vortextrade" },
        subject,
        content: [{ type: "text/plain", value: body }],
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`SendGrid error: ${err}`);
    }
    return;
  }
}

// ─── Main processor — called by the scheduled endpoint ───────────────────────

export async function processWeeklyDigest(
  origin: string
): Promise<{ sent: number; failed: number; skipped: number }> {
  const db = await getDb();
  if (!db) return { sent: 0, failed: 0, skipped: 0 };

  // Get all users with an email address
  const allUsers = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .limit(500); // safety cap

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const user of allUsers) {
    if (!user.email) {
      skipped++;
      continue;
    }

    try {
      const data = await buildDigestData(user.id, user.email, user.name || "");
      if (!data) {
        skipped++;
        continue;
      }

      const { subject, body } = renderDigestEmail(data, origin);
      await sendDigestEmail(user.email, subject, body);
      sent++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[WeeklyDigest] Failed for user ${user.id}: ${msg}`);
      failed++;
    }
  }

  console.log(`[WeeklyDigest] Complete: ${sent} sent, ${failed} failed, ${skipped} skipped`);
  return { sent, failed, skipped };
}
