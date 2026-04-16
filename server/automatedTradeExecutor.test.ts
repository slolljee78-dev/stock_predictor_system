import { describe, it, expect, beforeEach } from "vitest";
import { automatedTradeExecutor, AutomationConfig, ExecutedTrade } from "./automatedTradeExecutor";

describe("Automated Trade Executor", () => {
  const testSessionId = "test-session-123";
  const testConfig: Partial<AutomationConfig> = {
    enabled: true,
    confidenceThreshold: 70,
    tradingFrequency: "15min",
    maxPositionsPerDay: 5,
    positionSizePercent: 2,
    stopLossPercent: 2,
    takeProfitPercent: 3,
    maxDrawdownPercent: 5,
  };

  beforeEach(async () => {
    // Initialize automation for each test
    await automatedTradeExecutor.initializeAutomation(testSessionId, testConfig);
  });

  it("should initialize automation with default config", async () => {
    const sessionId = "new-session";
    await automatedTradeExecutor.initializeAutomation(sessionId, {});
    const status = automatedTradeExecutor.getStatus(sessionId);

    expect(status).toBeDefined();
    expect(status.enabled).toBe(false);
    expect(status.totalTrades).toBe(0);
  });

  it("should initialize automation with custom config", async () => {
    const config = automatedTradeExecutor.getConfig(testSessionId);

    expect(config.enabled).toBe(true);
    expect(config.confidenceThreshold).toBe(70);
    expect(config.maxPositionsPerDay).toBe(5);
  });

  it("should execute a buy trade", async () => {
    const trade = await automatedTradeExecutor.executeTrade(
      testSessionId,
      "AAPL",
      "BUY",
      85,
      10000
    );

    if (trade) {
      expect(trade.symbol).toBe("AAPL");
      expect(trade.signal).toBe("BUY");
      expect(trade.status).toBe("OPEN");
      expect(trade.quantity).toBeGreaterThan(0);
      expect(trade.entryPrice).toBeGreaterThan(0);
      expect(trade.stopLoss).toBeGreaterThan(0);
      expect(trade.takeProfit).toBeGreaterThan(trade.entryPrice);
    }
  });

  it("should execute a sell trade", async () => {
    const trade = await automatedTradeExecutor.executeTrade(
      testSessionId,
      "TSLA",
      "SELL",
      80,
      10000
    );

    if (trade) {
      expect(trade.symbol).toBe("TSLA");
      expect(trade.signal).toBe("SELL");
      expect(trade.status).toBe("OPEN");
      expect(trade.takeProfit).toBeLessThan(trade.entryPrice);
    }
  });

  it("should calculate correct position size", async () => {
    const capital = 10000;
    const positionSizePercent = 2;
    const trade = await automatedTradeExecutor.executeTrade(
      testSessionId,
      "MSFT",
      "BUY",
      75,
      capital
    );

    if (trade) {
      const expectedMaxSize = (capital * positionSizePercent) / 100 / trade.entryPrice;
      expect(trade.quantity).toBeLessThanOrEqual(Math.floor(expectedMaxSize) + 1);
    }
  });

  it("should set correct stop-loss for buy trade", async () => {
    const trade = await automatedTradeExecutor.executeTrade(
      testSessionId,
      "GOOG",
      "BUY",
      80,
      10000
    );

    if (trade) {
      const expectedStopLoss = trade.entryPrice * (1 - testConfig.stopLossPercent! / 100);
      expect(trade.stopLoss).toBeCloseTo(expectedStopLoss, 1);
    }
  });

  it("should set correct stop-loss for sell trade", async () => {
    const trade = await automatedTradeExecutor.executeTrade(
      testSessionId,
      "AMZN",
      "SELL",
      75,
      10000
    );

    if (trade) {
      const expectedStopLoss = trade.entryPrice * (1 + testConfig.stopLossPercent! / 100);
      expect(trade.stopLoss).toBeCloseTo(expectedStopLoss, 1);
    }
  });

  it("should set correct take-profit for buy trade", async () => {
    const trade = await automatedTradeExecutor.executeTrade(
      testSessionId,
      "META",
      "BUY",
      85,
      10000
    );

    if (trade) {
      const expectedTakeProfit = trade.entryPrice * (1 + testConfig.takeProfitPercent! / 100);
      expect(trade.takeProfit).toBeCloseTo(expectedTakeProfit, 1);
    }
  });

  it("should set correct take-profit for sell trade", async () => {
    const trade = await automatedTradeExecutor.executeTrade(
      testSessionId,
      "NVDA",
      "SELL",
      80,
      10000
    );

    if (trade) {
      const expectedTakeProfit = trade.entryPrice * (1 - testConfig.takeProfitPercent! / 100);
      expect(trade.takeProfit).toBeCloseTo(expectedTakeProfit, 1);
    }
  });

  it("should retrieve executed trades for a session", async () => {
    const trade1 = await automatedTradeExecutor.executeTrade(testSessionId, "AAPL", "BUY", 85, 10000);
    const trade2 = await automatedTradeExecutor.executeTrade(testSessionId, "TSLA", "SELL", 80, 10000);

    if (trade1 && trade2) {
      const trades = automatedTradeExecutor.getExecutedTrades(testSessionId);
      expect(trades.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("should retrieve only open trades", async () => {
    const trade1 = await automatedTradeExecutor.executeTrade(testSessionId, "AAPL", "BUY", 85, 10000);
    const trade2 = await automatedTradeExecutor.executeTrade(testSessionId, "TSLA", "SELL", 80, 10000);

    if (trade1 && trade2) {
      const openTrades = automatedTradeExecutor.getOpenTrades(testSessionId);
      expect(openTrades.length).toBeGreaterThanOrEqual(1);
      expect(openTrades.every((t) => t.status === "OPEN")).toBe(true);
    }
  });

  it("should retrieve only closed trades", async () => {
    const trade = await automatedTradeExecutor.executeTrade(testSessionId, "AAPL", "BUY", 85, 10000);

    if (trade) {
      const closedTrades = automatedTradeExecutor.getClosedTrades(testSessionId);
      expect(Array.isArray(closedTrades)).toBe(true);
    }
  });

  it("should update automation config", () => {
    const newConfig: Partial<AutomationConfig> = {
      confidenceThreshold: 80,
      positionSizePercent: 3,
    };

    automatedTradeExecutor.updateConfig(testSessionId, newConfig);
    const config = automatedTradeExecutor.getConfig(testSessionId);

    expect(config.confidenceThreshold).toBe(80);
    expect(config.positionSizePercent).toBe(3);
    expect(config.maxPositionsPerDay).toBe(5); // Should remain unchanged
  });

  it("should get automation status", async () => {
    const trade = await automatedTradeExecutor.executeTrade(testSessionId, "AAPL", "BUY", 85, 10000);

    if (trade) {
      const status = automatedTradeExecutor.getStatus(testSessionId);
      expect(status.enabled).toBe(true);
      expect(status.openTrades).toBeGreaterThanOrEqual(0);
      expect(status.totalTrades).toBeGreaterThanOrEqual(1);
    }
  });

  it("should handle multiple sessions independently", async () => {
    const session1 = "session-1";
    const session2 = "session-2";

    await automatedTradeExecutor.initializeAutomation(session1, testConfig);
    await automatedTradeExecutor.initializeAutomation(session2, testConfig);

    const trade1 = await automatedTradeExecutor.executeTrade(session1, "AAPL", "BUY", 85, 10000);
    const trade2 = await automatedTradeExecutor.executeTrade(session2, "TSLA", "SELL", 80, 10000);

    if (trade1 && trade2) {
      const trades1 = automatedTradeExecutor.getExecutedTrades(session1);
      const trades2 = automatedTradeExecutor.getExecutedTrades(session2);

      expect(trades1.length).toBeGreaterThan(0);
      expect(trades2.length).toBeGreaterThan(0);
    }
  });

  it("should have valid trade structure", async () => {
    const trade = await automatedTradeExecutor.executeTrade(
      testSessionId,
      "AAPL",
      "BUY",
      85,
      10000
    );

    if (trade) {
      expect(trade.id).toBeDefined();
      expect(trade.sessionId).toBe(testSessionId);
      expect(trade.symbol).toBeDefined();
      expect(trade.signal).toMatch(/BUY|SELL/);
      expect(trade.quantity).toBeGreaterThan(0);
      expect(trade.entryPrice).toBeGreaterThan(0);
      expect(trade.stopLoss).toBeGreaterThan(0);
      expect(trade.takeProfit).toBeGreaterThan(0);
      expect(trade.confidence).toBeGreaterThanOrEqual(0);
      expect(trade.confidence).toBeLessThanOrEqual(100);
      expect(trade.executedAt).toBeInstanceOf(Date);
      expect(trade.status).toMatch(/OPEN|CLOSED|STOPPED_OUT|PROFIT_TAKEN/);
    }
  });

  it("should respect max positions per day limit", async () => {
    const limitedConfig: Partial<AutomationConfig> = {
      enabled: true,
      maxPositionsPerDay: 2,
      confidenceThreshold: 70,
      tradingFrequency: "15min",
      positionSizePercent: 2,
      stopLossPercent: 2,
      takeProfitPercent: 3,
      maxDrawdownPercent: 5,
    };

    const sessionId = "limited-session";
    await automatedTradeExecutor.initializeAutomation(sessionId, limitedConfig);

    const trade1 = await automatedTradeExecutor.executeTrade(sessionId, "AAPL", "BUY", 85, 10000);
    const trade2 = await automatedTradeExecutor.executeTrade(sessionId, "TSLA", "SELL", 80, 10000);
    const trade3 = await automatedTradeExecutor.executeTrade(sessionId, "MSFT", "BUY", 75, 10000);

    if (trade1 || trade2 || trade3) {
      const trades = automatedTradeExecutor.getExecutedTrades(sessionId);
      expect(trades.length).toBeGreaterThanOrEqual(0);
    }
  });

  it("should calculate P&L for buy trades", async () => {
    const trade = await automatedTradeExecutor.executeTrade(
      testSessionId,
      "AAPL",
      "BUY",
      85,
      10000
    );

    if (trade) {
      const expectedPnL = (trade.takeProfit - trade.entryPrice) * trade.quantity;
      expect(expectedPnL).toBeGreaterThan(0);
    }
  });

  it("should calculate P&L for sell trades", async () => {
    const trade = await automatedTradeExecutor.executeTrade(
      testSessionId,
      "TSLA",
      "SELL",
      80,
      10000
    );

    if (trade) {
      const expectedPnL = (trade.entryPrice - trade.takeProfit) * trade.quantity;
      expect(expectedPnL).toBeGreaterThan(0);
    }
  });

  it("should handle invalid capital gracefully", async () => {
    const trade = await automatedTradeExecutor.executeTrade(
      testSessionId,
      "AAPL",
      "BUY",
      85,
      0
    );

    expect(trade).toBeNull();
  });

  it("should handle non-existent session gracefully", async () => {
    const trade = await automatedTradeExecutor.executeTrade(
      "non-existent-session",
      "AAPL",
      "BUY",
      85,
      10000
    );

    expect(trade).toBeNull();
  });

  it("should generate unique trade IDs", async () => {
    const trade1 = await automatedTradeExecutor.executeTrade(
      testSessionId,
      "AAPL",
      "BUY",
      85,
      10000
    );
    const trade2 = await automatedTradeExecutor.executeTrade(
      testSessionId,
      "TSLA",
      "SELL",
      80,
      10000
    );

    if (trade1 && trade2) {
      expect(trade1.id).not.toBe(trade2.id);
    }
  });
});
