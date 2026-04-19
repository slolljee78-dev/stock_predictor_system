import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  
  // Subscription fields for Stripe integration
  subscriptionTier: varchar("subscriptionTier", { length: 20 }).default("free"),
  subscriptionStatus: varchar("subscriptionStatus", { length: 20 }).default("inactive"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  subscriptionStartedAt: timestamp("subscriptionStartedAt"),
  subscriptionEndedAt: timestamp("subscriptionEndedAt"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Stock data table - stores Trading 212 listed stocks and ETFs
 * Includes technical metadata for accurate identification across data sources
 */
export const stocks = mysqlTable("stocks", {
  id: int("id").autoincrement().primaryKey(),
  /** Stock ticker symbol (e.g., AAPL, VUAG) */
  ticker: varchar("ticker", { length: 20 }).notNull().unique(),
  /** Full company/fund name */
  name: text("name").notNull(),
  /** ISIN code for unique identification */
  isin: varchar("isin", { length: 12 }).unique(),
  /** CUSIP for US securities */
  cusip: varchar("cusip", { length: 9 }).unique(),
  /** Stock type: equity or etf */
  type: mysqlEnum("type", ["equity", "etf"]).notNull(),
  /** Primary exchange (NASDAQ, NYSE, LSE, etc.) */
  exchange: varchar("exchange", { length: 20 }).notNull(),
  /** Currency of trading */
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  /** Market cap in millions (for equities) */
  marketCap: int("marketCap"),
  /** Sector classification */
  sector: varchar("sector", { length: 50 }),
  /** Industry classification */
  industry: varchar("industry", { length: 50 }),
  /** Last price update timestamp */
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Stock = typeof stocks.$inferSelect;
export type InsertStock = typeof stocks.$inferInsert;

/**
 * Historical price data - OHLCV data for technical analysis
 * Partitioned by ticker for efficient querying
 */
export const priceHistory = mysqlTable("priceHistory", {
  id: int("id").autoincrement().primaryKey(),
  /** Foreign key to stocks table */
  stockId: int("stockId").notNull().references(() => stocks.id, { onDelete: "cascade" }),
  /** Trading date */
  date: timestamp("date").notNull(),
  /** Opening price */
  open: int("open").notNull(), // Stored as cents to avoid float precision issues
  /** High price */
  high: int("high").notNull(),
  /** Low price */
  low: int("low").notNull(),
  /** Closing price */
  close: int("close").notNull(),
  /** Trading volume */
  volume: int("volume").notNull(),
  /** Adjusted close for splits/dividends */
  adjClose: int("adjClose"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = typeof priceHistory.$inferInsert;

/**
 * User watchlist - tracks stocks users are monitoring
 */
export const watchlists = mysqlTable("watchlists", {
  id: int("id").autoincrement().primaryKey(),
  /** Foreign key to users table */
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  /** Foreign key to stocks table */
  stockId: int("stockId").notNull().references(() => stocks.id, { onDelete: "cascade" }),
  /** User's custom label for this watchlist entry */
  label: varchar("label", { length: 100 }),
  /** Alert preferences for this stock */
  alertOnBuy: int("alertOnBuy").default(1).notNull(), // 1 = true, 0 = false
  alertOnSell: int("alertOnSell").default(1).notNull(),
  /** Minimum confidence score threshold for alerts (0-100) */
  minConfidenceThreshold: int("minConfidenceThreshold").default(60).notNull(),
  /** Email notification enabled for this stock */
  emailNotifications: int("emailNotifications").default(1).notNull(),
  /** In-app notification enabled for this stock */
  inAppNotifications: int("inAppNotifications").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Watchlist = typeof watchlists.$inferSelect;
export type InsertWatchlist = typeof watchlists.$inferInsert;

/**
 * Trading signals - ML-generated buy/sell recommendations
 */
export const signals = mysqlTable("signals", {
  id: int("id").autoincrement().primaryKey(),
  /** Foreign key to stocks table */
  stockId: int("stockId").notNull().references(() => stocks.id, { onDelete: "cascade" }),
  /** Signal type: buy or sell */
  type: mysqlEnum("type", ["buy", "sell"]).notNull(),
  /** Confidence score (0-100) */
  confidenceScore: int("confidenceScore").notNull(),
  /** Price at signal generation */
  priceAtSignal: int("priceAtSignal").notNull(), // Stored as cents
  /** Technical indicators used in analysis (JSON) */
  indicators: text("indicators"), // JSON: {rsi, macd, bbands, sma, ema}
  /** LLM analysis summary */
  analysis: text("analysis"),
  /** Signal status: active, triggered, expired */
  status: mysqlEnum("status", ["active", "triggered", "expired"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
});

export type Signal = typeof signals.$inferSelect;
export type InsertSignal = typeof signals.$inferInsert;

/**
 * Alert history - tracks sent alerts to users
 */
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  /** Foreign key to users table */
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  /** Foreign key to signals table */
  signalId: int("signalId").notNull().references(() => signals.id, { onDelete: "cascade" }),
  /** Foreign key to stocks table */
  stockId: int("stockId").notNull().references(() => stocks.id, { onDelete: "cascade" }),
  /** Alert channel: email, in-app, or both */
  channel: mysqlEnum("channel", ["email", "inApp", "both"]).notNull(),
  /** Alert status: pending, sent, failed */
  status: mysqlEnum("status", ["pending", "sent", "failed"]).default("pending").notNull(),
  /** Error message if delivery failed */
  errorMessage: text("errorMessage"),
  /** When the alert was actually sent */
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

/**
 * In-app notifications - stores unread notifications for users
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  /** Foreign key to users table */
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  /** Foreign key to signals table */
  signalId: int("signalId").notNull().references(() => signals.id, { onDelete: "cascade" }),
  /** Stock ticker for quick reference */
  ticker: varchar("ticker", { length: 20 }).notNull(),
  /** Notification title */
  title: varchar("title", { length: 255 }).notNull(),
  /** Notification message */
  message: text("message").notNull(),
  /** Read status */
  isRead: int("isRead").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * User preferences - stores user-specific settings
 */
export const userPreferences = mysqlTable("userPreferences", {
  id: int("id").autoincrement().primaryKey(),
  /** Foreign key to users table */
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  /** Global email notifications enabled */
  emailNotificationsEnabled: int("emailNotificationsEnabled").default(1).notNull(),
  /** Global in-app notifications enabled */
  inAppNotificationsEnabled: int("inAppNotificationsEnabled").default(1).notNull(),
  /** Default minimum confidence threshold (0-100) */
  defaultMinConfidence: int("defaultMinConfidence").default(60).notNull(),
  /** Email address for alerts (can differ from login email) */
  alertEmail: varchar("alertEmail", { length: 320 }),
  /** Preferred chart type: candlestick or line */
  preferredChartType: mysqlEnum("preferredChartType", ["candlestick", "line"]).default("candlestick").notNull(),
  /** Theme preference: light or dark */
  theme: mysqlEnum("theme", ["light", "dark"]).default("dark").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;
/**
 * User portfolios - tracks trading portfolios for leaderboard and comparison
 */
export const portfolios = mysqlTable("portfolios", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  startingCapital: int("startingCapital").notNull(),
  currentCapital: int("currentCapital").notNull(),
  totalReturn: int("totalReturn").notNull().default(0),
  winRate: int("winRate").notNull().default(0),
  sharpeRatio: int("sharpeRatio").notNull().default(0),
  maxDrawdown: int("maxDrawdown").notNull().default(0),
  totalTrades: int("totalTrades").notNull().default(0),
  winningTrades: int("winningTrades").notNull().default(0),
  profitFactor: int("profitFactor").notNull().default(0),
  status: mysqlEnum("status", ["active", "paused", "completed"]).default("active").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = typeof portfolios.$inferInsert;

/**
 * Backtesting runs - stores historical backtests performed by users
 */
export const backtestRuns = mysqlTable("backtestRuns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  initialCapital: int("initialCapital").notNull(),
  stockIds: text("stockIds").notNull(),
  filterSettings: text("filterSettings"),
  finalCapital: int("finalCapital").notNull(),
  totalReturn: int("totalReturn").notNull(),
  winRate: int("winRate").notNull(),
  sharpeRatio: int("sharpeRatio").notNull(),
  maxDrawdown: int("maxDrawdown").notNull(),
  totalTrades: int("totalTrades").notNull().default(0),
  winningTrades: int("winningTrades").notNull().default(0),
  avgWin: int("avgWin").notNull().default(0),
  avgLoss: int("avgLoss").notNull().default(0),
  profitFactor: int("profitFactor").notNull().default(0),
  status: mysqlEnum("status", ["running", "completed", "failed"]).default("running").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type BacktestRun = typeof backtestRuns.$inferSelect;
export type InsertBacktestRun = typeof backtestRuns.$inferInsert;

/**
 * Backtest trades - individual trades executed during a backtest
 */
export const backtestTrades = mysqlTable("backtestTrades", {
  id: int("id").autoincrement().primaryKey(),
  backtestRunId: int("backtestRunId").notNull().references(() => backtestRuns.id, { onDelete: "cascade" }),
  stockId: int("stockId").notNull().references(() => stocks.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", ["buy", "sell"]).notNull(),
  entryDate: timestamp("entryDate").notNull(),
  entryPrice: int("entryPrice").notNull(),
  exitDate: timestamp("exitDate").notNull(),
  exitPrice: int("exitPrice").notNull(),
  quantity: int("quantity").notNull(),
  profitLoss: int("profitLoss").notNull(),
  returnPercent: int("returnPercent").notNull(),
  exitReason: varchar("exitReason", { length: 50 }).notNull(),
  signalConfidence: int("signalConfidence").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BacktestTrade = typeof backtestTrades.$inferSelect;
export type InsertBacktestTrade = typeof backtestTrades.$inferInsert;


/**
 * Sentiment analysis data - stores aggregated sentiment scores for stocks
 * Updated periodically from news sources
 */
export const stockSentiment = mysqlTable("stockSentiment", {
  id: int("id").autoincrement().primaryKey(),
  stockId: int("stockId").notNull().references(() => stocks.id, { onDelete: "cascade" }),
  /** Sentiment score from -1 (very negative) to 1 (very positive) */
  sentimentScore: int("sentimentScore").notNull(), // Stored as integer (-100 to 100)
  /** Confidence level of sentiment analysis (0-100) */
  confidence: int("confidence").notNull(),
  /** Number of articles analyzed */
  articleCount: int("articleCount").notNull().default(0),
  /** Classification: very_negative, negative, neutral, positive, very_positive */
  classification: varchar("classification", { length: 20 }).notNull(),
  /** Date of sentiment analysis */
  analysisDate: timestamp("analysisDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StockSentiment = typeof stockSentiment.$inferSelect;
export type InsertStockSentiment = typeof stockSentiment.$inferInsert;

/**
 * News articles - stores news articles used for sentiment analysis
 */
export const newsArticles = mysqlTable("newsArticles", {
  id: int("id").autoincrement().primaryKey(),
  stockId: int("stockId").notNull().references(() => stocks.id, { onDelete: "cascade" }),
  /** Article title */
  title: text("title").notNull(),
  /** Article description/summary */
  description: text("description"),
  /** Full article content */
  content: text("content"),
  /** Article URL */
  url: varchar("url", { length: 2048 }).notNull().unique(),
  /** News source (e.g., Reuters, Bloomberg) */
  source: varchar("source", { length: 100 }).notNull(),
  /** Sentiment score for this article (-100 to 100) */
  sentimentScore: int("sentimentScore").notNull(),
  /** Publication date */
  publishedAt: timestamp("publishedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NewsArticle = typeof newsArticles.$inferSelect;
export type InsertNewsArticle = typeof newsArticles.$inferInsert;

/**
 * Signal alerts - tracks buy/sell signals that trigger alerts
 */
export const signalAlerts = mysqlTable("signalAlerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  stockId: int("stockId").notNull().references(() => stocks.id, { onDelete: "cascade" }),
  /** Signal type: buy or sell */
  signalType: mysqlEnum("signalType", ["buy", "sell"]).notNull(),
  /** Confidence score (0-100) */
  confidence: int("confidence").notNull(),
  /** Price at signal generation */
  price: int("price").notNull(),
  /** Alert status: pending, sent, dismissed */
  status: mysqlEnum("status", ["pending", "sent", "dismissed"]).notNull().default("pending"),
  /** Channels notified: in_app, email, push */
  notificationChannels: varchar("notificationChannels", { length: 100 }).notNull(), // JSON array
  /** Timestamp when alert was sent */
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SignalAlert = typeof signalAlerts.$inferSelect;
export type InsertSignalAlert = typeof signalAlerts.$inferInsert;

/**
 * Alert preferences - user preferences for stock alerts
 */
export const alertPreferences = mysqlTable("alertPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  stockId: int("stockId").notNull().references(() => stocks.id, { onDelete: "cascade" }),
  /** Minimum confidence threshold for buy signals (0-100) */
  minBuyConfidence: int("minBuyConfidence").notNull().default(60),
  /** Minimum confidence threshold for sell signals (0-100) */
  minSellConfidence: int("minSellConfidence").notNull().default(60),
  /** Enable buy signal alerts */
  enableBuyAlerts: int("enableBuyAlerts").notNull().default(1), // Boolean as int
  /** Enable sell signal alerts */
  enableSellAlerts: int("enableSellAlerts").notNull().default(1),
  /** Enable sentiment alerts */
  enableSentimentAlerts: int("enableSentimentAlerts").notNull().default(1),
  /** Notification channels: in_app, email, push (JSON array) */
  notificationChannels: varchar("notificationChannels", { length: 100 }).notNull().default('["in_app"]'),
  /** Enable push notifications */
  enablePushNotifications: int("enablePushNotifications").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AlertPreferences = typeof alertPreferences.$inferSelect;
export type InsertAlertPreferences = typeof alertPreferences.$inferInsert;


/**
 * Price Alerts - user-defined price targets for notifications
 * Allows users to set alerts when a stock reaches a specific price
 */
export const priceAlerts = mysqlTable("priceAlerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  stockId: int("stockId").notNull().references(() => stocks.id, { onDelete: "cascade" }),
  /** Target price for the alert */
  targetPrice: varchar("targetPrice", { length: 20 }).notNull(),
  /** Alert type: above or below target price */
  alertType: mysqlEnum("alertType", ["above", "below"]).notNull(),
  /** Alert status: active, triggered, dismissed, deleted */
  status: mysqlEnum("status", ["active", "triggered", "dismissed", "deleted"]).notNull().default("active"),
  /** Whether to notify via browser notification */
  enableBrowserNotification: int("enableBrowserNotification").notNull().default(1),
  /** Whether to notify via email */
  enableEmailNotification: int("enableEmailNotification").notNull().default(0),
  /** Number of times this alert has been triggered */
  triggerCount: int("triggerCount").notNull().default(0),
  /** Last price when alert was triggered */
  lastTriggeredPrice: varchar("lastTriggeredPrice", { length: 20 }),
  /** Timestamp when alert was last triggered */
  lastTriggeredAt: timestamp("lastTriggeredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PriceAlert = typeof priceAlerts.$inferSelect;
export type InsertPriceAlert = typeof priceAlerts.$inferInsert;

/**
 * Price Alert History - tracks when price alerts are triggered
 * Used for audit trail and analytics
 */
export const priceAlertHistory = mysqlTable("priceAlertHistory", {
  id: int("id").autoincrement().primaryKey(),
  priceAlertId: int("priceAlertId").notNull().references(() => priceAlerts.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  stockId: int("stockId").notNull().references(() => stocks.id, { onDelete: "cascade" }),
  /** Price at the time of trigger */
  triggerPrice: varchar("triggerPrice", { length: 20 }).notNull(),
  /** Target price that was set */
  targetPrice: varchar("targetPrice", { length: 20 }).notNull(),
  /** Alert type that triggered */
  alertType: mysqlEnum("alertType", ["above", "below"]).notNull(),
  /** Notification channels that were used */
  notificationChannels: varchar("notificationChannels", { length: 100 }).notNull(), // JSON array
  /** Whether notification was successfully sent */
  notificationSent: int("notificationSent").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PriceAlertHistory = typeof priceAlertHistory.$inferSelect;
export type InsertPriceAlertHistory = typeof priceAlertHistory.$inferInsert;
