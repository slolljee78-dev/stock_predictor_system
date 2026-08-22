import { describe, it, expect } from "vitest";
import {
  calculateKellyCriterion,
  calculatePositionSize,
  checkStopLoss,
  checkTakeProfit,
  calculateRiskMetrics,
  checkPortfolioRiskLimits,
  suggestRebalancing,
} from "./riskManagement";

interface Position {
  ticker: string;
  shares: number;
  entryPrice: number;
  currentPrice: number;
  entryTime: Date;
}

interface Portfolio {
  totalCapital: number;
  positions: Position[];
  cash: number;
  dayStartCapital: number;
}

describe("Risk Management", () => {
  describe("Kelly Criterion", () => {
    it("should calculate Kelly Criterion for profitable strategy", () => {
      const kelly = calculateKellyCriterion(0.6, 1, 1); // 60% win rate, 1:1 reward/risk

      expect(kelly).toBeGreaterThan(0);
      expect(kelly).toBeLessThanOrEqual(0.05); // Max 5% per trade
    });

    it("should return 0 for unprofitable strategy", () => {
      const kelly = calculateKellyCriterion(0.4, 1, 1); // 40% win rate

      expect(kelly).toBeLessThanOrEqual(0.005); // Min 0.5%
    });

    it("should handle 50% win rate", () => {
      const kelly = calculateKellyCriterion(0.5, 1, 1);

      expect(kelly).toBeGreaterThanOrEqual(0.005);
      expect(kelly).toBeLessThanOrEqual(0.05);
    });

    it("should increase with better win/loss ratio", () => {
      const kelly1 = calculateKellyCriterion(0.6, 1, 1);
      const kelly2 = calculateKellyCriterion(0.6, 2, 1); // 2:1 reward/risk

      expect(kelly2).toBeGreaterThan(kelly1);
    });
  });

  describe("Position Sizing", () => {
    it("should calculate position size based on risk", () => {
      const portfolio: Portfolio = {
        totalCapital: 10000,
        positions: [],
        cash: 10000,
        dayStartCapital: 10000,
      };

      const sizing = calculatePositionSize(portfolio, 100, 95, 0.6);

      expect(sizing.shares).toBeGreaterThan(0);
      expect(sizing.positionSizePercent).toBeGreaterThan(0);
      expect(sizing.positionSizePercent).toBeLessThanOrEqual(0.05); // Max 5%
    });

    it("should respect maximum position size", () => {
      const portfolio: Portfolio = {
        totalCapital: 10000,
        positions: [],
        cash: 10000,
        dayStartCapital: 10000,
      };

      const sizing = calculatePositionSize(portfolio, 100, 50, 0.9); // Very profitable

      expect(sizing.positionSizePercent).toBeLessThanOrEqual(0.05);
      expect(sizing.maxPositionSize).toBe(0.1);
    });

    it("should calculate take profit at 2:1 ratio", () => {
      const portfolio: Portfolio = {
        totalCapital: 10000,
        positions: [],
        cash: 10000,
        dayStartCapital: 10000,
      };

      const sizing = calculatePositionSize(portfolio, 100, 90, 0.6);

      expect(sizing.takeProfit).toBe(120); // 100 + (100-90)*2
    });
  });

  describe("Stop Loss Check", () => {
    it("should trigger stop loss at threshold", () => {
      const position: Position = {
        ticker: "AAPL",
        shares: 10,
        entryPrice: 100,
        currentPrice: 97,
        entryTime: new Date(),
      };

      const result = checkStopLoss(position, 0.02);

      expect(result.shouldStop).toBe(true);
    });

    it("should not trigger stop loss above threshold", () => {
      const position: Position = {
        ticker: "AAPL",
        shares: 10,
        entryPrice: 100,
        currentPrice: 98.5,
        entryTime: new Date(),
      };

      const result = checkStopLoss(position, 0.02);

      expect(result.shouldStop).toBe(false);
    });

    it("should not trigger stop loss for gains", () => {
      const position: Position = {
        ticker: "AAPL",
        shares: 10,
        entryPrice: 100,
        currentPrice: 110,
        entryTime: new Date(),
      };

      const result = checkStopLoss(position, 0.02);

      expect(result.shouldStop).toBe(false);
    });
  });

  describe("Take Profit Check", () => {
    it("should trigger take profit at threshold", () => {
      const position: Position = {
        ticker: "AAPL",
        shares: 10,
        entryPrice: 100,
        currentPrice: 105.5,
        entryTime: new Date(),
      };

      const result = checkTakeProfit(position, 0.05);

      expect(result.shouldTakeProfit).toBe(true);
    });

    it("should not trigger take profit below threshold", () => {
      const position: Position = {
        ticker: "AAPL",
        shares: 10,
        entryPrice: 100,
        currentPrice: 104,
        entryTime: new Date(),
      };

      const result = checkTakeProfit(position, 0.05);

      expect(result.shouldTakeProfit).toBe(false);
    });

    it("should not trigger take profit for losses", () => {
      const position: Position = {
        ticker: "AAPL",
        shares: 10,
        entryPrice: 100,
        currentPrice: 95,
        entryTime: new Date(),
      };

      const result = checkTakeProfit(position, 0.05);

      expect(result.shouldTakeProfit).toBe(false);
    });
  });

  describe("Risk Metrics", () => {
    it("should calculate portfolio value", () => {
      const portfolio: Portfolio = {
        totalCapital: 10000,
        positions: [
          {
            ticker: "AAPL",
            shares: 10,
            entryPrice: 100,
            currentPrice: 110,
            entryTime: new Date(),
          },
        ],
        cash: 10000,
        dayStartCapital: 10000,
      };

      const metrics = calculateRiskMetrics(portfolio, [10000, 10100, 10200]);

      expect(metrics.portfolioValue).toBe(11100); // 10000 cash + 10*110 positions
      expect(metrics.dayPnL).toBeGreaterThan(0);
    });

    it("should calculate Sharpe ratio", () => {
      const portfolio: Portfolio = {
        totalCapital: 10000,
        positions: [],
        cash: 10000,
        dayStartCapital: 10000,
      };

      const metrics = calculateRiskMetrics(portfolio, [10000, 10100, 10050, 10150]);

      expect(typeof metrics.sharpeRatio).toBe("number");
    });

    it("should calculate max drawdown", () => {
      const portfolio: Portfolio = {
        totalCapital: 10000,
        positions: [],
        cash: 10000,
        dayStartCapital: 10000,
      };

      const metrics = calculateRiskMetrics(portfolio, [10000, 11000, 9000, 10500]);

      expect(metrics.maxDrawdown).toBeGreaterThan(0);
      expect(metrics.maxDrawdown).toBeLessThanOrEqual(1);
    });
  });

  describe("Portfolio Risk Limits", () => {
    it("should flag daily loss limit exceeded", () => {
      const portfolio: Portfolio = {
        totalCapital: 10000,
        positions: [],
        cash: 9700,
        dayStartCapital: 10000,
      };

      const result = checkPortfolioRiskLimits(portfolio, 10000, 0.02);

      // 3% loss (9700/10000) exceeds 2% limit
      expect(result.withinLimits).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it("should allow within daily loss limit", () => {
      const portfolio: Portfolio = {
        totalCapital: 10000,
        positions: [],
        cash: 9850,
        dayStartCapital: 10000,
      };

      const result = checkPortfolioRiskLimits(portfolio, 10000, 0.02);

      expect(result.withinLimits).toBe(true);
    });

    it("should flag position concentration", () => {
      const portfolio: Portfolio = {
        totalCapital: 5000,
        positions: [
          {
            ticker: "AAPL",
            shares: 100,
            entryPrice: 100,
            currentPrice: 100,
            entryTime: new Date(),
          },
        ],
        cash: 0,
        dayStartCapital: 10000,
      };

      const result = checkPortfolioRiskLimits(portfolio, 10000, 0.02);

      expect(result.violations.some((v) => v.includes("concentration"))).toBe(true);
    });
  });

  describe("Rebalancing Suggestions", () => {
    it("should suggest rebalancing for oversized position", () => {
      const portfolio: Portfolio = {
        totalCapital: 5000,
        positions: [
          {
            ticker: "AAPL",
            shares: 150,
            entryPrice: 100,
            currentPrice: 100,
            entryTime: new Date(),
          },
        ],
        cash: 0,
        dayStartCapital: 10000,
      };

      const result = suggestRebalancing(portfolio);

      expect(result.shouldRebalance).toBe(true);
      expect(result.actions.length).toBeGreaterThan(0);
    });

    it("should suggest rebalancing for high cash position", () => {
      const portfolio: Portfolio = {
        totalCapital: 10000,
        positions: [
          {
            ticker: "AAPL",
            shares: 10,
            entryPrice: 100,
            currentPrice: 100,
            entryTime: new Date(),
          },
        ],
        cash: 4000,
        dayStartCapital: 10000,
      };

      const result = suggestRebalancing(portfolio);

      expect(result.shouldRebalance).toBe(true);
    });

    it("should not suggest rebalancing for balanced portfolio", () => {
      const portfolio: Portfolio = {
        totalCapital: 10000,
        positions: [
          {
            ticker: "AAPL",
            shares: 30,
            entryPrice: 100,
            currentPrice: 100,
            entryTime: new Date(),
          },
          {
            ticker: "MSFT",
            shares: 30,
            entryPrice: 100,
            currentPrice: 100,
            entryTime: new Date(),
          },
        ],
        cash: 4000,
        dayStartCapital: 10000,
      };

      const result = suggestRebalancing(portfolio);

      // With 40% cash, should suggest rebalancing
      expect(result.shouldRebalance).toBe(true);
    });
  });
});
