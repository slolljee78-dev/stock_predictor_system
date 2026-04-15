import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  stocks,
  priceHistory,
  watchlistGroups,
  watchlists,
  signals,
  notifications,
  userPreferences,
  payments,
  invoices,
  brokerAccounts,
  portfolioTemplates,
  notificationPreferences,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const lastSignedIn = user.lastSignedIn || new Date();
    const role = user.role || (user.openId === ENV.ownerOpenId ? 'admin' : 'user');

    console.log("[Database] Upserting user:", { openId: user.openId, name: user.name, email: user.email });
    
    // Insert with only core columns to avoid schema mismatch
    const result = await db.insert(users).values({
      openId: user.openId,
      name: user.name ?? null,
      email: user.email ?? null,
      loginMethod: user.loginMethod ?? null,
      role: role as 'user' | 'admin',
      lastSignedIn: lastSignedIn,
    }).onDuplicateKeyUpdate({
      set: {
        name: user.name ?? null,
        email: user.email ?? null,
        loginMethod: user.loginMethod ?? null,
        role: role as 'user' | 'admin',
        lastSignedIn: lastSignedIn,
      },
    });
    
    console.log("[Database] User upserted successfully");
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error("[Database] Error stack:", error.stack);
    }
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get all stocks or filter by ticker/type
 */
export async function getAllStocks(filter?: { type?: 'equity' | 'etf'; exchange?: string }) {
  const db = await getDb();
  if (!db) return [];

  let query: any = db.select().from(stocks);

  if (filter?.type) {
    query = query.where(eq(stocks.type, filter.type));
  }
  if (filter?.exchange) {
    query = query.where(eq(stocks.exchange, filter.exchange));
  }

  return query.limit(1000);
}

/**
 * Search stocks by ticker or name
 */
export async function searchStocks(searchTerm: string) {
  const db = await getDb();
  if (!db) return [];

  const term = `%${searchTerm.toUpperCase()}%`;
  return db
    .select()
    .from(stocks)
    .where(
      sql`UPPER(${stocks.ticker}) LIKE ${term} OR UPPER(${stocks.name}) LIKE ${term}`
    )
    .limit(20);
}

/**
 * Get stock by ticker
 */
export async function getStockByTicker(ticker: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(stocks)
    .where(eq(stocks.ticker, ticker.toUpperCase()))
    .limit(1);

  return result[0];
}

/**
 * Get user's watchlist with stock details
 */
export async function getUserWatchlist(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: watchlists.id,
      stockId: watchlists.stockId,
      ticker: stocks.ticker,
      name: stocks.name,
      label: watchlists.label,
      alertOnBuy: watchlists.alertOnBuy,
      alertOnSell: watchlists.alertOnSell,
      minConfidenceThreshold: watchlists.minConfidenceThreshold,
      emailNotifications: watchlists.emailNotifications,
      inAppNotifications: watchlists.inAppNotifications,
      createdAt: watchlists.createdAt,
    })
    .from(watchlists)
    .innerJoin(stocks, eq(watchlists.stockId, stocks.id))
    .where(eq(watchlists.userId, userId))
    .orderBy(watchlists.createdAt);
}

/**
 * Add stock to user's watchlist
 */
export async function addToWatchlist(
  userId: number,
  stockId: number,
  options?: { label?: string; alertOnBuy?: boolean; alertOnSell?: boolean }
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.insert(watchlists).values({
    userId,
    stockId,
    label: options?.label,
    alertOnBuy: options?.alertOnBuy !== false ? 1 : 0,
    alertOnSell: options?.alertOnSell !== false ? 1 : 0,
  });
}

/**
 * Remove stock from user's watchlist
 */
export async function removeFromWatchlist(watchlistId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db
    .delete(watchlists)
    .where(and(eq(watchlists.id, watchlistId), eq(watchlists.userId, userId)));
}

/**
 * Get recent signals for a stock
 */
export async function getSignalsForStock(stockId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(signals)
    .where(eq(signals.stockId, stockId))
    .orderBy(signals.createdAt)
    .limit(limit);
}

/**
 * Get active signals for user's watchlist
 */
export async function getActiveSignalsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      signalId: signals.id,
      stockId: signals.stockId,
      ticker: stocks.ticker,
      type: signals.type,
      confidenceScore: signals.confidenceScore,
      priceAtSignal: signals.priceAtSignal,
      createdAt: signals.createdAt,
    })
    .from(signals)
    .innerJoin(stocks, eq(signals.stockId, stocks.id))
    .innerJoin(watchlists, eq(watchlists.stockId, stocks.id))
    .where(
      and(
        eq(watchlists.userId, userId),
        eq(signals.status, 'active')
      )
    )
    .orderBy(signals.createdAt);
}

/**
 * Store a new trading signal
 */
export async function createSignal(
  stockId: number,
  type: 'buy' | 'sell',
  confidenceScore: number,
  priceAtSignal: number,
  indicators?: Record<string, unknown>,
  analysis?: string
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.insert(signals).values({
    stockId,
    type,
    confidenceScore,
    priceAtSignal,
    indicators: indicators ? JSON.stringify(indicators) : undefined,
    analysis,
  });

  return result;
}

/**
 * Get price history for technical analysis
 */
export async function getPriceHistory(stockId: number, days: number = 365) {
  const db = await getDb();
  if (!db) return [];

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return db
    .select()
    .from(priceHistory)
    .where(
      and(
        eq(priceHistory.stockId, stockId),
        sql`${priceHistory.date} >= ${cutoffDate}`
      )
    )
    .orderBy(priceHistory.date);
}

/**
 * Store price history data
 */
export async function storePriceData(
  stockId: number,
  priceData: Array<{
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    adjClose?: number;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Convert prices to cents for storage
  const values = priceData.map(p => ({
    stockId,
    date: p.date,
    open: Math.round(p.open * 100),
    high: Math.round(p.high * 100),
    low: Math.round(p.low * 100),
    close: Math.round(p.close * 100),
    volume: p.volume,
    adjClose: p.adjClose ? Math.round(p.adjClose * 100) : undefined,
  }));

  await db.insert(priceHistory).values(values).onDuplicateKeyUpdate({
    set: {
      open: sql`VALUES(open)`,
      high: sql`VALUES(high)`,
      low: sql`VALUES(low)`,
      close: sql`VALUES(close)`,
      volume: sql`VALUES(volume)`,
      adjClose: sql`VALUES(adjClose)`,
    },
  });
}

/**
 * Get or create user preferences
 */
export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  let prefs = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);

  if (prefs.length === 0) {
    await db.insert(userPreferences).values({ userId });
    prefs = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);
  }

  return prefs[0];
}

/**
 * Create in-app notification
 */
export async function createNotification(
  userId: number,
  signalId: number,
  ticker: string,
  title: string,
  message: string
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.insert(notifications).values({
    userId,
    signalId,
    ticker,
    title,
    message,
  });
}

/**
 * Get user's unread notifications
 */
export async function getUnreadNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, 0)))
    .orderBy(notifications.createdAt);
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db
    .update(notifications)
    .set({ isRead: 1, readAt: new Date() })
    .where(eq(notifications.id, notificationId));
}


/**
 * Get payment history for a user
 */
export async function getPaymentHistory(userId: number, limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(payments.createdAt)
    .limit(limit)
    .offset(offset);
}

/**
 * Get invoices for a user
 */
export async function getInvoicesForUser(userId: number, limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(invoices)
    .where(eq(invoices.userId, userId))
    .orderBy(invoices.createdAt)
    .limit(limit)
    .offset(offset);
}

/**
 * Get linked broker accounts for a user
 */
export async function getBrokerAccounts(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(brokerAccounts)
    .where(eq(brokerAccounts.userId, userId));
}

/**
 * Get portfolio templates (public or user's own)
 */
export async function getPortfolioTemplates(userId?: number) {
  const db = await getDb();
  if (!db) return [];

  if (userId) {
    return db
      .select()
      .from(portfolioTemplates)
      .where(
        sql`${portfolioTemplates.isPublic} = 1 OR ${portfolioTemplates.userId} = ${userId}`
      );
  }

  return db
    .select()
    .from(portfolioTemplates)
    .where(eq(portfolioTemplates.isPublic, 1));
}

/**
 * Get notification preferences for a user
 */
export async function getNotificationPreferences(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId));
}

/**
 * Get notification preferences for a specific stock
 */
export async function getNotificationPreference(userId: number, symbol: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(notificationPreferences)
    .where(
      and(
        eq(notificationPreferences.userId, userId),
        eq(notificationPreferences.symbol, symbol)
      )
    )
    .limit(1);

  return result[0];
}

/**
 * Create or update a payment record
 */
export async function createPayment(
  userId: number,
  amount: number,
  tier: 'STARTER' | 'PRO' | 'ELITE',
  stripePaymentIntentId?: string,
  description?: string
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return db.insert(payments).values({
    userId,
    amount,
    tier,
    currency: 'GBP',
    status: 'pending',
    stripePaymentIntentId,
    description,
  });
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  paymentId: number,
  status: 'pending' | 'succeeded' | 'failed' | 'refunded'
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db
    .update(payments)
    .set({ status, paidAt: status === 'succeeded' ? new Date() : undefined })
    .where(eq(payments.id, paymentId));
}

/**
 * Create an invoice
 */
export async function createInvoice(
  userId: number,
  invoiceNumber: string,
  amount: number,
  issueDate: Date,
  dueDate: Date,
  paymentId?: number
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return db.insert(invoices).values({
    userId,
    invoiceNumber,
    amount,
    issueDate,
    dueDate,
    paymentId,
    status: 'sent',
  });
}

/**
 * Create a broker account
 */
export async function createBrokerAccount(
  userId: number,
  brokerType: 'TRADING_212' | 'ALPACA' | 'INTERACTIVE_BROKERS',
  accountName: string,
  encryptedCredentials: string
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return db.insert(brokerAccounts).values({
    userId,
    brokerType,
    accountName,
    encryptedCredentials,
  });
}

/**
 * Create a portfolio template
 */
export async function createPortfolioTemplate(
  userId: number,
  name: string,
  holdings: string, // JSON string
  category: 'TECH_GROWTH' | 'DIVIDEND_INCOME' | 'BALANCED' | 'CUSTOM' = 'CUSTOM',
  description?: string,
  isPublic: boolean = false
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return db.insert(portfolioTemplates).values({
    userId,
    name,
    holdings,
    category,
    description,
    isPublic: isPublic ? 1 : 0,
  });
}

/**
 * Create or update notification preferences
 */
export async function setNotificationPreference(
  userId: number,
  symbol: string,
  channels: string[], // JSON array
  triggers: string[], // JSON array
  minConfidence: number = 60,
  priceAlertThreshold?: number
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const existing = await getNotificationPreference(userId, symbol);

  if (existing) {
    await db
      .update(notificationPreferences)
      .set({
        channels: JSON.stringify(channels),
        triggers: JSON.stringify(triggers),
        minConfidence,
        priceAlertThreshold,
      })
      .where(eq(notificationPreferences.id, existing.id));
  } else {
    await db.insert(notificationPreferences).values({
      userId,
      symbol,
      channels: JSON.stringify(channels),
      triggers: JSON.stringify(triggers),
      minConfidence,
      priceAlertThreshold,
    });
  }
}


/**
 * Update user verification token and expiration
 */
export async function updateUserVerificationToken(userId: number, token: string, expiresAt: Date) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { eq } = await import('drizzle-orm');
  return db.update(users).set({
    emailVerificationToken: token,
    emailVerificationTokenExpiresAt: expiresAt,
  }).where(eq(users.id, userId));
}

/**
 * Mark email as verified
 */
export async function markEmailAsVerified(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { eq } = await import('drizzle-orm');
  return db.update(users).set({
    emailVerified: 1,
    emailVerificationToken: null,
    emailVerificationTokenExpiresAt: null,
  }).where(eq(users.id, userId));
}

/**
 * Get user by ID
 */
export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { eq } = await import('drizzle-orm');
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result[0] || null;
}
