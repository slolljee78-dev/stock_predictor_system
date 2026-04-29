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
import { isStoredSignalActionable } from './actionableStoredSignals';

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
  
  if (!db) {
    console.warn('[DB] Database not available for signal retrieval');
    return [];
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
  
  if (!db) {
    console.warn('[DB] Database not available for signal retrieval');
    return [];
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
        minConfidenceThreshold: watchlists.minConfidenceThreshold,
        alertOnBuy: watchlists.alertOnBuy,
        alertOnSell: watchlists.alertOnSell,
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
    
    return results
      .filter((signal) => isStoredSignalActionable(signal))
      .map(({ minConfidenceThreshold, alertOnBuy, alertOnSell, ...signal }) => signal);
  } catch (error) {
    console.error('Error fetching active signals:', error);
    // Return empty array on error instead of mock data
    return [];
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


/**
 * Get 7-day signal trend data for buy and sell signals
 */
export async function getSignalTrend(days: number = 7) {
  const db = await getDb();
  
  // Return mock data if database is not available
  if (!db) {
    // Mock trend data: simulate 7-day history
    const buyTrend = Array.from({ length: days }, (_, i) => {
      const daysAgo = days - i;
      return Math.floor(Math.random() * 5) + (i % 2 === 0 ? 2 : 0);
    });
    
    const sellTrend = Array.from({ length: days }, (_, i) => {
      const daysAgo = days - i;
      return Math.floor(Math.random() * 4) + (i % 3 === 0 ? 1 : 0);
    });
    
    const totalBuy = buyTrend.reduce((a, b) => a + b, 0);
    const totalSell = sellTrend.reduce((a, b) => a + b, 0);
    const prevBuy = Math.floor(totalBuy * 0.8);
    const prevSell = Math.floor(totalSell * 0.85);
    
    return {
      buyTrend,
      sellTrend,
      buyChange: ((totalBuy - prevBuy) / prevBuy) * 100,
      sellChange: ((totalSell - prevSell) / prevSell) * 100,
    };
  }

  try {
    const sevenDaysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // Get buy signals from last 7 days
    const buySignals = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(signals)
      .where(and(
        eq(signals.type, 'buy'),
        sql`${signals.createdAt} >= ${sevenDaysAgo}`
      ));
    
    // Get sell signals from last 7 days
    const sellSignals = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(signals)
      .where(and(
        eq(signals.type, 'sell'),
        sql`${signals.createdAt} >= ${sevenDaysAgo}`
      ));
    
    // Get previous 7 days data for comparison
    const fourteenDaysAgo = new Date(Date.now() - (days * 2) * 24 * 60 * 60 * 1000);
    
    const prevBuySignals = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(signals)
      .where(and(
        eq(signals.type, 'buy'),
        sql`${signals.createdAt} >= ${fourteenDaysAgo} AND ${signals.createdAt} < ${sevenDaysAgo}`
      ));
    
    const prevSellSignals = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(signals)
      .where(and(
        eq(signals.type, 'sell'),
        sql`${signals.createdAt} >= ${fourteenDaysAgo} AND ${signals.createdAt} < ${sevenDaysAgo}`
      ));
    
    const currentBuyCount = buySignals[0]?.count ?? 0;
    const currentSellCount = sellSignals[0]?.count ?? 0;
    const prevBuyCount = prevBuySignals[0]?.count ?? currentBuyCount;
    const prevSellCount = prevSellSignals[0]?.count ?? currentSellCount;
    
    const buyChange = prevBuyCount > 0 ? ((currentBuyCount - prevBuyCount) / prevBuyCount) * 100 : 0;
    const sellChange = prevSellCount > 0 ? ((currentSellCount - prevSellCount) / prevSellCount) * 100 : 0;
    
    return {
      buyCount: currentBuyCount,
      sellCount: currentSellCount,
      buyChange: Math.round(buyChange * 10) / 10,
      sellChange: Math.round(sellChange * 10) / 10,
    };
  } catch (error) {
    console.error('Error calculating signal trend:', error);
    return {
      buyCount: 0,
      sellCount: 0,
      buyChange: 0,
      sellChange: 0,
    };
  }
}


/**
 * Get per-day signal trend breakdown for the last N days
 */
export async function getSignalTrendByDay(days: number = 7) {
  const db = await getDb();
  
  // Return mock data if database is not available
  if (!db) {
    const dailyData = Array.from({ length: days }, (_, i) => {
      const date = new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000);
      return {
        date: date.toISOString().split('T')[0],
        buyCount: Math.floor(Math.random() * 5) + 1,
        sellCount: Math.floor(Math.random() * 4),
      };
    });
    
    return dailyData;
  }

  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    startDate.setHours(0, 0, 0, 0);
    
    // Get all signals from the last N days
    const signalRecords = await db
      .select({
        date: sql<string>`DATE(${signals.createdAt})`,
        type: signals.type,
      })
      .from(signals)
      .where(sql`${signals.createdAt} >= ${startDate}`)
      .orderBy(sql`DATE(${signals.createdAt})`);
    
    // Group by date and type
    const dailyMap = new Map<string, { buyCount: number; sellCount: number }>();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyMap.set(dateStr, { buyCount: 0, sellCount: 0 });
    }
    
    signalRecords.forEach((signal: { date: string; type: string }) => {
      const entry = dailyMap.get(signal.date);
      if (entry) {
        if (signal.type === 'buy') {
          entry.buyCount++;
        } else if (signal.type === 'sell') {
          entry.sellCount++;
        }
      }
    });
    
    // Convert to array sorted by date
    return Array.from(dailyMap.entries())
      .map(([date, counts]) => ({
        date,
        ...counts,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error calculating daily signal trends:', error);
    // Return mock data on error
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000);
      return {
        date: date.toISOString().split('T')[0],
        buyCount: Math.floor(Math.random() * 5) + 1,
        sellCount: Math.floor(Math.random() * 4),
      };
    });
  }
}
