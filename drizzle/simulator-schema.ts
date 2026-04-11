import {
  int,
  varchar,
  decimal,
  timestamp,
  text,
  mysqlEnum,
  mysqlTable,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Virtual portfolios for paper trading
 */
export const simulatorPortfolios = mysqlTable(
  "simulator_portfolios",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    initialCapital: decimal("initialCapital", { precision: 15, scale: 2 }).notNull(),
    currentCash: decimal("currentCash", { precision: 15, scale: 2 }).notNull(),
    totalValue: decimal("totalValue", { precision: 15, scale: 2 }).notNull(),
    status: mysqlEnum("status", ["active", "archived", "deleted"]).default("active").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("simulator_portfolios_userId_idx").on(table.userId),
  })
);

export type SimulatorPortfolio = typeof simulatorPortfolios.$inferSelect;
export type InsertSimulatorPortfolio = typeof simulatorPortfolios.$inferInsert;

/**
 * Open positions in simulator portfolios
 */
export const simulatorPositions = mysqlTable(
  "simulator_positions",
  {
    id: int("id").autoincrement().primaryKey(),
    portfolioId: int("portfolioId").notNull(),
    ticker: varchar("ticker", { length: 10 }).notNull(),
    quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
    entryPrice: decimal("entryPrice", { precision: 15, scale: 4 }).notNull(),
    currentPrice: decimal("currentPrice", { precision: 15, scale: 4 }).notNull(),
    totalCost: decimal("totalCost", { precision: 15, scale: 2 }).notNull(),
    currentValue: decimal("currentValue", { precision: 15, scale: 2 }).notNull(),
    unrealizedPnL: decimal("unrealizedPnL", { precision: 15, scale: 2 }).notNull(),
    unrealizedPnLPercent: decimal("unrealizedPnLPercent", { precision: 8, scale: 2 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    portfolioIdIdx: index("simulator_positions_portfolioId_idx").on(table.portfolioId),
  })
);

export type SimulatorPosition = typeof simulatorPositions.$inferSelect;
export type InsertSimulatorPosition = typeof simulatorPositions.$inferInsert;

/**
 * Trade history (both open and closed trades)
 */
export const simulatorTrades = mysqlTable(
  "simulator_trades",
  {
    id: int("id").autoincrement().primaryKey(),
    portfolioId: int("portfolioId").notNull(),
    ticker: varchar("ticker", { length: 10 }).notNull(),
    type: mysqlEnum("type", ["buy", "sell"]).notNull(),
    quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
    price: decimal("price", { precision: 15, scale: 4 }).notNull(),
    commission: decimal("commission", { precision: 15, scale: 2 }).notNull(),
    totalCost: decimal("totalCost", { precision: 15, scale: 2 }).notNull(),
    status: mysqlEnum("status", ["executed", "pending", "cancelled"]).default("executed").notNull(),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    portfolioIdIdx: index("simulator_trades_portfolioId_idx").on(table.portfolioId),
    tickerIdx: index("simulator_trades_ticker_idx").on(table.ticker),
  })
);

export type SimulatorTrade = typeof simulatorTrades.$inferSelect;
export type InsertSimulatorTrade = typeof simulatorTrades.$inferInsert;

/**
 * Closed trades with realized P&L
 */
export const simulatorClosedTrades = mysqlTable(
  "simulator_closed_trades",
  {
    id: int("id").autoincrement().primaryKey(),
    portfolioId: int("portfolioId").notNull(),
    ticker: varchar("ticker", { length: 10 }).notNull(),
    buyTradeId: int("buyTradeId").notNull(),
    sellTradeId: int("sellTradeId").notNull(),
    quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
    entryPrice: decimal("entryPrice", { precision: 15, scale: 4 }).notNull(),
    exitPrice: decimal("exitPrice", { precision: 15, scale: 4 }).notNull(),
    realizedPnL: decimal("realizedPnL", { precision: 15, scale: 2 }).notNull(),
    realizedPnLPercent: decimal("realizedPnLPercent", { precision: 8, scale: 2 }).notNull(),
    holdingDays: int("holdingDays").notNull(),
    entryDate: timestamp("entryDate").notNull(),
    exitDate: timestamp("exitDate").notNull(),
  },
  (table) => ({
    portfolioIdIdx: index("simulator_closed_trades_portfolioId_idx").on(table.portfolioId),
  })
);

export type SimulatorClosedTrade = typeof simulatorClosedTrades.$inferSelect;
export type InsertSimulatorClosedTrade = typeof simulatorClosedTrades.$inferInsert;

/**
 * Portfolio performance snapshots (daily)
 */
export const simulatorPerformance = mysqlTable(
  "simulator_performance",
  {
    id: int("id").autoincrement().primaryKey(),
    portfolioId: int("portfolioId").notNull(),
    date: timestamp("date").notNull(),
    totalValue: decimal("totalValue", { precision: 15, scale: 2 }).notNull(),
    totalReturn: decimal("totalReturn", { precision: 8, scale: 2 }).notNull(),
    dailyReturn: decimal("dailyReturn", { precision: 8, scale: 2 }).notNull(),
    cumulativeReturn: decimal("cumulativeReturn", { precision: 8, scale: 2 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    portfolioIdIdx: index("simulator_performance_portfolioId_idx").on(table.portfolioId),
    dateIdx: index("simulator_performance_date_idx").on(table.date),
  })
);

export type SimulatorPerformance = typeof simulatorPerformance.$inferSelect;
export type InsertSimulatorPerformance = typeof simulatorPerformance.$inferInsert;
