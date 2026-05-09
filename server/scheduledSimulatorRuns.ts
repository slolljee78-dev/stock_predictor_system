import mysql from "mysql2/promise";

import { executeAutoTradingRound, type AutoTradingRoundResponse, type ExecutedAutoTrade } from "./autoTradingRoundService";

export type ScheduledRunDurationDays = 1 | 3 | 7;
export type ScheduledRunStatus = "active" | "completed" | "cancelled";
export type ScheduledRiskProfileId = "conservative" | "balanced" | "aggressive";

export interface ScheduledSimulatorPosition {
  ticker: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export interface ScheduledSimulatorTrade {
  id: number;
  ticker: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  date: string;
  executedAt?: string;
  priceSource: "live" | "fallback";
  origin?: "manual" | "auto";
  confidence?: number;
  reasoning?: string;
  riskProfile?: ScheduledRiskProfileId;
}

export interface ScheduledSimulatorPortfolio {
  id: number;
  name: string;
  initialCapital: number;
  currentValue: number;
  cash: number;
  totalReturn: number;
  totalReturnPercent: number;
  positions: ScheduledSimulatorPosition[];
  trades: ScheduledSimulatorTrade[];
}

export interface ScheduledRunSettings {
  durationDays: ScheduledRunDurationDays;
  riskProfileId: ScheduledRiskProfileId;
  universeSize: number;
  minConfidence: number;
  maxTradesPerRound: number;
  positionSizePercent: number;
}

export interface ScheduledSimulatorRoundLogEntry {
  runAt: string;
  scannedCount: number;
  scannedTickers: string[];
  actionableSignalsCount: number;
  actionableBuySignals: number;
  actionableSellSignals: number;
  executedTradesCount: number;
  buyTrades: number;
  sellTrades: number;
  summary: string;
}

export interface ScheduledSimulatorRunRecord {
  id: number;
  userId: number;
  status: ScheduledRunStatus;
  durationDays: ScheduledRunDurationDays;
  riskProfileId: ScheduledRiskProfileId;
  universeSize: number;
  minConfidence: number;
  maxTradesPerRound: number;
  positionSizePercent: number;
  portfolio: ScheduledSimulatorPortfolio;
  selectedUniverse: string[];
  lastRound: AutoTradingRoundResponse | null;
  roundHistory: ScheduledSimulatorRoundLogEntry[];
  lastSummary: string | null;
  startedAt: string | null;
  endsAt: string | null;
  nextRunAt: string | null;
  lastRunAt: string | null;
  totalRoundsCompleted: number;
  totalTradesExecuted: number;
}

interface ScheduledRunRow {
  id: number;
  userId: number;
  status: ScheduledRunStatus;
  durationDays: number;
  riskProfileId: ScheduledRiskProfileId;
  universeSize: number;
  minConfidence: number;
  maxTradesPerRound: number;
  positionSizePercent: number;
  portfolioJson: string;
  selectedUniverseJson: string | null;
  lastRoundJson: string | null;
  roundHistoryJson: string | null;
  lastSummary: string | null;
  startedAt: Date | null;
  endsAt: Date | null;
  nextRunAt: Date | null;
  lastRunAt: Date | null;
  totalRoundsCompleted: number;
  totalTradesExecuted: number;
}

function requireDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error("Database connection is not configured.");
  }

  return process.env.DATABASE_URL;
}

async function withConnection<T>(work: (connection: mysql.Connection) => Promise<T>): Promise<T> {
  const connection = await mysql.createConnection(requireDatabaseUrl());

  try {
    return await work(connection);
  } finally {
    await connection.end();
  }
}

function safeParseJson<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function asIsoString(value: Date | null) {
  return value ? value.toISOString() : null;
}

function formatExecutionTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Auto trade";
  }

  return parsed.toLocaleString();
}

function applyExecutedTradesToPortfolio(
  portfolio: ScheduledSimulatorPortfolio,
  executedTrades: ExecutedAutoTrade[],
  riskProfileId: ScheduledRiskProfileId,
): ScheduledSimulatorPortfolio {
  if (executedTrades.length === 0) {
    return portfolio;
  }

  let nextPortfolio: ScheduledSimulatorPortfolio = {
    ...portfolio,
    positions: portfolio.positions.map((position) => ({ ...position })),
    trades: portfolio.trades.map((trade) => ({ ...trade })),
  };

  let nextTradeId = nextPortfolio.trades.length > 0
    ? Math.max(...nextPortfolio.trades.map((trade) => trade.id)) + 1
    : 1;

  for (const trade of executedTrades) {
    const existingPosition = nextPortfolio.positions.find((position) => position.ticker === trade.ticker);

    if (trade.type === "BUY") {
      if (existingPosition) {
        const totalCostBasis = existingPosition.entryPrice * existingPosition.quantity + trade.executedPrice * trade.quantity;
        const totalQuantity = existingPosition.quantity + trade.quantity;
        const averagePrice = totalCostBasis / totalQuantity;

        nextPortfolio.positions = nextPortfolio.positions.map((position) =>
          position.ticker === trade.ticker
            ? {
                ...position,
                quantity: totalQuantity,
                entryPrice: averagePrice,
                currentPrice: trade.executedPrice,
                unrealizedPnL: (trade.executedPrice - averagePrice) * totalQuantity,
                unrealizedPnLPercent: averagePrice > 0 ? ((trade.executedPrice - averagePrice) / averagePrice) * 100 : 0,
              }
            : position,
        );
      } else {
        nextPortfolio.positions = [
          ...nextPortfolio.positions,
          {
            ticker: trade.ticker,
            quantity: trade.quantity,
            entryPrice: trade.executedPrice,
            currentPrice: trade.executedPrice,
            unrealizedPnL: 0,
            unrealizedPnLPercent: 0,
          },
        ];
      }

      nextPortfolio.cash -= trade.totalCost;
    } else if (existingPosition) {
      const remainingQuantity = existingPosition.quantity - trade.quantity;
      if (remainingQuantity <= 0) {
        nextPortfolio.positions = nextPortfolio.positions.filter((position) => position.ticker !== trade.ticker);
      } else {
        nextPortfolio.positions = nextPortfolio.positions.map((position) =>
          position.ticker === trade.ticker
            ? {
                ...position,
                quantity: remainingQuantity,
                currentPrice: trade.executedPrice,
                unrealizedPnL: (trade.executedPrice - position.entryPrice) * remainingQuantity,
                unrealizedPnLPercent: position.entryPrice > 0 ? ((trade.executedPrice - position.entryPrice) / position.entryPrice) * 100 : 0,
              }
            : position,
        );
      }

      nextPortfolio.cash += trade.totalCost;
    }

    nextPortfolio.trades = [{
      id: nextTradeId,
      ticker: trade.ticker,
      type: trade.type === "BUY" ? "buy" : "sell",
      quantity: trade.quantity,
      price: trade.executedPrice,
      date: formatExecutionTime(trade.executionTime),
      executedAt: trade.executionTime,
      priceSource: trade.priceSource,
      origin: "auto",
      confidence: trade.confidence,
      reasoning: trade.reasoning,
      riskProfile: riskProfileId,
    }, ...nextPortfolio.trades];
    nextTradeId += 1;
  }

  const investedValue = nextPortfolio.positions.reduce((sum, position) => sum + position.currentPrice * position.quantity, 0);
  nextPortfolio.currentValue = nextPortfolio.cash + investedValue;
  nextPortfolio.totalReturn = nextPortfolio.currentValue - nextPortfolio.initialCapital;
  nextPortfolio.totalReturnPercent = nextPortfolio.initialCapital > 0
    ? (nextPortfolio.totalReturn / nextPortfolio.initialCapital) * 100
    : 0;

  return nextPortfolio;
}

function summarizeRound(round: AutoTradingRoundResponse) {
  const buyCount = round.executedTrades.filter((trade) => trade.type === "BUY").length;
  const sellCount = round.executedTrades.filter((trade) => trade.type === "SELL").length;
  const actionableCount = round.actionableSignals.length;

  return round.executedTrades.length > 0
    ? `Scheduled simulator found ${actionableCount} actionable signal${actionableCount === 1 ? "" : "s"} and executed ${round.executedTrades.length} virtual trade${round.executedTrades.length === 1 ? "" : "s"} across ${round.scannedCount} scanned stocks (${buyCount} buys, ${sellCount} sells).`
    : `Scheduled simulator scanned ${round.scannedCount} stocks, found ${actionableCount} actionable signal${actionableCount === 1 ? "" : "s"}, but no trade cleared the current confidence, sizing, and position rules.`;
}

function createRoundHistoryEntry(round: AutoTradingRoundResponse, summary: string): ScheduledSimulatorRoundLogEntry {
  const buyTrades = round.executedTrades.filter((trade) => trade.type === "BUY").length;
  const sellTrades = round.executedTrades.filter((trade) => trade.type === "SELL").length;
  const actionableBuySignals = round.actionableSignals.filter((signal) => signal.signalType === "buy").length;
  const actionableSellSignals = round.actionableSignals.filter((signal) => signal.signalType === "sell").length;

  return {
    runAt: round.runAt,
    scannedCount: round.scannedCount,
    scannedTickers: round.scannedTickers,
    actionableSignalsCount: round.actionableSignals.length,
    actionableBuySignals,
    actionableSellSignals,
    executedTradesCount: round.executedTrades.length,
    buyTrades,
    sellTrades,
    summary,
  };
}

function mapRow(row: ScheduledRunRow): ScheduledSimulatorRunRecord {
  return {
    id: row.id,
    userId: row.userId,
    status: row.status,
    durationDays: row.durationDays === 1 || row.durationDays === 3 || row.durationDays === 7 ? row.durationDays : 1,
    riskProfileId: row.riskProfileId,
    universeSize: row.universeSize,
    minConfidence: row.minConfidence,
    maxTradesPerRound: row.maxTradesPerRound,
    positionSizePercent: row.positionSizePercent,
    portfolio: safeParseJson<ScheduledSimulatorPortfolio>(row.portfolioJson, {
      id: 1,
      name: "Scheduled simulator",
      initialCapital: 10000,
      currentValue: 10000,
      cash: 10000,
      totalReturn: 0,
      totalReturnPercent: 0,
      positions: [],
      trades: [],
    }),
    selectedUniverse: safeParseJson<string[]>(row.selectedUniverseJson, []),
    lastRound: safeParseJson<AutoTradingRoundResponse | null>(row.lastRoundJson, null),
    roundHistory: safeParseJson<ScheduledSimulatorRoundLogEntry[]>(row.roundHistoryJson, []),
    lastSummary: row.lastSummary,
    startedAt: asIsoString(row.startedAt),
    endsAt: asIsoString(row.endsAt),
    nextRunAt: asIsoString(row.nextRunAt),
    lastRunAt: asIsoString(row.lastRunAt),
    totalRoundsCompleted: row.totalRoundsCompleted,
    totalTradesExecuted: row.totalTradesExecuted,
  };
}

export async function ensureScheduledSimulatorRunsTable() {
  await withConnection(async (connection) => {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS scheduled_simulator_runs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL UNIQUE,
        status ENUM('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
        durationDays INT NOT NULL,
        riskProfileId VARCHAR(32) NOT NULL,
        universeSize INT NOT NULL,
        minConfidence INT NOT NULL,
        maxTradesPerRound INT NOT NULL,
        positionSizePercent INT NOT NULL,
        portfolioJson LONGTEXT NOT NULL,
        selectedUniverseJson LONGTEXT NULL,
        lastRoundJson LONGTEXT NULL,
        roundHistoryJson LONGTEXT NULL,
        lastSummary TEXT NULL,
        startedAt TIMESTAMP NULL,
        endsAt TIMESTAMP NULL,
        nextRunAt TIMESTAMP NULL,
        lastRunAt TIMESTAMP NULL,
        totalRoundsCompleted INT NOT NULL DEFAULT 0,
        totalTradesExecuted INT NOT NULL DEFAULT 0,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX scheduled_simulator_runs_status_nextRunAt_idx (status, nextRunAt)
      )
    `);

    await connection.execute(`
      ALTER TABLE scheduled_simulator_runs
      ADD COLUMN IF NOT EXISTS roundHistoryJson LONGTEXT NULL AFTER lastRoundJson
    `);
  });
}

export async function getScheduledSimulatorRun(userId: number) {
  await ensureScheduledSimulatorRunsTable();

  return withConnection(async (connection) => {
    const [rows] = await connection.query<(ScheduledRunRow & mysql.RowDataPacket)[]>(
      `SELECT * FROM scheduled_simulator_runs WHERE userId = ? LIMIT 1`,
      [userId],
    );

    return rows[0] ? mapRow(rows[0]) : null;
  });
}

export async function cancelScheduledSimulatorRun(userId: number) {
  await ensureScheduledSimulatorRunsTable();

  await withConnection(async (connection) => {
    await connection.execute(
      `UPDATE scheduled_simulator_runs SET status = 'cancelled', nextRunAt = NULL WHERE userId = ?`,
      [userId],
    );
  });
}

export async function startScheduledSimulatorRun(input: {
  userId: number;
  portfolio: ScheduledSimulatorPortfolio;
  settings: ScheduledRunSettings;
}) {
  await ensureScheduledSimulatorRunsTable();
  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + input.settings.durationDays * 24 * 60 * 60 * 1000);

  await withConnection(async (connection) => {
    await connection.execute(
      `
        INSERT INTO scheduled_simulator_runs (
          userId,
          status,
          durationDays,
          riskProfileId,
          universeSize,
          minConfidence,
          maxTradesPerRound,
          positionSizePercent,
          portfolioJson,
          selectedUniverseJson,
          lastRoundJson,
          roundHistoryJson,
          lastSummary,
          startedAt,
          endsAt,
          nextRunAt,
          lastRunAt,
          totalRoundsCompleted,
          totalTradesExecuted
        ) VALUES (?, 'active', ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, ?, ?, ?, NULL, 0, 0)
        ON DUPLICATE KEY UPDATE
          status = VALUES(status),
          durationDays = VALUES(durationDays),
          riskProfileId = VALUES(riskProfileId),
          universeSize = VALUES(universeSize),
          minConfidence = VALUES(minConfidence),
          maxTradesPerRound = VALUES(maxTradesPerRound),
          positionSizePercent = VALUES(positionSizePercent),
          portfolioJson = VALUES(portfolioJson),
          selectedUniverseJson = VALUES(selectedUniverseJson),
          lastRoundJson = NULL,
          roundHistoryJson = NULL,
          lastSummary = NULL,
          startedAt = VALUES(startedAt),
          endsAt = VALUES(endsAt),
          nextRunAt = VALUES(nextRunAt),
          lastRunAt = NULL,
          totalRoundsCompleted = 0,
          totalTradesExecuted = 0
      `,
      [
        input.userId,
        input.settings.durationDays,
        input.settings.riskProfileId,
        input.settings.universeSize,
        input.settings.minConfidence,
        input.settings.maxTradesPerRound,
        input.settings.positionSizePercent,
        JSON.stringify(input.portfolio),
        JSON.stringify([]),
        startedAt,
        endsAt,
        startedAt,
      ],
    );
  });

  const [processed] = await processScheduledSimulatorRuns({ userId: input.userId, limit: 1 });
  return processed ?? getScheduledSimulatorRun(input.userId);
}

export async function processScheduledSimulatorRuns(options?: { userId?: number; limit?: number }) {
  await ensureScheduledSimulatorRunsTable();
  const now = new Date();

  return withConnection(async (connection) => {
    const params: Array<number | string | Date> = [now];
    const whereParts = [`status = 'active'`, `nextRunAt IS NOT NULL`, `nextRunAt <= ?`];

    if (typeof options?.userId === 'number') {
      whereParts.push(`userId = ?`);
      params.push(options.userId);
    }

    const limitSql = typeof options?.limit === 'number' ? ` LIMIT ${Math.max(1, options.limit)}` : '';
    const [rows] = await connection.query<(ScheduledRunRow & mysql.RowDataPacket)[]>(
      `SELECT * FROM scheduled_simulator_runs WHERE ${whereParts.join(' AND ')} ORDER BY nextRunAt ASC${limitSql}`,
      params,
    );

    const results: ScheduledSimulatorRunRecord[] = [];

    for (const row of rows) {
      const record = mapRow(row);
      const scheduledScanBatchSize = Math.max(1, record.selectedUniverse.length || record.universeSize);
      const round = await executeAutoTradingRound({
        positions: record.portfolio.positions.map((position) => ({
          ticker: position.ticker,
          quantity: position.quantity,
          averagePrice: position.entryPrice,
        })),
        cashBalance: record.portfolio.cash,
        desiredUniverseSize: record.universeSize,
        universeTickers: record.selectedUniverse,
        minConfidence: record.minConfidence,
        maxTradesPerRound: record.maxTradesPerRound,
        positionSizePercent: record.positionSizePercent,
        maxOpenPositions: 8,
        scanBatchSize: scheduledScanBatchSize,
        scanOffset: record.lastRound?.nextScanOffset ?? 0,
      });

      const updatedPortfolio = applyExecutedTradesToPortfolio(record.portfolio, round.executedTrades, record.riskProfileId);
      const summary = summarizeRound(round);
      const roundHistoryEntry = createRoundHistoryEntry(round, summary);
      const updatedRoundHistory = [roundHistoryEntry, ...record.roundHistory].slice(0, 14);
      const nextRunAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const completed = record.endsAt ? nextRunAt.getTime() >= new Date(record.endsAt).getTime() : false;

      await connection.execute(
        `
          UPDATE scheduled_simulator_runs
          SET portfolioJson = ?,
              selectedUniverseJson = ?,
              lastRoundJson = ?,
              roundHistoryJson = ?,
              lastSummary = ?,
              lastRunAt = ?,
              nextRunAt = ?,
              status = ?,
              totalRoundsCompleted = totalRoundsCompleted + 1,
              totalTradesExecuted = totalTradesExecuted + ?
          WHERE id = ?
        `,
        [
          JSON.stringify(updatedPortfolio),
          JSON.stringify(round.selectedUniverse.map((stock) => stock.ticker)),
          JSON.stringify(round),
          JSON.stringify(updatedRoundHistory),
          summary,
          now,
          completed ? null : nextRunAt,
          completed ? 'completed' : 'active',
          round.executedTrades.length,
          record.id,
        ],
      );

      results.push({
        ...record,
        status: completed ? 'completed' : 'active',
        portfolio: updatedPortfolio,
        selectedUniverse: round.selectedUniverse.map((stock) => stock.ticker),
        lastRound: round,
        roundHistory: updatedRoundHistory,
        lastSummary: summary,
        lastRunAt: now.toISOString(),
        nextRunAt: completed ? null : nextRunAt.toISOString(),
        totalRoundsCompleted: record.totalRoundsCompleted + 1,
        totalTradesExecuted: record.totalTradesExecuted + round.executedTrades.length,
      });
    }

    return results;
  });
}
