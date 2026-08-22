import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json, bigint } from "drizzle-orm/mysql-core";

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
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "STARTER", "PRO", "ELITE"]).default("free"),
  subscriptionStatus: varchar("subscriptionStatus", { length: 50 }),
  subscriptionStartedAt: timestamp("subscriptionStartedAt"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Watchlist table - stocks users are tracking
 */
export const watchlistItems = mysqlTable("watchlist_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  symbol: varchar("symbol", { length: 10 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
});

export type WatchlistItem = typeof watchlistItems.$inferSelect;
export type InsertWatchlistItem = typeof watchlistItems.$inferInsert;

/**
 * Portfolio table - user's paper trading portfolio
 */
export const portfolios = mysqlTable("portfolios", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  cashBalance: decimal("cashBalance", { precision: 15, scale: 2 }).notNull().default("10000"),
  totalValue: decimal("totalValue", { precision: 15, scale: 2 }).notNull().default("10000"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = typeof portfolios.$inferInsert;

/**
 * Positions table - individual stock holdings in a portfolio
 */
export const positions = mysqlTable("positions", {
  id: int("id").autoincrement().primaryKey(),
  portfolioId: int("portfolioId").notNull(),
  symbol: varchar("symbol", { length: 10 }).notNull(),
  shares: decimal("shares", { precision: 18, scale: 8 }).notNull(), // Support fractional shares
  averageCost: decimal("averageCost", { precision: 15, scale: 2 }).notNull(),
  currentPrice: decimal("currentPrice", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Position = typeof positions.$inferSelect;
export type InsertPosition = typeof positions.$inferInsert;

/**
 * Orders table - buy/sell orders in paper trading
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  portfolioId: int("portfolioId").notNull(),
  symbol: varchar("symbol", { length: 10 }).notNull(),
  type: mysqlEnum("type", ["buy", "sell"]).notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 8 }).notNull(), // Fractional shares
  price: decimal("price", { precision: 15, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "executed", "cancelled"]).default("pending").notNull(),
  orderType: mysqlEnum("orderType", ["market", "limit", "stop"]).default("market").notNull(),
  stopPrice: decimal("stopPrice", { precision: 15, scale: 2 }),
  executedAt: timestamp("executedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Trades table - executed trades history
 */
export const trades = mysqlTable("trades", {
  id: int("id").autoincrement().primaryKey(),
  portfolioId: int("portfolioId").notNull(),
  symbol: varchar("symbol", { length: 10 }).notNull(),
  type: mysqlEnum("type", ["buy", "sell"]).notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 8 }).notNull(),
  price: decimal("price", { precision: 15, scale: 2 }).notNull(),
  commission: decimal("commission", { precision: 10, scale: 2 }).default("0"),
  executedAt: timestamp("executedAt").defaultNow().notNull(),
});

export type Trade = typeof trades.$inferSelect;
export type InsertTrade = typeof trades.$inferInsert;

/**
 * Backtests table - backtest configurations and results
 */
export const backtests = mysqlTable("backtests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  symbol: varchar("symbol", { length: 10 }).notNull(),
  strategy: varchar("strategy", { length: 50 }).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  initialCapital: decimal("initialCapital", { precision: 15, scale: 2 }).notNull(),
  finalValue: decimal("finalValue", { precision: 15, scale: 2 }),
  totalReturn: decimal("totalReturn", { precision: 10, scale: 2 }),
  sharpeRatio: decimal("sharpeRatio", { precision: 10, scale: 4 }),
  maxDrawdown: decimal("maxDrawdown", { precision: 10, scale: 2 }),
  winRate: decimal("winRate", { precision: 10, scale: 2 }),
  totalTrades: int("totalTrades"),
  dividendIncome: decimal("dividendIncome", { precision: 15, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Backtest = typeof backtests.$inferSelect;
export type InsertBacktest = typeof backtests.$inferInsert;

/**
 * Intraday data table - 15-minute candle data for charting
 */
export const intradayData = mysqlTable("intraday_data", {
  id: int("id").autoincrement().primaryKey(),
  symbol: varchar("symbol", { length: 10 }).notNull(),
  timestamp: timestamp("timestamp").notNull(),
  open: decimal("open", { precision: 15, scale: 2 }).notNull(),
  high: decimal("high", { precision: 15, scale: 2 }).notNull(),
  low: decimal("low", { precision: 15, scale: 2 }).notNull(),
  close: decimal("close", { precision: 15, scale: 2 }).notNull(),
  volume: int("volume").notNull(),
});

export type IntradayData = typeof intradayData.$inferSelect;
export type InsertIntradayData = typeof intradayData.$inferInsert;

/**
 * Technical indicators table - SMA, EMA, RSI values
 */
export const technicalIndicators = mysqlTable("technical_indicators", {
  id: int("id").autoincrement().primaryKey(),
  symbol: varchar("symbol", { length: 10 }).notNull(),
  timestamp: timestamp("timestamp").notNull(),
  sma20: decimal("sma20", { precision: 15, scale: 2 }),
  sma50: decimal("sma50", { precision: 15, scale: 2 }),
  ema12: decimal("ema12", { precision: 15, scale: 2 }),
  ema26: decimal("ema26", { precision: 15, scale: 2 }),
  rsi14: decimal("rsi14", { precision: 10, scale: 2 }),
});

export type TechnicalIndicator = typeof technicalIndicators.$inferSelect;
export type InsertTechnicalIndicator = typeof technicalIndicators.$inferInsert;

/**
 * Events table - earnings and news events for filtering
 */
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  symbol: varchar("symbol", { length: 10 }).notNull(),
  eventType: mysqlEnum("eventType", ["earnings", "news", "dividend", "split"]).notNull(),
  eventDate: timestamp("eventDate").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  impact: mysqlEnum("impact", ["low", "medium", "high"]).default("medium"),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Trade signals table - AI-generated trading signals
 */
export const tradeSignals = mysqlTable("trade_signals", {
  id: int("id").autoincrement().primaryKey(),
  symbol: varchar("symbol", { length: 10 }).notNull(),
  signalType: mysqlEnum("signalType", ["buy", "sell", "hold"]).notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(), // 0-100
  reasoning: text("reasoning"),
  technicalFactors: json("technicalFactors"),
  suppressedByEvent: boolean("suppressedByEvent").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TradeSignal = typeof tradeSignals.$inferSelect;
export type InsertTradeSignal = typeof tradeSignals.$inferInsert;

/**
 * Dividends table - dividend payments for portfolio tracking
 */
export const dividends = mysqlTable("dividends", {
  id: int("id").autoincrement().primaryKey(),
  symbol: varchar("symbol", { length: 10 }).notNull(),
  exDate: timestamp("exDate").notNull(),
  paymentDate: timestamp("paymentDate").notNull(),
  dividendPerShare: decimal("dividendPerShare", { precision: 10, scale: 4 }).notNull(),
});

export type Dividend = typeof dividends.$inferSelect;
export type InsertDividend = typeof dividends.$inferInsert;

// ─── Missing tables required by server/db.ts and server/routers/* ─────────────

/**
 * stocks table - master list of tracked stocks
 */
export const stocks = mysqlTable("stocks", {
  id: int("id").autoincrement().primaryKey(),
  ticker: varchar("ticker", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  exchange: varchar("exchange", { length: 50 }).notNull(),
  type: mysqlEnum("type", ["equity", "etf"]).notNull().default("equity"),
  currency: varchar("currency", { length: 10 }).notNull().default("USD"),
  sector: varchar("sector", { length: 100 }),
  industry: varchar("industry", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Stock = typeof stocks.$inferSelect;
export type InsertStock = typeof stocks.$inferInsert;

/**
 * priceHistory table - daily OHLCV data per stock
 */
export const priceHistory = mysqlTable("price_history", {
  id: int("id").autoincrement().primaryKey(),
  stockId: int("stockId").notNull(),
  date: timestamp("date").notNull(),
  open: int("open").notNull(),   // stored as cents
  high: int("high").notNull(),
  low: int("low").notNull(),
  close: int("close").notNull(),
  volume: int("volume").notNull(),
  adjClose: int("adjClose"),
});

export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = typeof priceHistory.$inferInsert;

/**
 * watchlists table - per-user stock watchlist with alert preferences
 */
export const watchlists = mysqlTable("watchlists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stockId: int("stockId").notNull(),
  label: varchar("label", { length: 100 }),
  alertOnBuy: int("alertOnBuy").default(1).notNull(),
  alertOnSell: int("alertOnSell").default(1).notNull(),
  minConfidenceThreshold: int("minConfidenceThreshold").default(60),
  emailNotifications: int("emailNotifications").default(0),
  inAppNotifications: int("inAppNotifications").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Watchlist = typeof watchlists.$inferSelect;
export type InsertWatchlist = typeof watchlists.$inferInsert;

/**
 * signals table - AI-generated buy/sell signals per stock
 */
export const signals = mysqlTable("signals", {
  id: int("id").autoincrement().primaryKey(),
  stockId: int("stockId").notNull(),
  type: mysqlEnum("type", ["buy", "sell", "hold"]).notNull(),
  confidenceScore: int("confidenceScore").notNull(),
  priceAtSignal: decimal("priceAtSignal", { precision: 15, scale: 2 }),
  indicators: json("indicators"),
  analysis: text("analysis"),
  status: mysqlEnum("status", ["active", "expired", "triggered"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Signal = typeof signals.$inferSelect;
export type InsertSignal = typeof signals.$inferInsert;

/**
 * notifications table - in-app notifications for signal alerts
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  signalId: int("signalId"),
  ticker: varchar("ticker", { length: 10 }),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  isRead: int("isRead").default(0).notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * userPreferences table - per-user app preferences
 */
export const userPreferences = mysqlTable("user_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  preferredExchanges: json("preferredExchanges"),
  preferredSectors: json("preferredSectors"),
  riskTolerance: mysqlEnum("riskTolerance", ["low", "medium", "high"]).default("medium"),
  defaultTimeframe: varchar("defaultTimeframe", { length: 20 }).default("1y"),
  autoRefresh: int("autoRefresh").default(1),
  showTechnicalIndicators: int("showTechnicalIndicators").default(1),
  showSentiment: int("showSentiment").default(1),
  notificationFrequency: mysqlEnum("notificationFrequency", ["realtime", "daily", "weekly"]).default("realtime"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

/**
 * signalAlerts table - user-created alert rules for signals
 */
export const signalAlerts = mysqlTable("signal_alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stockId: int("stockId").notNull(),
  signalType: mysqlEnum("signalType", ["buy", "sell", "hold"]).notNull(),
  confidence: int("confidence").notNull(),
  price: decimal("price", { precision: 15, scale: 2 }),
  status: mysqlEnum("status", ["pending", "sent", "dismissed"]).default("pending").notNull(),
  notificationChannels: json("notificationChannels"),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SignalAlert = typeof signalAlerts.$inferSelect;
export type InsertSignalAlert = typeof signalAlerts.$inferInsert;

/**
 * alertPreferences table - per-stock alert configuration for a user
 */
export const alertPreferences = mysqlTable("alert_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stockId: int("stockId").notNull(),
  minBuyConfidence: int("minBuyConfidence").default(60),
  minSellConfidence: int("minSellConfidence").default(60),
  enableBuyAlerts: int("enableBuyAlerts").default(1),
  enableSellAlerts: int("enableSellAlerts").default(1),
  enableSentimentAlerts: int("enableSentimentAlerts").default(0),
  notificationChannels: json("notificationChannels"),
  enablePushNotifications: int("enablePushNotifications").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AlertPreference = typeof alertPreferences.$inferSelect;
export type InsertAlertPreference = typeof alertPreferences.$inferInsert;

/**
 * userAlertSettings table - account-wide alert delivery settings.
 * Per-stock alert rules remain in alertPreferences; this table stores the
 * settings controlled from the user-facing Alert Preferences page.
 */
export const userAlertSettings = mysqlTable("user_alert_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  minBuyConfidence: int("minBuyConfidence").default(60).notNull(),
  minSellConfidence: int("minSellConfidence").default(60).notNull(),
  enableEmailAlerts: int("enableEmailAlerts").default(0).notNull(),
  enablePushAlerts: int("enablePushAlerts").default(0).notNull(),
  enableInAppAlerts: int("enableInAppAlerts").default(1).notNull(),
  quietHoursStart: varchar("quietHoursStart", { length: 5 }).default("22:00").notNull(),
  quietHoursEnd: varchar("quietHoursEnd", { length: 5 }).default("08:00").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserAlertSettings = typeof userAlertSettings.$inferSelect;
export type InsertUserAlertSettings = typeof userAlertSettings.$inferInsert;

/**
 * priceAlerts table - user-defined price target alerts
 */
export const priceAlerts = mysqlTable("price_alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stockId: int("stockId").notNull(),
  targetPrice: decimal("targetPrice", { precision: 15, scale: 2 }).notNull(),
  alertType: mysqlEnum("alertType", ["above", "below", "percent_change"]).notNull(),
  status: mysqlEnum("status", ["active", "triggered", "cancelled"]).default("active").notNull(),
  enableBrowserNotification: int("enableBrowserNotification").default(1),
  enableEmailNotification: int("enableEmailNotification").default(0),
  triggerCount: int("triggerCount").default(0),
  lastTriggeredPrice: decimal("lastTriggeredPrice", { precision: 15, scale: 2 }),
  lastTriggeredAt: timestamp("lastTriggeredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PriceAlert = typeof priceAlerts.$inferSelect;
export type InsertPriceAlert = typeof priceAlerts.$inferInsert;

/**
 * priceAlertHistory table - log of triggered price alerts
 */
export const priceAlertHistory = mysqlTable("price_alert_history", {
  id: int("id").autoincrement().primaryKey(),
  priceAlertId: int("priceAlertId").notNull(),
  userId: int("userId").notNull(),
  stockId: int("stockId").notNull(),
  triggerPrice: decimal("triggerPrice", { precision: 15, scale: 2 }).notNull(),
  targetPrice: decimal("targetPrice", { precision: 15, scale: 2 }).notNull(),
  alertType: varchar("alertType", { length: 30 }).notNull(),
  notificationChannels: json("notificationChannels"),
  notificationSent: int("notificationSent").default(0),
  triggeredAt: timestamp("triggeredAt").defaultNow().notNull(),
});

export type PriceAlertHistory = typeof priceAlertHistory.$inferSelect;
export type InsertPriceAlertHistory = typeof priceAlertHistory.$inferInsert;

/**
 * backtestRuns table - backtest job records
 */
export const backtestRuns = mysqlTable("backtest_runs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  initialCapital: decimal("initialCapital", { precision: 15, scale: 2 }).notNull(),
  finalCapital: decimal("finalCapital", { precision: 15, scale: 2 }),
  totalReturn: decimal("totalReturn", { precision: 10, scale: 4 }),
  winRate: decimal("winRate", { precision: 10, scale: 4 }),
  sharpeRatio: decimal("sharpeRatio", { precision: 10, scale: 4 }),
  maxDrawdown: decimal("maxDrawdown", { precision: 10, scale: 4 }),
  totalTrades: int("totalTrades"),
  winningTrades: int("winningTrades"),
  avgWin: decimal("avgWin", { precision: 15, scale: 2 }),
  avgLoss: decimal("avgLoss", { precision: 15, scale: 2 }),
  profitFactor: decimal("profitFactor", { precision: 10, scale: 4 }),
  stockIds: json("stockIds"),
  filterSettings: json("filterSettings"),
  status: mysqlEnum("status", ["running", "completed", "failed"]).default("running").notNull(),
  errorMessage: text("errorMessage"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BacktestRun = typeof backtestRuns.$inferSelect;
export type InsertBacktestRun = typeof backtestRuns.$inferInsert;

/**
 * backtestTrades table - individual trades within a backtest run
 */
export const backtestTrades = mysqlTable("backtest_trades", {
  id: int("id").autoincrement().primaryKey(),
  backtestRunId: int("backtestRunId").notNull(),
  stockId: int("stockId").notNull(),
  type: mysqlEnum("type", ["buy", "sell"]).notNull(),
  entryDate: timestamp("entryDate").notNull(),
  entryPrice: decimal("entryPrice", { precision: 15, scale: 2 }).notNull(),
  exitDate: timestamp("exitDate"),
  exitPrice: decimal("exitPrice", { precision: 15, scale: 2 }),
  quantity: int("quantity").notNull(),
  profitLoss: decimal("profitLoss", { precision: 15, scale: 2 }),
  returnPercent: decimal("returnPercent", { precision: 10, scale: 4 }),
  exitReason: varchar("exitReason", { length: 50 }),
  signalConfidence: int("signalConfidence"),
});

export type BacktestTrade = typeof backtestTrades.$inferSelect;
export type InsertBacktestTrade = typeof backtestTrades.$inferInsert;

/**
 * stockSentiment table - aggregated sentiment scores per stock
 */
export const stockSentiment = mysqlTable("stock_sentiment", {
  id: int("id").autoincrement().primaryKey(),
  stockId: int("stockId").notNull(),
  sentimentScore: int("sentimentScore").notNull(),  // stored as integer * 100
  confidence: int("confidence").notNull(),
  articleCount: int("articleCount").notNull(),
  classification: mysqlEnum("classification", ["very_positive", "positive", "neutral", "negative", "very_negative"]).notNull(),
  analysisDate: timestamp("analysisDate").defaultNow().notNull(),
});

export type StockSentiment = typeof stockSentiment.$inferSelect;
export type InsertStockSentiment = typeof stockSentiment.$inferInsert;

/**
 * newsArticles table - individual news articles with sentiment scores
 */
export const newsArticles = mysqlTable("news_articles", {
  id: int("id").autoincrement().primaryKey(),
  stockId: int("stockId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  content: text("content"),
  url: varchar("url", { length: 1000 }).unique(),
  source: varchar("source", { length: 100 }),
  sentimentScore: int("sentimentScore"),  // stored as integer * 100
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NewsArticle = typeof newsArticles.$inferSelect;
export type InsertNewsArticle = typeof newsArticles.$inferInsert;

// ─── Stripe / subscription columns on users (added via migration) ─────────────
// stripeWebhook.ts references users.stripeCustomerId and users.subscriptionTier.
// These are added to the users table via SQL migration below; the schema type
// is extended here so TypeScript is happy.
// NOTE: Run the migration SQL before deploying.

/**
 * Blog posts table - stores all blog articles
 */
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  author: varchar("author", { length: 100 }).notNull().default("Manus AI"),
  date: varchar("date", { length: 50 }).notNull(),
  readTime: varchar("readTime", { length: 20 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  tags: json("tags").notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }).notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;


/**
 * Social Media Scheduler - Schedule posts on Reddit and Twitter
 */
export const socialMediaPosts = mysqlTable("social_media_posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  platform: mysqlEnum("platform", ["reddit", "twitter"]).notNull(),
  title: text("title"),
  content: text("content").notNull(),
  subreddit: varchar("subreddit", { length: 255 }), // For Reddit posts
  tags: text("tags"), // JSON array of tags/hashtags
  scheduledAt: timestamp("scheduledAt").notNull(),
  postedAt: timestamp("postedAt"),
  status: mysqlEnum("status", ["scheduled", "posted", "failed", "draft"]).default("draft").notNull(),
  postUrl: varchar("postUrl", { length: 500 }), // URL of posted content
  views: int("views").default(0),
  engagement: int("engagement").default(0), // upvotes + comments + shares
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialMediaPost = typeof socialMediaPosts.$inferSelect;
export type InsertSocialMediaPost = typeof socialMediaPosts.$inferInsert;

/**
 * Social Media Templates - Reusable content templates
 */
export const socialMediaTemplates = mysqlTable("social_media_templates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  platform: mysqlEnum("platform", ["reddit", "twitter"]).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // e.g., "signal_alert", "educational", "user_win"
  template: text("template").notNull(), // Template with {{variables}}
  description: text("description"),
  isPublic: boolean("isPublic").default(false), // Share with other users
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialMediaTemplate = typeof socialMediaTemplates.$inferSelect;
export type InsertSocialMediaTemplate = typeof socialMediaTemplates.$inferInsert;

/**
 * Social Media Accounts - Connected Reddit/Twitter accounts
 */
export const socialMediaAccounts = mysqlTable("social_media_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  platform: mysqlEnum("platform", ["reddit", "twitter"]).notNull(),
  accountName: varchar("accountName", { length: 255 }).notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  expiresAt: timestamp("expiresAt"),
  isConnected: boolean("isConnected").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialMediaAccount = typeof socialMediaAccounts.$inferSelect;
export type InsertSocialMediaAccount = typeof socialMediaAccounts.$inferInsert;

/**
 * Social Media Analytics - Track performance of posts
 */
export const socialMediaAnalytics = mysqlTable("social_media_analytics", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  platform: mysqlEnum("platform", ["reddit", "twitter"]).notNull(),
  views: int("views").default(0),
  clicks: int("clicks").default(0),
  upvotes: int("upvotes").default(0),
  comments: int("comments").default(0),
  shares: int("shares").default(0),
  engagement: int("engagement").default(0), // upvotes + comments + shares
  engagementRate: decimal("engagementRate", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialMediaAnalytic = typeof socialMediaAnalytics.$inferSelect;
export type InsertSocialMediaAnalytic = typeof socialMediaAnalytics.$inferInsert;

/**
 * Referral programme - unique referral codes and tracking
 */
export const referralCodes = mysqlTable("referral_codes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  totalReferrals: int("totalReferrals").default(0).notNull(),
  totalCreditsEarned: int("totalCreditsEarned").default(0).notNull(), // in days of free subscription
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ReferralCode = typeof referralCodes.$inferSelect;
export type InsertReferralCode = typeof referralCodes.$inferInsert;

/**
 * Referral conversions - tracks who signed up via a referral link
 */
export const referralConversions = mysqlTable("referral_conversions", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrerId").notNull(), // user who owns the referral code
  referredUserId: int("referredUserId").notNull().unique(), // new user who signed up
  code: varchar("code", { length: 20 }).notNull(),
  status: mysqlEnum("status", ["pending", "converted", "credited"]).default("pending").notNull(),
  creditsAwarded: int("creditsAwarded").default(0).notNull(), // days credited to referrer
  convertedAt: timestamp("convertedAt"),
  creditedAt: timestamp("creditedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ReferralConversion = typeof referralConversions.$inferSelect;
export type InsertReferralConversion = typeof referralConversions.$inferInsert;

// ─── Onboarding Email Sequence ────────────────────────────────────────────────
export const onboardingEmailQueue = mysqlTable("onboarding_email_queue", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull().default(""),
  stepNumber: int("step_number").notNull(), // 1–7
  scheduledAt: bigint("scheduled_at", { mode: "number" }).notNull(), // UTC ms
  sentAt: bigint("sent_at", { mode: "number" }),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending | sent | failed | unsubscribed
  errorMessage: text("error_message"),
  createdAt: bigint("created_at", { mode: "number" }).notNull().$defaultFn(() => Date.now()),
});

export const onboardingUnsubscribes = mysqlTable("onboarding_unsubscribes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  unsubscribedAt: bigint("unsubscribed_at", { mode: "number" }).notNull().$defaultFn(() => Date.now()),
});
