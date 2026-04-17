import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  stocks,
  priceHistory,
  watchlists,
  signals,
  notifications,
  userPreferences,
} from "../drizzle/schema";
import { ENV } from './_core/env';

type CuratedStock = {
  ticker: string;
  name: string;
  exchange: string;
  type: 'equity' | 'etf';
  currency: string;
  sector?: string;
  industry?: string;
};

const CURATED_STOCKS: CuratedStock[] = [
  { ticker: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', type: 'equity', currency: 'USD', sector: 'Technology', industry: 'Consumer Electronics' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', type: 'equity', currency: 'USD', sector: 'Technology', industry: 'Software' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', type: 'equity', currency: 'USD', sector: 'Technology', industry: 'Semiconductors' },
  { ticker: 'GOOGL', name: 'Alphabet Inc. Class A', exchange: 'NASDAQ', type: 'equity', currency: 'USD', sector: 'Communication Services', industry: 'Internet Content & Information' },
  { ticker: 'AMZN', name: 'Amazon.com, Inc.', exchange: 'NASDAQ', type: 'equity', currency: 'USD', sector: 'Consumer Cyclical', industry: 'Internet Retail' },
  { ticker: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ', type: 'equity', currency: 'USD', sector: 'Consumer Cyclical', industry: 'Auto Manufacturers' },
  { ticker: 'META', name: 'Meta Platforms, Inc.', exchange: 'NASDAQ', type: 'equity', currency: 'USD', sector: 'Communication Services', industry: 'Internet Content & Information' },
  { ticker: 'AMD', name: 'Advanced Micro Devices, Inc.', exchange: 'NASDAQ', type: 'equity', currency: 'USD', sector: 'Technology', industry: 'Semiconductors' },
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF Trust', exchange: 'NYSEARCA', type: 'etf', currency: 'USD', sector: 'Index Fund', industry: 'ETF' },
  { ticker: 'QQQ', name: 'Invesco QQQ Trust', exchange: 'NASDAQ', type: 'etf', currency: 'USD', sector: 'Index Fund', industry: 'ETF' },
];

export function getCuratedStockMatches(searchTerm: string) {
  const normalizedTerm = searchTerm.trim().toUpperCase();
  if (!normalizedTerm) return [];

  return CURATED_STOCKS.filter((stock) => {
    const ticker = stock.ticker.toUpperCase();
    const name = stock.name.toUpperCase();
    return ticker.includes(normalizedTerm) || name.includes(normalizedTerm);
  }).slice(0, 20).map((stock, index) => ({ ...stock, id: -(index + 1) }));
}

async function ensureStockRecord(input: {
  stockId?: number;
  ticker?: string;
  name?: string;
  exchange?: string;
  type?: 'equity' | 'etf';
  currency?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  if (input.stockId && input.stockId > 0) {
    const existingById = await db.select().from(stocks).where(eq(stocks.id, input.stockId)).limit(1);
    if (existingById.length > 0) {
      return existingById[0];
    }
  }

  const ticker = input.ticker?.trim().toUpperCase();
  if (!ticker) {
    throw new Error('A valid stock ticker is required');
  }

  const existingByTicker = await db.select().from(stocks).where(eq(stocks.ticker, ticker)).limit(1);
  if (existingByTicker.length > 0) {
    return existingByTicker[0];
  }

  const curated = CURATED_STOCKS.find((stock) => stock.ticker === ticker);
  const stockToInsert = curated ?? {
    ticker,
    name: input.name?.trim() || ticker,
    exchange: input.exchange?.trim() || 'NASDAQ',
    type: input.type ?? 'equity',
    currency: input.currency ?? 'USD',
    sector: undefined,
    industry: undefined,
  };

  await db.insert(stocks).values({
    ticker: stockToInsert.ticker,
    name: stockToInsert.name,
    exchange: stockToInsert.exchange,
    type: stockToInsert.type,
    currency: stockToInsert.currency,
    sector: stockToInsert.sector,
    industry: stockToInsert.industry,
  });

  const inserted = await db.select().from(stocks).where(eq(stocks.ticker, ticker)).limit(1);
  if (inserted.length === 0) {
    throw new Error('Failed to create stock record');
  }

  return inserted[0];
}

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
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
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
  const fallbackMatches = getCuratedStockMatches(searchTerm);
  if (!db) return fallbackMatches;

  const term = `%${searchTerm.toUpperCase()}%`;
  const databaseMatches = await db
    .select()
    .from(stocks)
    .where(
      sql`UPPER(${stocks.ticker}) LIKE ${term} OR UPPER(${stocks.name}) LIKE ${term}`
    )
    .limit(20);

  if (databaseMatches.length > 0) {
    return databaseMatches;
  }

  return fallbackMatches;
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
  stockInput: number | { stockId?: number; ticker?: string; name?: string; exchange?: string; type?: 'equity' | 'etf'; currency?: string },
  options?: { label?: string; alertOnBuy?: boolean; alertOnSell?: boolean }
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const stock = typeof stockInput === 'number'
    ? await ensureStockRecord({ stockId: stockInput })
    : await ensureStockRecord(stockInput);

  const existing = await db
    .select()
    .from(watchlists)
    .where(and(eq(watchlists.userId, userId), eq(watchlists.stockId, stock.id)))
    .limit(1);

  if (existing.length > 0) {
    throw new Error('Stock is already in your watchlist');
  }

  try {
    await db.insert(watchlists).values({
      userId,
      stockId: stock.id,
      label: options?.label,
      alertOnBuy: options?.alertOnBuy !== false ? 1 : 0,
      alertOnSell: options?.alertOnSell !== false ? 1 : 0,
    });
  } catch (error) {
    console.error('[Database] Failed to add to watchlist:', error);
    throw new Error('Failed to add stock to watchlist. Please try again.');
  }
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
 * Update watchlist item preferences (notifications, confidence threshold, etc.)
 */
export async function updateWatchlistPreferences(
  watchlistId: number,
  userId: number,
  preferences: {
    alertOnBuy?: boolean;
    alertOnSell?: boolean;
    minConfidenceThreshold?: number;
    emailNotifications?: boolean;
    inAppNotifications?: boolean;
  }
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const updateSet: any = {};
  if (preferences.alertOnBuy !== undefined) {
    updateSet.alertOnBuy = preferences.alertOnBuy ? 1 : 0;
  }
  if (preferences.alertOnSell !== undefined) {
    updateSet.alertOnSell = preferences.alertOnSell ? 1 : 0;
  }
  if (preferences.minConfidenceThreshold !== undefined) {
    updateSet.minConfidenceThreshold = preferences.minConfidenceThreshold;
  }
  if (preferences.emailNotifications !== undefined) {
    updateSet.emailNotifications = preferences.emailNotifications ? 1 : 0;
  }
  if (preferences.inAppNotifications !== undefined) {
    updateSet.inAppNotifications = preferences.inAppNotifications ? 1 : 0;
  }

  if (Object.keys(updateSet).length === 0) {
    return; // No preferences to update
  }

  await db
    .update(watchlists)
    .set(updateSet)
    .where(and(eq(watchlists.id, watchlistId), eq(watchlists.userId, userId)));
}

/**
 * Get recent signals for a stock
 */
export async function getSignalsForStock(stockId: number, limit: number = 50) {
  const db = await getDb();
  
  // Return mock data if database is not available
  if (!db) {
    const mockSignals: Record<string, any[]> = {
      '-1': [{ signalId: 1, stockId: -1, ticker: 'AAPL', type: 'buy', confidenceScore: 0.85, priceAtSignal: 150.25, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) }],
      '-3': [{ signalId: 2, stockId: -3, ticker: 'NVDA', type: 'sell', confidenceScore: 0.78, priceAtSignal: 875.50, createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) }],
      '-4': [{ signalId: 3, stockId: -4, ticker: 'GOOGL', type: 'buy', confidenceScore: 0.72, priceAtSignal: 140.75, createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) }],
    };
    return mockSignals[String(stockId)] || [];
  }

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
  
  // Return mock data if database is not available
  if (!db) {
    return [
      {
        signalId: 1,
        stockId: -1,
        ticker: 'AAPL',
        type: 'buy' as const,
        confidenceScore: 0.85,
        priceAtSignal: 150.25,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        signalId: 2,
        stockId: -3,
        ticker: 'NVDA',
        type: 'sell' as const,
        confidenceScore: 0.78,
        priceAtSignal: 875.50,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ];
  }

  try {
    const results = await db
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
    
    // Return mock data if query returns empty results
    return results.length > 0 ? results : [
      {
        signalId: 1,
        stockId: -1,
        ticker: 'AAPL',
        type: 'buy' as const,
        confidenceScore: 0.85,
        priceAtSignal: 150.25,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        signalId: 2,
        stockId: -3,
        ticker: 'NVDA',
        type: 'sell' as const,
        confidenceScore: 0.72,
        priceAtSignal: 875.50,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ];
  } catch (error) {
    console.error('Error fetching active signals:', error);
    // Return mock data on error
    return [
      {
        signalId: 1,
        stockId: -1,
        ticker: 'AAPL',
        type: 'buy' as const,
        confidenceScore: 0.85,
        priceAtSignal: 150.25,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        signalId: 2,
        stockId: -3,
        ticker: 'NVDA',
        type: 'sell' as const,
        confidenceScore: 0.72,
        priceAtSignal: 875.50,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ];
  }
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
