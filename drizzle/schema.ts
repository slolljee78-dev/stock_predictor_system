import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
  
  // Trial fields for freemium model
  trialStartedAt: timestamp("trialStartedAt"),
  trialExpiresAt: timestamp("trialExpiresAt"),
  watchlistCount: int("watchlistCount").default(0),
  
  // Risk strategy preference for signal generation
  riskStrategy: mysqlEnum("riskStrategy", ["cautious", "balanced", "high_risk"]).default("balanced").notNull(),
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
 * Watchlist groups - named collections for organizing stocks by trading strategy
 * Allows users to create multiple watchlists like "Tech Stocks", "Dividend Plays", etc.
 */
export const watchlistGroups = mysqlTable("watchlistGroups", {
  id: int("id").autoincrement().primaryKey(),
  /** Foreign key to users table */
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  /** User's custom name for this watchlist group (e.g., "Tech Stocks", "Dividend Plays") */
  name: varchar("name", { length: 100 }).notNull(),
  /** Optional description of the watchlist's purpose */
  description: text("description"),
  /** Display order for watchlists */
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WatchlistGroup = typeof watchlistGroups.$inferSelect;
export type InsertWatchlistGroup = typeof watchlistGroups.$inferInsert;

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
  /** Display order within watchlist group for drag-and-drop reordering */
  displayOrder: int("displayOrder").default(0).notNull(),
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
 * Payments table - tracks Stripe payment transactions
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  /** Foreign key to users table */
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  /** Payment amount in cents (e.g., 2999 = £29.99) */
  amount: int("amount").notNull(),
  /** Currency code (GBP, USD, EUR) */
  currency: varchar("currency", { length: 3 }).default("GBP").notNull(),
  /** Subscription tier: STARTER, PRO, ELITE */
  tier: mysqlEnum("tier", ["STARTER", "PRO", "ELITE"]).notNull(),
  /** Payment status: pending, succeeded, failed, refunded */
  status: mysqlEnum("status", ["pending", "succeeded", "failed", "refunded"]).default("pending").notNull(),
  /** Stripe Payment Intent ID for reference */
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).unique(),
  /** Description of payment (e.g., "Stock Predictor - Pro Plan (Monthly)") */
  description: text("description"),
  /** When payment was completed */
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Invoices table - stores generated invoices for payments
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  /** Foreign key to users table */
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  /** Foreign key to payments table */
  paymentId: int("paymentId").references(() => payments.id, { onDelete: "set null" }),
  /** Invoice number (e.g., INV-2026-001) */
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).unique().notNull(),
  /** Invoice amount in cents */
  amount: int("amount").notNull(),
  /** Invoice status: draft, sent, paid, overdue, cancelled */
  status: mysqlEnum("status", ["draft", "sent", "paid", "overdue", "cancelled"]).default("draft").notNull(),
  /** Issue date */
  issueDate: timestamp("issueDate").notNull(),
  /** Due date */
  dueDate: timestamp("dueDate").notNull(),
  /** When invoice was paid */
  paidDate: timestamp("paidDate"),
  /** Invoice PDF URL (stored in S3) */
  pdfUrl: text("pdfUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

/**
 * Broker accounts table - stores linked broker connections
 */
export const brokerAccounts = mysqlTable("brokerAccounts", {
  id: int("id").autoincrement().primaryKey(),
  /** Foreign key to users table */
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  /** Broker type: TRADING_212, ALPACA, INTERACTIVE_BROKERS */
  brokerType: mysqlEnum("brokerType", ["TRADING_212", "ALPACA", "INTERACTIVE_BROKERS"]).notNull(),
  /** User-friendly account name */
  accountName: varchar("accountName", { length: 100 }).notNull(),
  /** Encrypted API credentials (AES-256) */
  encryptedCredentials: text("encryptedCredentials").notNull(),
  /** Account status: active, inactive, error */
  status: mysqlEnum("status", ["active", "inactive", "error"]).default("active").notNull(),
  /** Last error message if status is error */
  lastError: text("lastError"),
  /** Last successful sync timestamp */
  lastSyncedAt: timestamp("lastSyncedAt"),
  /** Account balance in cents (cached from broker) */
  cachedBalance: int("cachedBalance"),
  /** Number of open positions */
  positionCount: int("positionCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BrokerAccount = typeof brokerAccounts.$inferSelect;
export type InsertBrokerAccount = typeof brokerAccounts.$inferInsert;

/**
 * Portfolio templates table - stores reusable portfolio templates
 */
export const portfolioTemplates = mysqlTable("portfolioTemplates", {
  id: int("id").autoincrement().primaryKey(),
  /** Foreign key to users table (creator) */
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  /** Template name */
  name: varchar("name", { length: 100 }).notNull(),
  /** Template description */
  description: text("description"),
  /** Template category: TECH_GROWTH, DIVIDEND_INCOME, BALANCED, CUSTOM */
  category: mysqlEnum("category", ["TECH_GROWTH", "DIVIDEND_INCOME", "BALANCED", "CUSTOM"]).default("CUSTOM").notNull(),
  /** Holdings as JSON array [{symbol, weight, shares}, ...] */
  holdings: text("holdings").notNull(), // JSON
  /** Whether template is public for other users */
  isPublic: int("isPublic").default(0).notNull(),
  /** Number of times this template has been used */
  usageCount: int("usageCount").default(0).notNull(),
  /** Average rating (0-5) */
  averageRating: int("averageRating").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PortfolioTemplate = typeof portfolioTemplates.$inferSelect;
export type InsertPortfolioTemplate = typeof portfolioTemplates.$inferInsert;

/**
 * Notification preferences table - per-stock notification settings
 */
export const notificationPreferences = mysqlTable("notificationPreferences", {
  id: int("id").autoincrement().primaryKey(),
  /** Foreign key to users table */
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  /** Stock ticker symbol */
  symbol: varchar("symbol", { length: 20 }).notNull(),
  /** Notification channels: email, push, inApp (JSON array) */
  channels: text("channels").notNull(), // JSON: ["email", "push", "inApp"]
  /** Trigger types: buySignal, sellSignal, priceAlert, newsAlert (JSON array) */
  triggers: text("triggers").notNull(), // JSON: ["buySignal", "sellSignal"]
  /** Minimum confidence threshold for signals (0-100) */
  minConfidence: int("minConfidence").default(60).notNull(),
  /** Price alert threshold (in cents) */
  priceAlertThreshold: int("priceAlertThreshold"),
  /** Whether this preference is enabled */
  isEnabled: int("isEnabled").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;
