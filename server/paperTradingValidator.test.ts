import { describe, it, expect, beforeEach } from "vitest";
import {
  initializePaperTradingSession,
  recordTrade,
  calculateDailyPerformance,
  generateValidationReport,
  DEFAULT_VALIDATION_CONFIG,
  PaperTradingSession,
  TradeRecord,
} from "./paperTradingValidator";

describe("Paper Trading Validator", () => {
  let session: PaperTradingSession;

  beforeEach(() => {
    session = initializePaperTradingSession();
  });

  it("should initialize session with correct defaults", () => {
    expect(session.startingCapital).toBe(100);
    expect(session.currentCapital).toBe(100);
    expect(session.status).toBe("ACTIVE");
    expect(session.allTrades).toHaveLength(0);
  });

  it("should accept custom config", () => {
    const customConfig = { ...DEFAULT_VALIDATION_CONFIG, startingCapital: 500 };
    const customSession = initializePaperTradingSession(customConfig);
    expect(customSession.startingCapital).toBe(500);
  });

  it("should record trades successfully", () => {
    const trade: TradeRecord = {
      tradeId: "1",
      date: "2026-04-11",
      time: "10:00:00",
      ticker: "AAPL",
      type: "BUY",
      quantity: 1,
      entryPrice: 10,
      executionPrice: 10.05,
      commission: 0.1,
      totalCost: 10.15,
      pnl: 1,
      pnlPercent: 0.01,
      signal: { confidence: 85, type: "BUY", reason: "Test" },
    };

    const result = recordTrade(session, trade, 10);
    expect(result.success).toBe(true);
    expect(session.allTrades).toHaveLength(1);
  });

  it("should calculate daily performance", () => {
    const trade: TradeRecord = {
      tradeId: "1",
      date: "2026-04-11",
      time: "10:00:00",
      ticker: "AAPL",
      type: "BUY",
      quantity: 1,
      entryPrice: 10,
      executionPrice: 10.05,
      commission: 0.1,
      totalCost: 10.15,
      pnl: 1,
      pnlPercent: 0.01,
      signal: { confidence: 85, type: "BUY", reason: "Test" },
    };

    session.allTrades.push(trade);
    const daily = calculateDailyPerformance(session, "2026-04-11");

    expect(daily.date).toBe("2026-04-11");
    expect(daily.trades).toBe(1);
    expect(daily.winRate).toBe(1.0);
    expect(daily.dailyPnL).toBe(1);
  });

  it("should generate validation report", () => {
    const trade: TradeRecord = {
      tradeId: "1",
      date: "2026-04-11",
      time: "10:00:00",
      ticker: "AAPL",
      type: "BUY",
      quantity: 1,
      entryPrice: 10,
      executionPrice: 10.05,
      commission: 0.1,
      totalCost: 10.15,
      pnl: 15,
      pnlPercent: 0.15,
      signal: { confidence: 85, type: "BUY", reason: "Test" },
    };

    session.allTrades.push(trade);
    session.currentCapital = session.startingCapital + 15;
    const report = generateValidationReport(session);

    expect(report.initialCapital).toBe(100);
    expect(report.totalReturn).toBe(15);
    expect(report.overallMetrics.totalTrades).toBe(1);
    expect(report.overallMetrics.winRate).toBe(1.0);
  });

  it("should detect when risk limit is hit", () => {
    const trade: TradeRecord = {
      tradeId: "1",
      date: "2026-04-11",
      time: "10:00:00",
      ticker: "AAPL",
      type: "BUY",
      quantity: 1,
      entryPrice: 10,
      executionPrice: 10.05,
      commission: 0.1,
      totalCost: 10.15,
      pnl: -2.5,
      pnlPercent: -0.025,
      signal: { confidence: 50, type: "BUY", reason: "Test" },
    };

    session.allTrades.push(trade);
    const daily = calculateDailyPerformance(session, "2026-04-11");

    expect(daily.riskLimitHit).toBe(true);
  });

  it("should calculate profit factor", () => {
    const trades: TradeRecord[] = [
      {
        tradeId: "1",
        date: "2026-04-11",
        time: "10:00:00",
        ticker: "AAPL",
        type: "BUY",
        quantity: 1,
        entryPrice: 10,
        executionPrice: 10.05,
        commission: 0.1,
        totalCost: 10.15,
        pnl: 2,
        pnlPercent: 0.02,
        signal: { confidence: 85, type: "BUY", reason: "Test" },
      },
      {
        tradeId: "2",
        date: "2026-04-11",
        time: "11:00:00",
        ticker: "MSFT",
        type: "BUY",
        quantity: 1,
        entryPrice: 20,
        executionPrice: 20.1,
        commission: 0.1,
        totalCost: 20.2,
        pnl: 1,
        pnlPercent: 0.005,
        signal: { confidence: 80, type: "BUY", reason: "Test" },
      },
      {
        tradeId: "3",
        date: "2026-04-11",
        time: "12:00:00",
        ticker: "GOOGL",
        type: "SELL",
        quantity: 1,
        entryPrice: 30,
        executionPrice: 29.9,
        commission: 0.1,
        totalCost: 30,
        pnl: -0.5,
        pnlPercent: -0.005,
        signal: { confidence: 50, type: "SELL", reason: "Test" },
      },
    ];

    session.allTrades.push(...trades);
    session.currentCapital = session.startingCapital + trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const report = generateValidationReport(session);

    expect(report.overallMetrics.profitFactor).toBeGreaterThan(1);
    expect(report.overallMetrics.totalTrades).toBe(3);
  });
});
